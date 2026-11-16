import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  CARVERTICAL_AFFILIATE_REL,
  CARVERTICAL_AFFILIATE_TARGET,
  CARVERTICAL_ASSETS,
  CARVERTICAL_DISCOUNT_PERCENT,
  CARVERTICAL_PARTNER_SUB1,
  CARVERTICAL_URLS,
  canExposeVehicleVinInAffiliateLink,
  getCarVerticalFooterUrl,
  getCarVerticalHomepageUrl,
  getCarVerticalListingNoVinUrl,
  getCarVerticalListingUrl,
  getCarVerticalVehicleListingLink,
  normalizeAndValidateVin,
} from '../lib/affiliate/carvertical';
import CarVerticalHomepageSection from '../components/affiliate/CarVerticalHomepageSection';
import CarVerticalVehicleCta from '../components/affiliate/CarVerticalVehicleCta';
import Footer from '../components/layout/Footer';
import { getTranslations } from '../lib/i18n';

describe('carVertical Affiliate URL Configuration & VIN Validation', () => {
  test('generates exact Homepage, Footer, and No-VIN Listing tracking URLs without duplicate params', () => {
    const homepageUrl = getCarVerticalHomepageUrl();
    const footerUrl = getCarVerticalFooterUrl();
    const listingNoVinUrl = getCarVerticalListingNoVinUrl();

    assert.equal(
      homepageUrl,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=homepage',
    );
    assert.equal(
      footerUrl,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=footer',
    );
    assert.equal(
      listingNoVinUrl,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );

    assert.equal(CARVERTICAL_URLS.homepage, homepageUrl);
    assert.equal(CARVERTICAL_URLS.footer, footerUrl);
    assert.equal(CARVERTICAL_URLS.listingNoVin, listingNoVinUrl);

    for (const url of [homepageUrl, footerUrl, listingNoVinUrl]) {
      const parsed = new URL(url);
      const keys = Array.from(parsed.searchParams.keys());
      assert.equal(keys.length, new Set(keys).size, 'No duplicate query parameters allowed');
      assert.equal(url.toLowerCase().includes('xxxxxxxxxxxxxxxxx'), false);
    }
  });

  test('validates and normalizes 17-character ISO 3779 VINs and rejects invalid or placeholder VINs', () => {
    // Valid 17-character VINs
    assert.equal(
      normalizeAndValidateVin('WAUZZZF40LA000001'),
      'WAUZZZF40LA000001',
    );
    assert.equal(
      normalizeAndValidateVin('  wba5j31060d123456 \n'),
      'WBA5J31060D123456',
    );

    // Invalid length
    assert.equal(normalizeAndValidateVin(''), null);
    assert.equal(normalizeAndValidateVin('   '), null);
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA00000'), null); // 16 chars
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA0000012'), null); // 18 chars
    assert.equal(normalizeAndValidateVin(null), null);
    assert.equal(normalizeAndValidateVin(undefined), null);

    // Disallowed ISO VIN characters: I, O, Q
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA00000I'), null);
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA00000O'), null);
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA00000Q'), null);

    // Non-alphanumeric / injection attempts
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA00000!'), null);
    assert.equal(normalizeAndValidateVin('WAUZZZF40LA000&a='), null);

    // Placeholder / repeated dummy VINs must NEVER be accepted
    assert.equal(normalizeAndValidateVin('xxxxxxxxxxxxxxxxx'), null);
    assert.equal(normalizeAndValidateVin('XXXXXXXXXXXXXXXXX'), null);
    assert.equal(normalizeAndValidateVin('00000000000000000'), null);
    assert.equal(normalizeAndValidateVin('11111111111111111'), null);
    assert.equal(normalizeAndValidateVin('WAUXXXXXXXXXXXXXX'), null);
  });

  test('generates pre-check VIN affiliate URL when carVerticalVinMode is WITH_VIN and VIN is valid, otherwise uses no-VIN URL', () => {
    // 1. Ima VIN selected (WITH_VIN) with valid 17-char VIN -> pre-check URL with uid=594 and sub3=<VIN>
    const withVin = getCarVerticalListingUrl('wauzzzf40la000001', {
      status: 'active',
      carVerticalVinMode: 'WITH_VIN',
    });
    assert.equal(withVin.hasValidVin, true);
    assert.equal(withVin.normalizedVin, 'WAUZZZF40LA000001');
    assert.equal(
      withVin.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?uid=594&source_id=AFF&sub1=mojautodiler&sub2=listing&sub3=WAUZZZF40LA000001',
    );

    // 2. Nema VIN selected (NO_VIN) even though vehicle has valid VIN in DB -> standard URL WITHOUT VIN
    const noVinWithStoredVin = getCarVerticalListingUrl('wauzzzf40la000001', {
      status: 'active',
      carVerticalVinMode: 'NO_VIN',
    });
    assert.equal(noVinWithStoredVin.hasValidVin, false);
    assert.equal(noVinWithStoredVin.normalizedVin, null);
    assert.equal(
      noVinWithStoredVin.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );
    assert.equal(noVinWithStoredVin.url.includes('uid='), false);
    assert.equal(noVinWithStoredVin.url.includes('sub3='), false);

    // 3. Default/missing carVerticalVinMode -> safe default NO_VIN
    const defaultMode = getCarVerticalListingUrl('wauzzzf40la000001', {
      status: 'active',
    });
    assert.equal(defaultMode.hasValidVin, false);
    assert.equal(defaultMode.normalizedVin, null);
    assert.equal(
      defaultMode.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );

    // 4. Missing VIN with WITH_VIN -> falls back to no-VIN URL
    const withoutVin = getCarVerticalListingUrl(undefined, {
      status: 'active',
      carVerticalVinMode: 'WITH_VIN',
    });
    assert.equal(withoutVin.hasValidVin, false);
    assert.equal(withoutVin.normalizedVin, null);
    assert.equal(
      withoutVin.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );

    // 5. Placeholder VIN with WITH_VIN -> falls back to no-VIN URL
    const placeholderAttempt = getCarVerticalListingUrl('xxxxxxxxxxxxxxxxx', {
      status: 'active',
      carVerticalVinMode: 'WITH_VIN',
    });
    assert.equal(placeholderAttempt.hasValidVin, false);
    assert.equal(placeholderAttempt.normalizedVin, null);
    assert.equal(
      placeholderAttempt.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );
    assert.equal(placeholderAttempt.url.toLowerCase().includes('xxxxxxxxxxxxxxxxx'), false);
  });

  test('never exposes VINs from draft (RESERVED) or hidden (HIDDEN) vehicles', () => {
    assert.equal(canExposeVehicleVinInAffiliateLink('active'), true);
    assert.equal(canExposeVehicleVinInAffiliateLink('sold'), true);
    assert.equal(canExposeVehicleVinInAffiliateLink('draft'), false);
    assert.equal(canExposeVehicleVinInAffiliateLink('hidden'), false);

    const draftVehicleLink = getCarVerticalVehicleListingLink({
      vin: 'WAUZZZF40LA000001',
      carVerticalVinMode: 'WITH_VIN',
      status: 'draft',
    });
    assert.equal(draftVehicleLink.hasValidVin, false);
    assert.equal(draftVehicleLink.normalizedVin, null);
    assert.equal(
      draftVehicleLink.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );

    const hiddenVehicleLink = getCarVerticalVehicleListingLink({
      vin: 'WAUZZZF40LA000001',
      carVerticalVinMode: 'WITH_VIN',
      status: 'hidden',
    });
    assert.equal(hiddenVehicleLink.hasValidVin, false);
    assert.equal(hiddenVehicleLink.normalizedVin, null);
    assert.equal(
      hiddenVehicleLink.url,
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing',
    );
  });

  test('exports compliant link attributes, partner sub1 parameter, and required official banner paths', () => {
    assert.equal(CARVERTICAL_AFFILIATE_REL, 'nofollow sponsored noopener noreferrer');
    assert.equal(CARVERTICAL_AFFILIATE_TARGET, '_blank');
    assert.equal(CARVERTICAL_PARTNER_SUB1, 'mojautodiler');
    assert.equal(CARVERTICAL_DISCOUNT_PERCENT, 20);
    assert.equal(CARVERTICAL_ASSETS.homepageBannerRs, '/carVertical asset/RS_728x180-4.png');
    assert.equal(CARVERTICAL_ASSETS.footerBannerRs, '/carVertical asset/RS_728x180.png');
    assert.ok(CARVERTICAL_ASSETS.logoPrimary.endsWith('.svg'));
  });
});

