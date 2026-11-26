import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BlogShareButton, { buildBlogShareUrls } from '../components/blog/BlogShareButton';

describe('Auto magazin UX: Fixed Header Offset & Article Share Button', () => {
  test('both Auto magazin listing and article detail pages apply systemic pt-20 offset below fixed header', () => {
    const listingSrc = fs.readFileSync(
      path.join(process.cwd(), 'app', '[locale]', 'blog', 'page.tsx'),
      'utf8',
    );
    const articleSrc = fs.readFileSync(
      path.join(process.cwd(), 'app', '[locale]', 'blog', '[slug]', 'page.tsx'),
      'utf8',
    );

    assert.ok(
      listingSrc.includes('className="min-h-screen bg-[var(--color-bg)] pt-20"'),
      'Blog listing page must apply pt-20 to clear the fixed header',
    );
    assert.ok(
      articleSrc.includes('className="min-h-screen bg-[var(--color-bg)] pt-20"'),
      'Blog article page must apply pt-20 to clear the fixed header',
    );
  });

  test('buildBlogShareUrls constructs valid Facebook, WhatsApp, and Viber share links with canonical URL', () => {
    const canonical = 'https://www.mojautodiler.com/sr/blog/dizel-benzin-ili-hibrid-2027';
    const title = 'Dizel, benzin ili hibrid: Šta kupiti u 2027?';
    const urls = buildBlogShareUrls(canonical, title);

    assert.equal(
      urls.facebook,
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`,
    );
    assert.equal(
      urls.whatsapp,
      `https://wa.me/?text=${encodeURIComponent(`${title} ${canonical}`)}`,
    );
    assert.equal(
      urls.viber,
      `viber://forward?text=${encodeURIComponent(`${title} ${canonical}`)}`,
    );
  });

  test('BlogShareButton renders accessible Podeli button and article page passes canonical URL', () => {
    const html = renderToStaticMarkup(
      React.createElement(BlogShareButton, {
        url: 'https://www.mojautodiler.com/sr/blog/dizel-benzin-ili-hibrid-2027',
        title: 'Dizel, benzin ili hibrid: Šta kupiti u 2027?',
      }),
    );

    assert.ok(html.includes('Podeli'), 'Must render "Podeli" button label');
    assert.ok(html.includes('aria-label="Podeli članak"'), 'Must include accessible aria-label');
    assert.ok(html.includes('aria-haspopup="menu"'), 'Must declare menu popup semantics');

    const articleSrc = fs.readFileSync(
      path.join(process.cwd(), 'app', '[locale]', 'blog', '[slug]', 'page.tsx'),
      'utf8',
    );
    assert.ok(
      articleSrc.includes('<BlogShareButton url={canonicalUrl} title={post.title} />'),
      'Article page must pass canonicalUrl and post.title to BlogShareButton',
    );
    assert.ok(
      articleSrc.indexOf('<h1') < articleSrc.indexOf('<BlogShareButton'),
      'BlogShareButton must be positioned below the article H1 title',
    );
  });
});
