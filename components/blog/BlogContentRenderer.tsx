import React from 'react';
import { resolveSafeLinkAttributes } from '@/lib/blog-content';
import type {
  BlogContentBlock,
  BlogContentDocument,
  BlogInlineNode,
} from '@/types/blog';

interface Props {
  readonly document: BlogContentDocument;
  readonly className?: string;
}

function renderInlineNode(node: BlogInlineNode, key: number): React.ReactNode {
  let content: React.ReactNode = node.text;

  if (node.bold) {
    content = <strong className="font-bold text-[var(--color-text)]">{content}</strong>;
  }
  if (node.italic) {
    content = <em className="italic">{content}</em>;
  }

  if (node.type === 'link') {
    try {
      const attrs = resolveSafeLinkAttributes(node.href, {
        sponsored: node.sponsored,
        openInNewTab: node.openInNewTab,
      });
      return (
        <a
          key={key}
          href={attrs.href}
          target={attrs.target}
          rel={attrs.rel}
          className="font-semibold text-[var(--accent-dark)] underline decoration-[var(--accent-border)] underline-offset-4 transition hover:text-[var(--accent)]"
        >
          {content}
        </a>
      );
    } catch {
      return <React.Fragment key={key}>{content}</React.Fragment>;
    }
  }

  return <React.Fragment key={key}>{content}</React.Fragment>;
}

function renderInlineList(nodes: BlogInlineNode[]): React.ReactNode {
  return nodes.map((node, idx) => renderInlineNode(node, idx));
}

function renderBlock(block: BlogContentBlock, index: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const children = renderInlineList(block.children);
      switch (block.level) {
        case 2:
          return (
            <h2
              key={index}
              className="mt-8 mb-3 text-2xl font-extrabold tracking-tight text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {children}
            </h2>
          );
        case 3:
          return (
            <h3
              key={index}
              className="mt-6 mb-2.5 text-xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {children}
            </h3>
          );
        case 4:
          return (
            <h4
              key={index}
              className="mt-5 mb-2 text-lg font-bold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {children}
            </h4>
          );
        case 5:
          return (
            <h5
              key={index}
              className="mt-4 mb-1.5 text-base font-bold text-[var(--color-text)]"
            >
              {children}
            </h5>
          );
        case 6:
          return (
            <h6
              key={index}
              className="mt-4 mb-1.5 text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]"
            >
              {children}
            </h6>
          );
      }
      break;
    }

    case 'paragraph':
      return (
        <p
          key={index}
          className="my-4 text-base leading-relaxed text-[var(--color-text-2)]"
        >
          {renderInlineList(block.children)}
        </p>
      );

    case 'list': {
      const items = block.items.map((itemNodes, itemIdx) => (
        <li key={itemIdx} className="leading-relaxed text-[var(--color-text-2)]">
          {renderInlineList(itemNodes)}
        </li>
      ));

      if (block.style === 'ordered') {
        return (
          <ol
            key={index}
            className="my-4 list-decimal space-y-1.5 pl-6 text-base text-[var(--color-text-2)]"
          >
            {items}
          </ol>
        );
      }
      return (
        <ul
          key={index}
          className="my-4 list-disc space-y-1.5 pl-6 text-base text-[var(--color-text-2)]"
        >
          {items}
        </ul>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="my-6 rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)]/50 px-5 py-4"
        >
          <p className="text-base italic leading-relaxed text-[var(--color-text)]">
            {renderInlineList(block.children)}
          </p>
          {block.citation && (
            <cite className="mt-2 block text-xs font-bold not-italic uppercase tracking-wider text-[var(--color-text-muted)]">
              — {block.citation}
            </cite>
          )}
        </blockquote>
      );

    case 'image':
      return (
        <figure key={index} className="my-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="max-h-[520px] w-full object-cover"
          />
          {block.caption && (
            <figcaption className="border-t border-[var(--color-border)] px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'table':
      return (
        <figure key={index} className="my-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                {block.headers.map((header, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text)]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-black/[0.015]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-[var(--color-text-2)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-muted)]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

export default function BlogContentRenderer({ document, className }: Props) {
  if (!document || !Array.isArray(document.blocks) || document.blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
        Sadržaj članka je prazan.
      </div>
    );
  }

  return (
    <div className={className ?? 'space-y-2'}>
      {document.blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
