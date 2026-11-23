import { describe, it, expect } from "vitest";
import {
  registerWithPassword,
  loginWithPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from "./service";

describe("Password Authentication & User Management Domain Unit Tests", () => {
  it("rejects registration with weak password", async () => {
    const res = await registerWithPassword({
      name: "Test User",
      phone: "+919988776655",
      email: "test@example.com",
      password: "weak",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("at least 8 characters");
  });

  it("registers a customer user with valid password and returns session user", async () => {
    const res = await registerWithPassword({
      name: "Aman Gupta",
      phone: "+919812345678",
      email: "aman.gupta@example.com",
      password: "StrongPass#2026",
      role: "CUSTOMER",
    });

    expect(res.success).toBe(true);
    expect(res.user).toBeDefined();
    expect(res.user?.name).toBe("Aman Gupta");
    expect(res.user?.role).toBe("CUSTOMER");
  });

  it("handles password login with correct credentials", async () => {
    const res = await loginWithPassword({
      identifier: "rohit.mehta@example.com",
      password: "Test@12345",
    });

    expect(res.success).toBe(true);
    expect(res.user).toBeDefined();
    expect(res.user?.name).toBe("Rohit Mehta");
  });

  it("generates a password reset token for valid user", async () => {
    const res = await requestPasswordReset("rohit.mehta@example.com");
    expect(res.success).toBe(true);
    expect(res.resetToken).toBeDefined();
  });

  it("resets password using valid token", async () => {
    const resetRes = await requestPasswordReset("rohit.mehta@example.com");
    const token = resetRes.resetToken || "dummy_token";

    const updateRes = await resetPasswordWithToken(token, "NewStrongPass#2026");
    expect(updateRes.success).toBe(true);
  });
});
