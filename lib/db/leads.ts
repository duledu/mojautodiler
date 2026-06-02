import { prisma } from '@/lib/prisma';
import { toAppLead, toDbLeadStatus } from '@/lib/db/mappers';
import type {
  Lead as AppLead,
  LeadIntent,
  LeadStatus as AppLeadStatus,
  PreferredContactChannel,
} from '@/types/lead';

const hasDatabase = () => Boolean(process.env.DATABASE_URL);

function warnNoDB(fn: string) {
  console.warn(`[DB] ${fn}: DATABASE_URL is not set - returning empty. Add DATABASE_URL to .env.local`);
}

// ─── Reads ─────────────────────────────────────────────────────────────────────

export async function getAllLeads(): Promise<AppLead[]> {
  if (!hasDatabase()) { warnNoDB('getAllLeads'); return []; }
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toAppLead);
}

export async function getRecentLeads(limit = 5): Promise<AppLead[]> {
  if (!hasDatabase()) { warnNoDB('getRecentLeads'); return []; }
  const rows = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(toAppLead);
}

export async function getLeadStats() {
  if (!hasDatabase()) { warnNoDB('getLeadStats'); return { totalLeads: 0, newLeads: 0 }; }
  const [total, newCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
  ]);
  return { totalLeads: total, newLeads: newCount };
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
  type?: string;
  source?: string;
  intent?: LeadIntent;
  preferredContactChannel?: PreferredContactChannel;
  vehicleId?: string;
  vehicleTitle?: string;
  dealerId?: string;
  dealerName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RecentDuplicateLeadInput {
  vehicleId?: string;
  intent: LeadIntent;
  ipAddress?: string;
  userAgent?: string;
  since: Date;
}

/**
 * Production duplicate guard for click/contact analytics.
 *
 * Later cleanup query for obvious historical spam:
 * group leads by vehicleId + intent + ipAddress + userAgent in short createdAt
 * windows, then review groups with many rows before deleting anything.
 */
export async function findRecentDuplicateLead(input: RecentDuplicateLeadInput): Promise<AppLead | null> {
  if (!hasDatabase() || !input.vehicleId) return null;

  const row = await prisma.lead.findFirst({
    where: {
      vehicleId: input.vehicleId,
      intent: input.intent,
      createdAt: { gte: input.since },
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      ...(input.userAgent ? { userAgent: input.userAgent } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return row ? toAppLead(row) : null;
}

export async function createLead(input: CreateLeadInput): Promise<AppLead> {
  const row = await prisma.lead.create({
    data: {
      name:         input.name,
      phone:        input.phone,
      email:        input.email,
      message:      input.message,
      type:         input.type ?? 'contact',
      source:       input.source ?? 'web',
      intent:       input.intent ?? 'general_inquiry',
      preferredContactChannel: input.preferredContactChannel ?? 'web',
      vehicleId:    input.vehicleId,
      vehicleTitle: input.vehicleTitle,
      dealerId:     input.dealerId,
      dealerName:   input.dealerName,
      ipAddress:    input.ipAddress,
      userAgent:    input.userAgent,
      status:       'NEW',
    },
  });
  return toAppLead(row);
}

export async function updateLeadStatus(id: string, status: AppLeadStatus): Promise<AppLead> {
  const row = await prisma.lead.update({
    where: { id },
    data: { status: toDbLeadStatus(status) },
  });
  return toAppLead(row);
}
