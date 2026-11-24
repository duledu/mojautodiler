'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { getCarVerticalDealersPagePath } from '@/lib/affiliate/carvertical';

interface AdminCarVerticalDealerShortcutProps {
  readonly variant?: 'sidebar' | 'card';
}

export default function AdminCarVerticalDealerShortcut({
  variant = 'card',
}: AdminCarVerticalDealerShortcutProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const relativePath = getCarVerticalDealersPagePath(locale);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${relativePath}`
        : relativePath;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  if (variant === 'sidebar') {
    return (
      <div
        data-testid="admin-sidebar-carvertical-shortcut"
        className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <ShieldCheck size={15} className="shrink-0 text-[var(--accent)]" />
          <span style={{ fontFamily: 'var(--font-display)' }}>carVertical za dilere</span>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-white/55">
          Javna stranica sa 20% popusta za prodavce bez prijave.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <Link
            href={relativePath}
            target="_blank"
            data-testid="admin-sidebar-carvertical-open"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-bold text-[#11100E] transition hover:bg-[var(--color-gold-light)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ExternalLink size={12} />
            <span>Otvori</span>
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            data-testid="admin-sidebar-carvertical-copy"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-white/14 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-bold text-white/85 transition hover:border-[var(--accent)] hover:text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Kopirano' : 'Kopiraj link'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      data-testid="admin-card-carvertical-shortcut"
      className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-dark)]">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h2
                className="text-sm font-black text-[var(--color-text)] sm:text-base"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                carVertical stranica za dilere
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Direktan javni link za prodavce i auto-placeve (20% popusta, bez prijave)
              </p>
            </div>
          </div>
          <div className="mt-2.5 inline-flex max-w-full items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--color-text-2)]">
            <span className="truncate">{relativePath}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 min-[420px]:flex-row">
          <Link
            href={relativePath}
            target="_blank"
            data-testid="admin-card-carvertical-open"
            className="btn-dark touch-target inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white"
          >
            <ExternalLink size={14} />
            <span>Otvori stranicu</span>
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            data-testid="admin-card-carvertical-copy"
            className="touch-target inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 text-xs font-bold text-[var(--accent-dark)] transition hover:border-[var(--accent)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
            <span>{copied ? 'Link je kopiran' : 'Kopiraj direktan link'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
