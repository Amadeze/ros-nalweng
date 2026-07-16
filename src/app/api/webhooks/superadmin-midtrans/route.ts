import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Verify Signature Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureKey = data.signature_key;
    const orderId = data.order_id;
    const statusCode = data.status_code;
    const grossAmount = data.gross_amount;

    const hash = crypto.createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    if (hash !== signatureKey) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    let dbStatus = "PENDING";
    let isSuccess = false;

    if (transactionStatus == 'capture'){
      if (fraudStatus == 'challenge'){
        dbStatus = "PENDING";
      } else if (fraudStatus == 'accept'){
        dbStatus = "SUCCESS";
        isSuccess = true;
      }
    } else if (transactionStatus == 'settlement'){
      dbStatus = "SUCCESS";
      isSuccess = true;
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
      dbStatus = "FAILED";
    } else if (transactionStatus == 'pending'){
      dbStatus = "PENDING";
    }

    // Update SubscriptionPayment
    const payment = await prisma.subscriptionPayment.update({
      where: { midtransOrderId: orderId },
      data: { status: dbStatus }
    });

    if (isSuccess && payment) {
      // Calculate next billing date (1 month from now)
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      await prisma.tenant.update({
        where: { id: payment.tenantId },
        data: {
          subscriptionTier: payment.tier,
          subscriptionStatus: "ACTIVE",
          nextBillingDate: nextBilling
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
