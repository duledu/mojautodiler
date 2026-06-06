import { NextRequest, NextResponse } from 'next/server';
import { softDeleteLead, updateLeadStatus } from '@/lib/db/leads';
import type { LeadStatus } from '@/types/lead';

const VALID_STATUSES: LeadStatus[] = ['novo', 'kontaktiran', 'zakazano', 'rezervisano', 'prodato', 'izgubljeno'];

// PUT /api/admin/leads/[id] — update lead status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID upita je obavezan' }, { status: 400 });
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Neispravan status. Dozvoljeni: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const lead = await updateLeadStatus(id, body.status as LeadStatus);
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Upit nije pronađen' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Greška pri ažuriranju upita' }, { status: 500 });
  }
}

// DELETE /api/admin/leads/[id] — soft-delete a lead
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID upita je obavezan' }, { status: 400 });
    }
    await softDeleteLead(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Upit nije pronađen' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Greška pri brisanju upita' }, { status: 500 });
  }
}
