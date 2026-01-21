import { test as base, expect, Page, Locator } from '@playwright/test';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONFIG = {
  viewports: {
    desktop: { width: 1280, height: 800 },
    mobile: { width: 375, height: 667 },
  },
  timing: {
    slideshow: 10000,
    scrollSettle: 200,
    animationSettle: 300,
    fontLoad: 1000,
  },
  selectors: {
    nav: 'nav',
    navMenu: '.desktop-menu',
    navToggle: '#mobile-menu',
    slides: '.slides',
    activeSlide: '.slides.active',
    testimonialWrapper: '.testimonial-wrapper',
    testimonial: '.testimonial',
    activeTestimonial: '.testimonial.active',
    prevButton: '#prev-testimonial',
    nextButton: '#next-testimonial',
    contact: '#contact',
  },
} as const;

export const NAV_LINKS = [
  { text: 'Welkom', href: '#welkom' },
  { text: 'Wat is Healing', href: '#wat-is-healing' },
  { text: 'Mijn Aanpak', href: '#mijn-aanpak' },
  { text: 'Wie ben ik', href: '#wie-ben-ik' },
  { text: 'Reviews', href: '#reviews' },
  { text: 'Contact', href: '#contact' },
] as const;

export const SLIDESHOW_IMAGES = [
  'images/roze_zee.jpg',
  'images/blauwe_zee.jpg',
  'images/boom_water.jpeg',
  'images/zee_strand_zon_onder.jpg',
  'images/schuim.jpg',
] as const;

// ============================================================================
// PAGE OBJECTS
// ============================================================================

export class NavigationComponent {
  readonly page: Page;
  readonly nav: Locator;
  readonly menu: Locator;
  readonly toggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator(CONFIG.selectors.nav);
    this.menu = page.locator(CONFIG.selectors.navMenu);
    this.toggle = page.locator(CONFIG.selectors.navToggle);
  }

  link(href: string): Locator {
    return this.menu.locator(`a[href="${href}"]`);
  }

  async waitForNavVisible(): Promise<void> {
    // Wait for navbar to be visible (not hidden)
    await expect(this.nav).not.toHaveClass(/nav-hidden/, { timeout: 2000 });
  }

  async openMobileMenu(): Promise<void> {
    await this.waitForNavVisible();
    await this.toggle.click();
    await expect(this.menu).toHaveClass(/active/);
  }

  async closeMobileMenu(): Promise<void> {
    await this.toggle.click();
    await expect(this.menu).not.toHaveClass(/active/);
  }

  async isHidden(): Promise<boolean> {
    return this.nav.evaluate(el => el.classList.contains('nav-hidden'));
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    // Wait for throttled scroll handler to process (100ms throttle + margin)
    await this.page.waitForTimeout(150);
    await this.waitForNavVisible();
  }

  async clickLink(href: string): Promise<void> {
    await this.scrollToTop();
    const link = this.link(href);
    await link.click();
    // Wait for scroll to complete by checking the target section is in view
    const targetSection = this.page.locator(href);
    await expect(targetSection).toBeInViewport({ ratio: 0.1 });
  }

  async clickMobileLink(href: string): Promise<void> {
    await this.scrollToTop();
    await this.openMobileMenu();
    await this.link(href).click();
    // Wait for menu to close and scroll to complete
    await expect(this.menu).not.toHaveClass(/active/);
    const targetSection = this.page.locator(href);
    await expect(targetSection).toBeInViewport({ ratio: 0.1 });
  }
}

export class SlideshowComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly slides: Locator;
  readonly activeSlide: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.slideshow-container');
    this.slides = page.locator(CONFIG.selectors.slides);
    this.activeSlide = page.locator(CONFIG.selectors.activeSlide);
  }

  async getActiveImageSrc(): Promise<string | null> {
    return this.activeSlide.getAttribute('src');
  }

  async expectActiveImage(src: string): Promise<void> {
    await expect(this.activeSlide).toHaveAttribute('src', src);
  }

  async expectSingleActive(): Promise<void> {
    await expect(this.activeSlide).toHaveCount(1);
  }
}

export class TestimonialsComponent {
  readonly page: Page;
  readonly wrapper: Locator;
  readonly testimonials: Locator;
  readonly active: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wrapper = page.locator(CONFIG.selectors.testimonialWrapper);
    this.testimonials = page.locator(`${CONFIG.selectors.testimonialWrapper} ${CONFIG.selectors.testimonial}`);
    this.active = page.locator(CONFIG.selectors.activeTestimonial);
    this.prevButton = page.locator(CONFIG.selectors.prevButton);
    this.nextButton = page.locator(CONFIG.selectors.nextButton);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForSelector(`${CONFIG.selectors.testimonialWrapper} ${CONFIG.selectors.testimonial}`, { timeout: 10000 });
  }

  async getActiveAuthor(): Promise<string | null> {
    return this.active.locator('h3').textContent();
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }

  async prev(): Promise<void> {
    await this.prevButton.click();
  }

  async expectSingleActive(): Promise<void> {
    await expect(this.active).toHaveCount(1);
  }
}

export class ContactSection {
  readonly page: Page;
  readonly section: Locator;
  readonly phoneLink: Locator;
  readonly emailLink: Locator;
  readonly mapsLink: Locator;
  readonly instagramLink: Locator;
  readonly allLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.section = page.locator(CONFIG.selectors.contact);
    this.phoneLink = this.section.locator('a[href^="tel:"]');
    this.emailLink = this.section.locator('a[href^="mailto:"]');
    this.mapsLink = this.section.locator('a[href*="google.com/maps"]');
    this.instagramLink = this.section.locator('a[href*="instagram.com"]');
    this.allLinks = this.section.locator('a.contact-link');
  }
}

// ============================================================================
// CUSTOM FIXTURES
// ============================================================================

type TestFixtures = {
  navigation: NavigationComponent;
  slideshow: SlideshowComponent;
  testimonials: TestimonialsComponent;
  contact: ContactSection;
  desktop: void;
  mobile: void;
};

export const test = base.extend<TestFixtures>({
  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  slideshow: async ({ page }, use) => {
    await use(new SlideshowComponent(page));
  },

  testimonials: async ({ page }, use) => {
    await use(new TestimonialsComponent(page));
  },

  contact: async ({ page }, use) => {
    await use(new ContactSection(page));
  },

  desktop: async ({ page }, use) => {
    await page.setViewportSize(CONFIG.viewports.desktop);
    await use();
  },

  mobile: async ({ page }, use) => {
    await page.setViewportSize(CONFIG.viewports.mobile);
    await use();
  },
});

// ============================================================================
// HELPERS
// ============================================================================

export function seedRandomScript(): string {
  return `
    (function() {
      let seed = 12345;
      Math.random = function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    })();
  `;
}

export async function gotoWithSeededRandom(page: Page, path: string = '/'): Promise<void> {
  await page.addInitScript(seedRandomScript());
  await page.goto(path);
}

export async function scrollPage(page: Page, deltaY: number): Promise<void> {
  await page.evaluate((dy) => window.scrollBy(0, dy), deltaY);
  // Wait for throttled scroll handler to process (100ms throttle + margin)
  await page.waitForTimeout(150);
}

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(CONFIG.timing.fontLoad);
}

export { expect };
