import { prisma } from '@/lib/prisma';
import { toAppLead, toDbLeadStatus } from '@/lib/db/mappers';
import { mockLeads } from '@/data/leads';
import type { Lead as AppLead, LeadStatus as AppLeadStatus } from '@/types/lead';

// ─── Reads ─────────────────────────────────────────────────────────────────────

export async function getAllLeads(): Promise<AppLead[]> {
  try {
    const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toAppLead);
  } catch {
    return mockLeads;
  }
}

export async function getRecentLeads(limit = 5): Promise<AppLead[]> {
  try {
    const rows = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toAppLead);
  } catch {
    return [...mockLeads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export async function getLeadStats() {
  try {
    const [total, newCount] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
    ]);
    return { totalLeads: total, newLeads: newCount };
  } catch {
    return {
      totalLeads: mockLeads.length,
      newLeads:   mockLeads.filter((l) => l.status === 'new').length,
    };
  }
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
