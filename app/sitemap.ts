import type { MetadataRoute } from 'next';
import { getActiveVehicleSlugs } from '@/lib/db/vehicles';
import { mockVehicles } from '@/data/vehicles';

const BASE_URL = 'https://autoferari.rs';
const locales = ['sr', 'sq'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/inventory', '/contact'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  );

  // Try DB; fall back to mock
  let slugs: { slug: string }[];
  try {
    slugs = await getActiveVehicleSlugs();
    if (slugs.length === 0) {
      slugs = mockVehicles.filter((v) => v.status === 'active').map((v) => ({ slug: v.slug }));
    }
  } catch {
    slugs = mockVehicles.filter((v) => v.status === 'active').map((v) => ({ slug: v.slug }));
  }

  const vehicleRoutes = slugs.flatMap((v) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/vehicle/${v.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...vehicleRoutes];
}
