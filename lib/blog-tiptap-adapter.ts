import type { JSONContent } from '@tiptap/core';
import {
  sanitizeBlogImageUrl,
  sanitizeBlogLinkUrl,
  validateAndNormalizeBlogContent,
} from '@/lib/blog-content';
import type {
  BlogBlockquoteBlock,
  BlogContentBlock,
  BlogContentDocument,
  BlogHeadingBlock,
  BlogHeadingLevel,
  BlogImageBlock,
  BlogInlineNode,
  BlogListBlock,
  BlogParagraphBlock,
  BlogTableBlock,
} from '@/types/blog';

// ─── BlogContentDocument -> Tiptap JSONContent ────────────────────────────────

function inlineNodesToTiptap(nodes: BlogInlineNode[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const node of nodes) {
    if (!node.text) continue;
    const marks: NonNullable<JSONContent['marks']> = [];

    if (node.bold) {
      marks.push({ type: 'bold' });
    }
    if (node.italic) {
      marks.push({ type: 'italic' });
    }
    if (node.type === 'link') {
      marks.push({
        type: 'link',
        attrs: {
          href: node.href,
          target: node.openInNewTab === false ? null : '_blank',
          rel: node.sponsored
            ? 'sponsored noopener noreferrer'
            : 'noopener noreferrer',
          sponsored: Boolean(node.sponsored),
          openInNewTab:
            typeof node.openInNewTab === 'boolean' ? node.openInNewTab : null,
        },
      });
    }

    result.push({
      type: 'text',
      text: node.text,
      ...(marks.length > 0 ? { marks } : {}),
    });
  }

  return result;
}

function blockToTiptapNode(block: BlogContentBlock): JSONContent {
  switch (block.type) {
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: block.level },
        content: inlineNodesToTiptap(block.children),
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: inlineNodesToTiptap(block.children),
      };

    case 'list':
      return {
        type: block.style === 'ordered' ? 'orderedList' : 'bulletList',
        content: block.items.map((itemChildren) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: inlineNodesToTiptap(itemChildren),
            },
          ],
        })),
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        attrs: { citation: block.citation ?? null },
        content: [
          {
            type: 'paragraph',
            content: inlineNodesToTiptap(block.children),
          },
        ],
      };

    case 'image':
      return {
        type: 'image',
        attrs: {
          src: block.src,
          alt: block.alt,
          title: block.caption ?? null,
          caption: block.caption ?? null,
          r2Key: block.r2Key ?? null,
        },
      };

    case 'table': {
      const headerRow: JSONContent = {
        type: 'tableRow',
        content: block.headers.map((headerText) => ({
          type: 'tableHeader',
          content: [
            {
              type: 'paragraph',
              content: headerText ? [{ type: 'text', text: headerText }] : [],
            },
          ],
        })),
      };

      const dataRows: JSONContent[] = block.rows.map((row) => ({
        type: 'tableRow',
        content: row.map((cellText) => ({
          type: 'tableCell',
          content: [
            {
              type: 'paragraph',
              content: cellText ? [{ type: 'text', text: cellText }] : [],
            },
          ],
        })),
      }));

      return {
        type: 'table',
        attrs: { caption: block.caption ?? null },
        content: [headerRow, ...dataRows],
      };
    }
  }
}

/**
 * Converts a Phase 1 `BlogContentDocument` into a Tiptap-compatible `JSONContent` tree.
 */
export function blogDocumentToTiptapJson(doc: BlogContentDocument): JSONContent {
  if (!doc || !Array.isArray(doc.blocks) || doc.blocks.length === 0) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  return {
    type: 'doc',
    content: doc.blocks.map(blockToTiptapNode),
  };
}

// ─── Tiptap JSONContent -> BlogContentDocument ────────────────────────────────

