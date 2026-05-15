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
  });
  logFetch('getFeaturedVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getActiveVehicles'); return []; }
  const rows = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
  });
  logFetch('getActiveVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  if (!hasDatabase()) { warnNoDB('getAllVehicles'); return []; }
  const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  logFetch('getAllVehicles', rows.length, rows[0]);
  return rows.map(toAppVehicle);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleBySlug'); return null; }
  const row = await prisma.vehicle.findUnique({ where: { slug } });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] getVehicleBySlug("${slug}"): ${row ? row.title : 'not found'}`);
  }
  return row ? toAppVehicle(row) : null;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  if (!hasDatabase()) { warnNoDB('getVehicleById'); return null; }
  const row = await prisma.vehicle.findUnique({ where: { id } });
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
  'id' | 'createdAt' | 'updatedAt' | 'images'
> & { images: string[]; videoUrl?: string };

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
