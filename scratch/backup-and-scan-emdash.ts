import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../lib/prisma';

async function main() {
  const ids = [
    'cmwlwjzks0002uk5kzjgg1mtz',
    'cmwlwjzoi0005uk5k08qbp41s',
    'cmwlwjzrb0008uk5kpqx8d2ce',
    'cmwlwjzu4000buk5k42ai64pz',
    'cmwlwjzwx000euk5knm79nwcf',
  ];

  console.log('Fetching 5 blog posts from Neon DB...');
  const posts = await prisma.blogPost.findMany({
    where: { id: { in: ids } },
    include: {
      category: true,
    },
  });

  console.log(`Fetched ${posts.length} posts.`);
  if (posts.length !== 5) {
    console.warn(`WARNING: expected 5 posts, found ${posts.length}`);
  }

  const backupDir = path.join(process.cwd(), 'content/staging/seo-articles-2026/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, 'blog_posts_pre_emdash_cleanup_20261118.json');
  fs.writeFileSync(backupPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`Backup saved to ${backupPath} (${fs.statSync(backupPath).size} bytes).`);

  // Scan DB posts for em dash (Unicode \u2014)
  console.log('\n--- SCANNING DB RECORDS FOR EM DASH (—) ---');
  let totalDbEmdashCount = 0;
  for (const post of posts) {
    let postCount = 0;
    const fieldsToScan: Record<string, string | null | undefined> = {
      title: post.title,
      excerpt: post.excerpt,
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      featuredImageAlt: post.featuredImageAlt,
      content: post.content,
    };

    console.log(`\nPost ID: ${post.id} | Slug: ${post.slug}`);
    for (const [field, val] of Object.entries(fieldsToScan)) {
      if (!val) continue;
      const count = (val.match(/\u2014/g) || []).length;
      if (count > 0) {
        console.log(`  - Field '${field}': ${count} em dashes`);
        postCount += count;
      }
    }
    console.log(`  Total for post ${post.slug}: ${postCount}`);
    totalDbEmdashCount += postCount;
  }
  console.log(`\nTotal em dashes in database records: ${totalDbEmdashCount}`);

  // Scan local markdown files
  console.log('\n--- SCANNING LOCAL MARKDOWN FILES FOR EM DASH (—) ---');
  const stagingDir = path.join(process.cwd(), 'content/staging/seo-articles-2026');
  const mdFiles = fs.readdirSync(stagingDir).filter(f => f.endsWith('.md'));
  let totalMdEmdashCount = 0;

  for (const file of mdFiles) {
    const fullPath = path.join(stagingDir, file);
    const text = fs.readFileSync(fullPath, 'utf8');
    const count = (text.match(/\u2014/g) || []).length;
    console.log(`  ${file}: ${count} em dashes`);
    totalMdEmdashCount += count;
  }
  console.log(`Total em dashes in local markdown files: ${totalMdEmdashCount}`);

  // Scan manifest.json
  const manifestPath = path.join(stagingDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const text = fs.readFileSync(manifestPath, 'utf8');
    const count = (text.match(/\u2014/g) || []).length;
    console.log(`\nmanifest.json: ${count} em dashes`);
  }
}

main()
  .catch((err) => {
    console.error('Error in backup & scan:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
