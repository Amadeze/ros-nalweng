import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const orderId = data.order_id;
    const signatureKey = data.signature_key;
    const statusCode = data.status_code;
    const grossAmount = data.gross_amount;
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Find the invoice to get the tenant's Server Key
    const invoice = await prisma.invoice.findUnique({
      where: { midtransOrderId: orderId },
      include: { tenant: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const serverKey = invoice.tenant.midtransServerKey || "";

    // Verify Signature Key using Tenant's Server Key
    const hash = crypto.createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    if (hash !== signatureKey) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

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

    // Update Invoice Status
    if (isSuccess) {
      // Create Payment Record
      await prisma.$transaction(async (tx) => {
        const paymentCount = await tx.payment.count({ where: { tenantId: invoice.tenantId } });
        await tx.payment.create({
          data: {
            code: `PAY-${invoice.tenant.code}-${Date.now()}-${paymentCount + 1}`,
            invoiceId: invoice.id,
            amount: grossAmount,
            method: data.payment_type?.toUpperCase() || "MIDTRANS",
            reference: transactionStatus,
            status: "COMPLETED",
            tenantId: invoice.tenantId,
            createdById: invoice.createdById, 
          }
        });

        // Update Invoice status to PAID
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { 
            status: "PAID",
            paidAmount: invoice.grandTotal, 
          }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Tenant Midtrans Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
