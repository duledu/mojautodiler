'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toPng, toJpeg } from 'html-to-image';
import { Download, X, Sparkles, RefreshCw, Sun, Moon, ExternalLink } from 'lucide-react';
import {
  MarketingCanvas,
  MarketingVehicleData,
  MARKETING_W,
  MARKETING_H,
} from '@/components/admin/MarketingCanvas';
import { waitForExportReady } from '@/components/admin/VehiclePhotoLayer';
import type { MarketingTheme, CreativeDirection } from '@/lib/ai/marketing';

// ─── Types ────────────────────────────────────────────────────────────────────

interface APIResponse {
  vehicle:         MarketingVehicleData;
  primaryImageUrl: string;
  listingUrl:      string;
  qrDataUrl:       string;
  style: {
    theme:       MarketingTheme;
    accentColor: string;
    tagline:     string;
    creative:    CreativeDirection;
    aiUsed:      boolean;
  };
  aiEnabled: boolean;
}

interface Props {
  readonly vehicleId:   string;
  readonly vehicleSlug: string;
  readonly onClose:     () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND_GOLD = '#C9A84C';
const HEX_RE     = /^#[0-9a-fA-F]{6}$/;

function isValidHex(v: string): boolean { return HEX_RE.test(v); }

const DEFAULT_CREATIVE: CreativeDirection = {
  compositionStyle:   'cinematic_full_bleed',
  typographyMode:     'editorial_large',
  imageTreatment:     'cinematic_contrast',
  informationDensity: 'balanced',
  panelStyle:         'glass_dark',
  lightingMood:       'dramatic',
  focalStrategy:      'vehicle_first',
  ctaStyle:           'prominent',
  overlayStrength:    0.22,
  cropStrategy:       'center',
};

// ─── Preview scale ────────────────────────────────────────────────────────────
const PREVIEW_W     = 280;
const PREVIEW_SCALE = PREVIEW_W / MARKETING_W;
const PREVIEW_H     = Math.round(MARKETING_H * PREVIEW_SCALE);

// ─── Component ────────────────────────────────────────────────────────────────
export default function MarketingImageGenerator({ vehicleId, vehicleSlug, onClose }: Props) {
  const [apiData,      setApiData]      = useState<APIResponse | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [apiRun,       setApiRun]       = useState(0);
  const [loadingApi,   setLoadingApi]   = useState(true);
  const [error,        setError]        = useState('');
  const [exporting,    setExporting]    = useState<'png' | 'jpeg' | null>(null);

  // User-controlled overrides seeded from AI, then freely editable
  const [theme,        setTheme]        = useState<MarketingTheme>('dark');
  const [accentColor,  setAccentColor]  = useState(BRAND_GOLD);
  const [hexInput,     setHexInput]     = useState(BRAND_GOLD);
  const [tagline,      setTagline]      = useState('');
  // Creative direction: set by AI, not directly editable (drives layout/composition)
  const [creative,     setCreative]     = useState<CreativeDirection>(DEFAULT_CREATIVE);

  // Track the last resolved image URL to avoid clearing it on restyle when
  // the vehicle hasn't changed (the proxy effect dep won't re-fire otherwise).
  const lastImageUrlRef = useRef<string>('');
  // Active blob URL — revoked when a new one is created or on unmount.
  const blobUrlRef      = useRef<string>('');

  const loadingImage = !!apiData?.primaryImageUrl && !imageDataUrl && !error;
  const exportRef    = useRef<HTMLDivElement>(null);

  // ── Lock body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Escape to close ─────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // ── Call marketing-image API ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/vehicles/${vehicleId}/marketing-image`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) return res.json().then((d: { error?: string }) => { throw new Error(d.error ?? `HTTP ${res.status}`); });
        return res.json() as Promise<APIResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setApiData(data);
        setTheme(data.style.theme);
        setAccentColor(data.style.accentColor);
        setHexInput(data.style.accentColor.toUpperCase());
        setTagline(data.style.tagline);
        if (data.style.creative) setCreative(data.style.creative);
        // Only reset the proxy image when the vehicle's primary image changed.
        // On restyle the same vehicle URL is returned — clearing here causes the
        // imageDataUrl to go permanently blank (proxy effect dep doesn't change).
        if (data.primaryImageUrl !== lastImageUrlRef.current) {
          setImageDataUrl('');
          lastImageUrlRef.current = data.primaryImageUrl;
        }
      })
      .catch((err: Error) => {
        // Keep existing preview on failure; only surface the error message
        if (!cancelled) setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoadingApi(false); });

    return () => { cancelled = true; };
  }, [vehicleId, apiRun]);

  // ── Fetch vehicle image through proxy → blob URL ────────────────────────────
  // Using URL.createObjectURL() instead of FileReader data URLs because
  // html-to-image internally calls fetch() on img.src — fetch(dataUrl) fails
  // silently for large images in some browsers, while blob URLs (same-origin,
  // no size limit) are always fetchable by html-to-image's resource embedder.
  useEffect(() => {
    const imageUrl = apiData?.primaryImageUrl;
    if (!imageUrl) return;
    let cancelled = false;
    console.log('[MarketingImage] proxy fetch →', imageUrl);

    fetch(`/api/admin/proxy-image?url=${encodeURIComponent(imageUrl)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Proxy HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        console.log('[MarketingImage] proxy ok, blob URL created');
        setImageDataUrl(blobUrl);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('[MarketingImage] proxy failed:', err.message);
          setError(`Greška pri učitavanju slike: ${err.message}`);
        }
      });

    return () => { cancelled = true; };
  }, [apiData?.primaryImageUrl]);

  // Revoke the blob URL when the modal closes.
  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  // ── Color picker / HEX input sync ───────────────────────────────────────────
  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setAccentColor(v);
    setHexInput(v.toUpperCase());
  }, []);

  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHexInput(v);
    if (isValidHex(v)) setAccentColor(v);
  }, []);

  const handleHexBlur = useCallback(() => {
    const candidate = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (isValidHex(candidate)) {
      setHexInput(candidate.toUpperCase());
      setAccentColor(candidate);
    } else {
      setHexInput(accentColor.toUpperCase());
    }
  }, [hexInput, accentColor]);

  // ── AI Restyle ──────────────────────────────────────────────────────────────
  const handleRestyle = useCallback(() => {
    setLoadingApi(true);
    setError('');
    setApiRun((n) => n + 1);
  }, []);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = async (type: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    setExporting(type);
    try {
      // Wait for VehiclePhotoLayer canvas draw + QR img decode.
      await waitForExportReady(exportRef.current);

      const opts     = { pixelRatio: 1, cacheBust: true } as const;
      const jpegOpts = { ...opts, quality: 0.93 };

      const dataUrl = type === 'png'
        ? await toPng(exportRef.current, opts)
        : await toJpeg(exportRef.current, jpegOpts);

      console.log('[MarketingImage] export ok ~', Math.round(dataUrl.length / 1024), 'KB');

      const a = document.createElement('a');
      a.download = `marketing-${vehicleSlug}-${theme}.${type === 'jpeg' ? 'jpg' : 'png'}`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('[MarketingImage] export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const isLoading   = loadingApi || loadingImage;
  const canExport   = !isLoading && !!apiData && !!imageDataUrl;
  const hexValid    = isValidHex(hexInput) || isValidHex(`#${hexInput}`);

  const canvasProps = apiData ? {
    vehicle:     apiData.vehicle,
    theme,
    accentColor,
    tagline,
    imageDataUrl,
    qrDataUrl:   apiData.qrDataUrl,
    listingUrl:  apiData.listingUrl,
    aiUsed:      apiData.style.aiUsed,
    creative,
  } : null;

  // Creative direction badge label shown in header
  const compositionLabel: Record<string, string> = {
    cinematic_full_bleed: 'Cinematic',
    editorial_split:      'Editorial',
    luxury_catalog:       'Luxury Catalog',
    social_feed_bold:     'Social Bold',
  };
  const creativeBadge = compositionLabel[creative.compositionStyle] ?? '';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-49 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI Marketing Image Generator"
          className="pointer-events-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-2xl"
          style={{ maxHeight: 'calc(100dvh - 1.5rem)' }}
        >

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center justify-between border-b border-(--color-border) px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent-soft)">
                <Sparkles className="h-4 w-4 text-(--accent-dark)" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>
                    AI Marketing Image Generator
                  </p>
                  {creativeBadge && apiData && (
                    <span className="rounded-full border border-(--accent-border) bg-(--accent-soft) px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-(--accent-dark)">
                      {creativeBadge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-(--color-text-muted)">
                  {apiData?.aiEnabled ? '✦ AI stilizovano' : '✦ Premium template'}
                  {apiData && (
                    <a
                      href={apiData.listingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-0.5 text-(--accent-dark) underline-offset-2 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Oglas
                    </a>
                  )}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-(--color-border) p-2 text-(--color-text-muted) transition hover:border-(--accent-border) hover:text-(--accent-dark)">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable body ───────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="p-5 space-y-5">

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Controls */}
              {apiData && (
                <div className="flex flex-wrap items-end gap-3">

                  {/* Theme toggle */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">Tema</p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${theme === 'dark' ? 'border-(--accent-border) bg-(--accent-soft) text-(--accent-dark)' : 'border-(--color-border) text-(--color-text-muted) hover:border-(--accent-border)'}`}
                      >
                        <Moon className="h-3 w-3" /> Tamna
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${theme === 'light' ? 'border-(--accent-border) bg-(--accent-soft) text-(--accent-dark)' : 'border-(--color-border) text-(--color-text-muted) hover:border-(--accent-border)'}`}
                      >
                        <Sun className="h-3 w-3" /> Svetla
                      </button>
                    </div>
                  </div>

                  {/* Accent colour — picker + hex synced */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">Akcentna boja</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={isValidHex(accentColor) ? accentColor : BRAND_GOLD}
                        onChange={handlePickerChange}
                        className="h-9 w-9 cursor-pointer rounded-xl border border-(--color-border) p-0.5"
                        title="Odaberi boju"
                      />
                      <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexChange}
                        onBlur={handleHexBlur}
                        maxLength={7}
                        placeholder="#C9A84C"
                        className={`input-premium w-24 rounded-xl px-2 py-2 font-mono text-xs ${hexValid ? '' : 'border-red-300 text-red-600'}`}
                        aria-label="HEX kod boje"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="flex-1 min-w-40">
                    <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">Tagline</p>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      maxLength={60}
                      className="input-premium w-full rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  {/* AI Restyle */}
                  <div>
                    <button
                      type="button"
                      onClick={handleRestyle}
                      disabled={loadingApi}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-text-muted) transition hover:border-(--accent-border) hover:text-(--accent-dark) disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingApi ? 'animate-spin' : ''}`} />
                      {apiData.aiEnabled ? 'AI Restilizuj' : 'Osvježi'}
                    </button>
                  </div>
                </div>
              )}

              {/* Creative direction info — shown when AI is active */}
              {apiData?.aiEnabled && !isLoading && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: creative.compositionStyle.replace(/_/g, ' ') },
                    { label: creative.typographyMode.replace(/_/g, ' ') },
                    { label: creative.imageTreatment.replace(/_/g, ' ') },
                    { label: creative.lightingMood },
                  ].map(({ label }) => (
                    <span key={label} className="rounded-lg border border-(--color-border) bg-(--color-surface-2) px-2 py-0.5 font-mono text-[9px] text-(--color-text-muted)">
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">
                  Pregled — {MARKETING_W}×{MARKETING_H}px
                </p>
                <div className="flex justify-center">
                  <div
                    style={{
                      width: PREVIEW_W,
                      height: PREVIEW_H,
                      overflow: 'hidden',
                      borderRadius: 14,
                      position: 'relative',
                      flexShrink: 0,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                      backgroundColor: '#0A0B0E',
                    }}
                  >
                    {/* Loading overlay — over canvas so preview never vanishes */}
                    {isLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0A0B0E]/80 backdrop-blur-sm">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-(--accent)/25 border-t-(--accent)" />
                        <p className="text-xs text-white/50">
                          {loadingApi ? 'AI generiše kreativni pravac…' : 'Učitava sliku…'}
                        </p>
                      </div>
                    )}
                    {/* Scaled canvas — always mounted when data ready */}
                    {canvasProps && (
                      <div style={{ width: MARKETING_W, height: MARKETING_H, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                        <MarketingCanvas {...canvasProps} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sticky footer — export ─────────────────────────────────────── */}
          <div className="shrink-0 border-t border-(--color-border) bg-white px-5 pb-5 pt-4">
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">
              Preuzmi — {MARKETING_W}×{MARKETING_H}px
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { void handleExport('png'); }}
                disabled={!canExport || exporting !== null}
                className="btn-gold flex min-h-11 items-center justify-center gap-2 rounded-2xl text-sm disabled:opacity-50"
              >
                {exporting === 'png'
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Generiše se…</span></>
                  : <><Download className="h-4 w-4" />Preuzmi PNG</>}
              </button>
              <button
                type="button"
                onClick={() => { void handleExport('jpeg'); }}
                disabled={!canExport || exporting !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface-2) text-sm font-bold text-(--color-text) transition hover:border-(--accent-border) hover:text-(--accent-dark) disabled:opacity-50"
              >
                {exporting === 'jpeg'
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /><span>Generiše se…</span></>
                  : <><Download className="h-4 w-4" />Preuzmi JPG</>}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-(--color-text-muted)">
              Originalna slika vozila ostaje neizmenjena. AI pomaže samo sa stilom i raspoređivanjem.
            </p>
          </div>

        </div>
      </div>

      {/* Off-screen full-res export target */}
      {canvasProps && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: '-99999px', width: MARKETING_W, pointerEvents: 'none', userSelect: 'none', zIndex: -1 }}
          aria-hidden="true"
        >
          <MarketingCanvas ref={exportRef} {...canvasProps} />
        </div>,
        document.body,
      )}
    </>
  );
}
