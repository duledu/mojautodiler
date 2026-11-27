import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { toAppVehicle, toDbVatMode, toDbVehicleStatus } from '@/lib/db/mappers';
import {
  computeActiveCategorySilos,
  getAllRegisteredCategorySilos,
  type ActiveCategorySilos,
  type CategoryVehicleCandidate,
} from '@/lib/seo/silos';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';

const hasDatabase = () => Boolean(process.env.DATABASE_URL);

function warnNoDB(fn: string) {
  console.warn(`[DB] ${fn}: DATABASE_URL is not set — returning empty. Add DATABASE_URL to .env.local`);
}

function logFetch(fn: string, count: number, first?: { title?: string; id?: string }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] ${fn}: ${count} vehicles from DB. First: "${first?.title ?? 'none'}" (id=${first?.id ?? '-'})`);
  }
}

// ─── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Returns the single homepage hero vehicle — the one with featured=true.
 * Falls back to the most recently added active vehicle when no hero is set.
 * At most ONE vehicle can have featured=true (enforced at write time).
 */
export async function getHeroVehicle(): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getHeroVehicle'); return null; }
  try {
    const hero = await prisma.vehicle.findFirst({
      where: { status: 'AVAILABLE', featured: true },
      include: { dealer: true },
    });
    if (hero) return toAppVehicle(hero);
    // Fallback: newest active vehicle so the homepage is never blank
    const fallback = await prisma.vehicle.findFirst({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      include: { dealer: true },
    });
    return fallback ? toAppVehicle(fallback) : null;
  } catch (err) {
    console.warn('[DB] getHeroVehicle failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Returns vehicles for the "Aktuelna premium selekcija" homepage grid.
 * Uses vehicles explicitly marked showcase=true. Falls back to the newest
 * active vehicles when no vehicles have been added to the showcase yet, so
 * the section is never empty on a fresh install.
 */
export async function getShowcaseVehicles(limit = 4): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getShowcaseVehicles'); return []; }
  try {
    const showcased = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE', showcase: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { dealer: true },
    });
    if (showcased.length > 0) {
      logFetch('getShowcaseVehicles (showcased)', showcased.length, showcased[0]);
      return showcased.map(toAppVehicle);
    }
    // Fallback: no vehicles explicitly showcased yet — show newest active
    const rows = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { dealer: true },
    });
    logFetch('getShowcaseVehicles (fallback)', rows.length, rows[0]);
    return rows.map(toAppVehicle);
  } catch (err) {
    console.warn('[DB] getShowcaseVehicles failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getFeaturedVehicles'); return []; }
  const rows = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE', featured: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { dealer: true },
  });
  logFetch('getFeaturedVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getActiveVehicles'); return []; }
  try {
    const rows = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      include: { dealer: true },
    });
    logFetch('getActiveVehicles', rows.length, rows[0]);
    return rows.map(toAppVehicle);
  } catch (err) {
    console.warn('[DB] getActiveVehicles failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getAllVehicles'); return []; }
  const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' }, include: { dealer: true } });
  logFetch('getAllVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

// Detail-page reads include ordered media so the gallery can render uploaded
// videos (VehicleMedia rows with type='video'). List/grid queries intentionally
// don't include this — they only ever need Vehicle.images.
const detailInclude = { dealer: true, media: { orderBy: { sortOrder: 'asc' as const } } };

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleBySlug'); return null; }
  // No try/catch here — callers use `if (!vehicle) notFound()`, so swallowing DB
  // errors would turn a transient outage into a false 404. Let the error propagate
  // to the route-level error.tsx boundary instead.
  const row = await prisma.vehicle.findUnique({ where: { slug }, include: detailInclude });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] getVehicleBySlug("${slug}"): ${row ? row.title : 'not found'}`);
  }
  return row ? toAppVehicle(row) : null;
}

/**
 * Determines whether a vehicle may be exposed on public routes.
 *
 * Confirmed public visibility policy:
 *   - AVAILABLE ('active') -> Allowed
 *   - SOLD      ('sold')   -> Allowed (existing public/SEO behavior preserved)
 *   - RESERVED  ('draft')  -> Restricted (not publicly accessible)
 *   - HIDDEN    ('hidden') -> Restricted (not publicly accessible)
 */
