import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import nextConfig from '@/next.config';
import { prisma } from '@/lib/prisma';
import { getTranslations } from '@/lib/i18n';
import { emptyDealerInfo } from '@/lib/db/mappers';
import {
  BRAND_SILOS,
  MODEL_SILOS,
  buildVehicleBreadcrumbs,
  computeActiveCategorySilos,
  getModelsForBrand,
  resolveBrandSiloForVehicle,
} from '@/lib/seo/silos';
import { buildFullSitemapEntries, serializeSitemapXml } from '@/lib/seo/sitemap-builder';
import { getActiveCategorySilos } from '@/lib/db/vehicles';
import Footer from '@/components/layout/Footer';
import BrandPage, {
  BRAND_SLUGS,
  generateMetadata as generateBrandMetadata,
} from '@/app/[locale]/cars/[brand]/page';
import ModelPage, {
  MODEL_SLUGS,
  generateMetadata as generateModelMetadata,
} from '@/app/[locale]/model/[slug]/page';

function makeDbRow(overrides: {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  status: 'AVAILABLE' | 'SOLD' | 'HIDDEN' | 'RESERVED';
}) {
  const now = new Date('2026-11-27T12:00:00.000Z');
  return {
    id: overrides.id,
    slug: overrides.slug,
    title: overrides.title,
    brand: overrides.brand,
    model: overrides.model,
    generation: null,
    year: 2017,
    mileage: 165000,
    price: 16900,
    currency: 'EUR',
    vatMode: 'NONE' as const,
    fuelType: 'dizel',
    transmission: 'automatski',
    drivetrain: 'prednji',
    bodyType: 'karavan',
    condition: 'polovno',
    engineSize: 1995,
    horsepower: 170,
    kilowatts: 125,
    doors: 5,
    seats: 5,
    color: 'Crna',
    interiorColor: null,
    vin: null,
    registration: null,
    origin: 'Nemačka',
    description: 'Uredno održavano vozilo.',
    dealerNotes: null,
    equipment: [],
    safetyFeatures: [],
    features: [],
    images: ['/test_11.jpg'],
    tags: ['cv:no_vin'],
    videoUrl: null,
    status: overrides.status,
    featured: false,
    showcase: false,
    onSale: false,
    dealerId: null,
    dealer: null,
    contactPhone: null,
    contactViber: null,
    contactName: null,
    createdAt: now,
    updatedAt: now,
  };
}