describe('carVertical Component Markup, SEO & Automatic 20% Discount Compliance', () => {
  test('Homepage hero banner renders RS_728x180-4.png, single <a> wrapper, and 20% popusta sa kodom MOJAUTODILER below banner', () => {
    const html = renderToStaticMarkup(
      React.createElement(CarVerticalHomepageSection, { locale: 'sr' }),
    );

    assert.ok(html.includes('<h2'));
    assert.equal(html.includes('<h1'), false, 'Must not introduce a second H1');
    assert.ok(html.includes('RS_728x180-4.png'));
    assert.ok(html.includes('20% POPUSTA'));
    assert.ok(html.includes('20% popusta sa kodom'));
    assert.ok(html.includes('MOJAUTODILER'));
    assert.ok(
      html.includes('Popust se automatski primenjuje putem našeg partnerskog linka.'),
    );
    assert.ok(html.includes('Proveri istoriju vozila'));
    assert.ok(html.includes('rel="nofollow sponsored noopener noreferrer"'));
    assert.ok(html.includes('target="_blank"'));
    assert.ok(
      html.includes(
        'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&amp;sub1=mojautodiler&amp;sub2=homepage',
      ),
    );

    // Must contain exactly ONE <a> element and ZERO <button> elements
    const anchorCount = (html.match(/<a\b/g) ?? []).length;
    const buttonCount = (html.match(/<button\b/g) ?? []).length;
    assert.equal(anchorCount, 1, 'Entire homepage hero banner must be wrapped in a single <a>');
    assert.equal(buttonCount, 0, 'Must not nest <button> inside <a>');

    // Code MOJAUTODILER must be visibly present
    const visibleText = html.replace(/<[^>]+>/g, ' ');
    assert.ok(visibleText.includes('MOJAUTODILER'));
  });

  test('Footer promotional banner renders RS_728x180.png, required Serbian copy, single <a> wrapper for promo block, and preserves /sr/blog link', () => {
    const t = getTranslations('sr');
    const html = renderToStaticMarkup(
      React.createElement(Footer, {
        locale: 'sr',
        t,
        dealer: {
          name: 'Moj Auto Diler',
          phone: '+38160000000',
          smsPhone: '+38160000000',
          viber: '+38160000000',
          email: 'info@mojautodiler.com',
          address: 'Beograd, Srbija',
          workingHours: 'Pon - Sub: 09:00 - 18:00',
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          mapUrl: '',
        },
      }),
    );

    assert.ok(html.includes('RS_728x180.png'));
    assert.equal(
      html.includes('RS_728x180-7.png'),
      false,
      'Must never substitute RS_728x180-7.png for footer',
    );
    assert.ok(html.includes('PROVERI PRE KUPOVINE'));
    assert.ok(html.includes('Kupuješ polovan automobil? Proveri njegovu istoriju.'));
    assert.ok(
      html.includes(
        'Uz carVertical saznaj više o dostupnoj istoriji vozila pre nego što doneseš odluku o kupovini.',
      ),
    );
    assert.ok(html.includes('data-variant="footer"'), 'Footer must use shared banner layout');
    const footerPromoCount = (html.match(/data-testid="carvertical-footer-cta"/g) ?? []).length;
    assert.equal(footerPromoCount, 1, 'Exactly one carVertical footer promotion');
    assert.ok(html.includes('20% POPUSTA'));
    assert.ok(
      html.includes('Popust se automatski primenjuje putem našeg partnerskog linka.'),
    );
    assert.ok(html.includes('Proveri istoriju vozila'));
    assert.ok(
      html.includes(
        'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&amp;sub1=mojautodiler&amp;sub2=footer',
      ),
    );
    assert.ok(html.includes('href="/sr/blog"'), 'Must preserve /sr/blog footer navigation link');
  });

  test('Homepage source renders carVertical hero → Aktuelna premium selekcija → Kupovina sa više sigurnosti without CSS order flipping', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
    const heroEnd = src.indexOf('end hero + izdvojena ponuda flex wrapper');
    const cv = src.indexOf('<CarVerticalHomepageSection');
    const featured = src.indexOf('copy.featuredTitle');
    const trust = src.indexOf('copy.trustTitle');
    assert.ok(heroEnd > 0 && cv > heroEnd, 'carVertical banner directly after hero');
    assert.ok(featured > cv, 'Aktuelna premium selekcija after carVertical banner');
    assert.ok(trust > featured, 'Kupovina sa više sigurnosti after Aktuelna premium selekcija');
    assert.equal((src.match(/<CarVerticalHomepageSection/g) ?? []).length, 1);
    assert.equal((src.match(/copy\.trustTitle/g) ?? []).length, 1);
    const between = src.slice(cv, trust);
    assert.equal(/sm:order-\d/.test(between), false, 'No CSS order classes may flip the sections');
  });

  test('Vehicle CTA component handles both VIN and no-VIN modes in a single <a> without leaking raw VIN or manual coupon code', () => {
    const secretVin = 'WAUZZZF40LA000001';

    const htmlWithVin = renderToStaticMarkup(
      React.createElement(CarVerticalVehicleCta, {
        vin: secretVin,
        carVerticalVinMode: 'WITH_VIN',
        status: 'active',
        locale: 'sr',
      }),
    );

    assert.ok(htmlWithVin.includes('data-vin-mode="vin"'));
    assert.ok(htmlWithVin.includes('ISTORIJA VOZILA'));
    assert.ok(htmlWithVin.includes('<h2'));
    assert.equal(htmlWithVin.includes('<h1'), false);
    assert.ok(htmlWithVin.includes('Proveri istoriju ovog vozila'));
    assert.ok(
      htmlWithVin.includes(
        'Saznaj više o dostupnoj istoriji automobila uz carVertical.',
      ),
    );
    assert.ok(htmlWithVin.includes('20% popusta sa kodom MOJAUTODILER'));
    assert.ok(
      htmlWithVin.includes('Popust se automatski primenjuje putem našeg partnerskog linka.'),
    );
    assert.ok(htmlWithVin.includes('Proveri istoriju vozila'));
    assert.ok(
      htmlWithVin.includes(
        `https://www.carvertical.deal/4FCPMH4/JRZRQN/?uid=594&amp;source_id=AFF&amp;sub1=mojautodiler&amp;sub2=listing&amp;sub3=${secretVin}`,
      ),
    );

    // Single <a> and zero <button>
    assert.equal((htmlWithVin.match(/<a\b/g) ?? []).length, 1);
    assert.equal((htmlWithVin.match(/<button\b/g) ?? []).length, 0);

    // Strip HTML tags to verify visible text does NOT reveal the VIN
    const visibleTextWithVin = htmlWithVin.replace(/<[^>]+>/g, ' ');
    assert.equal(
      visibleTextWithVin.includes(secretVin),
      false,
      'Must not reveal the VIN as visible text when existing public listing does not expose it',
    );

    const htmlWithoutVin = renderToStaticMarkup(
      React.createElement(CarVerticalVehicleCta, {
        vin: secretVin, // Stored VIN exists, but carVerticalVinMode is NO_VIN!
        carVerticalVinMode: 'NO_VIN',
        status: 'active',
        locale: 'sr',
      }),
    );

    assert.ok(htmlWithoutVin.includes('data-vin-mode="no-vin"'));
    assert.ok(
      htmlWithoutVin.includes(
        'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&amp;sub1=mojautodiler&amp;sub2=listing',
      ),
    );
    assert.equal(htmlWithoutVin.includes('uid=594'), false);
    assert.equal(htmlWithoutVin.includes('sub3='), false);
  });
});
