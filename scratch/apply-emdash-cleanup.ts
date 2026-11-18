import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../lib/prisma';
import { serializeBlogContent, validateAndNormalizeBlogContent } from '../lib/blog-content';
import { markdownToBlogDocument } from './test-markdown-parser';

interface TargetPost {
  id: string;
  slug: string;
  file: string;
}

const TARGETS: TargetPost[] = [
  {
    id: 'cmwlwjzks0002uk5kzjgg1mtz',
    slug: 'cene-polovnih-automobila-u-srbiji-2026',
    file: 'article-01-cene-polovnih-automobila-srbija-2026.md',
  },
  {
    id: 'cmwlwjzoi0005uk5k08qbp41s',
    slug: 'vracena-kilometraza-kako-prepoznati-prevaru',
    file: 'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
  },
  {
    id: 'cmwlwjzrb0008uk5kpqx8d2ce',
    slug: 'istorija-ostecenja-polovnih-automobila',
    file: 'article-03-istorija-ostecenja-polovnih-automobila.md',
  },
  {
    id: 'cmwlwjzu4000buk5k42ai64pz',
    slug: 'polovni-automobili-iz-svajcarske',
    file: 'article-04-polovni-automobili-iz-svajcarske.md',
  },
  {
    id: 'cmwlwjzwx000euk5knm79nwcf',
    slug: 'dizel-benzin-ili-hibrid-2027',
    file: 'article-05-dizel-benzin-ili-hibrid-2027.md',
  },
];

export async function applyCleanup() {
  console.log('=== APPLYING EDITORIAL CLEANUP TO 5 DRAFT BLOG POSTS ===');
  const stagingDir = path.resolve('content/staging/seo-articles-2026');

  for (const target of TARGETS) {
    const filePath = path.join(stagingDir, target.file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const body = raw.replace(/^---[\s\S]*?---\r?\n/, '');

    const doc = markdownToBlogDocument(body);
    const serialized = serializeBlogContent(doc);

    // Verify 0 em dashes in serialized content
    const emdashCount = (serialized.match(/\u2014/g) || []).length;
    if (emdashCount > 0) {
      throw new Error(`Safety violation: serialized content for ${target.slug} still contains ${emdashCount} em dashes.`);
    }

    const updated = await prisma.blogPost.update({
      where: { id: target.id },
      data: {
        content: serialized,
        status: 'DRAFT',
        publishedAt: null,
        noindex: true,
      },
      select: {
        id: true,
        slug: true,
        status: true,
        publishedAt: true,
        noindex: true,
      },
    });

    console.log(`[UPDATED] ${updated.slug} (${updated.id}) -> Status: ${updated.status}, noindex: ${updated.noindex}`);
  }

  console.log('=== All 5 blog drafts successfully updated in Neon DB ===');
}

if (require.main === module) {
  applyCleanup()
    .catch((err) => {
      console.error('Update failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
