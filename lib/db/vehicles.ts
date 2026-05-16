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
  const rows = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
    include: { dealer: true },
  });
  logFetch('getActiveVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getAllVehicles'); return []; }
  const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' }, include: { dealer: true } });
  logFetch('getAllVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleBySlug'); return null; }
  const row = await prisma.vehicle.findUnique({ where: { slug }, include: { dealer: true } });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] getVehicleBySlug("${slug}"): ${row ? row.title : 'not found'}`);
  }
  return row ? toAppVehicle(row) : null;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleById'); return null; }
  const row = await prisma.vehicle.findUnique({ where: { id }, include: { dealer: true } });
  return row ? toAppVehicle(row) : null;
}

export async function getSimilarVehicles(vehicleId: string, brand: string, limit = 4): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getSimilarVehicles'); return []; }
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
}

export async function getActiveVehicleSlugs(): Promise<{ slug: string }[]> {
  if (!hasDatabase()) { warnNoDB('getActiveVehicleSlugs'); return []; }
  return prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    select: { slug: true },
  });
}

export async function getVehicleStats() {
  if (!hasDatabase()) {
    warnNoDB('getVehicleStats');
    return { total: 0, active: 0, sold: 0, hidden: 0 };
  }
  const [total, active, sold, hidden] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
    prisma.vehicle.count({ where: { status: 'HIDDEN' } }),
  ]);
  return { total, active, sold, hidden };
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export type CreateVehicleInput = Omit<
  Vehicle,
  'id' | 'createdAt' | 'updatedAt' | 'images' | 'dealer'
> & { images: string[]; videoUrl?: string; dealerId?: string; contactPhone?: string; contactViber?: string; contactName?: string };

export async function createVehicle(input: CreateVehicleInput) {
  return prisma.vehicle.create({
    data: {
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
      tags:           input.tags ?? [],
      dealerId:       input.dealerId,
      contactPhone:   input.contactPhone,
      contactViber:   input.contactViber,
      contactName:    input.contactName,
    },
  });
}

export async function updateVehicle(id: string, data: Partial<CreateVehicleInput> & { status?: VehicleStatus }) {
  const { status, vatMode, ...rest } = data;
  return prisma.vehicle.update({
    where: { id },
    data: {
      ...rest,
      ...(status === undefined ? {} : { status: toDbVehicleStatus(status) }),
      ...(vatMode === undefined ? {} : { vatMode: toDbVatMode(vatMode) }),
    },
  });
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

    // Remove records for images that have been removed from the list
    if (imageUrls.length > 0) {
      await prisma.vehicleMedia.deleteMany({
        where: {
          vehicleId,
          url: { notIn: imageUrls },
        },
      });
    }
  } catch (err) {
    // Non-fatal: VehicleMedia is a metadata layer; Vehicle.images is the source of truth
    console.error('[DB] syncVehicleMedia failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}
