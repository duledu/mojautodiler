import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildInventoryCollectionJsonLd,
  buildOrganizationJsonLd,
  buildVehicleJsonLd,
  buildVehicleOfferSeller,
  buildWebSiteJsonLd,
  mapDrivetrainToSchema,
  mapFuelTypeToSchema,
  mapTransmissionToSchema,
} from '@/lib/seo/structured-data';
import type { Vehicle } from '@/types/vehicle';

function createSampleVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'veh-1',
    slug: 'bmw-520d-g30-2017',
    title: 'BMW 520d G30 Sport Line',
    brand: 'BMW',
    model: '520d',
    year: 2017,
    mileage: 168000,
    price: 21900,
    currency: 'EUR',
    vatMode: 'NONE',
    fuelType: 'dizel',
    transmission: 'automatski',
    drivetrain: '4x4',
    bodyType: 'limuzina',
    engineSize: 1995,
    kilowatts: 140,
    doors: 4,
    seats: 5,
    color: 'Crna',
    origin: 'Švajcarska',
    condition: 'polovno',
    description: 'Odlično očuvan BMW 520d iz uvoza.',
    equipment: [],
    safetyFeatures: [],
    features: [],
    images: [
      { id: 'img-1', url: 'https://cdn.example.com/bmw-1.jpg', alt: 'BMW 520d', order: 0 },
    ],
    status: 'active',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Phase 2 Technical SEO — Organization & WebSite JSON-LD', () => {
  const platformInfo = {
    name: 'Moj Auto Diler',
    phone: '+381 60 000 0000',
    email: 'info@mojautodiler.com',
    address: 'Glavna 1',
    facebook: 'https://facebook.com/mojautodiler',
    instagram: 'https://instagram.com/mojautodiler',
  };

  test('emits Organization (never AutoDealer or LocalBusiness) with official domain and clean address', () => {
    const org = buildOrganizationJsonLd({ ...platformInfo, address: 'Srbija' });
    assert.equal(org['@context'], 'https://schema.org');
    assert.equal(org['@type'], 'Organization');
    assert.equal(org['@id'], 'https://www.mojautodiler.com/#organization');
    assert.equal(org.url, 'https://www.mojautodiler.com');
    assert.equal(org.name, 'Moj Auto Diler');
    assert.equal('priceRange' in org, false);
    assert.equal('hasOfferCatalog' in org, false);
    assert.equal('currenciesAccepted' in org, false);
    assert.equal('paymentAccepted' in org, false);
    assert.equal('streetAddress' in (org.address as Record<string, unknown>), false);
    assert.equal((org.address as Record<string, unknown>).addressLocality, 'Preševo');
    assert.deepEqual(org.sameAs, [
      'https://facebook.com/mojautodiler',
      'https://instagram.com/mojautodiler',
    ]);
  });

  test('emits WebSite without deprecated Sitelinks Search Box potentialAction', () => {
    const site = buildWebSiteJsonLd(platformInfo);
    assert.equal(site['@context'], 'https://schema.org');
    assert.equal(site['@type'], 'WebSite');
    assert.equal(site['@id'], 'https://www.mojautodiler.com/#website');
    assert.equal(site.url, 'https://www.mojautodiler.com');
    assert.equal('potentialAction' in site, false);
    assert.deepEqual(site.inLanguage, ['sr']);
    assert.deepEqual(site.publisher, { '@id': 'https://www.mojautodiler.com/#organization' });
  });
});

