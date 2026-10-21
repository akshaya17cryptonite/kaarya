/**
 * Providers Module
 * Handles provider onboarding, KYC document submission, verification workflow, and service radius.
 */

export * from "@/types";

export interface ProviderRegistrationInput {
  name: string;
  phone: string;
  experienceYears: number;
  serviceCategoryIds: string[];
  serviceRadiusKm: number;
  latitude: number;
  longitude: number;
  currentAddress: string;
}
