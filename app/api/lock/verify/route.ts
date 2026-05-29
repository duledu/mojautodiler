import { NextRequest, NextResponse } from 'next/server';
import { LOCK_COOKIE, LOCK_COOKIE_AGE, computePreviewToken } from '@/lib/site-lock';

// POST /api/lock/verify
// Body: { password: string; from: string }
// Sets the preview cookie on success.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { password?: string; from?: string };
  const { password, from } = body;

  const expected = process.env.SITE_LOCK_PASSWORD;
  if (!expected || !password || password !== expected) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token    = await computePreviewToken();
  const redirect = from && from.startsWith('/') ? from : '/sr';

  const response = NextResponse.json({ success: true, redirect });
  response.cookies.set(LOCK_COOKIE, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'strict',
    maxAge:    LOCK_COOKIE_AGE,
    path:      '/',
  });
  return response;
}
