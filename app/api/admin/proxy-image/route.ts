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

  const buf = await upstream.arrayBuffer();

  // Normalize content-type: some CDN/R2 configs return application/octet-stream.
  // Detect the real image type from magic bytes so browsers can render the img.
  let contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    const b = new Uint8Array(buf.slice(0, 12));
    if (b[0] === 0xff && b[1] === 0xd8)                                   contentType = 'image/jpeg';
    else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) contentType = 'image/png';
    else if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46)             contentType = 'image/gif';
    else if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) contentType = 'image/webp';
    else                                                                   contentType = 'image/jpeg';
  }

  return new NextResponse(buf, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
