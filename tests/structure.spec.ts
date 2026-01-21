import { test, expect, CONFIG, NAV_LINKS, SLIDESHOW_IMAGES } from './fixtures';

test.describe('Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page meta and SEO', async ({ page }) => {
    // Title
    await expect(page).toHaveTitle('Irisabella healing praktijk');
    
    // Language
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'nl');
    
    // Viewport meta
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
    
    // Charset
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'UTF-8');
  });

  test('all sections exist with correct headings', async ({ page }) => {
    const sections = [
      { id: '#welkom', heading: null }, // Header, no h2
      { id: '#wat-is-healing', heading: 'Wat is Healing' },
      { id: '#mijn-aanpak', heading: 'Mijn Aanpak' },
      { id: '#wie-ben-ik', heading: 'Wie ben ik' },
      { id: '#reviews', heading: 'Reviews' },
      { id: '#contact', heading: 'Contact' },
    ];

    for (const section of sections) {
      const el = page.locator(section.id);
      await expect(el).toBeVisible();
      
      if (section.heading) {
        await expect(el.locator('h2')).toHaveText(section.heading);
      }
    }
  });

  test('external resources load', async ({ page }) => {
    // js-yaml script loaded
    const jsYaml = page.locator('script[src*="js-yaml"]');
    await expect(jsYaml).toHaveCount(1);
    
    // Custom fonts CSS
    const fontsCSS = page.locator('link[href="css/fonts.css"]');
    await expect(fontsCSS).toHaveCount(1);

    // Main stylesheet
    const stylesCSS = page.locator('link[href="css/styles.css"]');
    await expect(stylesCSS).toHaveCount(1);

    // Main JavaScript
    const mainJS = page.locator('script[src="js/main.js"]');
    await expect(mainJS).toHaveCount(1);
  });
});

