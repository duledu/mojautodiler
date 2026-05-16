import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';

// Block private/internal IP ranges to prevent SSRF
function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost') return true;
  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc[0-9a-f]{2}:/i,
  ];
  return privatePatterns.some((p) => p.test(hostname));
}

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    if (isPrivateHost(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get('url') ?? '';
  let url: string;
  try {
    url = decodeURIComponent(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid url encoding' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: 'no-store' });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch upstream image' }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  const buf = await upstream.arrayBuffer();

  return new NextResponse(buf, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
