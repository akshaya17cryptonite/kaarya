/**
 * Payments Module
 * Handles Razorpay order creation, payment signature verification, commission calculation, and provider payouts.
 */

import { siteConfig } from "@/config/site";

export * from "@/types";

export interface CommissionBreakdown {
  servicePrice: number;
  platformCommissionPercent: number;
  platformFee: number;
  taxOnFee: number;
  providerEarning: number;
  totalCustomerPayable: number;
}

/**
 * Calculates marketplace fee split for a booking
 */
export function calculateMarketplaceSplit(servicePrice: number): CommissionBreakdown {
  const platformPercent = siteConfig.platformCommissionPercent; // 15%
  const gstPercent = siteConfig.gstPercent; // 18%

  const platformFee = Math.round((servicePrice * platformPercent) / 100);
  const taxOnFee = Math.round((platformFee * gstPercent) / 100);
  const providerEarning = servicePrice - platformFee;
  const totalCustomerPayable = servicePrice + taxOnFee;

  return {
    servicePrice,
    platformCommissionPercent: platformPercent,
    platformFee,
    taxOnFee,
    providerEarning,
    totalCustomerPayable,
  };
}
