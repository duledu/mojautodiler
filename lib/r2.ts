/**
 * Cloudflare R2 storage service (S3-compatible).
 *
 * Uses presigned PUT URLs so uploads go directly from the browser to R2,
 * bypassing Vercel's function body-size limit entirely.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID        – Cloudflare account ID (40-char hex)
 *   R2_ACCESS_KEY_ID     – R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY – R2 API token Secret Access Key
 *   R2_BUCKET_NAME       – e.g. mojautodiler-media
 *   R2_PUBLIC_URL        – Public bucket URL, e.g. https://pub-<hash>.r2.dev
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ─── Env var helper ───────────────────────────────────────────────────────────

/**
 * Reads an env var and strips any surrounding quotes or whitespace that can
 * creep in when values are typed as  KEY= "value"  in .env.local files.
 */
function env(key: string): string {
  return (process.env[key] ?? '').trim().replace(/^["']|["']$/g, '');
}

// ─── Singleton S3 client (lazy) ───────────────────────────────────────────────

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const accountId = env('R2_ACCOUNT_ID');
  const accessKeyId = env('R2_ACCESS_KEY_ID');
  const secretAccessKey = env('R2_SECRET_ACCESS_KEY');

  const missing = [
    !accountId && 'R2_ACCOUNT_ID',
    !accessKeyId && 'R2_ACCESS_KEY_ID',
    !secretAccessKey && 'R2_SECRET_ACCESS_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`R2 env vars not set: ${missing.join(', ')}`);
  }

  console.info(
    `[R2] client init — account=${accountId.slice(0, 6)}… ` +
    `keyId=${accessKeyId.slice(0, 6)}… ` +
    `endpoint=https://${accountId}.r2.cloudflarestorage.com`,
  );

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    // Required for Cloudflare R2: use path-style URLs (bucket in path, not subdomain)
    forcePathStyle: true,
  });
  return _client;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns an error string if the upload is invalid, or null if it's OK. */
export function validateUpload(contentType: string, sizeBytes: number): string | null {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(contentType)) {
    return 'Only JPG, PNG and WebP images are accepted.';
  }
  if (sizeBytes > MAX_FILE_SIZE) {
    return `File is ${(sizeBytes / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`;
  }
  return null;
}

/**
 * Builds a deterministic, URL-safe storage key.
 * Format: vehicles/{vehicleId|tmp-xxx}/{timestamp}-{safeFilename}
 */
export function buildObjectKey(vehicleId: string | null | undefined, filename: string): string {
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);

  const scope = vehicleId?.trim() || `tmp-${crypto.randomUUID().slice(0, 8)}`;
  return `vehicles/${scope}/${Date.now()}-${safeName}`;
}

/**
 * Returns a presigned PUT URL valid for 5 minutes.
 * The browser uses this URL to upload the file directly to R2.
 */
export async function createPresignedPut(key: string, contentType: string): Promise<string> {
  const bucket = env('R2_BUCKET_NAME');
  if (!bucket) throw new Error('R2_BUCKET_NAME env var is not set.');

  console.info(`[R2] presigning PUT — bucket=${bucket} key=${key} type=${contentType}`);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(getClient(), command, { expiresIn: 300 });
  console.info(`[R2] presign OK — url starts with ${url.slice(0, 60)}…`);
  return url;
}

/**
 * Deletes an object from R2 by its storage key.
 * Throws if R2 is not configured or the deletion fails.
 */
export async function deleteObject(key: string): Promise<void> {
  const bucket = env('R2_BUCKET_NAME');
  if (!bucket) throw new Error('R2_BUCKET_NAME env var is not set.');

  console.info(`[R2] deleting object — bucket=${bucket} key=${key}`);
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.info(`[R2] object deleted — key=${key}`);
}

/** Constructs the public URL for a stored object. */
export function buildPublicUrl(key: string): string {
  const base = env('R2_PUBLIC_URL').replace(/\/$/, '');
  if (!base) throw new Error('R2_PUBLIC_URL env var is not set.');
  return `${base}/${key}`;
}

/** Returns a map of env var presence for diagnostics (no secret values). */
export function r2EnvDiagnostics(): Record<string, string> {
  return {
    R2_ACCOUNT_ID:        env('R2_ACCOUNT_ID')        ? `set (${env('R2_ACCOUNT_ID').length} chars)`        : 'MISSING',
    R2_ACCESS_KEY_ID:     env('R2_ACCESS_KEY_ID')     ? `set (${env('R2_ACCESS_KEY_ID').length} chars)`     : 'MISSING',
    R2_SECRET_ACCESS_KEY: env('R2_SECRET_ACCESS_KEY') ? `set (${env('R2_SECRET_ACCESS_KEY').length} chars)` : 'MISSING',
    R2_BUCKET_NAME:       env('R2_BUCKET_NAME')       || 'MISSING',
    R2_PUBLIC_URL:        env('R2_PUBLIC_URL')         || 'MISSING',
  };
}

