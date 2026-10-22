import { describe, it, expect } from "vitest";
import { generateBookingNumber } from "./service";
import { verifyRazorpaySignature } from "@/modules/payments/service";
import { calculateMarketplaceSplit } from "@/modules/payments";

describe("Customer Booking Flow Unit Tests", () => {
  describe("generateBookingNumber", () => {
    it("generates booking numbers in correct format BK-YYYYMM-XXXX", () => {
      const b1 = generateBookingNumber();
      const b2 = generateBookingNumber();

      expect(b1).toMatch(/^BK-\d{6}-\d{4}$/);
      expect(b2).toMatch(/^BK-\d{6}-\d{4}$/);
      expect(b1).not.toBe(b2);
    });
  });

  describe("Fee Breakdown for Booking", () => {
    it("calculates accurate total payable and provider split for a service", () => {
      // For a ₹499 service:
      // 15% platform fee = 75
      // 18% GST on 75 = 14
      // Total payable = 499 + 14 = 513
      // Provider earnings = 499 - 75 = 424
      const split = calculateMarketplaceSplit(499);
      expect(split.servicePrice).toBe(499);
      expect(split.platformFee).toBe(75);
      expect(split.taxOnFee).toBe(14);
      expect(split.totalCustomerPayable).toBe(513);
      expect(split.providerEarning).toBe(424);
    });
  });

  describe("Razorpay Signature Verification", () => {
    it("verifies mock orders automatically in development", () => {
      const isValid = verifyRazorpaySignature({
        orderId: "order_mock_12345",
        paymentId: "pay_mock_999",
        signature: "test_sig",
      });
      expect(isValid).toBe(true);
    });
  });
});
