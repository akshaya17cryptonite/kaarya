/**
 * Auth Module
 * Handles session resolution, OTP verification, user registration, and RBAC guards.
 */

export * from "@/types";

export interface AuthSession {
  userId: string;
  phone: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  email?: string | null;
}