function extractInlineNodesFromTiptap(content: JSONContent[] | undefined): BlogInlineNode[] {
  if (!Array.isArray(content)) return [];
  const inlineNodes: BlogInlineNode[] = [];

  for (const child of content) {
    if (child.type === 'hardBreak') {
      inlineNodes.push({ type: 'text', text: '\n' });
      continue;
    }

    if (child.type === 'paragraph' && Array.isArray(child.content)) {
      inlineNodes.push(...extractInlineNodesFromTiptap(child.content));
      continue;
    }

    if (child.type !== 'text' || typeof child.text !== 'string' || child.text.length === 0) {
      continue;
    }

    const marks = Array.isArray(child.marks) ? child.marks : [];
    const bold = marks.some((m) => m.type === 'bold');
    const italic = marks.some((m) => m.type === 'italic');
    const linkMark = marks.find((m) => m.type === 'link');

    if (linkMark && linkMark.attrs && typeof linkMark.attrs.href === 'string') {
      const safeHref = sanitizeBlogLinkUrl(linkMark.attrs.href);
      if (safeHref && child.text.trim().length > 0) {
        const relStr = typeof linkMark.attrs.rel === 'string' ? linkMark.attrs.rel : '';
        const sponsored =
          linkMark.attrs.sponsored === true || relStr.toLowerCase().includes('sponsored');
        const openInNewTab =
          typeof linkMark.attrs.openInNewTab === 'boolean'
            ? linkMark.attrs.openInNewTab
            : undefined;

        inlineNodes.push({
          type: 'link',
          href: safeHref,
          text: child.text,
          ...(bold ? { bold: true } : {}),
          ...(italic ? { italic: true } : {}),
          ...(sponsored ? { sponsored: true } : {}),
          ...(openInNewTab !== undefined ? { openInNewTab } : {}),
        });
        continue;
      }
    }

    inlineNodes.push({
      type: 'text',
      text: child.text,
      ...(bold ? { bold: true } : {}),
      ...(italic ? { italic: true } : {}),
    });
  }

  return inlineNodes;
}

function extractPlainTextFromTiptap(node: JSONContent | undefined): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (!Array.isArray(node.content)) return '';
  return node.content.map(extractPlainTextFromTiptap).join('').trim();
}

function hasMeaningfulInlineText(nodes: BlogInlineNode[]): boolean {
  return nodes.some((n) => n.text.trim().length > 0);
}

/**
 * Converts a Tiptap `JSONContent` document back into a validated Phase 1
 * `BlogContentDocument` (`version: 1`).
 */
