import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  KNOWN_BLOG_TRACKING_ENTRIES,
  formatBlogTrackingId,
  getBlogTrackingId,
  getNextBlogTrackingId,
  parseBlogTrackingId,
} from '../lib/blog-tracking';

describe('Blog Internal Article Tracking System (BLOG-001 - BLOG-005)', () => {
  test('defines exactly 5 permanent initial tracking entries in sequence', () => {
    assert.equal(KNOWN_BLOG_TRACKING_ENTRIES.length, 5);

    const expected = [
      { id: 'BLOG-001', num: 1, slug: 'cene-polovnih-automobila-u-srbiji-2026', legacy: 'art-2026-001' },
      { id: 'BLOG-002', num: 2, slug: 'vracena-kilometraza-kako-prepoznati-prevaru', legacy: 'art-2026-002' },
      { id: 'BLOG-003', num: 3, slug: 'istorija-ostecenja-polovnih-automobila', legacy: 'art-2026-003' },
      { id: 'BLOG-004', num: 4, slug: 'polovni-automobili-iz-svajcarske', legacy: 'art-2026-004' },
      { id: 'BLOG-005', num: 5, slug: 'dizel-benzin-ili-hibrid-2027', legacy: 'art-2026-005' },
    ];

    for (let i = 0; i < expected.length; i++) {
      const entry = KNOWN_BLOG_TRACKING_ENTRIES[i];
      assert.equal(entry.trackingId, expected[i].id);
      assert.equal(entry.articleNumber, expected[i].num);
      assert.equal(entry.slug, expected[i].slug);
      assert.equal(entry.legacyId, expected[i].legacy);
    }
  });

  test('formats numbers to BLOG-XXX format with zero-padding', () => {
    assert.equal(formatBlogTrackingId(1), 'BLOG-001');
    assert.equal(formatBlogTrackingId(5), 'BLOG-005');
    assert.equal(formatBlogTrackingId(42), 'BLOG-042');
    assert.equal(formatBlogTrackingId(100), 'BLOG-100');
    assert.throws(() => formatBlogTrackingId(0), /positive integer/);
    assert.throws(() => formatBlogTrackingId(-1), /positive integer/);
  });

  test('parses BLOG-XXX strings to positive integer values', () => {
    assert.equal(parseBlogTrackingId('BLOG-001'), 1);
    assert.equal(parseBlogTrackingId('blog-005'), 5);
    assert.equal(parseBlogTrackingId('BLOG-120'), 120);
    assert.equal(parseBlogTrackingId('invalid-001'), null);
    assert.equal(parseBlogTrackingId(null), null);
    assert.equal(parseBlogTrackingId(''), null);
  });

  test('resolves tracking ID from slug or post object without breaking existing data', () => {
    assert.equal(
      getBlogTrackingId('cene-polovnih-automobila-u-srbiji-2026'),
      'BLOG-001',
    );
    assert.equal(
      getBlogTrackingId({ slug: 'vracena-kilometraza-kako-prepoznati-prevaru' }),
      'BLOG-002',
    );
    assert.equal(
      getBlogTrackingId({ id: 'art-2026-003', slug: 'istorija-ostecenja-polovnih-automobila' }),
      'BLOG-003',
    );
    assert.equal(
      getBlogTrackingId('polovni-automobili-iz-svajcarske'),
      'BLOG-004',
    );
    assert.equal(
      getBlogTrackingId({ slug: 'dizel-benzin-ili-hibrid-2027' }),
      'BLOG-005',
    );
    assert.equal(
      getBlogTrackingId({ trackingId: 'BLOG-007', slug: 'future-post' }),
      'BLOG-007',
    );
    assert.equal(getBlogTrackingId('unknown-slug'), null);
  });

  test('computes next available tracking ID correctly (BLOG-006)', () => {
    const nextId = getNextBlogTrackingId();
    assert.equal(nextId, 'BLOG-006');

    const nextWithRuntime = getNextBlogTrackingId([
      { trackingId: 'BLOG-006', slug: 'test-article-6' },
      { trackingId: 'BLOG-007', slug: 'test-article-7' },
    ]);
    assert.equal(nextWithRuntime, 'BLOG-008');
  });
});
