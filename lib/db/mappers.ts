/**
 * Mappers between Prisma DB types and the app-level TypeScript types.
 *
 * Prisma uses uppercase enums (AVAILABLE, SOLD, …) while the existing
 * UI code uses lowercase Serbian strings ('active', 'sold', …).  These
 * pure functions bridge that gap so every other module stays unaware of
 * the difference.
 */

import type {
  Vehicle as PrismaVehicle,
  Lead    as PrismaLead,
  DealerSettings as PrismaSettings,
  VehicleStatus  as PrismaVehicleStatus,
  LeadStatus     as PrismaLeadStatus,
} from '@prisma/client';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';
import type { Lead as AppLead, LeadStatus as AppLeadStatus } from '@/types/lead';

// ─── Vehicle status ────────────────────────────────────────────────────────────

export function toDbVehicleStatus(s: VehicleStatus): PrismaVehicleStatus {
  const map: Record<VehicleStatus, PrismaVehicleStatus> = {
    active:  'AVAILABLE',
    draft:   'RESERVED',
    sold:    'SOLD',
    hidden:  'HIDDEN',
  };
  return map[s] ?? 'AVAILABLE';
}

export function toAppVehicleStatus(s: PrismaVehicleStatus): VehicleStatus {
  const map: Record<PrismaVehicleStatus, VehicleStatus> = {
    AVAILABLE: 'active',
    RESERVED:  'draft',
    SOLD:      'sold',
    HIDDEN:    'hidden',
  };
  return map[s] ?? 'active';
}

// ─── Lead status ───────────────────────────────────────────────────────────────

export function toDbLeadStatus(s: AppLeadStatus): PrismaLeadStatus {
  const map: Record<AppLeadStatus, PrismaLeadStatus> = {
    new:     'NEW',
    read:    'CONTACTED',
    replied: 'CONTACTED',   // no direct equivalent; nearest is CONTACTED
    closed:  'CLOSED',
    spam:    'SPAM',
  };
  return map[s] ?? 'NEW';
}

export function toAppLeadStatus(s: PrismaLeadStatus): AppLeadStatus {
  const map: Record<PrismaLeadStatus, AppLeadStatus> = {
    NEW:       'new',
    CONTACTED: 'read',
    CLOSED:    'closed',
    SPAM:      'spam',
  };
  return map[s] ?? 'new';
}

// ─── Vehicle ───────────────────────────────────────────────────────────────────

export function toAppVehicle(v: PrismaVehicle): Vehicle {
  return {
    id:            v.id,
    slug:          v.slug,
    title:         v.title,
    brand:         v.brand,
    model:         v.model,
    generation:    v.generation ?? undefined,
    year:          v.year,
    mileage:       v.mileage,
    price:         v.price,
    currency:      v.currency as Vehicle['currency'],
    fuelType:      v.fuelType as Vehicle['fuelType'],
    transmission:  v.transmission as Vehicle['transmission'],
    drivetrain:    v.drivetrain as Vehicle['drivetrain'],
    bodyType:      v.bodyType as Vehicle['bodyType'],
    condition:     v.condition as Vehicle['condition'],
    engineSize:    v.engineSize ?? undefined,
    horsepower:    v.horsepower ?? undefined,
    kilowatts:     v.kilowatts ?? undefined,
    doors:         v.doors,
    seats:         v.seats,
    color:         v.color,
    interiorColor: v.interiorColor ?? undefined,
    vin:           v.vin ?? undefined,
    registration:  v.registration ?? undefined,
    origin:        v.origin ?? undefined,
    description:   v.description,
    dealerNotes:   v.dealerNotes ?? undefined,
    equipment:     v.equipment,
    safetyFeatures: v.safetyFeatures,
    features:      v.features,
    // Convert URL strings → VehicleImage objects
    images:        v.images.map((url, i) => ({
      id:    `img-${v.id}-${i}`,
      url,
      alt:   v.title,
      order: i + 1,
    })),
    videoUrl:      v.videoUrl ?? undefined,
    status:        toAppVehicleStatus(v.status),
    featured:      v.featured,
    tags:          v.tags,
    createdAt:     v.createdAt.toISOString(),
    updatedAt:     v.updatedAt.toISOString(),
  } as unknown as Vehicle;
}

// ─── Lead ──────────────────────────────────────────────────────────────────────

export function toAppLead(l: PrismaLead): AppLead {
  return {
    id:           l.id,
    type:         (l.type ?? 'contact') as AppLead['type'],
    status:       toAppLeadStatus(l.status),
    vehicleId:    l.vehicleId ?? undefined,
    vehicleTitle: l.vehicleTitle ?? undefined,
    name:         l.name,
    phone:        l.phone,
    email:        l.email ?? undefined,
    message:      l.message,
    source:       (l.source ?? 'web') as AppLead['source'],
    createdAt:    l.createdAt.toISOString(),
  };
}

// ─── DealerSettings ────────────────────────────────────────────────────────────

export type DealerInfo = {
  name: string;
  phone: string;
  viber: string;
  email: string;
  address: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  mapUrl: string;
};

export function toAppDealerInfo(s: PrismaSettings): DealerInfo {
  return {
    name:         s.businessName,
    phone:        s.phone,
    viber:        s.viber ?? s.phone,
    email:        s.email,
    address:      `${s.address}${s.city ? ', ' + s.city : ''}`,
    workingHours: s.workingHours,
    facebook:     s.facebookUrl  ?? 'https://facebook.com/autoferari',
    instagram:    s.instagramUrl ?? 'https://instagram.com/autoferari',
    mapUrl:       s.mapUrl       ?? '',
  };
}
