import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } } // get default user for createdById
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    // Default admin user for creation
    const createdById = tenant.users[0]?.id || "admin"; // Should be a valid user ID if possible

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
        hpp: 0, // Placeholder
      });
    }

    // 4. Buat Invoice
    const countInv = await prisma.invoice.count({ where: { tenantId: tenant.id } });
    
    const invoice = await prisma.invoice.create({
      data: {
        code: `INV-${tenant.code}-${new Date().getFullYear()}-${countInv + 1}`,
        customerId: customer.id,
        tenantId: tenant.id,
        createdById: createdById,
        status: "DRAFT",
        subtotal: subtotal,
        discount: 0,
        tax: 0,
        shippingCost: 0, // default, admin updates later
        shippingMethod: shippingMethod || "PICKUP",
        shippingAddress: customerAddress || null,
        grandTotal: subtotal,
        items: {
          create: invoiceItemsData
        }
      }
    });

    revalidatePath("/penjualan");

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem: " + error.message }, { status: 500 });
  }
}
