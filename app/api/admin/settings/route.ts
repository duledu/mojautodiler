import { NextRequest, NextResponse } from 'next/server';
import { getDealerSettings, upsertDealerSettings } from '@/lib/db/settings';

// GET /api/admin/settings — load dealer settings
export async function GET() {
  try {
    const settings = await getDealerSettings();
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju podešavanja' }, { status: 500 });
  }
}

// PUT /api/admin/settings — save dealer settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    await upsertDealerSettings({
      businessName: body.name?.trim()         || undefined,
      phone:        body.phone?.trim()        || undefined,
      email:        body.email?.trim()        || undefined,
      address:      body.address?.trim()      || undefined,
      workingHours: body.workingHours?.trim() || undefined,
      viber:        body.viber?.trim()        || undefined,
      facebookUrl:  body.facebook?.trim()     || undefined,
      instagramUrl: body.instagram?.trim()    || undefined,
      mapUrl:       body.mapUrl?.trim()       || undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Greška pri čuvanju podešavanja' }, { status: 500 });
  }
}
