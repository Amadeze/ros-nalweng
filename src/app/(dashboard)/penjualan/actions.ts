"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeFGUnitStock } from "@/lib/stock";

// =============================================================================
// TYPES
// =============================================================================

export type CustomerOption = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  tier: "RETAIL" | "WHOLESALE_SILVER" | "WHOLESALE_GOLD";
};

export type FGStockOption = {
  id: string;
  code: string;
  name: string;
  price: number;
  priceSilver: number;
  priceGold: number;
  stockUnit: number;
  lastHppPerUnit: number | null;
};

export type InvoiceItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number; // per unit
};

export type CreateInvoiceInput = {
  customerId: string;
  items: InvoiceItemInput[];
  invoiceDiscount: number;
  tax: number;
  status: "PAID" | "ISSUED";
  paymentMethod?: "CASH" | "TRANSFER" | "QRIS" | "CREDIT";
  dueDate?: string; // YYYY-MM-DD
  notes?: string;
};

export type SalesActionResult =
  | { success: true; invoiceCode: string; invoiceId: string }
  | { success: false; error: string };

export type InvoiceRow = {
  id: string;
  code: string;
  customerName: string;
  itemCount: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: string;
  issuedAt: string;
  dueDate: string | null;
};

export type SalesPageData = {
  invoices: InvoiceRow[];
  customers: CustomerOption[];
  fgOptions: FGStockOption[];
};

// ── Print ──

export type InvoicePrintData = {
  code: string;
  issuedAt: string;
  dueDate: string | null;
  status: string;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    hpp: number;
    margin: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  payments: {
    code: string;
    amount: number;
    method: string;
    paidAt: string;
  }[];
  notes: string | null;
};

// =============================================================================
// PAGE DATA
// =============================================================================

export async function getSalesPageData(): Promise<SalesPageData> {
  const [invoicesRaw, customers, fgProducts] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        customer: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 200,
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, phone: true, tier: true },
    }),
    prisma.product.findMany({
      where: { type: "FINISHED_GOODS", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, price: true, priceSilver: true, priceGold: true },
    }),
  ]);

  // FG stock + HPP snapshot (Optimized O(1) queries instead of N+1)
  const fgProductIds = fgProducts.map(p => p.id);

  const [allLedgers, latestBatches] = await Promise.all([
    prisma.inventoryLedger.findMany({
      where: { productId: { in: fgProductIds }, quantityUnit: { not: null } },
      select: { productId: true, entryType: true, quantityUnit: true },
    }),
    prisma.productionBatch.findMany({
      where: { outputProductId: { in: fgProductIds }, status: "COMPLETED" },
      orderBy: { producedAt: "desc" },
      distinct: ["outputProductId"],
      select: { outputProductId: true, hppPerUnit: true },
    })
  ]);

  const stockMap = new Map<string, number>();
  allLedgers.forEach(e => {
    if (!e.productId) return;
    const current = stockMap.get(e.productId) || 0;
    const qty = e.quantityUnit || 0;
    stockMap.set(e.productId, e.entryType === "IN" ? current + qty : current - qty);
  });

  const hppMap = new Map<string, number>();
  latestBatches.forEach(b => {
    hppMap.set(b.outputProductId, Number(b.hppPerUnit));
  });

  const fgOptions = fgProducts.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price: Number(p.price) || 0,
    priceSilver: Number(p.priceSilver) || 0,
    priceGold: Number(p.priceGold) || 0,
    stockUnit: stockMap.get(p.id) || 0,
    lastHppPerUnit: hppMap.get(p.id) ?? null,
  }));

  const invoices: InvoiceRow[] = invoicesRaw.map((inv) => {
    const grand = Number(inv.grandTotal);
    const paid = Number(inv.paidAmount);
    return {
      id: inv.id,
      code: inv.code,
      customerName: inv.customer.name,
      itemCount: inv._count.items,
      grandTotal: grand,
      paidAmount: paid,
      balance: grand - paid,
      status: inv.status,
      issuedAt: inv.issuedAt.toISOString(),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    };
  });

  return { invoices, customers: customers as CustomerOption[], fgOptions };
}

// =============================================================================
// CREATE INVOICE — ACID TRANSACTION
// =============================================================================

