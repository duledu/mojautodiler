import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { toAppDealerInfo, emptyDealerInfo, normalizeDealerAddress, type DealerInfo } from '@/lib/db/mappers';

// ─── Read ──────────────────────────────────────────────────────────────────────

async function fetchDealerSettings(): Promise<DealerInfo> {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB] getDealerSettings: DATABASE_URL not set — returning empty. Add it to .env.local');
    return emptyDealerInfo();
  }
  try {
    const row = await prisma.dealerSettings.findFirst();
    if (!row) return emptyDealerInfo();
    return toAppDealerInfo(row);
  } catch (err) {
    // Log without revealing credentials
    const msg = err instanceof Error ? err.message.replace(/npg_\S+/g, '***') : String(err);
    console.warn('[DB] getDealerSettings failed (returning empty):', msg);
    return emptyDealerInfo();
  }
}

/**
 * Cached dealer settings — revalidates every 5 minutes.
 * Using unstable_cache avoids hitting the DB on every page render via the
 * locale layout, which would otherwise cause cold-start TLS failures on Neon.
 */
export const getDealerSettings = unstable_cache(
  fetchDealerSettings,
  ['dealer-settings'],
  { revalidate: 300 },
);

// ─── Write ─────────────────────────────────────────────────────────────────────

export interface UpdateSettingsInput {
  businessName?: string;
  phone?: string;
  smsPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  workingHours?: string;
  viber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  mapUrl?: string;
}

export async function upsertDealerSettings(data: UpdateSettingsInput) {
  const cleanData = {
    ...data,
    ...(data.address !== undefined && { address: normalizeDealerAddress(data.address) }),
    ...(data.city !== undefined && { city: normalizeDealerAddress(data.city) }),
  };
  const existing = await prisma.dealerSettings.findFirst();
  if (existing) {
    return prisma.dealerSettings.update({ where: { id: existing.id }, data: cleanData });
  }
  return prisma.dealerSettings.create({ data: cleanData });
}
