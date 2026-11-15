import { test, expect } from '@playwright/test';

test.describe('Customer Discovery & Booking Journey', () => {
  test('should display home page with Noida hero and category listings', async ({ page }) => {
    await page.goto('/');

    // Check header and hero title
    await expect(page).toHaveTitle(/LocConnect/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Noida/i);

    // Verify category cards are visible
    await expect(page.getByText('Plumber')).toBeVisible();
    await expect(page.getByText('Electrician')).toBeVisible();
    await expect(page.getByText('Cleaner')).toBeVisible();
  });

  test('should navigate to category search page and display verified providers', async ({ page }) => {
    await page.goto('/services/plumber/noida');

    // Page title and category heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Plumber/i);

    // Provider listing check (e.g., Ramesh Verma)
    const providerCard = page.getByText(/Ramesh Verma/i).first();
    await expect(providerCard).toBeVisible();

    // Verify verified badge
    await expect(page.getByText(/Verified/i).first()).toBeVisible();
  });

  test('should navigate to provider profile and view services', async ({ page }) => {
    // Navigate to Ramesh Verma's profile
    await page.goto('/providers/prov_ramesh_verma');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Ramesh Verma/i);
    await expect(page.getByText(/Master Plumber/i)).toBeVisible();
    await expect(page.getByText(/Sector 18, Noida/i)).toBeVisible();

    // Check service offerings and book action
    const bookButton = page.getByRole('link', { name: /Book/i }).first();
    await expect(bookButton).toBeVisible();
  });

  test('should render checkout page for a selected service', async ({ page }) => {
    await page.goto('/checkout/srv_tap_repair');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Checkout/i);
    await expect(page.getByText(/Tap Repair & Installation/i)).toBeVisible();

    // Verify financial breakdown is present
    await expect(page.getByText(/Platform Fee/i)).toBeVisible();
    await expect(page.getByText(/GST/i)).toBeVisible();
  });

  test('should view booking status tracker and chat component', async ({ page }) => {
    await page.goto('/bookings/bk_demo_completed_01');

    await expect(page.getByText(/Booking Details/i)).toBeVisible();
    await expect(page.getByText(/bk_demo_completed_01/i)).toBeVisible();

    // Verify messaging / chat is available
    await expect(page.getByText(/Direct Message/i)).toBeVisible();
  });
});
