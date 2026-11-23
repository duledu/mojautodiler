import React from 'react';
import { resolveSafeLinkAttributes } from '@/lib/blog-content';
import type {
  BlogBlockquoteBlock,
  BlogContentBlock,
  BlogContentDocument,
  BlogInlineNode,
} from '@/types/blog';

interface Props {
  readonly document: BlogContentDocument;
  readonly className?: string;
}

/**
 * Applies the four official partner-mandated corrections requested by carVertical:
 * 1. "Dizel, benzin ili hibrid": "informacije o istoriji servisa"
 * 2. "Švajcarska": "Informacije o opremi i motoru"
 * 3. "Oštećenja" (Callout): "možete proveriti informacije o udesima"
 * 4. "Oštećenja" (Section 6): "40,8%"
 *
 * Does NOT perform any general punctuation or em dash modification on editorial content.
 */
function applyPartnerCorrections(text: string): string {
  if (!text) return text;
  return text
    .replace(/uvid u kompletnu servisnu hronologiju/g, 'informacije o istoriji servisa')
    .replace(/Verifikacija fabričke specifikacije opreme i motora/g, 'Informacije o opremi i motoru')
    .replace(/možete odmah saznati da li je automobil učestvovao u udesima/g, 'možete proveriti informacije o udesima')
    .replace(/40%\s+do\s+čak\s+55%/g, '40,8%');
}

