import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, ADMIN_COOKIE } from '@/lib/admin-auth';
import {
  isSiteLockEnabled,
  shouldBypassLock,
  computePreviewToken,
  LOCK_COOKIE,
} from '@/lib/site-lock';

const LOCALES = ['sr', 'sq'] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Site lock (public preview gate) ──────────────────────────────────────────
  // Runs before admin protection. Bypass list covers admin routes, API, _next,
  // static assets, and the /lock page itself.
  if (isSiteLockEnabled() && !shouldBypassLock(pathname)) {
    const cookie = request.cookies.get(LOCK_COOKIE);
    const valid  = cookie?.value
      ? cookie.value === await computePreviewToken()
      : false;

    if (!valid) {
      const lockUrl = new URL('/lock', request.url);
      lockUrl.searchParams.set('from', pathname + (request.nextUrl.search ?? ''));
      return NextResponse.redirect(lockUrl);
    }
  }

  // ── Protect admin JSON API routes (/api/admin/* except auth endpoints) ────
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth/')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const isAuthenticated = token ? await verifySessionToken(token) : false;
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Protect locale admin UI routes (/sr/admin/*, /sq/admin/*) ────────────
  const locale = LOCALES.find((l) => pathname.startsWith(`/${l}/admin`));
  if (!locale) return NextResponse.next();

  const isLoginPage = pathname === `/${locale}/admin/login`;

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isAuthenticated = token ? await verifySessionToken(token) : false;

  // Already logged in → skip the login page, go straight to dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
  }

  // Unauthenticated on any protected admin route → send to login
  if (!isLoginPage && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/admin/login`, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // All routes except Next.js static files and images — lock check needs full coverage.
    // The shouldBypassLock() helper inside the proxy handler excludes admin, api,
    // _next, and static assets from the lock check.
    '/((?!_next/static|_next/image|favicon.ico).*)' ,
  ],
};