export function isPubliclyVisibleVehicle(
  vehicle: Pick<Vehicle, 'status'> | null | undefined,
): boolean {
  if (!vehicle) return false;
  return vehicle.status === 'active' || vehicle.status === 'sold';
}

/**
 * Public-boundary vehicle lookup by slug.
 * Preserves unrestricted `getVehicleBySlug()` for internal/admin callers while
 * ensuring public pages and metadata never expose RESERVED ('draft') or HIDDEN ('hidden') vehicles.
 */
export async function getPublicVehicleBySlug(
  slug: string,
  fetcher: (slug: string) => Promise<Vehicle | null> = getVehicleBySlug,
): Promise<Vehicle | null> {
  const vehicle = await fetcher(slug);
  return isPubliclyVisibleVehicle(vehicle) ? vehicle : null;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleById'); return null; }
  // No try/catch — same false-404 risk as getVehicleBySlug; let error.tsx handle it.
  const row = await prisma.vehicle.findUnique({ where: { id }, include: detailInclude });
  return row ? toAppVehicle(row) : null;
}

export async function getSimilarVehicles(vehicleId: string, brand: string, limit = 4): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getSimilarVehicles'); return []; }
  try {
    const rows = await prisma.vehicle.findMany({
      where: {
        brand,
        status: 'AVAILABLE',
        NOT: { id: vehicleId },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { dealer: true },
    });
    return rows.map(toAppVehicle);
  } catch (err) {
    console.warn('[DB] getSimilarVehicles failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

/**
 * Returns all active vehicles for a given brand (case-insensitive match).
 * Used exclusively by the brand silo pages (/sr/cars/bmw etc.).
 * Does NOT affect existing inventory, vehicle detail, or admin queries.
 */
export async function getVehiclesByBrand(brand: string): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getVehiclesByBrand'); return []; }
  try {
    const rows = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        brand:  { equals: brand, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      include: { dealer: true },
    });
    logFetch('getVehiclesByBrand', rows.length, rows[0]);
    return rows.map(toAppVehicle);
  } catch (err) {
    console.warn('[DB] getVehiclesByBrand failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

/**
 * Returns all AVAILABLE vehicles matching a given brand + any of the provided
 * model aliases (exact, case-insensitive OR match).
 * Used exclusively by the model silo pages (/sr/model/golf-7 etc.).
 */
export async function getVehiclesByModel(
  brand: string,
  modelAliases: readonly string[],
): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getVehiclesByModel'); return []; }
  try {
    const rows = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        brand:  { equals: brand, mode: 'insensitive' },
        OR:     modelAliases.map((alias) => ({
          model: { equals: alias, mode: 'insensitive' },
        })),
      },
      orderBy: { createdAt: 'desc' },
      include: { dealer: true },
    });
    logFetch('getVehiclesByModel', rows.length, rows[0]);
    return rows.map(toAppVehicle);
  } catch (err) {
    console.warn('[DB] getVehiclesByModel failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

export const ACTIVE_CATEGORY_SILOS_TAG = 'active-category-silos' as const;
export const ACTIVE_CATEGORY_SILOS_REVALIDATE_SECONDS = 300;

async function fetchActiveVehicleBrandModelsFromDb(): Promise<CategoryVehicleCandidate[]> {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL is not configured for active category resolution.');
  }
  return prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      brand: true,
      model: true,
      status: true,
    },
  });
}

const getCachedActiveVehicleBrandModels = unstable_cache(
  fetchActiveVehicleBrandModelsFromDb,
  ['active-category-silos'],
  {
    revalidate: ACTIVE_CATEGORY_SILOS_REVALIDATE_SECONDS,
    tags: [ACTIVE_CATEGORY_SILOS_TAG],
  },
);

export interface ActiveCategorySilosResult extends ActiveCategorySilos {
  readonly degraded: boolean;
}

async function readActiveVehicleBrandModels(): Promise<readonly CategoryVehicleCandidate[]> {
  try {
    return await getCachedActiveVehicleBrandModels();
  } catch (err) {
    // Outside Next.js server runtime (e.g. `node --test` component tests),
    // `incrementalCache` is not mounted; execute the underlying Prisma query directly.
    if (err instanceof Error && err.message.includes('incrementalCache missing')) {
      return fetchActiveVehicleBrandModelsFromDb();
    }
    throw err;
  }
}