export function tiptapJsonToBlogDocument(json: JSONContent): BlogContentDocument {
  const topNodes = Array.isArray(json?.content) ? json.content : [];
  const blocks: BlogContentBlock[] = [];

  for (const node of topNodes) {
    if (!node || typeof node !== 'object') continue;

    switch (node.type) {
      case 'heading': {
        const rawLevel = Number(node.attrs?.level ?? 2);
        const clampedLevel = Math.max(
          2,
          Math.min(6, Number.isFinite(rawLevel) ? Math.round(rawLevel) : 2),
        ) as BlogHeadingLevel;
        const children = extractInlineNodesFromTiptap(node.content);
        if (hasMeaningfulInlineText(children)) {
          const headingBlock: BlogHeadingBlock = {
            type: 'heading',
            level: clampedLevel,
            children,
          };
          blocks.push(headingBlock);
        }
        break;
      }

      case 'paragraph': {
        // Also support inline images placed inside a paragraph by Tiptap
        const imageChild = (node.content ?? []).find((c) => c.type === 'image');
        if (imageChild && (node.content ?? []).length === 1) {
          const safeSrc = sanitizeBlogImageUrl(String(imageChild.attrs?.src ?? ''));
          const alt = String(imageChild.attrs?.alt ?? '').trim() || 'Ilustracija članka';
          if (safeSrc) {
            const imgBlock: BlogImageBlock = {
              type: 'image',
              src: safeSrc,
              alt,
              ...(imageChild.attrs?.caption || imageChild.attrs?.title
                ? {
                    caption: String(
                      imageChild.attrs?.caption ?? imageChild.attrs?.title,
                    ).trim(),
                  }
                : {}),
              ...(imageChild.attrs?.r2Key
                ? { r2Key: String(imageChild.attrs.r2Key).trim() }
                : {}),
            };
            blocks.push(imgBlock);
          }
          break;
        }

        const children = extractInlineNodesFromTiptap(node.content);
        if (hasMeaningfulInlineText(children)) {
          const paragraphBlock: BlogParagraphBlock = {
            type: 'paragraph',
            children,
          };
          blocks.push(paragraphBlock);
        }
        break;
      }

      case 'bulletList':
      case 'orderedList': {
        const style = node.type === 'orderedList' ? 'ordered' : 'unordered';
        const items: BlogInlineNode[][] = [];
        for (const itemNode of node.content ?? []) {
          if (itemNode.type !== 'listItem') continue;
          const itemChildren = extractInlineNodesFromTiptap(itemNode.content);
          if (hasMeaningfulInlineText(itemChildren)) {
            items.push(itemChildren);
          }
        }
        if (items.length > 0) {
          const listBlock: BlogListBlock = {
            type: 'list',
            style,
            items,
          };
          blocks.push(listBlock);
        }
        break;
      }

      case 'blockquote': {
        const children = extractInlineNodesFromTiptap(node.content);
        if (hasMeaningfulInlineText(children)) {
          const citationRaw = node.attrs?.citation;
          const citation =
            typeof citationRaw === 'string' && citationRaw.trim().length > 0
              ? citationRaw.trim()
              : undefined;
          const quoteBlock: BlogBlockquoteBlock = {
            type: 'blockquote',
            children,
            ...(citation ? { citation } : {}),
          };
          blocks.push(quoteBlock);
        }
        break;
      }

      case 'image': {
        const safeSrc = sanitizeBlogImageUrl(String(node.attrs?.src ?? ''));
        const alt = String(node.attrs?.alt ?? '').trim();
        if (safeSrc && alt) {
          const captionRaw = node.attrs?.caption ?? node.attrs?.title;
          const caption =
            typeof captionRaw === 'string' && captionRaw.trim().length > 0
              ? captionRaw.trim()
              : undefined;
          const r2KeyRaw = node.attrs?.r2Key;
          const r2Key =
            typeof r2KeyRaw === 'string' && r2KeyRaw.trim().length > 0
              ? r2KeyRaw.trim()
              : undefined;
          const imageBlock: BlogImageBlock = {
            type: 'image',
            src: safeSrc,
            alt,
            ...(caption ? { caption } : {}),
            ...(r2Key ? { r2Key } : {}),
          };
          blocks.push(imageBlock);
        }
        break;
      }

      case 'table': {
        const tableRows = (node.content ?? []).filter((r) => r.type === 'tableRow');
        if (tableRows.length >= 2) {
          const headers = (tableRows[0].content ?? []).map((cell) =>
            extractPlainTextFromTiptap(cell),
          );
          if (headers.length > 0) {
            const rows = tableRows.slice(1).map((rowNode) => {
              const cells = (rowNode.content ?? []).map((cell) =>
                extractPlainTextFromTiptap(cell),
              );
              while (cells.length < headers.length) cells.push('');
              return cells.slice(0, headers.length);
            });
            const captionRaw = node.attrs?.caption;
            const caption =
              typeof captionRaw === 'string' && captionRaw.trim().length > 0
                ? captionRaw.trim()
                : undefined;
            const tableBlock: BlogTableBlock = {
              type: 'table',
              headers,
              rows,
              ...(caption ? { caption } : {}),
            };
            blocks.push(tableBlock);
          }
        }
        break;
      }
    }
  }

  return validateAndNormalizeBlogContent({
    version: 1,
    blocks,
  });
}
