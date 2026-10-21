import { UserRole } from "@prisma/client";

export const AUTH_COOKIE_NAME = "loc_connect_session";
export const MOCK_OTP_CODE = "123456";

export interface SessionUser {
  id: string;
  authId: string;
  phone: string;
  email: string | null;
  role: UserRole;
  name: string;
  avatarUrl: string | null;
}

/**
 * Standardizes phone numbers to Indian E.164 format (+91XXXXXXXXXX)
 */
export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (input.startsWith("+")) {
    return input;
  }
  return `+91${digits.slice(-10)}`;
}

/**
 * Validates whether a role is authorized for a specific target path
 */
export function isAuthorizedForPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) {
    return role === "ADMIN";
  }
  if (pathname.startsWith("/provider")) {
    return role === "PROVIDER" || role === "ADMIN";
  }
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/checkout")
  ) {
    return true; // Any authenticated user can access their customer view
  }
  return true;
}
