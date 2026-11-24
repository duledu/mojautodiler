/**
 * Centralized source of truth for the official production site origin.
 *
 * All canonical URLs, hreflang alternates, XML sitemap entries, Open Graph URLs,
 * JSON-LD identifiers, and share/marketing links resolve through this module.
 *
 * Official primary production domain: https://www.mojautodiler.com
 */

export const DEFAULT_SITE_URL = 'https://www.mojautodiler.com';

const CANONICAL_HOST_ALIASES = new Set([
  'mojautodiler.com',
  'www.mojautodiler.com',
]);

export function normalizeSiteUrl(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return DEFAULT_SITE_URL;
    }
    if (CANONICAL_HOST_ALIASES.has(parsed.hostname.toLowerCase())) {
      return DEFAULT_SITE_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function toAbsoluteSiteUrl(
  pathOrUrl: string,
  baseUrl: string = SITE_URL,
): string {
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${normalizedBase}${normalizedPath}`;
}
