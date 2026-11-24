import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_SILOS,
  MODEL_SILOS,
  buildVehicleBreadcrumbs,
  getModelsForBrand,
  resolveBrandSiloForVehicle,
  resolveModelSiloForVehicle,
  resolveSiloLinksForBlogPost,
} from '@/lib/seo/silos';
import { generateMetadata as generateHomeMetadata } from '@/app/[locale]/page';
import { generateMetadata as generateInventoryMetadata } from '@/app/[locale]/inventory/page';
import { generateMetadata as generateBrandMetadata } from '@/app/[locale]/cars/[brand]/page';
import { generateMetadata as generateModelMetadata } from '@/app/[locale]/model/[slug]/page';

describe('Phase 3 Technical SEO — Brand & Model Silo Registry & Matching', () => {
  test('maps only existing brand and model silos without inventing nonexistent pages', () => {
    assert.equal(BRAND_SILOS.length, 5);
    assert.equal(MODEL_SILOS.length, 6);

    assert.deepEqual(
      getModelsForBrand('volkswagen').map((m) => m.slug),
      ['golf-7', 'golf-6', 'tiguan'],
    );
    assert.deepEqual(
      getModelsForBrand('bmw').map((m) => m.slug),
      ['bmw-x3'],
    );
    assert.deepEqual(
      getModelsForBrand('mercedes-benz').map((m) => m.slug),
      [],
    );

    // Opel has no brand silo page yet -> must return null (no broken links)
    assert.equal(resolveBrandSiloForVehicle({ brand: 'Opel' }), null);
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'Opel', model: 'Insignia', title: 'Opel Insignia' }),
      null,
    );

    // BMW X5 has brand silo but no model silo -> brand resolves, model returns null
    assert.equal(resolveBrandSiloForVehicle({ brand: 'BMW' })?.slug, 'bmw');
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'BMW', model: 'X5', title: 'BMW X5 M50d' }),
      null,
    );

    // BMW X3, Audi A4, VW Golf 6/7, Tiguan, Octavia resolve across generations & variants
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'BMW', model: 'X3', title: 'BMW X3 xDrive20d F25' })?.slug,
      'bmw-x3',
    );
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'Audi', model: 'A4', title: 'Audi A4 B9 Avant 2.0 TDI Quattro' })?.slug,
      'audi-a4',
    );
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'Volkswagen', model: 'Golf 6', title: 'Volkswagen Golf 6 Variant 1.6 TDI' })?.slug,
      'golf-6',
    );
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'VW', model: 'Golf VII', title: 'VW Golf Mk7 2.0 TDI' })?.slug,
      'golf-7',
    );
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'Volkswagen', model: 'Tiguan AllSpace', title: 'VW Tiguan 4Motion' })?.slug,
      'tiguan',
    );
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'Skoda', model: 'Octavia Combi', title: 'Škoda Octavia 2.0 TDI' })?.slug,
      'octavia',
    );
    // Unmatched model of existing brand returns null (never links to wrong model)
    assert.equal(
      resolveModelSiloForVehicle({ brand: 'BMW', model: '520d', title: 'BMW 520d G30 Sport Line' }),
      null,
    );
  });

  test('builds exact breadcrumb hierarchy (Početna > Ponuda > Marka > Model > Vozilo) and skips missing levels', () => {
    // Full 5-level breadcrumb (brand + model exist)
    const x3Sr = buildVehicleBreadcrumbs(
      { slug: 'bmw-x3-polovni-automobili', title: 'BMW X3 xDrive20d', brand: 'BMW', model: 'X3' },
      'sr',
    );
    assert.deepEqual(
      x3Sr.map((b) => b.name),
      ['Početna', 'Ponuda', 'BMW', 'X3', 'BMW X3 xDrive20d'],
    );
    assert.deepEqual(
      x3Sr.map((b) => b.href),
      ['/sr', '/sr/inventory', '/sr/cars/bmw', '/sr/model/bmw-x3', '/sr/vehicle/bmw-x3-polovni-automobili'],
    );

    // Albanian 5-level breadcrumb
    const x3Sq = buildVehicleBreadcrumbs(
      { slug: 'bmw-x3-polovni-automobili', title: 'BMW X3 xDrive20d', brand: 'BMW', model: 'X3' },
      'sq',
    );
    assert.deepEqual(
      x3Sq.map((b) => b.name),
      ['Kryefaqja', 'Oferta', 'BMW', 'X3', 'BMW X3 xDrive20d'],
    );
    assert.equal(x3Sq[3].url, 'https://www.mojautodiler.com/sq/model/bmw-x3');

    // 4-level breadcrumb (brand exists, model page does not exist -> skip Model)
    const x5Sr = buildVehicleBreadcrumbs(
      { slug: 'bmw-x5-2015', title: 'BMW X5 M50d', brand: 'BMW', model: 'X5' },
      'sr',
    );
    assert.deepEqual(
      x5Sr.map((b) => b.name),
      ['Početna', 'Ponuda', 'BMW', 'BMW X5 M50d'],
    );

    // 3-level breadcrumb (neither brand nor model page exists -> skip both)
    const opelSr = buildVehicleBreadcrumbs(
      { slug: 'opel-insignia-2014', title: 'Opel Insignia', brand: 'Opel', model: 'Insignia' },
      'sr',
    );
    assert.deepEqual(
      opelSr.map((b) => b.name),
      ['Početna', 'Ponuda', 'Opel Insignia'],
    );
  });

  test('resolves contextual brand and model silo links for published blog posts', () => {
    const resolved = resolveSiloLinksForBlogPost({
      title: 'Kako izabrati polovni Volkswagen Golf 7 ili Audi A4 iz uvoza',
      excerpt: 'Praktičan vodič za kupce polovnih automobila iz Nemačke i Švajcarske.',
      relatedVehicles: [{ brand: 'BMW', model: 'X3', title: 'BMW X3' }],
    });

    assert.ok(resolved.models.some((m) => m.slug === 'golf-7'));
    assert.ok(resolved.models.some((m) => m.slug === 'audi-a4'));
    assert.ok(resolved.models.some((m) => m.slug === 'bmw-x3'));
    assert.ok(resolved.brands.some((b) => b.slug === 'volkswagen'));
    assert.ok(resolved.brands.some((b) => b.slug === 'audi'));
    assert.ok(resolved.brands.some((b) => b.slug === 'bmw'));
  });
});

