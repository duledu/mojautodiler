import { NextRequest, NextResponse } from 'next/server';
import { getAllVehicles, createVehicle, syncVehicleMedia, syncVehicleVideos, type VideoSyncInput } from '@/lib/db/vehicles';
import { slugify } from '@/lib/utils';

/** Normalises the admin form's `videos` payload into VideoSyncInput[]; drops malformed entries. */
function parseVideosPayload(raw: unknown): VideoSyncInput[] {
  if (!Array.isArray(raw)) return [];
  return (raw as { url?: unknown; r2Key?: unknown; mimeType?: unknown; sizeBytes?: unknown }[])
    .filter((v) => typeof v.url === 'string' && v.url.startsWith('http'))
    .map((v) => ({
      url:       v.url as string,
      r2Key:     typeof v.r2Key === 'string' ? v.r2Key : null,
      mimeType:  typeof v.mimeType === 'string' ? v.mimeType : null,
      sizeBytes: typeof v.sizeBytes === 'number' ? v.sizeBytes : null,
    }));
}

// GET /api/admin/vehicles — list all vehicles (all statuses)
export async function GET() {
  try {
    const vehicles = await getAllVehicles();
    return NextResponse.json({ success: true, vehicles });
  } catch {
    return NextResponse.json({ success: false, error: 'Greška pri učitavanju vozila' }, { status: 500 });
  }
}

// POST /api/admin/vehicles — create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ['title', 'brand', 'model', 'year', 'mileage', 'price', 'fuelType', 'transmission', 'drivetrain', 'bodyType', 'color', 'description'];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ success: false, error: `Polje '${field}' je obavezno` }, { status: 400 });
      }
    }

    const slug = body.slug?.trim() || slugify(`${body.brand}-${body.model}-${body.year}`);

    // Images: accept either URL strings or VehicleImage objects
    const images: string[] = (body.images ?? []).map((img: string | { url: string }) =>
      typeof img === 'string' ? img : img.url
    ).filter(Boolean);

    const vehicle = await createVehicle({
      slug,
      title:          String(body.title).trim(),
      brand:          String(body.brand).trim(),
      model:          String(body.model).trim(),
      generation:     body.generation?.trim() || undefined,
      year:           Number(body.year),
      mileage:        Number(body.mileage),
      price:          Number(body.price),
      currency:       body.currency || 'EUR',
      vatMode:        body.vatMode || 'NONE',
      fuelType:       body.fuelType,
      transmission:   body.transmission,
      drivetrain:     body.drivetrain,
      bodyType:       body.bodyType,
      condition:      body.condition || 'polovno',
      engineSize:     body.engineSize ? Number(body.engineSize) : undefined,
      horsepower:     body.horsepower ? Number(body.horsepower) : undefined,
      kilowatts:      body.kilowatts ? Number(body.kilowatts) : undefined,
      doors:          Number(body.doors) || 4,
      seats:          Number(body.seats) || 5,
      color:          String(body.color).trim(),
      interiorColor:  body.interiorColor?.trim() || undefined,
      vin:            body.vin?.trim() || undefined,
      registration:   body.registration?.trim() || undefined,
      origin:         body.origin?.trim() || undefined,
      description:    String(body.description).trim(),
      dealerNotes:    body.dealerNotes?.trim() || undefined,
      equipment:      Array.isArray(body.equipment) ? body.equipment : [],
      safetyFeatures: Array.isArray(body.safetyFeatures) ? body.safetyFeatures : [],
      features:       Array.isArray(body.features) ? body.features : [],
      images,
      status:         body.status || 'active',
      featured:       Boolean(body.featured),
      showcase:       Boolean(body.showcase),
      onSale:         Boolean(body.onSale),
      tags:           Array.isArray(body.tags) ? body.tags : [],
      dealerId:       body.dealerId?.trim() || undefined,
      contactPhone:   body.contactPhone?.trim() || undefined,
      contactViber:   body.contactViber?.trim() || undefined,
      contactName:    body.contactName?.trim() || undefined,
    });

    // Sync VehicleMedia metadata for the new vehicle
    const imageKeys = typeof body.imageKeys === 'object' && body.imageKeys !== null
      ? (body.imageKeys as Record<string, string>)
      : {};
    void syncVehicleMedia(vehicle.id, images, imageKeys);
    void syncVehicleVideos(vehicle.id, parseVideosPayload(body.videos));

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Interna greška';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ success: false, error: 'Vozilo sa ovim slug-om već postoji' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Greška pri kreiranju vozila' }, { status: 500 });
  }
}