/**
 * Resolves active brand and model SEO categories using a single lightweight cached query.
 * - Cached via `unstable_cache` (5-minute fallback TTL + immediate on-demand invalidation
 *   via `ACTIVE_CATEGORY_SILOS_TAG`), avoiding per-link queries and keeping page rendering modes intact.
 * - Never caches or treats database query errors as confirmed empty inventory (`degraded: true`
 *   preserves all registered category links on error).
 */
export async function getActiveCategorySilos(deps?: {
  readonly fetchActiveVehicles?: () => Promise<readonly CategoryVehicleCandidate[]>;
}): Promise<ActiveCategorySilosResult> {
  try {
    const rows = deps?.fetchActiveVehicles
      ? await deps.fetchActiveVehicles()
      : await readActiveVehicleBrandModels();
    return {
      ...computeActiveCategorySilos(rows),
      degraded: false,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message.replace(/npg_\S+/g, '***') : String(err);
    console.warn('[DB] getActiveCategorySilos failed (falling back to registered silos):', msg);
    return {
      ...getAllRegisteredCategorySilos(),
      degraded: true,
    };
  }
}

/**
 * Revalidates cached category link availability and ISR brand/model category pages
 * immediately when a vehicle is published, sold, hidden/deactivated, edited, or deleted.
 */
export function revalidateVehicleCategoryCaches(vehicleSlug?: string): void {
  try {
    revalidateTag(ACTIVE_CATEGORY_SILOS_TAG, { expire: 0 });
    revalidatePath('/[locale]/cars/[brand]', 'page');
    revalidatePath('/[locale]/model/[slug]', 'page');
    revalidatePath('/sr/inventory');
    if (vehicleSlug) {
      revalidatePath(`/sr/vehicle/${vehicleSlug}`);
    }
  } catch {
    // Safe no-op outside Next.js request/action runtime (e.g. unit tests)
  }
}

export async function getActiveVehicleSlugs(): Promise<{ slug: string }[]> {
  if (!hasDatabase()) { warnNoDB('getActiveVehicleSlugs'); return []; }
  try {
    return await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      select: { slug: true },
    });
  } catch (err) {
    console.warn('[DB] getActiveVehicleSlugs failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

/**
 * Returns slug + updatedAt + primary image for the XML sitemap.
 * Using actual updatedAt as lastmod signals content freshness to crawlers,
 * which is an important ranking factor for inventory pages.
 */
/**
 * Returns slug + updatedAt + primary image for active (`AVAILABLE`) vehicles
 * belonging to active (or unassigned) dealers for the XML sitemap.
 *
 * When `throwOnError` is true (used by `/sitemap.xml`), database outages
 * propagate so the route fails closed with HTTP 503 instead of emitting
 * an empty/partial sitemap with HTTP 200.
 */
export async function getVehicleSlugsForSitemap(options?: {
  readonly throwOnError?: boolean;
}): Promise<
  {
    slug: string;
    updatedAt: Date;
    primaryImage?: string;
  }[]
> {
  if (!hasDatabase()) {
    if (options?.throwOnError) {
      throw new Error('DATABASE_URL is not configured for sitemap generation.');
    }
    warnNoDB('getVehicleSlugsForSitemap');
    return [];
  }
  try {
    const rows = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [{ dealerId: null }, { dealer: { status: 'ACTIVE' } }],
      },
      select: {
        slug: true,
        updatedAt: true,
        images: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      slug:         r.slug,
      updatedAt:    r.updatedAt,
      primaryImage: (r.images as string[])[0] ?? undefined,
    }));
  } catch (err) {
    if (options?.throwOnError) {
      throw err;
    }
    console.warn('[DB] getVehicleSlugsForSitemap failed:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getVehicleStats() {
  if (!hasDatabase()) {
    warnNoDB('getVehicleStats');
    return { total: 0, active: 0, sold: 0, hidden: 0 };
  }
  try {
    const [total, active, sold, hidden] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'SOLD' } }),
      prisma.vehicle.count({ where: { status: 'HIDDEN' } }),
    ]);
    return { total, active, sold, hidden };
  } catch (err) {
    console.warn('[DB] getVehicleStats failed:', err instanceof Error ? err.message : String(err));
    return { total: 0, active: 0, sold: 0, hidden: 0 };
  }
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export type CreateVehicleInput = Omit<
  Vehicle,
  'id' | 'createdAt' | 'updatedAt' | 'images' | 'dealer'
