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
  serverExternalPackages: ['@prisma/client', 'prisma'],

  images: {
    // Prefer AVIF then WebP — both are served with quality fallback to the
    // original format by the browser's Accept header negotiation.
    formats: ['image/avif', 'image/webp'],

    remotePatterns: [
      // Unsplash (used by mock/demo vehicles)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Default Cloudflare R2 public bucket URL (pub-<hash>.r2.dev)
      { protocol: 'https', hostname: '*.r2.dev' },
      // Custom R2 domain if configured in R2_PUBLIC_URL
      ...(customR2Host ? [{ protocol: 'https' as const, hostname: customR2Host }] : []),
    ],
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
    ];
  },
};

export default nextConfig;
