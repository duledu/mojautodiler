import { NextRequest, NextResponse } from 'next/server';
import { addLead } from '@/data/leads';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.phone || !body.message || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Nedostaju obavezna polja' },
        { status: 400 }
      );
    }

    const lead = addLead({
      type: body.type,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim(),
      message: body.message.trim(),
      vehicleId: body.vehicleId,
      vehicleTitle: body.vehicleTitle,
      source: 'web',
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Interna greška servera' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // In production: paginated, filtered, authenticated
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