> & { images: string[]; videoUrl?: string; dealerId?: string; contactPhone?: string; contactViber?: string; contactName?: string };

export async function createVehicle(input: CreateVehicleInput) {
  const initialTags = input.tags ?? [];
  const tags = [
    ...initialTags.filter((t) => t !== 'cv:with_vin' && t !== 'cv:no_vin'),
    input.carVerticalVinMode === 'WITH_VIN' ? 'cv:with_vin' : 'cv:no_vin',
  ];

  const createData = {
    slug:           input.slug,
    title:          input.title,
    brand:          input.brand,
    model:          input.model,
    generation:     input.generation,
    year:           input.year,
    mileage:        input.mileage,
    price:          input.price,
    currency:       input.currency,
    vatMode:        toDbVatMode(input.vatMode),
    fuelType:       input.fuelType,
    transmission:   input.transmission,
    drivetrain:     input.drivetrain,
    bodyType:       input.bodyType,
    condition:      input.condition,
    engineSize:     input.engineSize,
    horsepower:     input.horsepower,
    kilowatts:      input.kilowatts,
    doors:          input.doors,
    seats:          input.seats,
    color:          input.color,
    interiorColor:  input.interiorColor,
    vin:            input.vin,
    registration:   input.registration,
    origin:         input.origin,
    description:    input.description,
    dealerNotes:    input.dealerNotes,
    equipment:      input.equipment,
    safetyFeatures: input.safetyFeatures,
    features:       input.features,
    images:         input.images,
    videoUrl:       input.videoUrl,
    status:         toDbVehicleStatus(input.status),
    featured:       input.featured ?? false,
    showcase:       input.showcase ?? false,
    onSale:         input.onSale ?? false,
    tags,
    // Prisma 6: use nested relation syntax instead of scalar dealerId
    ...(input.dealerId && { dealer: { connect: { id: input.dealerId } } }),
    contactPhone:   input.contactPhone,
    contactViber:   input.contactViber,
    contactName:    input.contactName,
  };

  // Creating a hero vehicle: demote any existing hero first (same transaction)
  if (input.featured) {
    return prisma.$transaction(async (tx) => {
      await tx.vehicle.updateMany({ where: { featured: true }, data: { featured: false } });
      return tx.vehicle.create({ data: createData });
    });
  }

  return prisma.vehicle.create({ data: createData });
}

export async function updateVehicle(id: string, data: Partial<CreateVehicleInput> & { status?: VehicleStatus }) {
  // Prisma 6: scalar foreign-key fields (dealerId) are not accepted directly in
  // update payloads when a corresponding relation field exists — use nested syntax.
  const { status, vatMode, featured, onSale, dealerId, carVerticalVinMode, tags: incomingTags, ...rest } = data;

  let tagsToSet: string[] | undefined = incomingTags;
  if (carVerticalVinMode !== undefined) {
    const existing = await prisma.vehicle.findUnique({ where: { id }, select: { tags: true } });
    const baseTags = (incomingTags ?? existing?.tags ?? []).filter(
      (t) => t !== 'cv:with_vin' && t !== 'cv:no_vin',
    );
    tagsToSet = [...baseTags, carVerticalVinMode === 'WITH_VIN' ? 'cv:with_vin' : 'cv:no_vin'];
  }

  const dbData = {
    ...rest,
    ...(tagsToSet !== undefined && { tags: tagsToSet }),
    ...(featured  !== undefined && { featured }),
    ...(onSale    !== undefined && { onSale }),
    ...(status    === undefined ? {} : { status: toDbVehicleStatus(status) }),
    ...(vatMode   === undefined ? {} : { vatMode: toDbVatMode(vatMode) }),
    ...(dealerId  !== undefined && {
      dealer: dealerId
        ? { connect: { id: dealerId } }
        : { disconnect: true },
    }),
  };

  // Promoting a vehicle to hero: atomically demote all others in the same transaction
  // so at most one vehicle ever has featured=true.
  if (featured === true) {
    return prisma.$transaction(async (tx) => {
      await tx.vehicle.updateMany({
        where: { id: { not: id }, featured: true },
        data: { featured: false },
      });
      return tx.vehicle.update({ where: { id }, data: dbData });
    });
  }

  return prisma.vehicle.update({ where: { id }, data: dbData });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.delete({ where: { id } });
}

