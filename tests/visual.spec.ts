import { test, expect, gotoWithSeededRandom, waitForPageReady, CONFIG } from './fixtures';

test.describe('Visual Regression', () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
    'Visual tests only on Chromium desktop'
  );

  test.describe('Full Page', () => {
    test('desktop', async ({ page, desktop }) => {
      await gotoWithSeededRandom(page, '/');
      await page.waitForSelector('.testimonial');
      await waitForPageReady(page);

      await expect(page).toHaveScreenshot('full-page-desktop.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });

    test('mobile', async ({ page }) => {
      await page.setViewportSize(CONFIG.viewports.mobile);
      await gotoWithSeededRandom(page, '/');
      await page.waitForSelector('.testimonial');
      await waitForPageReady(page);

      await expect(page).toHaveScreenshot('full-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });
  });

  test.describe('Sections - Desktop', () => {
    test.beforeEach(async ({ page, desktop }) => {
      await gotoWithSeededRandom(page, '/');
      await page.waitForSelector('.testimonial');
      await waitForPageReady(page);
    });

    const sections = [
      { id: '#welkom', name: 'welkom' },
      { id: '#wat-is-healing', name: 'wat-is-healing' },
      { id: '#mijn-aanpak', name: 'mijn-aanpak' },
      { id: '#wie-ben-ik', name: 'wie-ben-ik' },
      { id: '#reviews', name: 'reviews' },
      { id: '#contact', name: 'contact' },
    ];

    for (const section of sections) {
      test(`${section.name}`, async ({ page }) => {
        await expect(page.locator(section.id)).toHaveScreenshot(`section-${section.name}-desktop.png`, {
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Sections - Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(CONFIG.viewports.mobile);
      await gotoWithSeededRandom(page, '/');
      await page.waitForSelector('.testimonial');
      await waitForPageReady(page);
    });

    const sections = ['#welkom', '#reviews', '#contact'];

    for (const id of sections) {
      test(`${id.slice(1)}`, async ({ page }) => {
        await expect(page.locator(id)).toHaveScreenshot(`section-${id.slice(1)}-mobile.png`, {
          animations: 'disabled',
        });
      });
    }
  });

  test.describe('Navigation', () => {
    test('desktop bar', async ({ page, desktop }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.locator('nav')).toHaveScreenshot('nav-desktop.png', { animations: 'disabled' });
    });

    test('mobile closed', async ({ page }) => {
      await page.setViewportSize(CONFIG.viewports.mobile);
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.locator('nav')).toHaveScreenshot('nav-mobile-closed.png', { animations: 'disabled' });
    });

    test('mobile open', async ({ page, navigation }) => {
      await page.setViewportSize(CONFIG.viewports.mobile);
      await page.goto('/');
      await waitForPageReady(page);
      await navigation.openMobileMenu();
      await page.waitForTimeout(CONFIG.timing.animationSettle);
      await expect(page.locator('nav')).toHaveScreenshot('nav-mobile-open.png', { animations: 'disabled' });
    });
  });

  test.describe('Components', () => {
    test('slideshow', async ({ page, desktop }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.locator('.slideshow-container')).toHaveScreenshot('slideshow.png', { animations: 'disabled' });
    });

    test('testimonial controls', async ({ page, desktop }) => {
      await gotoWithSeededRandom(page, '/');
      await page.waitForSelector('.testimonial');
      await expect(page.locator('.testimonial-controls')).toHaveScreenshot('testimonial-controls.png', { animations: 'disabled' });
    });

    test('logo', async ({ page, desktop }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await expect(page.locator('#welkom img[alt="Top Banner"]')).toHaveScreenshot('logo.png', { animations: 'disabled' });
    });
  });
});
