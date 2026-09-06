import { test, expect } from '@playwright/test';

/**
 * Production E2E Tests
 * 
 * These tests run against the live production site.
 * Set PLAYWRIGHT_TEST_BASE_URL=https://swift-turtle.com to run against production.
 * 
 * Usage:
 *   PLAYWRIGHT_TEST_BASE_URL=https://swift-turtle.com npm run test:e2e -- e2e/production.spec.js
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://swift-turtle.com';

test.describe('Production Site E2E Tests', () => {
  test('should load the production site', async ({ page }) => {
    await page.goto(`${baseURL}/couplegames/`);
    
    // Check that the page loads (wait for React to hydrate)
    await page.waitForLoadState('networkidle');
    await expect(page.getByText("Couple's Challenge")).toBeVisible({ timeout: 10000 });
  });

  test('should have all assets loading correctly', async ({ page }) => {
    const response = await page.goto(`${baseURL}/couplegames/`);
    expect(response?.status()).toBe(200);
    
    // Check that CSS is loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
  });

  test('should be accessible and functional on production', async ({ page }) => {
    await page.goto(`${baseURL}/couplegames/`);
    
    // Start the game (confirm the prize prompt first)
    await page.getByRole('button', { name: /LET THE GAMES BEGIN!/i }).click();
    await page.getByRole('button', { name: /Yes, let's go!/i }).click();
    
    // Verify first game loads
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible({ timeout: 10000 });
  });
});
