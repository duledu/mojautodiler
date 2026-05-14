import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, ADMIN_COOKIE } from '@/lib/admin-auth';

const LOCALES = ['sr', 'sq'] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    // Locale-prefixed admin UI pages
    '/sr/admin/:path*',
    '/sq/admin/:path*',
    // Admin API routes (auth endpoints are excluded in the handler above)
    '/api/admin/:path*',
  ],
};
