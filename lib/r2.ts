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

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
    .replace(/[^a-z0-9.\-]/g, '-')
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
