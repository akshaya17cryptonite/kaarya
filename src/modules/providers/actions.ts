"use server";

import { revalidatePath } from "next/cache";
import { BookingStatus } from "@prisma/client";
import { getSession } from "@/modules/auth/service";
import {
  updateJobStatus,
  saveAvailabilitySlots,
  updateProviderServices,
  saveOnboardingDetails,
  replyToReview,
  toggleProviderAvailability,
} from "./service";

/**
 * Server Action: Update booking job status (Accept, Reject, Start, Complete)
 */
export async function updateJobStatusAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as BookingStatus;
  const reason = (formData.get("reason") as string) || undefined;

  if (!bookingId || !status) {
    return { success: false, error: "Missing required booking details." };
  }

  const result = await updateJobStatus({
    bookingId,
    providerUserId: session.id,
    newStatus: status,
    reason,
  });

  if (result.success) {
    revalidatePath("/provider");
    revalidatePath("/provider/jobs");
    revalidatePath(`/bookings/${bookingId}`);
  }

  return result;
}

/**
 * Server Action: Save weekly availability calendar slots
 */
export async function saveAvailabilitySlotsAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const slotsRaw = formData.get("slots") as string;
  let slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }> = [];

  try {
    slots = JSON.parse(slotsRaw);
  } catch {
    return { success: false, error: "Invalid availability slots payload." };
  }

  const result = await saveAvailabilitySlots({
    providerUserId: session.id,
    slots,
  });

  if (result.success) {
    revalidatePath("/provider");
    revalidatePath("/provider/availability");
  }

  return result;
}

/**
 * Server Action: Update offered catalog services and pricing
 */
export async function updateProviderServicesAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const servicesRaw = formData.get("services") as string;
  let services: Array<{ serviceId: string; customPrice?: number | null; isAvailable?: boolean }> = [];

  try {
    services = JSON.parse(servicesRaw);
  } catch {
    return { success: false, error: "Invalid services configuration." };
  }

  const result = await updateProviderServices({
    providerUserId: session.id,
    services,
  });

  if (result.success) {
    revalidatePath("/provider");
    revalidatePath("/provider/services");
  }

  return result;
}

/**
 * Server Action: Submit or update provider onboarding and KYC
 */
export async function submitOnboardingAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const experienceYears = parseInt((formData.get("experienceYears") as string) || "1", 10);
  const bio = (formData.get("bio") as string) || undefined;
  const currentAddress = (formData.get("currentAddress") as string) || "Noida, Uttar Pradesh";
  const serviceRadiusKm = parseFloat((formData.get("serviceRadiusKm") as string) || "15");
  const bankAccountName = (formData.get("bankAccountName") as string) || undefined;
  const bankAccountNumber = (formData.get("bankAccountNumber") as string) || undefined;
  const bankIfscCode = (formData.get("bankIfscCode") as string) || undefined;
  const upiId = (formData.get("upiId") as string) || undefined;
  const aadhaarNumber = (formData.get("aadhaarNumber") as string) || undefined;
  const panNumber = (formData.get("panNumber") as string) || undefined;

  const serviceIdsRaw = formData.get("serviceIds") as string;
  let serviceIds: string[] = [];
  if (serviceIdsRaw) {
    try {
      serviceIds = JSON.parse(serviceIdsRaw);
    } catch {
      serviceIds = [serviceIdsRaw];
    }
  }

  const result = await saveOnboardingDetails({
    providerUserId: session.id,
    input: {
      experienceYears,
      bio,
      currentAddress,
      serviceRadiusKm,
      bankAccountName,
      bankAccountNumber,
      bankIfscCode,
      upiId,
      serviceIds,
      aadhaarNumber,
      panNumber,
    },
  });

  if (result.success) {
    revalidatePath("/provider");
    revalidatePath("/provider/onboarding");
  }

  return result;
}

/**
 * Server Action: Respond to a customer review
 */
export async function replyToReviewAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const reviewId = formData.get("reviewId") as string;
  const replyText = formData.get("replyText") as string;

  if (!reviewId || !replyText || replyText.trim().length === 0) {
    return { success: false, error: "Response text cannot be empty." };
  }

  const result = await replyToReview({
    reviewId,
    providerUserId: session.id,
    replyText: replyText.trim(),
  });

  if (result.success) {
    revalidatePath("/provider");
    revalidatePath("/provider/reviews");
  }

  return result;
}

/**
 * Server Action: Quick toggle availability (Online / Taking Jobs vs Offline)
 */
export async function toggleAvailabilityAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || (session.role !== "PROVIDER" && session.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized: Service Provider login required." };
  }

  const isAvailable = formData.get("isAvailable") === "true";

  const result = await toggleProviderAvailability({
    providerUserId: session.id,
    isAvailable,
  });

  if (result.success) {
    revalidatePath("/provider");
  }

  return result;
}
