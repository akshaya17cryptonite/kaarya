import { describe, it, expect } from "vitest";
import {
  getAdminDashboardStats,
  getAdminProviders,
  verifyProvider,
  resolveBookingDispute,
  getAdminSettings,
  updateAdminSettings,
  getAdminCatalog,
  updateCategory,
} from "./service";
import { ProviderVerificationStatus } from "@prisma/client";

describe("Admin Domain Unit Tests", () => {
  describe("Platform Telemetry & KPI Analytics", () => {
    it("returns platform analytics with GMV, revenue, and counts", async () => {
      const stats = await getAdminDashboardStats();

      expect(stats).toBeDefined();
      expect(stats.totalBookings).toBeGreaterThan(0);
      expect(stats.totalProviders).toBeGreaterThan(0);
      expect(stats.grossMerchandiseValue).toBeGreaterThan(0);
      expect(stats.platformNetRevenue).toBeGreaterThan(0);
      expect(stats.categoryRevenueBreakdown.length).toBeGreaterThan(0);
    });

    it("verifies 15% platform commission proportion in revenue", async () => {
      const stats = await getAdminDashboardStats();
      expect(stats.platformNetRevenue).toBeLessThan(stats.grossMerchandiseValue);
      // Roughly 15% of GMV
      const ratio = stats.platformNetRevenue / stats.grossMerchandiseValue;
      expect(ratio).toBeGreaterThan(0.1);
      expect(ratio).toBeLessThan(0.2);
    });
  });

  describe("Provider KYC Verification Queue", () => {
    it("fetches providers and includes KYC documents", async () => {
      const providers = await getAdminProviders();
      expect(providers.length).toBeGreaterThan(0);

      const p = providers[0];
      expect(p.name).toBeDefined();
      expect(p.phone).toBeDefined();
      expect(p.kycDocuments.length).toBeGreaterThan(0);
      expect(p.kycDocuments[0].documentType).toBeDefined();
    });

    it("filters providers by verification status", async () => {
      const pending = await getAdminProviders(ProviderVerificationStatus.PENDING);
      pending.forEach((p) => {
        expect(p.verificationStatus).toBe(ProviderVerificationStatus.PENDING);
      });
    });

    it("executes verification approval and rejection safely", async () => {
      const approveRes = await verifyProvider({
        providerId: "p5",
        status: ProviderVerificationStatus.VERIFIED,
      });
      expect(approveRes.success).toBe(true);

      const rejectRes = await verifyProvider({
        providerId: "p5",
        status: ProviderVerificationStatus.REJECTED,
        rejectionReason: "Aadhaar image blurry",
      });
      expect(rejectRes.success).toBe(true);
    });
  });

  describe("Dispute & Refund Resolution", () => {
    it("executes dispute refund and cancellation actions safely", async () => {
      const refundRes = await resolveBookingDispute({
        bookingId: "bk_seed_001",
        action: "REFUND",
        notes: "Customer cancel request within 15 minutes of booking",
      });
      expect(refundRes.success).toBe(true);

      const resolveRes = await resolveBookingDispute({
        bookingId: "bk_seed_001",
        action: "RESOLVE",
        notes: "Both customer and provider confirmed service resolution",
      });
      expect(resolveRes.success).toBe(true);
    });
  });

  describe("Catalog Management", () => {
    it("retrieves catalog with categories and services", async () => {
      const catalog = await getAdminCatalog();
      expect(catalog.length).toBeGreaterThan(0);
      expect(catalog[0].services.length).toBeGreaterThan(0);
    });

    it("updates category metadata safely", async () => {
      const res = await updateCategory({
        categoryId: "cat_plumbing",
        name: "Plumbing Services (Updated)",
        isActive: true,
      });
      expect(res.success).toBe(true);
    });
  });

  describe("Platform Settings & Commission Rates", () => {
    it("retrieves and updates commission rates and GST rules", async () => {
      const initial = await getAdminSettings();
      expect(initial.commissionPercentage).toBe(15.0);
      expect(initial.gstPercentage).toBe(18.0);

      const updated = await updateAdminSettings({
        commissionPercentage: 16.0,
      });
      expect(updated.success).toBe(true);
      expect(updated.settings.commissionPercentage).toBe(16.0);

      // Revert back
      await updateAdminSettings({ commissionPercentage: 15.0 });
    });
  });
});
