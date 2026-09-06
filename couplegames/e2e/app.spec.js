import { test, expect } from '@playwright/test';

async function startLocalGame(page) {
  await page.getByRole('button', { name: /Play on one phone/i }).click();
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.getByRole('button', { name: /Yes, let's go!/i }).click();
}

test.describe('Couple\'s Challenge App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display landing screen', async ({ page }) => {
    await expect(page.getByText("Couple's Challenge")).toBeVisible();
    await expect(page.getByRole('button', { name: /Play on one phone/i })).toBeVisible();
  });

  test('should start local game through setup', async ({ page }) => {
    await startLocalGame(page);
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    await expect(page.getByText('Perfect Cut')).toBeVisible();
  });

  test('should display score display with both players', async ({ page }) => {
    await startLocalGame(page);
    await expect(page.getByText('Kenny')).toBeVisible();
    await expect(page.getByText('Katie')).toBeVisible();
  });

  test('should show progress bar', async ({ page }) => {
    await startLocalGame(page);
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    const progressBar = page.locator('.bg-\\[\\#c96a4d\\]').first();
    await expect(progressBar).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await startLocalGame(page);
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    await expect(page.getByText('Perfect Cut')).toBeVisible();
  });
});
