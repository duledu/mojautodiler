import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BRAND_SILOS, MODEL_SILOS } from '../lib/seo/silos';
import { BRAND_SLUGS } from '../app/[locale]/cars/[brand]/page';
import { MODEL_SLUGS } from '../app/[locale]/model/[slug]/page';
import { generateVehicleSeo } from '../lib/seo/vehicle-seo';
import { buildWebSiteJsonLd } from '../lib/seo/structured-data';
import type { Vehicle } from '../types/vehicle';

describe('Commercial SEO & Google Ranking Verification', () => {
  it('Brand Silos are complete for all 8 active brands', () => {
    assert.equal(BRAND_SILOS.length, 8);
    const expectedBrands = ['bmw', 'audi', 'volkswagen', 'mercedes-benz', 'skoda', 'porsche', 'tesla', 'land-rover'];
    for (const slug of expectedBrands) {
      assert.ok(BRAND_SILOS.some((b) => b.slug === slug), `Missing brand silo in BRAND_SILOS: ${slug}`);
      assert.ok(BRAND_SLUGS.includes(slug as any), `Missing brand slug in BRAND_SLUGS: ${slug}`);
    }
  });

  it('Model Silos are complete for all target models including inventory vehicles', () => {
    const expectedModels = ['bmw-x5', 'bmw-x3', 'bmw-serija-5', 'audi-a6', 'golf-8', 'golf-7', 'octavia', 'tiguan', 'audi-a4'];
    for (const slug of expectedModels) {
      assert.ok(MODEL_SILOS.some((m) => m.slug === slug), `Missing model silo in MODEL_SILOS: ${slug}`);
      assert.ok(MODEL_SLUGS.includes(slug as any), `Missing model slug in MODEL_SLUGS: ${slug}`);
    }
  });

  it('Vehicle SEO titles prefix "Polovni" for Serbian searches', () => {
    const mockVehicle: Vehicle = {
      id: 'test-1',
      slug: 'bmw-520d-2017',
      title: 'BMW 520d xDrive Luxury Line',
      brand: 'BMW',
      model: '520d',
      year: 2017,
      price: 24500,
      currency: 'EUR',
      mileage: 145000,
      fuelType: 'dizel',
      transmission: 'automatski',
      bodyType: 'limuzina',
      drivetrain: '4x4',
      horsepower: 190,
      engineDisplacement: 1995,
      doors: 4,
      seats: 5,
      color: 'Crna metalik',
      origin: 'Nemačka',
      status: 'available',
      featured: true,
      description: 'Odlično očuvano vozilo.',
      equipment: ['Navigacija', 'Kožna sedišta', 'Servisna knjiga'],
      images: [{ url: '/test.jpg', isMain: true, order: 0 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const seoSr = generateVehicleSeo(mockVehicle, 'sr');
    assert.ok(seoSr.seoTitle.startsWith('Polovni BMW 520d'), `Expected title to start with "Polovni BMW 520d", got: ${seoSr.seoTitle}`);
    assert.ok(seoSr.seoTitle.includes('Moj Auto Diler'));
    assert.ok(seoSr.seoTitle.length <= 68, `Title too long: ${seoSr.seoTitle.length} chars`);

    const seoSq = generateVehicleSeo(mockVehicle, 'sq');
    assert.ok(seoSq.seoTitle.includes('BMW 520d'));
    assert.ok(seoSq.seoTitle.length <= 68);
  });

  it('WebSite structured data includes authentic brand alternate names and description', () => {
    const webSiteJson = buildWebSiteJsonLd({ name: 'Moj Auto Diler' }, 'https://www.mojautodiler.com');
    assert.equal(webSiteJson['@type'], 'WebSite');
    assert.ok(Array.isArray(webSiteJson.alternateName));
    assert.ok((webSiteJson.alternateName as string[]).includes('MojAutoDiler'));
    assert.ok(!JSON.stringify(webSiteJson.alternateName).includes('Polovni automobili'), 'AlternateName must not contain keyword spam');
  });

  it('No em dashes (—) exist in any staged blog articles across Batch 1 and Batch 2', () => {
    const batch1Dir = path.join(process.cwd(), 'content', 'staging', 'seo-articles-2026');
    const batch2Dir = path.join(process.cwd(), 'content', 'staging', 'seo-articles-batch-2-2026');

    const checkDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        assert.ok(!content.includes('—'), `Em dash (—) found in ${file}`);
      }
    };

    checkDir(batch1Dir);
    checkDir(batch2Dir);
  });
});
