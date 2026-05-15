import { prisma } from '@/lib/prisma';
import { toAppLead, toDbLeadStatus } from '@/lib/db/mappers';
import type { Lead as AppLead, LeadStatus as AppLeadStatus } from '@/types/lead';

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
  vehicleId?: string;
  vehicleTitle?: string;
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
      vehicleId:    input.vehicleId,
      vehicleTitle: input.vehicleTitle,
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
