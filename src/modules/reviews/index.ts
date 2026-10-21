/**
 * Reviews Module
 * Handles customer ratings, review submissions, and aggregate rating calculation.
 */

export * from "@/types";

export function recalculateAverageRating(
  currentRating: number,
  totalReviews: number,
  newRating: number
): { averageRating: number; totalReviews: number } {
  const updatedTotal = totalReviews + 1;
  const newAverage =
    (currentRating * totalReviews + newRating) / updatedTotal;
  return {
    averageRating: Math.round(newAverage * 10) / 10,
    totalReviews: updatedTotal,
  };
}
