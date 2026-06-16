import { prisma } from '@/lib/prisma';
import { toAppVehicle, toDbVatMode, toDbVehicleStatus } from '@/lib/db/mappers';
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
  try {
    const row = await prisma.vehicle.findUnique({ where: { slug }, include: detailInclude });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB] getVehicleBySlug("${slug}"): ${row ? row.title : 'not found'}`);
    }
    return row ? toAppVehicle(row) : null;
  } catch (err) {
    console.warn('[DB] getVehicleBySlug failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleById'); return null; }
  try {
    const row = await prisma.vehicle.findUnique({ where: { id }, include: detailInclude });
    return row ? toAppVehicle(row) : null;
  } catch (err) {
    console.warn('[DB] getVehicleById failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
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
export async function getVehicleSlugsForSitemap(): Promise<
  { slug: string; updatedAt: Date; primaryImage?: string }[]
> {
  if (!hasDatabase()) { warnNoDB('getVehicleSlugsForSitemap'); return []; }
  try {
    const rows = await prisma.vehicle.findMany({
      where:   { status: 'AVAILABLE' },
      select:  { slug: true, updatedAt: true, images: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      slug:         r.slug,
      updatedAt:    r.updatedAt,
      primaryImage: (r.images as string[])[0] ?? undefined,
    }));
  } catch (err) {
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
    tags:           input.tags ?? [],
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
  const { status, vatMode, featured, onSale, dealerId, ...rest } = data;

  const dbData = {
    ...rest,
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
