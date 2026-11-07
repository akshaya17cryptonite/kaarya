"use server";

import { revalidatePath } from "next/cache";
import { ProviderVerificationStatus } from "@prisma/client";
import { getSession } from "@/modules/auth/service";
import {
  verifyProvider,
  updateCategory,
  createService,
  updateService,
  resolveBookingDispute,
  updateAdminSettings,
} from "./service";

/**
 * Helper to ensure caller is an authenticated administrator
 */
async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Super Admin credentials required.");
  }
  return session;
}

/**
 * Server Action: Approve or Reject a Provider's KYC Verification
 */
export async function verifyProviderAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const providerId = formData.get("providerId") as string;
    const status = formData.get("status") as ProviderVerificationStatus;
    const rejectionReason = (formData.get("rejectionReason") as string) || undefined;

    if (!providerId || !status) {
      return { success: false, error: "Provider ID and verification status are required." };
    }

    const res = await verifyProvider({
      providerId,
      status,
      rejectionReason,
    });

    if (res.success) {
      revalidatePath("/admin");
      revalidatePath("/admin/verification");
      revalidatePath("/providers");
    }

    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Server Action: Update Category metadata or active toggle
 */
export async function updateCategoryAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const categoryId = formData.get("categoryId") as string;
    const name = (formData.get("name") as string) || undefined;
    const description = (formData.get("description") as string) || undefined;
    const isActive = formData.has("isActive")
      ? formData.get("isActive") === "true"
      : undefined;

    if (!categoryId) {
      return { success: false, error: "Category ID is required." };
    }

    const res = await updateCategory({
      categoryId,
      name,
      description,
      isActive,
    });

    if (res.success) {
      revalidatePath("/admin/catalog");
      revalidatePath("/");
    }

    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Server Action: Create a new service under a category
 */
export async function createServiceAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const categoryId = formData.get("categoryId") as string;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const basePrice = parseFloat((formData.get("basePrice") as string) || "299");
    const estimatedDurationMinutes = parseInt(
      (formData.get("estimatedDurationMinutes") as string) || "60",
      10
    );

    if (!categoryId || !name || isNaN(basePrice)) {
      return { success: false, error: "Service name, category, and valid price are required." };
    }

    const res = await createService({
      categoryId,
      name,
      description,
      basePrice,
      estimatedDurationMinutes,
    });

    if (res.success) {
      revalidatePath("/admin/catalog");
    }

    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Server Action: Update existing service price, duration, or active status
 */
export async function updateServiceAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const serviceId = formData.get("serviceId") as string;
    const name = (formData.get("name") as string) || undefined;
    const description = (formData.get("description") as string) || undefined;
    const basePriceStr = formData.get("basePrice") as string;
    const basePrice = basePriceStr ? parseFloat(basePriceStr) : undefined;
    const durationStr = formData.get("estimatedDurationMinutes") as string;
    const estimatedDurationMinutes = durationStr ? parseInt(durationStr, 10) : undefined;
    const isActive = formData.has("isActive")
      ? formData.get("isActive") === "true"
      : undefined;

    if (!serviceId) {
      return { success: false, error: "Service ID is required." };
    }

    const res = await updateService({
      serviceId,
      name,
      description,
      basePrice,
      estimatedDurationMinutes,
      isActive,
    });

    if (res.success) {
      revalidatePath("/admin/catalog");
    }

    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Server Action: Handle Booking Dispute, Cancellation, or Refund
 */
export async function resolveBookingDisputeAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const bookingId = formData.get("bookingId") as string;
    const action = formData.get("action") as "REFUND" | "CANCEL" | "RESOLVE";
    const notes = (formData.get("notes") as string) || "Resolved by admin";

    if (!bookingId || !action) {
      return { success: false, error: "Booking ID and resolution action are required." };
    }

    const res = await resolveBookingDispute({
      bookingId,
      action,
      notes,
    });

    if (res.success) {
      revalidatePath("/admin");
      revalidatePath("/admin/bookings");
      revalidatePath(`/bookings/${bookingId}`);
    }

    return res;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Server Action: Update Platform Marketplace Settings (Commission & GST)
 */
export async function updatePlatformSettingsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminSession();

    const commissionPercentage = parseFloat(
      (formData.get("commissionPercentage") as string) || "15.0"
    );
    const gstPercentage = parseFloat((formData.get("gstPercentage") as string) || "18.0");
    const defaultCoverageRadiusKm = parseFloat(
      (formData.get("defaultCoverageRadiusKm") as string) || "15.0"
    );
    const autoApprovePayouts = formData.get("autoApprovePayouts") === "true";
    const supportEmail = (formData.get("supportEmail") as string) || undefined;
    const supportPhone = (formData.get("supportPhone") as string) || undefined;

    const res = await updateAdminSettings({
      commissionPercentage,
      gstPercentage,
      defaultCoverageRadiusKm,
      autoApprovePayouts,
      supportEmail,
      supportPhone,
    });

    if (res.success) {
      revalidatePath("/admin/settings");
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
