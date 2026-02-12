import { test, expect } from '@playwright/test';

test('landing page loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hilfe von Nebenan/);

    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
});

test('navigation to pricing works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Preise');
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('h2')).toContainText('Preise & Modelle');
});

test('login page accessibility', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
});
