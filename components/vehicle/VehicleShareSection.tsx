'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Camera, Check, ChevronDown, ChevronUp, Download, ExternalLink, Gift, Info, Loader2, Share2,
} from 'lucide-react';

// iOS: iPhone, iPad (including iPadOS pretending to be macOS)
function detectIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Any touch-capable mobile device
function detectMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android/i.test(navigator.userAgent) || detectIOS();
}
import type { Vehicle } from '@/types/vehicle';
import type { Locale } from '@/lib/i18n';
import type { DealerInfo } from '@/lib/db/mappers';
import { cn } from '@/lib/utils';
import { SocialCreativeCanvas, CREATIVE_DIMS, CreativeFormat } from '@/components/admin/SocialCreativeCanvas';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.com').replace(/\/$/, '');

// Mobile: keep the source image under this byte limit to avoid OOM during export.
// The proxy already returns the full image; we don't compress it further because
// html-to-image will rasterise it at canvas resolution anyway.
const FETCH_TIMEOUT_MS = 10_000;

interface Props {
  readonly vehicle: Vehicle;
  readonly locale: Locale;
  readonly dealer: DealerInfo;
}

export default function VehicleShareSection({ vehicle, locale, dealer }: Props) {
  const [copied, setCopied]             = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [format, setFormat]             = useState<CreativeFormat>('square');
  const [exporting, setExporting]       = useState(false);
  const [loadingData, setLoadingData]   = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [qrDataUrl, setQrDataUrl]       = useState('');
  const [loadError, setLoadError]       = useState('');
  const [saveHint, setSaveHint]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const copy = locale === 'sq'
    ? {
        formatLabels: {
          square: 'Katëror 1:1',
          portrait: 'Portret 4:5',
          story: 'Story 9:16',
        } satisfies Record<CreativeFormat, string>,
        shareIntro: 'Shiko këtë automjet në MojAutoDiler:',
        loadError: 'Ngarkimi nuk pati sukses. Provoni përsëri.',
        downloadError: 'Shkarkimi nuk pati sukses. Provoni përsëri.',
        title: 'Shpërndaje dhe përfito 100€ zbritje',
        descriptionStart: 'Shpërndani një ose më shumë automjete nga oferta jonë në rrjetet sociale, ndiqni ose etiketoni',
        descriptionMiddle: 'dhe na dërgoni screenshot-in përmes formularit të kontaktit.',
        descriptionEnd: 'Përfitoni',
        discount: '100€ zbritje',
        descriptionAfterDiscount: 'për automjetin që dëshironi të blini.',
        copied: 'U kopjua!',
        share: 'Shpërndaje',
        downloadPost: 'Shkarko postimin për rrjete',
        stepsTitle: 'Përfito 100€ zbritje - ja si',
        step1: 'Shkarko imazhin dhe publikoje në Instagram, Facebook ose TikTok',
        step2Prefix: 'Në postim etiketo ose ndiq',
        step3: 'Na dërgo screenshot-in e postimit përmes formularit të kontaktit',
        step4: 'Zbritja prej 100€ aplikohet gjatë blerjes së automjetit',
        note: 'Shënim: publikimi automatik në Instagram dhe TikTok nuk është i mundur nga shfletuesi. Pas shkarkimit të imazhit, publikimi bëhet manualisht.',
        exporting: 'Po gjenerohet...',
        loading: 'Duke ngarkuar...',
        downloadImage: 'Shkarko imazhin',
        saveHintTitle: 'Imazhi u hap në skedë të re',
        saveHintText: 'Shtypni dhe mbani imazhin, pastaj zgjidhni "Ruaj imazhin" për ta shtuar në Galerinë e telefonit.',
        ctaText: 'E ke tashmë screenshot-in e postimit? Dërgoje tani dhe përfito zbritjen.',
        ctaButton: 'Dërgo screenshot-in',
      }
    : {
        formatLabels: {
          square: 'Kvadrat 1:1',
          portrait: 'Portret 4:5',
          story: 'Story 9:16',
        } satisfies Record<CreativeFormat, string>,
        shareIntro: 'Pogledaj ovaj automobil na MojAutoDiler:',
        loadError: 'Učitavanje nije uspelo. Pokušajte ponovo.',
        downloadError: 'Preuzimanje nije uspelo. Pokušajte ponovo.',
        title: 'Podeli i ostvari 100€ popusta',
        descriptionStart: 'Podelite jedno ili više vozila iz naše ponude na društvenim mrežama, zapratite ili tagujte',
        descriptionMiddle: 'i pošaljite nam screenshot kroz kontakt formu.',
        descriptionEnd: 'Ostvarujete',
        discount: '100€ popusta',
        descriptionAfterDiscount: 'na vozilo koje želite da kupite.',
        copied: 'Kopirano!',
        share: 'Podeli',
        downloadPost: 'Preuzmi objavu za mreže',
        stepsTitle: 'Ostvari 100€ popusta — evo kako',
        step1: 'Preuzmi sliku i objavi je na Instagram, Facebook ili TikTok',
        step2Prefix: 'U objavi označi ili zaprati',
        step3: 'Pošalji nam screenshot objave kroz kontakt formu',
        step4: 'Popust od 100€ se pripisuje pri kupovini vozila',
        note: 'Napomena: automatsko objavljivanje na Instagram i TikTok nije moguće putem pregledača — potrebno je ručno objavljivanje nakon preuzimanja slike.',
        exporting: 'Generišem...',
        loading: 'Učitavanje...',
        downloadImage: 'Preuzmi sliku',
        saveHintTitle: 'Slika otvorena u novoj kartici',
        saveHintText: 'Pritisnite i držite sliku, zatim odaberite "Sačuvaj sliku" da je dodate u Galeriju telefona.',
        ctaText: 'Već imaš screenshot objave? Pošalji nam ga odmah i ostvari popust.',
        ctaButton: 'Pošalji screenshot',
      };

  // Needed to avoid createPortal calling document.body during SSR
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const vehicleUrl  = `${SITE}/${locale}/vehicle/${vehicle.slug}`;
  const shareText   = `${copy.shareIntro}\n${vehicle.title}\n${vehicleUrl}`;
  const contactHref = `/${locale}/contact?vehicle=${encodeURIComponent(vehicle.slug)}&discount=share&vehicleTitle=${encodeURIComponent(vehicle.title)}`;
  const dims        = CREATIVE_DIMS[format];

  // FIX: canvasReady only requires the QR code. Vehicle image is optional —
  // SocialCreativeCanvas renders gracefully without it (dark background).
  // Previously: Boolean(imageDataUrl && qrDataUrl) → if image fetch failed,
  // imageDataUrl='' and '' && qrDataUrl === '' → canvasReady=false forever.
  const canvasReady = Boolean(qrDataUrl);

  // ── Share / copy ─────────────────────────────────────────────────────────────
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: vehicle.title, text: shareText, url: vehicleUrl });
        return;
      } catch { /* user cancelled or unsupported */ }
    }
    await copyToClipboard(vehicleUrl);
  };

  // ── Canvas data ───────────────────────────────────────────────────────────────
  const loadCanvasData = async () => {
    setLoadingData(true);
    setLoadError('');
    try {
      // 1. Vehicle image → base64 via proxy (no auth needed).
      //    Wrapped in its own try/catch so a failed image never blocks the QR step.
      let imgDataUrl = '';
      const imgUrl = vehicle.images[0]?.url;
      if (imgUrl) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
          const resp = await fetch(
            `/api/proxy-image?url=${encodeURIComponent(imgUrl)}`,
            { signal: controller.signal },
          );
          clearTimeout(timer);
          if (resp.ok) {
            const blob = await resp.blob();
            // FIX: FileReader now has an onerror handler so the Promise never hangs.
            imgDataUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload  = () => resolve(r.result as string);
              r.onerror = () => resolve(''); // graceful fallback — canvas renders without image
              r.readAsDataURL(blob);
            });
          }
        } catch {
          // Network timeout, CORS, or abort — proceed without image.
          // Canvas will render with a dark background; QR + text still usable.
        }
      }

      // 2. QR code (client-side).
      const QRCode = (await import('qrcode')).default;
      const qr = await QRCode.toDataURL(vehicleUrl, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0A0A0E', light: '#FFFFFF' },
      });

      setImageDataUrl(imgDataUrl);
      setQrDataUrl(qr);
    } catch {
      setLoadError(copy.loadError);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleDownload = async () => {
    const next = !showDownload;
    setShowDownload(next);
    if (next && !canvasReady && !loadingData) {
      await loadCanvasData();
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!canvasRef.current || !canvasReady || exporting) return;
    setExporting(true);
    setLoadError('');
    setSaveHint(false);
    try {
      // Wait for every <img> in the off-screen canvas to finish decoding before
      // html-to-image serialises the DOM. img.decode() resolves only once the
      // bitmap is fully decoded and ready to paint — no macrotask delay needed.
      const imgs = Array.from(canvasRef.current.querySelectorAll('img'));
      await Promise.all(imgs.map(img => img.decode().catch(() => {})));

      // NOTE: we deliberately do NOT await a setTimeout here. A setTimeout
      // introduces a macrotask boundary that breaks the user-gesture chain on
      // iOS Safari, which prevents navigator.share() from opening the share sheet.
      // img.decode() above is sufficient — all resources are pre-loaded data: URLs.

      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(canvasRef.current, {
        width:      dims.w,
        height:     dims.h,
        pixelRatio: 1,
        cacheBust:  false,
        type:       'image/png',
      });

      if (!blob) throw new Error('toBlob returned null');

      const filename = `${vehicle.slug}-${format}.png`;

      // ── Strategy 1: Web Share API with file (iOS 15.4+, Android Chrome 89+) ──
      // Opens the native OS share sheet so the user can tap "Save Image" or share
      // directly to Instagram, Facebook, TikTok etc. — no manual steps needed.
      // Must be called within the user-gesture chain (all awaits above are
      // Promise-based microtasks, so the gesture context is preserved).
      const file = new File([blob], filename, { type: 'image/png' });
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: vehicle.title });
          return; // share sheet handled it — done
        } catch (e) {
          // AbortError = user cancelled the share sheet intentionally
          if (e instanceof Error && e.name === 'AbortError') return;
          // Any other error (permission denied, OS restriction) → fall through
        }
      }

      const url = URL.createObjectURL(blob);

      // ── Strategy 2: iOS without Web Share API ──────────────────────────────
      // <a download> is silently ignored on iOS Safari — the browser either
      // opens the URL in the same tab or does nothing. Opening in a new tab
      // displays the PNG inline; the user can long-press → "Add to Photos".
      if (detectIOS()) {
        window.open(url, '_blank');
        setSaveHint(true); // show the tap-and-hold instruction banner
        setTimeout(() => URL.revokeObjectURL(url), 300_000); // 5 min
        return;
      }

      // ── Strategy 3: Anchor download ────────────────────────────────────────
      // Reliable on Android Chrome, Firefox (all platforms), and all desktop
      // browsers. blob: URLs are fully supported for download on these platforms.
      const a = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setLoadError(copy.downloadError);
    } finally {
      setExporting(false);
    }
  };

  const isButtonBusy = exporting || loadingData;
  function downloadLabel() {
    if (exporting) return copy.exporting;
    if (loadingData || !canvasReady) return copy.loading;
    return copy.downloadImage;
  }
  const buttonLabel = downloadLabel();

  return (
    <section className="rounded-3xl border border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-soft)] via-white to-white p-5 shadow-sm sm:p-6">

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-[0_4px_14px_rgba(201,168,76,0.4)]">
          <Gift size={18} />
        </div>
        <div>
          <h2
            className="font-black text-[var(--color-text)] sm:text-lg"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {copy.title}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-muted)]">
            {copy.descriptionStart}{' '}
            <strong className="text-[var(--color-text)]">MojAutoDiler</strong>{' '}
            {copy.descriptionMiddle}{' '}
            {copy.descriptionEnd}{' '}
            <strong className="text-[var(--color-text)]">{copy.discount}</strong>{' '}
            {copy.descriptionAfterDiscount}
          </p>
        </div>
      </div>

      {/* ── Quick share buttons ────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-2">
        {/* Primary — native share / clipboard */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={handleShare}
          className="btn-gold inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? copy.copied : copy.share}
        </button>

        {/* Viber */}
        <a
          href={`viber://forward?text=${encodeURIComponent(shareText)}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#7360F2]/20 bg-[#7360F2]/6 px-3.5 text-sm font-semibold text-[#6B5FDB] transition hover:bg-[#7360F2]/12"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.4 0C5.4 0 .6 4.8.6 10.8c0 3 1.2 5.7 3.3 7.8L2.4 24l5.7-1.5c1.5.6 3 .9 4.5.9 6 0 10.8-4.8 10.8-10.8S17.4 0 11.4 0zm5.4 15.6c-.3.6-.9 1.2-1.5 1.2-.3 0-.9-.3-2.1-.9-1.2-.6-2.1-1.2-2.7-2.1-.9-.9-1.5-1.8-2.1-2.7-.6-1.2-.9-1.8-.9-2.1 0-.6.6-1.2 1.2-1.5.3-.3.6-.3.9-.3.3 0 .6 0 .9.9.3.9.9 2.1.9 2.1s.3.3 0 .6c0 .3-.3.6-.6.9l-.3.3c.3.6.9 1.2 1.5 1.8.6.6 1.2 1.2 1.8 1.5l.3-.3c.3-.3.6-.6.9-.6h.6s1.2.6 2.1.9c.9.3.9.6.9.9 0 .3 0 .6-.3.9z" />
          </svg>
          Viber
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/6 px-3.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/12"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(vehicleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/6 px-3.5 text-sm font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/12"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>
      </div>

      {/* ── Social image download ─────────────────────────────────────────────── */}
      <div className="border-t border-[var(--accent-border)] pt-4">
        <button
          type="button"
          suppressHydrationWarning
          onClick={handleToggleDownload}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Camera size={15} className="shrink-0 text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--color-text)]">
              {copy.downloadPost}
            </span>
          </div>
          {showDownload
            ? <ChevronUp size={15} className="shrink-0 text-[var(--color-text-muted)]" />
            : <ChevronDown size={15} className="shrink-0 text-[var(--color-text-muted)]" />}
        </button>

        {showDownload && (
          <div className="mt-4 space-y-4">
            {/* Format selector */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(copy.formatLabels) as CreativeFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setFormat(f)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold transition',
                    format === f
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--accent-border)]'
                  )}
                >
                  {copy.formatLabels[f]}
                </button>
              ))}
            </div>

            {/* Steps */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {copy.stepsTitle}
              </p>
              <ol className="space-y-1.5 text-sm text-[var(--color-text-muted)]">
                <li className="flex gap-2">
                  <span className="shrink-0 font-black text-[var(--accent)]">1.</span>
                  {copy.step1}
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-black text-[var(--accent)]">2.</span>
                  {copy.step2Prefix}{' '}
                  <strong className="text-[var(--color-text)]">@MojAutoDiler</strong>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-black text-[var(--accent)]">3.</span>
                  {copy.step3}
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 font-black text-[var(--accent)]">4.</span>
                  {copy.step4}
                </li>
              </ol>
              <p className="mt-3 rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                {copy.note}
              </p>
            </div>

            {/* Error */}
            {loadError && (
              <p className="text-xs font-medium text-red-500">{loadError}</p>
            )}

            {/* Download button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleDownload}
              disabled={isButtonBusy || !canvasReady}
              className="btn-gold inline-flex min-h-10 items-center gap-2 rounded-xl px-5 text-sm disabled:opacity-55"
            >
              {isButtonBusy
                ? <Loader2 size={15} className="animate-spin" />
                : <Download size={15} />}
              {buttonLabel}
            </button>

            {/* iOS long-press hint — shown after window.open fallback on older iOS */}
            {saveHint && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-800">{copy.saveHintTitle}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-amber-700">{copy.saveHintText}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CTA to contact form ───────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--accent-border)] pt-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          {copy.ctaText}
        </p>
        <Link
          href={contactHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--accent-soft)]"
        >
          <ExternalLink size={13} />
          {copy.ctaButton}
        </Link>
      </div>

      {/* ── Off-screen canvas portal (capture target for html-to-image) ───────────
          Rendered only once QR is ready (canvasReady = Boolean(qrDataUrl)).
          Vehicle image is optional — canvas renders gracefully without it.
          Positioned far off-screen so it never interferes with visible layout. */}
      {mounted && canvasReady && createPortal(
        <div
          style={{
            position: 'fixed',
            left:   '-9999px',
            top:    0,
            width:  `${dims.w}px`,
            height: `${dims.h}px`,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <div ref={canvasRef} style={{ width: dims.w, height: dims.h }}>
            <SocialCreativeCanvas
              vehicle={vehicle}
              format={format}
              imageDataUrl={imageDataUrl}
              qrDataUrl={qrDataUrl}
              dealerName={dealer.name || 'Moj Auto Diler'}
              dealerPhone={dealer.phone}
              listingUrl={vehicleUrl}
            />
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
