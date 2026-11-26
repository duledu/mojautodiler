import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { slugify, slugifySr } from '../lib/utils';
import {
  BlogContentValidationError,
  extractBlogContentImageUrls,
  parseBlogContent,
  resolveSafeLinkAttributes,
  sanitizeBlogImageUrl,
  sanitizeBlogLinkUrl,
  serializeBlogContent,
  serializeJsonLd,
  validateAffiliatePlacement,
  validateAndNormalizeBlogContent,
} from '../lib/blog-content';
import {
  archiveBlogPost,
  BlogNotFoundError,
  BlogSlugConflictError,
  createBlogPost,
  filterAvailableVehicleRows,
  getBlogPostByIdForAdmin,
  getPublishedBlogPostBySlug,
  getPublishedBlogSlugsForSitemap,
  getRelatedAvailableVehiclesForPost,
  listBlogPostsForAdmin,
  listPublishedBlogPosts,
  normalizePagination,
  updateBlogPost,
  type BlogDatabaseClient,
} from '../lib/db/blog';
import {
  BLOG_TEMP_OBJECT_PREFIX,
  buildBlogObjectKey,
  buildObjectKey,
  MAX_FILE_SIZE,
  skipReasonFor,
  TEMP_OBJECT_PREFIX,
  validateUpload,
} from '../lib/r2';
import type { BlogContentDocument } from '../types/blog';

// ─── 1. Serbian Slug Tests ────────────────────────────────────────────────────

describe('Serbian Slug Generation (slugifySr)', () => {
  test('converts exact canonical Serbian article title with en-dash and diacritics', () => {
    assert.equal(
      slugifySr('Volkswagen Golf 7 – vodič za kupovinu'),
      'volkswagen-golf-7-vodic-za-kupovinu',
    );
  });

  test('transliterates all lowercase and uppercase Serbian Latin diacritics (č, ć, š, ž, đ)', () => {
    assert.equal(
      slugifySr('Čišćenje DPF filtera: Đorđe, Željko i Ćuprija — Šabac'),
      'ciscenje-dpf-filtera-djordje-zeljko-i-cuprija-sabac',
    );
    assert.equal(slugifySr('Đaković Čačak Ćuprija Šid Žitište'), 'djakovic-cacak-cuprija-sid-zitiste');
  });

  test('normalizes uppercase, punctuation, duplicate hyphens, and leading/trailing separators', () => {
    assert.equal(
      slugifySr('  ---  BMW Serija 3 (F30): Iskustva, Cene & Održavanje!!! ---  '),
      'bmw-serija-3-f30-iskustva-cene-odrzavanje',
    );
  });

  test('returns empty string for empty, whitespace-only, or symbol-only inputs', () => {
    assert.equal(slugifySr(''), '');
    assert.equal(slugifySr('     '), '');
    assert.equal(slugifySr('!@#$%^&*()_+-=[]{}|;:\'",.<>?/'), '');
  });

  test('strips unsafe characters, quotes, and HTML/script fragments safely', () => {
    assert.equal(
      slugifySr('Audi A4 <script>alert(1)</script> "Quattro" ../etc/passwd'),
      'audi-a4-script-alert-1-script-quattro-etc-passwd',
    );
  });

  test('preserves legacy slugify() behavior unchanged for existing callers', () => {
    assert.equal(slugify('Audi A4 2020'), 'audi-a4-2020');
  });
});

// ─── 2. Content Security & JSON-LD Tests ──────────────────────────────────────

const VALID_SAMPLE_CONTENT: BlogContentDocument = {
  version: 1,
  blocks: [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Zašto kupiti polovni Golf 7?' }],
    },
    {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Pogledajte aktuelnu ponudu na ' },
        {
          type: 'link',
          href: '/sr/vozila',
          text: 'stranici vozila',
          bold: true,
        },
        { type: 'text', text: ' ili proverite istoriju preko ' },
        {
          type: 'link',
          href: 'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=blog',
          text: 'carVertical izveštaja',
          sponsored: true,
        },
      ],
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        [{ type: 'text', text: 'Pouzdan 2.0 TDI motor', bold: true }],
        [{ type: 'text', text: 'Niska potrošnja goriva', italic: true }],
      ],
    },
    {
      type: 'blockquote',
      children: [{ type: 'text', text: 'Redovan servis menjača je ključ dugovečnosti.' }],
      citation: 'Servisni savetnik MojAutoDiler',
    },
    {
      type: 'image',
      src: 'https://pub-example.r2.dev/blog/post-1/1700000000-golf-7.webp',
      alt: 'Volkswagen Golf 7 2.0 TDI enterijer',
      caption: 'Enterijer očuvanog modela iz 2018. godine',
      r2Key: 'blog/post-1/1700000000-golf-7.webp',
    },
    {
      type: 'table',
      headers: ['Motor', 'Snaga', 'Prosečna potrošnja'],
      rows: [
        ['1.6 TDI', '115 KS', '4.6 l/100km'],
        ['2.0 TDI', '150 KS', '5.1 l/100km'],
      ],
      caption: 'Pregled najtraženijih dizel motora',
    },
  ],
};

