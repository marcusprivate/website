import { test, expect } from './fixtures';

test.describe('Contact Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('phone link', async ({ contact }) => {
    await expect(contact.phoneLink).toBeVisible();
    await expect(contact.phoneLink).toHaveAttribute('href', 'tel:+31653245253');
    await expect(contact.phoneLink).toHaveText('06 53 24 52 53');
  });

  test('email link', async ({ contact }) => {
    await expect(contact.emailLink).toBeVisible();
    await expect(contact.emailLink).toHaveAttribute('href', 'mailto:Irisabella@xs4all.nl');
    await expect(contact.emailLink).toHaveText('Irisabella@xs4all.nl');
  });

  test('address link opens Google Maps in new tab', async ({ contact }) => {
    await expect(contact.mapsLink).toBeVisible();
    await expect(contact.mapsLink).toHaveAttribute('target', '_blank');
    await expect(contact.mapsLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    const href = await contact.mapsLink.getAttribute('href');
    expect(href).toContain('Ruijslaan+90');
    expect(href).toContain('1796+AZ');
    expect(href).toContain('De+Koog');
  });

  test('Instagram link with icon opens in new tab', async ({ contact }) => {
    await expect(contact.instagramLink).toBeVisible();
    await expect(contact.instagramLink).toHaveAttribute('href', 'https://www.instagram.com/irisabella1');
    await expect(contact.instagramLink).toHaveAttribute('target', '_blank');
    await expect(contact.instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(contact.instagramLink).toHaveAttribute('aria-label', 'Instagram: Irisabella Healing Texel');
    
    // Icon exists
    await expect(contact.instagramLink.locator('i.fab.fa-instagram')).toBeVisible();
  });

  test('section structure', async ({ contact }) => {
    await expect(contact.section.locator('h2')).toHaveText('Contact');
    await expect(contact.allLinks).toHaveCount(4);
  });

  test('external links have security attributes', async ({ contact }) => {
    const externalLinks = contact.section.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    
    for (let i = 0; i < count; i++) {
      await expect(externalLinks.nth(i)).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
