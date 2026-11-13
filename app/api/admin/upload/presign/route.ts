import { NextRequest, NextResponse } from 'next/server';
import {
  validateUpload,
  validateVideoUpload,
  buildObjectKey,
  buildBlogObjectKey,
  createPresignedPut,
  buildPublicUrl,
  r2EnvDiagnostics,
} from '@/lib/r2';
import { getVehicleVideoUsage } from '@/lib/db/vehicles';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';

/**
 * POST /api/admin/upload/presign
 *
 * Protected by proxy (all /api/admin/* routes require an admin session cookie)
 * and verified directly inside this handler for defense-in-depth.
 *
 * Body:   { filename, contentType, size, scope?, vehicleId?, postId?, kind? }
 *         scope: 'vehicle' (default) | 'blog'
 *         kind:  'image' (default) | 'video' (vehicles only)
 * Returns { uploadUrl, publicUrl, key }
 *
 * The client then PUTs the file directly to `uploadUrl` (browser → R2).
 * On 200/204 it stores `publicUrl` in the vehicle's or blog post's media fields.
 */
export async function POST(request: NextRequest) {
  // ── Defense-in-depth admin auth check ─────────────────────────────────────
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = token ? await verifySessionToken(token) : false;
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Env var preflight check ───────────────────────────────────────────────
  const diag = r2EnvDiagnostics();
  const missingVars = Object.entries(diag)
    .filter(([, v]) => v === 'MISSING')
    .map(([k]) => k);

  if (missingVars.length > 0) {
    console.error('[R2 PRESIGN] Missing env vars:', missingVars.join(', '));
    console.error('[R2 PRESIGN] Env diagnostics:', diag);
    return NextResponse.json(
      {
        error: `R2 not configured. Missing env vars: ${missingVars.join(', ')}. ` +
               `Add them to .env.local and restart the dev server.`,
        diagnostics: diag,
      },
      { status: 500 },
    );
  }

  console.info('[R2 PRESIGN] env OK —', diag);

  // ── Parse body ────────────────────────────────────────────────────────────
  let filename: string;
  let contentType: string;
  let size: number;
  let scope: 'vehicle' | 'blog';
  let vehicleId: string | undefined;
  let postId: string | undefined;
  let kind: 'image' | 'video';

  try {
    const body = await request.json();
    filename    = String(body.filename    ?? '').trim();
    contentType = String(body.contentType ?? '').trim();
    size        = Number(body.size);
    const rawScope = body.scope === undefined || body.scope === null ? 'vehicle' : String(body.scope).trim();
    if (rawScope !== 'vehicle' && rawScope !== 'blog') {
      return NextResponse.json(
        { error: 'Invalid upload scope. Allowed scopes: "vehicle", "blog".' },
        { status: 400 },
      );
    }
    scope       = rawScope;
    vehicleId   = typeof body.vehicleId === 'string' ? body.vehicleId.trim() || undefined : undefined;
    postId      = typeof body.postId === 'string' ? body.postId.trim() || undefined : undefined;
    kind        = body.kind === 'video' ? 'video' : 'image';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!filename || !contentType || !Number.isFinite(size) || size <= 0) {
    return NextResponse.json(
      { error: 'filename, contentType and positive size are required.' },
      { status: 400 },
    );
  }

  console.info(
    `[R2 PRESIGN] request — scope=${scope} file="${filename}" type=${contentType} ` +
    `size=${size} kind=${kind} targetId=${(scope === 'blog' ? postId : vehicleId) ?? 'new'}`,
  );

  // ── Validate ──────────────────────────────────────────────────────────────
  if (scope === 'blog' && kind === 'video') {
    return NextResponse.json(
      { error: 'Video uploads are not supported for blog articles. Only JPG, PNG and WebP images are accepted.' },
      { status: 422 },
    );
  }

  if (kind === 'video') {
    // Authoritative cap check requires existing VehicleMedia rows, which only
    // exist once the vehicle has been saved at least once. For brand-new
    // vehicles (no id yet) the client enforces the running total locally —
    // the same trust model already used for the image flow.
    const currentTotal = vehicleId ? await getVehicleVideoUsage(vehicleId) : 0;
    const validationError = validateVideoUpload(contentType, size, currentTotal);
    if (validationError) {
      console.warn('[R2 PRESIGN] video validation failed:', validationError);
      return NextResponse.json({ error: validationError }, { status: 422 });
    }
  } else {
    const validationError = validateUpload(contentType, size);
    if (validationError) {
      console.warn('[R2 PRESIGN] validation failed:', validationError);
      return NextResponse.json({ error: validationError }, { status: 422 });
    }
  }

  // ── Generate presigned URL ────────────────────────────────────────────────
  try {
    const key =
      scope === 'blog'
        ? buildBlogObjectKey(postId, filename)
        : buildObjectKey(vehicleId, filename);
    const uploadUrl = await createPresignedPut(key, contentType);
    const publicUrl = buildPublicUrl(key);

    console.info(`[R2 PRESIGN] success — key=${key}`);
    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Presign failed';
    console.error('[R2 PRESIGN] error:', msg);
    return NextResponse.json({ error: msg, diagnostics: diag }, { status: 500 });
  }
}
