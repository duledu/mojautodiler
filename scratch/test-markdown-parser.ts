import fs from 'node:fs';
import path from 'node:path';
import { validateAndNormalizeBlogContent } from '../lib/blog-content';
import type {
  BlogContentBlock,
  BlogContentDocument,
  BlogHeadingLevel,
  BlogInlineNode,
  BlogLinkNode,
  BlogTextNode,
} from '../types/blog';

/**
 * Parses inline formatting: bold (**), italic (*), and links ([text](href))
 */
export function parseInlineNodes(text: string): BlogInlineNode[] {
  const nodes: BlogInlineNode[] = [];
  let remaining = text.trim();

  // Regex to match:
  // 1. Links: [text](href){extra} or [text](href)
  // 2. Bold: **text**
  // 3. Italic: *text* (when not preceded or followed by *)
  const inlineRegex = /\[([^\]]+)\]\(([^)]+)\)(?:\{:([^}]+)\})?|\*\*([^*]+)\*\*|\*([^*]+)\*/;

  while (remaining.length > 0) {
    const match = remaining.match(inlineRegex);
    if (!match || match.index === undefined) {
      if (remaining) {
        nodes.push({ type: 'text', text: remaining });
      }
      break;
    }

    // Text before match
    if (match.index > 0) {
      const textBefore = remaining.slice(0, match.index);
      nodes.push({ type: 'text', text: textBefore });
    }

    if (match[1] && match[2]) {
      // Link: [match[1]](match[2])
      const linkText = match[1].trim();
      const href = match[2].trim();
      const extra = match[3] || '';
      const isSponsored = extra.includes('sponsored') || href.includes('carvertical.deal');
      const openInNewTab = extra.includes('_blank') || isSponsored || href.startsWith('http');

      // Check if link text itself has bold
      let cleanText = linkText;
      let bold = false;
      if (cleanText.startsWith('**') && cleanText.endsWith('**')) {
        cleanText = cleanText.slice(2, -2);
        bold = true;
      }

      nodes.push({
        type: 'link',
        text: cleanText,
        href,
        ...(bold ? { bold: true } : {}),
        ...(isSponsored ? { sponsored: true } : {}),
        ...(openInNewTab ? { openInNewTab: true } : {}),
      });
    } else if (match[4]) {
      // Bold: **match[4]**
      nodes.push({
        type: 'text',
        text: match[4],
        bold: true,
      });
    } else if (match[5]) {
      // Italic: *match[5]*
      nodes.push({
        type: 'text',
        text: match[5],
        italic: true,
      });
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  // Filter out empty nodes
  const safeNodes = nodes.filter((n) => n.text.length > 0);
  return safeNodes.length > 0 ? safeNodes : [{ type: 'text', text: text || ' ' }];
}

/**
 * Converts a raw markdown article body into a validated BlogContentDocument
 */
export function markdownToBlogDocument(markdown: string): BlogContentDocument {
  const blocks: BlogContentBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and horizontal separators
    if (!trimmed || trimmed === '---' || trimmed === '***' || trimmed === '___') {
      i++;
      continue;
    }

    // Skip top-level # H1 if present (it matches post.title)
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      i++;
      continue;
    }

    // 1. Headings (H2 - H6)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      let level: BlogHeadingLevel = 2;
      let headingText = '';

      if (trimmed.startsWith('#### ')) {
        level = 4;
        headingText = trimmed.slice(5).trim();
      } else if (trimmed.startsWith('### ')) {
        level = 3;
        headingText = trimmed.slice(4).trim();
      } else if (trimmed.startsWith('## ')) {
        level = 2;
        headingText = trimmed.slice(3).trim();
      }

      blocks.push({
        type: 'heading',
        level,
        children: parseInlineNodes(headingText),
      });
      i++;
      continue;
    }

    // 2. Blockquotes (lines starting with >)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const quoteText = quoteLines.filter(Boolean).join('\n');
      if (quoteText.trim()) {
        blocks.push({
          type: 'blockquote',
          children: parseInlineNodes(quoteText),
        });
      }
      continue;
    }

    // 3. Tables (lines with | ... |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line: headers
        const headerCells = tableLines[0]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim().replace(/\*\*/g, ''));

        // Skip separator line (| :--- | :--- |)
        const rowLines = tableLines.slice(1).filter((l) => !l.includes('---'));

        const rows: string[][] = [];
        for (const r of rowLines) {
          const cells = r
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim().replace(/\*\*/g, ''));
          // Ensure column count matches header count
          while (cells.length < headerCells.length) cells.push('');
          rows.push(cells.slice(0, headerCells.length));
        }

        if (headerCells.length > 0 && rows.length > 0) {
          blocks.push({
            type: 'table',
            headers: headerCells,
            rows,
          });
          continue;
        }
      }
    }

    // 4. Ordered list (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: BlogInlineNode[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        items.push(parseInlineNodes(itemText));
        i++;
      }
      blocks.push({
        type: 'list',
        style: 'ordered',
        items,
      });
      continue;
    }

    // 5. Unordered list (- item, * item)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: BlogInlineNode[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
        items.push(parseInlineNodes(itemText));
        i++;
      }
      blocks.push({
        type: 'list',
        style: 'unordered',
        items,
      });
      continue;
    }

    // 6. Regular Paragraph
    // Collect contiguous lines until empty line or block starter
    const paraLines: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trim();
      if (
        !nextTrimmed ||
        nextTrimmed.startsWith('#') ||
        nextTrimmed.startsWith('>') ||
        (nextTrimmed.startsWith('|') && nextTrimmed.endsWith('|')) ||
        /^\d+\.\s+/.test(nextTrimmed) ||
        /^[-*]\s+/.test(nextTrimmed) ||
        nextTrimmed === '---'
      ) {
        break;
      }
      paraLines.push(nextTrimmed);
      i++;
    }

    const paraText = paraLines.join(' ');
    if (paraText.trim()) {
      blocks.push({
        type: 'paragraph',
        children: parseInlineNodes(paraText),
      });
    }
  }

  const doc: BlogContentDocument = {
    version: 1,
    blocks,
  };

  return validateAndNormalizeBlogContent(doc);
}

// Test against all 5 articles
const stagingDir = path.resolve('content/staging/seo-articles-2026');
const files = [
  'article-01-cene-polovnih-automobila-srbija-2026.md',
  'article-02-vracena-kilometraza-kako-prepoznati-prevaru.md',
  'article-03-istorija-ostecenja-polovnih-automobila.md',
  'article-04-polovni-automobili-iz-svajcarske.md',
  'article-05-dizel-benzin-ili-hibrid-2027.md',
];

console.log('--- Testing Markdown to BlogContentDocument Conversion ---');
for (const file of files) {
  const filePath = path.join(stagingDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const body = raw.replace(/^---[\s\S]*?---\r?\n/, '');

  try {
    const doc = markdownToBlogDocument(body);
    console.log(`[PASS] ${file}`);
    console.log(`  Total Blocks: ${doc.blocks.length}`);
    const types = doc.blocks.map((b) => b.type);
    const counts = types.reduce((acc: any, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    console.log(`  Block Breakdown:`, counts);
  } catch (err: any) {
    console.error(`[FAIL] ${file}:`, err.message);
  }
}
