/**
 * Prisma seed — imports existing mock vehicles and dealer settings.
 *
 * Safe to run multiple times: uses slug as unique key (upsert).
 *
 * Usage:
 *   npx prisma db seed
 *   (or)  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { mockVehicles, getDealerInfo } from '../data/vehicles';

const prisma = new PrismaClient();

const statusMap: Record<string, 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN'> = {
  active:  'AVAILABLE',
  draft:   'RESERVED',
  sold:    'SOLD',
  hidden:  'HIDDEN',
};

async function main() {
  console.log('🌱  Seeding database...\n');

  // ── Vehicles ──────────────────────────────────────────────────────────────
  for (const v of mockVehicles) {
    const imageUrls = v.images.map((img) => img.url);
    const status = statusMap[v.status] ?? 'AVAILABLE';

    await prisma.vehicle.upsert({
      where:  { slug: v.slug },
      create: {
        id:             v.id,
        slug:           v.slug,
        title:          v.title,
        brand:          v.brand,
        model:          v.model,
        generation:     v.generation,
        year:           v.year,
        mileage:        v.mileage,
        price:          v.price,
        currency:       v.currency,
        fuelType:       v.fuelType,
        transmission:   v.transmission,
        drivetrain:     v.drivetrain,
        bodyType:       v.bodyType,
        condition:      v.condition,
        engineSize:     v.engineSize,
        horsepower:     v.horsepower,
        kilowatts:      v.kilowatts,
        doors:          v.doors,
        seats:          v.seats,
        color:          v.color,
        interiorColor:  v.interiorColor,
        vin:            v.vin,
        registration:   v.registration,
        origin:         v.origin,
        description:    v.description,
        dealerNotes:    v.dealerNotes,
        equipment:      v.equipment,
        safetyFeatures: v.safetyFeatures,
        features:       v.features,
        images:         imageUrls,
        tags:           v.tags ?? [],
        status,
        featured:       v.featured ?? false,
        createdAt:      new Date(v.createdAt),
        updatedAt:      new Date(v.updatedAt),
      },
      update: {
        title:          v.title,
        price:          v.price,
        status,
        featured:       v.featured ?? false,
        images:         imageUrls,
        updatedAt:      new Date(v.updatedAt),
      },
    });

    console.log(`  ✓  ${v.title}`);
  }

  // ── Dealer settings ───────────────────────────────────────────────────────
  const dealer = getDealerInfo();
  const existing = await prisma.dealerSettings.findFirst();

  if (!existing) {
    await prisma.dealerSettings.create({
      data: {
        businessName: dealer.name,
        phone:        dealer.phone,
        email:        dealer.email,
        address:      dealer.address,
        city:         'Preševo',
        workingHours: dealer.workingHours,
        viber:        dealer.viber,
        facebookUrl:  dealer.facebook,
        instagramUrl: dealer.instagram,
        mapUrl:       dealer.mapUrl,
      },
    });
    console.log('\n  ✓  DealerSettings created');
  } else {
    console.log('\n  –  DealerSettings already exists, skipping');
  }

  // ── Placeholder admin user (DOCUMENTED — no real password) ────────────────
  // TODO: Replace passwordHash with a real bcrypt hash before going live.
  // Example: const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD!, 12)
  const PLACEHOLDER_HASH = '$2b$12$PLACEHOLDER_HASH_REPLACE_BEFORE_PRODUCTION';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@autoelite.rs';

  const adminExists = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.adminUser.create({
      data: {
        email:        adminEmail,
        passwordHash: PLACEHOLDER_HASH,
        name:         'AutoElite Admin',
        role:         'ADMIN',
      },
    });
    console.log(`  ✓  AdminUser created (${adminEmail}) — set real password before going live!`);
  } else {
    console.log(`  –  AdminUser (${adminEmail}) already exists, skipping`);
  }

  console.log('\n✅  Seed complete.\n');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
