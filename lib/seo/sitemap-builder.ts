import { NextResponse } from 'next/server';
import type { MetadataRoute } from 'next';
import { getVehicleSlugsForSitemap } from '@/lib/db/vehicles';
import { buildBlogSitemapEntries } from '@/lib/seo/blog-seo';
import { BRAND_SILOS, MODEL_SILOS } from '@/lib/seo/silos';
import { SITE_URL } from '@/lib/site-url';

const LOCALES = ['sr', 'sq'] as const;
const VALID_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export interface SitemapVehicleRecord {
  readonly slug: string;
  readonly updatedAt: Date;
  readonly primaryImage?: string;
}

export function isValidSitemapSlug(slug: string): boolean {
  const trimmed = slug.trim();
  return trimmed.length > 0 && trimmed === slug && VALID_SLUG_RE.test(trimmed);
}

export function isValidAbsoluteHttpUrl(raw?: string | null): raw is string {
  if (!raw) return false;
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function buildBilingualAlternates(path: string) {
  return {
    languages: {
      sr: `${SITE_URL}/sr${path}`,
      sq: `${SITE_URL}/sq${path}`,
      'x-default': `${SITE_URL}/sr${path}`,
    },
  };
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatW3cDate(value?: string | Date): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Builds static and aggregate hub sitemap entries.
 * Per Google Search Central guidance (June 2023), `<lastmod>` is intentionally
 * omitted on static pages and aggregate listing hubs whose exact modification
 * time cannot be guaranteed across hard vehicle deletions or post withdrawals.
 */
export function buildStaticSitemapEntries(): MetadataRoute.Sitemap {
  const bilingualPaths = ['', '/inventory', '/contact'] as const;

  const bilingualEntries: MetadataRoute.Sitemap = bilingualPaths.flatMap((path) => {
    const alternates = buildBilingualAlternates(path);
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates,
    }));
  });

  const legalEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/sr/podela-odgovornosti`,
    },
  ];

  return [...bilingualEntries, ...legalEntries];
}

/**
 * Builds brand and model silo entries.
 * `<lastmod>` is omitted on aggregate category pages so hard-deleting a vehicle
 * or toggling a dealer never produces an inaccurate or backward-rolling date.
 */
export function buildCategorySitemapEntries(): MetadataRoute.Sitemap {
  const brandEntries: MetadataRoute.Sitemap = BRAND_SILOS.flatMap((brand) => {
    const path = `/cars/${brand.slug}`;
    const alternates = buildBilingualAlternates(path);
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates,
    }));
  });

  const modelEntries: MetadataRoute.Sitemap = MODEL_SILOS.flatMap((model) => {
    const path = `/model/${model.slug}`;
    const alternates = buildBilingualAlternates(path);
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates,
    }));
  });

  return [...brandEntries, ...modelEntries];
}

/**
 * Builds individual vehicle detail sitemap entries with exact, verifiable
 * `vehicle.updatedAt` timestamps and `<image:loc>`.
 */
export function buildVehicleSitemapEntries(
  vehicles: readonly SitemapVehicleRecord[],
): MetadataRoute.Sitemap {
  return vehicles
    .filter((v) => isValidSitemapSlug(v.slug))
    .flatMap((v) => {
      const path = `/vehicle/${v.slug}`;
      const alternates = buildBilingualAlternates(path);
      const validImage = isValidAbsoluteHttpUrl(v.primaryImage)
        ? v.primaryImage.trim()
        : undefined;

      return LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: v.updatedAt,
        alternates,
        ...(validImage ? { images: [validImage] } : {}),
      }));
    });
}

/**
 * Deduplicates and validates final sitemap entries by canonical `<loc>` URL.
 */
export function deduplicateSitemapEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (!isValidAbsoluteHttpUrl(entry.url) || seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
}

/**
 * Builds the complete, deduplicated list of MojAutoDiler sitemap entries.
 */
export async function buildFullSitemapEntries(deps?: {
  throwOnError?: boolean;
  getVehicles?: () => Promise<SitemapVehicleRecord[]>;
  getBlogEntries?: () => Promise<MetadataRoute.Sitemap>;
}): Promise<MetadataRoute.Sitemap> {
  const throwOnError = Boolean(deps?.throwOnError);

  const [vehicles, blogEntries] = await Promise.all([
    deps?.getVehicles
      ? deps.getVehicles()
      : getVehicleSlugsForSitemap({ throwOnError }),
    deps?.getBlogEntries
      ? deps.getBlogEntries()
      : buildBlogSitemapEntries(undefined, new Date(), { throwOnError }),
  ]);

  const staticEntries = buildStaticSitemapEntries();
  const categoryEntries = buildCategorySitemapEntries();
  const vehicleEntries = buildVehicleSitemapEntries(vehicles);

  return deduplicateSitemapEntries([
    ...staticEntries,
    ...categoryEntries,
    ...vehicleEntries,
    ...blogEntries,
  ]);
}

/**
 * Serializes sitemap entries into strict W3C XML 1.0 conforming to sitemaps.org 0.9,
 * Google Image Sitemap 1.1, and XHTML hreflang extensions, with a native CSS
 * xml-stylesheet processing instruction compatible with Chrome 158+ and all modern browsers.
 */
export function serializeSitemapXml(
  entries: MetadataRoute.Sitemap,
  options?: { readonly cssHref?: string | null },
): string {
  const cssHref = options?.cssHref === undefined ? '/sitemap.css' : options.cssHref;
  const deduped = deduplicateSitemapEntries(entries);

  const hasAlternates = deduped.some(
    (e) => e.alternates?.languages && Object.keys(e.alternates.languages).length > 0,
  );
  const hasImages = deduped.some((e) => Array.isArray(e.images) && e.images.length > 0);

  const nsAttrs = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    ...(hasAlternates ? ['xmlns:xhtml="http://www.w3.org/1999/xhtml"'] : []),
    ...(hasImages ? ['xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'] : []),
  ].join(' ');

  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];
  if (cssHref) {
    lines.push(`<?xml-stylesheet type="text/css" href="${escapeXml(cssHref)}"?>`);
  }
  lines.push(`<urlset ${nsAttrs}>`);

  for (const entry of deduped) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.url.trim())}</loc>`);

    const lastmod = formatW3cDate(entry.lastModified);
    if (lastmod) {
      lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
    }

    if (entry.alternates?.languages) {
      for (const [lang, rawHref] of Object.entries(entry.alternates.languages)) {
        const href = typeof rawHref === 'string' ? rawHref.trim() : '';
        if (!isValidAbsoluteHttpUrl(href)) continue;
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
        );
      }
    }

    if (Array.isArray(entry.images)) {
      const seenImages = new Set<string>();
      for (const rawImg of entry.images) {
        const img = typeof rawImg === 'string' ? rawImg.trim() : '';
        if (!isValidAbsoluteHttpUrl(img) || seenImages.has(img)) continue;
        seenImages.add(img);
        lines.push('    <image:image>');
        lines.push(`      <image:loc>${escapeXml(img)}</image:loc>`);
        lines.push('    </image:image>');
      }
    }

    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

export const SITEMAP_CACHE_CONTROL =
  'public, max-age=0, s-maxage=60, stale-while-revalidate=240' as const;

export const SITEMAP_CDN_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=240' as const;

export async function handleSitemapGet(
  deps?: Parameters<typeof buildFullSitemapEntries>[0],
): Promise<NextResponse> {
  try {
    const entries = await buildFullSitemapEntries({
      ...deps,
      throwOnError: true,
    });
    const xml = serializeSitemapXml(entries, { cssHref: '/sitemap.css' });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': SITEMAP_CACHE_CONTROL,
        'CDN-Cache-Control': SITEMAP_CDN_CACHE_CONTROL,
        'Vercel-CDN-Cache-Control': SITEMAP_CDN_CACHE_CONTROL,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error(
      '[SITEMAP] Database unavailable — failing closed with 503:',
      err instanceof Error ? err.message : String(err),
    );
    return new NextResponse('Sitemap temporarily unavailable. Please retry shortly.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Retry-After': '60',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}
