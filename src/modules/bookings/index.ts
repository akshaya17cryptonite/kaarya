/**
 * Bookings Module
 * Manages booking lifecycle, scheduling, slot validation, and status transitions.
 */

export * from "@/types";

export const BOOKING_TRANSITIONS = {
  REQUESTED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
} as const;

export function canTransitionBooking(
  current: keyof typeof BOOKING_TRANSITIONS,
  next: string
): boolean {
  const allowed = BOOKING_TRANSITIONS[current] as readonly string[];
  return allowed.includes(next);
}
