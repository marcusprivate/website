import { test, expect } from './fixtures';

const BOOKING_URL = 'https://irisabella.simplybook.it/v2/#book';

test('every booking entry point opens the controlled booking popup', async ({ page }) => {
  // Keep all three calls to action visible while exercising each of them.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const links = page.locator('.booking-button');
  await expect(links).toHaveCount(3);

  for (let index = 0; index < await links.count(); index++) {
    const link = links.nth(index);
    await expect(link).toHaveAttribute('href', BOOKING_URL);
    await expect(link).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(link).toHaveAttribute('aria-expanded', 'false');
    await link.click();
    await expect(page.locator('iframe[title="Plan je healing"]')).toBeVisible();
  }

  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { __bookingWidgetCalls: unknown[] }).__bookingWidgetCalls.length
  )).toBe(3);
  await expect(page.locator('iframe[title="Plan je healing"]')).toHaveCount(1);
});

test('booking links retain their ordinary destination when the widget is unavailable', async ({ page }) => {
  await page.route('https://widget.simplybook.it/v2/widget/widget.js', route => route.abort());
  await page.goto('/');
  const link = page.locator('#welkom .booking-button');
  await expect(link).toHaveAttribute('href', BOOKING_URL);
  await expect(link).not.toHaveAttribute('aria-haspopup');
});

test('modifier clicks keep the ordinary booking-link behavior', async ({ page }) => {
  await page.route(BOOKING_URL, route => route.fulfill({ contentType: 'text/html', body: '<title>Booking destination</title>' }));
  await page.goto('/');
  const result = await page.locator('#welkom .booking-button').evaluate(link => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    const defaultWasPrevented = !link.dispatchEvent(event);
    return {
      defaultWasPrevented,
      popupCount: document.querySelectorAll('iframe[title="Plan je healing"]').length,
    };
  });

  expect(result.defaultWasPrevented).toBe(false);
  expect(result.popupCount).toBe(0);
});
