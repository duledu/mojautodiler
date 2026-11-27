import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateMetadata as generateHomeMetadata } from '@/app/[locale]/page';

describe('SEO Package 1 — "Polovni automobili" Homepage Focus', () => {
  test('preserves /sr title starting with "Polovni automobili" and single brand mention', async () => {
    const meta = await generateHomeMetadata({ params: Promise.resolve({ locale: 'sr' }) });
    const title =
      meta.title && typeof meta.title === 'object' && 'absolute' in meta.title
        ? String(meta.title.absolute)
        : '';

    assert.equal(title, 'Polovni automobili - Oglasi i prodaja vozila u Srbiji | MojAutoDiler');
    assert.ok(title.startsWith('Polovni automobili'));
    assert.equal((title.match(/Moj\s*Auto\s*Diler/gi) ?? []).length, 1);
    assert.equal(meta.alternates?.canonical, '/sr');
    assert.equal(
      meta.description,
      'Pogledajte aktuelne oglase za polovne automobile u Srbiji. Istražite vozila iz uvoza sa partnerskih auto-placeva, uz fotografije i podatke o svakom vozilu.',
    );
    assert.equal(meta.description.includes('—'), false, 'Meta description must not contain em dashes');
  });

  test('homepage sets exact visible H1 "Polovni automobili", primary CTA "Pogledaj sve automobile", and active category links', () => {
    const src = readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
    assert.ok(src.includes("featuredTitle: 'Polovni automobili'"));
    assert.ok(src.includes("primary: 'Pogledaj sve automobile'"));
    assert.ok(src.includes("viewAll: 'Pogledaj sve automobile'"));
    assert.ok(src.includes('/sr/cars/bmw'));
    assert.ok(src.includes('/sr/cars/audi'));
    assert.ok(src.includes('/sr/cars/volkswagen'));
    assert.ok(src.includes('/sr/model/bmw-x5'));
    assert.ok(src.includes('/sr/model/bmw-x3'));
    assert.ok(src.includes('/sr/model/audi-a4'));
    assert.ok(src.includes('/sr/model/golf-6'));
    assert.ok(src.includes('/sr/blog/polovni-automobili-iz-svajcarske'));
  });
});
