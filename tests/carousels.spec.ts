import { test, expect, SLIDESHOW_IMAGES, CONFIG } from './fixtures';
import type { Page } from '@playwright/test';

const SLIDESHOW_TICK_MS = CONFIG.timing.slideshow + CONFIG.timing.animationSettle;

async function dispatchTouchSwipe(
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number },
  steps = 6
): Promise<void> {
  const client = await page.context().newCDPSession(page);

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: start.x, y: start.y }],
  });

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
      }],
    });
  }

  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });

  await client.detach();
}

async function stubExternalScripts(page: Page): Promise<void> {
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.jsyaml = {
        load(yaml) {
          return yaml
            .split(/\\n(?=- tekst: \\|)/)
            .filter(Boolean)
            .map(block => {
              const textMatch = block.match(/- tekst: \\|\\n([\\s\\S]*?)\\n  naam:/);
              const nameMatch = block.match(/\\n  naam:\\s*(.*)/);
              return {
                tekst: textMatch ? textMatch[1].replace(/^ {4}/gm, '').trim() : '',
                naam: nameMatch ? nameMatch[1].trim() : ''
              };
            });
        }
      };
    `,
  }));

  await page.route('**/gc.zgo.at/count.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: '',
  }));
}

test.describe('Slideshow', () => {
  test('all images exist and only one active at a time', async ({ page, slideshow }) => {
    await page.goto('/');
    
    await expect(slideshow.slides).toHaveCount(SLIDESHOW_IMAGES.length);
    await slideshow.expectSingleActive();
    await slideshow.expectActiveImage(SLIDESHOW_IMAGES[0]);
  });

  test('auto-advances every 10 seconds', async ({ page, slideshow }) => {
    await page.clock.install();
    await page.goto('/');
    
    await slideshow.expectActiveImage(SLIDESHOW_IMAGES[0]);
    
    await page.clock.fastForward(SLIDESHOW_TICK_MS);
    await slideshow.expectActiveImage(SLIDESHOW_IMAGES[1]);
    
    await page.clock.fastForward(SLIDESHOW_TICK_MS);
    await slideshow.expectActiveImage(SLIDESHOW_IMAGES[2]);
  });

  test('cycles back to first after last', async ({ page, slideshow }) => {
    await page.clock.install();
    await page.goto('/');
    await slideshow.expectActiveImage(SLIDESHOW_IMAGES[0]);
    
    // Advance through all 5 images
    for (let i = 1; i <= 5; i++) {
      await page.clock.fastForward(SLIDESHOW_TICK_MS);
      const expectedIndex = i % 5;
      await slideshow.expectActiveImage(SLIDESHOW_IMAGES[expectedIndex]);
      await slideshow.expectSingleActive();
    }
  });
});

test.describe('Testimonials', () => {
  test('loaded from YAML with text and author', async ({ page, testimonials }) => {
    await page.goto('/');
    await testimonials.waitForLoad();
    const count = await testimonials.testimonials.count();
    expect(count).toBeGreaterThan(0);
    
    await testimonials.expectSingleActive();
    
    // Check structure
    const paragraphs = testimonials.active.locator('p');
    expect(await paragraphs.count()).toBeGreaterThan(0);
    
    const author = await testimonials.getActiveAuthor();
    expect(author).toMatch(/^- .+/);
  });

  test('navigation buttons work', async ({ page, testimonials }) => {
    await page.goto('/');
    await testimonials.waitForLoad();
    
    const initialIndex = await testimonials.getActiveIndex();
    
    await testimonials.next();
    await expect
      .poll(() => testimonials.getActiveIndex())
      .not.toBe(initialIndex);
    const afterNextIndex = await testimonials.getActiveIndex();
    
    // Prev should return to previous testimonial (the initial one)
    await testimonials.prev();
    await expect
      .poll(() => testimonials.getActiveIndex())
      .toBe(initialIndex);
  });

  test('auto-advances and resets on manual navigation', async ({ page, testimonials }) => {
    // Install clock BEFORE navigation to properly mock timers
    await page.clock.install();
    await page.goto('/');
    await testimonials.waitForLoad();
    
    const initialIndex = await testimonials.getActiveIndex();
    
    // Auto-advance after 10s - use fastForward for consistency with slideshow tests
    await page.clock.fastForward(CONFIG.timing.slideshow);
    expect(await testimonials.getActiveIndex()).not.toBe(initialIndex);
    
    // Manual nav resets timer
    const beforeManualIndex = await testimonials.getActiveIndex();
    await page.clock.fastForward(8000);
    await testimonials.next();
    const afterManualIndex = await testimonials.getActiveIndex();
    expect(afterManualIndex).not.toBe(beforeManualIndex);
    
    await page.clock.fastForward(8000); // Not enough if timer reset
    expect(await testimonials.getActiveIndex()).toBe(afterManualIndex);
    
    await page.clock.fastForward(2000); // Now it should advance
    expect(await testimonials.getActiveIndex()).not.toBe(afterManualIndex);
  });

  test('control buttons have ARIA labels', async ({ page, testimonials }) => {
    await page.goto('/');
    await testimonials.waitForLoad();
    
    await expect(testimonials.prevButton).toHaveAttribute('aria-label', 'Previous Testimonial');
    await expect(testimonials.nextButton).toHaveAttribute('aria-label', 'Next Testimonial');
  });
});

test.describe('Testimonials Touch', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch tests only on Chromium');

  test('mobile horizontal swipe changes testimonials without vertical page drift', async ({ page, testimonials, mobile }) => {
    await stubExternalScripts(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await testimonials.waitForLoad();

    await testimonials.wrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(CONFIG.timing.scrollSettle);

    const wrapperBox = await testimonials.wrapper.boundingBox();
    expect(wrapperBox).not.toBeNull();

    const initialIndex = await testimonials.getActiveIndex();
    const initialScrollY = await page.evaluate(() => window.scrollY);

    await dispatchTouchSwipe(
      page,
      {
        x: wrapperBox!.x + wrapperBox!.width - 32,
        y: wrapperBox!.y + wrapperBox!.height / 2,
      },
      {
        x: wrapperBox!.x + 32,
        y: wrapperBox!.y + wrapperBox!.height / 2 + 30,
      }
    );

    await expect
      .poll(() => testimonials.getActiveIndex())
      .not.toBe(initialIndex);

    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThanOrEqual(2);
  });
});
