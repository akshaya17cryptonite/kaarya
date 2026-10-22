import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { markPaymentSuccess } from "@/modules/payments/service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find booking by razorpay order ID
      const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (paymentRecord) {
        await markPaymentSuccess({
          bookingId: paymentRecord.bookingId,
          paymentId,
          orderId,
          signature: signature || undefined,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
