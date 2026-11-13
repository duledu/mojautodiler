import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

import {
  getPublicVehicleBySlug,
  isPubliclyVisibleVehicle,
} from '../lib/db/vehicles';
import {
  toAppVehicle,
  toAppVehicleStatus,
  toDbVehicleStatus,
} from '../lib/db/mappers';
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminRequestAuthenticated,
} from '../lib/admin-auth';
import {
  handleAdminBlogGet,
  handleAdminBlogPost,
} from '../app/api/admin/blog/route';
import {
  handleAdminBlogDetailDelete,
  handleAdminBlogDetailGet,
  handleAdminBlogDetailPut,
} from '../app/api/admin/blog/[id]/route';
import {
  handleAdminBlogCategoriesGet,
  handleAdminBlogCategoriesPost,
} from '../app/api/admin/blog/categories/route';
import {
  blogDocumentToTiptapJson,
  tiptapJsonToBlogDocument,
} from '../lib/blog-tiptap-adapter';
import { BlogContentValidationError } from '../lib/blog-content';
import { getPublishedBlogPostBySlug, type BlogDatabaseClient } from '../lib/db/blog';
import { buildBlogObjectKey, buildObjectKey } from '../lib/r2';
import type { BlogContentDocument } from '../types/blog';
import type { VehicleStatus } from '../types/vehicle';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const SAMPLE_STRUCTURED_DOC: BlogContentDocument = {
  version: 1,
  blocks: [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Vodič za kupovinu polovnog automobila' }],
    },
    {
      type: 'heading',
      level: 3,
      children: [{ type: 'text', text: 'Provera servisne istorije', bold: true }],
    },
    {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Pre kupovine pregledajte našu ' },
        {
          type: 'link',
          href: '/sr/inventory',
          text: 'ponudu proverenih vozila',
          bold: true,
        },
        { type: 'text', text: ' ili pročitajte iskustva vlasnika na ' },
        {
          type: 'link',
          href: 'https://example.com/recenzije',
          text: 'eksternom portalu',
          italic: true,
          openInNewTab: true,
        },
      ],
    },
    {
      type: 'list',
      style: 'ordered',
      items: [
        [{ type: 'text', text: 'Proverite broj šasije (VIN)', bold: true }],
        [{ type: 'text', text: 'Obavite dijagnostički pregled u servisu' }],
      ],
    },
    {
      type: 'blockquote',
      children: [
        {
          type: 'text',
          text: 'Redovno održavano vozilo sa urednom servisnom knjižicom zadržava vrednost.',
        },
      ],
      citation: 'Stručni tim MojAutoDiler',
    },
    {
      type: 'image',
      src: 'https://pub-example.r2.dev/blog/post-1/1700000000-pregled.webp',
      alt: 'Dijagnostički pregled polovnog automobila',
      caption: 'Detaljna provera pre isporuke kupcu',
      r2Key: 'blog/post-1/1700000000-pregled.webp',
    },
    {
      type: 'table',
      headers: ['Stavka', 'Interval zamene', 'Prioritet'],
      rows: [
        ['Mali servis', '10.000 – 15.000 km', 'Visok'],
        ['Veliki servis', '90.000 – 120.000 km', 'Kritičan'],
      ],
      caption: 'Preporučeni servisni intervali',
    },
  ],
};

