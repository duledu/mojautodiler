import type {
  BlogCategory as PrismaBlogCategory,
  BlogPost as PrismaBlogPost,
  BlogPostRelation as PrismaBlogPostRelation,
  BlogPostStatus as PrismaBlogPostStatus,
  BlogPostVehicle as PrismaBlogPostVehicle,
  Dealer as PrismaDealer,
  Vehicle as PrismaVehicle,
  VehicleMedia as PrismaVehicleMedia,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toAppVehicle } from '@/lib/db/mappers';
import { slugifySr } from '@/lib/utils';
import {
  assertSafeText,
  BlogContentValidationError,
  parseBlogContent,
  sanitizeBlogImageUrl,
  sanitizeBlogLinkUrl,
  serializeBlogContent,
  validateAffiliatePlacement,
} from '@/lib/blog-content';
import type {
  AffiliatePlacement,
  BlogCategory,
  BlogLocale,
  BlogPostAdminDetail,
  BlogPostAdminListOptions,
  BlogPostAdminSummary,
  BlogPostPublicDetail,
  BlogPostPublicListOptions,
  BlogPostPublicSummary,
  BlogPostStatus,
  BlogRelatedPostSummary,
  CreateBlogPostInput,
  PaginatedBlogResult,
  UpdateBlogPostInput,
} from '@/types/blog';
import type { Vehicle } from '@/types/vehicle';

// ─── Errors ───────────────────────────────────────────────────────────────────

export class BlogNotFoundError extends Error {
  constructor(message = 'Blog post not found.') {
    super(message);
    this.name = 'BlogNotFoundError';
  }
}

export class BlogSlugConflictError extends Error {
  readonly slug: string;
  constructor(slug: string) {
    super(`A blog post with slug "${slug}" already exists.`);
    this.name = 'BlogSlugConflictError';
    this.slug = slug;
  }
}

// ─── Status Mappers ───────────────────────────────────────────────────────────

export function toDbBlogStatus(status: BlogPostStatus | undefined): PrismaBlogPostStatus {
  const map: Record<BlogPostStatus, PrismaBlogPostStatus> = {
    draft: 'DRAFT',
    published: 'PUBLISHED',
    archived: 'ARCHIVED',
  };
  return status ? (map[status] ?? 'DRAFT') : 'DRAFT';
}

export function toAppBlogStatus(status: PrismaBlogPostStatus): BlogPostStatus {
  const map: Record<PrismaBlogPostStatus, BlogPostStatus> = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  };
  return map[status] ?? 'draft';
}

export function toAppBlogCategory(row: PrismaBlogCategory): BlogCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Pagination Helpers ───────────────────────────────────────────────────────

export const DEFAULT_BLOG_PAGE_SIZE = 12;
export const MAX_BLOG_PAGE_SIZE = 50;

