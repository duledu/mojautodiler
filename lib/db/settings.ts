import { prisma } from '@/lib/prisma';
import { toAppDealerInfo, type DealerInfo } from '@/lib/db/mappers';
import { getDealerInfo as getMockDealerInfo } from '@/data/vehicles';

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getDealerSettings(): Promise<DealerInfo> {
  try {
    // Always use the single settings row (id = 'main')
    const row = await prisma.dealerSettings.findFirst();
    if (!row) return getMockDealerInfo();
    return toAppDealerInfo(row);
  } catch {
    return getMockDealerInfo();
  }
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export interface UpdateSettingsInput {
  businessName?: string;
  phone?: string;
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
  // Upsert ensures there is always exactly one settings row
  const existing = await prisma.dealerSettings.findFirst();
  if (existing) {
    return prisma.dealerSettings.update({ where: { id: existing.id }, data });
  }
  return prisma.dealerSettings.create({ data });
}
