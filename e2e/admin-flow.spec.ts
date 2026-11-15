import { test, expect } from '@playwright/test';

test.describe('Admin Control Tower', () => {
  test('should display platform analytics and overview', async ({ page }) => {
    // Set authenticated admin session cookie
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_admin_01',
          phone: '+919876543299',
          role: 'ADMIN',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Admin Operations Tower/i);

    // Platform KPIs
    await expect(page.getByText(/Total GMV/i)).toBeVisible();
    await expect(page.getByText(/Active Partners/i)).toBeVisible();
    await expect(page.getByText(/Pending Verifications/i)).toBeVisible();
  });

  test('should view KYC partner verification queue', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_admin_01',
          phone: '+919876543299',
          role: 'ADMIN',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/verification');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Partner Verification Queue/i);
    await expect(page.getByText(/KYC Document Review/i)).toBeVisible();
  });

  test('should view bookings and dispute arbitrator', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_admin_01',
          phone: '+919876543299',
          role: 'ADMIN',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/bookings');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Bookings & Disputes/i);
    await expect(page.getByText(/Filter Status/i)).toBeVisible();
  });

  test('should view catalog management', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_admin_01',
          phone: '+919876543299',
          role: 'ADMIN',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/catalog');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Catalog & Pricing/i);
    await expect(page.getByText(/Plumbing Services/i)).toBeVisible();
    await expect(page.getByText(/Electrical Services/i)).toBeVisible();
    await expect(page.getByText(/Home Cleaning/i)).toBeVisible();
  });
});
