import { handleSitemapGet } from '@/lib/seo/sitemap-builder';

/**
 * Dynamic XML Sitemap Route Handler.
 *
 * - Always reflects live DB state without waiting for a rebuild.
 * - Strict CDN freshness bound: s-maxage=60 + stale-while-revalidate=240 = max 300s (<= 5 min).
 * - Fail-closed on DB outage: returns HTTP 503 with `Cache-Control: no-store` and
 *   `Retry-After: 60` so crawlers never see an empty/partial sitemap with HTTP 200.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleSitemapGet();
}
