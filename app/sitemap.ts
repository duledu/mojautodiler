import type { MetadataRoute } from 'next';
import { getVehicleSlugsForSitemap } from '@/lib/db/vehicles';

const BASE_URL = 'https://mojautodiler.rs';
const locales  = ['sr', 'sq'] as const;

/**
 * Dynamic XML sitemap.
 *
 * Key improvements over the previous version:
 * - Uses actual vehicle.updatedAt as lastmod (freshness signal for crawlers)
 * - Includes primary vehicle image in sitemap (enables Google Image Search indexing)
 * - Static pages get weekly priority; vehicle detail pages monthly
 *   (they change less often than the inventory index)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes = ['', '/inventory', '/contact'].flatMap((path) =>
    locales.map((locale) => ({
      url:             `${BASE_URL}/${locale}${path}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        path === '' ? 1 : 0.8,
    })),
  );

  // ── Vehicle detail pages ───────────────────────────────────────────────────
  const vehicles = await getVehicleSlugsForSitemap();

  const vehicleRoutes = vehicles.flatMap((v) =>
    locales.map((locale) => ({
      url:             `${BASE_URL}/${locale}/vehicle/${v.slug}`,
      lastModified:    v.updatedAt,          // actual date, not new Date()
      changeFrequency: 'weekly' as const,    // inventory can change weekly
      priority:        0.8,
      // images field adds vehicle photo to sitemap for Google Image Search
      ...(v.primaryImage && {
        images: [{ url: v.primaryImage, title: v.slug }],
      }),
    })),
  );

  return [...staticRoutes, ...vehicleRoutes];
}
