/**
 * Notifications Module
 * Dispatches notifications across In-App (Realtime), SMS (MSG91/Twilio), and Email (Resend).
 */

export * from "@/types";

export interface SendNotificationParams {
  userId: string;
  phone?: string;
  email?: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYMENT" | "SYSTEM" | "PROMOTION";
  link?: string;
}

export interface NotificationServiceDriver {
  sendSms(to: string, message: string): Promise<boolean>;
  sendEmail(to: string, subject: string, bodyHtml: string): Promise<boolean>;
  sendInApp(userId: string, notification: SendNotificationParams): Promise<boolean>;
}