function makePrismaVehicleRow(
  dbStatus: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'HIDDEN',
  overrides: Record<string, unknown> = {},
) {
  const now = new Date('2026-04-01T10:00:00Z');
  return {
    id: `veh-${dbStatus.toLowerCase()}`,
    slug: `audi-a4-${dbStatus.toLowerCase()}`,
    title: `Audi A4 2.0 TDI (${dbStatus})`,
    brand: 'Audi',
    model: 'A4',
    generation: 'B9',
    year: 2020,
    mileage: 112000,
    price: 21900,
    currency: 'EUR',
    vatMode: 'NONE',
    fuelType: 'dizel',
    transmission: 'automatski',
    drivetrain: 'prednji',
    bodyType: 'limuzina',
    condition: 'polovno',
    engineSize: '1968',
    horsepower: 190,
    kilowatts: 140,
    doors: 4,
    seats: 5,
    color: 'Crna',
    interiorColor: 'Crna',
    vin: 'WAUZZZF40LA000001',
    registration: '2026-12',
    origin: 'Nemačka',
    description: 'Uredna servisna istorija.',
    dealerNotes: 'Interna napomena',
    equipment: ['LED farovi', 'Navigacija'],
    safetyFeatures: ['ABS', 'ESP'],
    features: ['Garancija'],
    images: ['https://pub-example.r2.dev/vehicles/veh-1/front.webp'],
    videoUrl: null,
    status: dbStatus,
    featured: false,
    showcase: false,
    onSale: false,
    tags: ['top'],
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

function createMockBlogDb() {
  const posts = new Map<string, any>();
  const categories = new Map<string, any>();
  const postVehicles: Array<{ id: string; postId: string; vehicleId: string; sortOrder: number; createdAt: Date }> = [];
  const postRelations: Array<{ id: string; sourcePostId: string; relatedPostId: string; sortOrder: number; createdAt: Date }> = [];
  const vehicles = new Map<string, any>();
  let seq = 1;
  const nextId = (prefix: string) => `${prefix}-${seq++}`;

  const hydrate = (row: any, include?: any) => {
    if (!row) return null;
    const copy = { ...row };
    if (include?.category) {
      copy.category = copy.categoryId ? (categories.get(copy.categoryId) ?? null) : null;
    }
    if (include?.relatedVehicles) {
      copy.relatedVehicles = postVehicles
        .filter((pv) => pv.postId === row.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((pv) => ({
          ...pv,
          ...(include.relatedVehicles.include?.vehicle
            ? { vehicle: vehicles.get(pv.vehicleId) ?? null }
            : {}),
        }))
        .filter((pv) => !include.relatedVehicles.include?.vehicle || pv.vehicle !== null);
    }
    if (include?.relatedFrom) {
      copy.relatedFrom = postRelations
        .filter((pr) => pr.sourcePostId === row.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return copy;
  };

  const matchesWhere = (row: any, where: any): boolean => {
    if (!where) return true;
    if (where.id !== undefined && row.id !== where.id) return false;
    if (where.slug !== undefined && row.slug !== where.slug) return false;
    if (where.locale !== undefined && row.locale !== where.locale) return false;
    if (where.status !== undefined && row.status !== where.status) return false;
    if (where.categoryId !== undefined && row.categoryId !== where.categoryId) return false;
    if (where.publishedAt) {
      if (where.publishedAt.not === null && row.publishedAt === null) return false;
      if (where.publishedAt.lte && (!row.publishedAt || row.publishedAt > where.publishedAt.lte)) {
        return false;
      }
    }
    return true;
  };

  const db: BlogDatabaseClient = {
    blogPost: {
      findUnique: async ({ where, include }: any) => {
        if (where.id) return hydrate(posts.get(where.id) ?? null, include);
        if (where.slug) {
          for (const p of posts.values()) {
            if (p.slug === where.slug) return hydrate(p, include);
          }
        }
        return null;
      },
      findFirst: async ({ where, include }: any) => {
        for (const p of posts.values()) {
          if (matchesWhere(p, where)) return hydrate(p, include);
        }
        return null;
      },
      findMany: async ({ where, skip = 0, take = 50, include }: any = {}) => {
        return Array.from(posts.values())
          .filter((p) => matchesWhere(p, where))
          .slice(skip, skip + take)
          .map((p) => hydrate(p, include));
      },
      count: async ({ where }: any = {}) => {
        return Array.from(posts.values()).filter((p) => matchesWhere(p, where)).length;
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
        for (const rv of data.relatedVehicles?.create ?? []) {
          postVehicles.push({
            id: nextId('pv'),
            postId: id,
            vehicleId: rv.vehicleId,
            sortOrder: rv.sortOrder,
            createdAt: now,
          });
        }
        return hydrate(row, include);
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
        return hydrate(updated, include);
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
            if (!v || v.status !== 'AVAILABLE') return false;
            return true;
          })
          .slice(0, take)
          .map((pv) => ({ ...pv, vehicle: vehicles.get(pv.vehicleId) }));
      },
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    } as any,
    blogPostRelation: {
      deleteMany: async () => ({ count: 0 }),
      createMany: async () => ({ count: 0 }),
    } as any,
    vehicle: {
      findMany: async () => [],
    } as any,
    $transaction: (async (ops: Promise<unknown>[]) => Promise.all(ops)) as any,
  };

  return { db, vehicles };
}

async function makeAdminRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    authenticated?: boolean;
    customToken?: string;
  } = {},
): Promise<NextRequest> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (options.authenticated) {
    const token = options.customToken ?? (await createSessionToken());
    headers.set('cookie', `${ADMIN_COOKIE}=${token}`);
  } else if (options.customToken) {
    headers.set('cookie', `${ADMIN_COOKIE}=${options.customToken}`);
  }

  return new NextRequest(url, {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
}

// ─── 1. Public vs Admin Vehicle Visibility Tests ──────────────────────────────

describe('Public vs Admin Vehicle Visibility Security Fix', () => {
  const bySlugMap = new Map<string, ReturnType<typeof toAppVehicle>>([
    ['audi-a4-available', toAppVehicle(makePrismaVehicleRow('AVAILABLE') as any)],
    ['audi-a4-sold', toAppVehicle(makePrismaVehicleRow('SOLD') as any)],
    ['audi-a4-reserved', toAppVehicle(makePrismaVehicleRow('RESERVED') as any)],
    ['audi-a4-hidden', toAppVehicle(makePrismaVehicleRow('HIDDEN') as any)],
  ]);

  const mockUnrestrictedSlugFetcher = async (slug: string) =>
    bySlugMap.get(slug) ?? null;

  test('Public access: AVAILABLE vehicle is allowed', async () => {
    const v = await getPublicVehicleBySlug(
      'audi-a4-available',
      mockUnrestrictedSlugSlugFetcher,
    );
    assert.ok(v);
    assert.equal(v.status, 'active');
    assert.equal(isPubliclyVisibleVehicle(v), true);
  });

  test('Public access: SOLD vehicle preserves existing public behavior', async () => {
    const v = await getPublicVehicleBySlug(
      'audi-a4-sold',
      mockUnrestrictedSlugSlugFetcher,
    );
    assert.ok(v);
    assert.equal(v.status, 'sold');
    assert.equal(isPubliclyVisibleVehicle(v), true);
  });

  test('Public access: RESERVED (draft) vehicle returns null (Not Found)', async () => {
    const v = await getPublicVehicleBySlug(
      'audi-a4-reserved',
      mockUnrestrictedSlugSlugFetcher,
    );
    assert.equal(v, null);
    assert.equal(
      isPubliclyVisibleVehicle(bySlugMap.get('audi-a4-reserved')),
      false,
    );
  });

  test('Public access: HIDDEN vehicle returns null (Not Found)', async () => {
    const v = await getPublicVehicleBySlug(
      'audi-a4-hidden',
      mockUnrestrictedSlugSlugFetcher,
    );
    assert.equal(v, null);
    assert.equal(
      isPubliclyVisibleVehicle(bySlugMap.get('audi-a4-hidden')),
      false,
    );
  });

  test('Public access: nonexistent vehicle returns null (Not Found)', async () => {
    const v = await getPublicVehicleBySlug(
      'nepostojece-vozilo-123',
      mockUnrestrictedSlugSlugFetcher,
    );
    assert.equal(v, null);
    assert.equal(isPubliclyVisibleVehicle(null), false);
  });

  test('Admin access: all four statuses remain accessible and round-trip cleanly for admin workflows', async () => {
    const statusPairs: Array<[VehicleStatus, 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN']> = [
      ['active', 'AVAILABLE'],
      ['draft', 'RESERVED'],
      ['sold', 'SOLD'],
      ['hidden', 'HIDDEN'],
    ];

    for (const [appStatus, dbStatus] of statusPairs) {
      assert.equal(toDbVehicleStatus(appStatus), dbStatus);
      assert.equal(toAppVehicleStatus(dbStatus), appStatus);

      // Unrestricted fetcher returns all four vehicles for admin usage
      const slug = `audi-a4-${dbStatus.toLowerCase()}`;
      const adminVehicle = await mockUnrestrictedSlugSlugFetcher(slug);
      assert.ok(adminVehicle, `Admin must be able to load ${dbStatus} vehicle`);
      assert.equal(adminVehicle.status, appStatus);
      assert.equal(adminVehicle.images.length, 1);
      assert.equal(adminVehicle.dealerNotes, 'Interna napomena');
    }
  });

  function mockUnrestrictedSlugSlugFetcher(slug: string) {
    return mockUnrestrictedSlugFetcher(slug);
  }
});

// ─── 2. Tiptap Rich-Text Editor Lossless Round-Trip Tests ─────────────────────

describe('Tiptap Rich-Text Editor Adapter (lib/blog-tiptap-adapter)', () => {
  test('losslessly round-trips Phase 1 BlogContentDocument through Tiptap JSONContent', () => {
    const tiptapJson = blogDocumentToTiptapJson(SAMPLE_STRUCTURED_DOC);
    assert.equal(tiptapJson.type, 'doc');
    assert.ok(Array.isArray(tiptapJson.content));

    const roundTripped = tiptapJsonToBlogDocument(tiptapJson);
    assert.deepEqual(roundTripped, SAMPLE_STRUCTURED_DOC);
  });

  test('clamps pasted H1 headings in Tiptap to H2 and strips empty trailing paragraphs', () => {
    const tiptapWithH1AndEmptyParagraph = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Naslov nalepljen kao H1' }],
        },
        {
          type: 'paragraph',
          content: [],
        },
      ],
    };

    const normalized = tiptapJsonToBlogDocument(tiptapWithH1AndEmptyParagraph);
    assert.equal(normalized.blocks.length, 1);
    assert.equal(normalized.blocks[0].type, 'heading');
    if (normalized.blocks[0].type === 'heading') {
      assert.equal(normalized.blocks[0].level, 2);
    }
  });

  test('rejects XSS script payloads inside Tiptap JSON nodes', () => {
    const maliciousTiptapJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Tekst sa <script>alert(1)</script> payloadom' },
          ],
        },
      ],
    };

    assert.throws(
      () => tiptapJsonToBlogDocument(maliciousTiptapJson),
      BlogContentValidationError,
    );
  });
});

