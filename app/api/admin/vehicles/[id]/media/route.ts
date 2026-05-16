import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { deleteObject } from '@/lib/r2';

/**
 * DELETE /api/admin/vehicles/[id]/media
 *
 * Removes one media item from both R2 and the VehicleMedia table, then
 * removes the URL from Vehicle.images so gallery pages update immediately.
 *
 * Body: { url: string, r2Key?: string }
 *
 * Protected by the admin auth middleware (all /api/admin/* routes require a
 * valid session cookie — no additional auth check needed here).
 */
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

  if (!url) {
    return NextResponse.json({ error: 'url is required.' }, { status: 400 });
  }

  // ── 1. Delete from R2 (best-effort) ────────────────────────────────────────
  if (r2Key) {
    try {
      await deleteObject(r2Key);
    } catch (err) {
      // Log but don't fail — the DB cleanup still matters even if R2 is down
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[MEDIA DELETE] R2 delete failed for key=${r2Key}:`, msg);
    }
  }

  // ── 2. Remove VehicleMedia record ──────────────────────────────────────────
  try {
    await prisma.vehicleMedia.deleteMany({
      where: { vehicleId, url },
    });
  } catch (err) {
    console.error('[MEDIA DELETE] VehicleMedia delete failed:', err);
    // Non-fatal — continue to update the images array
  }

  // ── 3. Remove URL from Vehicle.images array ─────────────────────────────────
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { images: true, slug: true },
    });

    if (vehicle) {
      const updatedImages = vehicle.images.filter((u) => u !== url);
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { images: updatedImages },
      });

      // Flush SSG cache for detail pages
      if (vehicle.slug) {
        revalidatePath(`/sr/vehicle/${vehicle.slug}`);
        revalidatePath(`/sq/vehicle/${vehicle.slug}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[MEDIA DELETE] Vehicle.images update failed:', msg);
    return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
