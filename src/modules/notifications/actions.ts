"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/modules/auth/service";
import { markNotificationAsRead, markAllNotificationsAsRead } from "./service";

/**
 * Server Action: Mark an individual notification as read
 */
export async function markNotificationAsReadAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const notificationId = formData.get("notificationId") as string;
  if (!notificationId) {
    return { success: false, error: "Notification ID required." };
  }

  const res = await markNotificationAsRead(notificationId, session.id);
  if (res.success) {
    revalidatePath("/", "layout");
  }

  return res;
}

/**
 * Server Action: Mark all user notifications as read
 */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  const res = await markAllNotificationsAsRead(session.id);
  if (res.success) {
    revalidatePath("/", "layout");
  }

  return res;
}