export function normalizePagination(
  page?: number,
  pageSize?: number,
): { page: number; pageSize: number; skip: number; take: number } {
  const safePage =
    typeof page === 'number' && Number.isFinite(page) && page >= 1
      ? Math.floor(page)
      : 1;
  const rawSize =
    typeof pageSize === 'number' && Number.isFinite(pageSize) && pageSize >= 1
      ? Math.floor(pageSize)
      : DEFAULT_BLOG_PAGE_SIZE;
  const safePageSize = Math.min(rawSize, MAX_BLOG_PAGE_SIZE);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

// ─── DB Client Contract (supports dependency injection for isolated unit tests)

type PrismaPostWithAdminRelations = PrismaBlogPost & {
  category?: PrismaBlogCategory | null;
  relatedVehicles?: PrismaBlogPostVehicle[];
  relatedFrom?: PrismaBlogPostRelation[];
};

type PrismaVehicleWithDealer = PrismaVehicle & {
  dealer?: PrismaDealer | null;
  media?: PrismaVehicleMedia[];
};

type PrismaPostWithPublicRelations = PrismaBlogPost & {
  category?: PrismaBlogCategory | null;
  relatedVehicles?: Array<
    PrismaBlogPostVehicle & {
      vehicle: PrismaVehicleWithDealer;
    }
  >;
  relatedFrom?: Array<
    PrismaBlogPostRelation & {
      relatedPost: PrismaBlogPost & { category?: PrismaBlogCategory | null };
    }
  >;
};

export type BlogDatabaseClient = Pick<
  typeof prisma,
  'blogPost' | 'blogCategory' | 'blogPostVehicle' | 'blogPostRelation' | 'vehicle' | '$transaction'
>;

// ─── Row Mappers ──────────────────────────────────────────────────────────────

function toAdminSummary(
  row: PrismaBlogPost & { category?: PrismaBlogCategory | null },
): BlogPostAdminSummary {
  return {
    id: row.id,
    slug: row.slug,
    locale: 'sr',
    title: row.title,
    excerpt: row.excerpt,
    featuredImage: sanitizeBlogImageUrl(row.featuredImage),
    featuredImageAlt: row.featuredImageAlt ?? null,
    authorName: row.authorName,
    categoryId: row.categoryId ?? null,
    category: row.category ? toAppBlogCategory(row.category) : null,
    status: toAppBlogStatus(row.status),
    noindex: row.noindex,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAdminDetail(row: PrismaPostWithAdminRelations): BlogPostAdminDetail {
  const summary = toAdminSummary(row);
  return {
    ...summary,
    content: parseBlogContent(row.content, { fallbackOnCorrupt: true }),
    rawContent: row.content,
    featuredImageR2Key: row.featuredImageR2Key ?? null,
    seoTitle: row.seoTitle ?? null,
    metaDescription: row.metaDescription ?? null,
    ogImage: sanitizeBlogImageUrl(row.ogImage),
    canonicalUrl: row.canonicalUrl ?? null,
    relatedBrand: row.relatedBrand ?? null,
    relatedModel: row.relatedModel ?? null,
    affiliateCtaEnabled: row.affiliateCtaEnabled,
    affiliatePlacement: validateAffiliatePlacement(row.affiliatePlacement),
    affiliateLabel: row.affiliateLabel ?? null,
    relatedVehicleIds: (row.relatedVehicles ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((rv) => rv.vehicleId),
    relatedPostIds: (row.relatedFrom ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((rp) => rp.relatedPostId),
  };
}

function toPublicSummary(
  row: PrismaBlogPost & { category?: PrismaBlogCategory | null },
): BlogPostPublicSummary {
  const publishedIso = (row.publishedAt ?? row.createdAt).toISOString();
  return {
    id: row.id,
    slug: row.slug,
    locale: 'sr',
    title: row.title,
    excerpt: row.excerpt,
    featuredImage: sanitizeBlogImageUrl(row.featuredImage),
    featuredImageAlt: row.featuredImageAlt ?? null,
    authorName: row.authorName,
    category: row.category ? toAppBlogCategory(row.category) : null,
    publishedAt: publishedIso,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRelatedPostSummary(
  row: PrismaBlogPost & { category?: PrismaBlogCategory | null },
): BlogRelatedPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    locale: 'sr',
    title: row.title,
    excerpt: row.excerpt,
    featuredImage: sanitizeBlogImageUrl(row.featuredImage),
    featuredImageAlt: row.featuredImageAlt ?? null,
    category: row.category ? toAppBlogCategory(row.category) : null,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  };
}

// ─── Input Normalization & Validation ─────────────────────────────────────────

function normalizeOptionalString(
  value: string | null | undefined,
  fieldName: string,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const cleaned = assertSafeText(value, fieldName).trim();
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeOptionalImageUrl(
  value: string | null | undefined,
  fieldName: string,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const safe = sanitizeBlogImageUrl(value);
  if (!safe) {
    throw new BlogContentValidationError(`${fieldName} must be a valid HTTP(S) or root-relative image URL.`);
  }
  return safe;
}

function normalizeOptionalCanonicalUrl(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const safe = sanitizeBlogLinkUrl(value);
  if (!safe || (!safe.startsWith('https://') && !safe.startsWith('http://') && !safe.startsWith('/'))) {
    throw new BlogContentValidationError('canonicalUrl must be a valid HTTP(S) URL or internal path.');
  }
  return safe;
}

/**
 * Infers the `blog/{scope}/{filename}` R2 object key from a public URL if it
 * resides under `/blog/`. Ensures temporary (`blog/tmp-...`) and permanent
 * (`blog/{postId}/...`) R2 keys are always tracked on the BlogPost record.
 */
export function inferBlogR2KeyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const pathname = url.startsWith('/') ? url : new URL(url).pathname;
    const match = pathname.match(/\/?(blog\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isMissingDatabaseOrTableError(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? '';
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === 'P2021' ||
    code === 'P1001' ||
    code === 'P1002' ||
    msg.includes('does not exist') ||
    msg.includes('DATABASE_URL')
  );
}

function normalizeDate(value: Date | string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BlogContentValidationError('publishedAt must be a valid date.');
  }
  return date;
}

function resolveSlug(rawSlug: string | undefined, fallbackTitle: string): string {
  const source = rawSlug && rawSlug.trim().length > 0 ? rawSlug : fallbackTitle;
  const slug = slugifySr(source);
  if (!slug) {
    throw new BlogContentValidationError(
      'Unable to generate a valid Serbian URL slug from the provided slug or title.',
    );
  }
  return slug;
}

function deduplicateIds(ids: string[] | undefined, excludeId?: string): string[] | undefined {
  if (ids === undefined) return undefined;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of ids) {
    const id = String(raw ?? '').trim();
    if (!id || id === excludeId || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

/**
 * Filters a list of Prisma Vehicle records so ONLY active (`AVAILABLE`) vehicles
 * belonging to active (non-hidden) dealers are returned.
 * `SOLD`, `HIDDEN`, and `RESERVED` vehicles are strictly excluded.
 */
export function filterAvailableVehicleRows(
  rows: PrismaVehicleWithDealer[],
): Vehicle[] {
  const seenIds = new Set<string>();
  const active: Vehicle[] = [];

  for (const row of rows) {
    if (!row || row.status !== 'AVAILABLE') continue;
    if (row.dealer && row.dealer.status === 'HIDDEN') continue;
    if (seenIds.has(row.id)) continue;
    seenIds.add(row.id);
    active.push(toAppVehicle(row));
  }

  return active;
}

// ─── Related Vehicle Resolution (Section 7) ──────────────────────────────────

/**
 * Resolves up to `limit` active (`AVAILABLE`) vehicles related to a blog post.
 *
 * Resolution priority:
 *   1. Explicitly linked vehicles in `BlogPostVehicle` (ordered by `sortOrder ASC`)
 *      whose current status is `AVAILABLE` (and dealer is not `HIDDEN`).
 *   2. Optional fallback matching by `relatedBrand` (and optional `relatedModel`)
 *      for `AVAILABLE` vehicles when fewer than `limit` manual matches exist.
 *
 * `SOLD`, `HIDDEN`, and `RESERVED` vehicles are NEVER returned.
 */
export async function getRelatedAvailableVehiclesForPost(
  params: {
    postId?: string;
    manualVehicles?: PrismaVehicleWithDealer[];
    relatedBrand?: string | null;
    relatedModel?: string | null;
    limit?: number;
  },
  db: BlogDatabaseClient = prisma,
): Promise<Vehicle[]> {
  const limit = Math.max(1, Math.min(params.limit ?? 4, 12));

  let manualRows: PrismaVehicleWithDealer[] = [];
  if (params.manualVehicles) {
    manualRows = params.manualVehicles;
  } else if (params.postId) {
    const joinRows = await db.blogPostVehicle.findMany({
      where: {
        postId: params.postId,
        vehicle: {
          status: 'AVAILABLE',
          OR: [{ dealerId: null }, { dealer: { status: 'ACTIVE' } }],
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
      include: {
        vehicle: {
          include: { dealer: true },
        },
      },
    });
    manualRows = joinRows.map((jr) => jr.vehicle);
  }

  const manualActive = filterAvailableVehicleRows(manualRows).slice(0, limit);
  if (manualActive.length >= limit || !params.relatedBrand?.trim()) {
    return manualActive;
  }

  const remaining = limit - manualActive.length;
  const excludeIds = manualActive.map((v) => v.id);
  const brand = params.relatedBrand.trim();
  const model = params.relatedModel?.trim();

  const fallbackRows = await db.vehicle.findMany({
    where: {
      status: 'AVAILABLE',
      brand: { equals: brand, mode: 'insensitive' },
      ...(model ? { model: { contains: model, mode: 'insensitive' } } : {}),
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      OR: [{ dealerId: null }, { dealer: { status: 'ACTIVE' } }],
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: remaining,
    include: { dealer: true },
  });

  const combined = [...manualRows, ...fallbackRows];
  return filterAvailableVehicleRows(combined).slice(0, limit);
}

// ─── Admin Write Operations ───────────────────────────────────────────────────

/**
 * Creates a new blog post (defaults to `DRAFT` status and `sr` locale).
 * Enforces Serbian slug generation, slug uniqueness, structured content validation,
 * and safe affiliate default configuration.
 */
export async function createBlogPost(
  input: CreateBlogPostInput,
  db: BlogDatabaseClient = prisma,
): Promise<BlogPostAdminDetail> {
  const title = assertSafeText(input.title ?? '', 'title').trim();
  if (!title) {
    throw new BlogContentValidationError('Article title is required.');
  }

  const excerpt = assertSafeText(input.excerpt ?? '', 'excerpt').trim();
  if (!excerpt) {
    throw new BlogContentValidationError('Article excerpt is required.');
  }

  const slug = resolveSlug(input.slug, title);
  const locale: BlogLocale = 'sr';

  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing) {
    throw new BlogSlugConflictError(slug);
  }

  const serializedContent = serializeBlogContent(input.content);
  const dbStatus = toDbBlogStatus(input.status);
  const explicitPublishedAt = normalizeDate(input.publishedAt);
  const publishedAt =
    dbStatus === 'PUBLISHED'
      ? (explicitPublishedAt ?? new Date())
      : (explicitPublishedAt ?? null);

  const featuredImage = normalizeOptionalImageUrl(input.featuredImage, 'featuredImage') ?? null;
  const featuredImageAlt = normalizeOptionalString(input.featuredImageAlt, 'featuredImageAlt') ?? null;
  if (featuredImage && !featuredImageAlt) {
    throw new BlogContentValidationError(
      'featuredImageAlt is required when featuredImage is set.',
    );
  }

  const affiliatePlacement: AffiliatePlacement = validateAffiliatePlacement(
    input.affiliatePlacement,
  );
  const affiliateCtaEnabled = Boolean(input.affiliateCtaEnabled);

  const relatedVehicleIds = deduplicateIds(input.relatedVehicleIds) ?? [];
  const relatedPostIds = deduplicateIds(input.relatedPostIds) ?? [];

  const created = await db.blogPost.create({
    data: {
      slug,
      locale,
      title,
      excerpt,
      content: serializedContent,
      featuredImage,
      featuredImageAlt,
      featuredImageR2Key:
        normalizeOptionalString(input.featuredImageR2Key, 'featuredImageR2Key') ??
        inferBlogR2KeyFromUrl(featuredImage),
      seoTitle: normalizeOptionalString(input.seoTitle, 'seoTitle') ?? null,
      metaDescription:
        normalizeOptionalString(input.metaDescription, 'metaDescription') ?? null,
      ogImage: normalizeOptionalImageUrl(input.ogImage, 'ogImage') ?? null,
      canonicalUrl: normalizeOptionalCanonicalUrl(input.canonicalUrl) ?? null,
      noindex: Boolean(input.noindex),
      authorName:
        normalizeOptionalString(input.authorName, 'authorName') ?? 'Moj Auto Diler',
      categoryId: input.categoryId?.trim() || null,
      status: dbStatus,
      publishedAt,
      relatedBrand: normalizeOptionalString(input.relatedBrand, 'relatedBrand') ?? null,
      relatedModel: normalizeOptionalString(input.relatedModel, 'relatedModel') ?? null,
      affiliateCtaEnabled,
      affiliatePlacement,
      affiliateLabel:
        normalizeOptionalString(input.affiliateLabel, 'affiliateLabel') ?? null,
      ...(relatedVehicleIds.length > 0
        ? {
            relatedVehicles: {
              create: relatedVehicleIds.map((vehicleId, idx) => ({
                vehicleId,
                sortOrder: idx,
              })),
            },
          }
        : {}),
      ...(relatedPostIds.length > 0
        ? {
            relatedFrom: {
              create: relatedPostIds.map((relatedPostId, idx) => ({
                relatedPostId,
                sortOrder: idx,
              })),
            },
          }
        : {}),
    },
    include: {
      category: true,
      relatedVehicles: { orderBy: { sortOrder: 'asc' } },
      relatedFrom: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return toAdminDetail(created);
}

/**
 * Updates an existing blog post by ID.
 * Validates slug uniqueness on change, transitions `publishedAt` when publishing,
 * and optionally replaces `relatedVehicles` / `relatedPosts` join rows.
 */
export async function updateBlogPost(
  id: string,
  input: UpdateBlogPostInput,
  db: BlogDatabaseClient = prisma,
): Promise<BlogPostAdminDetail> {
  const existing = await db.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      relatedVehicles: { orderBy: { sortOrder: 'asc' } },
      relatedFrom: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!existing) {
    throw new BlogNotFoundError(`Blog post "${id}" not found.`);
  }

  const nextTitle =
    input.title !== undefined
      ? assertSafeText(input.title, 'title').trim()
      : existing.title;
  if (!nextTitle) {
    throw new BlogContentValidationError('Article title cannot be empty.');
  }

  const nextExcerpt =
    input.excerpt !== undefined
      ? assertSafeText(input.excerpt, 'excerpt').trim()
      : existing.excerpt;
  if (!nextExcerpt) {
    throw new BlogContentValidationError('Article excerpt cannot be empty.');
  }

  let nextSlug = existing.slug;
  if (input.slug !== undefined) {
    nextSlug = resolveSlug(input.slug, nextTitle);
    if (nextSlug !== existing.slug) {
      const conflict = await db.blogPost.findUnique({ where: { slug: nextSlug } });
      if (conflict && conflict.id !== id) {
        throw new BlogSlugConflictError(nextSlug);
      }
    }
  }

  const nextContent =
    input.content !== undefined
      ? serializeBlogContent(input.content)
      : existing.content;

  const nextStatus =
    input.status !== undefined ? toDbBlogStatus(input.status) : existing.status;

  let nextPublishedAt = existing.publishedAt;
  if (input.publishedAt !== undefined) {
    nextPublishedAt = normalizeDate(input.publishedAt) ?? null;
  } else if (nextStatus === 'PUBLISHED' && !existing.publishedAt) {
    nextPublishedAt = new Date();
  }

  const nextFeaturedImage =
    input.featuredImage !== undefined
      ? (normalizeOptionalImageUrl(input.featuredImage, 'featuredImage') ?? null)
      : existing.featuredImage;

  const nextFeaturedImageAlt =
    input.featuredImageAlt !== undefined
      ? (normalizeOptionalString(input.featuredImageAlt, 'featuredImageAlt') ?? null)
      : existing.featuredImageAlt;

  if (nextFeaturedImage && !nextFeaturedImageAlt) {
    throw new BlogContentValidationError(
      'featuredImageAlt is required when featuredImage is set.',
    );
  }

  const nextAffiliatePlacement =
    input.affiliatePlacement !== undefined
      ? validateAffiliatePlacement(input.affiliatePlacement)
      : validateAffiliatePlacement(existing.affiliatePlacement);

  const relatedVehicleIds = deduplicateIds(input.relatedVehicleIds);
  const relatedPostIds = deduplicateIds(input.relatedPostIds, id);

  const updated = await db.blogPost.update({
    where: { id },
    data: {
      slug: nextSlug,
      title: nextTitle,
      excerpt: nextExcerpt,
      content: nextContent,
      featuredImage: nextFeaturedImage,
      featuredImageAlt: nextFeaturedImageAlt,
      ...(input.featuredImageR2Key !== undefined
        ? {
            featuredImageR2Key:
              normalizeOptionalString(
                input.featuredImageR2Key,
                'featuredImageR2Key',
              ) ?? null,
          }
        : {}),
      ...(input.seoTitle !== undefined
        ? { seoTitle: normalizeOptionalString(input.seoTitle, 'seoTitle') ?? null }
        : {}),
      ...(input.metaDescription !== undefined
        ? {
            metaDescription:
              normalizeOptionalString(input.metaDescription, 'metaDescription') ??
              null,
          }
        : {}),
      ...(input.ogImage !== undefined
        ? { ogImage: normalizeOptionalImageUrl(input.ogImage, 'ogImage') ?? null }
        : {}),
      ...(input.canonicalUrl !== undefined
        ? { canonicalUrl: normalizeOptionalCanonicalUrl(input.canonicalUrl) ?? null }
        : {}),
      ...(input.noindex !== undefined ? { noindex: Boolean(input.noindex) } : {}),
      ...(input.authorName !== undefined
        ? {
            authorName:
              normalizeOptionalString(input.authorName, 'authorName') ??
              'Moj Auto Diler',
          }
        : {}),
      ...(input.categoryId !== undefined
        ? { categoryId: input.categoryId?.trim() || null }
        : {}),
      status: nextStatus,
      publishedAt: nextPublishedAt,
      ...(input.relatedBrand !== undefined
        ? {
            relatedBrand:
              normalizeOptionalString(input.relatedBrand, 'relatedBrand') ?? null,
          }
        : {}),
      ...(input.relatedModel !== undefined
        ? {
            relatedModel:
              normalizeOptionalString(input.relatedModel, 'relatedModel') ?? null,
          }
        : {}),
      ...(input.affiliateCtaEnabled !== undefined
        ? { affiliateCtaEnabled: Boolean(input.affiliateCtaEnabled) }
        : {}),
      affiliatePlacement: nextAffiliatePlacement,
      ...(input.affiliateLabel !== undefined
        ? {
            affiliateLabel:
              normalizeOptionalString(input.affiliateLabel, 'affiliateLabel') ??
              null,
          }
        : {}),
      ...(relatedVehicleIds !== undefined
        ? {
            relatedVehicles: {
              deleteMany: {},
              create: relatedVehicleIds.map((vehicleId, idx) => ({
                vehicleId,
                sortOrder: idx,
              })),
            },
          }
        : {}),
      ...(relatedPostIds !== undefined
        ? {
            relatedFrom: {
              deleteMany: {},
              create: relatedPostIds.map((relatedPostId, idx) => ({
                relatedPostId,
                sortOrder: idx,
              })),
            },
          }
        : {}),
    },
    include: {
      category: true,
      relatedVehicles: { orderBy: { sortOrder: 'asc' } },
      relatedFrom: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return toAdminDetail(updated);
}

/**
 * Safely archives a blog post without destructive deletion.
 */
export async function archiveBlogPost(
  id: string,
  db: BlogDatabaseClient = prisma,
): Promise<BlogPostAdminDetail> {
  return updateBlogPost(id, { status: 'archived' }, db);
}

/**
 * Replaces the ordered list of vehicles linked to a blog post.
 */
export async function setBlogPostRelatedVehicles(
  postId: string,
  vehicleIds: string[],
  db: BlogDatabaseClient = prisma,
): Promise<void> {
  const cleanIds = deduplicateIds(vehicleIds) ?? [];
  await db.$transaction([
    db.blogPostVehicle.deleteMany({ where: { postId } }),
    ...(cleanIds.length > 0
      ? [
          db.blogPostVehicle.createMany({
            data: cleanIds.map((vehicleId, idx) => ({
              postId,
              vehicleId,
              sortOrder: idx,
            })),
          }),
        ]
      : []),
  ]);
}

/**
 * Replaces the ordered list of manually related blog posts.
 */
export async function setBlogPostRelatedPosts(
  sourcePostId: string,
  relatedPostIds: string[],
  db: BlogDatabaseClient = prisma,
): Promise<void> {
  const cleanIds = deduplicateIds(relatedPostIds, sourcePostId) ?? [];
  await db.$transaction([
    db.blogPostRelation.deleteMany({ where: { sourcePostId } }),
    ...(cleanIds.length > 0
      ? [
          db.blogPostRelation.createMany({
            data: cleanIds.map((relatedPostId, idx) => ({
              sourcePostId,
              relatedPostId,
              sortOrder: idx,
            })),
          }),
        ]
      : []),
  ]);
}

// ─── Admin Read Operations ────────────────────────────────────────────────────

export async function getBlogPostByIdForAdmin(
  id: string,
  db: BlogDatabaseClient = prisma,
): Promise<BlogPostAdminDetail | null> {
  const row = await db.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      relatedVehicles: { orderBy: { sortOrder: 'asc' } },
      relatedFrom: { orderBy: { sortOrder: 'asc' } },
    },
  });
  return row ? toAdminDetail(row) : null;
}

export async function listBlogPostsForAdmin(
  options: BlogPostAdminListOptions = {},
  db: BlogDatabaseClient = prisma,
): Promise<PaginatedBlogResult<BlogPostAdminSummary>> {
  const { page, pageSize, skip, take } = normalizePagination(
    options.page,
    options.pageSize,
  );
  const search = options.search?.trim();

  const where = {
    ...(options.status ? { status: toDbBlogStatus(options.status) } : {}),
    ...(options.categoryId ? { categoryId: options.categoryId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
            { excerpt: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
      include: { category: true },
    }),
    db.blogPost.count({ where }),
  ]);

  return {
    items: rows.map(toAdminSummary),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// ─── Public Read Operations (Strictly PUBLISHED + sr + publishedAt <= now) ────

/**
 * Fetches a single published Serbian blog post by slug for public rendering.
 * Returns `null` if the post does not exist, is `DRAFT` or `ARCHIVED`, has a
 * future `publishedAt`, or has a non-`sr` locale.
 *
 * Also resolves only active (`AVAILABLE`) related vehicles and published related posts.
 */
export async function getPublishedBlogPostBySlug(
  slug: string,
  db: BlogDatabaseClient = prisma,
  now: Date = new Date(),
): Promise<BlogPostPublicDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;
  if (db === prisma && !process.env.DATABASE_URL) return null;

  let row: PrismaPostWithPublicRelations | null = null;
  try {
    row = (await db.blogPost.findFirst({
      where: {
        slug: normalizedSlug,
        locale: 'sr',
        status: 'PUBLISHED',
        publishedAt: { not: null, lte: now },
      },
      include: {
        category: true,
        relatedVehicles: {
          orderBy: { sortOrder: 'asc' },
          include: {
            vehicle: {
              include: { dealer: true },
            },
          },
        },
        relatedFrom: {
          orderBy: { sortOrder: 'asc' },
          include: {
            relatedPost: {
              include: { category: true },
            },
          },
        },
      },
    })) as PrismaPostWithPublicRelations | null;
  } catch (err) {
    if (isMissingDatabaseOrTableError(err)) return null;
    throw err;
  }

  if (!row || row.status !== 'PUBLISHED' || row.locale !== 'sr') {
    return null;
  }
  if (!row.publishedAt || row.publishedAt > now) {
    return null;
  }

  const manualVehicles = (row.relatedVehicles ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((rv) => rv.vehicle);

  const relatedVehicles = await getRelatedAvailableVehiclesForPost(
    {
      postId: row.id,
      manualVehicles,
      relatedBrand: row.relatedBrand,
      relatedModel: row.relatedModel,
      limit: 4,
    },
    db,
  );

  const relatedPosts = (row.relatedFrom ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => r.relatedPost)
    .filter(
      (p) =>
        p &&
        p.status === 'PUBLISHED' &&
        p.locale === 'sr' &&
        p.publishedAt !== null &&
        p.publishedAt <= now,
    )
    .map(toRelatedPostSummary);

  const summary = toPublicSummary(row);

  return {
    ...summary,
    content: parseBlogContent(row.content, { fallbackOnCorrupt: true }),
    seoTitle: row.seoTitle ?? null,
    metaDescription: row.metaDescription ?? null,
    ogImage: sanitizeBlogImageUrl(row.ogImage),
    canonicalUrl: row.canonicalUrl ?? null,
    noindex: row.noindex,
    relatedBrand: row.relatedBrand ?? null,
    relatedModel: row.relatedModel ?? null,
    affiliateCtaEnabled: row.affiliateCtaEnabled,
    affiliatePlacement: validateAffiliatePlacement(row.affiliatePlacement),
    affiliateLabel: row.affiliateLabel ?? null,
    relatedVehicles,
    relatedPosts,
  };
}

/**
 * Lists published Serbian blog posts with server-side pagination and optional
 * category slug filtering. Never returns `DRAFT` or `ARCHIVED` posts.
 */
export async function listPublishedBlogPosts(
  options: BlogPostPublicListOptions = {},
  db: BlogDatabaseClient = prisma,
  now: Date = new Date(),
): Promise<PaginatedBlogResult<BlogPostPublicSummary>> {
  const { page, pageSize, skip, take } = normalizePagination(
    options.page,
    options.pageSize,
  );
  const categorySlug = options.categorySlug?.trim().toLowerCase();

  const where = {
    locale: 'sr',
    status: 'PUBLISHED' as const,
    publishedAt: { not: null, lte: now },
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  if (db === prisma && !process.env.DATABASE_URL) {
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }

  let rows: Array<PrismaBlogPost & { category?: PrismaBlogCategory | null }> = [];
  let total = 0;
  try {
    [rows, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
        include: { category: true },
      }),
      db.blogPost.count({ where }),
    ]);
  } catch (err) {
    if (isMissingDatabaseOrTableError(err)) {
      return { items: [], total: 0, page, pageSize, totalPages: 1 };
    }
    throw err;
  }

  const safeRows = rows.filter(
    (r) =>
      r.status === 'PUBLISHED' &&
      r.locale === 'sr' &&
      r.publishedAt !== null &&
      r.publishedAt <= now,
  );

  return {
    items: safeRows.map(toPublicSummary),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Lists all blog categories ordered alphabetically by name.
 */
export async function listBlogCategories(
  db: BlogDatabaseClient = prisma,
): Promise<BlogCategory[]> {
  if (db === prisma && !process.env.DATABASE_URL) return [];
  try {
    const rows = await db.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(toAppBlogCategory);
  } catch (err) {
    if (isMissingDatabaseOrTableError(err)) return [];
    throw err;
  }
}

/**
 * Creates or updates a blog category using a Serbian slug.
 */
export async function upsertBlogCategory(
  input: { name: string; slug?: string; description?: string | null },
  db: BlogDatabaseClient = prisma,
): Promise<BlogCategory> {
  const name = assertSafeText(input.name ?? '', 'category.name').trim();
  if (!name) {
    throw new BlogContentValidationError('Category name is required.');
  }
  const slug = resolveSlug(input.slug, name);
  const description =
    normalizeOptionalString(input.description, 'category.description') ?? null;

  const row = await db.blogCategory.upsert({
    where: { slug },
    create: { slug, name, description },
    update: { name, description },
  });

  return toAppBlogCategory(row);
}

/**
 * Returns published, indexable (`noindex: false`) Serbian blog slugs and
 * modification timestamps for future sitemap integration.
 */
export async function getPublishedBlogSlugsForSitemap(
  db: BlogDatabaseClient = prisma,
  now: Date = new Date(),
): Promise<Array<{ slug: string; updatedAt: Date; publishedAt: Date }>> {
  if (db === prisma && !process.env.DATABASE_URL) return [];
  try {
    const rows = await db.blogPost.findMany({
      where: {
        locale: 'sr',
        status: 'PUBLISHED',
        noindex: false,
        publishedAt: { not: null, lte: now },
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return rows
      .filter((r): r is { slug: string; updatedAt: Date; publishedAt: Date } =>
        Boolean(r.publishedAt && r.publishedAt <= now),
      )
      .map((r) => ({
        slug: r.slug,
        updatedAt: r.updatedAt,
        publishedAt: r.publishedAt,
      }));
  } catch (err) {
    if (isMissingDatabaseOrTableError(err)) return [];
    throw err;
  }
}
