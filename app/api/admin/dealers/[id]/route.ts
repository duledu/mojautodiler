import { NextRequest, NextResponse } from 'next/server';
import { updateDealer } from '@/lib/db/dealers';
import { slugify } from '@/lib/utils';

function clean(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || undefined;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = clean(body.name);

    const dealer = await updateDealer(id, {
      ...(name !== undefined && { name }),
      ...(body.slug !== undefined && { slug: clean(body.slug) || (name ? slugify(name) : undefined) }),
      ...(body.logo !== undefined && { logo: clean(body.logo) }),
      ...(body.phone !== undefined && { phone: clean(body.phone) || '' }),
      ...(body.viber !== undefined && { viber: clean(body.viber) }),
      ...(body.instagram !== undefined && { instagram: clean(body.instagram) }),
      ...(body.facebook !== undefined && { facebook: clean(body.facebook) }),
      ...(body.location !== undefined && { location: clean(body.location) || '' }),
      ...(body.address !== undefined && { address: clean(body.address) }),
      ...(body.locationName !== undefined && { locationName: clean(body.locationName) }),
      ...(body.googleMapsEmbedUrl !== undefined && { googleMapsEmbedUrl: clean(body.googleMapsEmbedUrl) }),
      ...(body.googleMapsUrl !== undefined && { googleMapsUrl: clean(body.googleMapsUrl) }),
      ...(body.description !== undefined && { description: clean(body.description) }),
      ...(body.workingHours !== undefined && { workingHours: clean(body.workingHours) }),
      ...(body.isVerified !== undefined && { isVerified: Boolean(body.isVerified) }),
      ...(body.status !== undefined && { status: body.status === 'hidden' ? 'hidden' : 'active' }),
    });

    return NextResponse.json({ success: true, dealer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Partner nije pronadjen' }, { status: 404 });
    }
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Partner sa ovim slug-om vec postoji' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Greska pri cuvanju partnera' }, { status: 500 });
  }
}
