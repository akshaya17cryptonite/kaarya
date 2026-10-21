import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDistance,
  slugify,
  getInitials,
} from "./utils";

describe("Utility functions", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500", { "font-bold": true, "hidden": false });
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("font-bold");
      expect(result).not.toContain("hidden");
    });

    it("handles Tailwind conflicts properly", () => {
      const result = cn("p-4", "p-2");
      expect(result).toBe("p-2");
    });
  });

  describe("formatCurrency", () => {
    it("formats Indian rupees correctly", () => {
      const formatted = formatCurrency(499);
      // Clean non-breaking spaces if any from Intl formatting
      expect(formatted).toMatch(/₹\s?499/);
    });

    it("formats thousands with comma separation", () => {
      const formatted = formatCurrency(12500);
      expect(formatted).toMatch(/₹\s?12,500/);
    });
  });

  describe("formatDistance", () => {
    it("formats sub-kilometer distance in meters", () => {
      expect(formatDistance(0.45)).toBe("450 m");
    });

    it("formats distances >= 1 km with one decimal place", () => {
      expect(formatDistance(3.74)).toBe("3.7 km");
    });
  });

  describe("slugify", () => {
    it("converts strings to URL safe slugs", () => {
      expect(slugify("Plumbing & Pipe Repair")).toBe("plumbing-pipe-repair");
      expect(slugify("AC Service in Noida Sector 62!")).toBe("ac-service-in-noida-sector-62");
    });
  });

  describe("getInitials", () => {
    it("extracts two initials from a full name", () => {
      expect(getInitials("Amit Kumar")).toBe("AK");
    });

    it("handles single-word names", () => {
      expect(getInitials("Suresh")).toBe("SU");
    });

    it("handles empty or null gracefully", () => {
      expect(getInitials(null)).toBe("U");
      expect(getInitials("")).toBe("U");
    });
  });
});
