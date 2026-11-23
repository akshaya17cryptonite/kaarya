"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/modules/auth/service";
import {
  createUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  updateCustomerProfile,
} from "./service";

export async function addAddressAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to add an address." };
  }

  const label = (formData.get("label") as string) || "Home";
  const streetAddress = (formData.get("streetAddress") as string)?.trim();
  const landmark = (formData.get("landmark") as string)?.trim();
  const city = (formData.get("city") as string) || "Noida";
  const state = (formData.get("state") as string) || "Uttar Pradesh";
  const postalCode = (formData.get("postalCode") as string)?.trim() || "201301";
  const isDefault = formData.get("isDefault") === "on" || formData.get("isDefault") === "true";

  if (!streetAddress || streetAddress.length < 5) {
    return { success: false, error: "Please enter a valid street address (minimum 5 characters)." };
  }

  const res = await createUserAddress(session.id, {
    label,
    streetAddress,
    landmark,
    city,
    state,
    postalCode,
    isDefault,
  });

  if (res.success) {
    revalidatePath("/account");
    revalidatePath("/checkout/[serviceId]", "page");
  }

  return res;
}

export async function deleteAddressAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to manage addresses." };
  }

  const addressId = formData.get("addressId") as string;
  if (!addressId) {
    return { success: false, error: "Address ID is required." };
  }

  const res = await deleteUserAddress(session.id, addressId);
  if (res.success) {
    revalidatePath("/account");
    revalidatePath("/checkout/[serviceId]", "page");
  }
  return res;
}

export async function setDefaultAddressAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to manage addresses." };
  }

  const addressId = formData.get("addressId") as string;
  if (!addressId) {
    return { success: false, error: "Address ID is required." };
  }

  const res = await setDefaultUserAddress(session.id, addressId);
  if (res.success) {
    revalidatePath("/account");
    revalidatePath("/checkout/[serviceId]", "page");
  }
  return res;
}

export async function updateCustomerProfileAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to update your profile." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters long." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  const res = await updateCustomerProfile(session.id, { name, email });
  if (res.success) {
    revalidatePath("/account");
    revalidatePath("/", "layout");
  }

  return res;
}
