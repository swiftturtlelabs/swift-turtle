import { test, expect } from '@playwright/test';

test.describe('Multi-device sync', () => {
  test.skip(!process.env.COUPLEGAMES_SYNC_TEST, 'Set COUPLEGAMES_SYNC_TEST=1 to run Firestore sync tests');

  test('two contexts share session state', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    // Host creates game
    await page1.getByRole('button', { name: /Start a game/i }).click();
    await page1.getByRole('button', { name: /Continue/i }).click();

    const codeEl = page1.locator('.tracking-\\[0\\.3em\\]');
    await expect(codeEl).toBeVisible();
    const code = await codeEl.textContent();

    // Partner joins
    await page2.getByRole('button', { name: /Join with code/i }).click();
    await page2.fill('input[placeholder="ABCD"]', code.trim());
    await page2.getByRole('button', { name: /Player 2/i }).click();
    await page2.getByRole('button', { name: /^Join$/i }).click();

    await expect(page2.getByText(code.trim())).toBeVisible({ timeout: 10000 });
  });
});
