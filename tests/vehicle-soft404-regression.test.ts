import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { prisma } from '@/lib/prisma';
import { getVehicleBySlug, getPublicVehicleBySlug } from '@/lib/db/vehicles';

describe('Vehicle Route Soft 404 Prevention & DB Error Propagation', () => {
  test('app/[locale]/vehicle/[slug]/loading.tsx does not exist (prevents HTTP 200 streaming Soft 404)', () => {
    const loadingUrl = new URL('../app/[locale]/vehicle/[slug]/loading.tsx', import.meta.url);
    assert.equal(
      existsSync(loadingUrl),
      false,
      'loading.tsx on /[locale]/vehicle/[slug] streams HTTP 200 before notFound() can set HTTP 404',
    );
  });

  test('simulated DB query failure in getVehicleBySlug/getPublicVehicleBySlug propagates instead of returning null (no false 404)', async () => {
    const originalFindUnique = prisma.vehicle.findUnique;
    const originalDatabaseUrl = process.env.DATABASE_URL;
    const simulatedError = new Error('Simulated transient Neon DB connection failure');

    try {
      process.env.DATABASE_URL = originalDatabaseUrl || 'postgresql://simulated:test@localhost:5432/test';
      (prisma.vehicle as unknown as { findUnique: () => Promise<never> }).findUnique = async () => {
        throw simulatedError;
      };

      await assert.rejects(
        () => getVehicleBySlug('bmw-x1-2016'),
        (err: unknown) => err === simulatedError,
        'getVehicleBySlug must rethrow DB errors instead of returning null',
      );

      await assert.rejects(
        () => getPublicVehicleBySlug('bmw-x1-2016'),
        (err: unknown) => err === simulatedError,
        'getPublicVehicleBySlug must propagate DB errors to error.tsx instead of turning them into 404',
      );
    } finally {
      (prisma.vehicle as unknown as { findUnique: typeof originalFindUnique }).findUnique = originalFindUnique;
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });

  test('missing vehicle in DB cleanly returns null (allowing route to emit real HTTP 404)', async () => {
    const originalFindUnique = prisma.vehicle.findUnique;
    const originalDatabaseUrl = process.env.DATABASE_URL;

    try {
      process.env.DATABASE_URL = originalDatabaseUrl || 'postgresql://simulated:test@localhost:5432/test';
      (prisma.vehicle as unknown as { findUnique: () => Promise<null> }).findUnique = async () => null;

      const result = await getPublicVehicleBySlug('nepostojeci-oglas-unit-test');
      assert.equal(result, null);
    } finally {
      (prisma.vehicle as unknown as { findUnique: typeof originalFindUnique }).findUnique = originalFindUnique;
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });
});