describe('Phase 2 Technical SEO — VehicleJsonLd Enums, Seller & Localization', () => {
  test('maps transmission, drivetrain, and fuelType to valid Schema.org values', () => {
    // Schema.org vehicleTransmission has no built-in URL enumeration; plain Text is standard.
    assert.equal(mapTransmissionToSchema('automatski'), 'Automatic');
    assert.equal(mapTransmissionToSchema('manuelni'), 'Manual');
    assert.equal(mapTransmissionToSchema('poluautomatski'), 'Semi-automatic');

    // Schema.org DriveWheelConfigurationValue has official enumeration URIs.
    assert.equal(mapDrivetrainToSchema('4x4'), 'https://schema.org/FourWheelDriveConfiguration');
    assert.equal(mapDrivetrainToSchema('awd'), 'https://schema.org/AllWheelDriveConfiguration');
    assert.equal(mapDrivetrainToSchema('prednji'), 'https://schema.org/FrontWheelDriveConfiguration');
    assert.equal(mapDrivetrainToSchema('zadnji'), 'https://schema.org/RearWheelDriveConfiguration');

    assert.equal(mapFuelTypeToSchema('dizel'), 'Diesel');
    assert.equal(mapFuelTypeToSchema('benzin'), 'Gasoline');
    assert.equal(mapFuelTypeToSchema('hibrid'), 'Hybrid');
    assert.equal(mapFuelTypeToSchema('elektricni'), 'Electric');
  });

  test('attributes Offer.seller to actual partner/contact and omits seller when missing (no fabricated data)', () => {
    const withPartner = createSampleVehicle({
      dealer: {
        id: 'd-1',
        name: 'Auto Plac Premium Preševo',
        slug: 'auto-plac-premium-presevo',
        phone: '+381 64 111 2222',
        location: 'Preševo',
        address: 'Bulevar 12',
        isVerified: true,
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const partnerSeller = buildVehicleOfferSeller(withPartner);
    assert.ok(partnerSeller);
    assert.equal(partnerSeller['@type'], 'AutoDealer');
    assert.equal(partnerSeller.name, 'Auto Plac Premium Preševo');
    assert.equal(partnerSeller.telephone, '+381 64 111 2222');

    const withContactOnly = createSampleVehicle({
      dealer: undefined,
      contactName: 'Marko Marković',
      contactPhone: '+381 65 333 4444',
    });
    const contactSeller = buildVehicleOfferSeller(withContactOnly);
    assert.ok(contactSeller);
    assert.equal(contactSeller['@type'], 'Person');
    assert.equal(contactSeller.name, 'Marko Marković');

    const noSellerVehicle = createSampleVehicle({
      dealer: undefined,
      contactName: undefined,
    });
    assert.equal(buildVehicleOfferSeller(noSellerVehicle), undefined);
    const noSellerJson = buildVehicleJsonLd(noSellerVehicle, 'https://www.mojautodiler.com', 'sr');
    assert.equal('seller' in (noSellerJson.offers as Record<string, unknown>), false);
  });

  test('emits localized Car + Offer URLs and properly encodes slugs', () => {
    const vehicle = createSampleVehicle({ slug: '`bmw-520d-g30`' });
    const srJson = buildVehicleJsonLd(vehicle, 'https://www.mojautodiler.com', 'sr');
    const sqJson = buildVehicleJsonLd(vehicle, 'https://www.mojautodiler.com', 'sq');

    assert.equal(srJson['@type'], 'Car');
    assert.equal(srJson.url, 'https://www.mojautodiler.com/sr/vehicle/%60bmw-520d-g30%60');
    assert.equal((srJson.offers as Record<string, unknown>).url, srJson.url);

    assert.equal(sqJson.url, 'https://www.mojautodiler.com/sq/vehicle/%60bmw-520d-g30%60');
    assert.equal((sqJson.offers as Record<string, unknown>).url, sqJson.url);
    assert.equal(sqJson.vehicleTransmission, 'Automatic');
    assert.equal(sqJson.driveWheelConfiguration, 'https://schema.org/FourWheelDriveConfiguration');
  });
});

describe('Phase 2 Technical SEO — Inventory CollectionPage + ItemList & Silo Publishers', () => {
  test('builds valid CollectionPage + ItemList for /inventory in both locales', () => {
    const vehicles = [
      createSampleVehicle({ id: 'v1', slug: 'bmw-520d-2017', title: 'BMW 520d', price: 21900 }),
      createSampleVehicle({ id: 'v2', slug: 'audi-a4-2017', title: 'Audi A4', brand: 'Audi', model: 'A4', price: 16500 }),
    ];

    const srCollection = buildInventoryCollectionJsonLd({
      vehicles,
      locale: 'sr',
      pageTitle: 'Inventar Vozila (2 vozila) | Moj Auto Diler',
      description: 'Premium vozila dostupna u Srbiji.',
    });

    assert.equal(srCollection['@context'], 'https://schema.org');
    assert.equal(srCollection['@type'], 'CollectionPage');
    assert.equal(srCollection.url, 'https://www.mojautodiler.com/sr/inventory');
    assert.equal(srCollection.inLanguage, 'sr');
    assert.equal((srCollection.publisher as Record<string, unknown>)['@type'], 'Organization');

    const itemList = srCollection.mainEntity as Record<string, unknown>;
    assert.equal(itemList['@type'], 'ItemList');
    assert.equal(itemList.numberOfItems, 2);
    const elements = itemList.itemListElement as Array<Record<string, unknown>>;
    assert.equal(elements.length, 2);
    assert.equal(elements[0].position, 1);
    assert.equal(elements[0].url, 'https://www.mojautodiler.com/sr/vehicle/bmw-520d-2017');
    assert.equal((elements[0].item as Record<string, unknown>)['@type'], 'Car');

    const sqCollection = buildInventoryCollectionJsonLd({
      vehicles,
      locale: 'sq',
      pageTitle: 'Inventari i Automjeteve (2 automjete) | Moj Auto Diler',
      description: 'Automjete premium.',
    });
    assert.equal(sqCollection.url, 'https://www.mojautodiler.com/sq/inventory');
    const sqElements = (sqCollection.mainEntity as Record<string, unknown>).itemListElement as Array<Record<string, unknown>>;
    assert.equal(sqElements[1].url, 'https://www.mojautodiler.com/sq/vehicle/audi-a4-2017');
  });

  test('BrandSiloJsonLd and ModelSiloJsonLd use Organization publisher instead of AutoDealer', () => {
    for (const rel of [
      '../components/seo/BrandSiloJsonLd.tsx',
      '../components/seo/ModelSiloJsonLd.tsx',
    ]) {
      const src = readFileSync(new URL(rel, import.meta.url), 'utf8');
      assert.equal(src.includes("'@type': 'AutoDealer'"), false, `${rel} must not label MojAutoDiler as AutoDealer`);
      assert.ok(src.includes("'@type': 'Organization'"), `${rel} must use Organization as publisher`);
    }
  });
});