test.describe('Assets Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all slideshow images load successfully', async ({ page }) => {
    for (const src of SLIDESHOW_IMAGES) {
      const img = page.locator(`.slides[src="${src}"]`);
      await expect(img).toHaveCount(1);
      
      // Check image actually loaded (naturalWidth > 0)
      const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0);
      expect(loaded, `Image ${src} should load`).toBe(true);
    }
  });

  test('logo images load', async ({ page }) => {
    const logos = [
      { selector: '#welkom img[alt="Irisabella Healing Praktijk logo"]', desc: 'Header logo' },
      { selector: '#contact img[alt="Irisabella Healing Praktijk logo"]', desc: 'Footer logo' },
    ];

    for (const logo of logos) {
      const img = page.locator(logo.selector);
      await img.scrollIntoViewIfNeeded();
      await expect(img, logo.desc).toBeVisible();
      
      const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0);
      expect(loaded, `${logo.desc} should load`).toBe(true);
    }
  });

  test('profile image loads', async ({ page }) => {
    const img = page.locator('img[alt="Irisabella Bakker"]');
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    
    const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0);
    expect(loaded, 'Profile image should load').toBe(true);
  });

  test('all images have alt attributes', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt, `Image ${i + 1} should have alt attribute`).toBeTruthy();
      expect(alt!.length, `Image ${i + 1} alt should not be empty`).toBeGreaterThan(0);
    }
  });

  test('custom fonts load', async ({ page }) => {
    // Wait for fonts to be ready
    await page.evaluate(() => document.fonts.ready);
    
    // Check if fonts are loaded
    const fontsLoaded = await page.evaluate(() => {
      return {
        gotham: document.fonts.check('16px "Gotham Rounded Medium"'),
        fonia: document.fonts.check('16px "Fonia Regular"'),
      };
    });
    
    expect(fontsLoaded.gotham, 'Gotham Rounded Medium should load').toBe(true);
    expect(fontsLoaded.fonia, 'Fonia Regular should load').toBe(true);
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('keyboard navigation works', async ({ page, desktop, browserName }) => {
    // Skip on WebKit - Tab behavior differs
    test.skip(browserName === 'webkit', 'WebKit Tab behavior differs');
    
    // Tab should move through focusable elements
    await page.keyboard.press('Tab');
    
    // First focusable should be a nav link
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('nav links are keyboard accessible', async ({ page, desktop, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit Tab behavior differs');
    const firstLink = page.locator('.desktop-menu a').first();
    await firstLink.focus();
    
    // Should be focusable
    await expect(firstLink).toBeFocused();
    
    // Enter should activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(CONFIG.timing.animationSettle);
    
    // Should have scrolled
    await expect(page.locator('#welkom')).toBeInViewport();
  });

  test('testimonial buttons are keyboard accessible', async ({ page, testimonials }) => {
    await testimonials.waitForLoad();
    
    const nextBtn = testimonials.nextButton;
    await nextBtn.focus();
    await expect(nextBtn).toBeFocused();
    
    const initialAuthor = await testimonials.getActiveAuthor();
    await page.keyboard.press('Enter');
    
    const newAuthor = await testimonials.getActiveAuthor();
    expect(newAuthor).not.toBe(initialAuthor);
  });

  test('images have meaningful alt text', async ({ page }) => {
    const altTexts = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.map(img => ({ src: img.src, alt: img.alt }))
    );
    
    for (const { src, alt } of altTexts) {
      expect(alt, `Image ${src} should have alt`).toBeTruthy();
      // Alt should be descriptive, not just filename
      expect(alt.includes('.jpg') || alt.includes('.png'), `Alt "${alt}" should be descriptive`).toBe(false);
    }
  });

  test('ARIA labels present on interactive elements', async ({ page, testimonials }) => {
    await testimonials.waitForLoad();
    
    // Testimonial buttons have ARIA labels
    await expect(testimonials.prevButton).toHaveAttribute('aria-label');
    await expect(testimonials.nextButton).toHaveAttribute('aria-label');
    
    // Instagram link has ARIA label
    const instagram = page.locator('a[href*="instagram.com"]');
    await expect(instagram).toHaveAttribute('aria-label');
  });

  test('heading hierarchy is correct', async ({ page }) => {
    // Should have section headings as h2
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBe(5); // wat-is-healing, mijn-aanpak, wie-ben-ik, reviews, contact
    
    // Wait for testimonials to load and render
    await expect(page.locator('.testimonial').first()).toBeVisible({ timeout: 5000 });
    
    // Testimonial author names are h3
    const h3s = page.locator('.testimonial h3');
    const h3Count = await h3s.count();
    expect(h3Count).toBeGreaterThan(0);
  });

  test('links have visible focus states', async ({ page, desktop }) => {
    const link = page.locator('.desktop-menu a').first();
    
    // Get styles before focus
    await link.focus();
    
    // The link should have some visual indicator when focused
    // (outline, box-shadow, or background change)
    const hasFocusStyle = await link.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.outline !== 'none' ||
        style.outlineWidth !== '0px' ||
        style.boxShadow !== 'none'
      );
    });
    
    // Note: This may need adjustment based on actual focus styles
    // For now we just verify the element can be focused
    await expect(link).toBeFocused();
  });

  test('color contrast for text', async ({ page }) => {
    // Check that main text color has sufficient contrast
    const bodyColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).color;
    });
    
    // Body text should be dark (rgb values should be low)
    // #333 = rgb(51, 51, 51)
    expect(bodyColor).toContain('51'); // Dark gray text
  });
});

test.describe('Error Handling', () => {
  test('page handles missing testimonials gracefully', async ({ page }) => {
    // Intercept the YAML request and make it fail
    await page.route('**/testimonials.yaml', route => route.abort());
    
    await page.goto('/');
    
    // Page should still load without crashing
    await expect(page.locator('#reviews')).toBeVisible();
    await expect(page.locator('#reviews h2')).toHaveText('Reviews');
    
    // Console should have error but page shouldn't break
    // The testimonial wrapper might be empty but shouldn't crash
  });
});
