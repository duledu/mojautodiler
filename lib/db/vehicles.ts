/**
 * Vehicle database helpers.
 * Every function falls back to mock data if the DB is unavailable so the
 * public site never crashes during local dev or cold starts.
 */

import { prisma } from '@/lib/prisma';
import { toAppVehicle, toDbVehicleStatus } from '@/lib/db/mappers';
import { mockVehicles } from '@/data/vehicles';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';

// ─── Reads ─────────────────────────────────────────────────────────────────────

export async function getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
  try {
    const rows = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE', featured: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toAppVehicle);
  } catch {
    return mockVehicles
      .filter((v) => v.status === 'active' && v.featured)
      .slice(0, limit);
  }
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  try {
    const rows = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toAppVehicle);
  } catch {
    return mockVehicles.filter((v) => v.status === 'active');
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toAppVehicle);
  } catch {
    return mockVehicles;
  }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    const row = await prisma.vehicle.findUnique({ where: { slug } });
    return row ? toAppVehicle(row) : null;
  } catch {
    return mockVehicles.find((v) => v.slug === slug) ?? null;
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const row = await prisma.vehicle.findUnique({ where: { id } });
    return row ? toAppVehicle(row) : null;
  } catch {
    return mockVehicles.find((v) => v.id === id) ?? null;
  }
}

export async function getSimilarVehicles(vehicleId: string, brand: string, limit = 4): Promise<Vehicle[]> {
  try {
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
  } catch {
    return mockVehicles
      .filter((v) => v.brand === brand && v.id !== vehicleId && v.status === 'active')
      .slice(0, limit);
  }
}

export async function getActiveVehicleSlugs(): Promise<{ slug: string }[]> {
  try {
    return await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      select: { slug: true },
    });
  } catch {
    return mockVehicles
      .filter((v) => v.status === 'active')
      .map((v) => ({ slug: v.slug }));
  }
}

export async function getVehicleStats() {
  try {
    const [total, active, sold, hidden] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'SOLD' } }),
      prisma.vehicle.count({ where: { status: 'HIDDEN' } }),
    ]);
    return { total, active, sold, hidden };
  } catch {
    return {
      total:  mockVehicles.length,
      active: mockVehicles.filter((v) => v.status === 'active').length,
      sold:   mockVehicles.filter((v) => v.status === 'sold').length,
      hidden: mockVehicles.filter((v) => v.status === 'hidden').length,
    };
  }
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
      status:         toDbVehicleStatus(input.status as VehicleStatus),
      featured:       input.featured ?? false,
      tags:           input.tags ?? [],
    },
  });
}

export async function updateVehicle(id: string, data: Partial<CreateVehicleInput> & { status?: VehicleStatus }) {
  const { status, ...rest } = data;
  return prisma.vehicle.update({
    where: { id },
    data: {
      ...rest,
      ...(status === undefined ? {} : { status: toDbVehicleStatus(status) }),
    },
  });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.delete({ where: { id } });
}
