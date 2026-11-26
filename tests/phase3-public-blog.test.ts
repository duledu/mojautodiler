import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  BLOG_CANONICAL_SITE_URL,
  buildBlogBreadcrumbJsonLdObject,
  buildBlogFaqJsonLdObject,
  buildBlogListingMetadata,
  buildBlogPostMetadata,
  buildBlogPostingJsonLdObject,
  buildBlogSitemapEntries,
  resolveBlogCanonicalUrl,
  serializeBlogBreadcrumbJsonLd,
  serializeBlogFaqJsonLd,
  serializeBlogPostingJsonLd,
} from '../lib/seo/blog-seo';
import {
  createBlogPost,
  inferBlogR2KeyFromUrl,
  type BlogDatabaseClient,
} from '../lib/db/blog';
import type { BlogContentDocument, BlogPostPublicDetail } from '../types/blog';

const SAMPLE_CONTENT: BlogContentDocument = {
  version: 1,
  blocks: [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Provera motora i menjača' }],
    },
    {
      type: 'paragraph',
      children: [{ type: 'text', text: 'Detaljan tekst članka.' }],
    },
  ],
};

function makePublicPostDetail(
  overrides: Partial<BlogPostPublicDetail> = {},
): BlogPostPublicDetail {
  return {
    id: 'post-1',
    slug: 'volkswagen-golf-7-vodic-za-kupovinu',
    locale: 'sr',
    title: 'Volkswagen Golf 7 – vodič za kupovinu',
    excerpt: 'Kompletan vodič za kupovinu polovnog Golfa 7 u Srbiji.',
    content: SAMPLE_CONTENT,
    featuredImage: 'https://pub-example.r2.dev/blog/post-1/1700-golf7.webp',
    featuredImageAlt: 'Volkswagen Golf 7 2.0 TDI',
    authorName: 'Moj Auto Diler',
    category: {
      id: 'cat-1',
      slug: 'vodici-za-kupovinu',
      name: 'Vodiči za kupovinu',
      description: 'Saveti za kupovinu vozila',
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    },
    publishedAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-11T10:00:00.000Z',
    seoTitle: null,
    metaDescription: null,
    ogImage: null,
    canonicalUrl: null,
    noindex: false,
    relatedBrand: 'Volkswagen',
    relatedModel: 'Golf 7',
    affiliateCtaEnabled: false,
    affiliatePlacement: 'none',
    affiliateLabel: null,
    relatedVehicles: [],
    relatedPosts: [],
    ...overrides,
  };
}

