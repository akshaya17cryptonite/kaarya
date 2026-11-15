"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/modules/auth/service";
import { sendBookingMessage } from "./service";

/**
 * Server Action: Send in-app chat message for a booking
 */
export async function sendBookingMessageAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to send messages." };
  }

  const bookingId = formData.get("bookingId") as string;
  const content = formData.get("content") as string;

  if (!bookingId || !content || content.trim().length === 0) {
    return { success: false, error: "Message content cannot be empty." };
  }

  const res = await sendBookingMessage({
    bookingId,
    senderId: session.id,
    content: content.trim(),
  });

  if (res.success) {
    revalidatePath(`/bookings/${bookingId}`);
  }

  return res;
}
