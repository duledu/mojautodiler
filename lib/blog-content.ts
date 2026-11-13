import type {
  AffiliatePlacement,
  BlogBlockquoteBlock,
  BlogContentBlock,
  BlogContentDocument,
  BlogHeadingBlock,
  BlogHeadingLevel,
  BlogImageBlock,
  BlogInlineNode,
  BlogLinkNode,
  BlogListBlock,
  BlogParagraphBlock,
  BlogTableBlock,
  BlogTextNode,
} from '@/types/blog';

export class BlogContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlogContentValidationError';
  }
}

const MAX_BLOCKS = 250;
const MAX_INLINE_NODES_PER_CONTAINER = 200;
const MAX_LIST_ITEMS = 200;
const MAX_TABLE_COLUMNS = 12;
const MAX_TABLE_ROWS = 200;
const MAX_TEXT_LENGTH = 20_000;

const ALLOWED_HEADING_LEVELS = new Set<number>([2, 3, 4, 5, 6]);
const ALLOWED_AFFILIATE_PLACEMENTS = new Set<AffiliatePlacement>([
  'none',
  'inline',
  'bottom',
  'both',
]);

/**
 * Detects dangerous raw HTML / XSS payloads inside structured text fields.
 * Even though structured blocks are rendered via React components (never
 * dangerouslySetInnerHTML), rejecting raw executable HTML tags and inline
 * event attributes at validation time provides defense-in-depth.
 */
const DANGEROUS_HTML_PATTERN =
  /<\s*\/?\s*(script|iframe|object|embed|style|svg|math|form|input|button|textarea|select|meta|link|base)\b|\bon[a-z]{2,}\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html/i;

export function assertSafeText(value: string, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new BlogContentValidationError(`${fieldName} must be a string.`);
  }
  if (value.length > MAX_TEXT_LENGTH) {
    throw new BlogContentValidationError(
      `${fieldName} exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`,
    );
  }
  if (DANGEROUS_HTML_PATTERN.test(value)) {
    throw new BlogContentValidationError(
      `${fieldName} contains disallowed HTML tags, script payloads, or event handlers.`,
    );
  }
  return value;
}

/**
 * Validates and normalizes a URL for blog links.
 * Allows:
 *   - Internal site paths starting with a single `/` (e.g. `/sr/vozila`, `/sr/blog/test`)
 *   - Fragment links starting with `#` (e.g. `#sekcija-1`)
 *   - Absolute `https:` and `http:` URLs
 *   - `mailto:` and `tel:` URLs
 * Rejects:
 *   - `javascript:`, `data:`, `vbscript:`, `file:`, `blob:`
 *   - Protocol-relative URLs (`//evil.example`)
 *   - Control characters and whitespace smuggling
 */
