import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Footer from '../components/layout/Footer';
import { getTranslations } from '../lib/i18n';
import {
  CARVERTICAL_URLS,
  getCarVerticalBlogUrl,
} from '../lib/affiliate/carvertical';
import { buildBlogListingMetadata } from '../lib/seo/blog-seo';

describe('Auto magazin Navigation, Footer & First Article Readiness', () => {
  test('i18n nav.blog uses "Auto magazin" and Footer preserves /sr/blog URL', () => {
    const tSr = getTranslations('sr');
    const tSq = getTranslations('sq');
    assert.equal(tSr.nav.blog, 'Auto magazin');
    assert.equal(tSq.nav.blog, 'Auto magazin');

    const footerHtml = renderToStaticMarkup(
      React.createElement(Footer, {
        locale: 'sr',
        t: tSr,
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

    assert.ok(footerHtml.includes('href="/sr/blog"'));
    assert.ok(footerHtml.includes('>Auto magazin<'));
    assert.equal(footerHtml.includes('>Blog<'), false, 'Footer must no longer label /sr/blog as "Blog"');
  });

  test('Header source contains Početna, Vozila, Auto magazin (/sr/blog), Kontakt in order with active state', () => {
    const headerSrc = fs.readFileSync(
      path.join(process.cwd(), 'components', 'layout', 'Header.tsx'),
      'utf8',
    );

    const idxHome = headerSrc.indexOf('label: t.nav.home');
    const idxInventory = headerSrc.indexOf('label: t.nav.inventory');
    const idxBlog = headerSrc.indexOf("href: '/sr/blog', label: t.nav.blog");
    const idxContact = headerSrc.indexOf('label: t.nav.contact');

    assert.ok(idxHome > 0 && idxInventory > idxHome && idxBlog > idxInventory && idxContact > idxBlog,
      'Header navLinks must be ordered: Početna, Vozila, Auto magazin, Kontakt');
    assert.ok(headerSrc.includes('isLinkActive'), 'Header must use segment-safe active state helper');
    assert.ok(headerSrc.includes("aria-current={isActive ? 'page' : undefined}"), 'Header links must set aria-current');
    assert.ok(headerSrc.includes("locale === 'sq' ? 'Navigimi kryesor' : 'Glavna navigacija'"), 'Header nav aria-label must be localized for sr and sq');
  });

  test('Auto magazin listing metadata has zero em dashes and preserves canonical /sr/blog', () => {
    const meta = buildBlogListingMetadata();
    const title = typeof meta.title === 'object' && meta.title && 'absolute' in meta.title
      ? String(meta.title.absolute)
      : '';
    assert.ok(title.includes('Auto magazin'));
    assert.equal(title.includes('—'), false, 'Listing title must not contain em dashes');
    assert.equal(meta.alternates?.canonical, 'https://www.mojautodiler.com/sr/blog');
  });

  test('carVertical blog affiliate helper returns exact approved sub2=blog URL', () => {
    const expected = 'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=blog';
    assert.equal(getCarVerticalBlogUrl(), expected);
    assert.equal(CARVERTICAL_URLS.blog, expected);
  });

  test('First launch article cover assets exist on disk', () => {
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', 'blog', 'vracena-kilometraza-prevara-provera.webp')));
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', 'blog', 'vracena-kilometraza-prevara-provera.jpg')));
  });
});
