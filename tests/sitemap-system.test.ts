import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildFullSitemapEntries,
  handleSitemapGet,
  serializeSitemapXml,
  SITEMAP_CACHE_CONTROL,
  SITEMAP_CDN_CACHE_CONTROL,
  type SitemapVehicleRecord,
} from '../lib/seo/sitemap-builder';
import { dynamic as sitemapDynamic } from '../app/sitemap.xml/route';
import { shouldBypassLock } from '../lib/site-lock';

describe('Dynamic XML Sitemap System, Lifecycle, Fail-Closed 503, Site-Lock & CDN Cache', () => {
  test('route exports force-dynamic, strict <=5min CDN cache headers, valid XSL, and site-lock compatibility', () => {
    assert.equal(sitemapDynamic, 'force-dynamic');
    assert.equal(SITEMAP_CACHE_CONTROL, 'public, max-age=0, s-maxage=60, stale-while-revalidate=240');
    assert.equal(SITEMAP_CDN_CACHE_CONTROL, 'public, s-maxage=60, stale-while-revalidate=240');

    const sMaxAge = Number(SITEMAP_CACHE_CONTROL.match(/s-maxage=(\d+)/)?.[1]);
    const swr = Number(SITEMAP_CACHE_CONTROL.match(/stale-while-revalidate=(\d+)/)?.[1]);
    assert.ok(sMaxAge + swr <= 300, `Max CDN staleness must be <= 300s, got ${sMaxAge + swr}s`);

    // Site-lock bypasses /sitemap.xml and /sitemap.css without opening protected pages
    assert.equal(shouldBypassLock('/sitemap.xml'), true);
    assert.equal(shouldBypassLock('/sitemap.css'), true);
    assert.equal(shouldBypassLock('/sr/inventory'), false);
    assert.equal(shouldBypassLock('/sr/blog'), false);

    const cssPath = path.join(process.cwd(), 'public', 'sitemap.css');
    assert.ok(fs.existsSync(cssPath), 'public/sitemap.css must exist');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(css.includes('@namespace url("http://www.sitemaps.org/schemas/sitemap/0.9");'));
    assert.ok(css.includes('@namespace image url("http://www.google.com/schemas/sitemap-image/1.1");'));
    assert.equal(css.includes('—'), false, 'CSS copy must contain zero em dashes');
  });

  test('proves automatic blog lifecycle (draft -> publish -> edit -> withdraw) without redeploy', async () => {
    type MemPost = {
      slug: string;
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      noindex: boolean;
      updatedAt: Date;
      featuredImage?: string;
    };

    const posts: MemPost[] = [
      {
        slug: 'test-vodic-kilometraza',
        status: 'DRAFT',
        noindex: true,
        updatedAt: new Date('2026-11-20T10:00:00.000Z'),
        featuredImage: 'https://www.mojautodiler.com/blog/test.webp',
      },
    ];

    const getBlogEntries = async () => {
      const visible = posts.filter((p) => p.status === 'PUBLISHED' && !p.noindex);
      return [
        { url: 'https://www.mojautodiler.com/sr/blog' },
        ...visible.map((p) => ({
          url: `https://www.mojautodiler.com/sr/blog/${p.slug}`,
          lastModified: p.updatedAt,
          ...(p.featuredImage ? { images: [p.featuredImage] } : {}),
        })),
      ];
    };

    const emptyVehicles = async (): Promise<SitemapVehicleRecord[]> => [];

    // 1. DRAFT -> excluded
    const res1 = await handleSitemapGet({ getVehicles: emptyVehicles, getBlogEntries });
    assert.equal(res1.status, 200);
    const xml1 = await res1.text();
    assert.equal(xml1.includes('test-vodic-kilometraza'), false);

    // 2. PUBLISH -> immediately included with real updatedAt + image
    const publishTime = new Date('2026-11-26T09:00:00.000Z');
    posts[0].status = 'PUBLISHED';
    posts[0].noindex = false;
    posts[0].updatedAt = publishTime;

    const res2 = await handleSitemapGet({ getVehicles: emptyVehicles, getBlogEntries });
    const xml2 = await res2.text();
    assert.ok(xml2.includes('<loc>https://www.mojautodiler.com/sr/blog/test-vodic-kilometraza</loc>'));
    assert.ok(xml2.includes(`<lastmod>${publishTime.toISOString()}</lastmod>`));
    assert.ok(xml2.includes('<image:loc>https://www.mojautodiler.com/blog/test.webp</image:loc>'));

    // 3. EDIT -> lastmod advances automatically
    const editTime = new Date('2026-11-26T10:15:00.000Z');
    posts[0].updatedAt = editTime;
    const res3 = await handleSitemapGet({ getVehicles: emptyVehicles, getBlogEntries });
    const xml3 = await res3.text();
    assert.ok(xml3.includes(`<lastmod>${editTime.toISOString()}</lastmod>`));
    assert.equal(xml3.includes(publishTime.toISOString()), false);

    // 4. WITHDRAW (ARCHIVED) -> immediately removed; /sr/blog omits lastmod cleanly
    posts[0].status = 'ARCHIVED';
    const res4 = await handleSitemapGet({ getVehicles: emptyVehicles, getBlogEntries });
    const xml4 = await res4.text();
    assert.equal(xml4.includes('test-vodic-kilometraza'), false);
    assert.equal(xml4.includes('<lastmod>'), false);
  });

  test('proves vehicle & dealer lifecycle (add -> sell -> dealer hide/activate -> delete) with strict lastmod honesty', async () => {
    type MemDealer = { id: string; status: 'ACTIVE' | 'HIDDEN' };
    type MemVehicle = {
      id: string;
      slug: string;
      status: 'AVAILABLE' | 'SOLD' | 'HIDDEN';
      updatedAt: Date;
      primaryImage: string;
      dealerId: string;
    };

    const t1 = new Date('2026-11-10T10:00:00.000Z');
    const t2 = new Date('2026-11-15T10:00:00.000Z');

    const dealers: MemDealer[] = [{ id: 'd1', status: 'ACTIVE' }];
    let vehicles: MemVehicle[] = [
      {
        id: 'v1',
        slug: 'bmw-x3-test-1',
        status: 'AVAILABLE',
        updatedAt: t1,
        primaryImage: 'https://pub-example.r2.dev/vehicles/v1/1.jpg',
        dealerId: 'd1',
      },
      {
        id: 'v2',
        slug: 'bmw-520d-test-2',
        status: 'AVAILABLE',
        updatedAt: t2,
        primaryImage: 'https://pub-example.r2.dev/vehicles/v2/1.jpg',
        dealerId: 'd1',
      },
    ];

    const getVehicles = async (): Promise<SitemapVehicleRecord[]> => {
      const dealerMap = new Map(dealers.map((d) => [d.id, d]));
      return vehicles
        .filter((v) => v.status === 'AVAILABLE' && dealerMap.get(v.dealerId)?.status === 'ACTIVE')
        .map((v) => ({
          slug: v.slug,
          updatedAt: v.updatedAt,
          primaryImage: v.primaryImage,
        }));
    };

    const getBlogEntries = async () => [{ url: 'https://www.mojautodiler.com/sr/blog' }];

    // 1. Both vehicles active; aggregate hubs & categories omit lastmod (no inaccurate/backward dates)
    const e1 = await buildFullSitemapEntries({ getVehicles, getBlogEntries });
    const m1 = new Map(e1.map((e) => [e.url, e]));
    assert.equal(m1.get('https://www.mojautodiler.com/sr/vehicle/bmw-x3-test-1')?.lastModified?.toString(), t1.toString());
    assert.equal(m1.get('https://www.mojautodiler.com/sr/vehicle/bmw-520d-test-2')?.lastModified?.toString(), t2.toString());
    assert.equal(m1.get('https://www.mojautodiler.com/sr')?.lastModified, undefined);
    assert.equal(m1.get('https://www.mojautodiler.com/sr/inventory')?.lastModified, undefined);
    assert.equal(m1.get('https://www.mojautodiler.com/sr/cars/bmw')?.lastModified, undefined);
    assert.equal(m1.get('https://www.mojautodiler.com/sr/model/audi-a4')?.lastModified, undefined);
    assert.equal(m1.get('https://www.mojautodiler.com/sr/blog')?.lastModified, undefined);

    // 2. Sell v2 -> removed immediately
    vehicles[1].status = 'SOLD';
    const e2 = await buildFullSitemapEntries({ getVehicles, getBlogEntries });
    const m2 = new Map(e2.map((e) => [e.url, e]));
    assert.equal(m2.has('https://www.mojautodiler.com/sr/vehicle/bmw-520d-test-2'), false);
    assert.ok(m2.has('https://www.mojautodiler.com/sr/vehicle/bmw-x3-test-1'));

    // 3. Deactivate dealer d1 -> v1 removed immediately
    dealers[0].status = 'HIDDEN';
    const e3 = await buildFullSitemapEntries({ getVehicles, getBlogEntries });
    const m3 = new Map(e3.map((e) => [e.url, e]));
    assert.equal(m3.has('https://www.mojautodiler.com/sr/vehicle/bmw-x3-test-1'), false);

    // 4. Re-activate dealer d1 -> v1 returns immediately
    dealers[0].status = 'ACTIVE';
    const e4 = await buildFullSitemapEntries({ getVehicles, getBlogEntries });
    const m4 = new Map(e4.map((e) => [e.url, e]));
    assert.ok(m4.has('https://www.mojautodiler.com/sr/vehicle/bmw-x3-test-1'));

    // 5. Hard-delete v1 -> immediately removed without leaving inaccurate category lastmod
    vehicles = vehicles.filter((v) => v.id !== 'v1');
    const e5 = await buildFullSitemapEntries({ getVehicles, getBlogEntries });
    const m5 = new Map(e5.map((e) => [e.url, e]));
    assert.equal(m5.has('https://www.mojautodiler.com/sr/vehicle/bmw-x3-test-1'), false);
  });

  test('fails closed with HTTP 503 and no-store when database is unavailable (never HTTP 200 empty XML)', async () => {
    const res = await handleSitemapGet({
      getVehicles: async () => {
        throw new Error('P1001: Can not reach database server');
      },
      getBlogEntries: async () => [],
    });

    assert.equal(res.status, 503);
    assert.equal(res.headers.get('cache-control'), 'no-store, no-cache, must-revalidate');
    assert.equal(res.headers.get('retry-after'), '60');
    const body = await res.text();
    assert.equal(body.includes('<urlset'), false, '503 response must not return partial XML');
  });

  test('all admin blog, vehicle, and dealer mutation routes trigger revalidatePath("/sitemap.xml")', () => {
    const mutationRoutes = [
      'app/api/admin/blog/route.ts',
      'app/api/admin/blog/[id]/route.ts',
      'app/api/admin/vehicles/route.ts',
      'app/api/admin/vehicles/[id]/route.ts',
      'app/api/admin/dealers/route.ts',
      'app/api/admin/dealers/[id]/route.ts',
    ];

    for (const rel of mutationRoutes) {
      const src = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
      assert.ok(
        src.includes("revalidatePath('/sitemap.xml')"),
        `Admin mutation route ${rel} must call revalidatePath('/sitemap.xml')`,
      );
    }
  });

  test('filters malformed slugs and serializes valid XML with XSL PI and no changefreq/priority', async () => {
    const t1 = new Date('2026-10-10T10:00:00.000Z');
    const vehicles: SitemapVehicleRecord[] = [
      {
        slug: 'audi-a4-2017',
        updatedAt: t1,
        primaryImage: 'https://pub-example.r2.dev/vehicles/v1/1.jpg',
      },
      {
        slug: '`bmw-520d-g30-sport-line-2017-automatik`',
        updatedAt: new Date('2026-11-25T12:00:00.000Z'),
        primaryImage: 'https://pub-example.r2.dev/vehicles/v2/1.jpg',
      },
    ];

    const entries = await buildFullSitemapEntries({
      getVehicles: async () => vehicles,
      getBlogEntries: async () => [{ url: 'https://www.mojautodiler.com/sr/blog' }],
    });

    const xml = serializeSitemapXml(entries);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/css" href="/sitemap.css"?>'));
    assert.equal(xml.includes('`bmw-520d'), false);
    assert.equal(xml.includes('<changefreq>'), false);
    assert.equal(xml.includes('<priority>'), false);
  });
});
