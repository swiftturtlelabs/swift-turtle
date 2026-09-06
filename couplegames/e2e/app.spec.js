import { test, expect } from '@playwright/test';

// Starting the game takes two clicks: the start button opens the prize confirmation prompt
async function startGame(page) {
  await page.getByRole('button', { name: /LET THE GAMES BEGIN!/i }).click();
  await page.getByRole('button', { name: /Yes, let's go!/i }).click();
}

test.describe('Couple\'s Challenge App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (baseURL is set in playwright.config.js)
    await page.goto('/');
    // Wait for React to hydrate
    await page.waitForLoadState('networkidle');
  });

  test('should display intro screen with title and instructions', async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForSelector('text=Couple\'s Challenge', { timeout: 10000 });
    // Check for main title
    await expect(page.getByText("Couple's Challenge")).toBeVisible();
    
    // Check for phase descriptions
    await expect(page.getByText(/1st Half: At Home/i)).toBeVisible();
    await expect(page.getByText(/2nd Half: Out on the Town/i)).toBeVisible();
    
    // Check for start button
    await expect(page.getByRole('button', { name: /LET THE GAMES BEGIN!/i })).toBeVisible();
  });

  test('should start game when button is clicked', async ({ page }) => {
    // Click start button
    await startGame(page);
    
    // Should navigate to first game
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    await expect(page.getByText('Perfect Cut')).toBeVisible();
  });

  test('should display score display with both players', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Wait for game screen
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    
    // Check for player names and scores
    await expect(page.getByText('Kenny')).toBeVisible();
    await expect(page.getByText('Katie')).toBeVisible();
    
    // Check initial scores are 0
    const scores = page.locator('text=/^0$/').filter({ hasText: '0' });
    await expect(scores.first()).toBeVisible();
  });

  test('should advance to next game when winner is selected', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Wait for first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    
    // Select Kenny as winner
    await page.getByRole('button', { name: /Kenny Won/i }).click();
    
    // Should advance to second game (Gram Master)
    await expect(page.getByText('The Gram Master')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Game 2 of 10/i)).toBeVisible();
  });

  test('should update score when player wins', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Wait for first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    
    // Get initial score (should be 0)
    const initialScore = page.locator('text=/^0$/').first();
    await expect(initialScore).toBeVisible();
    
    // Select Kenny as winner
    await page.getByRole('button', { name: /Kenny Won/i }).click();
    
    // Wait for score to update (should see 1 for Kenny)
    await expect(page.locator('text=/^1$/').first()).toBeVisible({ timeout: 3000 });
  });

  test('should show back button after first game', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Complete first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    await page.getByRole('button', { name: /Kenny Won/i }).click();
    
    // Wait for second game
    await expect(page.getByText('The Gram Master')).toBeVisible({ timeout: 3000 });
    
    // Back button should be visible
    await expect(page.getByRole('button', { name: /← Back/i })).toBeVisible();
  });

  test('should go back to previous game when back button is clicked', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Complete first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    await page.getByRole('button', { name: /Kenny Won/i }).click();
    
    // Wait for second game
    await expect(page.getByText('The Gram Master')).toBeVisible({ timeout: 3000 });
    
    // Click back button
    await page.getByRole('button', { name: /← Back/i }).click();
    
    // Should be back on first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
  });

  test('should display Gram Master challenge with rounds', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Complete first game
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    await page.getByRole('button', { name: /Kenny Won/i }).click();
    
    // Wait for Gram Master
    await expect(page.getByText('The Gram Master')).toBeVisible({ timeout: 3000 });
    
    // Should show round buttons (not overall winner buttons)
    await expect(page.getByRole('button', { name: /Kenny Won This Round/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Katie Won This Round/i })).toBeVisible();
    
    // Should show round scoreboard
    await expect(page.getByText(/Round Scoreboard/i)).toBeVisible();
  });

  test('should show progress bar', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Wait for game screen
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    
    // Progress bar should be visible
    const progressBar = page.locator('.bg-blue-500');
    await expect(progressBar).toBeVisible();
  });

  test('should show transition page after 5th game', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Complete first 5 games
    for (let i = 0; i < 5; i++) {
      await expect(page.getByText(/Game \d+ of 10/i)).toBeVisible();
      await page.getByRole('button', { name: /Kenny Won/i }).first().click();
      // Wait a bit for transition
      await page.waitForTimeout(600);
    }
    
    // Should show transition page
    await expect(page.getByText(/1st Half Complete!/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Continue to 2nd Half/i)).toBeVisible();
  });

  test('should display final results after all games', async ({ page }) => {
    // Start the game
    await startGame(page);
    
    // Complete all 10 games (this will take a while)
    for (let i = 0; i < 10; i++) {
      // Check if we're on transition page
      const isTransition = await page.getByText(/1st Half Complete!/i).isVisible().catch(() => false);
      if (isTransition) {
        await page.getByRole('button', { name: /Continue to 2nd Half/i }).click();
        await page.waitForTimeout(600);
      }
      
      // Check if we're on Gram Master (needs special handling)
      const isGramMaster = await page.getByText('The Gram Master').isVisible().catch(() => false);
      if (isGramMaster) {
        // Complete 3 rounds for Gram Master
        for (let round = 0; round < 3; round++) {
          await page.getByRole('button', { name: /Kenny Won This Round/i }).click();
          await page.waitForTimeout(600);
        }
      } else {
        // Normal game - just click winner
        await page.getByRole('button', { name: /Kenny Won/i }).first().click();
        await page.waitForTimeout(600);
      }
    }
    
    // Should show final results
    await expect(page.getByText(/Final Results/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Game Summary/i)).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Start the game
    await startGame(page);
    
    // Check that content is visible and properly sized
    await expect(page.getByText(/Game 1 of 10/i)).toBeVisible();
    await expect(page.getByText('Perfect Cut')).toBeVisible();
    
    // Check that buttons are accessible
    await expect(page.getByRole('button', { name: /Kenny Won/i })).toBeVisible();
  });
});
