import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSessionToken, ADMIN_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`);

  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil(rateLimit.retryAfterMs / 1000);
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let email: string;
  let password: string;

  try {
    const body = await request.json();
    email = String(body.email ?? '').trim().toLowerCase();
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Validate credentials ──────────────────────────────────────────────────
  if (!validateCredentials(email, password)) {
    // Intentionally vague — don't reveal which field is wrong
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // ── Issue session cookie ──────────────────────────────────────────────────
  const token = await createSessionToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
