import { describe, it, expect } from "vitest";
import {
  getUserNotifications,
  dispatchMultiChannelNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendSmsNotification,
  sendEmailNotification,
} from "./service";
import { NotificationType } from "@prisma/client";

describe("Notifications & Multi-Channel Dispatcher Unit Tests", () => {
  describe("Multi-Channel Drivers", () => {
    it("simulates SMS delivery via MSG91/Twilio driver", async () => {
      const delivered = await sendSmsNotification("+919810111222", "Your booking is confirmed!");
      expect(delivered).toBe(true);
    });

    it("simulates Email delivery via Resend/SendGrid driver", async () => {
      const delivered = await sendEmailNotification(
        "customer@example.com",
        "Booking Status Update",
        "Your service has been accepted."
      );
      expect(delivered).toBe(true);
    });

    it("dispatches notification across In-App, SMS, and Email", async () => {
      const res = await dispatchMultiChannelNotification({
        userId: "u_rohit",
        phone: "+919811122233",
        email: "rohit@example.com",
        title: "Technician En Route",
        message: "Your plumbing expert is on the way.",
        type: NotificationType.BOOKING,
      });

      expect(res.success).toBe(true);
      expect(res.notificationId).toBeDefined();
    });
  });

  describe("In-App Notifications Retrieval & Read State", () => {
    it("retrieves notifications list and unread count for user", async () => {
      const res = await getUserNotifications("u_rohit");
      expect(res.notifications).toBeDefined();
      expect(res.notifications.length).toBeGreaterThan(0);
      expect(typeof res.unreadCount).toBe("number");
    });

    it("marks single notification as read safely", async () => {
      const res = await markNotificationAsRead("notif_fallback_1", "u_rohit");
      expect(res.success).toBe(true);
    });

    it("marks all notifications as read safely", async () => {
      const res = await markAllNotificationsAsRead("u_rohit");
      expect(res.success).toBe(true);
    });
  });
});