export function sanitizeBlogLinkUrl(raw: string): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/[\u0000-\u001F\u007F]+/g, '');
  if (!trimmed) return null;

  // Reject protocol-relative URLs
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }

  // Internal relative path
  if (trimmed.startsWith('/')) {
    if (DANGEROUS_HTML_PATTERN.test(trimmed)) return null;
    return trimmed;
  }

  // Same-page anchor
  if (trimmed.startsWith('#')) {
    if (trimmed.length < 2 || DANGEROUS_HTML_PATTERN.test(trimmed)) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (
      protocol === 'https:' ||
      protocol === 'http:' ||
      protocol === 'mailto:' ||
      protocol === 'tel:'
    ) {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates and normalizes an image URL for blog featured, OG, or inline images.
 * Allows only `https:`, `http:`, or single-slash internal paths `/...`.
 * Rejects `javascript:`, `data:`, `vbscript:`, `blob:`, and `//` URLs.
 */
export function sanitizeBlogImageUrl(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/[\u0000-\u001F\u007F]+/g, '');
  if (!trimmed) return null;

  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }

  if (trimmed.startsWith('/')) {
    if (DANGEROUS_HTML_PATTERN.test(trimmed)) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:' || protocol === 'http:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

const INTERNAL_HOSTS = new Set([
  'mojautodiler.com',
  'www.mojautodiler.com',
  'mojautodiler.rs',
  'www.mojautodiler.rs',
]);

export function isInternalBlogUrl(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  if (href.startsWith('#')) return true;
  try {
    const parsed = new URL(href);
    return INTERNAL_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export interface SafeLinkAttributes {
  href: string;
  target?: '_blank';
  rel?: string;
}

/**
 * Computes safe anchor attributes (`href`, `target`, `rel`).
 * - External links always receive `rel="noopener noreferrer"` (and `target="_blank"` by default).
 * - Sponsored / affiliate links receive `rel="sponsored noopener noreferrer"` and `target="_blank"`.
 */
export function resolveSafeLinkAttributes(
  rawHref: string,
  options?: { sponsored?: boolean; openInNewTab?: boolean },
): SafeLinkAttributes {
  const safeHref = sanitizeBlogLinkUrl(rawHref);
  if (!safeHref) {
    throw new BlogContentValidationError(`Unsafe or invalid link URL: "${rawHref}".`);
  }

  const isInternal = isInternalBlogUrl(safeHref);
  const isSponsored = Boolean(options?.sponsored);
  const openInNewTab = options?.openInNewTab ?? (!isInternal || isSponsored);

  const relTokens = new Set<string>();
  if (isSponsored) {
    relTokens.add('sponsored');
    relTokens.add('noopener');
    relTokens.add('noreferrer');
  } else if (!isInternal || openInNewTab) {
    relTokens.add('noopener');
    relTokens.add('noreferrer');
  }

  const result: SafeLinkAttributes = { href: safeHref };
  if (openInNewTab) {
    result.target = '_blank';
  }
  if (relTokens.size > 0) {
    result.rel = Array.from(relTokens).join(' ');
  }
  return result;
}

// ─── Structured AST Validation & Normalization ────────────────────────────────

function validateInlineNode(raw: unknown, path: string): BlogInlineNode {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BlogContentValidationError(`${path} must be an inline node object.`);
  }

  const node = raw as Record<string, unknown>;
  const bold = node.bold === true ? true : undefined;
  const italic = node.italic === true ? true : undefined;

  if (node.type === 'text') {
    const text = assertSafeText(String(node.text ?? ''), `${path}.text`);
    const normalized: BlogTextNode = { type: 'text', text };
    if (bold) normalized.bold = true;
    if (italic) normalized.italic = true;
    return normalized;
  }

  if (node.type === 'link') {
    const text = assertSafeText(String(node.text ?? ''), `${path}.text`).trim();
    if (!text) {
      throw new BlogContentValidationError(`${path}.text cannot be empty for a link.`);
    }
    const rawHref = typeof node.href === 'string' ? node.href : '';
    const safeHref = sanitizeBlogLinkUrl(rawHref);
    if (!safeHref) {
      throw new BlogContentValidationError(`${path}.href contains an invalid or unsafe URL.`);
    }
    const normalized: BlogLinkNode = {
      type: 'link',
      href: safeHref,
      text,
    };
    if (bold) normalized.bold = true;
    if (italic) normalized.italic = true;
    if (node.sponsored === true) normalized.sponsored = true;
    if (typeof node.openInNewTab === 'boolean') normalized.openInNewTab = node.openInNewTab;
    return normalized;
  }

  throw new BlogContentValidationError(
    `${path}.type "${String(node.type)}" is not an allowed inline node type.`,
  );
}

function validateInlineChildren(raw: unknown, path: string): BlogInlineNode[] {
  if (!Array.isArray(raw)) {
    throw new BlogContentValidationError(`${path} must be an array of inline nodes.`);
  }
  if (raw.length === 0) {
    throw new BlogContentValidationError(`${path} cannot be empty.`);
  }
  if (raw.length > MAX_INLINE_NODES_PER_CONTAINER) {
    throw new BlogContentValidationError(
      `${path} exceeds maximum of ${MAX_INLINE_NODES_PER_CONTAINER} inline nodes.`,
    );
  }
  return raw.map((item, idx) => validateInlineNode(item, `${path}[${idx}]`));
}

function validateBlock(raw: unknown, index: number): BlogContentBlock {
  const path = `blocks[${index}]`;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BlogContentValidationError(`${path} must be a block object.`);
  }

  const block = raw as Record<string, unknown>;
  const type = block.type;

  switch (type) {
    case 'heading': {
      const level = Number(block.level);
      if (!Number.isInteger(level) || !ALLOWED_HEADING_LEVELS.has(level)) {
        throw new BlogContentValidationError(
          `${path}.level must be an integer between 2 and 6 (H2–H6).`,
        );
      }
      const children = validateInlineChildren(block.children, `${path}.children`);
      const normalized: BlogHeadingBlock = {
        type: 'heading',
        level: level as BlogHeadingLevel,
        children,
      };
      return normalized;
    }

    case 'paragraph': {
      const children = validateInlineChildren(block.children, `${path}.children`);
      const normalized: BlogParagraphBlock = {
        type: 'paragraph',
        children,
      };
      return normalized;
    }

    case 'list': {
      const style = block.style;
      if (style !== 'ordered' && style !== 'unordered') {
        throw new BlogContentValidationError(
          `${path}.style must be "ordered" or "unordered".`,
        );
      }
      if (!Array.isArray(block.items) || block.items.length === 0) {
        throw new BlogContentValidationError(`${path}.items must be a non-empty array.`);
      }
      if (block.items.length > MAX_LIST_ITEMS) {
        throw new BlogContentValidationError(
          `${path}.items exceeds maximum of ${MAX_LIST_ITEMS} items.`,
        );
      }
      const items = block.items.map((item, itemIdx) =>
        validateInlineChildren(item, `${path}.items[${itemIdx}]`),
      );
      const normalized: BlogListBlock = {
        type: 'list',
        style,
        items,
      };
      return normalized;
    }

    case 'blockquote': {
      const children = validateInlineChildren(block.children, `${path}.children`);
      const normalized: BlogBlockquoteBlock = {
        type: 'blockquote',
        children,
      };
      if (block.citation !== undefined && block.citation !== null) {
        const citation = assertSafeText(String(block.citation), `${path}.citation`).trim();
        if (citation) normalized.citation = citation;
      }
      return normalized;
    }

    case 'image': {
      const rawSrc = typeof block.src === 'string' ? block.src : '';
      const safeSrc = sanitizeBlogImageUrl(rawSrc);
      if (!safeSrc) {
        throw new BlogContentValidationError(
          `${path}.src must be a valid HTTP(S) or root-relative image URL.`,
        );
      }
      const alt = assertSafeText(String(block.alt ?? ''), `${path}.alt`).trim();
      if (!alt) {
        throw new BlogContentValidationError(
          `${path}.alt is required for accessibility and SEO.`,
        );
      }
      const normalized: BlogImageBlock = {
        type: 'image',
        src: safeSrc,
        alt,
      };
      if (block.caption !== undefined && block.caption !== null) {
        const caption = assertSafeText(String(block.caption), `${path}.caption`).trim();
        if (caption) normalized.caption = caption;
      }
      if (typeof block.r2Key === 'string' && block.r2Key.trim()) {
        normalized.r2Key = assertSafeText(block.r2Key.trim(), `${path}.r2Key`);
      }
      return normalized;
    }

    case 'table': {
      if (!Array.isArray(block.headers) || block.headers.length === 0) {
        throw new BlogContentValidationError(`${path}.headers must be a non-empty string array.`);
      }
      if (block.headers.length > MAX_TABLE_COLUMNS) {
        throw new BlogContentValidationError(
          `${path}.headers exceeds maximum of ${MAX_TABLE_COLUMNS} columns.`,
        );
      }
      const headers = block.headers.map((h, colIdx) =>
        assertSafeText(String(h ?? ''), `${path}.headers[${colIdx}]`).trim(),
      );

      if (!Array.isArray(block.rows) || block.rows.length === 0) {
        throw new BlogContentValidationError(`${path}.rows must be a non-empty array of rows.`);
      }
      if (block.rows.length > MAX_TABLE_ROWS) {
        throw new BlogContentValidationError(
          `${path}.rows exceeds maximum of ${MAX_TABLE_ROWS} rows.`,
        );
      }

      const rows = block.rows.map((row, rowIdx) => {
        if (!Array.isArray(row) || row.length !== headers.length) {
          throw new BlogContentValidationError(
            `${path}.rows[${rowIdx}] must have exactly ${headers.length} cells matching headers.`,
          );
        }
        return row.map((cell, cellIdx) =>
          assertSafeText(String(cell ?? ''), `${path}.rows[${rowIdx}][${cellIdx}]`).trim(),
        );
      });

      const normalized: BlogTableBlock = {
        type: 'table',
        headers,
        rows,
      };
      if (block.caption !== undefined && block.caption !== null) {
        const caption = assertSafeText(String(block.caption), `${path}.caption`).trim();
        if (caption) normalized.caption = caption;
      }
      return normalized;
    }

    default:
      throw new BlogContentValidationError(
        `${path}.type "${String(type)}" is not an allowed content block type.`,
      );
  }
}

/**
 * Validates and normalizes structured blog content (accepting either a parsed
 * object or a serialized JSON string). Throws `BlogContentValidationError` on
 * malformed input, disallowed block types, unsafe URLs, or injected HTML/scripts.
 */
export function validateAndNormalizeBlogContent(
  input: unknown,
): BlogContentDocument {
  let parsed: unknown = input;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new BlogContentValidationError('Article content cannot be empty.');
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new BlogContentValidationError(
        'Article content must be valid structured JSON (version 1). Raw HTML is not allowed.',
      );
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BlogContentValidationError('Article content must be a JSON object.');
  }

  const doc = parsed as Record<string, unknown>;
  if (doc.version !== 1) {
    throw new BlogContentValidationError('Article content version must be 1.');
  }

  if (!Array.isArray(doc.blocks) || doc.blocks.length === 0) {
    throw new BlogContentValidationError('Article content must contain at least one block.');
  }

  if (doc.blocks.length > MAX_BLOCKS) {
    throw new BlogContentValidationError(
      `Article content exceeds maximum of ${MAX_BLOCKS} blocks.`,
    );
  }

  const blocks = doc.blocks.map((block, index) => validateBlock(block, index));
  return {
    version: 1,
    blocks,
  };
}

/**
 * Validates and serializes blog content for database persistence.
 */
export function serializeBlogContent(input: unknown): string {
  const normalized = validateAndNormalizeBlogContent(input);
  return JSON.stringify(normalized);
}

/**
 * Safely parses stored database JSON content into a validated `BlogContentDocument`.
 * Returns an empty document fallback only if `fallbackOnCorrupt` is true.
 */
export function parseBlogContent(
  raw: string,
  options?: { fallbackOnCorrupt?: boolean },
): BlogContentDocument {
  try {
    return validateAndNormalizeBlogContent(raw);
  } catch (err) {
    if (options?.fallbackOnCorrupt) {
      return { version: 1, blocks: [] };
    }
    throw err;
  }
}

/**
 * Extracts all image URLs from a structured blog content document.
 * Used by R2 cleanup to protect inline article images.
 */
export function extractBlogContentImageUrls(rawOrDoc: string | BlogContentDocument): string[] {
  try {
    const doc =
      typeof rawOrDoc === 'string'
        ? parseBlogContent(rawOrDoc, { fallbackOnCorrupt: true })
        : rawOrDoc;
    const urls: string[] = [];
    for (const block of doc.blocks) {
      if (block.type === 'image' && block.src) {
        urls.push(block.src);
      }
    }
    return urls;
  } catch {
    return [];
  }
}

export function validateAffiliatePlacement(value: unknown): AffiliatePlacement {
  if (value === undefined || value === null || value === '') return 'none';
  if (typeof value === 'string' && ALLOWED_AFFILIATE_PLACEMENTS.has(value as AffiliatePlacement)) {
    return value as AffiliatePlacement;
  }
  throw new BlogContentValidationError(
    `Invalid affiliatePlacement "${String(value)}". Allowed values: none, inline, bottom, both.`,
  );
}

/**
 * Safely serializes structured data for `<script type="application/ld+json">`.
 * Escapes `<`, `>`, `&`, and line separators so user/article fields can never
 * break out of a `<script>` tag via `</script>` or `<!--`.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
