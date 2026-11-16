import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';

import {
  FOOTER_PLATFORM_DESCRIPTION,
  LEGAL_LAST_UPDATED_PLACEHOLDER,
  LEGAL_RESPONSIBILITY_CANONICAL_PATH,
  LEGAL_RESPONSIBILITY_PAGE,
  LEGAL_RESPONSIBILITY_PATH,
  VEHICLE_DETAIL_DISCLAIMER,
} from '../lib/legal/responsibility-disclaimer';
import Footer from '../components/layout/Footer';
import VehicleLegalDisclaimer from '../components/vehicle/VehicleLegalDisclaimer';
import ResponsibilityDisclaimerContent from '../components/legal/ResponsibilityDisclaimerContent';
import { generateMetadata as generateLegalMetadata } from '../app/[locale]/podela-odgovornosti/page';
import { getTranslations } from '../lib/i18n';

const SAMPLE_DEALER = {
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
};

describe('Legal Protection & Responsibility Disclaimer System', () => {
  test('TASK 1: Footer integrates "O platformi MojAutoDiler", exact Serbian copy, and /sr/podela-odgovornosti/ link while preserving existing elements', () => {
    const t = getTranslations('sr');
    const html = renderToStaticMarkup(
      React.createElement(Footer, {
        locale: 'sr',
        t,
        dealer: SAMPLE_DEALER,
      }),
    );

    assert.ok(html.includes(FOOTER_PLATFORM_DESCRIPTION.title));
    assert.ok(html.includes(VEHICLE_DETAIL_DISCLAIMER.linkHref));
    assert.ok(
      html.includes(
        'MojAutoDiler.com je besplatna informativno-oglasna platforma koja trenutno ne ostvaruje prihod, a čiji je cilj da kupcima polovnih automobila olakša pronalaženje, pregled i izbor vozila.',
      ),
    );
    assert.ok(
      html.includes(
        'Na jednom mestu predstavljamo pažljivo odabranu ponudu partnerskih auto-placeva, sa željom da proces kupovine polovnog automobila učinimo jednostavnijim, preglednijim i sigurnijim kroz bolju informisanost kupaca.',
      ),
    );
    assert.ok(
      html.includes(
        'MojAutoDiler nije prodavac oglašenih vozila, ne učestvuje u zaključivanju kupoprodajnih ugovora i ne garantuje njihovu tehničku ispravnost, kvalitet, poreklo niti pravni status. Za tačnost podataka o vozilu i uslove prodaje odgovoran je oglašivač, u skladu sa važećim zakonom.',
      ),
    );

    // Legal navigation link
    assert.ok(html.includes('Podela odgovornosti'));
    assert.ok(html.includes('href="/sr/podela-odgovornosti/"'));

    // Existing navigation & carVertical promo preserved
    assert.ok(html.includes('href="/sr/blog"'));
    assert.ok(html.includes('href="/sr/inventory"'));
    assert.ok(html.includes('href="/sr/contact"'));
    assert.ok(html.includes('RS_728x180.png'));
    assert.ok(html.includes('MOJAUTODILER'));

    // Must not describe MojAutoDiler as a registered nonprofit organization
    assert.equal(html.toLowerCase().includes('neprofitna organizacija'), false);
    assert.equal(html.toLowerCase().includes('udruženje građana'), false);
  });

  test('TASK 2: Vehicle Detail Disclaimer renders exact heading, copy, and link without duplication', () => {
    const html = renderToStaticMarkup(React.createElement(VehicleLegalDisclaimer));

    assert.ok(html.includes('Važne informacije o oglasu'));
    assert.ok(
      html.includes(
        'Vozilo prikazano u ovom oglasu deo je ponude partnerskog auto-placa. MojAutoDiler.com služi za predstavljanje vozila i povezivanje zainteresovanih kupaca sa prodavcima i ne učestvuje u samoj kupoprodaji.',
      ),
    );
    assert.ok(
      html.includes(
        'Informacije o vozilu potiču od oglašivača i drugih dostupnih izvora. MojAutoDiler ne garantuje njihovu potpunost i tačnost, niti tehničku ispravnost, kilometražu, istoriju ili pravni status vozila.',
      ),
    );
    assert.ok(
      html.includes(
        'Pre kupovine preporučujemo nezavisnu proveru vozila, dokumentacije i uslova prodaje.',
      ),
    );
    assert.ok(html.includes('Detaljnije o odgovornosti platforme'));
    assert.ok(html.includes(`href="${LEGAL_RESPONSIBILITY_PATH}"`));

    // Verify VehicleDetailClient mounts VehicleLegalDisclaimer once after CarVerticalVehicleCta
    const detailClientSrc = readFileSync(
      new URL('../components/vehicle/VehicleDetailClient.tsx', import.meta.url),
      'utf8',
    );
    const cvIndex = detailClientSrc.indexOf('<CarVerticalVehicleCta');
    const disclaimerIndex = detailClientSrc.indexOf('<VehicleLegalDisclaimer');
    assert.ok(cvIndex > 0, 'CarVerticalVehicleCta must remain present');
    assert.ok(disclaimerIndex > cvIndex, 'VehicleLegalDisclaimer placed below primary vehicle info & carVertical CTA');
    assert.equal(
      (detailClientSrc.match(/<VehicleLegalDisclaimer/g) ?? []).length,
      1,
      'Must not duplicate the disclaimer on vehicle detail pages',
    );
    assert.equal(
      detailClientSrc.includes('vehicleDetailCopy.platformDisclaimer'),
      false,
      'Old duplicate inline disclaimer removed from seller card',
    );
  });

  test('TASK 3: Dedicated Legal Responsibility Page renders single H1, 12 H2 sections, exact Serbian legal text, and pending publication placeholder', () => {
    const html = renderToStaticMarkup(
      React.createElement(ResponsibilityDisclaimerContent, { locale: 'sr' }),
    );

    // Exactly one semantic H1
    const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g) ?? [];
    assert.equal(h1Matches.length, 1, 'Must render exactly one semantic H1');
    assert.ok(h1Matches[0].includes('Podela odgovornosti i odricanje od odgovornosti'));

    // 12 H2 sections
    const h2Matches = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g) ?? [];
    assert.equal(h2Matches.length, 12, 'Must render all 12 H2 legal sections');

    const expectedHeadings = [
      '1. Svrha i priroda platforme',
      '2. Poreklo i izbor oglašenih vozila',
      '3. Odgovornost za informacije u oglasima',
      '4. Kupoprodaja vozila',
      '5. Tehnička ispravnost i istorija vozila',
      '6. Partnerske usluge i carVertical',
      '7. Besplatno korišćenje platforme',
      '8. Ograničenje odgovornosti',
      '9. Preporuke kupcima',
      '10. Prijava nepravilnosti',
      '11. Prava korisnika i važeći propisi',
      '12. Izmene obaveštenja',
    ];

    expectedHeadings.forEach((heading, idx) => {
      assert.ok(
        h2Matches[idx].includes(heading),
        `H2 #${idx + 1} should include "${heading}"`,
      );
    });

    // Verify all paragraphs and bullets from LEGAL_RESPONSIBILITY_PAGE are rendered
    for (const section of LEGAL_RESPONSIBILITY_PAGE.sections) {
      for (const p of section.paragraphs ?? []) {
        assert.ok(html.includes(p), `Missing paragraph: ${p}`);
      }
      for (const p of section.paragraphsBeforeBullets ?? []) {
        assert.ok(html.includes(p), `Missing paragraph before bullets: ${p}`);
      }
      for (const bullet of section.bullets ?? []) {
        assert.ok(html.includes(bullet), `Missing bullet item: ${bullet}`);
      }
      for (const p of section.paragraphsAfterBullets ?? []) {
        assert.ok(html.includes(p), `Missing paragraph after bullets: ${p}`);
      }
    }

    // Verify last updated label and explicit pending-publication placeholder
    assert.ok(html.includes('Poslednje ažuriranje:'));
    assert.ok(html.includes(LEGAL_LAST_UPDATED_PLACEHOLDER));

    // Verify no nonprofit misrepresentation
    assert.equal(html.toLowerCase().includes('neprofitna organizacija'), false);
  });

  test('TASK 5: Legal page SEO metadata and sitemap configuration', async () => {
    const metadata = await generateLegalMetadata({
      params: Promise.resolve({ locale: 'sr' }),
    });

    assert.equal(
      metadata.title,
      'Podela odgovornosti i odricanje od odgovornosti | Moj Auto Diler',
    );
    assert.ok(
      typeof metadata.description === 'string' &&
        metadata.description.includes('MojAutoDiler.com'),
    );
    assert.equal(
      metadata.alternates?.canonical,
      LEGAL_RESPONSIBILITY_CANONICAL_PATH,
    );

    const sitemapSrc = readFileSync(
      new URL('../app/sitemap.ts', import.meta.url),
      'utf8',
    );
    assert.ok(
      sitemapSrc.includes('/sr/podela-odgovornosti'),
      'Sitemap must include /sr/podela-odgovornosti',
    );
  });
});
