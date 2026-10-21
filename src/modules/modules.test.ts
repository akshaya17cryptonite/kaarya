import { describe, it, expect } from "vitest";
import { canTransitionBooking } from "./bookings";
import { calculateMarketplaceSplit } from "./payments";
import { calculateHaversineDistanceKm, isWithinServiceRadius } from "./geo";
import { recalculateAverageRating } from "./reviews";

describe("Domain Modules Unit Tests", () => {
  describe("Bookings State Transitions", () => {
    it("allows valid transitions", () => {
      expect(canTransitionBooking("REQUESTED", "ACCEPTED")).toBe(true);
      expect(canTransitionBooking("ACCEPTED", "IN_PROGRESS")).toBe(true);
      expect(canTransitionBooking("IN_PROGRESS", "COMPLETED")).toBe(true);
      expect(canTransitionBooking("REQUESTED", "REJECTED")).toBe(true);
    });

    it("rejects invalid state transitions", () => {
      expect(canTransitionBooking("REQUESTED", "COMPLETED")).toBe(false);
      expect(canTransitionBooking("COMPLETED", "ACCEPTED")).toBe(false);
      expect(canTransitionBooking("CANCELLED", "ACCEPTED")).toBe(false);
    });
  });

  describe("Payments Commission Split", () => {
    it("correctly calculates platform fee and provider payout", () => {
      const split = calculateMarketplaceSplit(1000);
      expect(split.servicePrice).toBe(1000);
      expect(split.platformCommissionPercent).toBe(15);
      expect(split.platformFee).toBe(150);
      expect(split.providerEarning).toBe(850);
      // 18% GST on 150 = 27
      expect(split.taxOnFee).toBe(27);
      expect(split.totalCustomerPayable).toBe(1027);
    });
  });

  describe("Geo Distance Calculations", () => {
    it("calculates accurate distance between coordinates", () => {
      // Noida Sector 62 to Noida Sector 18 is approx ~9.5 km
      const distance = calculateHaversineDistanceKm(
        28.628,
        77.368,
        28.5708,
        77.326
      );
      expect(distance).toBeGreaterThan(6);
      expect(distance).toBeLessThan(12);
    });

    it("detects if customer is within service radius", () => {
      const providerLat = 28.5355;
      const providerLon = 77.391;
      const customerClose = { lat: 28.54, lon: 77.39 };
      const customerFar = { lat: 29.5, lon: 78.5 };

      expect(
        isWithinServiceRadius(
          providerLat,
          providerLon,
          customerClose.lat,
          customerClose.lon,
          10
        )
      ).toBe(true);

      expect(
        isWithinServiceRadius(
          providerLat,
          providerLon,
          customerFar.lat,
          customerFar.lon,
          10
        )
      ).toBe(false);
    });
  });

  describe("Reviews Aggregation", () => {
    it("calculates updated average rating and review counts accurately", () => {
      // 4 reviews with 4.0 average + new 5.0 rating = (16 + 5)/5 = 4.2
      const updated = recalculateAverageRating(4.0, 4, 5);
      expect(updated.totalReviews).toBe(5);
      expect(updated.averageRating).toBe(4.2);
    });
  });
});