describe('Phase 3 Technical SEO — On-Page Titles & Meta Descriptions', () => {
  test('homepage, inventory, brand, and model metadata target natural Serbian/Albanian automotive search terms', async () => {
    const homeSr = await generateHomeMetadata({ params: Promise.resolve({ locale: 'sr' }) });
    const invSr = await generateInventoryMetadata({ params: Promise.resolve({ locale: 'sr' }) });
    const invSq = await generateInventoryMetadata({ params: Promise.resolve({ locale: 'sq' }) });
    const bmwSr = await generateBrandMetadata({ params: Promise.resolve({ locale: 'sr', brand: 'bmw' }) });
    const a4Sr = await generateModelMetadata({ params: Promise.resolve({ locale: 'sr', slug: 'audi-a4' }) });

    const getAbs = (m: { title?: unknown }) =>
      m.title && typeof m.title === 'object' && 'absolute' in m.title
        ? String((m.title as { absolute: string }).absolute)
        : '';

    assert.ok(getAbs(homeSr).includes('Polovni automobili iz uvoza'));
    assert.equal(getAbs(invSr), 'Ponuda polovnih automobila iz uvoza | Moj Auto Diler');
    assert.equal(getAbs(invSq), 'Oferta e automjeteve të përdorura nga importi | Moj Auto Diler');
    assert.equal(/\d/.test(getAbs(invSr)), false, 'Inventory SR SEO title must not contain dynamic vehicle count');
    assert.equal(/\d/.test(getAbs(invSq)), false, 'Inventory SQ SEO title must not contain dynamic vehicle count');
    assert.ok(getAbs(bmwSr).includes('Polovni BMW automobili'));
    assert.ok(getAbs(a4Sr).includes('Polovni Audi A4'));

    // Ensure no em dashes in optimized titles or descriptions
    for (const meta of [homeSr, invSr, invSq, bmwSr, a4Sr]) {
      assert.equal(getAbs(meta).includes('—'), false);
      assert.equal(String(meta.description ?? '').includes('—'), false);
    }
  });
});