interface MockSitemapPostRow {
  id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  content: unknown;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  featuredImageR2Key: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  authorName: string;
  categoryId: string | null;
  status: string;
  publishedAt: Date | null;
  relatedBrand: string | null;
  relatedModel: string | null;
  affiliateCtaEnabled: boolean;
  affiliatePlacement: string;
  affiliateLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function createSitemapTestDb() {
  const posts: MockSitemapPostRow[] = [];
  let seq = 1;

  const db = {
    blogPost: {
      findUnique: async ({ where }: { where: { slug?: string; id?: string } }) =>
        posts.find((p) => p.slug === where.slug || p.id === where.id) ?? null,
      findFirst: async () => null,
      findMany: async ({
        where,
      }: {
        where?: {
          locale?: string;
          status?: string;
          noindex?: boolean;
          publishedAt?: { lte?: Date };
        };
      } = {}) => {
        return posts.filter((p) => {
          if (where?.locale && p.locale !== where.locale) return false;
          if (where?.status && p.status !== where.status) return false;
          if (where?.noindex !== undefined && p.noindex !== where.noindex) return false;
          if (where?.publishedAt?.lte && (!p.publishedAt || p.publishedAt > where.publishedAt.lte)) {
            return false;
          }
          return true;
        });
      },
      count: async () => posts.length,
      create: async ({ data }: { data: Partial<MockSitemapPostRow> & { slug: string; title: string; excerpt: string } }) => {
        const now = new Date('2026-05-15T10:00:00.000Z');
        const row: MockSitemapPostRow = {
          id: `p-${seq++}`,
          slug: data.slug,
          locale: data.locale ?? 'sr',
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featuredImage ?? null,
          featuredImageAlt: data.featuredImageAlt ?? null,
          featuredImageR2Key: data.featuredImageR2Key ?? null,
          seoTitle: data.seoTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          ogImage: data.ogImage ?? null,
          canonicalUrl: data.canonicalUrl ?? null,
          noindex: Boolean(data.noindex),
          authorName: data.authorName ?? 'Moj Auto Diler',
          categoryId: data.categoryId ?? null,
          status: data.status ?? 'DRAFT',
          publishedAt: data.publishedAt ?? null,
          relatedBrand: null,
          relatedModel: null,
          affiliateCtaEnabled: false,
          affiliatePlacement: 'none',
          affiliateLabel: null,
          createdAt: now,
          updatedAt: now,
        };
        posts.push(row);
        return row;
      },
      update: async () => null,
    },
    blogCategory: {
      findMany: async () => [],
      upsert: async () => null,
    },
    blogPostVehicle: {
      findMany: async () => [],
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    },
    blogPostRelation: {
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    },
    vehicle: {
      findMany: async () => [],
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  } as unknown as BlogDatabaseClient;

  return { db };
}

describe('Phase 3 — Public Blog SEO, Canonical Domain & JSON-LD', () => {
  test('uses centralized https://www.mojautodiler.com canonical domain for blog routes', () => {
    assert.equal(BLOG_CANONICAL_SITE_URL, 'https://www.mojautodiler.com');
    assert.equal(
      resolveBlogCanonicalUrl('/sr/blog/test-clanak'),
      'https://www.mojautodiler.com/sr/blog/test-clanak',
    );
  });

  test('builds indexable Blog listing metadata without fake sq hreflang alternates', () => {
    const meta = buildBlogListingMetadata({
      categoryName: 'Vodiči za kupovinu',
      categorySlug: 'vodici-za-kupovinu',
      page: 1,
    });

    assert.equal(
      meta.alternates?.canonical,
      'https://www.mojautodiler.com/sr/blog',
    );
    assert.equal(meta.alternates?.languages, undefined);
    assert.deepEqual(meta.robots, {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    });
  });

  test('builds article metadata and honors noindex setting', () => {
    const indexablePost = makePublicPostDetail();
    const indexableMeta = buildBlogPostMetadata(indexablePost);
    assert.equal(
      indexableMeta.alternates?.canonical,
      'https://www.mojautodiler.com/sr/blog/volkswagen-golf-7-vodic-za-kupovinu',
    );
    assert.deepEqual(indexableMeta.robots, {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    });

    const noindexPost = makePublicPostDetail({
      noindex: true,
      seoTitle: 'Custom SEO Naslov',
      metaDescription: 'Custom Meta Opis',
    });
    const noindexMeta = buildBlogPostMetadata(noindexPost);
    assert.deepEqual(noindexMeta.robots, { index: false, follow: false });
    assert.equal(noindexMeta.description, 'Custom Meta Opis');
  });

  test('generates safe BlogPosting and BreadcrumbList JSON-LD and escapes </script>', () => {
    const post = makePublicPostDetail({
      seoTitle: 'Test </script><script>alert(1)</script>',
    });

    const postingObj = buildBlogPostingJsonLdObject(post);
    assert.equal(postingObj['@type'], 'BlogPosting');
    assert.equal(postingObj.inLanguage, 'sr-Latn-RS');

    const breadcrumbObj = buildBlogBreadcrumbJsonLdObject(post);
    assert.equal(breadcrumbObj['@type'], 'BreadcrumbList');
    assert.equal(breadcrumbObj.itemListElement.length, 4);
    assert.equal(breadcrumbObj.itemListElement[1].name, 'Auto magazin');
    assert.equal(breadcrumbObj.itemListElement[1].item, 'https://www.mojautodiler.com/sr/blog');

    const serializedPosting = serializeBlogPostingJsonLd(post);
    const serializedBreadcrumb = serializeBlogBreadcrumbJsonLd(post);
    assert.equal(serializedPosting.includes('</script>'), false);
    assert.equal(serializedPosting.includes('\\u003c/script\\u003e'), true);
    assert.ok(JSON.parse(serializedBreadcrumb));

    // FAQPage JSON-LD extraction
    const faqPost = makePublicPostDetail({
      content: {
        version: 1,
        blocks: [
          {
            type: 'heading',
            level: 2,
            children: [{ type: 'text', text: 'Često postavljana pitanja (FAQ)' }],
          },
          {
            type: 'heading',
            level: 3,
            children: [{ type: 'text', text: 'Da li je vraćanje kilometraže krivično delo?' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Može ispuniti elemente krivičnog dela Prevare iz člana 208. KZ RS.' }],
          },
        ],
      },
    });
    const faqObj = buildBlogFaqJsonLdObject(faqPost);
    assert.equal(faqObj?.['@type'], 'FAQPage');
    assert.equal(faqObj?.mainEntity.length, 1);
    assert.ok(serializeBlogFaqJsonLd(faqPost));
    assert.equal(serializeBlogFaqJsonLd(post), null);
  });
});

describe('Phase 3 — Sitemap Integration & R2 Key Tracking', () => {
  test('includes /sr/blog and published indexable articles in sitemap while excluding drafts, archived, future, and noindex articles', async () => {
    const { db } = createSitemapTestDb();
    const now = new Date('2026-06-01T12:00:00.000Z');
    const past = new Date('2026-05-15T12:00:00.000Z');
    const future = new Date('2026-06-20T12:00:00.000Z');

    // 1. Published & indexable -> INCLUDED
    await createBlogPost(
      {
        title: 'Objavljeni indeksirani članak',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        status: 'published',
        publishedAt: past,
        noindex: false,
      },
      db,
    );

    // 2. Draft -> EXCLUDED
    await createBlogPost(
      {
        title: 'Nacrt članka',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        status: 'draft',
      },
      db,
    );

    // 3. Archived -> EXCLUDED
    await createBlogPost(
      {
        title: 'Arhivirani članak',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        status: 'archived',
        publishedAt: past,
      },
      db,
    );

    // 4. Future publishedAt -> EXCLUDED
    await createBlogPost(
      {
        title: 'Budući zakazani članak',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        status: 'published',
        publishedAt: future,
      },
      db,
    );

    // 5. Published but noindex: true -> EXCLUDED
    await createBlogPost(
      {
        title: 'Noindex objavljeni članak',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        status: 'published',
        publishedAt: past,
        noindex: true,
      },
      db,
    );

    const entries = await buildBlogSitemapEntries(db, now);
    const urls = entries.map((e) => e.url);

    assert.deepEqual(urls, [
      'https://www.mojautodiler.com/sr/blog',
      'https://www.mojautodiler.com/sr/blog/objavljeni-indeksirani-clanak',
    ]);
  });

  test('infers and records featuredImageR2Key from blog R2 URLs (including blog/tmp-xxx)', async () => {
    assert.equal(
      inferBlogR2KeyFromUrl(
        'https://pub-12345.r2.dev/blog/tmp-abcd1234/1700000000-naslovna.webp',
      ),
      'blog/tmp-abcd1234/1700000000-naslovna.webp',
    );
    assert.equal(
      inferBlogR2KeyFromUrl(
        'https://pub-12345.r2.dev/blog/post_99/1700000000-hero.jpg',
      ),
      'blog/post_99/1700000000-hero.jpg',
    );
    assert.equal(
      inferBlogR2KeyFromUrl('https://example.com/external-image.jpg'),
      null,
    );

    const { db } = createSitemapTestDb();
    const post = await createBlogPost(
      {
        title: 'Test R2 ključa',
        excerpt: 'Opis',
        content: SAMPLE_CONTENT,
        featuredImage:
          'https://pub-12345.r2.dev/blog/tmp-abcd1234/1700000000-naslovna.webp',
        featuredImageAlt: 'Alt opis slike',
      },
      db,
    );

    assert.equal(
      post.featuredImageR2Key,
      'blog/tmp-abcd1234/1700000000-naslovna.webp',
    );
  });
});
