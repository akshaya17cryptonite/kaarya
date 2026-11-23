"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  sendOtp,
  verifyOtpAndAuthenticate,
  destroySession,
  registerWithPassword,
  loginWithPassword,
  requestPasswordReset,
  resetPasswordWithToken,
  AUTH_COOKIE_NAME,
  SessionUser,
} from "./service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Server Action: Sends OTP to phone
 */
export async function sendOtpAction(formData: FormData) {
  const phone = formData.get("phone") as string;
  if (!phone || phone.trim().length < 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }

  const result = await sendOtp(phone);
  return result;
}

/**
 * Server Action: Verifies OTP and redirects user based on assigned role
 */
export async function verifyOtpAction(formData: FormData) {
  const phone = formData.get("phone") as string;
  const otp = formData.get("otp") as string;
  const role = (formData.get("role") as UserRole) || "CUSTOMER";
  const name = (formData.get("name") as string) || undefined;
  const redirectTo = (formData.get("redirectTo") as string) || undefined;

  if (!phone || !otp) {
    redirect(`/verify-otp?phone=${encodeURIComponent(phone || "")}&role=${role}&error=${encodeURIComponent("Phone number and OTP are required.")}`);
  }

  const result = await verifyOtpAndAuthenticate({
    phone,
    otp,
    role,
    name,
  });

  if (!result.success || !result.user) {
    const errorMsg = result.error || "Authentication failed.";
    redirect(`/verify-otp?phone=${encodeURIComponent(phone)}&role=${role}&error=${encodeURIComponent(errorMsg)}`);
  }

  revalidatePath("/", "layout");

  // Determine redirection path based on role or explicit redirectTo param
  let destination = "/";
  if (redirectTo && redirectTo.startsWith("/")) {
    destination = redirectTo;
  } else if (result.user.role === "ADMIN") {
    destination = "/admin";
  } else if (result.user.role === "PROVIDER") {
    destination = "/provider";
  }

  redirect(destination);
}

/**
 * Server Action: One-click fast dev login to seed accounts
 */
export async function loginWithMockAccountAction(targetRole: UserRole) {
  let targetPhone = "+919811122233"; // Rohit Mehta (Customer)
  if (targetRole === "PROVIDER") {
    targetPhone = "+919810111222"; // Ramesh Verma (Plumber)
  } else if (targetRole === "ADMIN") {
    targetPhone = "+919999900000"; // Admin
  }

  const user = await prisma.user.findUnique({
    where: { phone: targetPhone },
    include: { profile: true },
  });

  if (!user) {
    // If not seeded yet, authenticate directly
    await verifyOtpAndAuthenticate({
      phone: targetPhone,
      otp: "123456",
      role: targetRole,
    });
  } else {
    const sessionUser: SessionUser = {
      id: user.id,
      authId: user.authId,
      phone: user.phone,
      email: user.email,
      role: user.role,
      name: user.profile?.name ?? "User",
      avatarUrl: user.profile?.avatarUrl ?? null,
    };

    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  revalidatePath("/", "layout");

  if (targetRole === "ADMIN") {
    redirect("/admin");
  } else if (targetRole === "PROVIDER") {
    redirect("/provider");
  } else {
    redirect("/");
  }
}

/**
 * Server Action: Logs user out and clears session
 */
export async function signOutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Server Action: Registers user with password
 */
export async function registerWithPasswordAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) || "CUSTOMER";
  const redirectTo = (formData.get("redirectTo") as string) || "";

  const result = await registerWithPassword({
    name,
    phone,
    email: email || undefined,
    password,
    role,
  });

  if (!result.success || !result.user) {
    const errorMsg = result.error || "Registration failed.";
    redirect(
      `/register?role=${role}&error=${encodeURIComponent(errorMsg)}&name=${encodeURIComponent(name || "")}&phone=${encodeURIComponent(phone || "")}&email=${encodeURIComponent(email || "")}`
    );
  }

  revalidatePath("/", "layout");

  if (redirectTo && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  } else if (result.user.role === "PROVIDER") {
    redirect("/provider");
  } else if (result.user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/account");
  }
}

/**
 * Server Action: Logs in user with identifier and password
 */
export async function loginWithPasswordAction(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "";
  const role = (formData.get("role") as string) || "CUSTOMER";

  const result = await loginWithPassword({
    identifier,
    password,
  });

  if (!result.success || !result.user) {
    const errorMsg = result.error || "Login failed.";
    redirect(
      `/login?role=${role}&error=${encodeURIComponent(errorMsg)}&identifier=${encodeURIComponent(identifier || "")}`
    );
  }

  revalidatePath("/", "layout");

  if (redirectTo && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  } else if (result.user.role === "PROVIDER") {
    redirect("/provider");
  } else if (result.user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/");
  }
}

/**
 * Server Action: Requests password reset link/token
 */
export async function forgotPasswordAction(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const result = await requestPasswordReset(identifier);

  redirect(
    `/forgot-password?message=${encodeURIComponent(result.message)}&token=${encodeURIComponent(result.resetToken || "")}`
  );
}

/**
 * Server Action: Resets password with valid token
 */
export async function resetPasswordAction(formData: FormData) {
  const token = (formData.get("token") as string)?.trim();
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Passwords do not match.")}`
    );
  }

  const result = await resetPasswordWithToken(token, newPassword);
  if (!result.success) {
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error || "Password reset failed.")}`
    );
  }

  redirect(
    `/login?message=${encodeURIComponent("Password reset successfully. You can now log in with your new password.")}`
  );
}
