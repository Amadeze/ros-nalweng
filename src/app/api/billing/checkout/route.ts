import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
    if (!session.user || !session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    let amount = 0;
    if (tier === "PRO") amount = 299000;

    if (amount === 0) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Prepare Midtrans Snap (Superadmin's Midtrans Account)
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    });

    const orderId = `SUB-${tenant.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: tenant.name,
        email: session.user.email || tenant.contactEmail || "",
        phone: tenant.whatsappNumber || "",
      },
      item_details: [{
        id: `PLAN-${tier}`,
        price: amount,
        quantity: 1,
        name: `Roastery OS ${tier} Plan (1 Month)`
      }]
    };

    const transaction = await snap.createTransaction(parameter);

    // Save to DB
    await prisma.subscriptionPayment.create({
      data: {
        tenantId: tenant.id,
        amount: amount,
        status: "PENDING",
        midtransOrderId: orderId,
        tier: tier,
        paymentUrl: transaction.redirect_url
      }
    });

    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
