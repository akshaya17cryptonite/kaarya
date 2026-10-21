import { describe, it, expect } from "vitest";
import {
  normalizePhoneNumber,
  isAuthorizedForPath,
  MOCK_OTP_CODE,
} from "./service";

describe("Auth Module Unit Tests", () => {
  describe("normalizePhoneNumber", () => {
    it("formats 10-digit Indian numbers with +91 prefix", () => {
      expect(normalizePhoneNumber("9811122233")).toBe("+919811122233");
      expect(normalizePhoneNumber("981-112-2233")).toBe("+919811122233");
      expect(normalizePhoneNumber("981 112 2233")).toBe("+919811122233");
    });

    it("handles numbers already starting with 91 or +91", () => {
      expect(normalizePhoneNumber("919811122233")).toBe("+919811122233");
      expect(normalizePhoneNumber("+919811122233")).toBe("+919811122233");
    });
  });

  describe("Role-Based Access Control (isAuthorizedForPath)", () => {
    it("allows ADMIN to access all portals", () => {
      expect(isAuthorizedForPath("ADMIN", "/admin")).toBe(true);
      expect(isAuthorizedForPath("ADMIN", "/admin/verifications")).toBe(true);
      expect(isAuthorizedForPath("ADMIN", "/provider")).toBe(true);
      expect(isAuthorizedForPath("ADMIN", "/account")).toBe(true);
    });

    it("restricts CUSTOMER from accessing admin and provider portals", () => {
      expect(isAuthorizedForPath("CUSTOMER", "/admin")).toBe(false);
      expect(isAuthorizedForPath("CUSTOMER", "/admin/disputes")).toBe(false);
      expect(isAuthorizedForPath("CUSTOMER", "/provider")).toBe(false);
      expect(isAuthorizedForPath("CUSTOMER", "/account")).toBe(true);
      expect(isAuthorizedForPath("CUSTOMER", "/bookings/123")).toBe(true);
    });

    it("allows PROVIDER to access provider portal and customer view, but not admin", () => {
      expect(isAuthorizedForPath("PROVIDER", "/provider")).toBe(true);
      expect(isAuthorizedForPath("PROVIDER", "/provider/jobs")).toBe(true);
      expect(isAuthorizedForPath("PROVIDER", "/admin")).toBe(false);
      expect(isAuthorizedForPath("PROVIDER", "/account")).toBe(true);
    });
  });

  describe("Mock OTP Configuration", () => {
    it("uses standard 6-digit mock OTP code", () => {
      expect(MOCK_OTP_CODE).toBe("123456");
      expect(MOCK_OTP_CODE).toHaveLength(6);
    });
  });
});
