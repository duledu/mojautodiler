import type { MetadataRoute } from 'next';
import { mockVehicles } from '@/data/vehicles';

const BASE_URL = 'https://autoelite.rs';
const locales = ['sr', 'sq'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/inventory', '/contact'].flatMap(path =>
    locales.map(locale => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  );

  const vehicleRoutes = mockVehicles
    .filter(v => v.status === 'active')
    .flatMap(v =>
      locales.map(locale => ({
        url: `${BASE_URL}/${locale}/vehicle/${v.slug}`,
        lastModified: new Date(v.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: v.featured ? 0.9 : 0.7,
      }))
    );

  return [...staticRoutes, ...vehicleRoutes];
}
