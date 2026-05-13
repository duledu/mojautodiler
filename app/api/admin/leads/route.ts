import { NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/db/leads';

// GET /api/admin/leads — list all leads
export async function GET() {
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ success: true, leads });
  } catch {
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju upita' }, { status: 500 });
  }
}
