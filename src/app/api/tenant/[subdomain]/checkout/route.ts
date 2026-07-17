import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import midtransClient from "midtrans-client";
import { sendInvoiceEmail } from "@/lib/notifications";
import { appendLedger } from "@/lib/stock";
import { getTenantAccessState } from "@/lib/subscription";
import { recordAudit } from "@/lib/audit";
import crypto from "crypto";
import { decryptCredential } from "@/lib/credentials";
import {
  enforceRateLimit,
  RateLimitError,
  requestIdentifier,
} from "@/lib/rate-limit";
import { planHasFeature } from "@/lib/plans";
import {
  getRequestId,
  internalErrorResponse,
  logServerError,
} from "@/lib/api-observability";
import { z } from "zod";

type CheckoutItemInput = {
  id?: string;
  productId?: string;
  quantity?: number;
};

type InvoiceItemCreateData = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  hpp: number;
};

type MidtransItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

const CheckoutSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerPhone: z.string().trim().min(6).max(24),
  customerEmail: z.union([z.email(), z.literal("")]).optional(),
  customerAddress: z.string().trim().min(1).max(500),
  shippingMethod: z
    .enum(["PICKUP", "LOCAL_DELIVERY", "STORE_COURIER", "COURIER"])
    .default("PICKUP"),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().optional(),
        quantity: z.coerce.number().int().positive().max(10_000),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const requestId = getRequestId(req.headers);
  let tenantSubdomain = "unknown";
  try {
    const { subdomain } = await params;
    tenantSubdomain = subdomain;
    await enforceRateLimit({
      scope: `tenant-checkout:${subdomain}`,
      identifier: requestIdentifier(req.headers),
      limit: 30,
      windowSeconds: 10 * 60,
    });
    const parsedBody = CheckoutSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Data checkout tidak valid", details: parsedBody.error.flatten() },
        { status: 400 },
      );
    }
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      shippingMethod,
      items,
    } = parsedBody.data;

    // 1. Dapatkan tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } }
    });

    if (
      !tenant ||
      getTenantAccessState(tenant) !== "ACTIVE" ||
      !planHasFeature(tenant.subscriptionTier, "STOREFRONT")
    ) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const createdById = tenant.users[0]?.id;
    if (!createdById) {
      return NextResponse.json({ error: "Tenant belum memiliki user admin" }, { status: 400 });
    }

    const normalizedItems = (items as CheckoutItemInput[])
      .map((item) => ({
        productId: item.productId || item.id,
        quantity: Number(item.quantity || 0),
      }))
      .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);

    if (normalizedItems.length !== items.length) {
      return NextResponse.json({ error: "Item checkout tidak valid" }, { status: 400 });
    }

    const quantityByProduct = new Map<string, number>();
    for (const item of normalizedItems) {
      quantityByProduct.set(item.productId!, (quantityByProduct.get(item.productId!) || 0) + item.quantity);
    }

    const productIds = Array.from(quantityByProduct.keys());
    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        id: { in: productIds },
        type: "FINISHED_GOODS",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Ada produk yang tidak valid atau tidak aktif" }, { status: 400 });
    }

    const ledgerEntries = await prisma.inventoryLedger.findMany({
      where: {
        tenantId: tenant.id,
        productId: { in: productIds },
        quantityUnit: { not: null },
      },
      select: { productId: true, entryType: true, quantityUnit: true },
    });

    const stockByProduct = new Map<string, number>();
    for (const entry of ledgerEntries) {
      if (!entry.productId) continue;
      const current = stockByProduct.get(entry.productId) || 0;
      const qty = entry.quantityUnit || 0;
      stockByProduct.set(entry.productId, entry.entryType === "IN" ? current + qty : current - qty);
    }

    for (const product of products) {
      const requestedQty = quantityByProduct.get(product.id) || 0;
      const availableQty = stockByProduct.get(product.id) || 0;
      if (availableQty < requestedQty) {
        return NextResponse.json(
          { error: `Stok "${product.name}" tidak cukup. Tersedia: ${availableQty}, dibutuhkan: ${requestedQty}.` },
          { status: 400 }
        );
      }
    }

    const hppEntries = await Promise.all(
      products.map(async (product) => {
        const lastBatch = await prisma.productionBatch.findFirst({
          where: { tenantId: tenant.id, outputProductId: product.id, status: "COMPLETED" },
          orderBy: { producedAt: "desc" },
          select: { hppPerUnit: true },
        });
        return [product.id, Number(lastBatch?.hppPerUnit || 0)] as const;
      })
    );
    const hppByProduct = new Map(hppEntries);

    // 2. Kalkulasi Subtotal & Buat Items Array dari data server
    let subtotal = 0;
    const invoiceItemsData: InvoiceItemCreateData[] = [];
    const midtransItemDetails: MidtransItemDetail[] = [];
    
    for (const product of products) {
      const qty = quantityByProduct.get(product.id) || 0;
      const unitPrice = Number(product.price || 0);
      const itemSub = unitPrice * qty;
      subtotal += itemSub;
      
      invoiceItemsData.push({
        productId: product.id,
        quantity: qty,
        unitPrice: unitPrice,
        discount: 0,
        subtotal: itemSub,
        hpp: hppByProduct.get(product.id) || 0,
      });

      midtransItemDetails.push({
        id: product.id,
        price: Math.round(unitPrice),
        quantity: qty,
        name: product.name.substring(0, 50)
      });
    }

    const grandTotal = subtotal; // Assuming no tax or shipping for now
    if (grandTotal <= 0) {
      return NextResponse.json({ error: "Total checkout tidak valid" }, { status: 400 });
    }

    // 3. Midtrans Integration Check
    const hasMidtrans = tenant.midtransServerKey && tenant.midtransClientKey;
    let midtransOrderId = null;
    let paymentUrl = null;
    let snapToken = null;

    const invoiceCode = `INV-${tenant.code}-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    if (hasMidtrans) {
      const serverKey = decryptCredential(tenant.midtransServerKey);
      midtransOrderId = `${invoiceCode}-${Date.now().toString().slice(-6)}`;
      const snap = new midtransClient.Snap({
        isProduction: tenant.midtransIsProduction,
        serverKey,
        clientKey: tenant.midtransClientKey || "",
      });

      const parameter = {
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: Math.round(grandTotal),
        },
        customer_details: {
          first_name: customerName,
          phone: customerPhone,
          email: customerEmail || undefined,
        },
        item_details: midtransItemDetails
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        snapToken = transaction.token;
        paymentUrl = transaction.redirect_url;
      } catch (err: unknown) {
        logServerError("tenant.checkout.midtrans", err, {
          requestId,
          subdomain,
        });
        // Fallback to manual if Midtrans fails
        midtransOrderId = null;
        paymentUrl = null;
      }
    }

    // 4. Buat customer, invoice, line item, dan ledger stok dalam satu transaksi
    const invoice = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { tenantId: tenant.id, phone: customerPhone }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            code: `CST-${tenant.code}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
            address: customerAddress,
            tenantId: tenant.id,
          }
        });
      }

      const inv = await tx.invoice.create({
        data: {
          code: invoiceCode,
          customerId: customer.id,
          tenantId: tenant.id,
          createdById,
          status: "ISSUED",
          subtotal,
          discount: 0,
          tax: 0,
          shippingCost: 0,
          shippingMethod: shippingMethod || "PICKUP",
          shippingAddress: customerAddress || null,
          grandTotal,
          midtransOrderId,
          paymentUrl,
          items: {
            create: invoiceItemsData
          }
        }
      });

      for (const item of invoiceItemsData) {
        await appendLedger(tx, {
          data: {
            productId: item.productId,
            tenantId: tenant.id,
            entryType: "OUT",
            refType: "SALE_FG_OUT",
            refId: inv.id,
            quantityUnit: item.quantity,
            notes: `Checkout publik: ${invoiceCode}`,
            createdById,
          },
        });
      }

      await recordAudit(tx, {
        tenantId: tenant.id,
        userId: createdById,
        action: "CREATE_PUBLIC",
        entityType: "Invoice",
        entityId: inv.id,
        after: {
          code: inv.code,
          status: inv.status,
          grandTotal: Number(inv.grandTotal),
        },
        metadata: { itemCount: invoiceItemsData.length },
      });

      return inv;
    });

    revalidatePath("/penjualan");
    revalidatePath("/inventory");

    if (customerEmail) {
      await sendInvoiceEmail(customerEmail, invoiceCode, paymentUrl);
    }

    return NextResponse.json({ 
      success: true, 
      invoice,
      snapToken,
      paymentUrl
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      );
    }
    logServerError("tenant.checkout", error, {
      requestId,
      subdomain: tenantSubdomain,
    });
    return internalErrorResponse(requestId);
  }
}
