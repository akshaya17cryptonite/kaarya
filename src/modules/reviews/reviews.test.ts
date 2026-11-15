import { describe, it, expect } from "vitest";
import {
  recalculateAverageRating,
  submitBookingReview,
  getReviewForBooking,
} from "./service";

describe("Customer Reviews Domain Unit Tests", () => {
  describe("recalculateAverageRating", () => {
    it("correctly calculates updated average rating when a new rating is added", () => {
      // 4.0 average over 4 reviews = 16 total points
      // Add a 5 star review: (16 + 5) / 5 = 4.2
      const res = recalculateAverageRating(4.0, 4, 5);
      expect(res.averageRating).toBe(4.2);
      expect(res.totalReviews).toBe(5);
    });

    it("handles initial review starting from 0", () => {
      const res = recalculateAverageRating(0.0, 0, 5);
      expect(res.averageRating).toBe(5.0);
      expect(res.totalReviews).toBe(1);
    });

    it("accurately rounds to one decimal place", () => {
      // 4.8 over 10 reviews = 48 points
      // Add a 4 star: (48 + 4) / 11 = 4.7272... -> 4.7
      const res = recalculateAverageRating(4.8, 10, 4);
      expect(res.averageRating).toBe(4.7);
      expect(res.totalReviews).toBe(11);
    });
  });

  describe("submitBookingReview", () => {
    it("rejects invalid star ratings outside 1-5 range", async () => {
      const lowRes = await submitBookingReview({
        bookingId: "bk_1",
        customerId: "cust_1",
        rating: 0,
      });
      expect(lowRes.success).toBe(false);
      expect(lowRes.error).toContain("between 1 and 5");

      const highRes = await submitBookingReview({
        bookingId: "bk_1",
        customerId: "cust_1",
        rating: 6,
      });
      expect(highRes.success).toBe(false);
      expect(highRes.error).toContain("between 1 and 5");
    });

    it("successfully creates a review and returns formatted review object", async () => {
      const res = await submitBookingReview({
        bookingId: "bk_seed_003",
        customerId: "u_rohit",
        rating: 5,
        comment: "Excellent service! Fixed leaking pipe very promptly.",
      });

      expect(res.success).toBe(true);
      expect(res.review).toBeDefined();
      expect(res.review?.rating).toBe(5);
      expect(res.review?.comment).toContain("leaking pipe");
    });
  });

  describe("getReviewForBooking", () => {
    it("safely looks up reviews by booking id", async () => {
      const res = await getReviewForBooking("bk_seed_003");
      // Returns review or null without throwing
      expect(res === null || res.id !== undefined).toBe(true);
    });
  });
});
