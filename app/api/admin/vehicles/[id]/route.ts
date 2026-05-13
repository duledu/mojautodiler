import { NextRequest, NextResponse } from 'next/server';
import { updateVehicle, deleteVehicle } from '@/lib/db/vehicles';
import type { VehicleStatus } from '@/types/vehicle';

// PUT /api/admin/vehicles/[id] — update a vehicle (full or partial, including status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID vozila je obavezan' }, { status: 400 });
    }

    const images: string[] | undefined = body.images
      ? (body.images as (string | { url: string })[]).map((img) =>
          typeof img === 'string' ? img : img.url
        ).filter(Boolean)
      : undefined;

    const updated = await updateVehicle(id, {
      ...(body.title        !== undefined && { title:          String(body.title).trim() }),
      ...(body.price        !== undefined && { price:          Number(body.price) }),
      ...(body.mileage      !== undefined && { mileage:        Number(body.mileage) }),
      ...(body.status       !== undefined && { status:         body.status as VehicleStatus }),
      ...(body.featured     !== undefined && { featured:       Boolean(body.featured) }),
      ...(body.description  !== undefined && { description:    String(body.description).trim() }),
      ...(body.dealerNotes  !== undefined && { dealerNotes:    body.dealerNotes }),
      ...(body.equipment    !== undefined && { equipment:      body.equipment }),
      ...(body.safetyFeatures !== undefined && { safetyFeatures: body.safetyFeatures }),
      ...(body.features     !== undefined && { features:       body.features }),
      ...(body.tags         !== undefined && { tags:           body.tags }),
      ...(images            !== undefined && { images }),
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Vozilo nije pronađeno' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Greška pri ažuriranju vozila' }, { status: 500 });
  }
}

// DELETE /api/admin/vehicles/[id] — permanently delete a vehicle
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID vozila je obavezan' }, { status: 400 });
    }

    await deleteVehicle(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Record to delete does not exist')) {
      return NextResponse.json({ success: false, error: 'Vozilo nije pronađeno' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Greška pri brisanju vozila' }, { status: 500 });
  }
}
