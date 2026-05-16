import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { deleteObject } from '@/lib/r2';
import { syncVehicleMedia } from '@/lib/db/vehicles';

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function revalidateVehicle(vehicleId: string) {
  const v = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { slug: true } });
  if (v?.slug) {
    revalidatePath(`/sr/vehicle/${v.slug}`);
    revalidatePath(`/sq/vehicle/${v.slug}`);
  }
}

async function tryDeleteR2(r2Key: string) {
  try {
    await deleteObject(r2Key);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[MEDIA DELETE] R2 delete failed for key=${r2Key}:`, msg);
  }
}

async function removeFromDb(vehicleId: string, url: string) {
  await prisma.vehicleMedia.deleteMany({ where: { vehicleId, url } });

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { images: true },
  });

  if (!vehicle) return;

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { images: vehicle.images.filter((u) => u !== url) },
  });
}

// ─── DELETE /api/admin/vehicles/[id]/media ─────────────────────────────────────
// Removes one media item from R2 + VehicleMedia table + Vehicle.images array.
// Body: { url: string, r2Key?: string }

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params;

  let url: string;
  let r2Key: string | undefined;

  try {
    const body = await request.json() as { url?: unknown; r2Key?: unknown };
    url   = typeof body.url   === 'string' ? body.url.trim()   : '';
    r2Key = typeof body.r2Key === 'string' ? body.r2Key.trim() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!url) return NextResponse.json({ error: 'url is required.' }, { status: 400 });

  if (r2Key) await tryDeleteR2(r2Key);

  try {
    await removeFromDb(vehicleId, url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[MEDIA DELETE] DB update failed:', msg);
    return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 });
  }

  await revalidateVehicle(vehicleId);
  return NextResponse.json({ success: true });
}

// ─── PATCH /api/admin/vehicles/[id]/media ──────────────────────────────────────
// Persists a new image order after drag-and-drop or set-primary action.
// Body: { order: string[] }  — ordered array of image public URLs
//
// Updates Vehicle.images (denormalised cache) and VehicleMedia.sortOrder /
// isPrimary so both the gallery and the DB stay consistent.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params;

  let order: string[];
  try {
    const body = await request.json() as { order?: unknown };
    if (!Array.isArray(body.order)) throw new Error('order must be an array');
    order = (body.order as unknown[]).filter((u): u is string => typeof u === 'string');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid body';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    // Update the denormalised images cache on Vehicle
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { images: order },
    });

    // Sync VehicleMedia sortOrder + isPrimary (non-blocking, best-effort)
    void syncVehicleMedia(vehicleId, order);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[MEDIA REORDER] DB update failed:', msg);
    return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 });
  }

  await revalidateVehicle(vehicleId);
  return NextResponse.json({ success: true });
}