// ─── Temp-file cleanup ────────────────────────────────────────────────────────

/** Prefix for images uploaded before a vehicle is saved. */
export const TEMP_OBJECT_PREFIX = 'vehicles/tmp-';

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 h

export interface TempObjectInfo {
  key: string;
  lastModified: Date;
  sizeBytes: number;
}

export interface CleanupResult {
  scanned: number;
  deleted: number;
  skipped: number;
  errors: string[];
}

/**
 * Returns a human-readable skip reason, or null when the object is safe to delete.
 * Three guards must all pass:
 *   1. Key is under TEMP_OBJECT_PREFIX
 *   2. LastModified is older than the cutoff
 *   3. Derived public URL is not in savedUrls
 */
function skipReasonFor(
  obj: TempObjectInfo,
  cutoff: Date,
  publicBase: string,
  savedUrls: Set<string>,
): string | null {
  if (!obj.key.startsWith(TEMP_OBJECT_PREFIX)) return 'wrong-prefix';
  if (obj.lastModified >= cutoff) return `too-recent (${obj.lastModified.toISOString()})`;
  if (savedUrls.has(`${publicBase}/${obj.key}`)) return 'in-db';
  return null;
}

/** Attempts to delete one object; records success/failure in result. */
async function tryDeleteOne(obj: TempObjectInfo, result: CleanupResult): Promise<void> {
  try {
    await deleteObject(obj.key);
    result.deleted++;
    console.info(`[R2 CLEANUP] Deleted — key=${obj.key} size=${obj.sizeBytes}B`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[R2 CLEANUP] Delete failed — key=${obj.key}:`, msg);
    result.errors.push(`Delete ${obj.key}: ${msg}`);
  }
}

/**
 * Lists all R2 objects under `vehicles/tmp-`.
 * Paginates automatically; never throws — returns [] when R2 is not configured.
 */
export async function listTempObjects(): Promise<TempObjectInfo[]> {
  const bucket = env('R2_BUCKET_NAME');
  if (!bucket) {
    console.warn('[R2 CLEANUP] R2_BUCKET_NAME not set — returning empty list');
    return [];
  }

  const results: TempObjectInfo[] = [];
  let token: string | undefined;

  do {
    const resp = await getClient().send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: TEMP_OBJECT_PREFIX, ContinuationToken: token, MaxKeys: 1000 }),
    );
    for (const o of resp.Contents ?? []) {
      if (o.Key && o.LastModified) results.push({ key: o.Key, lastModified: o.LastModified, sizeBytes: o.Size ?? 0 });
    }
    token = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (token);

  return results;
}

/**
 * Deletes orphaned temporary R2 objects safely.
 *
 * An object is deleted only when all three of these hold:
 *   1. Its key starts with `vehicles/tmp-`
 *   2. Its LastModified is older than `maxAgeMs` (default 24 h)
 *   3. Its derived public URL is NOT in `savedUrls`
 *
 * Never throws; errors are collected in result.errors. Returns a zero struct
 * when R2 env vars are missing.
 */
export async function cleanupTempObjects(
  savedUrls: Set<string>,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): Promise<CleanupResult> {
  const result: CleanupResult = { scanned: 0, deleted: 0, skipped: 0, errors: [] };

  const bucket     = env('R2_BUCKET_NAME');
  const publicBase = env('R2_PUBLIC_URL').replace(/\/$/, '');

  if (!bucket || !publicBase) {
    const missing = [!bucket && 'R2_BUCKET_NAME', !publicBase && 'R2_PUBLIC_URL'].filter(Boolean);
    console.warn(`[R2 CLEANUP] Missing env vars: ${missing.join(', ')} — aborting`);
    return result;
  }

  const cutoff = new Date(Date.now() - maxAgeMs);
  console.info(`[R2 CLEANUP] Starting — cutoff=${cutoff.toISOString()} savedUrls=${savedUrls.size}`);

  let objects: TempObjectInfo[];
  try {
    objects = await listTempObjects();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[R2 CLEANUP] List failed:', msg);
    result.errors.push(`List failed: ${msg}`);
    return result;
  }

  result.scanned = objects.length;
  console.info(`[R2 CLEANUP] Scanned ${objects.length} object(s)`);

  for (const obj of objects) {
    const reason = skipReasonFor(obj, cutoff, publicBase, savedUrls);
    if (reason) {
      result.skipped++;
      if (reason !== 'wrong-prefix') console.info(`[R2 CLEANUP] Skip (${reason}) — key=${obj.key}`);
    } else {
      await tryDeleteOne(obj, result);
    }
  }

  console.info(`[R2 CLEANUP] Done — scanned=${result.scanned} deleted=${result.deleted} skipped=${result.skipped} errors=${result.errors.length}`);
  return result;
}
