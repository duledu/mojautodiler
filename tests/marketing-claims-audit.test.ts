import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getVehicleTrustBadges, TrustBadges } from '../components/vehicle/TrustBadges';
import { getTranslations } from '../lib/i18n';
import type { Vehicle } from '../types/vehicle';

const BASE_MOCK_VEHICLE: Vehicle = {
  id: 'test-v1',
  slug: 'test-bmw-320d',
  title: 'BMW 320d Luxury',
  brand: 'BMW',
  model: '320d',
  year: 2019,
  mileage: 95000,
  price: 21500,
  currency: 'EUR',
  vatMode: 'NONE',
  fuelType: 'dizel',
  transmission: 'automatski',
  drivetrain: 'zadnji',
  bodyType: 'limuzina',
  condition: 'polovno',
  doors: 4,
  seats: 5,
  color: 'Crna',
  description: 'Odlično stanje.',
  equipment: [],
  safetyFeatures: [],
  features: [],
  images: [],
  status: 'active',
  featured: false,
  showcase: false,
  onSale: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  carVerticalVinMode: 'NO_VIN',
};

describe('Marketing Claims & Trust Badge Audit Tests', () => {
  test('replaces misleading verification claims in Serbian translations with approved wording', () => {
    const t = getTranslations('sr');

    // Why us
    assert.equal(t.whyUs.items[0].title, 'Pažljivo odabrana ponuda');
    assert.equal(
      t.whyUs.items[0].desc,
      'Na jednom mestu predstavljamo ponudu odabranih partnerskih auto-placeva.',
    );

    // Vehicle detail confidence
    assert.equal(
      t.vehicleDetail.confidenceSub,
      'Vozilo iz ponude partnerskog auto-placa, predstavljeno transparentno pre odluke.',
    );
    assert.equal(
      t.vehicleDetail.confidenceBullets[0],
      'Pre kupovine preporučujemo proveru kilometraže i dokumentacije.',
    );
    assert.equal(
      t.vehicleDetail.confidenceBullets[1],
      'Preporučujemo nezavisan pregled vozila pre donošenja odluke.',
    );

    // Trust badges
    assert.equal(t.vehicleTrustBadges.verified, 'Odabrano vozilo');
    assert.equal(t.vehicleTrustBadges.vin, 'VIN dostupan');
    assert.equal(t.vehicleTrustBadges.dealer, 'Partnerski auto-plac');
  });

  test('replaces misleading verification claims in Albanian translations with approved wording', () => {
    const t = getTranslations('sq');

    // Why us
    assert.equal(t.whyUs.items[0].title, 'Ofertë e Zgjedhur me Kujdes');
    assert.equal(
      t.whyUs.items[0].desc,
      'Në një vend prezantojmë ofertën e auto placeve partnere të përzgjedhura.',
    );

    // Vehicle detail confidence
    assert.equal(
      t.vehicleDetail.confidenceSub,
      'Automjet nga oferta e auto-placit partner, prezantuar në mënyrë transparente para vendimit.',
    );
    assert.equal(
      t.vehicleDetail.confidenceBullets[0],
      'Para blerjes rekomandojmë verifikimin e kilometrazhës dhe dokumentacionit.',
    );
    assert.equal(
      t.vehicleDetail.confidenceBullets[1],
      'Rekomandojmë kontroll të pavarur të automjetit para marrjes së vendimit.',
    );

    // Trust badges
    assert.equal(t.vehicleTrustBadges.verified, 'Automjet i zgjedhur');
    assert.equal(t.vehicleTrustBadges.vin, 'VIN i disponueshëm');
    assert.equal(t.vehicleTrustBadges.dealer, 'Auto-plac partner');
  });

  test('VIN badge visibility rule: displays "VIN dostupan" ONLY when valid VIN exists AND WITH_VIN mode is active', () => {
    // 1. Valid VIN + WITH_VIN -> includes 'vin' badge
    const validWithVin: Vehicle = {
      ...BASE_MOCK_VEHICLE,
      vin: 'WAUZZZF40LA000001',
      carVerticalVinMode: 'WITH_VIN',
    };
    const badgesWithVin = getVehicleTrustBadges(validWithVin);
    assert.ok(badgesWithVin.includes('vin'), 'Should include vin badge when valid and WITH_VIN');

    // 2. Valid VIN in DB but NO_VIN mode selected -> MUST NOT show vin badge
    const validNoVinMode: Vehicle = {
      ...BASE_MOCK_VEHICLE,
      vin: 'WAUZZZF40LA000001',
      carVerticalVinMode: 'NO_VIN',
    };
    const badgesNoVinMode = getVehicleTrustBadges(validNoVinMode);
    assert.equal(badgesNoVinMode.includes('vin'), false, 'Must NOT show vin badge when mode is NO_VIN');

    // 3. Invalid / placeholder VIN + WITH_VIN -> MUST NOT show vin badge
    const placeholderVin: Vehicle = {
      ...BASE_MOCK_VEHICLE,
      vin: 'xxxxxxxxxxxxxxxxx',
      carVerticalVinMode: 'WITH_VIN',
    };
    const badgesPlaceholder = getVehicleTrustBadges(placeholderVin);
    assert.equal(badgesPlaceholder.includes('vin'), false, 'Must NOT show vin badge when VIN is placeholder/invalid');

    // 4. Missing VIN -> MUST NOT show vin badge
    const missingVin: Vehicle = {
      ...BASE_MOCK_VEHICLE,
      vin: undefined,
      carVerticalVinMode: 'WITH_VIN',
    };
    const badgesMissing = getVehicleTrustBadges(missingVin);
    assert.equal(badgesMissing.includes('vin'), false, 'Must NOT show vin badge when VIN is missing');

    // Verify rendered markup
    const markupWithVin = renderToStaticMarkup(
      React.createElement(TrustBadges, {
        locale: 'sr',
        badges: badgesWithVin,
      }),
    );
    assert.ok(markupWithVin.includes('VIN dostupan'));
    assert.equal(markupWithVin.includes('VIN proveren'), false);
    assert.ok(markupWithVin.includes('Odabrano vozilo'));
    assert.equal(markupWithVin.includes('Provereno vozilo'), false);
  });
});
