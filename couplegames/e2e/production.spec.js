import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://swift-turtle.com';

test.describe('Production Site E2E Tests', () => {
  test('should load the production site', async ({ page }) => {
    await page.goto(`${baseURL}/couplegames/`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText("Couple's Challenge")).toBeVisible({ timeout: 10000 });
  });

  test('should have all assets loading correctly', async ({ page }) => {
    const response = await page.goto(`${baseURL}/couplegames/`);
    expect(response?.status()).toBe(200);
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
  });
});
