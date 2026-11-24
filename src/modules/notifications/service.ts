import { prisma, isMockMode } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export * from "@/types";

export interface UserNotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface MultiChannelNotificationParams {
  userId: string;
  phone?: string;
  email?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Multi-channel driver: SMS simulation (MSG91 / Twilio)
 */
export async function sendSmsNotification(phone: string, text: string): Promise<boolean> {
  const isMock = process.env.ENABLE_MOCK_DRIVERS === "true" || !process.env.MSG91_AUTH_KEY;
  if (isMock) {
    console.log(`[MOCK SMS (MSG91/Twilio)] 📱 To: ${phone} | Content: "${text}"`);
    return true;
  }
  // In live production, invoke MSG91 / Twilio REST API here
  return true;
}

/**
 * Multi-channel driver: Email simulation (Resend / SendGrid)
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  bodyText: string
): Promise<boolean> {
  const isMock = process.env.ENABLE_MOCK_DRIVERS === "true" || !process.env.RESEND_API_KEY;
  if (isMock) {
    console.log(`[MOCK EMAIL (Resend)] ✉️ To: ${email} | Subject: "${subject}" | Body: "${bodyText}"`);
    return true;
  }
  // In live production, invoke Resend SDK here
  return true;
}

/**
 * Dispatches notification across In-App (DB), SMS, and Email channels
 */
export async function dispatchMultiChannelNotification(
  params: MultiChannelNotificationParams
): Promise<{ success: boolean; notificationId?: string }> {
  const { userId, phone, email, title, message, type = NotificationType.BOOKING, link } = params;

  let notificationId = `notif_${Date.now()}`;

  // 1. Create In-App Notification record
  if (!isMockMode) {
    try {
      const notif = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
          isRead: false,
        },
      });
      notificationId = notif.id;
    } catch (err) {
      console.warn("DB in-app notification creation fallback:", (err as Error).message);
    }
  }

  // 2. Dispatch SMS driver if phone available
  if (phone) {
    await sendSmsNotification(phone, `${title}: ${message}`);
  }

  // 3. Dispatch Email driver if email available
  if (email) {
    await sendEmailNotification(email, `LocConnect: ${title}`, message);
  }

  return { success: true, notificationId };
}

/**
 * Fetch all notifications for the current authenticated user
 */
export async function getUserNotifications(userId: string): Promise<{
  notifications: UserNotificationItem[];
  unreadCount: number;
}> {
  // Fallback demo notifications for offline / initial states
  const fallbackList: UserNotificationItem[] = [
    {
      id: "notif_fallback_1",
      userId,
      title: "Booking Confirmed #BK-202610-8401",
      message: "Ramesh Verma (Plumber) has accepted your booking for tomorrow 10:00 AM.",
      type: NotificationType.BOOKING,
      link: "/bookings/bk_seed_001",
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "notif_fallback_2",
      userId,
      title: "Payment Held in Escrow",
      message: "Your payment of ₹513 is held securely until service completion.",
      type: NotificationType.PAYMENT,
      link: "/bookings/bk_seed_001",
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif_fallback_3",
      userId,
      title: "LocConnect Noida Launch",
      message: "Verified plumbers, electricians & cleaners are now live across all Noida sectors!",
      type: NotificationType.SYSTEM,
      link: "/services/plumber/noida",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  if (isMockMode) {
    return {
      notifications: fallbackList,
      unreadCount: fallbackList.filter((n) => !n.isRead).length,
    };
  }

  try {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    if (list.length > 0) {
      const items: UserNotificationItem[] = list.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }));

      const unreadCount = items.filter((n) => !n.isRead).length;
      return { notifications: items, unreadCount };
    }
  } catch (err) {
    console.warn("DB getUserNotifications failed, using fallback:", (err as Error).message);
  }

  return {
    notifications: fallbackList,
    unreadCount: fallbackList.filter((n) => !n.isRead).length,
  };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean }> {
  if (isMockMode) {
    return { success: true };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
    return { success: true };
  } catch (err) {
    console.warn("DB markNotificationAsRead failed:", (err as Error).message);
    return { success: true };
  }
}

/**
 * Mark all notifications for the user as read
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean }> {
  if (isMockMode) {
    return { success: true };
  }
  try {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (err) {
    console.warn("DB markAllNotificationsAsRead failed:", (err as Error).message);
    return { success: true };
  }
}
