import type { NextConfig } from 'next';

// ── R2 public domain ──────────────────────────────────────────────────────────
// If R2_PUBLIC_URL is a custom domain (not *.r2.dev) we add it dynamically so
// next/image can optimise those images. The wildcard *.r2.dev covers the
// default Cloudflare R2 public bucket URL (pub-<hash>.r2.dev).
function r2CustomHostname(): string | null {
  try {
    const url = process.env.R2_PUBLIC_URL?.trim();
    if (!url) return null;
    const { hostname } = new URL(url);
    return hostname.endsWith('.r2.dev') ? null : hostname;
  } catch {
    return null;
  }
}

const customR2Host = r2CustomHostname();

const nextConfig: NextConfig = {
  // Prisma client must run in Node.js runtime, not Edge
  serverExternalPackages: ['@prisma/client', 'prisma', 'nodemailer'],

  images: {
    // Prefer AVIF then WebP — both are served with quality fallback to the
    // original format by the browser's Accept header negotiation.
    formats: ['image/avif', 'image/webp'],
    // Controlled responsive widths keep Vercel/Next.js transformation counts low
    // while covering mobile, tablet, desktop cards, gallery, and fullscreen views.
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [96, 192, 384],
    // 31-day CDN/optimizer cache TTL. Safe because every new R2 upload uses a
    // unique timestamped object key (automatic URL versioning on photo replacement).
    minimumCacheTTL: 2678400,

    remotePatterns: [
      // Unsplash (used by mock/demo vehicles)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Default Cloudflare R2 public bucket URL (pub-<hash>.r2.dev)
      { protocol: 'https', hostname: '*.r2.dev' },
      // Custom R2 domain if configured in R2_PUBLIC_URL
      ...(customR2Host ? [{ protocol: 'https' as const, hostname: customR2Host }] : []),
    ],
  },

  async redirects() {
    return [
      // ── Permanent retirement of Albanian (/sq) version -> Serbian (/sr) equivalents ──
      // Order matters: specific /sq/kako-kupiti must match before /:locale/kako-kupiti
      // to guarantee single-hop 308 redirects with zero redirect chains.
      {
        source: '/sq',
        destination: '/sr',
        permanent: true,
      },
      {
        source: '/sq/inventory',
        destination: '/sr/inventory',
        permanent: true,
      },
      {
        source: '/sq/contact',
        destination: '/sr/contact',
        permanent: true,
      },
      {
        source: '/sq/cars/:brand(bmw|audi|volkswagen|mercedes-benz|skoda|porsche|tesla|land-rover|opel)',
        destination: '/sr/cars/:brand',
        permanent: true,
      },
      {
        source: '/sq/model/:slug(bmw-x5|bmw-x3|bmw-serija-5|audi-a6|audi-a4|golf-8|golf-7|golf-6|tiguan|octavia)',
        destination: '/sr/model/:slug',
        permanent: true,
      },
      {
        source: '/sq/blog',
        destination: '/sr/blog',
        permanent: true,
      },
      {
        source: '/sq/podela-odgovornosti',
        destination: '/sr/podela-odgovornosti',
        permanent: true,
      },
      {
        source: '/sq/kako-kupiti',
        destination: '/sr/podela-odgovornosti',
        permanent: true,
      },
      {
        source: '/sq/carvertical-dileri',
        destination: '/sr/carvertical-dileri',
        permanent: true,
      },
      {
        source: '/sq/carvertical-za-dilere',
        destination: '/sr/carvertical-za-dilere',
        permanent: true,
      },
      {
        source: '/sq/admin',
        destination: '/sr/admin',
        permanent: true,
      },
      {
        source: '/sq/admin/:path*',
        destination: '/sr/admin/:path*',
        permanent: true,
      },
      // ── Existing intentional Serbian redirect ──
      {
        source: '/sr/kako-kupiti',
        destination: '/sr/podela-odgovornosti',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
