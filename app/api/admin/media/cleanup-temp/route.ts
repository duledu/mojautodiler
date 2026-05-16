import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupTempObjects, r2EnvDiagnostics } from '@/lib/r2';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';

/**
 * POST /api/admin/media/cleanup-temp
 *
 * Deletes temporary R2 objects under `vehicles/tmp-` that are:
 *   - older than 24 hours
 *   - not referenced in the VehicleMedia table
 *
 * Authentication — ONE of the following must be present:
 *   a) A valid admin session cookie  (for manual calls from the admin UI)
 *   b) Authorization: Bearer ${MEDIA_CLEANUP_SECRET}  (for Vercel / external cron)
 *
 * Returns:
 *   { scanned, deleted, skipped, errors, r2Configured }
 */
export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── R2 preflight ───────────────────────────────────────────────────────────
  const diag = r2EnvDiagnostics();
  const r2Configured = Object.values(diag).every((v) => v !== 'MISSING');

  if (!r2Configured) {
    console.warn('[CLEANUP-TEMP] R2 not configured — returning early:', diag);
    return NextResponse.json({
      scanned: 0, deleted: 0, skipped: 0, errors: [],
      r2Configured: false,
      message: 'R2 is not configured. Set all R2_* env vars to enable cleanup.',
    });
  }

  // ── Fetch saved URLs from DB ────────────────────────────────────────────────
  // These are all URLs that are genuinely persisted; they must never be deleted.
  let savedUrls: Set<string>;
  try {
    savedUrls = await loadSavedUrls();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CLEANUP-TEMP] Failed to load saved URLs:', msg);
    return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 });
  }

  // ── Run cleanup ────────────────────────────────────────────────────────────
  console.info(`[CLEANUP-TEMP] Starting cleanup — ${savedUrls.size} saved URLs protected`);
  const result = await cleanupTempObjects(savedUrls);

  return NextResponse.json({ ...result, r2Configured: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when the request carries a valid admin session OR a valid cleanup secret. */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  // Path 1: cron / external caller — Bearer token
  const cleanupSecret = process.env.MEDIA_CLEANUP_SECRET?.trim();
  const authHeader    = request.headers.get('authorization') ?? '';
  if (cleanupSecret && authHeader === `Bearer ${cleanupSecret}`) return true;

  // Path 2: admin UI — signed session cookie
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie) return verifySessionToken(cookie);

  return false;
}

/**
 * Returns a Set of every public URL currently stored in VehicleMedia.
 * Also includes URLs from Vehicle.images (denormalised cache) as a safety net
 * in case VehicleMedia is out of sync.
 */
async function loadSavedUrls(): Promise<Set<string>> {
  const [mediaRows, vehicleRows] = await Promise.all([
    prisma.vehicleMedia.findMany({ select: { url: true } }),
    prisma.vehicle.findMany({ select: { images: true } }),
  ]);

  const urls = new Set<string>();
  for (const { url } of mediaRows) urls.add(url);
  for (const { images } of vehicleRows) {
    for (const url of images) urls.add(url);
  }
  return urls;
}
