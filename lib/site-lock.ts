/**
 * Site-lock preview gate — temporary feature for pre-launch access control.
 *
 * TO DISABLE: Set SITE_LOCK_ENABLED=false (or remove it) in your env.
 * TO REMOVE ENTIRELY: Delete this file, middleware.ts, app/lock/, and
 *   app/api/lock/ — then remove the import from middleware.ts.
 */

export const LOCK_COOKIE      = 'mad_preview';
export const LOCK_COOKIE_AGE  = 60 * 60 * 24 * 7; // 7 days

export function isSiteLockEnabled(): boolean {
  return process.env.SITE_LOCK_ENABLED === 'true';
}

/**
 * Computes the expected cookie token from the configured password.
 * Uses the Web Crypto API so it runs in both Edge (middleware) and Node.js.
 */
export async function computePreviewToken(): Promise<string> {
  const password = process.env.SITE_LOCK_PASSWORD ?? '';
  if (!password) return '';
  const enc  = new TextEncoder();
  const data = await crypto.subtle.digest('SHA-256', enc.encode(`mad-preview:${password}`));
  return [...new Uint8Array(data)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Returns true for paths that must always bypass the lock. */
export function shouldBypassLock(pathname: string): boolean {
  const BYPASS = [
    // Admin UI (locale-prefixed)
    '/sr/admin',
    '/sq/admin',
    // All API routes (admin API auth, lock verify, etc.)
    '/api',
    // Next.js internals & static assets
    '/_next',
    // Lock page itself — must never be locked
    '/lock',
    // Public static files
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/apple-icon.png',
    '/icon.png',
    '/brand-logo.png',
    '/og-image.jpg',
    '/manifest.json',
    '/sw.js',
    '/icons',
    '/og',
    '/videos',
  ];
  return BYPASS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}
