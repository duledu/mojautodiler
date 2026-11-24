import type { MetadataRoute } from 'next';
import { getVehicleSlugsForSitemap } from '@/lib/db/vehicles';
import { buildBlogSitemapEntries } from '@/lib/seo/blog-seo';
import { SITE_URL } from '@/lib/site-url';
import { BRAND_SLUGS } from '@/app/[locale]/cars/[brand]/page';
import { MODEL_SLUGS } from '@/app/[locale]/model/[slug]/page';

const locales = ['sr', 'sq'] as const;

const VALID_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function isValidSitemapSlug(slug: string): boolean {
  const trimmed = slug.trim();
  return trimmed.length > 0 && trimmed === slug && VALID_SLUG_RE.test(trimmed);
}

function isValidAbsoluteHttpUrl(raw?: string | null): raw is string {
  if (!raw) return false;
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function buildBilingualAlternates(path: string) {
  return {
    languages: {
      sr: `${SITE_URL}/sr${path}`,
      sq: `${SITE_URL}/sq${path}`,
      'x-default': `${SITE_URL}/sr${path}`,
    },
  };
}

/**
 * Dynamic XML sitemap.
 *
 * Uses the centralized SITE_URL (`https://www.mojautodiler.com`), emits valid
 * string[] image URLs for Google Image Search, includes hreflang alternates for
 * bilingual routes, excludes malformed slugs, and deduplicates final entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = ['', '/inventory', '/contact'].flatMap((path) => {
    const alternates = buildBilingualAlternates(path);
    return locales.map((locale) => ({
      url:             `${SITE_URL}/${locale}${path}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        path === '' ? 1 : 0.8,
      alternates,
    }));
  });

  // ── Legal pages (Serbian primary route only — no sq alternate) ─────────────
  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url:             `${SITE_URL}/sr/podela-odgovornosti`,
      lastModified:    new Date(),
      changeFrequency: 'monthly' as const,
      priority:        0.5,
    },
  ];

  // ── Vehicle detail pages ───────────────────────────────────────────────────
  const vehicles = await getVehicleSlugsForSitemap();

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles
    .filter((v) => isValidSitemapSlug(v.slug))
    .flatMap((v) => {
      const path = `/vehicle/${v.slug}`;
      const alternates = buildBilingualAlternates(path);
      const validImage = isValidAbsoluteHttpUrl(v.primaryImage)
        ? v.primaryImage.trim()
        : undefined;

      return locales.map((locale) => ({
        url:             `${SITE_URL}/${locale}${path}`,
        lastModified:    v.updatedAt,
        changeFrequency: 'weekly' as const,
        priority:        0.8,
        alternates,
        ...(validImage ? { images: [validImage] } : {}),
      }));
    });

  // ── Brand silo pages ───────────────────────────────────────────────────────
  const brandRoutes: MetadataRoute.Sitemap = BRAND_SLUGS.flatMap((brand) => {
    const path = `/cars/${brand}`;
    const alternates = buildBilingualAlternates(path);
    return locales.map((locale) => ({
      url:             `${SITE_URL}/${locale}${path}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        0.7,
      alternates,
    }));
  });

  // ── Model silo pages ───────────────────────────────────────────────────────
  const modelRoutes: MetadataRoute.Sitemap = MODEL_SLUGS.flatMap((slug) => {
    const path = `/model/${slug}`;
    const alternates = buildBilingualAlternates(path);
    return locales.map((locale) => ({
      url:             `${SITE_URL}/${locale}${path}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        0.7,
      alternates,
    }));
  });

  // ── Blog pages (Serbian Latin only — published & indexable) ────────────────
  const blogRoutes = await buildBlogSitemapEntries();

  const combined = [
    ...staticRoutes,
    ...legalRoutes,
    ...brandRoutes,
    ...modelRoutes,
    ...vehicleRoutes,
    ...blogRoutes,
  ];

  // Deduplicate by exact canonical URL while preserving order
  const seen = new Set<string>();
  return combined.filter((entry) => {
    if (!isValidAbsoluteHttpUrl(entry.url) || seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
}