describe('Content Security & Rendering Contract (lib/blog-content)', () => {
  test('validates, serializes, and parses a complete allowlisted structured document', () => {
    const serialized = serializeBlogContent(VALID_SAMPLE_CONTENT);
    const parsed = parseBlogContent(serialized);
    assert.deepEqual(parsed, VALID_SAMPLE_CONTENT);
  });

  test('rejects raw HTML strings passed as article content', () => {
    assert.throws(
      () => validateAndNormalizeBlogContent('<h2>Naslov</h2><p>Tekst</p>'),
      BlogContentValidationError,
    );
  });

  test('rejects <script>, <iframe>, and event handler XSS payloads inside text or blocks', () => {
    const scriptPayload = {
      version: 1,
      blocks: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Zdravo <script>alert("xss")</script>' }],
        },
      ],
    };
    assert.throws(
      () => validateAndNormalizeBlogContent(scriptPayload),
      BlogContentValidationError,
    );

    const eventHandlerPayload = {
      version: 1,
      blocks: [
        {
          type: 'image',
          src: 'https://pub-example.r2.dev/blog/post-1/img.webp',
          alt: 'Slika" onerror="alert(1)',
        },
      ],
    };
    assert.throws(
      () => validateAndNormalizeBlogContent(eventHandlerPayload),
      BlogContentValidationError,
    );
  });

  test('rejects javascript:, data:, vbscript:, blob:, and protocol-relative // URLs', () => {
    const unsafeUrls = [
      'javascript:alert(1)',
      'JAVASCRIPT:alert(document.cookie)',
      '  javascript:void(0)',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'vbscript:msgbox("xss")',
      'blob:https://mojautodiler.com/123',
      '//evil.example.com/phish',
      '/\\evil.example.com/phish',
    ];

    for (const url of unsafeUrls) {
      assert.equal(sanitizeBlogLinkUrl(url), null, `Expected link URL to be rejected: ${url}`);
      assert.equal(sanitizeBlogImageUrl(url), null, `Expected image URL to be rejected: ${url}`);
    }
  });

  test('rejects disallowed heading levels (H1 or >H6), missing image alt, and malformed tables', () => {
    assert.throws(
      () =>
        validateAndNormalizeBlogContent({
          version: 1,
          blocks: [
            {
              type: 'heading',
              level: 1,
              children: [{ type: 'text', text: 'H1 je rezervisan za naslov stranice' }],
            },
          ],
        }),
      BlogContentValidationError,
    );

    assert.throws(
      () =>
        validateAndNormalizeBlogContent({
          version: 1,
          blocks: [
            {
              type: 'image',
              src: 'https://pub-example.r2.dev/blog/post-1/img.webp',
              alt: '   ',
            },
          ],
        }),
      BlogContentValidationError,
    );

    assert.throws(
      () =>
        validateAndNormalizeBlogContent({
          version: 1,
          blocks: [
            {
              type: 'table',
              headers: ['Kolona 1', 'Kolona 2'],
              rows: [['Samo jedna ćelija']],
            },
          ],
        }),
      BlogContentValidationError,
    );
  });

  test('preserves safe internal, external, and sponsored affiliate link attributes', () => {
    const internal = resolveSafeLinkAttributes('/sr/vozila');
    assert.deepEqual(internal, { href: '/sr/vozila' });

    const external = resolveSafeLinkAttributes('https://example.com/test');
    assert.deepEqual(external, {
      href: 'https://example.com/test',
      target: '_blank',
      rel: 'noopener noreferrer',
    });

    const carVerticalUrl =
      'https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=blog';
    const affiliate = resolveSafeLinkAttributes(carVerticalUrl, { sponsored: true });
    assert.deepEqual(affiliate, {
      href: carVerticalUrl,
      target: '_blank',
      rel: 'sponsored nofollow noopener noreferrer',
    });
  });

  test('escapes </script>, <, >, and & in serializeJsonLd', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Naslov </script><script>alert("xss")</script> & više',
    };
    const jsonLd = serializeJsonLd(payload);
    assert.equal(jsonLd.includes('</script>'), false);
    assert.equal(jsonLd.includes('<script>'), false);
    assert.equal(jsonLd.includes('\\u003c/script\\u003e'), true);
    assert.deepEqual(JSON.parse(jsonLd), payload);
  });

  test('extracts inline image URLs from structured content for R2 cleanup protection', () => {
    const urls = extractBlogContentImageUrls(VALID_SAMPLE_CONTENT);
    assert.deepEqual(urls, ['https://pub-example.r2.dev/blog/post-1/1700000000-golf-7.webp']);
  });

  test('validates affiliatePlacement values', () => {
    assert.equal(validateAffiliatePlacement(undefined), 'none');
    assert.equal(validateAffiliatePlacement('inline'), 'inline');
    assert.equal(validateAffiliatePlacement('bottom'), 'bottom');
    assert.equal(validateAffiliatePlacement('both'), 'both');
    assert.throws(() => validateAffiliatePlacement('sidebar'), BlogContentValidationError);
  });
});