describe('Polovni Opel Category & Dynamic Active Category Links', () => {
  test('Polovni Opel (/sr/cars/opel) has unique Serbian metadata, H1 "Polovni Opel", self-canonical, zero em dashes, and /sq redirect', async () => {
    assert.ok(BRAND_SLUGS.includes('opel'));
    assert.ok(BRAND_SILOS.some((b) => b.slug === 'opel' && b.displayName === 'Opel' && b.dbName === 'Opel'));

    const opelMeta = await generateBrandMetadata({
      params: Promise.resolve({ locale: 'sr', brand: 'opel' }),
    });
    const otherMetas = await Promise.all(
      BRAND_SLUGS.filter((slug) => slug !== 'opel').map((brand) =>
        generateBrandMetadata({ params: Promise.resolve({ locale: 'sr', brand }) }),
      ),
    );

    const getAbsTitle = (m: { title?: unknown }) =>
      m.title && typeof m.title === 'object' && 'absolute' in m.title
        ? String((m.title as { absolute: string }).absolute)
        : '';

    const opelTitle = getAbsTitle(opelMeta);
    const opelDesc = String(opelMeta.description ?? '');

    assert.ok(opelTitle.includes('Polovni Opel'), `Expected title to contain "Polovni Opel", got: ${opelTitle}`);
    assert.ok(opelDesc.includes('Opel'), `Expected meta description to mention Opel, got: ${opelDesc}`);
    assert.equal(opelTitle.includes('—'), false, 'Opel meta title must not contain em dashes');
    assert.equal(opelDesc.includes('—'), false, 'Opel meta description must not contain em dashes');

    for (const other of otherMetas) {
      assert.notEqual(opelTitle, getAbsTitle(other), 'Opel meta title must be unique across all brands');
      assert.notEqual(opelDesc, String(other.description ?? ''), 'Opel meta description must be unique across all brands');
    }

    assert.equal(opelMeta.alternates?.canonical, '/sr/cars/opel');
    assert.equal(opelMeta.openGraph?.url, 'https://www.mojautodiler.com/sr/cars/opel');
    assert.deepEqual(opelMeta.robots, {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    });

    // Breadcrumb resolution now links Opel vehicles to /sr/cars/opel
    assert.equal(resolveBrandSiloForVehicle({ brand: 'Opel' })?.slug, 'opel');
    const crumbs = buildVehicleBreadcrumbs(
      {
        slug: 'opel-insignia-sports-tourer-2-0-cdti-2014',
        title: 'Opel Insignia A facelift',
        brand: 'Opel',
        model: 'Insignia A facelift',
      },
      'sr',
    );
    assert.deepEqual(
      crumbs.map((c) => c.href),
      ['/sr', '/sr/inventory', '/sr/cars/opel', '/sr/vehicle/opel-insignia-sports-tourer-2-0-cdti-2014'],
    );

    // /sq/cars/opel permanent redirect preserved alongside other brands
    const redirects = await nextConfig.redirects!();
    const sqCarsRule = redirects.find((r) => r.source.startsWith('/sq/cars/:brand'));
    assert.ok(sqCarsRule?.source.includes('opel'), 'next.config.ts /sq/cars redirect should include opel');
  });

  test('Sitemap includes https://www.mojautodiler.com/sr/cars/opel exactly once and preserves all existing entries', async () => {
    const entries = await buildFullSitemapEntries({
      getVehicles: async () => [
        {
          slug: 'opel-insignia-sports-tourer-2-0-cdti-2014',
          updatedAt: new Date('2026-11-27T10:00:00.000Z'),
        },
      ],
      getBlogEntries: async () => [{ url: 'https://www.mojautodiler.com/sr/blog' }],
    });

    const urls = entries.map((e) => e.url);
    const opelMatches = urls.filter((u) => u === 'https://www.mojautodiler.com/sr/cars/opel');
    assert.equal(opelMatches.length, 1, 'Opel category must appear in sitemap.xml exactly once');

    // Existing static, brand, and model entries remain intact
    for (const slug of BRAND_SLUGS) {
      assert.ok(urls.includes(`https://www.mojautodiler.com/sr/cars/${slug}`), `Missing brand in sitemap: ${slug}`);
    }
    for (const slug of MODEL_SLUGS) {
      assert.ok(urls.includes(`https://www.mojautodiler.com/sr/model/${slug}`), `Missing model in sitemap: ${slug}`);
    }
    assert.ok(urls.includes('https://www.mojautodiler.com/sr'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/inventory'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/contact'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/podela-odgovornosti'));
    assert.ok(urls.includes('https://www.mojautodiler.com/sr/blog'));

    const xml = serializeSitemapXml(entries);
    const xmlOccurrences = xml.split('<loc>https://www.mojautodiler.com/sr/cars/opel</loc>').length - 1;
    assert.equal(xmlOccurrences, 1);
  });

  test('computeActiveCategorySilos matches category page rules and excludes SOLD, HIDDEN, and RESERVED vehicles', () => {
    const active = computeActiveCategorySilos([
      { brand: 'Opel', model: 'Insignia A facelift', status: 'SOLD' },
      { brand: 'Opel', model: 'Astra K', status: 'HIDDEN' },
      { brand: 'Opel', model: 'Corsa', status: 'RESERVED' },
      { brand: 'BMW', model: '520d', status: 'sold' },
      { brand: 'BMW', model: '530d', status: 'hidden' },
      { brand: 'BMW', model: 'Serija 5', status: 'draft' },
      { brand: 'BMW', model: 'X1', status: 'AVAILABLE' }, // Active BMW, but not a registered model silo
      { brand: 'Volkswagen', model: 'Golf 7 Variant', status: 'AVAILABLE' }, // Active VW, but not exact Golf 7 modelAlias
    ]);

    assert.equal(active.brandSlugs.has('opel'), false);
    assert.equal(active.modelSlugs.has('bmw-serija-5'), false);
    assert.equal(active.brandSlugs.has('bmw'), true);
    assert.equal(active.brandSlugs.has('volkswagen'), true);
    assert.equal(active.modelSlugs.has('golf-7'), false, 'Must use exact category page modelAliases, not loose substring match');
  });

  test('proves isolated 0 -> 1 -> 0 transition for Opel and BMW Serija 5 across Footer, /sr/cars/bmw, and direct category routes (200)', async () => {
    const originalFindMany = prisma.vehicle.findMany;
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const t = getTranslations('sr');
    const dealer = emptyDealerInfo();

    let memRows = [
      makeDbRow({
        id: 'v-x3',
        slug: 'bmw-x3-test',
        title: 'BMW X3 xDrive20d',
        brand: 'BMW',
        model: 'X3',
        status: 'AVAILABLE',
      }),
    ];

    const filterWhere = (where: Record<string, unknown> | undefined) => {
      return memRows.filter((row) => {
        if (!where) return true;
        if (where.status && row.status !== where.status) return false;
        const brandCond = where.brand as { equals?: string } | string | undefined;
        if (typeof brandCond === 'string' && row.brand !== brandCond) return false;
        if (brandCond && typeof brandCond === 'object' && brandCond.equals) {
          if (row.brand.toLowerCase() !== brandCond.equals.toLowerCase()) return false;
        }
        if (Array.isArray(where.OR)) {
          const matchedOr = where.OR.some((clause: { model?: { equals?: string } }) => {
            if (clause.model?.equals) {
              return row.model.toLowerCase() === clause.model.equals.toLowerCase();
            }
            return false;
          });
          if (!matchedOr) return false;
        }
        return true;
      });
    };

    try {
      process.env.DATABASE_URL = originalDatabaseUrl || 'postgresql://simulated:test@localhost:5432/test';
      (prisma.vehicle as unknown as { findMany: (args?: { where?: Record<string, unknown> }) => Promise<typeof memRows> }).findMany =
        async (args) => filterWhere(args?.where);

      // ── STEP 1: 0 Opel, 0 BMW Serija 5 ──
      const state0 = await getActiveCategorySilos();
      assert.equal(state0.degraded, false);
      assert.equal(state0.brandSlugs.has('opel'), false);
      assert.equal(state0.modelSlugs.has('bmw-serija-5'), false);
      assert.equal(state0.brandSlugs.has('bmw'), true);
      assert.equal(state0.modelSlugs.has('bmw-x3'), true);

      const footer0 = renderToStaticMarkup(
        React.createElement(Footer, {
          locale: 'sr',
          t,
          dealer,
          activeBrands: state0.brands,
          activeModels: state0.models,
        }),
      );
      assert.equal(footer0.includes('/sr/cars/opel'), false, '0 Opel -> Footer must hide /sr/cars/opel');
      assert.equal(footer0.includes('/sr/model/bmw-serija-5'), false, '0 Serija 5 -> Footer must hide /sr/model/bmw-serija-5');
      assert.equal(footer0.includes('/sr/cars/bmw'), true);
      assert.equal(footer0.includes('/sr/model/bmw-x3'), true);

      const bmwPage0Html = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'bmw' }) }),
      );
      assert.equal(
        bmwPage0Html.includes('/sr/model/bmw-serija-5'),
        false,
        '0 Serija 5 -> /sr/cars/bmw must hide BMW Serija 5 model link',
      );
      assert.equal(bmwPage0Html.includes('/sr/model/bmw-x3'), true);
      assert.deepEqual(getModelsForBrand('bmw', state0.modelSlugs).map((m) => m.slug), ['bmw-x3']);

      // Direct category routes still render cleanly (HTTP 200 equivalent, no notFound) when empty
      const emptyOpelHtml = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'opel' }) }),
      );
      assert.ok(emptyOpelHtml.includes('<h1'), 'Empty /sr/cars/opel must render H1');
      assert.ok(emptyOpelHtml.includes('>Polovni Opel</h1>'), 'Empty /sr/cars/opel H1 must be "Polovni Opel"');
      assert.equal(emptyOpelHtml.includes('—'), false, 'Opel page HTML must contain zero em dashes');
      assert.ok(
        emptyOpelHtml.includes('Trenutno nema vozila za Opel u ponudi partnerskih auto-placeva.'),
        'Empty Opel page must show clear empty-state message',
      );
      assert.ok(emptyOpelHtml.includes('Pogledaj sva vozila'), 'Empty Opel page must show "Pogledaj sva vozila" CTA');
      assert.ok(emptyOpelHtml.includes('href="/sr/inventory"'), 'Empty Opel CTA must link to /sr/inventory');

      const emptySerija5Meta = await generateModelMetadata({
        params: Promise.resolve({ locale: 'sr', slug: 'bmw-serija-5' }),
      });
      assert.equal(emptySerija5Meta.alternates?.canonical, '/sr/model/bmw-serija-5');
      const emptySerija5Html = renderToStaticMarkup(
        await ModelPage({ params: Promise.resolve({ locale: 'sr', slug: 'bmw-serija-5' }) }),
      );
      assert.ok(emptySerija5Html.includes('>Polovni BMW Serija 5</h1>'));

      // ── STEP 2: 0 -> 1 (publish 1 Opel Insignia and 1 BMW 520d) ──
      memRows = [
        ...memRows,
        makeDbRow({
          id: 'v-opel-1',
          slug: 'opel-insignia-test',
          title: 'Opel Insignia A facelift',
          brand: 'Opel',
          model: 'Insignia A facelift',
          status: 'AVAILABLE',
        }),
        makeDbRow({
          id: 'v-bmw5-1',
          slug: 'bmw-520d-test',
          title: 'BMW 520d G30 Sport Line',
          brand: 'BMW',
          model: '520d',
          status: 'AVAILABLE',
        }),
      ];

      const state1 = await getActiveCategorySilos();
      assert.equal(state1.degraded, false);
      assert.equal(state1.brandSlugs.has('opel'), true);
      assert.equal(state1.modelSlugs.has('bmw-serija-5'), true);

      const footer1 = renderToStaticMarkup(
        React.createElement(Footer, {
          locale: 'sr',
          t,
          dealer,
          activeBrands: state1.brands,
          activeModels: state1.models,
        }),
      );
      assert.equal(footer1.includes('/sr/cars/opel'), true, '1 Opel -> Footer must show /sr/cars/opel');
      assert.equal(footer1.includes('Polovni Opel'), true);
      assert.equal(footer1.includes('/sr/model/bmw-serija-5'), true, '1 Serija 5 -> Footer must show /sr/model/bmw-serija-5');
      assert.equal(footer1.includes('Polovni BMW Serija 5'), true);

      const bmwPage1Html = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'bmw' }) }),
      );
      assert.equal(
        bmwPage1Html.includes('/sr/model/bmw-serija-5'),
        true,
        '1 Serija 5 -> /sr/cars/bmw must show BMW Serija 5 model link',
      );
      assert.deepEqual(getModelsForBrand('bmw', state1.modelSlugs).map((m) => m.slug), ['bmw-x3', 'bmw-serija-5']);

      const activeOpelHtml = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'opel' }) }),
      );
      assert.ok(activeOpelHtml.includes('>Polovni Opel</h1>'));
      assert.ok(activeOpelHtml.includes('1 Opel vozilo u ponudi'));
      assert.ok(activeOpelHtml.includes('Opel Insignia A facelift'));

      // ── STEP 3: 1 -> 0 (sell BMW 520d -> SOLD, deactivate Opel -> HIDDEN) ──
      memRows = memRows.map((row) => {
        if (row.id === 'v-opel-1') return { ...row, status: 'HIDDEN' as const };
        if (row.id === 'v-bmw5-1') return { ...row, status: 'SOLD' as const };
        return row;
      });

      const state2 = await getActiveCategorySilos();
      assert.equal(state2.degraded, false);
      assert.equal(state2.brandSlugs.has('opel'), false, 'Deactivated (HIDDEN) Opel must remove link');
      assert.equal(state2.modelSlugs.has('bmw-serija-5'), false, 'Sold (SOLD) BMW Serija 5 must remove link');

      const footer2 = renderToStaticMarkup(
        React.createElement(Footer, {
          locale: 'sr',
          t,
          dealer,
          activeBrands: state2.brands,
          activeModels: state2.models,
        }),
      );
      assert.equal(footer2.includes('/sr/cars/opel'), false);
      assert.equal(footer2.includes('/sr/model/bmw-serija-5'), false);

      const bmwPage2Html = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'bmw' }) }),
      );
      assert.equal(
        bmwPage2Html.includes('/sr/model/bmw-serija-5'),
        false,
        'Sold Serija 5 -> /sr/cars/bmw must remove BMW Serija 5 model link',
      );

      // Direct URLs remain accessible after 1 -> 0 transition
      const opelAfterSoldHtml = renderToStaticMarkup(
        await BrandPage({ params: Promise.resolve({ locale: 'sr', brand: 'opel' }) }),
      );
      assert.ok(opelAfterSoldHtml.includes('>Polovni Opel</h1>'));
      assert.ok(opelAfterSoldHtml.includes('Pogledaj sva vozila'));
    } finally {
      (prisma.vehicle as unknown as { findMany: typeof originalFindMany }).findMany = originalFindMany;
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });

  test('simulated inventory query error does NOT produce a false empty state and recovers immediately once DB succeeds', async () => {
    const t = getTranslations('sr');
    const dealer = emptyDealerInfo();

    const onError = await getActiveCategorySilos({
      fetchActiveVehicles: async () => {
        throw new Error('P1001: Simulated transient database connection timeout');
      },
    });

    assert.equal(onError.degraded, true);
    assert.equal(onError.brands.length, BRAND_SILOS.length, 'Error fallback must preserve all registered brand silos');
    assert.equal(onError.models.length, MODEL_SILOS.length, 'Error fallback must preserve all registered model silos');
    assert.equal(onError.brandSlugs.has('opel'), true);
    assert.equal(onError.modelSlugs.has('bmw-serija-5'), true);

    const footerDegraded = renderToStaticMarkup(
      React.createElement(Footer, {
        locale: 'sr',
        t,
        dealer,
        activeBrands: onError.brands,
        activeModels: onError.models,
      }),
    );
    assert.equal(footerDegraded.includes('/sr/cars/opel'), true);
    assert.equal(footerDegraded.includes('/sr/model/bmw-serija-5'), true);

    const bmwModelsDegraded = getModelsForBrand('bmw', onError.modelSlugs);
    assert.equal(bmwModelsDegraded.some((m) => m.slug === 'bmw-serija-5'), true);

    // Next healthy query returning confirmed empty [] must NOT be polluted by error state
    const afterRecovery = await getActiveCategorySilos({
      fetchActiveVehicles: async () => [],
    });
    assert.equal(afterRecovery.degraded, false);
    assert.equal(afterRecovery.brands.length, 0);
    assert.equal(afterRecovery.models.length, 0);
  });
});
