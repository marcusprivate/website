import { test, expect } from './fixtures';

test.describe('Business facts and responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('treatment duration and price remain accurate', async ({ page }) => {
    await expect(page.locator('#mijn-aanpak')).toContainText('ruim een uur');
    await expect(page.locator('#mijn-aanpak')).toContainText('1,5 à 2 uur');
    await expect(page.locator('#mijn-aanpak')).toContainText('€ 80,00');
  });

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'mobile', width: 375, height: 667 },
  ]) {
    test(`page has no horizontal overflow on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }
});
