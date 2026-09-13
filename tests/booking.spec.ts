import { test, expect } from '@playwright/test';

test('booking popup loads available times and opens the customer step', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('#welkom .booking-button');
  await expect(link).toHaveAttribute('aria-haspopup', 'dialog');
  await link.click();
  const frame = page.frameLocator('iframe[title="Plan je healing"]');
  await expect(frame.getByText('Beschikbare tijdstippen', { exact: true })).toBeVisible({ timeout: 30000 });
  await frame.getByRole('link', { name: /^\d{2}:\d{2}$/ }).first().click();
  await expect(frame.getByRole('textbox').first()).toBeVisible();
  // Do not enter customer details or create an actual booking.
});

test('booking links still work when the widget script is blocked', async ({ page }) => {
  await page.route('https://widget.simplybook.it/**', route => route.abort());
  await page.goto('/');
  const link = page.locator('#welkom .booking-button');
  await expect(link).toHaveAttribute('href', 'https://irisabella.simplybook.it/v2/#book');
  await link.click();
  await expect(page).toHaveURL('https://irisabella.simplybook.it/v2/#book');
});
