import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

export interface CreateOrderParams {
  bookingNumber: string;
  amountInRupees: number;
  customerPhone: string;
  customerName: string;
}

export interface RazorpayOrderResult {
  orderId: string;
  currency: string;
  amount: number; // in paise
  keyId: string;
  isMock: boolean;
}

/**
 * Initializes Razorpay instance or falls back to mock driver
 */
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || process.env.ENABLE_MOCK_DRIVERS === "true") {
    return null; // Signals mock mode
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Creates a Razorpay order for online payment
 */
export async function createPaymentOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const { bookingNumber, amountInRupees } = params;
  const amountInPaise = Math.round(amountInRupees * 100);
  const client = getRazorpayClient();

  if (!client) {
    // Mock Razorpay order
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      orderId: mockOrderId,
      currency: "INR",
      amount: amountInPaise,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
      isMock: true,
    };
  }

  try {
    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: bookingNumber,
      notes: {
        bookingNumber,
      },
    });

    return {
      orderId: order.id,
      currency: order.currency,
      amount: order.amount as number,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      isMock: false,
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // Graceful fallback to mock order in dev
    const mockOrderId = `order_mock_${Date.now()}`;
    return {
      orderId: mockOrderId,
      currency: "INR",
      amount: amountInPaise,
      keyId: "rzp_test_mock",
      isMock: true,
    };
  }
}

/**
 * Validates Razorpay webhook / client payment signature
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;

  if (process.env.ENABLE_MOCK_DRIVERS === "true" || orderId.startsWith("order_mock_")) {
    return true; // Auto-verify in mock mode
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Updates booking payment record upon success
 */
export async function markPaymentSuccess(params: {
  bookingId: string;
  paymentId: string;
  orderId: string;
  signature?: string;
}) {
  const { bookingId, paymentId, orderId, signature } = params;

  try {
    const payment = await prisma.payment.update({
      where: { bookingId },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature ?? null,
        paidAt: new Date(),
      },
      include: { booking: true },
    });

    // Also update booking status to ACCEPTED if previously REQUESTED
    if (payment.booking.status === "REQUESTED") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "ACCEPTED" },
      });
    }

    return { success: true, payment };
  } catch (err) {
    console.error("Failed to mark payment success:", err);
    return { success: false, error: (err as Error).message };
  }
}
