import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import midtransClient from "midtrans-client";
import { sendInvoiceEmail } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, shippingMethod, items } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Dapatkan tenant
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const createdById = tenant.users[0]?.id || "admin";

    // 2. Cari atau Buat Customer
    let customer = await prisma.customer.findFirst({
      where: { tenantId: tenant.id, phone: customerPhone }
    });

    if (!customer) {
      const count = await prisma.customer.count({ where: { tenantId: tenant.id } });
      customer = await prisma.customer.create({
        data: {
          code: `CST-${tenant.code}-${count + 1}`,
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          tenantId: tenant.id,
        }
      });
    }

    // 3. Kalkulasi Subtotal & Buat Items Array
    let subtotal = 0;
    const invoiceItemsData = [];
    const midtransItemDetails = [];
    
    for (const item of items) {
      const unitPrice = Number(item.price);
      const qty = Number(item.quantity);
      const itemSub = unitPrice * qty;
      subtotal += itemSub;
      
      invoiceItemsData.push({
        productId: item.id,
        quantity: qty,
        unitPrice: unitPrice,
        discount: 0,
        subtotal: itemSub,
        hpp: 0, 
      });

      midtransItemDetails.push({
        id: item.id,
        price: Math.round(unitPrice),
        quantity: qty,
        name: item.name.substring(0, 50)
      });
    }

    const grandTotal = subtotal; // Assuming no tax or shipping for now

    // 4. Midtrans Integration Check
    const hasMidtrans = tenant.midtransServerKey && tenant.midtransClientKey;
    let midtransOrderId = null;
    let paymentUrl = null;
    let snapToken = null;

    const countInv = await prisma.invoice.count({ where: { tenantId: tenant.id } });
    const invoiceCode = `INV-${tenant.code}-${new Date().getFullYear()}-${countInv + 1}`;

    if (hasMidtrans) {
      midtransOrderId = `${invoiceCode}-${Date.now().toString().slice(-6)}`;
      const snap = new midtransClient.Snap({
        isProduction: tenant.midtransIsProduction,
        serverKey: tenant.midtransServerKey || "",
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
          email: `${customerPhone}@roasteryos.local`,
        },
        item_details: midtransItemDetails
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        snapToken = transaction.token;
        paymentUrl = transaction.redirect_url;
      } catch (err: any) {
        console.error("Failed to create Midtrans Snap for Tenant:", err);
        // Fallback to manual if Midtrans fails
        midtransOrderId = null;
        paymentUrl = null;
      }
    }

    // 5. Buat Invoice
    const invoice = await prisma.invoice.create({
      data: {
        code: invoiceCode,
        customerId: customer.id,
        tenantId: tenant.id,
        createdById: createdById,
        status: hasMidtrans && midtransOrderId ? "ISSUED" : "DRAFT",
        subtotal: subtotal,
        discount: 0,
        tax: 0,
        shippingCost: 0, 
        shippingMethod: shippingMethod || "PICKUP",
        shippingAddress: customerAddress || null,
        grandTotal: grandTotal,
        midtransOrderId: midtransOrderId,
        paymentUrl: paymentUrl,
        items: {
          create: invoiceItemsData
        }
      }
    });

    revalidatePath("/penjualan");

    // Kirim Notifikasi Email
    // Kita asumsikan customerPhone bisa berupa email di sistem B2B atau dikembangkan nanti
    // Untuk saat ini, kirim dummy email atau email admin/customer jika tersedia.
    const customerEmail = `${customerPhone}@roasteryos.local`; // Placeholder email, adjust according to actual data
    await sendInvoiceEmail(customerEmail, invoiceCode, paymentUrl);

    return NextResponse.json({ 
      success: true, 
      invoice,
      snapToken,
      paymentUrl
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem: " + error.message }, { status: 500 });
  }
}
