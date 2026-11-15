import { test, expect } from '@playwright/test';

test.describe('Provider Operations Suite', () => {
  test('should display provider dashboard and operational metrics', async ({ page }) => {
    // Set authenticated provider session cookie
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_prov_ramesh',
          phone: '+919876543211',
          role: 'PROVIDER',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/provider');

    // Dashboard heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Partner Dashboard/i);

    // KPI cards
    await expect(page.getByText(/Total Completed/i)).toBeVisible();
    await expect(page.getByText(/Net Earnings/i)).toBeVisible();
    await expect(page.getByText(/Partner Rating/i)).toBeVisible();
  });

  test('should view job requests and active dispatches', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_prov_ramesh',
          phone: '+919876543211',
          role: 'PROVIDER',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/provider/jobs');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Job Dispatches/i);
    await expect(page.getByText(/Pending Dispatch Requests/i)).toBeVisible();
    await expect(page.getByText(/Active Jobs In Progress/i)).toBeVisible();
  });

  test('should view payout ledger with fee splits', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_prov_ramesh',
          phone: '+919876543211',
          role: 'PROVIDER',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/provider/payouts');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Earnings & Payouts/i);
    await expect(page.getByText(/Available Balance/i)).toBeVisible();
    await expect(page.getByText(/Escrow Held/i)).toBeVisible();
  });

  test('should view weekly availability schedule configuration', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'loc_connect_session',
        value: JSON.stringify({
          userId: 'user_prov_ramesh',
          phone: '+919876543211',
          role: 'PROVIDER',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/provider/availability');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Working Hours/i);
    await expect(page.getByText(/Monday/i)).toBeVisible();
    await expect(page.getByText(/Sunday/i)).toBeVisible();
  });
});
