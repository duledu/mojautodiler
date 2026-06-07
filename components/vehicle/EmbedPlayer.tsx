'use client';

import { useEffect, useRef } from 'react';

// ─── Global Instagram API ────────────────────────────────────────────────────

declare global {
  var instgrm: { Embeds: { process(): void } } | undefined;
}

// ─── URL / embed-code parsing ─────────────────────────────────────────────────

type EmbedKind = 'youtube' | 'instagram' | 'tiktok' | 'facebook';

interface Parsed {
  kind: EmbedKind;
  /** YouTube: ready-to-use embed URL. Instagram: canonical permalink URL. */
  url: string;
}

/**
 * Accepts any of:
 *  - YouTube watch / share / shorts / live URL
 *  - Instagram post / reel / tv URL
 *  - Full copy-pasted Instagram <blockquote> embed code (with or without <script>)
 *  - TikTok video share URL (tiktok.com/@user/video/{id})
 *  - Facebook video URL (page videos / watch / reel / share link / fb.watch)
 *
 * For Instagram embed codes the permalink is extracted; the raw HTML is never
 * rendered. Returns null for unrecognised input.
 */
export function parseEmbed(raw: string): Parsed | null {
  const s = raw.trim();
  if (!s) return null;

  // ── YouTube ──────────────────────────────────────────────────────────────
  const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(s);
  if (yt) {
    return { kind: 'youtube', url: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  }

  // ── Instagram blockquote embed code ──────────────────────────────────────
  // Never use the raw HTML — extract only the permalink and build our own blockquote.
  if (s.includes('instagram-media') || s.startsWith('<blockquote')) {
    const m = /data-instgrm-permalink="([^"]+)"/.exec(s);
    if (m) {
      // Strip tracking params (?utm_source=...) — clean permalink only
      const cleanUrl = m[1].split('?')[0].replace(/\/?$/, '/');
      return { kind: 'instagram', url: cleanUrl };
    }
  }

  // ── Instagram URL (post / reel / tv) ─────────────────────────────────────
  const ig = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/.exec(s);
  if (ig) {
    return { kind: 'instagram', url: `https://www.instagram.com/${ig[1]}/${ig[2]}/` };
  }

  // ── TikTok ────────────────────────────────────────────────────────────────
  // Canonical share URL: tiktok.com/@username/video/7123456789012345678
  // (the numeric video ID is required to build the embed iframe URL)
  const tt = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/.exec(s);
  if (tt) {
    return { kind: 'tiktok', url: `https://www.tiktok.com/embed/v2/${tt[1]}` };
  }

  // ── Facebook video (page videos / watch / reel / fb.watch short links) ───
  // The video plugin resolves any canonical or short link server-side, so the
  // original URL is passed through as the `href` query param unchanged.
  // Split into small per-pattern checks to keep each regex's complexity low.
  const isFacebookVideo =
    /facebook\.com\/[\w.-]+\/videos\/\d+/i.test(s) ||
    /facebook\.com\/watch\/?\?v=\d+/i.test(s) ||
    /facebook\.com\/reel\/\d+/i.test(s) ||
    /facebook\.com\/share\/[rv]\/[\w-]+/i.test(s) ||
    /fb\.watch\/[\w-]+/i.test(s);
  if (isFacebookVideo) {
    return {
      kind: 'facebook',
      url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(s)}&show_text=false`,
    };
  }

  return null;
}

// ─── Instagram component ─────────────────────────────────────────────────────

/**
 * Renders an Instagram embed by imperatively inserting a <blockquote> into a
 * ref-owned container node.
 *
 * WHY IMPERATIVE instead of JSX / dangerouslySetInnerHTML:
 *   Instagram's embed.js heavily mutates the blockquote element (replaces its
 *   children, adds sibling iframes, resizes). React's reconciler sees its VDOM
 *   blockquote vs the mutated real DOM and undoes Instagram's work on every
 *   re-render. By never telling React about the blockquote, the subtree is
 *   invisible to the reconciler and Instagram's mutations survive safely.
 */
function InstagramEmbed({ url }: { readonly url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    // Clear any previous embed, then inject a fresh blockquote.
    container.innerHTML = '';

    const bq = document.createElement('blockquote');
    bq.className = 'instagram-media';
    bq.dataset['instgrmPermalink'] = url;
    bq.dataset['instgrmVersion']   = '14';
    // Inline styles mirror Instagram's own embed stylesheet so the placeholder
    // looks reasonable before the script transforms it.
    bq.style.cssText = [
      'background:#FFF',
      'border:0',
      'border-radius:3px',
      'box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15)',
      'margin:1px auto',
      'max-width:540px',
      'min-width:326px',
      'padding:0',
      'width:99.375%',
      'width:calc(100% - 2px)',
    ].join(';');

    container.appendChild(bq);

    // ── Script loading / processing ─────────────────────────────────────────
    // Pattern prescribed by Instagram's own embed documentation.

    if (globalThis.instgrm?.Embeds?.process) {
      // Script already loaded and ready — process immediately.
      globalThis.instgrm.Embeds.process();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.instagram.com/embed.js"]',
    );

    if (existingScript) {
      // Script tag exists but hasn't fired onload yet — wait for it.
      existingScript.addEventListener(
        'load',
        () => { globalThis.instgrm?.Embeds?.process?.(); },
        { once: true },
      );
      return;
    }

    // First time — create and append the script.
    const script = document.createElement('script');
    script.src   = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => { globalThis.instgrm?.Embeds?.process?.(); };
    document.body.appendChild(script);
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: 200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    />
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface Props {
  readonly url: string;
}

/**
 * Renders a YouTube, Instagram, TikTok or Facebook embed from a URL (or a full
 * Instagram embed code). Returns null for unrecognised input so no empty space
 * is shown.
 */
export function EmbedPlayer({ url }: Props) {
  const parsed = parseEmbed(url);
  if (!parsed) return null;

  // ── YouTube ────────────────────────────────────────────────────────────────
  if (parsed.kind === 'youtube') {
    return (
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9
          height: 0,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <iframe
          src={parsed.url}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>
    );
  }

  // ── TikTok (portrait 9:16) ─────────────────────────────────────────────────
  if (parsed.kind === 'tiktok') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 325,
            aspectRatio: '9 / 16',
            overflow: 'hidden',
            borderRadius: 12,
          }}
        >
          <iframe
            src={parsed.url}
            title="TikTok video"
            allow="encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    );
  }

  // ── Facebook video (16:9 plugin frame; portrait clips letterbox) ─────────
  if (parsed.kind === 'facebook') {
    return (
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9
          height: 0,
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <iframe
          src={parsed.url}
          title="Facebook video"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  // ── Instagram ──────────────────────────────────────────────────────────────
  return <InstagramEmbed url={parsed.url} />;
}

export type { EmbedKind, Parsed };
