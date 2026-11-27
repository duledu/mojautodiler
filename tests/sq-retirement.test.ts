import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import nextConfig from '@/next.config';
import {
  buildStaticSitemapEntries,
  buildCategorySitemapEntries,
  buildVehicleSitemapEntries,
} from '@/lib/seo/sitemap-builder';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/structured-data';

describe('Albanian (/sq) Version Retirement & Serbian (/sr) Preservation', () => {
  test('next.config.ts defines direct permanent redirects from all valid /sq routes to /sr equivalents without blind wildcard', async () => {
    const redirects = await nextConfig.redirects!();
    const bySource = new Map(redirects.map((r) => [r.source, r]));

    assert.equal(bySource.get('/sq')?.destination, '/sr');
    assert.equal(bySource.get('/sq')?.permanent, true);
    assert.equal(bySource.get('/sq/inventory')?.destination, '/sr/inventory');
    assert.equal(bySource.get('/sq/contact')?.destination, '/sr/contact');
    assert.equal(bySource.get('/sq/blog')?.destination, '/sr/blog');
    assert.equal(bySource.get('/sq/podela-odgovornosti')?.destination, '/sr/podela-odgovornosti');
    assert.equal(bySource.get('/sq/kako-kupiti')?.destination, '/sr/podela-odgovornosti');
    assert.equal(bySource.get('/sq/carvertical-dileri')?.destination, '/sr/carvertical-dileri');
    assert.equal(bySource.get('/sq/carvertical-za-dilere')?.destination, '/sr/carvertical-za-dilere');
    assert.equal(bySource.get('/sr/kako-kupiti')?.destination, '/sr/podela-odgovornosti');

    // Broad wildcards must NOT exist in next.config.ts so nonexistent/draft
    // /sq/vehicle/* and /sq/blog/* slugs return direct HTTP 404 via route handlers
    assert.equal(bySource.has('/sq/:path*'), false);
    assert.equal(bySource.has('/sq/vehicle/:slug'), false);
    assert.equal(bySource.has('/sq/blog/:path*'), false);
  });

  test('sitemap builder emits zero /sq URLs and zero sq hreflang alternates while preserving all /sr URLs', () => {
    const staticEntries = buildStaticSitemapEntries();
    const categoryEntries = buildCategorySitemapEntries();
    const vehicleEntries = buildVehicleSitemapEntries([
      {
        slug: 'bmw-x5-2015',
        updatedAt: new Date('2026-11-20T10:00:00Z'),
        primaryImage: 'https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/photo.jpg',
      },
    ]);

    const all = [...staticEntries, ...categoryEntries, ...vehicleEntries];
    assert.ok(all.length > 0);
    for (const entry of all) {
      assert.equal(entry.url.includes('/sq'), false, `Found /sq URL in sitemap: ${entry.url}`);
      assert.equal(entry.alternates, undefined, `Single-language sitemap should not emit hreflang alternates: ${entry.url}`);
    }

    const urls = all.map((e) => e.url);
    assert.ok(urls.includes('https://www.mojautodiler.com/sr'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/inventory'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/cars/bmw'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/model/golf-7'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/vehicle/bmw-x5-2015'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/podela-odgovornosti'));
  });

  test('Header removes language switcher and has zero /sq links', () => {
    const headerSrc = readFileSync(new URL('../components/layout/Header.tsx', import.meta.url), 'utf8');
    assert.equal(headerSrc.includes('localeNames'), false);
    assert.equal(headerSrc.includes('getLocalePath'), false);
    assert.equal(headerSrc.includes('/sq'), false);
  });

  test('Organization and WebSite JSON-LD declare Serbian-only language metadata', () => {
    const org = buildOrganizationJsonLd({ name: 'Moj Auto Diler', email: 'info@mojautodiler.com' });
    const site = buildWebSiteJsonLd({ name: 'Moj Auto Diler' });
    const cp = (org.contactPoint as Array<{ availableLanguage: string[] }>)[0];
    assert.deepEqual(cp.availableLanguage, ['sr']);
    assert.deepEqual(site.inLanguage, ['sr']);
  });
});
