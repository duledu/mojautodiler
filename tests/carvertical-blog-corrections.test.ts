import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prisma } from '../lib/prisma';
import BlogContentRenderer from '../components/blog/BlogContentRenderer';
import type { BlogContentDocument } from '../types/blog';

describe('carVertical Partner Blog Corrections & Rendering Verification', () => {
  const stagingDir = path.join(process.cwd(), 'content', 'staging', 'seo-articles-2026');

  describe('1. Staging Markdown Source Files Verification', () => {
    test('Dizel, benzin ili hibrid contains exact wording "informacije o istoriji servisa"', () => {
      const file = path.join(stagingDir, 'article-05-dizel-benzin-ili-hibrid-2027.md');
      const text = fs.readFileSync(file, 'utf8');
      assert.ok(
        text.includes('informacije o istoriji servisa'),
        'Must contain "informacije o istoriji servisa"',
      );
      assert.ok(
        !text.includes('uvid u kompletnu servisnu hronologiju'),
        'Must not contain outdated "uvid u kompletnu servisnu hronologiju"',
      );
    });

    test('Švajcarska contains exact wording "- Informacije o opremi i motoru"', () => {
      const file = path.join(stagingDir, 'article-04-polovni-automobili-iz-svajcarske.md');
      const text = fs.readFileSync(file, 'utf8');
      assert.ok(
        text.includes('- Informacije o opremi i motoru'),
        'Must contain "- Informacije o opremi i motoru"',
      );
      assert.ok(
        !text.includes('Verifikacija fabričke specifikacije opreme i motora'),
        'Must not contain outdated "Verifikacija fabričke specifikacije opreme i motora"',
      );
    });

    test('Oštećenja contains exact wording "možete proveriti informacije o udesima"', () => {
      const file = path.join(stagingDir, 'article-03-istorija-ostecenja-polovnih-automobila.md');
      const text = fs.readFileSync(file, 'utf8');
      assert.ok(
        text.includes('možete proveriti informacije o udesima'),
        'Must contain "možete proveriti informacije o udesima"',
      );
      assert.ok(
        !text.includes('možete odmah saznati da li je automobil učestvovao u udesima'),
        'Must not contain outdated "možete odmah saznati da li je automobil učestvovao u udesima"',
      );
    });

    test('Oštećenja contains the exact 40,8% statistic provided by carVertical for Serbia', () => {
      const file = path.join(stagingDir, 'article-03-istorija-ostecenja-polovnih-automobila.md');
      const text = fs.readFileSync(file, 'utf8');
      assert.ok(
        text.includes('40,8%'),
        'Must contain 40,8% statistic',
      );
    });

    test('All 5 staging markdown articles have zero em dashes (—)', () => {
      const files = [
        'article-01-cene-polovnih-automobila-srbija-2026.md',
        'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
        'article-03-istorija-ostecenja-polovnih-automobila.md',
        'article-04-polovni-automobili-iz-svajcarske.md',
        'article-05-dizel-benzin-ili-hibrid-2027.md',
      ];
      for (const fileName of files) {
        const text = fs.readFileSync(path.join(stagingDir, fileName), 'utf8');
        assert.equal(
          text.includes('—'),
          false,
          `File ${fileName} must not contain any em dashes (—)`,
        );
      }
    });

    test('All 5 staging markdown articles have zero affiliate commission disclosures', () => {
      const files = [
        'article-01-cene-polovnih-automobila-srbija-2026.md',
        'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
        'article-03-istorija-ostecenja-polovnih-automobila.md',
        'article-04-polovni-automobili-iz-svajcarske.md',
        'article-05-dizel-benzin-ili-hibrid-2027.md',
      ];
      const forbiddenPhrases = [
        'MojAutoDiler ostvaruje posredničku naknadu',
        'MojAutoDiler ostvaruje proviziju',
        'MojAutoDiler ostvaruje naknadu',
        'Napomena o partnerstvu',
        'Transparentnost partnerstva',
        'Partnerska transparentnost',
      ];
      for (const fileName of files) {
        const text = fs.readFileSync(path.join(stagingDir, fileName), 'utf8');
        for (const phrase of forbiddenPhrases) {
          assert.equal(
            text.includes(phrase),
            false,
            `File ${fileName} must not contain "${phrase}"`,
          );
        }
      }
    });

    test('manifest.json does not contain affiliate commission disclosure', () => {
      const manifestPath = path.join(stagingDir, 'manifest.json');
      const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
      assert.equal(manifestRaw.includes('MojAutoDiler ostvaruje posredničku'), false);
      assert.equal(manifestRaw.includes('posredničku proviziju'), false);
    });
  });

  describe('2. Explicit Scoping & BlogContentRenderer Verification', () => {
    test('renders carVertical callout with semantic H3, UL/LI list, and safe affiliate link', () => {
      const sampleDocument: BlogContentDocument = {
        version: 1,
        blocks: [
          {
            type: 'blockquote',
            children: [
              {
                type: 'text',
                text: '### 🔍 carVertical partnerska provera istorije vozila\nPre nego što uplatite kaparu, proverite digitalni dosije automobila.\n',
              },
              {
                type: 'text',
                bold: true,
                text: 'Šta izveštaj može otkriti:',
              },
              {
                type: 'text',
                text: '\n- Hronološki grafikon zabeležene kilometraže\n- Prethodna oštećenja i procene štete\n- Status u bazama ukradenih automobila\n🎁 ',
              },
              {
                type: 'text',
                bold: true,
                text: 'Poseban popust za posetioce MojAutoDiler portala:',
              },
              {
                type: 'text',
                text: '\nUnesite promotivni kod ',
              },
              {
                type: 'text',
                bold: true,
                text: 'MOJAUTODILER',
              },
              {
                type: 'text',
                text: ' i ostvarite ',
              },
              {
                type: 'text',
                bold: true,
                text: '20% popusta',
              },
              {
                type: 'text',
                text: ' na svaki carVertical izveštaj.\n👉 ',
              },
              {
                type: 'link',
                href: 'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=blog',
                text: 'Proverite istoriju vozila na carVertical portalu (20% popusta)',
              },
              {
                type: 'text',
                text: '\n',
              },
              {
                type: 'text',
                italic: true,
                text: 'Napomena o partnerstvu: MojAutoDiler ostvaruje naknadu ukoliko naručite izveštaj putem našeg linka. Dostupnost podataka zavisi od vozila i izvora.',
              },
            ],
          },
        ],
      };

      const html = renderToStaticMarkup(
        React.createElement(BlogContentRenderer, { document: sampleDocument }),
      );

      // Verify no raw Markdown heading symbol
      assert.ok(!html.includes('###'), 'HTML must not contain literal ###');
      // Verify semantic H3 element exists with text
      assert.ok(html.includes('<h3'), 'HTML must render an <h3> element');
      assert.ok(html.includes('carVertical partnerska provera istorije vozila'), 'H3 must contain title');

      // Verify bullet list is rendered as <ul> and <li>
      assert.ok(html.includes('<ul'), 'HTML must render an <ul> element');
      assert.ok(html.includes('<li'), 'HTML must render <li> elements');
      assert.ok(html.includes('Hronološki grafikon zabeležene kilometraže'), 'LI must contain item 1');
      assert.ok(html.includes('Prethodna oštećenja i procene štete'), 'LI must contain item 2');

      // Verify affiliate link attributes
      assert.ok(
        html.includes('href="https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&amp;sub1=mojautodiler&amp;sub2=blog"'),
        'Affiliate URL and query parameters must be intact',
      );
      assert.ok(html.includes('target="_blank"'), 'Link must open in new tab');
      assert.ok(html.includes('rel="sponsored noopener noreferrer"'), 'Link must have sponsored rel');

      // Verify promo discount code container
      assert.ok(html.includes('MOJAUTODILER'), 'Must render promo code');
      assert.ok(html.includes('20% popusta'), 'Must render discount amount');

      // Verify commission statement is stripped and data disclaimer is preserved
      assert.ok(!html.includes('Napomena o partnerstvu'), 'Must NOT render commission disclosure');
      assert.ok(!html.includes('MojAutoDiler ostvaruje'), 'Must NOT render commission statement');
      assert.ok(html.includes('Dostupnost podataka zavisi od vozila i izvora.'), 'Must render data availability disclaimer');
    });

    test('preserves ordinary blockquotes without transforming them into structured callouts', () => {
      const ordinaryQuoteDoc: BlogContentDocument = {
        version: 1,
        blocks: [
          {
            type: 'blockquote',
            children: [
              {
                type: 'text',
                italic: true,
                text: '„Ko u nameri da sebi ili drugom pribavi protivpravnu imovinsku korist dovede koga lažnim prikazivanjem ili prikrivanjem činjenica u zabludu...”',
              },
            ],
            citation: 'Krivični zakonik Republike Srbije, Član 208',
          },
          {
            type: 'blockquote',
            children: [
              {
                type: 'text',
                text: '⚠️ ',
              },
              {
                type: 'text',
                bold: true,
                text: 'Obavezna preporuka:',
              },
              {
                type: 'text',
                text: ' Nikada nemojte kupovati automobil iz Švajcarske bez pregleda na stubnoj dizalici.',
              },
            ],
          },
        ],
      };

      const html = renderToStaticMarkup(
        React.createElement(BlogContentRenderer, { document: ordinaryQuoteDoc }),
      );

      // Ordinary quotes must NOT contain H3 or UL/LI
      assert.ok(!html.includes('<h3'), 'Ordinary blockquote must NOT generate an <h3> element');
      assert.ok(!html.includes('<ul'), 'Ordinary blockquote must NOT generate an <ul> element');
      assert.ok(!html.includes('<li'), 'Ordinary blockquote must NOT generate <li> elements');

      // Citation must preserve original dash and text without global alteration
      assert.ok(html.includes('— Krivični zakonik Republike Srbije, Član 208'), 'Must preserve original citation');
      assert.ok(html.includes('px-5 py-4'), 'Must retain original blockquote padding');
    });

    test('applies exact partner text corrections without modifying unrelated punctuation or em dashes', () => {
      const docWithText: BlogContentDocument = {
        version: 1,
        blocks: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Pre kupovine carVertical izveštaj vam omogućava uvid u kompletnu servisnu hronologiju pre kupovine.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Glavna stavka jeste Verifikacija fabričke specifikacije opreme i motora.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Preko broja šasije možete odmah saznati da li je automobil učestvovao u udesima.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Često se pominju cifre od 40% do čak 55% proverenih automobila.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Ovo je rečenica — koja sadrži crtu i ne treba je automatski brisati.',
              },
            ],
          },
        ],
      };

      const html = renderToStaticMarkup(
        React.createElement(BlogContentRenderer, { document: docWithText }),
      );

      // Verify Correction 1: Dizel
      assert.ok(
        html.includes('informacije o istoriji servisa'),
        'Must replace "uvid u kompletnu servisnu hronologiju" with "informacije o istoriji servisa"',
      );
      assert.ok(!html.includes('uvid u kompletnu servisnu hronologiju'));

      // Verify Correction 2: Švajcarska
      assert.ok(
        html.includes('Informacije o opremi i motoru'),
        'Must replace "Verifikacija fabričke specifikacije opreme i motora" with "Informacije o opremi i motoru"',
      );
      assert.ok(!html.includes('Verifikacija fabričke specifikacije opreme i motora'));

      // Verify Correction 3: Oštećenja
      assert.ok(
        html.includes('možete proveriti informacije o udesima'),
        'Must replace "možete odmah saznati da li je automobil učestvovao u udesima" with "možete proveriti informacije o udesima"',
      );
      assert.ok(!html.includes('možete odmah saznati da li je automobil učestvovao u udesima'));

      // Verify Correction 4: 40,8% statistic
      assert.ok(
        html.includes('40,8%'),
        'Must replace "40% do čak 55%" with "40,8%"',
      );
      assert.ok(!html.includes('40% do čak 55%'));

      // Verify NO global punctuation stripping: unrelated em dash is preserved as-is
      assert.ok(
        html.includes('Ovo je rečenica — koja sadrži crtu i ne treba je automatski brisati.'),
        'Unrelated editorial punctuation must NOT be modified by BlogContentRenderer',
      );
    });
  });

  describe('3. Database Isolation, Safety & DRAFT Integrity Verification', () => {
    test('all 5 blog articles in Neon DB are in DRAFT status with publishedAt null and noindex true', async () => {
      const slugs = [
        'cene-polovnih-automobila-u-srbiji-2026',
        'vracena-kilometraza-kako-prepoznati-prevaru',
        'istorija-ostecenja-polovnih-automobila',
        'polovni-automobili-iz-svajcarske',
        'dizel-benzin-ili-hibrid-2027',
      ];

      const posts = await prisma.blogPost.findMany({
        where: { slug: { in: slugs } },
        select: {
          slug: true,
          status: true,
          publishedAt: true,
          noindex: true,
          content: true,
        },
      });

      assert.equal(posts.length, 5, 'All 5 articles must exist in database');

      for (const p of posts) {
        assert.equal(p.status, 'DRAFT', `Post ${p.slug} must be in DRAFT status`);
        assert.equal(p.publishedAt, null, `Post ${p.slug} must have publishedAt as null`);
        assert.equal(p.noindex, true, `Post ${p.slug} must have noindex set to true`);

        assert.doesNotThrow(() => {
          const doc = JSON.parse(p.content);
          assert.equal(doc.version, 1);
          assert.ok(Array.isArray(doc.blocks));
        }, `Post ${p.slug} content must be valid structured JSON`);
      }
    });

    test('all 4 articles render successfully through BlogContentRenderer with zero errors', async () => {
      const posts = await prisma.blogPost.findMany({
        where: {
          slug: {
            in: [
              'vracena-kilometraza-kako-prepoznati-prevaru',
              'istorija-ostecenja-polovnih-automobila',
              'polovni-automobili-iz-svajcarske',
              'dizel-benzin-ili-hibrid-2027',
            ],
          },
        },
        select: { slug: true, content: true },
      });

      for (const p of posts) {
        const doc: BlogContentDocument = JSON.parse(p.content);
        const html = renderToStaticMarkup(
          React.createElement(BlogContentRenderer, { document: doc }),
        );

        assert.ok(html.length > 500, `Post ${p.slug} must render substantive HTML`);
        assert.ok(!html.includes('###'), `Post ${p.slug} must not have literal ### in rendered HTML`);
        assert.ok(html.includes('<h3'), `Post ${p.slug} must render <h3> element`);
        assert.ok(html.includes('<ul'), `Post ${p.slug} must render <ul> element`);
        assert.ok(html.includes('<li'), `Post ${p.slug} must render <li> elements`);
        assert.ok(
          html.includes('https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&amp;sub1=mojautodiler&amp;sub2=blog'),
          `Post ${p.slug} must preserve affiliate URL`,
        );
      }
    });
  });

  describe('4. Sitewide Affiliate Disclosure Cleanup Verification', () => {
    test('rendered HTML of all 4 articles has zero occurrences of affiliate commission disclosures', async () => {
      const posts = await prisma.blogPost.findMany({
        where: {
          slug: {
            in: [
              'vracena-kilometraza-kako-prepoznati-prevaru',
              'istorija-ostecenja-polovnih-automobila',
              'polovni-automobili-iz-svajcarske',
              'dizel-benzin-ili-hibrid-2027',
            ],
          },
        },
        select: { slug: true, content: true },
      });

      const forbiddenPhrases = [
        'MojAutoDiler ostvaruje posredničku naknadu',
        'MojAutoDiler ostvaruje proviziju',
        'MojAutoDiler ostvaruje naknadu',
        'Napomena o partnerstvu',
        'Transparentnost partnerstva',
        'Partnerska transparentnost',
        'posredničku naknadu',
      ];

      for (const p of posts) {
        const doc: BlogContentDocument = JSON.parse(p.content);
        const html = renderToStaticMarkup(
          React.createElement(BlogContentRenderer, { document: doc }),
        );

        for (const phrase of forbiddenPhrases) {
          assert.equal(
            html.includes(phrase),
            false,
            `Rendered HTML of ${p.slug} must not contain "${phrase}"`,
          );
        }

        // Verify data availability notice IS retained
        assert.ok(
          html.includes('Dostupnost podataka zavisi od vozila i izvora.'),
          `Rendered HTML of ${p.slug} must retain data availability disclaimer`,
        );

        // Verify HTML entities are clean
        assert.equal(html.includes('&#xA0;'), false, 'Must not contain &#xA0;');
        assert.equal(html.includes('&#x20;'), false, 'Must not contain &#x20;');
      }
    });
  });
});
