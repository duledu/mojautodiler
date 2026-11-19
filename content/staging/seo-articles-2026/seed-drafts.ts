import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../../../lib/prisma';

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
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
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

  // Simple key-value parser for our known frontmatter shape
  const frontmatter: any = {};
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === 'true') frontmatter[key] = true;
    else if (value === 'false') frontmatter[key] = false;
    else if (value === 'null') frontmatter[key] = null;
    else frontmatter[key] = value;
  }

  return { frontmatter, content };
}

export async function seedDraftArticles() {
  console.log('--- Seeding 5 SEO Blog Draft Articles to MojAutoDiler ---');
  const stagingDir = path.resolve(__dirname);
  const files = [
    'article-01-cene-polovnih-automobila-srbija-2026.md',
    'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
    'article-03-istorija-ostecenja-polovnih-automobila.md',
    'article-04-polovni-automobili-iz-svajcarske.md',
    'article-05-dizel-benzin-ili-hibrid-2027.md',
  ];

  for (const file of files) {
    const filePath = path.join(stagingDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const { frontmatter, content } = parseMarkdownFile(filePath);

    // Find or create category
    let categoryId: string | null = null;
    if (frontmatter.categorySlug) {
      const category = await prisma.blogCategory.upsert({
        where: { slug: frontmatter.categorySlug },
        update: { name: frontmatter.categoryName || frontmatter.categorySlug },
        create: {
          slug: frontmatter.categorySlug,
          name: frontmatter.categoryName || frontmatter.categorySlug,
          description: `Kategorija ${frontmatter.categoryName || frontmatter.categorySlug} na MojAutoDiler blogu`,
        },
      });
      categoryId = category.id;
    }

    // Safe check: do not overwrite existing articles
    const existing = await prisma.blogPost.findUnique({
      where: {
        locale_slug: {
          locale: frontmatter.locale || 'sr',
          slug: frontmatter.slug,
        },
      },
    });

    if (existing) {
      console.log(`[SKIPPED] Article already exists: ${existing.slug} (ID: ${existing.id}, Status: ${existing.status}). Not overwritten.`);
      continue;
    }

    // Insert blog post as DRAFT
    const post = await prisma.blogPost.create({
      data: {
        slug: frontmatter.slug,
        locale: frontmatter.locale || 'sr',
        title: frontmatter.title,
        excerpt: frontmatter.excerpt,
        content: content,
        featuredImage: frontmatter.featuredImage,
        featuredImageAlt: frontmatter.featuredImageAlt,
        seoTitle: frontmatter.seoTitle,
        metaDescription: frontmatter.metaDescription,
        canonicalUrl: frontmatter.canonicalUrl,
        authorName: frontmatter.authorName || 'Moj Auto Diler',
        status: 'DRAFT', // Mandatory DRAFT
        publishedAt: null, // Non-published
        noindex: true, // Safeguard while in draft
        categoryId: categoryId,
        relatedBrand: frontmatter.relatedBrand || null,
        affiliateCtaEnabled: Boolean(frontmatter.affiliateCtaEnabled),
        affiliatePlacement: frontmatter.affiliatePlacement || 'none',
        affiliateLabel: frontmatter.affiliateCtaEnabled ? 'carVertical' : null,
      },
    });

    console.log(`[DRAFT CREATED] ${post.slug} (ID: ${post.id}) -> Status: ${post.status}`);
  }

  console.log('--- Successfully staged and seeded all 5 draft articles ---');
}

// If executed directly from command line
if (require.main === module) {
  seedDraftArticles()
    .catch((err) => {
      console.error('Error seeding draft articles:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
