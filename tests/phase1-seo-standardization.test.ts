import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { DEFAULT_SITE_URL, normalizeSiteUrl, SITE_URL, toAbsoluteSiteUrl } from '@/lib/site-url';
import { proxy } from '@/proxy';
import { generateMetadata as generateHomeMetadata } from '@/app/[locale]/page';
import { generateMetadata as generateInventoryMetadata } from '@/app/[locale]/inventory/page';
import { generateMetadata as generateContactMetadata } from '@/app/[locale]/contact/page';
import { generateMetadata as generateBrandMetadata } from '@/app/[locale]/cars/[brand]/page';
import { generateMetadata as generateModelMetadata } from '@/app/[locale]/model/[slug]/page';
import { generateMetadata as generateLegalMetadata } from '@/app/[locale]/podela-odgovornosti/page';

function extractAbsoluteTitle(title: unknown): string {
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'absolute' in title) {
    return String((title as { absolute: string }).absolute);
  }
  return '';
}

describe('Phase 1 Technical SEO — Domain Standardization & URL Helpers', () => {
  test('uses https://www.mojautodiler.com as default official site URL', () => {
    assert.equal(DEFAULT_SITE_URL, 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl(undefined), 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl(''), 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl('https://www.mojautodiler.com/'), 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl('https://www.mojautodiler.com/sr'), 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl('https://mojautodiler.com'), 'https://www.mojautodiler.com');
    assert.equal(normalizeSiteUrl('not-a-url'), 'https://www.mojautodiler.com');
    assert.equal(SITE_URL, 'https://www.mojautodiler.com');
  });

  test('resolves relative paths and preserves absolute URLs cleanly', () => {
    assert.equal(toAbsoluteSiteUrl('/sr/inventory'), 'https://www.mojautodiler.com/sr/inventory');
    assert.equal(toAbsoluteSiteUrl('sr/blog'), 'https://www.mojautodiler.com/sr/blog');
    assert.equal(
      toAbsoluteSiteUrl('https://cdn.example.com/img.jpg'),
      'https://cdn.example.com/img.jpg',
    );
  });

  test('proxy permanently redirects apex mojautodiler.com to www.mojautodiler.com without redirect loops', async () => {
    const apexRootReq = new NextRequest('https://mojautodiler.com/', {
      headers: { host: 'mojautodiler.com' },
    });
    const apexRootRes = await proxy(apexRootReq);
    assert.equal(apexRootRes.status, 308);
    assert.equal(apexRootRes.headers.get('location'), 'https://www.mojautodiler.com/sr');

    const apexSubReq = new NextRequest('https://mojautodiler.com/sr/inventory?brand=BMW', {
      headers: { host: 'mojautodiler.com' },
    });
    const apexSubRes = await proxy(apexSubReq);
    assert.equal(apexSubRes.status, 308);
    assert.equal(
      apexSubRes.headers.get('location'),
      'https://www.mojautodiler.com/sr/inventory?brand=BMW',
    );

    const wwwReq = new NextRequest('https://www.mojautodiler.com/sr', {
      headers: { host: 'www.mojautodiler.com' },
    });
    const wwwRes = await proxy(wwwReq);
    assert.notEqual(wwwRes.status, 308);
    assert.notEqual(wwwRes.status, 307);

    const localhostReq = new NextRequest('http://localhost:3000/sr', {
      headers: { host: 'localhost:3000' },
    });
    const localhostRes = await proxy(localhostReq);
    assert.notEqual(localhostRes.status, 308);
  });
});

describe('Phase 1 Technical SEO — Robots.txt & Sitemap Source Guards', () => {
  test('robots.txt points to https://www.mojautodiler.com/sitemap.xml and preserves filter disallows', () => {
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
    assert.ok(robots.includes('Sitemap: https://www.mojautodiler.com/sitemap.xml'));
    assert.equal(robots.includes('mojautodiler.rs'), false);
    assert.ok(robots.includes('Disallow: /sr/admin/'));
    assert.ok(robots.includes('Disallow: /api/'));
    assert.ok(robots.includes('Disallow: /sr/inventory?*'));
    assert.equal(robots.includes('Disallow: /sq/inventory?*'), false);
  });

  test('active production code has no mojautodiler.rs references in SEO core files', () => {
    const seoFiles = [
      '../app/layout.tsx',
      '../app/sitemap.xml/route.ts',
      '../lib/seo/sitemap-builder.ts',
      '../lib/site-url.ts',
      '../lib/seo/blog-seo.ts',
      '../components/seo/DealerJsonLd.tsx',
      '../components/seo/BrandSiloJsonLd.tsx',
      '../components/seo/ModelSiloJsonLd.tsx',
      '../components/seo/VehicleJsonLd.tsx',
    ];
    for (const rel of seoFiles) {
      const src = readFileSync(new URL(rel, import.meta.url), 'utf8');
      assert.equal(
        src.includes('mojautodiler.rs'),
        false,
        `Found forbidden mojautodiler.rs reference in ${rel}`,
      );
    }
  });
});

describe('Phase 1 Technical SEO — Metadata Title Uniqueness & No Suffix Duplication', () => {
  test('all core page metadata use absolute titles without duplicate Moj Auto Diler suffix', async () => {
    const checks = [
      { name: 'home-sr', meta: await generateHomeMetadata({ params: Promise.resolve({ locale: 'sr' }) }) },
      { name: 'home-sq', meta: await generateHomeMetadata({ params: Promise.resolve({ locale: 'sq' }) }) },
      { name: 'inventory-sr', meta: await generateInventoryMetadata({ params: Promise.resolve({ locale: 'sr' }) }) },
      { name: 'inventory-sq', meta: await generateInventoryMetadata({ params: Promise.resolve({ locale: 'sq' }) }) },
      { name: 'contact-sr', meta: await generateContactMetadata({ params: Promise.resolve({ locale: 'sr' }) }) },
      { name: 'contact-sq', meta: await generateContactMetadata({ params: Promise.resolve({ locale: 'sq' }) }) },
      { name: 'brand-bmw-sr', meta: await generateBrandMetadata({ params: Promise.resolve({ locale: 'sr', brand: 'bmw' }) }) },
      { name: 'brand-bmw-sq', meta: await generateBrandMetadata({ params: Promise.resolve({ locale: 'sq', brand: 'bmw' }) }) },
      { name: 'model-golf7-sr', meta: await generateModelMetadata({ params: Promise.resolve({ locale: 'sr', slug: 'golf-7' }) }) },
      { name: 'model-golf7-sq', meta: await generateModelMetadata({ params: Promise.resolve({ locale: 'sq', slug: 'golf-7' }) }) },
      { name: 'legal-sr', meta: await generateLegalMetadata({ params: Promise.resolve({ locale: 'sr' }) }) },
    ];

    const seenTitles = new Set<string>();
    for (const { name, meta } of checks) {
      assert.ok(
        meta.title && typeof meta.title === 'object' && 'absolute' in meta.title,
        `${name} must use title: { absolute: ... } to prevent layout template suffix duplication`,
      );
      const text = extractAbsoluteTitle(meta.title);
      const matches = text.match(/Moj Auto Diler/g) ?? [];
      assert.equal(matches.length, 1, `${name} should contain "Moj Auto Diler" exactly once, got: ${text}`);
      assert.equal(seenTitles.has(text), false, `Duplicate title detected for ${name}: ${text}`);
      seenTitles.add(text);
    }
  });
});
