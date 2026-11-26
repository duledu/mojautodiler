import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../../../lib/prisma';
import { serializeBlogContent } from '../../../lib/blog-content';
import { markdownToBlogDocument } from '../../../scratch/test-markdown-parser';

/**
 * Safe staging seed script for Batch 2 SEO Draft Articles (BLOG-006 through BLOG-010).
 *
 * IMPORTANT SAFETY GUARDRAIL:
 * - Never run this script without explicit production owner approval.
 * - Requires passing `--confirm-seed` CLI flag to execute database writes.
 * - Inserts articles strictly as `status: 'DRAFT'`, `publishedAt: null`, `noindex: true`,
 *   storing validated structured AST JSON (`BlogContentDocument` v1).
 */

interface Frontmatter {
  id: string;
  trackingId?: string;
  slug: string;
  locale?: string;
  title: string;
  excerpt: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorName?: string;
  categorySlug?: string;
  categoryName?: string;
  relatedBrand?: string;
  affiliateCtaEnabled?: boolean;
  affiliatePlacement?: string;
}

function parseMarkdownFile(filePath: string): { frontmatter: Frontmatter; content: string } {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`File ${filePath} does not contain valid YAML frontmatter`);
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === 'true') frontmatter[key] = true;
    else if (value === 'false') frontmatter[key] = false;
    else if (value === 'null') frontmatter[key] = null;
    else if (!Number.isNaN(Number(value)) && value !== '') frontmatter[key] = Number(value);
    else frontmatter[key] = value;
  }

  return { frontmatter: frontmatter as unknown as Frontmatter, content };
}

export async function seedBatch2DraftArticles() {
  if (!process.argv.includes('--confirm-seed')) {
    throw new Error(
      'Safety guard: pass --confirm-seed only after explicit owner approval to write DRAFT posts to the database.',
    );
  }

  const stagingDir = __dirname;
  const articleFiles = [
    'article-06-kupovina-na-ime-kupca-auto-plac-fizicko-lice-ili-uvoz.md',
    'article-07-automatski-menjac-polovni-automobili-dsg-zf-s-tronic.md',
    'article-08-kako-pregledati-polovan-automobil-pre-kupovine-cek-lista.md',
    'article-09-prvi-servis-i-skriveni-troskovi-posle-kupovine-polovnjaka.md',
    'article-10-koji-motor-izabrati-a-koji-izbegavati-polovni-automobili.md',
  ];

  const categoriesToEnsure = [
    { slug: 'saveti-za-kupovinu', name: 'Saveti za kupovinu' },
    { slug: 'bezbednost-i-provera', name: 'Bezbednost i provera' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesToEnsure) {
    const record = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, name: cat.name },
    });
    categoryMap.set(cat.slug, record.id);
  }

  for (const fileName of articleFiles) {
    const fullPath = path.join(stagingDir, fileName);
    const { frontmatter, content } = parseMarkdownFile(fullPath);
    const structuredJson = serializeBlogContent(markdownToBlogDocument(content));

    const existing = await prisma.blogPost.findUnique({
      where: {
        locale_slug: {
          locale: frontmatter.locale || 'sr',
          slug: frontmatter.slug,
        },
      },
    });

    if (existing) {
      console.log(`[SKIPPED] Already exists: ${existing.slug} (${existing.status})`);
      continue;
    }

    const post = await prisma.blogPost.create({
      data: {
        slug: frontmatter.slug,
        locale: frontmatter.locale || 'sr',
        title: frontmatter.title,
        excerpt: frontmatter.excerpt,
        content: structuredJson,
        featuredImage: frontmatter.featuredImage,
        featuredImageAlt: frontmatter.featuredImageAlt,
        seoTitle: frontmatter.seoTitle,
        metaDescription: frontmatter.metaDescription,
        canonicalUrl: frontmatter.canonicalUrl,
        authorName: frontmatter.authorName || 'Moj Auto Diler',
        status: 'DRAFT',
        publishedAt: null,
        noindex: true,
        categoryId: frontmatter.categorySlug
          ? categoryMap.get(frontmatter.categorySlug) ?? null
          : null,
        relatedBrand: frontmatter.relatedBrand || null,
        affiliateCtaEnabled: Boolean(frontmatter.affiliateCtaEnabled),
        affiliatePlacement: frontmatter.affiliatePlacement || 'none',
        affiliateLabel: frontmatter.affiliateCtaEnabled ? 'carVertical' : null,
      },
    });

    console.log(`[DRAFT CREATED] ${post.slug} (${post.id}) -> ${post.status}`);
  }
}

if (require.main === module) {
  seedBatch2DraftArticles()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
