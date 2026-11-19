import type { Vehicle } from '@/types/vehicle';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type BlogLocale = 'sr';

export type AffiliatePlacement = 'none' | 'inline' | 'bottom' | 'both';

// ─── Structured Article Content Model (Safe Allowlisted AST) ──────────────────

export type BlogHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface BlogTextMarks {
  bold?: boolean;
  italic?: boolean;
}

export interface BlogTextNode extends BlogTextMarks {
  type: 'text';
  text: string;
}

export interface BlogLinkNode extends BlogTextMarks {
  type: 'link';
  href: string;
  text: string;
  sponsored?: boolean;
  openInNewTab?: boolean;
}

export type BlogInlineNode = BlogTextNode | BlogLinkNode;

export interface BlogHeadingBlock {
  type: 'heading';
  level: BlogHeadingLevel;
  children: BlogInlineNode[];
}

export interface BlogParagraphBlock {
  type: 'paragraph';
  children: BlogInlineNode[];
}

export interface BlogListBlock {
  type: 'list';
  style: 'ordered' | 'unordered';
  items: BlogInlineNode[][];
}

export interface BlogBlockquoteBlock {
  type: 'blockquote';
  children: BlogInlineNode[];
  citation?: string;
}

export interface BlogImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  r2Key?: string;
}

export interface BlogTableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export type BlogContentBlock =
  | BlogHeadingBlock
  | BlogParagraphBlock
  | BlogListBlock
  | BlogBlockquoteBlock
  | BlogImageBlock
  | BlogTableBlock;

export interface BlogContentDocument {
  version: 1;
  blocks: BlogContentBlock[];
}

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogRelatedPostSummary {
  id: string;
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  category: BlogCategory | null;
  publishedAt: string | null;
}

export interface BlogPostPublicSummary {
  id: string;
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  category: BlogCategory | null;
  publishedAt: string;
  updatedAt: string;
}

export interface BlogPostPublicDetail extends BlogPostPublicSummary {
  content: BlogContentDocument;
  seoTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  relatedBrand: string | null;
  relatedModel: string | null;
  affiliateCtaEnabled: boolean;
  affiliatePlacement: AffiliatePlacement;
  affiliateLabel: string | null;
  relatedVehicles: Vehicle[];
  relatedPosts: BlogRelatedPostSummary[];
}

export interface BlogPostAdminSummary {
  id: string;
  trackingId?: string | null;
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  authorName: string;
  categoryId: string | null;
  category: BlogCategory | null;
  status: BlogPostStatus;
  noindex: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostAdminDetail extends BlogPostAdminSummary {
  content: BlogContentDocument;
  rawContent: string;
  featuredImageR2Key: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  relatedBrand: string | null;
  relatedModel: string | null;
  affiliateCtaEnabled: boolean;
  affiliatePlacement: AffiliatePlacement;
  affiliateLabel: string | null;
  relatedVehicleIds: string[];
  relatedPostIds: string[];
}

export type BlogPost = BlogPostAdminDetail;

// ─── Input & Query Contracts ──────────────────────────────────────────────────

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  locale?: BlogLocale;
  excerpt: string;
  content: BlogContentDocument | string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  featuredImageR2Key?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  authorName?: string;
  categoryId?: string | null;
  status?: BlogPostStatus;
  publishedAt?: Date | string | null;
  relatedBrand?: string | null;
  relatedModel?: string | null;
  affiliateCtaEnabled?: boolean;
  affiliatePlacement?: AffiliatePlacement;
  affiliateLabel?: string | null;
  relatedVehicleIds?: string[];
  relatedPostIds?: string[];
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: BlogContentDocument | string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  featuredImageR2Key?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  authorName?: string;
  categoryId?: string | null;
  status?: BlogPostStatus;
  publishedAt?: Date | string | null;
  relatedBrand?: string | null;
  relatedModel?: string | null;
  affiliateCtaEnabled?: boolean;
  affiliatePlacement?: AffiliatePlacement;
  affiliateLabel?: string | null;
  relatedVehicleIds?: string[];
  relatedPostIds?: string[];
}

export interface BlogPostAdminListOptions {
  status?: BlogPostStatus;
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface BlogPostPublicListOptions {
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedBlogResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
