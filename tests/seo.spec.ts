import { test, expect } from './fixtures';

const HOMEPAGE_URL = 'https://irisabella.nl/';

test.describe('Technical SEO', () => {
  test('homepage has the canonical URL and valid LocalBusiness data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', HOMEPAGE_URL);

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).not.toBeNull();

    const jsonLdText = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdText).not.toBeNull();

    const structuredData = JSON.parse(jsonLdText!);
    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Irisabella Healing Texel',
      url: HOMEPAGE_URL,
      telephone: '+31 6 53 24 52 53',
      email: 'Irisabella@xs4all.nl',
      description: metaDescription,
      logo: 'https://irisabella.nl/images/Irisabella_Healing_Texel_RGB.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ruijslaan 90',
        postalCode: '1796 AZ',
        addressLocality: 'De Koog',
        addressCountry: 'NL',
      },
      areaServed: 'Texel',
      sameAs: ['https://www.instagram.com/irisabella1'],
    });
  });

  test('sitemap is valid XML and only contains the reachable homepage', async ({ page, request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);

    const xml = await response.text();
    const parsedSitemap = await page.evaluate((sitemapXml) => {
      const document = new DOMParser().parseFromString(sitemapXml, 'application/xml');

      return {
        hasParseError: document.getElementsByTagName('parsererror').length > 0,
        rootElement: document.documentElement.localName,
        urls: Array.from(document.getElementsByTagNameNS('*', 'loc'), (element) => element.textContent),
      };
    }, xml);

    expect(parsedSitemap.hasParseError).toBe(false);
    expect(parsedSitemap.rootElement).toBe('urlset');
    expect(parsedSitemap.urls).toEqual([HOMEPAGE_URL]);

    for (const sitemapUrl of parsedSitemap.urls) {
      expect(sitemapUrl).not.toContain('#');

      const url = new URL(sitemapUrl!);
      const localResponse = await request.get(`${url.pathname}${url.search}`);
      expect(localResponse.ok()).toBe(true);
    }
  });

  test('robots.txt allows normal crawlers and OAI-SearchBot', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBe(true);

    const robots = await response.text();
    expect(robots).toMatch(/User-agent:\s*\*\s+Allow:\s*\//i);
    expect(robots).toMatch(/User-agent:\s*OAI-SearchBot\s+Allow:\s*\//i);
    expect(robots).toContain('Sitemap: https://irisabella.nl/sitemap.xml');
    expect(robots).not.toMatch(/^\s*Disallow\s*:/im);
  });
});
