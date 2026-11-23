import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateResetToken,
} from "./auth-crypto";

describe("Authentication Crypto & Password Security Unit Tests", () => {
  it("enforces password strength requirements", () => {
    // Too short
    expect(validatePasswordStrength("Short1!").isValid).toBe(false);
    // Missing uppercase
    expect(validatePasswordStrength("lowercase123!").isValid).toBe(false);
    // Missing lowercase
    expect(validatePasswordStrength("UPPERCASE123!").isValid).toBe(false);
    // Missing number
    expect(validatePasswordStrength("NoNumberPassword!").isValid).toBe(false);
    // Valid strong password
    expect(validatePasswordStrength("NoidaService#2026").isValid).toBe(true);
  });

  it("hashes password with salt and successfully verifies identical password", () => {
    const password = "StrongSecret#99";
    const hash = hashPassword(password);

    expect(hash).toContain(":");
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("rejects incorrect password against stored hash", () => {
    const password = "CorrectPassword#1";
    const hash = hashPassword(password);

    expect(verifyPassword("WrongPassword#1", hash)).toBe(false);
  });

  it("generates a 64-hex-character secure reset token valid for 1 hour", () => {
    const { token, expiry } = generateResetToken();
    expect(token).toHaveLength(64);
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
    expect(expiry.getTime()).toBeLessThanOrEqual(Date.now() + 60 * 60 * 1000 + 1000);
  });
});
