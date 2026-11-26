'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Link2, MessageCircle, Share2 } from 'lucide-react';

export interface BlogShareButtonProps {
  readonly url: string;
  readonly title: string;
}

export interface ShareChannelUrls {
  readonly facebook: string;
  readonly whatsapp: string;
  readonly viber: string;
}

export function buildBlogShareUrls(url: string, title: string): ShareChannelUrls {
  const cleanUrl = url.trim();
  const cleanTitle = title.trim();
  const shareText = cleanTitle ? `${cleanTitle} ${cleanUrl}` : cleanUrl;

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    viber: `viber://forward?text=${encodeURIComponent(shareText)}`,
  };
}

function shouldPreferNativeShare(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;

  const isCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  return isCoarsePointer || isMobileUa;
}

export default function BlogShareButton({ url, title }: BlogShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrls = buildBlogShareUrls(url, title);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const triggerCopiedFeedback = () => {
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (typeof document !== 'undefined') {
        const input = document.createElement('textarea');
        input.value = url;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      triggerCopiedFeedback();
      setOpen(false);
    } catch {
      // Keep menu open if clipboard access is blocked
    }
  };

  const handleShareClick = async () => {
    if (shouldPreferNativeShare()) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fallback to popover menu if native share fails
      }
    }
    setOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleShareClick}
        aria-label="Podeli članak"
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)]/70 px-3.5 py-1.5 text-xs font-bold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Share2 size={13} className="shrink-0 text-[var(--accent-dark)]" />
        <span>Podeli</span>
      </button>

      {copied && (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
        >
          <Check size={12} className="shrink-0" />
          Link je kopiran
        </span>
      )}

      {open && (
        <div
          role="menu"
          aria-label="Opcije za deljenje članka"
          className="absolute right-0 top-full z-30 mt-2 w-52 origin-top-right rounded-2xl border border-[var(--color-border)] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,15,20,0.12)]"
        >
          <a
            role="menuitem"
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text-2)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[11px] font-extrabold text-[#1877F2]"
            >
              f
            </span>
            Facebook
          </a>

          <a
            role="menuitem"
            href={shareUrls.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text-2)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/12 text-[#128C7E]"
            >
              <MessageCircle size={13} />
            </span>
            WhatsApp
          </a>

          <a
            role="menuitem"
            href={shareUrls.viber}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text-2)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#7360F2]/12 text-[11px] font-extrabold text-[#7360F2]"
            >
              V
            </span>
            Viber
          </a>

          <div className="my-1 border-t border-[var(--color-border)]" />

          <button
            role="menuitem"
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-2)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-dark)]"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
            >
              <Link2 size={13} />
            </span>
            Kopiraj link
          </button>
        </div>
      )}
    </div>
  );
}