// ─── 3. Blog Data Layer & Related Vehicle Logic Tests (Isolated Mock DB) ──────

function createInMemoryBlogDb() {
  const posts = new Map<string, any>();
  const categories = new Map<string, any>();
  const postVehicles: Array<{ id: string; postId: string; vehicleId: string; sortOrder: number; createdAt: Date }> = [];
  const postRelations: Array<{ id: string; sourcePostId: string; relatedPostId: string; sortOrder: number; createdAt: Date }> = [];
  const vehicles = new Map<string, any>();

  let seq = 1;
  const nextId = (prefix: string) => `${prefix}-${seq++}`;

  const hydratePost = (row: any, include?: any) => {
    if (!row) return null;
    const copy = { ...row };
    if (include?.category) {
      copy.category = copy.categoryId ? (categories.get(copy.categoryId) ?? null) : null;
    }
    if (include?.relatedVehicles) {
      const joined = postVehicles
        .filter((pv) => pv.postId === row.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((pv) => ({
          ...pv,
          ...(include.relatedVehicles.include?.vehicle
            ? { vehicle: vehicles.get(pv.vehicleId) ?? null }
            : {}),
        }))
        .filter((pv) => !include.relatedVehicles.include?.vehicle || pv.vehicle !== null);
      copy.relatedVehicles = joined;
    }
    if (include?.relatedFrom) {
      const joined = postRelations
        .filter((pr) => pr.sourcePostId === row.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((pr) => {
          const target = posts.get(pr.relatedPostId) ?? null;
          return {
            ...pr,
            ...(include.relatedFrom.include?.relatedPost
              ? {
                  relatedPost: target
                    ? {
                        ...target,
                        category: target.categoryId
                          ? (categories.get(target.categoryId) ?? null)
                          : null,
                      }
                    : null,
                }
              : {}),
          };
        });
      copy.relatedFrom = joined;
    }
    return copy;
  };

  const matchesPostWhere = (row: any, where: any): boolean => {
    if (!where) return true;
    if (where.id !== undefined && row.id !== where.id) return false;
    if (where.slug !== undefined && row.slug !== where.slug) return false;
    if (where.locale !== undefined && row.locale !== where.locale) return false;
    if (where.status !== undefined && row.status !== where.status) return false;
    if (where.noindex !== undefined && row.noindex !== where.noindex) return false;
    if (where.categoryId !== undefined && row.categoryId !== where.categoryId) return false;
    if (where.category?.slug !== undefined) {
      const cat = row.categoryId ? categories.get(row.categoryId) : null;
      if (!cat || cat.slug !== where.category.slug) return false;
    }
    if (where.publishedAt) {
      if (where.publishedAt.not === null && row.publishedAt === null) return false;
      if (where.publishedAt.lte && (!row.publishedAt || row.publishedAt > where.publishedAt.lte)) {
        return false;
      }
    }
    if (where.OR && Array.isArray(where.OR)) {
      const matchedOr = where.OR.some((cond: any) => {
        if (cond.title?.contains) {
          return String(row.title).toLowerCase().includes(String(cond.title.contains).toLowerCase());
        }
        if (cond.slug?.contains) {
          return String(row.slug).toLowerCase().includes(String(cond.slug.contains).toLowerCase());
        }
        if (cond.excerpt?.contains) {
          return String(row.excerpt).toLowerCase().includes(String(cond.excerpt.contains).toLowerCase());
        }
        return false;
      });
      if (!matchedOr) return false;
    }
    return true;
  };

  const db: BlogDatabaseClient = {
    blogPost: {
      findUnique: async ({ where, include }: any) => {
        let found: any = null;
        if (where.id) {
          found = posts.get(where.id) ?? null;
        } else if (where.slug) {
          for (const p of posts.values()) {
            if (p.slug === where.slug) {
              found = p;
              break;
            }
          }
        }
        return hydratePost(found, include);
      },
      findFirst: async ({ where, include }: any) => {
        for (const p of posts.values()) {
          if (matchesPostWhere(p, where)) {
            return hydratePost(p, include);
          }
        }
        return null;
      },
      findMany: async ({ where, skip = 0, take = 50, include, select }: any = {}) => {
        const matched = Array.from(posts.values())
          .filter((p) => matchesPostWhere(p, where))
          .sort((a, b) => {
            const aTime = (a.publishedAt ?? a.updatedAt ?? a.createdAt).getTime();
            const bTime = (b.publishedAt ?? b.updatedAt ?? b.createdAt).getTime();
            return bTime - aTime;
          })
          .slice(skip, skip + take);

        if (select) {
          return matched.map((row) => {
            const out: Record<string, unknown> = {};
            for (const key of Object.keys(select)) {
              if (select[key]) out[key] = row[key];
            }
            return out;
          });
        }
        return matched.map((row) => hydratePost(row, include));
      },
      count: async ({ where }: any = {}) => {
        return Array.from(posts.values()).filter((p) => matchesPostWhere(p, where)).length;
      },
      create: async ({ data, include }: any) => {
        const now = new Date();
        const id = nextId('post');
        const row = {
          id,
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
          relatedBrand: data.relatedBrand ?? null,
          relatedModel: data.relatedModel ?? null,
          affiliateCtaEnabled: Boolean(data.affiliateCtaEnabled),
          affiliatePlacement: data.affiliatePlacement ?? 'none',
          affiliateLabel: data.affiliateLabel ?? null,
          createdAt: now,
          updatedAt: now,
        };
        posts.set(id, row);

        if (data.relatedVehicles?.create) {
          for (const rv of data.relatedVehicles.create) {
            postVehicles.push({
              id: nextId('pv'),
              postId: id,
              vehicleId: rv.vehicleId,
              sortOrder: rv.sortOrder,
              createdAt: now,
            });
          }
        }
        if (data.relatedFrom?.create) {
          for (const rp of data.relatedFrom.create) {
            postRelations.push({
              id: nextId('pr'),
              sourcePostId: id,
              relatedPostId: rp.relatedPostId,
              sortOrder: rp.sortOrder,
              createdAt: now,
            });
          }
        }

        return hydratePost(row, include);
      },
      update: async ({ where, data, include }: any) => {
        const existing = posts.get(where.id);
        if (!existing) throw new Error('Not found');
        const now = new Date();

        const updated = {
          ...existing,
          ...Object.fromEntries(
            Object.entries(data).filter(
              ([k, v]) => v !== undefined && k !== 'relatedVehicles' && k !== 'relatedFrom',
            ),
          ),
          updatedAt: now,
        };
        posts.set(where.id, updated);

        if (data.relatedVehicles) {
          for (let i = postVehicles.length - 1; i >= 0; i--) {
            if (postVehicles[i].postId === where.id) postVehicles.splice(i, 1);
          }
          for (const rv of data.relatedVehicles.create ?? []) {
            postVehicles.push({
              id: nextId('pv'),
              postId: where.id,
              vehicleId: rv.vehicleId,
              sortOrder: rv.sortOrder,
              createdAt: now,
            });
          }
        }

        if (data.relatedFrom) {
          for (let i = postRelations.length - 1; i >= 0; i--) {
            if (postRelations[i].sourcePostId === where.id) postRelations.splice(i, 1);
          }
          for (const rp of data.relatedFrom.create ?? []) {
            postRelations.push({
              id: nextId('pr'),
              sourcePostId: where.id,
              relatedPostId: rp.relatedPostId,
              sortOrder: rp.sortOrder,
              createdAt: now,
            });
          }
        }

        return hydratePost(updated, include);
      },
    } as any,
    blogCategory: {
      findMany: async () => Array.from(categories.values()),
      upsert: async ({ where, create, update }: any) => {
        for (const c of categories.values()) {
          if (c.slug === where.slug) {
            const updated = { ...c, ...update, updatedAt: new Date() };
            categories.set(c.id, updated);
            return updated;
          }
        }
        const now = new Date();
        const created = {
          id: nextId('cat'),
          slug: create.slug,
          name: create.name,
          description: create.description ?? null,
          createdAt: now,
          updatedAt: now,
        };
        categories.set(created.id, created);
        return created;
      },
    } as any,
    blogPostVehicle: {
      findMany: async ({ where, take = 10 }: any) => {
        return postVehicles
          .filter((pv) => {
            if (where?.postId && pv.postId !== where.postId) return false;
            const v = vehicles.get(pv.vehicleId);
            if (!v) return false;
            if (where?.vehicle?.status && v.status !== where.vehicle.status) return false;
            if (v.dealer && v.dealer.status === 'HIDDEN') return false;
            return true;
          })
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .slice(0, take)
          .map((pv) => ({ ...pv, vehicle: vehicles.get(pv.vehicleId) }));
      },
      deleteMany: async ({ where }: any) => {
        for (let i = postVehicles.length - 1; i >= 0; i--) {
          if (postVehicles[i].postId === where.postId) postVehicles.splice(i, 1);
        }
        return { count: 0 };
      },
      createMany: async ({ data }: any) => {
        for (const item of data) {
          postVehicles.push({
            id: nextId('pv'),
            postId: item.postId,
            vehicleId: item.vehicleId,
            sortOrder: item.sortOrder,
            createdAt: new Date(),
          });
        }
        return { count: data.length };
      },
    } as any,
    blogPostRelation: {
      deleteMany: async ({ where }: any) => {
        for (let i = postRelations.length - 1; i >= 0; i--) {
          if (postRelations[i].sourcePostId === where.sourcePostId) postRelations.splice(i, 1);
        }
        return { count: 0 };
      },
      createMany: async ({ data }: any) => {
        for (const item of data) {
          postRelations.push({
            id: nextId('pr'),
            sourcePostId: item.sourcePostId,
            relatedPostId: item.relatedPostId,
            sortOrder: item.sortOrder,
            createdAt: new Date(),
          });
        }
        return { count: data.length };
      },
    } as any,
    vehicle: {
      findMany: async ({ where, take = 10 }: any) => {
        const excludeIds = new Set<string>(where?.id?.notIn ?? []);
        return Array.from(vehicles.values())
          .filter((v) => {
            if (where?.status && v.status !== where.status) return false;
            if (excludeIds.has(v.id)) return false;
            if (
              where?.brand?.equals &&
              String(v.brand).toLowerCase() !== String(where.brand.equals).toLowerCase()
            ) {
              return false;
            }
            if (
              where?.model?.contains &&
              !String(v.model).toLowerCase().includes(String(where.model.contains).toLowerCase())
            ) {
              return false;
            }
            if (v.dealer && v.dealer.status === 'HIDDEN') return false;
            return true;
          })
          .slice(0, take);
      },
    } as any,
    $transaction: (async (ops: Promise<unknown>[]) => Promise.all(ops)) as any,
  };

  return { db, vehicles };
}

function makeMockPrismaVehicle(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-01-15T10:00:00Z');
  return {
    id: 'veh-1',
    slug: 'volkswagen-golf-7-2018',
    title: 'Volkswagen Golf 7 2.0 TDI',
    brand: 'Volkswagen',
    model: 'Golf 7',
    generation: 'VII',
    year: 2018,
    mileage: 145000,
    price: 13900,
    currency: 'EUR',
    vatMode: 'NONE',
    fuelType: 'dizel',
    transmission: 'automatski',
    drivetrain: 'prednji',
    bodyType: 'hečbek',
    condition: 'polovno',
    engineSize: '1968 ccm',
    horsepower: 150,
    kilowatts: 110,
    doors: 5,
    seats: 5,
    color: 'Siva',
    interiorColor: 'Crna',
    vin: null,
    registration: '2026-10',
    origin: 'Uvoz',
    description: 'Odlično stanje.',
    dealerNotes: null,
    equipment: [],
    safetyFeatures: [],
    features: [],
    images: ['https://pub-example.r2.dev/vehicles/veh-1/main.webp'],
    videoUrl: null,
    status: 'AVAILABLE',
    featured: false,
    showcase: false,
    onSale: false,
    tags: [],
    dealerId: null,
    dealer: null,
    contactPhone: null,
    contactViber: null,
    contactName: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Blog Database Access Layer & Visibility Rules (lib/db/blog)', () => {
  test('enforces draft and archived isolation from all public queries and sitemap', async () => {
    const { db } = createInMemoryBlogDb();

    const draft = await createBlogPost(
      {
        title: 'Volkswagen Golf 7 – vodič za kupovinu',
        excerpt: 'Detaljan vodič za kupovinu polovnog Golfa 7.',
        content: VALID_SAMPLE_CONTENT,
      },
      db,
    );

    assert.equal(draft.status, 'draft');
    assert.equal(draft.slug, 'volkswagen-golf-7-vodic-za-kupovinu');
    assert.equal(draft.affiliateCtaEnabled, false);
    assert.equal(draft.affiliatePlacement, 'none');

    // Admin can fetch the draft
    const adminFetched = await getBlogPostByIdForAdmin(draft.id, db);
    assert.ok(adminFetched);
    assert.equal(adminFetched.status, 'draft');

    // Public cannot fetch the draft
    assert.equal(await getPublishedBlogPostBySlug(draft.slug, db), null);
    const publicListDraft = await listPublishedBlogPosts({}, db);
    assert.equal(publicListDraft.total, 0);
    assert.equal((await getPublishedBlogSlugsForSitemap(db)).length, 0);

    // Transition to PUBLISHED
    const published = await updateBlogPost(
      draft.id,
      { status: 'published' },
      db,
    );
    assert.equal(published.status, 'published');
    assert.ok(published.publishedAt);

    // Public can now fetch the published article
    const publicPost = await getPublishedBlogPostBySlug(draft.slug, db);
    assert.ok(publicPost);
    assert.equal(publicPost.slug, 'volkswagen-golf-7-vodic-za-kupovinu');
    assert.equal((await listPublishedBlogPosts({}, db)).total, 1);
    assert.equal((await getPublishedBlogSlugsForSitemap(db)).length, 1);

    // Archive the post -> immediately hidden from public and sitemap
    const archived = await archiveBlogPost(draft.id, db);
    assert.equal(archived.status, 'archived');
    assert.equal(await getPublishedBlogPostBySlug(draft.slug, db), null);
    assert.equal((await listPublishedBlogPosts({}, db)).total, 0);
    assert.equal((await getPublishedBlogSlugsForSitemap(db)).length, 0);
  });

  test('enforces slug uniqueness on create and update', async () => {
    const { db } = createInMemoryBlogDb();

    const first = await createBlogPost(
      {
        title: 'Najbolji SUV automobili do 15.000 evra',
        excerpt: 'Pregled SUV modela.',
        content: VALID_SAMPLE_CONTENT,
      },
      db,
    );

    await assert.rejects(
      () =>
        createBlogPost(
          {
            title: 'Najbolji SUV automobili do 15 000 evra!',
            excerpt: 'Duplikat sluga.',
            content: VALID_SAMPLE_CONTENT,
          },
          db,
        ),
      BlogSlugConflictError,
    );

    const second = await createBlogPost(
      {
        title: 'Kako proveriti kilometražu polovnog automobila',
        excerpt: 'Saveti za proveru.',
        content: VALID_SAMPLE_CONTENT,
      },
      db,
    );

    await assert.rejects(
      () => updateBlogPost(second.id, { slug: first.slug }, db),
      BlogSlugConflictError,
    );

    await assert.rejects(
      () => updateBlogPost('non-existent-id', { title: 'Novi naslov' }, db),
      BlogNotFoundError,
    );
  });

  test('excludes future-dated publishedAt and noindex posts from public/sitemap appropriately', async () => {
    const { db } = createInMemoryBlogDb();
    const now = new Date('2026-06-01T12:00:00Z');
    const future = new Date('2026-06-10T12:00:00Z');
    const past = new Date('2026-05-20T12:00:00Z');

    await createBlogPost(
      {
        title: 'Budući članak',
        excerpt: 'Još nije objavljen.',
        content: VALID_SAMPLE_CONTENT,
        status: 'published',
        publishedAt: future,
      },
      db,
    );

    const noindexPost = await createBlogPost(
      {
        title: 'Noindex objavljeni članak',
        excerpt: 'Ne treba u sitemap.',
        content: VALID_SAMPLE_CONTENT,
        status: 'published',
        publishedAt: past,
        noindex: true,
      },
      db,
    );

    // Future post is not visible at `now`
    assert.equal(await getPublishedBlogPostBySlug('buduci-clanak', db, now), null);

    // Noindex post is readable by direct slug, but excluded from sitemap
    const directNoindex = await getPublishedBlogPostBySlug(noindexPost.slug, db, now);
    assert.ok(directNoindex);
    assert.equal(directNoindex.noindex, true);

    const sitemapEntries = await getPublishedBlogSlugsForSitemap(db, now);
    assert.equal(sitemapEntries.length, 0);
  });

  test('paginates admin and public blog listings safely', async () => {
    const { db } = createInMemoryBlogDb();
    const publishedDate = new Date('2026-03-01T10:00:00Z');

    for (let i = 1; i <= 5; i++) {
      await createBlogPost(
        {
          title: `Vodič broj ${i}`,
          excerpt: `Kratak opis ${i}`,
          content: VALID_SAMPLE_CONTENT,
          status: i <= 3 ? 'published' : 'draft',
          publishedAt: i <= 3 ? publishedDate : null,
        },
        db,
      );
    }

    const page1 = await listPublishedBlogPosts({ page: 1, pageSize: 2 }, db);
    assert.equal(page1.total, 3);
    assert.equal(page1.items.length, 2);
    assert.equal(page1.totalPages, 2);

    const page2 = await listPublishedBlogPosts({ page: 2, pageSize: 2 }, db);
    assert.equal(page2.items.length, 1);

    const adminDrafts = await listBlogPostsForAdmin({ status: 'draft' }, db);
    assert.equal(adminDrafts.total, 2);

    // Bounds check on normalizePagination
    const clamped = normalizePagination(-5, 999);
    assert.equal(clamped.page, 1);
    assert.equal(clamped.pageSize, 50);
  });

  test('returns ONLY AVAILABLE vehicles from active dealers and strictly excludes SOLD, HIDDEN, RESERVED', async () => {
    const { db, vehicles } = createInMemoryBlogDb();

    const vAvailable1 = makeMockPrismaVehicle({
      id: 'v-avail-1',
      slug: 'vw-golf-7-avail-1',
      title: 'VW Golf 7 Available 1',
      status: 'AVAILABLE',
    });
    const vSold = makeMockPrismaVehicle({
      id: 'v-sold',
      slug: 'vw-golf-7-sold',
      title: 'VW Golf 7 Sold',
      status: 'SOLD',
    });
    const vHidden = makeMockPrismaVehicle({
      id: 'v-hidden',
      slug: 'vw-golf-7-hidden',
      title: 'VW Golf 7 Hidden',
      status: 'HIDDEN',
    });
    const vReserved = makeMockPrismaVehicle({
      id: 'v-reserved',
      slug: 'vw-golf-7-reserved',
      title: 'VW Golf 7 Reserved (Draft)',
      status: 'RESERVED',
    });
    const vHiddenDealer = makeMockPrismaVehicle({
      id: 'v-hidden-dealer',
      slug: 'vw-golf-7-hidden-dealer',
      title: 'VW Golf 7 Hidden Dealer',
      status: 'AVAILABLE',
      dealerId: 'd-hidden',
      dealer: {
        id: 'd-hidden',
        name: 'Skriveni Plac',
        slug: 'skriveni-plac',
        phone: '060000000',
        location: 'Beograd',
        isVerified: false,
        status: 'HIDDEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const vBrandFallback = makeMockPrismaVehicle({
      id: 'v-avail-2',
      slug: 'vw-golf-7-avail-2',
      title: 'VW Golf 7 Available Fallback',
      status: 'AVAILABLE',
    });

    for (const v of [vAvailable1, vSold, vHidden, vReserved, vHiddenDealer, vBrandFallback]) {
      vehicles.set(v.id, v);
    }

    // Direct unit check on filterAvailableVehicleRows
    const directFiltered = filterAvailableVehicleRows([
      vAvailable1,
      vSold,
      vHidden,
      vReserved,
      vHiddenDealer,
    ] as any);
    assert.deepEqual(
      directFiltered.map((v) => v.id),
      ['v-avail-1'],
    );

    // Full post resolution check (manual links + brand/model fallback)
    const post = await createBlogPost(
      {
        title: 'Golf 7 test povezanih vozila',
        excerpt: 'Test',
        content: VALID_SAMPLE_CONTENT,
        status: 'published',
        relatedBrand: 'Volkswagen',
        relatedModel: 'Golf 7',
        relatedVehicleIds: ['v-sold', 'v-hidden', 'v-reserved', 'v-hidden-dealer', 'v-avail-1'],
      },
      db,
    );

    const publicDetail = await getPublishedBlogPostBySlug(post.slug, db);
    assert.ok(publicDetail);
    assert.deepEqual(
      publicDetail.relatedVehicles.map((v) => v.id),
      ['v-avail-1', 'v-avail-2'],
    );

    // Also verify getRelatedAvailableVehiclesForPost directly
    const related = await getRelatedAvailableVehiclesForPost(
      {
        postId: post.id,
        relatedBrand: 'Volkswagen',
        relatedModel: 'Golf 7',
        limit: 4,
      },
      db,
    );
    assert.deepEqual(
      related.map((v) => v.id),
      ['v-avail-1', 'v-avail-2'],
    );
  });
});

// ─── 4. Cloudflare R2 Media Helper & Isolation Tests ──────────────────────────

describe('Cloudflare R2 Blog Media Namespace & Cleanup Isolation (lib/r2)', () => {
  test('builds isolated blog object keys under blog/{postId}/ and blog/tmp-xxx/', () => {
    const savedKey = buildBlogObjectKey('post_123', 'Golf 7 Naslovna.WEBP');
    assert.match(savedKey, /^blog\/post_123\/\d+-golf-7-naslovna\.webp$/);

    const tempKey = buildBlogObjectKey(undefined, 'Inline Image.jpg');
    assert.equal(tempKey.startsWith(BLOG_TEMP_OBJECT_PREFIX), true);
    assert.match(tempKey, /^blog\/tmp-[a-f0-9]{8}\/\d+-inline-image\.jpg$/);
  });

  test('preserves existing vehicle object keys under vehicles/{vehicleId}/ and vehicles/tmp-xxx/', () => {
    const vehicleKey = buildObjectKey('veh_456', 'Front View.JPG');
    assert.match(vehicleKey, /^vehicles\/veh_456\/\d+-front-view\.jpg$/);

    const tempVehicleKey = buildObjectKey(null, 'Temp Photo.png');
    assert.equal(tempVehicleKey.startsWith(TEMP_OBJECT_PREFIX), true);
    assert.match(tempVehicleKey, /^vehicles\/tmp-[a-f0-9]{8}\/\d+-temp-photo\.png$/);
  });

  test('prevents path traversal in postId, vehicleId, and filename', () => {
    const key = buildBlogObjectKey('../../vehicles/tmp-hack', '../../../etc/passwd.png');
    assert.equal(key.includes('..'), false);
    assert.equal(key.startsWith('blog/'), true);
  });

  test('validates allowed image MIME types and 10 MB file size cap', () => {
    assert.equal(validateUpload('image/jpeg', 2 * 1024 * 1024), null);
    assert.equal(validateUpload('image/png', 5 * 1024 * 1024), null);
    assert.equal(validateUpload('image/webp', MAX_FILE_SIZE), null);

    assert.ok(validateUpload('image/svg+xml', 1024));
    assert.ok(validateUpload('text/html', 1024));
    assert.ok(validateUpload('image/webp', MAX_FILE_SIZE + 1));
  });

  test('guarantees vehicle temp cleanup never deletes blog/* or saved URLs', () => {
    const cutoff = new Date('2026-06-01T12:00:00Z');
    const oldDate = new Date('2026-05-30T12:00:00Z');
    const recentDate = new Date('2026-06-01T13:00:00Z');
    const publicBase = 'https://pub-example.r2.dev';
    const savedUrls = new Set<string>([
      'https://pub-example.r2.dev/vehicles/tmp-saved123/1700-saved.webp',
      'https://pub-example.r2.dev/blog/tmp-draft123/1700-blog.webp',
    ]);

    // 1. Saved blog object -> wrong-prefix (never touched by vehicle temp cleanup)
    assert.equal(
      skipReasonFor(
        { key: 'blog/post-1/1700-hero.webp', lastModified: oldDate, sizeBytes: 1000 },
        cutoff,
        publicBase,
        savedUrls,
      ),
      'wrong-prefix',
    );

    // 2. Temporary blog object -> wrong-prefix (never touched by vehicle temp cleanup)
    assert.equal(
      skipReasonFor(
        { key: 'blog/tmp-draft123/1700-blog.webp', lastModified: oldDate, sizeBytes: 1000 },
        cutoff,
        publicBase,
        savedUrls,
      ),
      'wrong-prefix',
    );

    // 3. Saved vehicle temp object -> in-db (protected)
    assert.equal(
      skipReasonFor(
        { key: 'vehicles/tmp-saved123/1700-saved.webp', lastModified: oldDate, sizeBytes: 1000 },
        cutoff,
        publicBase,
        savedUrls,
      ),
      'in-db',
    );

    // 4. Recent vehicle temp object -> too-recent (protected)
    assert.match(
      skipReasonFor(
        { key: 'vehicles/tmp-new999/1700-new.webp', lastModified: recentDate, sizeBytes: 1000 },
        cutoff,
        publicBase,
        savedUrls,
      ) ?? '',
      /^too-recent/,
    );

    // 5. Expired unreferenced vehicle temp object -> null (safe to delete)
    assert.equal(
      skipReasonFor(
        { key: 'vehicles/tmp-orphan999/1700-orphan.webp', lastModified: oldDate, sizeBytes: 1000 },
        cutoff,
        publicBase,
        savedUrls,
      ),
      null,
    );
  });
});
