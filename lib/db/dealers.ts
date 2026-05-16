import { prisma } from '@/lib/prisma';
import { toAppDealer, toDbDealerStatus } from '@/lib/db/mappers';
import type { Dealer, DealerStatus } from '@/types/vehicle';

const hasDatabase = () => Boolean(process.env.DATABASE_URL);

function warnNoDB(fn: string) {
  console.warn(`[DB] ${fn}: DATABASE_URL is not set - returning empty.`);
}

export interface DealerInput {
  name: string;
  slug: string;
  logo?: string;
  phone: string;
  viber?: string;
  instagram?: string;
  facebook?: string;
  location: string;
  address?: string;
  description?: string;
  workingHours?: string;
  isVerified?: boolean;
  status?: DealerStatus;
}

export async function getActiveDealers(): Promise<Dealer[]> {
  if (!hasDatabase()) { warnNoDB('getActiveDealers'); return []; }
  const rows = await prisma.dealer.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
  });
  return rows.map(toAppDealer);
}

export async function getAllDealers(): Promise<Dealer[]> {
  if (!hasDatabase()) { warnNoDB('getAllDealers'); return []; }
  const rows = await prisma.dealer.findMany({
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });
  return rows.map(toAppDealer);
}

export async function getDealerById(id: string): Promise<Dealer | null> {
  if (!hasDatabase()) { warnNoDB('getDealerById'); return null; }
  const row = await prisma.dealer.findUnique({ where: { id } });
  return row ? toAppDealer(row) : null;
}

export async function createDealer(input: DealerInput): Promise<Dealer> {
  const row = await prisma.dealer.create({
    data: {
      name:         input.name,
      slug:         input.slug,
      logo:         input.logo,
      phone:        input.phone,
      viber:        input.viber,
      instagram:    input.instagram,
      facebook:     input.facebook,
      location:     input.location,
      address:      input.address,
      description:  input.description,
      workingHours: input.workingHours,
      isVerified:   input.isVerified ?? true,
      status:       toDbDealerStatus(input.status),
    },
  });
  return toAppDealer(row);
}

export async function updateDealer(id: string, input: Partial<DealerInput>): Promise<Dealer> {
  const row = await prisma.dealer.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.logo !== undefined && { logo: input.logo || null }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.viber !== undefined && { viber: input.viber || null }),
      ...(input.instagram !== undefined && { instagram: input.instagram || null }),
      ...(input.facebook !== undefined && { facebook: input.facebook || null }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.address !== undefined && { address: input.address || null }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.workingHours !== undefined && { workingHours: input.workingHours || null }),
      ...(input.isVerified !== undefined && { isVerified: input.isVerified }),
      ...(input.status !== undefined && { status: toDbDealerStatus(input.status) }),
    },
  });
  return toAppDealer(row);
}