// ─── Media sync ────────────────────────────────────────────────────────────────

/**
 * Keeps the VehicleMedia table consistent with Vehicle.images.
 *
 * Called after every vehicle create/update so the media table always reflects
 * the current ordered image list.
 *
 * - Upserts one VehicleMedia row per URL (creates if new, updates sort+primary).
 * - imageKeys maps publicUrl → r2Key for images uploaded in this session;
 *   keys are stored permanently so future deletes can reach R2.
 * - Deletes any VehicleMedia rows whose URL is no longer in the list.
 */
export async function syncVehicleMedia(
  vehicleId: string,
  imageUrls: string[],
  imageKeys: Record<string, string> = {},
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    // Upsert in order — sortOrder = array index, isPrimary = first image
    for (let i = 0; i < imageUrls.length; i++) {
      const url   = imageUrls[i];
      const r2Key = imageKeys[url] ?? null;

      await prisma.vehicleMedia.upsert({
        where:  { vehicleId_url: { vehicleId, url } },
        create: {
          vehicleId,
          url,
          r2Key,
          type:      'image',
          sortOrder: i,
          isPrimary: i === 0,
        },
        update: {
          ...(r2Key ? { r2Key } : {}),  // only overwrite key if we have one
          sortOrder: i,
          isPrimary: i === 0,
        },
      });
    }

    // Remove image records that have been removed from the list.
    // Scoped to type='image' — VehicleMedia also stores video rows (type='video'),
    // and an unscoped delete here would wipe those out on every save.
    if (imageUrls.length > 0) {
      await prisma.vehicleMedia.deleteMany({
        where: {
          vehicleId,
          type: 'image',
          url: { notIn: imageUrls },
        },
      });
    }
  } catch (err) {
    // Non-fatal: VehicleMedia is a metadata layer; Vehicle.images is the source of truth
    console.error('[DB] syncVehicleMedia failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}

// ─── Video sync ────────────────────────────────────────────────────────────────

export interface VideoSyncInput {
  url: string;
  r2Key: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}

/**
 * Returns the total size (bytes) of all uploaded videos (type='video')
 * currently stored for a vehicle. Used to enforce the 30 MB-per-vehicle cap
 * before issuing a new presigned upload URL.
 */
export async function getVehicleVideoUsage(vehicleId: string): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  const rows = await prisma.vehicleMedia.findMany({
    where: { vehicleId, type: 'video' },
    select: { sizeBytes: true },
  });
  return rows.reduce((sum, r) => sum + (r.sizeBytes ?? 0), 0);
}

/**
 * Keeps uploaded-video VehicleMedia rows (type='video') consistent with the
 * ordered list submitted from the admin form. Mirrors syncVehicleMedia but is
 * fully independent — image and video rows never interfere with each other.
 *
 * Embedded videos are NOT stored here; they continue to live in the existing
 * Vehicle.videoUrl field (unchanged, backward compatible).
 */
export async function syncVehicleVideos(vehicleId: string, videos: VideoSyncInput[]): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const urls = videos.map((v) => v.url);

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      await prisma.vehicleMedia.upsert({
        where:  { vehicleId_url: { vehicleId, url: v.url } },
        create: {
          vehicleId,
          url:       v.url,
          r2Key:     v.r2Key,
          type:      'video',
          mimeType:  v.mimeType,
          sizeBytes: v.sizeBytes,
          sortOrder: i,
          isPrimary: false,
        },
        update: {
          ...(v.r2Key ? { r2Key: v.r2Key } : {}),
          mimeType:  v.mimeType,
          sizeBytes: v.sizeBytes,
          sortOrder: i,
        },
      });
    }

    if (urls.length > 0) {
      await prisma.vehicleMedia.deleteMany({
        where: { vehicleId, type: 'video', url: { notIn: urls } },
      });
    } else {
      await prisma.vehicleMedia.deleteMany({ where: { vehicleId, type: 'video' } });
    }
  } catch (err) {
    console.error('[DB] syncVehicleVideos failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}