export async function createInvoice(input: CreateInvoiceInput): Promise<SalesActionResult> {
  try {
    // ── System user ──
    const user = await prisma.user.upsert({
      where: { email: "system@ros.internal" },
      update: {},
      create: {
        name: "System",
        email: "system@ros.internal",
        password: "system",
        role: "OWNER",
      },
    });

    // ── Validate stock for every item ──
    for (const item of input.items) {
      const stock = await computeFGUnitStock(item.productId);
      if (stock < item.quantity) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          success: false,
          error: `Stok "${product?.name ?? "produk"}" tidak cukup. Tersedia: ${stock} unit, dibutuhkan: ${item.quantity} unit.`,
        };
      }
    }

    // ── HPP snapshot per product ──
    const hppMap = new Map<string, number>();
    await Promise.all(
      input.items.map(async (item) => {
        const lastBatch = await prisma.productionBatch.findFirst({
          where: { outputProductId: item.productId, status: "COMPLETED" },
          orderBy: { producedAt: "desc" },
          select: { hppPerUnit: true },
        });
        hppMap.set(item.productId, lastBatch ? Number(lastBatch.hppPerUnit) : 0);
      })
    );

    // ── Generate invoice code ──
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = await prisma.invoice.count({ where: { code: { startsWith: prefix } } });
    const invoiceCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;

    // ── Compute totals ──
    const enrichedItems = input.items.map((item) => {
      const hpp = hppMap.get(item.productId) ?? 0;
      const effectivePrice = item.unitPrice - item.discount;
      const subtotal = effectivePrice * item.quantity;
      return { ...item, hpp, subtotal };
    });
    const subtotal = enrichedItems.reduce((s, i) => s + i.subtotal, 0);
    const grandTotal = subtotal - input.invoiceDiscount + input.tax;

    // ── ACID transaction ──
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          code: invoiceCode,
          customerId: input.customerId,
          subtotal,
          discount: input.invoiceDiscount,
          tax: input.tax,
          grandTotal,
          paidAmount: input.status === "PAID" ? grandTotal : 0,
          status: input.status === "PAID" ? "PAID" : "ISSUED",
          issuedAt: now,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          notes: input.notes,
          createdById: user.id,
        },
      });

      // Line items (immutable after insert)
      for (const item of enrichedItems) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: inv.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
            hpp: item.hpp,
          },
        });
      }

      // InventoryLedger OUT per item
      for (const item of enrichedItems) {
        await tx.inventoryLedger.create({
          data: {
            productId: item.productId,
            entryType: "OUT",
            refType: "SALE_FG_OUT",
            refId: inv.id,
            quantityUnit: item.quantity,
            notes: `Penjualan ${invoiceCode}`,
            createdById: user.id,
          },
        });
      }

      // Payment record if PAID
      if (input.status === "PAID" && input.paymentMethod) {
        const payPrefix = `PAY-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const payCount = await tx.payment.count({ where: { code: { startsWith: payPrefix } } });
        const payCode = `${payPrefix}-${String(payCount + 1).padStart(3, "0")}`;

        await tx.payment.create({
          data: {
            code: payCode,
            invoiceId: inv.id,
            amount: grandTotal,
            method: input.paymentMethod,
            paidAt: now,
            notes: "Lunas saat nota diterbitkan",
            createdById: user.id,
          },
        });
      }

      return inv;
    });

    revalidatePath("/penjualan");
    revalidatePath("/inventory");

    return { success: true, invoiceCode, invoiceId: invoice.id };
  } catch (err) {
    console.error("[createInvoice]", err);
    return { success: false, error: "Gagal menyimpan nota. Coba lagi." };
  }
}

// =============================================================================
// GET INVOICE FOR PRINT
// =============================================================================

export async function getInvoiceForPrint(id: string): Promise<InvoicePrintData | null> {
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, phone: true, address: true } },
      items: {
        include: { product: { select: { name: true, code: true } } },
        orderBy: { id: "asc" },
      },
      payments: { orderBy: { paidAt: "asc" } },
    },
  });

  if (!inv) return null;

  const grandTotal = Number(inv.grandTotal);
  const paidAmount = Number(inv.paidAmount);

  return {
    code: inv.code,
    issuedAt: inv.issuedAt.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    status: inv.status,
    customerName: inv.customer.name,
    customerPhone: inv.customer.phone,
    customerAddress: inv.customer.address,
    items: inv.items.map((item) => {
      const unitPrice = Number(item.unitPrice);
      const disc = Number(item.discount);
      const hpp = Number(item.hpp);
      const subtotal = Number(item.subtotal);
      const margin = (unitPrice - disc - hpp) * item.quantity;
      return {
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice,
        discount: disc,
        subtotal,
        hpp,
        margin,
      };
    }),
    subtotal: Number(inv.subtotal),
    discount: Number(inv.discount),
    tax: Number(inv.tax),
    grandTotal,
    paidAmount,
    balance: grandTotal - paidAmount,
    payments: inv.payments.map((p) => ({
      code: p.code,
      amount: Number(p.amount),
      method: p.method,
      paidAt: p.paidAt.toISOString(),
    })),
    notes: inv.notes,
  };
}

// =============================================================================
// VOID INVOICE
// =============================================================================

export type VoidResult =
  | { success: true }
  | { success: false; error: string };

export async function voidInvoice(
  invoiceId: string,
  reason: string
): Promise<VoidResult> {
  try {
    const user = await prisma.user.upsert({
      where: { email: "system@ros.internal" },
      update: {},
      create: { name: "System", email: "system@ros.internal", password: "system", role: "OWNER" },
    });

    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!inv)                  return { success: false, error: "Nota tidak ditemukan." };
    if (inv.status === "VOID") return { success: false, error: "Nota sudah di-void." };
    if (inv.status === "PAID") return { success: false, error: "Nota yang sudah LUNAS tidak bisa di-void. Hubungi manajer." };

    await prisma.$transaction(async (tx) => {
      // Kembalikan stok FG
      for (const item of inv.items) {
        await tx.inventoryLedger.create({
          data: {
            productId:    item.productId,
            entryType:    "IN",
            refType:      "VOID_REVERSAL",
            refId:        invoiceId,
            quantityUnit: item.quantity,
            notes:        `VOID reversal: ${inv.code}`,
            createdById:  user.id,
          },
        });
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "VOID", voidReason: reason, voidAt: new Date() },
      });
    });

    revalidatePath("/penjualan");
    revalidatePath("/inventory");
    revalidatePath("/keuangan");
    return { success: true };
  } catch (err) {
    console.error("[voidInvoice]", err);
    return { success: false, error: "Gagal melakukan void." };
  }
}