function renderInlineNode(node: BlogInlineNode, key: number): React.ReactNode {
  const contentText = applyPartnerCorrections(node.text);
  let content: React.ReactNode = contentText;

  if (node.bold) {
    content = <strong className="font-bold text-[var(--color-text)]">{content}</strong>;
  }
  if (node.italic) {
    content = <em className="italic">{content}</em>;
  }

  if (node.type === 'link') {
    try {
      const isSponsored = Boolean(
        node.sponsored ||
          (typeof node.href === 'string' &&
            (node.href.includes('carvertical') || node.href.includes('source_id=AFF'))),
      );
      const attrs = resolveSafeLinkAttributes(node.href, {
        sponsored: isSponsored,
        openInNewTab: node.openInNewTab ?? true,
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

/**
 * Splits inline nodes by newline characters into distinct lines,
 * preserving bold, italic, and link attributes.
 */
function splitInlineNodesByLines(nodes: BlogInlineNode[]): BlogInlineNode[][] {
  const lines: BlogInlineNode[][] = [];
  let currentLine: BlogInlineNode[] = [];

  for (const node of nodes) {
    if (node.type === 'link') {
      currentLine.push(node);
      continue;
    }

    const text = node.text || '';
    if (!text.includes('\n')) {
      if (text.length > 0) {
        currentLine.push(node);
      }
      continue;
    }

    const segments = text.split('\n');
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.length > 0) {
        currentLine.push({ ...node, text: seg });
      }
      if (i < segments.length - 1) {
        lines.push(currentLine);
        currentLine = [];
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.filter((line) => line.length > 0 && line.some((n) => n.text.trim().length > 0));
}

/**
 * Explicitly identifies the four designated carVertical partner callout sections.
 * Requires all three structural criteria to match:
 * 1. Starts with partner heading ('###' and 'carVertical partnerska provera').
 * 2. Contains verified carVertical affiliate link (carvertical.deal).
 * 3. Contains partner discount coupon code (MOJAUTODILER).
 *
 * Guarantees standard blockquotes (legal quotes, warning callouts, advice) are never transformed.
 */
function isCarVerticalCalloutBlock(children: BlogInlineNode[]): boolean {
  if (!Array.isArray(children) || children.length < 3) return false;

  const firstNode = children[0];
  if (!firstNode || firstNode.type !== 'text') return false;

  const rawFirstText = firstNode.text.trim();
  const isPartnerHeading = rawFirstText.startsWith('###') && rawFirstText.includes('carVertical partnerska provera');
  if (!isPartnerHeading) return false;

  const hasAffiliateLink = children.some(
    (c) => c.type === 'link' && typeof c.href === 'string' && c.href.includes('carvertical.deal'),
  );
  if (!hasAffiliateLink) return false;

  const hasCouponCode = children.some(
    (c) => typeof c.text === 'string' && c.text.includes('MOJAUTODILER'),
  );
  return hasCouponCode;
}

function renderCarVerticalCallout(block: BlogBlockquoteBlock, index: number): React.ReactNode {
  const lines = splitInlineNodesByLines(block.children);

  let headingLine: BlogInlineNode[] | null = null;
  const introLines: BlogInlineNode[][] = [];
  let listLabelLine: BlogInlineNode[] | null = null;
  const listItems: BlogInlineNode[][] = [];
  let promoTitleLine: BlogInlineNode[] | null = null;
  const promoBodyLines: BlogInlineNode[][] = [];
  let linkLine: BlogInlineNode[] | null = null;
  let disclaimerLine: BlogInlineNode[] | null = null;

  let inList = false;
  let inPromo = false;

  for (const line of lines) {
    const lineRawText = line.map((n) => n.text).join('').trim();
    const firstNode = line[0];
    const firstText = firstNode?.text?.trim() || '';

    if (firstText.startsWith('###')) {
      const strippedFirst: BlogInlineNode = {
        ...firstNode,
        text: firstNode.text.replace(/^\s*###\s*/, ''),
      };
      headingLine = [strippedFirst, ...line.slice(1)];
    } else if (firstText.startsWith('-')) {
      inList = true;
      const strippedFirst: BlogInlineNode = {
        ...firstNode,
        text: firstNode.text.replace(/^\s*-\s*/, ''),
      };
      listItems.push([strippedFirst, ...line.slice(1)]);
    } else if (lineRawText.includes('🎁')) {
      inList = false;
      inPromo = true;
      promoTitleLine = line;
    } else if (line.some((n) => n.type === 'link')) {
      inPromo = false;
      const cleaned = line.map((n) => {
        if (n.type === 'text') {
          return {
            ...n,
            text: n.text.replace(/^[👉\s]+/, '').trim(),
          };
        }
        return n;
      }).filter((n) => n.text.length > 0);
      linkLine = cleaned;
    } else if (line.some((n) => n.italic) && (/partner|mojautodiler|dostupnost podataka/i.test(lineRawText))) {
      const cleanedNodes = line
        .map((n) => {
          if (n.type !== 'text') return n;
          let text = n.text;
          text = text.replace(/Napomena o partnerstvu:\s*MojAutoDiler ostvaruje naknadu[^\.]*\.\s*/gi, '');
          text = text.replace(/Transparentnost partnerstva:\s*MojAutoDiler ostvaruje proviziju[^\.]*\.\s*/gi, '');
          text = text.replace(/Partnerska transparentnost:\s*MojAutoDiler ostvaruje posredničku naknadu[^\.]*\.\s*/gi, '');
          text = text.replace(/MojAutoDiler ostvaruje posredničku (?:naknadu|proviziju)[^\.]*\.\s*/gi, '');
          text = text.replace(/MojAutoDiler ostvaruje (?:naknadu|proviziju)[^\.]*\.\s*/gi, '');
          return {
            ...n,
            text: text.trim(),
          };
        })
        .filter((n) => n.text.length > 0);

      if (cleanedNodes.length > 0) {
        disclaimerLine = cleanedNodes;
      }
    } else if (inPromo) {
      promoBodyLines.push(line);
    } else if (line.some((n) => n.bold) && lineRawText.endsWith(':') && !inList && listItems.length === 0) {
      listLabelLine = line;
    } else {
      introLines.push(line);
    }
  }

  return (
    <blockquote
      key={index}
      className="my-6 rounded-2xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)]/50 px-5 py-4 sm:p-6 shadow-xs"
    >
      {headingLine && (
        <h3
          className="mb-3 text-lg font-bold not-italic tracking-tight text-[var(--color-text)] sm:text-xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {renderInlineList(headingLine)}
        </h3>
      )}

      {introLines.map((line, lIdx) => (
        <p
          key={`intro-${lIdx}`}
          className="mb-3 text-sm leading-relaxed text-[var(--color-text-2)] not-italic sm:text-base"
        >
          {renderInlineList(line)}
        </p>
      ))}

      {listLabelLine && (
        <p className="mb-2 text-sm font-bold text-[var(--color-text)] not-italic sm:text-base">
          {renderInlineList(listLabelLine)}
        </p>
      )}

      {listItems.length > 0 && (
        <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm not-italic text-[var(--color-text-2)] sm:text-base">
          {listItems.map((item, itemIdx) => (
            <li key={`item-${itemIdx}`} className="leading-relaxed">
              {renderInlineList(item)}
            </li>
          ))}
        </ul>
      )}

      {(promoTitleLine || promoBodyLines.length > 0) && (
        <div className="my-3.5 rounded-xl border border-[var(--accent-border)]/40 bg-white/70 p-3.5 sm:p-4 text-sm not-italic text-[var(--color-text-2)] sm:text-base">
          {promoTitleLine && (
            <p className="font-bold text-[var(--color-text)]">{renderInlineList(promoTitleLine)}</p>
          )}
          {promoBodyLines.map((line, pIdx) => (
            <p key={`promo-${pIdx}`} className="mt-1 leading-relaxed">
              {renderInlineList(line)}
            </p>
          ))}
        </div>
      )}

      {linkLine && (
        <div className="my-3.5 flex items-center gap-2">
          <span aria-hidden="true" className="text-base select-none">👉</span>
          <div className="text-sm font-bold sm:text-base">
            {renderInlineList(linkLine)}
          </div>
        </div>
      )}

      {disclaimerLine && (
        <p className="mt-4 border-t border-[var(--accent-border)]/40 pt-3 text-xs italic leading-normal text-[var(--color-text-muted)]">
          {renderInlineList(disclaimerLine)}
        </p>
      )}
    </blockquote>
  );
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
      if (isCarVerticalCalloutBlock(block.children)) {
        return renderCarVerticalCallout(block, index);
      }
      // Standard blockquote preserved exactly as original implementation
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
