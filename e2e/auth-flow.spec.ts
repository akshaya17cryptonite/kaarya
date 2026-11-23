import { test, expect } from '@playwright/test';

test.describe('Authentication & User Management Journey', () => {
  test('should display registration page and customer registration form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Join LocConnect/i);
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Mobile Number/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('should switch between password and OTP login modes on login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('tab', { name: /Password/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Phone OTP/i })).toBeVisible();

    // Verify forgot password link
    const forgotLink = page.getByRole('link', { name: /Forgot Password/i });
    await expect(forgotLink).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Forgot Password/i);
    await expect(page.getByLabel(/Email or Mobile Number/i)).toBeVisible();
  });
});
