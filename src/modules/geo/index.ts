/**
 * Geo Module
 * Handles spatial queries, distance calculations, and coordinates mapping.
 */

export * from "@/types";

/**
 * Calculates straight-line distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Checks if a customer coordinate is within a provider's service radius
 */
export function isWithinServiceRadius(
  providerLat: number,
  providerLon: number,
  customerLat: number,
  customerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateHaversineDistanceKm(
    providerLat,
    providerLon,
    customerLat,
    customerLon
  );
  return distance <= radiusKm;
}
