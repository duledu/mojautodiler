/**
 * Admin auth utilities — uses Web Crypto API so they run in both
 * Edge Runtime (middleware) and Node.js Runtime (API routes).
 *
 * Replace validateCredentials() + token logic with a real DB session
 * when you're ready to upgrade beyond the temp credentials approach.
 */

export const ADMIN_COOKIE = 'admin_token';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

// ─── Internal helpers ────────────────────────────────────────────────────────

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? 'dev-fallback-secret-change-before-production';
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  // URL-safe base64 — no +/= characters that could break cookie values
  return arrayBufferToBase64(sig)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function hmacVerify(data: string, sig: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    // Restore URL-safe base64 → standard base64 → bytes
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const sigBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    // crypto.subtle.verify performs a constant-time comparison internally
    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
  } catch {
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Creates a signed session token: `{iat}.{hmac}`.
 * iat is Unix seconds so we can check expiry on each request.
 */
export async function createSessionToken(): Promise<string> {
  const iat = Math.floor(Date.now() / 1000).toString();
  const sig = await hmacSign(iat);
  return `${iat}.${sig}`;
}

/**
 * Returns true if the token is structurally valid, HMAC-correct, and not expired.
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dotIdx = token.indexOf('.');
    if (dotIdx === -1) return false;
    const iat = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const iatNum = parseInt(iat, 10);
    if (Number.isNaN(iatNum)) return false;
    if (Date.now() / 1000 - iatNum > SESSION_MAX_AGE) return false;
    return hmacVerify(iat, sig);
  } catch {
    return false;
  }
}

/**
 * Validates credentials against env vars.
 * Swap this function body for a DB lookup when upgrading to real auth.
 */
export function validateCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedEmail || !expectedPassword) return false;
  return email === expectedEmail && password === expectedPassword;
}
