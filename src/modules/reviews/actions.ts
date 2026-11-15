"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/modules/auth/service";
import { submitBookingReview } from "./service";

/**
 * Server Action: Customer submits star rating and review after job completion
 */
export async function submitReviewAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to submit a review." };
  }

  const bookingId = formData.get("bookingId") as string;
  const ratingStr = formData.get("rating") as string;
  const comment = (formData.get("comment") as string) || undefined;

  const rating = parseInt(ratingStr, 10);
  if (!bookingId || isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Valid booking ID and star rating (1 to 5) are required." };
  }

  const res = await submitBookingReview({
    bookingId,
    customerId: session.id,
    rating,
    comment,
  });

  if (res.success) {
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath("/account");
    revalidatePath("/provider/reviews");
  }

  return res;
}
