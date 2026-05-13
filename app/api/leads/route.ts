import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/db/leads';
import { addLead } from '@/data/leads';
import type { LeadType } from '@/types/lead';

const VALID_TYPES = new Set<LeadType>(['inquiry', 'contact', 'test_drive', 'financing']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const name    = String(body.name    ?? '').trim();
    const phone   = String(body.phone   ?? '').trim();
    const message = String(body.message ?? '').trim();
    const type    = String(body.type    ?? 'contact').trim();

    if (!name || !phone || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'Nedostaju obavezna polja (name, phone, message, type)' },
        { status: 400 }
      );
    }

    if (message.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Poruka je prekratka' },
        { status: 400 }
      );
    }

    const leadType: LeadType = VALID_TYPES.has(type as LeadType) ? type as LeadType : 'contact';

    const dbInput = {
      type:         leadType,
      name,
      phone,
      email:        body.email?.trim()        || undefined,
      message,
      vehicleId:    body.vehicleId            || undefined,
      vehicleTitle: body.vehicleTitle?.trim() || undefined,
      source:       'web',
    };

    // Try DB first; fall back to in-memory mock store so the form never 500s
    try {
      const lead = await createLead(dbInput);
      return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch {
      const lead = addLead({ ...dbInput, source: 'web' as const });
      return NextResponse.json({ success: true, lead }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Interna greška servera' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
