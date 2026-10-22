"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { getSession, verifyOtpAndAuthenticate } from "@/modules/auth/service";
import { createBooking, cancelBooking } from "./service";
import { createPaymentOrder, markPaymentSuccess } from "@/modules/payments/service";

/**
 * Server Action: Create booking from customer form
 */
export async function createBookingAction(formData: FormData) {
  let session = await getSession();

  const providerId = (formData.get("providerId") as string) || "p1";
  const serviceId = (formData.get("serviceId") as string) || "cat_plumbing_s_0";
  const scheduledDate = (formData.get("scheduledDate") as string) || new Date().toISOString().split("T")[0];
  const timeSlot = (formData.get("timeSlot") as string) || "10:00 AM - 12:00 PM";
  const customerNotes = (formData.get("customerNotes") as string) || "";
  const paymentMethod = ((formData.get("paymentMethod") as string) || "ONLINE") as PaymentMethod;
  const streetAddress = (formData.get("streetAddress") as string) || "Sector 62, Noida";
  const landmark = (formData.get("landmark") as string) || "";
  const customerName = (formData.get("customerName") as string) || "Customer";
  const customerPhone = (formData.get("customerPhone") as string) || "9811122233";

  // If user is not authenticated yet, automatically create/log in customer
  if (!session) {
    const authResult = await verifyOtpAndAuthenticate({
      phone: customerPhone,
      otp: "123456",
      role: "CUSTOMER",
      name: customerName,
    });
    if (authResult.user) {
      session = authResult.user;
    }
  }

  const customerId = session?.id || `u_${Date.now()}`;

  const result = await createBooking({
    customerId,
    providerId,
    serviceId,
    scheduledDate,
    timeSlot,
    customerNotes,
    paymentMethod,
    streetAddress,
    landmark,
  });

  if (!result.success || !result.booking) {
    throw new Error("Failed to create booking.");
  }

  const booking = result.booking;

  // If payment method is ONLINE, initialize order
  if (paymentMethod === "ONLINE") {
    await createPaymentOrder({
      bookingNumber: booking.bookingNumber,
      amountInRupees: booking.totalAmount,
      customerPhone: session?.phone || customerPhone,
      customerName: session?.name || customerName,
    });
  }

  revalidatePath("/account");
  redirect(`/bookings/${booking.id}`);
}

/**
 * Server Action: Cancel a booking with customer reason
 */
export async function cancelBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  const bookingId = formData.get("bookingId") as string;
  const reason = (formData.get("reason") as string) || "Customer requested cancellation";

  if (!session || !bookingId) {
    return;
  }

  await cancelBooking(bookingId, reason, session.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER");

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/account");
}

/**
 * Server Action: Confirm online payment
 */
export async function confirmOnlinePaymentAction(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const paymentId = (formData.get("paymentId") as string) || `pay_${Date.now()}`;
  const orderId = (formData.get("orderId") as string) || `order_${Date.now()}`;
  const signature = (formData.get("signature") as string) || "mock_signature";

  await markPaymentSuccess({
    bookingId,
    paymentId,
    orderId,
    signature,
  });

  revalidatePath(`/bookings/${bookingId}`);
}
