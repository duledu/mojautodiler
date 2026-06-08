import { NextRequest, NextResponse } from 'next/server';
import { createDealer, getAllDealers } from '@/lib/db/dealers';
import { slugify } from '@/lib/utils';

function clean(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || undefined;
}

export async function GET() {
  try {
    const dealers = await getAllDealers();
    return NextResponse.json({ success: true, dealers });
  } catch {
    return NextResponse.json({ success: false, error: 'Greska pri ucitavanju partnera' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = clean(body.name);
    const phone = clean(body.phone);
    const location = clean(body.location);

    if (!name || !phone || !location) {
      return NextResponse.json({ success: false, error: 'Naziv, telefon i lokacija su obavezni' }, { status: 400 });
    }

    const dealer = await createDealer({
      name,
      phone,
      location,
      slug: clean(body.slug) || slugify(name),
      logo: clean(body.logo),
      viber: clean(body.viber),
      instagram: clean(body.instagram),
      facebook: clean(body.facebook),
      address: clean(body.address),
      locationName: clean(body.locationName),
      googleMapsEmbedUrl: clean(body.googleMapsEmbedUrl),
      googleMapsUrl: clean(body.googleMapsUrl),
      description: clean(body.description),
      workingHours: clean(body.workingHours),
      isVerified: body.isVerified !== false,
      status: body.status === 'hidden' ? 'hidden' : 'active',
    });

    return NextResponse.json({ success: true, dealer }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Partner sa ovim slug-om vec postoji' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Greska pri kreiranju partnera' }, { status: 500 });
  }
}
