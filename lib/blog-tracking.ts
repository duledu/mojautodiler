/**
 * Centralized internal editorial tracking system for MojAutoDiler blog articles.
 *
 * Provides persistent tracking identifiers (BLOG-001, BLOG-002, etc.) for internal
 * editorial workflows, draft tracking, and content documentation without altering
 * public URLs, SEO slugs, or database primary keys.
 */

export interface BlogTrackingEntry {
  readonly trackingId: string;
  readonly articleNumber: number;
  readonly slug: string;
  readonly draftFile: string;
  readonly legacyId?: string;
}

export const KNOWN_BLOG_TRACKING_ENTRIES: readonly BlogTrackingEntry[] = [
  {
    trackingId: 'BLOG-001',
    articleNumber: 1,
    slug: 'cene-polovnih-automobila-u-srbiji-2026',
    draftFile: 'article-01-cene-polovnih-automobila-srbija-2026.md',
    legacyId: 'art-2026-001',
  },
  {
    trackingId: 'BLOG-002',
    articleNumber: 2,
    slug: 'vracena-kilometraza-kako-prepoznati-prevaru',
    draftFile: 'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
    legacyId: 'art-2026-002',
  },
  {
    trackingId: 'BLOG-003',
    articleNumber: 3,
    slug: 'istorija-ostecenja-polovnih-automobila',
    draftFile: 'article-03-istorija-ostecenja-polovnih-automobila.md',
    legacyId: 'art-2026-003',
  },
  {
    trackingId: 'BLOG-004',
    articleNumber: 4,
    slug: 'polovni-automobili-iz-svajcarske',
    draftFile: 'article-04-polovni-automobili-iz-svajcarske.md',
    legacyId: 'art-2026-004',
  },
  {
    trackingId: 'BLOG-005',
    articleNumber: 5,
    slug: 'dizel-benzin-ili-hibrid-2027',
    draftFile: 'article-05-dizel-benzin-ili-hibrid-2027.md',
    legacyId: 'art-2026-005',
  },
];

const SLUG_TO_TRACKING_MAP: Record<string, string> = {};
const LEGACY_ID_TO_TRACKING_MAP: Record<string, string> = {};

for (const entry of KNOWN_BLOG_TRACKING_ENTRIES) {
  SLUG_TO_TRACKING_MAP[entry.slug] = entry.trackingId;
  if (entry.legacyId) {
    LEGACY_ID_TO_TRACKING_MAP[entry.legacyId] = entry.trackingId;
  }
}

/**
 * Format an integer number into standard BLOG-XXX identifier.
 * Example: 1 -> "BLOG-001", 12 -> "BLOG-012"
 */
export function formatBlogTrackingId(num: number): string {
  if (!Number.isFinite(num) || num < 1) {
    throw new Error(`Invalid blog article number: ${num}. Must be a positive integer.`);
  }
  return `BLOG-${String(Math.floor(num)).padStart(3, '0')}`;
}

/**
 * Parses a tracking identifier into its numeric component.
 * Example: "BLOG-001" -> 1, "invalid" -> null
 */
export function parseBlogTrackingId(trackingId: string | null | undefined): number | null {
  if (!trackingId || typeof trackingId !== 'string') return null;
  const match = trackingId.trim().toUpperCase().match(/^BLOG-(\d{3,})$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return Number.isFinite(num) ? num : null;
}

/**
 * Resolves the internal tracking identifier (e.g. "BLOG-001") for a blog post.
 * Accepts a post object (with slug/id), a slug string, or a legacy ID string.
 */
export function getBlogTrackingId(
  target:
    | {
        readonly id?: string | null;
        readonly slug?: string | null;
        readonly trackingId?: string | null;
      }
    | string
    | null
    | undefined,
): string | null {
  if (!target) return null;

  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (trimmed.toUpperCase().startsWith('BLOG-')) {
      return trimmed.toUpperCase();
    }
    if (SLUG_TO_TRACKING_MAP[trimmed]) {
      return SLUG_TO_TRACKING_MAP[trimmed];
    }
    if (LEGACY_ID_TO_TRACKING_MAP[trimmed]) {
      return LEGACY_ID_TO_TRACKING_MAP[trimmed];
    }
    return null;
  }

  if (target.trackingId && typeof target.trackingId === 'string' && target.trackingId.trim()) {
    return target.trackingId.trim().toUpperCase();
  }

  if (target.slug && SLUG_TO_TRACKING_MAP[target.slug.trim()]) {
    return SLUG_TO_TRACKING_MAP[target.slug.trim()];
  }

  if (target.id && LEGACY_ID_TO_TRACKING_MAP[target.id.trim()]) {
    return LEGACY_ID_TO_TRACKING_MAP[target.id.trim()];
  }

  return null;
}

/**
 * Computes the next available internal tracking ID without duplicating existing identifiers.
 *
 * Scans known static entries and any provided runtime posts to find the highest
 * registered number and returns the subsequent BLOG-XXX string.
 */
export function getNextBlogTrackingId(
  existingPosts?: Array<
    | {
        readonly id?: string | null;
        readonly slug?: string | null;
        readonly trackingId?: string | null;
      }
    | string
  >,
): string {
  let highest = 0;

  for (const entry of KNOWN_BLOG_TRACKING_ENTRIES) {
    if (entry.articleNumber > highest) {
      highest = entry.articleNumber;
    }
  }

  if (existingPosts && Array.isArray(existingPosts)) {
    for (const item of existingPosts) {
      const trackingId = getBlogTrackingId(item);
      const num = parseBlogTrackingId(trackingId);
      if (num && num > highest) {
        highest = num;
      }
    }
  }

  return formatBlogTrackingId(highest + 1);
}
