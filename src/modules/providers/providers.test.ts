import { describe, it, expect } from "vitest";
import {
  VALID_JOB_TRANSITIONS,
  getProviderProfileByUserId,
  updateJobStatus,
  saveAvailabilitySlots,
} from "./service";
import { BookingStatus } from "@prisma/client";

describe("Provider Domain Unit Tests", () => {
  describe("Job Lifecycle State Transitions", () => {
    it("allows valid transitions from REQUESTED to ACCEPTED or REJECTED", () => {
      expect(VALID_JOB_TRANSITIONS[BookingStatus.REQUESTED]).toContain(BookingStatus.ACCEPTED);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.REQUESTED]).toContain(BookingStatus.REJECTED);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.REQUESTED]).not.toContain(BookingStatus.COMPLETED);
    });

    it("allows valid transitions from ACCEPTED to IN_PROGRESS or CANCELLED", () => {
      expect(VALID_JOB_TRANSITIONS[BookingStatus.ACCEPTED]).toContain(BookingStatus.IN_PROGRESS);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.ACCEPTED]).toContain(BookingStatus.CANCELLED);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.ACCEPTED]).not.toContain(BookingStatus.REQUESTED);
    });

    it("allows valid transitions from IN_PROGRESS to COMPLETED or CANCELLED", () => {
      expect(VALID_JOB_TRANSITIONS[BookingStatus.IN_PROGRESS]).toContain(BookingStatus.COMPLETED);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.IN_PROGRESS]).toContain(BookingStatus.CANCELLED);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.IN_PROGRESS]).not.toContain(BookingStatus.ACCEPTED);
    });

    it("prevents any transitions once COMPLETED or CANCELLED", () => {
      expect(VALID_JOB_TRANSITIONS[BookingStatus.COMPLETED]).toHaveLength(0);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.CANCELLED]).toHaveLength(0);
      expect(VALID_JOB_TRANSITIONS[BookingStatus.REJECTED]).toHaveLength(0);
    });
  });

  describe("Provider Profile & Dashboard Fallback", () => {
    it("returns rich fallback data for offline dev with all required properties", async () => {
      const data = await getProviderProfileByUserId("mock_provider_user");

      expect(data).toBeDefined();
      expect(data.name).toBe("Ramesh Verma");
      expect(data.phone).toBe("+919810111222");
      expect(data.serviceRadiusKm).toBeGreaterThan(0);
      expect(data.services.length).toBeGreaterThan(0);
      expect(data.bookings.length).toBeGreaterThan(0);
      expect(data.availabilitySlots.length).toBeGreaterThan(0);
      expect(data.payouts.length).toBeGreaterThan(0);
      expect(data.kycDocuments.length).toBeGreaterThan(0);
    });

    it("calculates 15% platform commission correctly on payouts", async () => {
      const data = await getProviderProfileByUserId("mock_provider_user");
      const payout = data.payouts[0];

      expect(payout).toBeDefined();
      expect(payout.grossAmount).toBeGreaterThan(0);
      // Net payout + platform fee should equal gross amount
      expect(Math.round((payout.netPayout + payout.platformFee) * 100) / 100).toBe(
        payout.grossAmount
      );
      // Platform fee should be exactly 15%
      expect(payout.platformFee).toBe(Math.round(payout.grossAmount * 0.15 * 100) / 100);
    });
  });

  describe("Job Action Execution", () => {
    it("executes status update safely returning success flag", async () => {
      const res = await updateJobStatus({
        bookingId: "bk_seed_001",
        providerUserId: "u_ramesh",
        newStatus: BookingStatus.ACCEPTED,
      });

      expect(res.success).toBe(true);
      expect(res.booking).toBeDefined();
    });

    it("saves availability slots safely", async () => {
      const res = await saveAvailabilitySlots({
        providerUserId: "u_ramesh",
        slots: [
          { dayOfWeek: 1, startTime: "09:00 AM", endTime: "11:00 AM" },
          { dayOfWeek: 2, startTime: "02:30 PM", endTime: "04:30 PM" },
        ],
      });

      expect(res.success).toBe(true);
    });
  });
});
