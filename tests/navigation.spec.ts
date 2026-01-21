import { test, expect, NAV_LINKS, scrollPage } from './fixtures';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Desktop', () => {
    test('all nav links visible and scroll to sections', async ({ page, navigation, desktop }) => {
      await expect(navigation.menu).toBeVisible();

      for (const link of NAV_LINKS) {
        const navLink = navigation.link(link.href);
        await expect(navLink).toBeVisible();
        await expect(navLink).toHaveText(link.text);
      }

      // Test clicking each link scrolls to section
      for (const link of NAV_LINKS) {
        await navigation.clickLink(link.href);
        await expect(page.locator(link.href)).toBeInViewport();
      }
    });

    test('navbar hides on scroll down, shows on scroll up', async ({ page, navigation, desktop }) => {
      await expect(navigation.nav).not.toHaveClass(/nav-hidden/);

      // Scroll down past threshold
      await scrollPage(page, 200);
      await scrollPage(page, 200);
      await expect(navigation.nav).toHaveClass(/nav-hidden/);

      // Scroll up
      await scrollPage(page, -200);
      await expect(navigation.nav).not.toHaveClass(/nav-hidden/);
    });
  });

  test.describe('Mobile', () => {
    test('hamburger menu toggles correctly', async ({ page, navigation, mobile }) => {
      await expect(navigation.toggle).toBeVisible();
      await expect(navigation.menu).not.toBeVisible();

      // Open
      await navigation.openMobileMenu();
      await expect(navigation.toggle).toHaveClass(/active/);

      // Verify bars exist for animation
      await expect(navigation.toggle.locator('.bar')).toHaveCount(3);

      // Close
      await navigation.closeMobileMenu();
      await expect(navigation.toggle).not.toHaveClass(/active/);
    });

    test('nav links work and close menu', async ({ page, navigation, mobile }) => {
      for (const link of NAV_LINKS) {
        await navigation.clickMobileLink(link.href);
        
        await expect(page.locator(link.href)).toBeInViewport();
        await expect(navigation.menu).not.toHaveClass(/active/);
      }
    });

    test('navbar stays visible when menu is open', async ({ page, navigation, mobile }) => {
      await navigation.openMobileMenu();
      await scrollPage(page, 300);
      await expect(navigation.nav).not.toHaveClass(/nav-hidden/);
    });
  });
});
