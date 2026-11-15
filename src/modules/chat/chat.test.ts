import { describe, it, expect } from "vitest";
import { getBookingMessages, sendBookingMessage } from "./service";

describe("Chat & Messaging Domain Unit Tests", () => {
  describe("sendBookingMessage", () => {
    it("rejects empty messages", async () => {
      const res = await sendBookingMessage({
        bookingId: "bk_seed_001",
        senderId: "u_rohit",
        content: "   ",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("cannot be empty");
    });

    it("successfully sends message and creates ChatMessageItem", async () => {
      const res = await sendBookingMessage({
        bookingId: "bk_seed_001",
        senderId: "u_rohit",
        content: "Hello Ramesh, please let me know when you reach Sector 62.",
      });

      expect(res.success).toBe(true);
      expect(res.message).toBeDefined();
      expect(res.message?.content).toContain("Sector 62");
      expect(res.message?.isMe).toBe(true);
    });
  });

  describe("getBookingMessages", () => {
    it("fetches message stream for a booking", async () => {
      const messages = await getBookingMessages("bk_seed_001", "u_rohit");
      expect(messages).toBeDefined();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].content).toBeDefined();
      expect(messages[0].createdAt).toBeDefined();
    });
  });
});