// ─── 3. Admin Blog API Security & Workflow Tests ──────────────────────────────

describe('Admin Blog Manager API Routes & Security', () => {
  test('rejects unauthorized requests (missing, forged, or expired cookie) with HTTP 401 across all endpoints', async () => {
    const { db } = createMockBlogDb();

    const unauthGetList = await handleAdminBlogGet(
      await makeAdminRequest('http://localhost/api/admin/blog'),
      db,
    );
    assert.equal(unauthGetList.status, 401);

    const forgedPost = await handleAdminBlogPost(
      await makeAdminRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        customToken: '1700000000.forged-signature',
        body: { title: 'Test', excerpt: 'Test', content: SAMPLE_STRUCTURED_DOC },
      }),
      db,
    );
    assert.equal(forgedPost.status, 401);

    const unauthDetailGet = await handleAdminBlogDetailGet(
      await makeAdminRequest('http://localhost/api/admin/blog/post-1'),
      'post-1',
      db,
    );
    assert.equal(unauthDetailGet.status, 401);

    const unauthDetailPut = await handleAdminBlogDetailPut(
      await makeAdminRequest('http://localhost/api/admin/blog/post-1', {
        method: 'PUT',
        body: { title: 'Izmena' },
      }),
      'post-1',
      db,
    );
    assert.equal(unauthDetailPut.status, 401);

    const unauthDetailDelete = await handleAdminBlogDetailDelete(
      await makeAdminRequest('http://localhost/api/admin/blog/post-1', {
        method: 'DELETE',
      }),
      'post-1',
      db,
    );
    assert.equal(unauthDetailDelete.status, 401);

    const unauthCategoriesGet = await handleAdminBlogCategoriesGet(
      await makeAdminRequest('http://localhost/api/admin/blog/categories'),
      db,
    );
    assert.equal(unauthCategoriesGet.status, 401);

    const unauthCategoriesPost = await handleAdminBlogCategoriesPost(
      await makeAdminRequest('http://localhost/api/admin/blog/categories', {
        method: 'POST',
        body: { name: 'Saveti' },
      }),
      db,
    );
    assert.equal(unauthCategoriesPost.status, 401);
  });

  test('supports authenticated category creation, draft creation, editing, publishing, related vehicle filtering, and archiving', async () => {
    const { db, vehicles } = createMockBlogDb();

    // Seed 1 AVAILABLE, 1 SOLD, 1 HIDDEN, and 1 RESERVED vehicle
    vehicles.set('v-avail', makePrismaVehicleRow('AVAILABLE', { id: 'v-avail' }));
    vehicles.set('v-sold', makePrismaVehicleRow('SOLD', { id: 'v-sold' }));
    vehicles.set('v-hidden', makePrismaVehicleRow('HIDDEN', { id: 'v-hidden' }));
    vehicles.set('v-reserved', makePrismaVehicleRow('RESERVED', { id: 'v-reserved' }));

    // 1. Create a category
    const catRes = await handleAdminBlogCategoriesPost(
      await makeAdminRequest('http://localhost/api/admin/blog/categories', {
        method: 'POST',
        authenticated: true,
        body: {
          name: 'Vodiči za kupovinu',
          description: 'Detaljni vodiči za polovne automobile',
        },
      }),
      db,
    );
    assert.equal(catRes.status, 201);
    const catData = (await catRes.json()) as { category: { id: string; slug: string } };
    assert.equal(catData.category.slug, 'vodici-za-kupovinu');

    // 2. Create a draft blog post
    const createRes = await handleAdminBlogPost(
      await makeAdminRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        authenticated: true,
        body: {
          title: 'Audi A4 B9 – iskustva i održavanje',
          excerpt: 'Sve što treba da znate pre kupovine polovnog Audija A4 B9.',
          content: SAMPLE_STRUCTURED_DOC,
          categoryId: catData.category.id,
          featuredImage: 'https://pub-example.r2.dev/blog/tmp-123/audi-a4.webp',
          featuredImageAlt: 'Audi A4 B9 limuzina',
          relatedVehicleIds: ['v-avail', 'v-sold', 'v-hidden', 'v-reserved'],
        },
      }),
      db,
    );
    assert.equal(createRes.status, 201);
    const createdData = (await createRes.json()) as { post: { id: string; slug: string; status: string } };
    assert.equal(createdData.post.slug, 'audi-a4-b9-iskustva-i-odrzavanje');
    assert.equal(createdData.post.status, 'draft');

    // 3. Duplicate slug collision -> 409
    const duplicateRes = await handleAdminBlogPost(
      await makeAdminRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        authenticated: true,
        body: {
          title: 'Audi A4 B9 – iskustva i održavanje!',
          excerpt: 'Duplikat.',
          content: SAMPLE_STRUCTURED_DOC,
        },
      }),
      db,
    );
    assert.equal(duplicateRes.status, 409);

    // 4. Validation error (missing featuredImageAlt when featuredImage is set) -> 422
    const invalidImageAltRes = await handleAdminBlogPost(
      await makeAdminRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        authenticated: true,
        body: {
          title: 'Drugi članak',
          excerpt: 'Opis',
          content: SAMPLE_STRUCTURED_DOC,
          featuredImage: 'https://pub-example.r2.dev/blog/tmp-123/img.webp',
          featuredImageAlt: '',
        },
      }),
      db,
    );
    assert.equal(invalidImageAltRes.status, 422);

    // 5. Publish the post via PUT
    const publishRes = await handleAdminBlogDetailPut(
      await makeAdminRequest(`http://localhost/api/admin/blog/${createdData.post.id}`, {
        method: 'PUT',
        authenticated: true,
        body: {
          status: 'published',
          seoTitle: 'Audi A4 B9 Vodič | Moj Auto Diler',
        },
      }),
      createdData.post.id,
      db,
    );
    assert.equal(publishRes.status, 200);
    const publishedData = (await publishRes.json()) as {
      post: { status: string; publishedAt: string | null; seoTitle: string };
    };
    assert.equal(publishedData.post.status, 'published');
    assert.ok(publishedData.post.publishedAt);
    assert.equal(publishedData.post.seoTitle, 'Audi A4 B9 Vodič | Moj Auto Diler');

    // Verify related vehicle visibility on published post: only AVAILABLE ('v-avail') is returned
    const publicDetail = await getPublishedBlogPostBySlug(createdData.post.slug, db);
    assert.ok(publicDetail);
    assert.deepEqual(
      publicDetail.relatedVehicles.map((v) => v.id),
      ['v-avail'],
    );

    // 6. Archive via DELETE
    const archiveRes = await handleAdminBlogDetailDelete(
      await makeAdminRequest(`http://localhost/api/admin/blog/${createdData.post.id}`, {
        method: 'DELETE',
        authenticated: true,
      }),
      createdData.post.id,
      db,
    );
    assert.equal(archiveRes.status, 200);
    const archivedData = (await archiveRes.json()) as { post: { status: string } };
    assert.equal(archivedData.post.status, 'archived');

    // Archived post is no longer returned by public lookup
    assert.equal(await getPublishedBlogPostBySlug(createdData.post.slug, db), null);
  });

  test('verifies R2 blog and vehicle upload key compatibility and session helper', async () => {
    const validToken = await createSessionToken();
    const authReq = await makeAdminRequest('http://localhost/api/admin/blog', {
      authenticated: true,
      customToken: validToken,
    });
    assert.equal(await isAdminRequestAuthenticated(authReq), true);

    const blogKey = buildBlogObjectKey('post-abc', 'Slika Članka.webp');
    const vehicleKey = buildObjectKey('veh-xyz', 'Slika Vozila.webp');
    assert.equal(blogKey.startsWith('blog/post-abc/'), true);
    assert.equal(vehicleKey.startsWith('vehicles/veh-xyz/'), true);
  });
});
