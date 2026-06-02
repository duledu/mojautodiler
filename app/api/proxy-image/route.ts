import { NextRequest, NextResponse } from 'next/server';

// Restrict to the configured R2 CDN host and any *.r2.dev hostname.
// This prevents abuse as an open HTTP proxy while covering all Cloudflare R2
// public-bucket URLs regardless of how the bucket subdomain is assigned.
const R2_HOST = (() => {
  try { return new URL(process.env.R2_PUBLIC_URL ?? '').hostname; } catch { return null; }
})();

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    const h = url.hostname;
    if (R2_HOST && h === R2_HOST) return true;
    if (h.endsWith('.r2.dev')) return true;
    return false;
  } catch {
    return false;
  }
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB guard against huge images on mobile

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ error: 'Failed to fetch upstream' }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
  }

  const buf = await upstream.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'Image too large' }, { status: 413 });
  }

  // Detect real MIME type from magic bytes — some CDN/R2 configs return
  // application/octet-stream even for images.
  let contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    const b = new Uint8Array(buf.slice(0, 12));
    if      (b[0] === 0xff && b[1] === 0xd8)                                        contentType = 'image/jpeg';
    else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)     contentType = 'image/png';
    else if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46)     contentType = 'image/webp';
    else                                                                              contentType = 'image/jpeg';
  }

  return new NextResponse(buf, {
    headers: {
      'Content-Type':  contentType,
      'Cache-Control': 'public, max-age=600',
    },
  });
}
