'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toPng, toJpeg } from 'html-to-image';
import QRCode from 'qrcode';
import { Download, X, Layers } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import {
  SocialCreativeCanvas,
  CreativeFormat,
  CREATIVE_DIMS,
} from '@/components/admin/SocialCreativeCanvas';

const FORMAT_OPTIONS: {
  id: CreativeFormat;
  label: string;
  dims: string;
  desc: string;
}[] = [
  { id: 'story',    label: 'Story',    dims: '1080×1920', desc: 'Instagram / FB Story' },
  { id: 'square',   label: 'Square',   dims: '1080×1080', desc: 'Feed objava' },
  { id: 'portrait', label: 'Portrait', dims: '1080×1350', desc: 'Feed portret 4:5' },
];

// Preview width — 240px keeps the Story preview at ~427px tall, which fits
// comfortably on modern phones with the sticky-footer layout.
const PREVIEW_W = 240;

// Extracted to keep useEffect nesting below the 4-level limit (S2004).
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface Props {
  readonly vehicle: Vehicle;
  readonly dealerName: string;
  readonly dealerPhone: string;
  readonly onClose: () => void;
}

export default function SocialCreativeGenerator({
  vehicle,
  dealerName,
  dealerPhone,
  onClose,
}: Props) {
  const [format, setFormat] = useState<CreativeFormat>('story');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(Boolean(vehicle.images[0]?.url));
  const [imageError, setImageError] = useState('');
  const [exporting, setExporting] = useState<'png' | 'jpeg' | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);

  const siteOrigin =
    typeof globalThis.window === 'undefined'
      ? 'https://mojautodiler.rs'
      : globalThis.window.location.origin;
  const listingUrl = `${new URL(siteOrigin).hostname}/sr/vehicle/${vehicle.slug}`;
  const fullListingUrl = `${siteOrigin}/sr/vehicle/${vehicle.slug}`;
  const primaryImageUrl = vehicle.images[0]?.url ?? '';

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Fetch vehicle image through admin proxy → data URL (avoids CORS on canvas export)
  useEffect(() => {
    if (!primaryImageUrl) return;
    let cancelled = false;

    fetch(`/api/admin/proxy-image?url=${encodeURIComponent(primaryImageUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blobToDataUrl)
      .then((dataUrl) => {
        if (!cancelled) setImageDataUrl(dataUrl);
      })
      .catch((err) => {
        if (!cancelled)
          setImageError(err instanceof Error ? err.message : 'Greška pri učitavanju slike');
      })
      .finally(() => {
        if (!cancelled) setLoadingImage(false);
      });

    return () => { cancelled = true; };
  }, [primaryImageUrl]);

  // Generate QR code data URL
  useEffect(() => {
    QRCode.toDataURL(fullListingUrl, {
      width: 280,
      margin: 1,
      color: { dark: '#0A0A0E', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [fullListingUrl]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleExport = async (type: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    setExporting(type);
    try {
      const dataUrl =
        type === 'png'
          ? await toPng(exportRef.current, { pixelRatio: 1, cacheBust: true })
          : await toJpeg(exportRef.current, { quality: 0.93, pixelRatio: 1, cacheBust: true });
      const a = document.createElement('a');
      a.download = `${vehicle.slug}-${format}.${type === 'jpeg' ? 'jpg' : 'png'}`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('[CREATIVE] export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const dim = CREATIVE_DIMS[format];
  const scale = PREVIEW_W / dim.w;
  const previewH = Math.round(dim.h * scale);
  const isLoading = loadingImage || !qrDataUrl;

  const canvasProps = {
    vehicle,
    format,
    imageDataUrl,
    qrDataUrl,
    dealerName,
    dealerPhone,
    listingUrl,
  };

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-[49] bg-black/65 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal shell — centred, height-constrained, flex column.
          pointer-events-none on the positioner so backdrop clicks work. */}
      <div
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Social Media Kreativni"
          className="pointer-events-auto flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-2xl"
          style={{ maxHeight: 'calc(100dvh - 1.5rem)' }}
        >

          {/* ── Sticky header ───────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center justify-between border-b border-(--color-border) px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--accent-soft)">
                <Layers className="h-3.5 w-3.5 text-(--accent-dark)" />
              </div>
              <div>
                <p
                  className="text-sm font-black text-(--color-text)"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Social Media Kreativni
                </p>
                <p className="max-w-[200px] truncate text-[11px] text-(--color-text-muted)">
                  {vehicle.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-(--color-border) p-2 text-(--color-text-muted) transition hover:border-(--accent-border) hover:text-(--accent-dark)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable body — format selector + preview ─────────────── */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="space-y-5 p-5">

              {/* Format selector */}
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">
                  Format
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormat(opt.id)}
                      className={`rounded-2xl border p-2.5 text-left transition ${
                        format === opt.id
                          ? 'border-(--accent-border) bg-(--accent-soft)'
                          : 'border-(--color-border) hover:border-(--accent-border)'
                      }`}
                    >
                      <div
                        className={`text-sm font-black ${
                          format === opt.id ? 'text-(--accent-dark)' : 'text-(--color-text)'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-[10px] font-semibold text-(--color-text-muted)">
                        {opt.dims}
                      </div>
                      <div className="mt-0.5 hidden text-[9px] text-(--color-text-muted) min-[360px]:block">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">
                  Pregled
                </p>
                <div className="flex justify-center">
                  {imageError ? (
                    <div
                      style={{ width: PREVIEW_W, height: previewH }}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-(--color-surface-2) text-sm text-(--color-text-muted)"
                    >
                      <p>Nije moguće učitati sliku</p>
                      <p className="text-xs text-red-500">{imageError}</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: PREVIEW_W,
                        height: previewH,
                        overflow: 'hidden',
                        borderRadius: 12,
                        flexShrink: 0,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                        position: 'relative',
                        backgroundColor: '#0A0A0E',
                      }}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--accent)/25 border-t-(--accent)" />
                        </div>
                      )}
                      {/* Scaled-down preview — CSS transform only, not used for export */}
                      <div
                        style={{
                          width: dim.w,
                          height: dim.h,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <SocialCreativeCanvas {...canvasProps} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── Sticky footer — download buttons always visible ──────────── */}
          <div className="shrink-0 border-t border-(--color-border) bg-white px-5 pb-5 pt-4">
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-(--color-text-muted)">
              Preuzmi — {dim.w}×{dim.h}px
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { void handleExport('png'); }}
                disabled={isLoading || exporting !== null}
                className="btn-gold flex min-h-11 items-center justify-center gap-2 rounded-2xl text-sm disabled:opacity-50"
              >
                {exporting === 'png' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Generiše se…</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Preuzmi PNG
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { void handleExport('jpeg'); }}
                disabled={isLoading || exporting !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface-2) text-sm font-bold text-(--color-text) transition hover:border-(--accent-border) hover:text-(--accent-dark) disabled:opacity-50"
              >
                {exporting === 'jpeg' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                    <span>Generiše se…</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Preuzmi JPG
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-(--color-text-muted)">
              Generiše se u punoj rezoluciji ({dim.w}×{dim.h}px). Nije automatski objavljeno.
            </p>
          </div>

        </div>
      </div>

      {/* Off-screen full-resolution export target — portal avoids transform ancestors */}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '-99999px',
            width: dim.w,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <SocialCreativeCanvas ref={exportRef} {...canvasProps} />
        </div>,
        document.body,
      )}
    </>
  );
}
