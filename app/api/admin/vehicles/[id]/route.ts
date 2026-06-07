import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateVehicle, deleteVehicle, syncVehicleMedia, syncVehicleVideos, type VideoSyncInput } from '@/lib/db/vehicles';
import type { VehicleStatus } from '@/types/vehicle';

/** Prisma error code lives on the error as `.code`. */
function prismaCode(err: unknown): string {
  return (err as { code?: string }).code ?? '';
}

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

// PUT /api/admin/vehicles/[id] — full update (all editable fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID vozila je obavezan' }, { status: 400 });
    }

    // Guard: DATABASE_URL must be present at runtime
    if (!process.env.DATABASE_URL) {
      console.error('[VEHICLE UPDATE] DATABASE_URL is not set in this environment.');
      return NextResponse.json(
        { success: false, error: 'DATABASE_URL is not configured. Add it to Vercel environment variables and redeploy.' },
        { status: 500 },
      );
    }

    const body = await request.json();

    console.info(`[VEHICLE UPDATE] id=${id} fields=${Object.keys(body).join(',')}`);
    console.info(`[VEHICLE UPDATE] received images:`, JSON.stringify(body.images));

    // Images: accept either URL strings or VehicleImage objects; drop blob: URLs
    const images: string[] | undefined = body.images
      ? (body.images as (string | { url: string })[])
          .map((img) => (typeof img === 'string' ? img : img.url))
          .filter((u: string) => u && u.startsWith('http'))
      : undefined;

    console.info(`[VEHICLE UPDATE] images after filter:`, JSON.stringify(images));

    const data = {
      // ── Basic info ──────────────────────────────────────────────────────────
      ...(body.title        !== undefined && { title:          String(body.title).trim() }),
      ...(body.brand        !== undefined && { brand:          String(body.brand).trim() }),
      ...(body.model        !== undefined && { model:          String(body.model).trim() }),
      ...(body.generation   !== undefined && { generation:     body.generation?.trim() || null }),
      ...(body.year         !== undefined && { year:           Number(body.year) }),
      ...(body.mileage      !== undefined && { mileage:        Number(body.mileage) }),
      ...(body.condition    !== undefined && { condition:      body.condition }),
      ...(body.price        !== undefined && { price:          Number(body.price) }),
      ...(body.currency     !== undefined && { currency:       body.currency }),
      ...(body.vatMode      !== undefined && { vatMode:        body.vatMode }),
      ...(body.registration !== undefined && { registration:   body.registration?.trim() || null }),
      ...(body.description  !== undefined && { description:    String(body.description).trim() }),
      ...(body.dealerNotes  !== undefined && { dealerNotes:    body.dealerNotes?.trim() || null }),
      // ── Technical specs ──────────────────────────────────────────────────────
      ...(body.fuelType     !== undefined && { fuelType:       body.fuelType }),
      ...(body.transmission !== undefined && { transmission:   body.transmission }),
      ...(body.drivetrain   !== undefined && { drivetrain:     body.drivetrain }),
      ...(body.bodyType     !== undefined && { bodyType:       body.bodyType }),
      ...(body.engineSize   !== undefined && { engineSize:     body.engineSize ? Number(body.engineSize) : null }),
      ...(body.horsepower   !== undefined && { horsepower:     body.horsepower ? Number(body.horsepower) : null }),
      ...(body.kilowatts    !== undefined && { kilowatts:      body.kilowatts  ? Number(body.kilowatts)  : null }),
      ...(body.doors        !== undefined && { doors:          Number(body.doors) }),
      ...(body.seats        !== undefined && { seats:          Number(body.seats) }),
      ...(body.color        !== undefined && { color:          String(body.color).trim() }),
      ...(body.interiorColor !== undefined && { interiorColor: body.interiorColor?.trim() || null }),
      ...(body.vin          !== undefined && { vin:            body.vin?.trim() || null }),
      ...(body.origin       !== undefined && { origin:         body.origin?.trim() || null }),
      // ── Equipment / safety ───────────────────────────────────────────────────
      ...(body.equipment        !== undefined && { equipment:        body.equipment }),
      ...(body.safetyFeatures   !== undefined && { safetyFeatures:   body.safetyFeatures }),
      ...(body.features         !== undefined && { features:         body.features }),
      // ── Media ────────────────────────────────────────────────────────────────
      ...(images               !== undefined && { images }),
      ...(body.videoUrl        !== undefined && { videoUrl: body.videoUrl?.trim() || null }),
      // ── Publishing ───────────────────────────────────────────────────────────
      ...(body.status   !== undefined && { status:   body.status as VehicleStatus }),
      ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
      ...(body.showcase !== undefined && { showcase: Boolean(body.showcase) }),
      ...(body.onSale   !== undefined && { onSale:   Boolean(body.onSale) }),
      ...(body.tags     !== undefined && { tags:     body.tags }),
      ...(body.dealerId !== undefined && { dealerId: body.dealerId?.trim() || null }),
      ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone?.trim() || null }),
      ...(body.contactViber !== undefined && { contactViber: body.contactViber?.trim() || null }),
      ...(body.contactName !== undefined && { contactName: body.contactName?.trim() || null }),
      // ── SEO ──────────────────────────────────────────────────────────────────
      ...(body.slug     !== undefined && body.slug && { slug: String(body.slug).trim() }),
    };

    console.info(`[VEHICLE UPDATE] writing ${Object.keys(data).length} fields to DB for id=${id}`);

    const updated = await updateVehicle(id, data);

    console.info(`[VEHICLE UPDATE] success id=${id} slug=${updated.slug} images=${JSON.stringify((updated as { images?: unknown }).images)}`);

    // Sync VehicleMedia metadata (non-blocking — never fails the request)
    if (images) {
      const imageKeys = typeof body.imageKeys === 'object' && body.imageKeys !== null
        ? (body.imageKeys as Record<string, string>)
        : {};
      void syncVehicleMedia(id, images, imageKeys);
    }
    if (body.videos !== undefined) {
      void syncVehicleVideos(id, parseVideosPayload(body.videos));
    }

    // Flush SSG cache for vehicle detail pages (both locales)
    revalidatePath(`/sr/vehicle/${updated.slug}`);
    revalidatePath(`/sq/vehicle/${updated.slug}`);
    // Also flush inventory so counts/statuses stay current
    revalidatePath('/sr/inventory');
    revalidatePath('/sq/inventory');

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (err) {
    const msg  = err instanceof Error ? err.message : String(err);
    const code = prismaCode(err);
    console.error(`[VEHICLE UPDATE] error code=${code || 'n/a'}:`, msg);

    // P2025 — record not found
    if (code === 'P2025' || msg.includes('Record to update not found')) {
      return NextResponse.json({ success: false, error: 'Vozilo nije pronađeno' }, { status: 404 });
    }
    // P2002 — unique constraint (slug collision)
    if (code === 'P2002' || (msg.includes('Unique constraint') && msg.includes('slug'))) {
      return NextResponse.json({ success: false, error: 'Ovaj URL slug je već zauzet' }, { status: 409 });
    }
    // P1001 / P1002 — can't reach DB
    if (code === 'P1001' || code === 'P1002' || msg.toLowerCase().includes("can't reach database")) {
      return NextResponse.json(
        { success: false, error: `Cannot connect to database (${code}). Check DATABASE_URL in Vercel.` },
        { status: 503 },
      );
    }
    // All other errors: surface the real message since this is an authenticated admin route
    return NextResponse.json(
      { success: false, error: `DB error (${code || 'unknown'}): ${msg}` },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/vehicles/[id] — permanently delete a vehicle
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID vozila je obavezan' }, { status: 400 });
    }

    await deleteVehicle(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg  = err instanceof Error ? err.message : String(err);
    const code = prismaCode(err);
    console.error(`[VEHICLE DELETE] error code=${code || 'n/a'}:`, msg);
    if (code === 'P2025' || msg.includes('Record to delete does not exist')) {
      return NextResponse.json({ success: false, error: 'Vozilo nije pronađeno' }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, error: `DB error (${code || 'unknown'}): ${msg}` },
      { status: 500 },
    );
  }
}
