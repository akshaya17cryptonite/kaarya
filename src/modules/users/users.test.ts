import { describe, it, expect } from "vitest";
import {
  getUserAddresses,
  createUserAddress,
  setDefaultUserAddress,
  deleteUserAddress,
  updateCustomerProfile,
} from "./service";

describe("Users & Customer Profile Domain Unit Tests", () => {
  const testUserId = "user_customer_rohit";

  it("retrieves addresses for a customer with default addresses fallback", async () => {
    const addresses = await getUserAddresses(testUserId);
    expect(addresses).toBeDefined();
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses[0].streetAddress).toBeDefined();
    expect(addresses[0].city).toBe("Noida");
  });

  it("creates a new customer address safely", async () => {
    const res = await createUserAddress(testUserId, {
      label: "Home",
      streetAddress: "Flat 1004, Supertech Cape Town, Sector 74",
      landmark: "Near North Eye Tower",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201301",
      isDefault: true,
    });

    expect(res.success).toBe(true);
    expect(res.address).toBeDefined();
    expect(res.address?.city).toBe("Noida");
    expect(res.address?.isDefault).toBe(true);
  });

  it("sets an address as default safely", async () => {
    const res = await setDefaultUserAddress(testUserId, "addr_rohit_office");
    expect(res.success).toBe(true);
  });

  it("deletes a customer address safely", async () => {
    const res = await deleteUserAddress(testUserId, "addr_rohit_office");
    expect(res.success).toBe(true);
  });

  it("updates customer profile name and email safely", async () => {
    const res = await updateCustomerProfile(testUserId, {
      name: "Rohit Mehta",
      email: "rohit.mehta@example.com",
    });

    expect(res.success).toBe(true);
    expect(res.user?.name).toBe("Rohit Mehta");
    expect(res.user?.email).toBe("rohit.mehta@example.com");
  });
});
