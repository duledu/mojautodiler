import type { Metadata, MetadataRoute } from 'next';
import { serializeJsonLd } from '@/lib/blog-content';
import {
  getPublishedBlogSlugsForSitemap,
  type BlogDatabaseClient,
} from '@/lib/db/blog';
import { normalizeSiteUrl, SITE_URL } from '@/lib/site-url';
import type { BlogPostPublicDetail } from '@/types/blog';

/**
 * Centralized canonical base URL for all Blog routes.
 * Resolves to the official primary production domain (`https://www.mojautodiler.com`)
 * via NEXT_PUBLIC_BLOG_SITE_URL or NEXT_PUBLIC_SITE_URL.
 */
export const BLOG_CANONICAL_SITE_URL = process.env.NEXT_PUBLIC_BLOG_SITE_URL
  ? normalizeSiteUrl(process.env.NEXT_PUBLIC_BLOG_SITE_URL)
  : SITE_URL;

export function resolveBlogCanonicalUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BLOG_CANONICAL_SITE_URL}${normalizedPath}`;
}

export function buildBlogListingMetadata(options?: {
  categoryName?: string | null;
  categorySlug?: string | null;
  page?: number;
}): Metadata {
  const categoryName = options?.categoryName?.trim();
  const page = options?.page && options.page > 1 ? options.page : 1;

  const baseTitle = categoryName
    ? `${categoryName} — Blog i Saveti za Kupovinu Automobila`
    : 'Blog — Saveti, Vodiči za Kupovinu i Održavanje Vozila';
  const titleWithPage =
    page > 1
      ? `${baseTitle} (Strana ${page}) | Moj Auto Diler`
      : `${baseTitle} | Moj Auto Diler`;

  const description = categoryName
    ? `Stručni članci, vodiči za kupovinu i saveti iz kategorije "${categoryName}" na platformi Moj Auto Diler.`
    : 'Praktični vodiči za kupovinu polovnih automobila, provera istorije vozila, saveti za održavanje i pregled aktuelne ponude na Moj Auto Diler.';

  const canonicalUrl = resolveBlogCanonicalUrl('/sr/blog');
  const ogImageUrl = `${BLOG_CANONICAL_SITE_URL}/og-image.jpg`;

  return {
    title: { absolute: titleWithPage },
    description,
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: titleWithPage,
      description,
      type: 'website',
      locale: 'sr_RS',
      url: canonicalUrl,
      siteName: 'Moj Auto Diler',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Moj Auto Diler Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleWithPage,
      description,
      images: [ogImageUrl],
    },
  };
}

export function buildBlogPostMetadata(post: BlogPostPublicDetail): Metadata {
  const rawTitle = (post.seoTitle?.trim() || post.title).trim();
  const fullTitle = rawTitle.includes('Moj Auto Diler')
    ? rawTitle
    : `${rawTitle} | Moj Auto Diler`;
  const description = (post.metaDescription?.trim() || post.excerpt).trim();
  const canonicalUrl = post.canonicalUrl?.trim()
    ? resolveBlogCanonicalUrl(post.canonicalUrl)
    : resolveBlogCanonicalUrl(`/sr/blog/${post.slug}`);

  const image = post.ogImage || post.featuredImage;
  const resolvedImage = image
    ? resolveBlogCanonicalUrl(image)
    : `${BLOG_CANONICAL_SITE_URL}/og-image.jpg`;
  const imageAlt = post.featuredImageAlt?.trim() || post.title;

  return {
    title: { absolute: fullTitle },
    description,
    authors: [{ name: post.authorName || 'Moj Auto Diler' }],
    robots: post.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: 'article',
      locale: 'sr_RS',
      url: canonicalUrl,
      siteName: 'Moj Auto Diler',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName || 'Moj Auto Diler'],
      ...(post.category ? { section: post.category.name } : {}),
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedImage],
    },
  };
}

export function buildBlogPostingJsonLdObject(post: BlogPostPublicDetail) {
  const articleUrl = post.canonicalUrl?.trim()
    ? resolveBlogCanonicalUrl(post.canonicalUrl)
    : resolveBlogCanonicalUrl(`/sr/blog/${post.slug}`);
  const image = post.ogImage || post.featuredImage;
  const resolvedImage = image
    ? resolveBlogCanonicalUrl(image)
    : `${BLOG_CANONICAL_SITE_URL}/og-image.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: post.seoTitle?.trim() || post.title,
    description: post.metaDescription?.trim() || post.excerpt,
    image: [resolvedImage],
    inLanguage: 'sr-Latn-RS',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.authorName || 'Moj Auto Diler',
      url: BLOG_CANONICAL_SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Moj Auto Diler',
      url: BLOG_CANONICAL_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BLOG_CANONICAL_SITE_URL}/brand-logo.png`,
      },
    },
    ...(post.category ? { articleSection: post.category.name } : {}),
  };
}

export function buildBlogBreadcrumbJsonLdObject(post: BlogPostPublicDetail) {
  const items: Array<{ name: string; url: string }> = [
    { name: 'Početna', url: `${BLOG_CANONICAL_SITE_URL}/sr` },
    { name: 'Blog', url: `${BLOG_CANONICAL_SITE_URL}/sr/blog` },
  ];

  if (post.category) {
    items.push({
      name: post.category.name,
      url: `${BLOG_CANONICAL_SITE_URL}/sr/blog?category=${encodeURIComponent(post.category.slug)}`,
    });
  }

  items.push({
    name: post.title,
    url: `${BLOG_CANONICAL_SITE_URL}/sr/blog/${post.slug}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serializeBlogPostingJsonLd(post: BlogPostPublicDetail): string {
  return serializeJsonLd(buildBlogPostingJsonLdObject(post));
}

export function serializeBlogBreadcrumbJsonLd(
  post: BlogPostPublicDetail,
): string {
  return serializeJsonLd(buildBlogBreadcrumbJsonLdObject(post));
}

/**
 * Generates sitemap entries for the Serbian Blog listing page (`/sr/blog`) and
 * all published, indexable (`noindex: false`, `publishedAt <= now`) blog articles.
 */
export async function buildBlogSitemapEntries(
  db?: BlogDatabaseClient,
  now: Date = new Date(),
): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await getPublishedBlogSlugsForSitemap(db, now);

  const listingEntry: MetadataRoute.Sitemap[number] = {
    url: `${BLOG_CANONICAL_SITE_URL}/sr/blog`,
    lastModified: publishedPosts[0]?.updatedAt ?? now,
    changeFrequency: 'daily',
    priority: 0.8,
  };

  const articleEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${BLOG_CANONICAL_SITE_URL}/sr/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [listingEntry, ...articleEntries];
}
