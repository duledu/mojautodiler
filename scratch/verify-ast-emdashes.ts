import fs from 'node:fs';
import path from 'node:path';
import { markdownToBlogDocument } from './test-markdown-parser';
import { serializeBlogContent } from '../lib/blog-content';

const stagingDir = path.resolve('content/staging/seo-articles-2026');
const files = [
  'article-01-cene-polovnih-automobila-srbija-2026.md',
  'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
  'article-03-istorija-ostecenja-polovnih-automobila.md',
  'article-04-polovni-automobili-iz-svajcarske.md',
  'article-05-dizel-benzin-ili-hibrid-2027.md',
];

let totalAstEmdash = 0;
for (const file of files) {
  const filePath = path.join(stagingDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const body = raw.replace(/^---[\s\S]*?---\r?\n/, '');
  const doc = markdownToBlogDocument(body);
  const serialized = serializeBlogContent(doc);
  const count = (serialized.match(/\u2014/g) || []).length;
  console.log(`${file} serialized AST em dashes: ${count}`);
  totalAstEmdash += count;
}
console.log(`\nTotal em dashes across all 5 generated serialized ASTs: ${totalAstEmdash}`);
