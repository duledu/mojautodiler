'use client';

import { useEffect, useRef, useState } from 'react';
import { trackLead, trackViewContent } from '@/lib/meta-pixel';
import { trackGA4Event } from '@/lib/ga4';
import { buildAttribution } from '@/lib/utm';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon, ViberIcon } from '@/components/ui/SocialIcons';
import {
  Phone, ChevronLeft, ChevronRight, X, Check, CheckCircle2, ChevronDown,
  ArrowLeft, Send, MapPin, Clock, ShieldCheck, CalendarCheck, Video, LockKeyhole, MessageCircle,
  Building2, Map as MapIcon, ExternalLink, User, HelpCircle,
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { formatPrice, formatMileage, cn, formatVatMode, isR2Image } from '@/lib/utils';
import type { DealerInfo } from '@/lib/db/mappers';
import { resolveVehicleContact } from '@/lib/vehicle-contact';
import VehicleCard from '@/components/vehicle/VehicleCard';
import VehicleShareSection from '@/components/vehicle/VehicleShareSection';
import { EmbedPlayer } from '@/components/vehicle/EmbedPlayer';
import MobileContactFab from '@/components/vehicle/MobileContactFab';
import VehicleHighlights from '@/components/vehicle/VehicleHighlights';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';

// ssr: false guarantees no SSR output → zero hydration mismatch risk
const VehicleTitleShareButton = dynamic(
  () => import('@/components/vehicle/VehicleTitleShareButton'),
  { ssr: false },
);

interface SeoContent {
  readonly description: string;
  readonly benefits:    string[];
  readonly buyerProfile: string[];
  readonly faq:         Array<{ readonly q: string; readonly a: string }>;
}

interface Props {
  readonly vehicle: Vehicle;
  readonly similar: Vehicle[];
  readonly locale: Locale;
  readonly t: TranslationKeys;
  readonly dealer: DealerInfo;
  readonly seoContent?: SeoContent;
}

// Only Google's own Maps embed iframe may ever be rendered — never arbitrary
// third-party src values (no Maps API/geocoding involved, just a static embed URL).
const GOOGLE_MAPS_EMBED_PREFIX = 'https://www.google.com/maps/embed';

function isAllowedGoogleMapsEmbedUrl(url: string | undefined): url is string {
  return Boolean(url && url.startsWith(GOOGLE_MAPS_EMBED_PREFIX));
}

function formatDealerPhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return '';
  if (/\s/.test(trimmed)) return trimmed;

  const withoutInternationalPrefix = digits.startsWith('00') ? digits.slice(2) : digits;
  const localSerbian = withoutInternationalPrefix.startsWith('381')
    ? withoutInternationalPrefix.slice(3)
    : withoutInternationalPrefix.startsWith('0')
      ? withoutInternationalPrefix.slice(1)
      : '';

  if (localSerbian.length >= 8 && localSerbian.length <= 9) {
    return `+381 ${localSerbian.slice(0, 2)} ${localSerbian.slice(2, 5)} ${localSerbian.slice(5)}`;
  }

  return trimmed;
}

export default function VehicleDetailClient({ vehicle, similar, locale, t, dealer, seoContent }: Props) {
  const formRef      = useRef<HTMLDivElement | null>(null);
  const messageRef   = useRef<HTMLTextAreaElement | null>(null);
  const touchStartX  = useRef<number | null>(null);
  // Frontend duplicate guard — Map<vehicleId:intent, lastFiredMs>
  // Prevents rapid double-taps, browser-synthetic click events, and any render-triggered
  // misfires from reaching the API. 5 s per intent per vehicle per component mount.
  const leadDebounce = useRef<Map<string, number>>(new Map());
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'equipment' | 'safety' | 'description'>('specs');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const trustBadges = getVehicleTrustBadges(vehicle);
  const contact = resolveVehicleContact(vehicle, dealer);

  // ── Analytics: ViewContent (Meta Pixel) + vehicle_view (GA4) ────────────
  // Fires once when the vehicle detail page mounts (client side only).
  // PageView is already handled globally by MetaPixelProvider / GoogleAnalytics.
  useEffect(() => {
    trackViewContent({
      id:       vehicle.id,
      name:     vehicle.title,
      category: 'vehicle',
      value:    vehicle.price,
      currency: vehicle.currency,
    });
    trackGA4Event('vehicle_view', {
      vehicle_id:   vehicle.id,
      vehicle_slug: vehicle.slug,
      make:         vehicle.brand,
      model:        vehicle.model,
      year:         vehicle.year,
      price:        vehicle.price,
      currency:     vehicle.currency,
      dealer_id:    contact.dealerId ?? undefined,
      dealer_name:  contact.dealerName ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.id]); // vehicle.id is stable — only re-fires if user navigates to a different vehicle
  const dealerPhoneDisplay = formatDealerPhone(contact.phone);
  const vehicleDetailCopy = t.vehicleDetail;
  const quickActionCopy = t.vehicleDetail;
  const activeVehicleImage = vehicle.images[activeImage] || vehicle.images[0];
  const activeImageUrl = activeVehicleImage?.url || '';
  const imageCount = Math.max(vehicle.images.length, 1);
  const vatText = formatVatMode(vehicle.vatMode, t);

  const nextImg = () => setActiveImage((i) => (i + 1) % imageCount);
  const prevImg = () => setActiveImage((i) => (i - 1 + imageCount) % imageCount);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return; // not a swipe
    if (dx < 0) nextImg(); else prevImg();
  };

  const specs = [
    { label: t.vehicle.year, value: `${vehicle.year}.` },
    { label: t.vehicle.mileage, value: formatMileage(vehicle.mileage) },
    { label: t.vehicle.fuelType, value: t.fuel[vehicle.fuelType] },
    { label: t.vehicle.transmission, value: t.transmission[vehicle.transmission] },
    { label: t.vehicle.drivetrain, value: t.drivetrain[vehicle.drivetrain] },
    { label: t.vehicle.bodyType, value: t.bodyType[vehicle.bodyType] },
    ...(vehicle.engineSize ? [{ label: t.vehicle.engine, value: `${vehicle.engineSize} ccm` }] : []),
    ...(vehicle.horsepower ? [{ label: t.vehicle.power, value: `${vehicle.horsepower} KS (${vehicle.kilowatts} kW)` }] : []),
    { label: t.vehicle.doors, value: `${vehicle.doors}` },
    { label: t.vehicle.seats, value: `${vehicle.seats}` },
    { label: t.vehicle.color, value: vehicle.color },
    ...(vehicle.interiorColor ? [{ label: t.vehicle.interiorColor, value: vehicle.interiorColor }] : []),
    ...(vehicle.registration ? [{ label: t.vehicle.registration, value: vehicle.registration }] : []),
    ...(vehicle.origin ? [{ label: t.vehicle.origin, value: vehicle.origin }] : []),
  ];

  const tabs = [
    { key: 'specs', label: t.vehicle.specs },
    { key: 'equipment', label: t.vehicle.equipment },
    { key: 'safety', label: t.vehicle.safety },
    { key: 'description', label: t.vehicle.description },
  ] as const;

  const recordLeadIntent = (intent: string, channel: string, message: string | undefined, firedAt: number, createCrmLead: boolean = true) => {
    // ── Frontend duplicate guard ────────────────────────────────────────────
    // Prevents rapid double-taps, browser-synthetic click events, and any
    // accidental render-level misfires from hitting the API. The server-side
    // dedup in /api/leads is the authoritative last line of defence.
    const dedupKey = `${vehicle.id}:${intent}`;
    if ((leadDebounce.current.get(dedupKey) ?? 0) + 5_000 > firedAt) return;
    leadDebounce.current.set(dedupKey, firedAt);

    // ── GA4: fire immediately on user action (before async CRM fetch) ──────
    // Unlike Meta Pixel (which waits for CRM 201), GA4 click events fire on
    // intent — the debounce above already guards against rapid double-fires.
    const ga4VehicleParams = {
      vehicle_id:   vehicle.id,
      vehicle_slug: vehicle.slug,
      make:         vehicle.brand,
      model:        vehicle.model,
      year:         vehicle.year,
      dealer_id:    contact.dealerId ?? undefined,
      dealer_name:  contact.dealerName ?? undefined,
    };
    if (intent === 'phone_call')     trackGA4Event('phone_click',    { ...ga4VehicleParams, contact_type: channel });
    if (intent === 'whatsapp_click') trackGA4Event('whatsapp_click', { ...ga4VehicleParams, contact_type: channel });
    if (intent === 'viber_click')    trackGA4Event('viber_click',    { ...ga4VehicleParams, contact_type: channel });

    // ── "Proveri dostupnost" and similar dial-only actions ──────────────────
    // No CRM lead, no email notification — this is a direct phone call, not
    // an inquiry. The Pixel fires immediately since the call is a real action.
    if (!createCrmLead) {
      trackLead({ contentName: vehicle.title, value: vehicle.price, currency: vehicle.currency });
      return;
    }

    // ── CRM record + conditional Meta Pixel ────────────────────────────────
    //
    // trackLead() fires ONLY when the server returns 201 (new CRM record was
    // actually created). If the server returns 200 + deduplicated:true, the
    // CRM entry was intentionally blocked by the 30-/60-s server dedup guard —
    // in that case the Pixel must also be suppressed to keep Meta Lead count in
    // sync with CRM inquiry count.
    //
    // On network failure the Pixel fires anyway: the real user action happened
    // and Meta should not be left blind. The CRM record may be missing, which
    // is logged so it can be investigated.
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inquiry',
        name: form.name || 'Kontakt akcija',
        phone: form.phone || contact.phone || 'N/A',
        email: form.email || undefined,
        message: message || `${intent}: ${vehicle.title}`,
        vehicleId: vehicle.id,
        vehicleTitle: vehicle.title,
        dealerId: contact.dealerId,
        dealerName: contact.dealerName,
        intent,
        preferredContactChannel: channel,
        attribution: buildAttribution(),
      }),
    })
      .then(async (res) => {
        const data = await res.json() as { deduplicated?: boolean; error?: string };
        if (res.status === 201) {
          // CRM record created — fire Pixel in sync
          trackLead({ contentName: vehicle.title, value: vehicle.price, currency: vehicle.currency });
        } else if (data.deduplicated) {
          // Server dedup blocked the CRM write — suppress Pixel so counts stay equal
          console.debug('[lead] server dedup — pixel suppressed:', intent, vehicle.id);
        } else {
          // Unexpected server response (400 validation, 500 crash) — no CRM record,
          // no Pixel. Log clearly so it can be diagnosed from browser console.
          console.warn(
            '[lead] unexpected server response — no CRM record, no pixel:',
            res.status, data.error ?? '(no error detail)', intent, vehicle.id,
          );
        }
      })
      .catch((err: unknown) => {
        // Network failure (fetch threw) — server unreachable.
        // Fire Pixel anyway so Meta is not blind to a real user action.
        // The missing CRM record is logged for later diagnosis.
        console.error('[lead] API unreachable — pixel fired without CRM record:', err, intent, vehicle.id);
        trackLead({ contentName: vehicle.title, value: vehicle.price, currency: vehicle.currency });
      });
  };

  const scheduleViewingMessage = vehicleDetailCopy.scheduleViewingMessage.replace('{title}', vehicle.title);

  const applyQuickLead = (message: string, intent: string = 'general_inquiry', firedAt: number) => {
    if (intent === 'schedule_viewing' || intent === 'reservation_request') {
      // Scroll-to-form only — NO lead creation, NO email, NO Meta Pixel, NO GA4 Lead event.
      // The lead is created only when the user explicitly submits the form.
      const prefill = intent === 'schedule_viewing' ? scheduleViewingMessage : message;
      setForm((current) => ({ ...current, message: prefill }));
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => messageRef.current?.focus(), 400);
      return;
    }
    setForm((current) => ({ ...current, message }));
    recordLeadIntent(intent, 'web', message, firedAt);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-(--color-bg) pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-(--color-text-muted)">
          <Link href={`/${locale}`} className="hover:text-(--color-text) transition-colors">
            {vehicleDetailCopy.home}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/inventory`} className="hover:text-(--color-text) transition-colors">
            {t.nav.inventory}
          </Link>
          <span>/</span>
          <span className="text-(--color-text) truncate">{vehicle.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-6 min-[390px]:px-4 min-[390px]:py-8 sm:px-6">
        <Link
          href={`/${locale}/inventory`}
          className="inline-flex items-center gap-2 text-(--color-text-muted) hover:text-(--color-text) text-sm transition-colors mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowLeft size={15} />
          {vehicleDetailCopy.backToInventory}
        </Link>

        <div className="grid gap-6 min-[390px]:gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left column — min-w-0 prevents grid item expanding to min-content size */}
          <div className="min-w-0 space-y-5 min-[390px]:space-y-7">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1
                  className="text-xl font-black leading-tight text-(--color-text) min-[390px]:text-2xl sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {vehicle.title}
                </h1>
                <VehicleTitleShareButton
                  vehicleSlug={vehicle.slug}
                  vehicleTitle={vehicle.title}
                  locale={locale}
                />
              </div>
              <p className="mt-1.5 text-(--color-text-muted)">
                {vehicle.year}. godište · {t.condition[vehicle.condition]}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 min-[390px]:gap-2">
                <VehicleStatusBadge vehicle={vehicle} locale={locale} />
                <TrustBadges locale={locale} badges={trustBadges.slice(0, 3)} compact />
              </div>

              {/* Mobile inline price — visible only on smaller screens */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-white p-3.5 shadow-sm min-[390px]:p-4 lg:hidden">
                <div className="min-w-0">
                  <div
                    className="truncate text-lg font-black leading-tight text-(--color-gold-dark) min-[390px]:text-2xl"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatPrice(vehicle.price, vehicle.currency)}
                  </div>
                  {vatText && <p className="mt-0.5 text-xs font-medium tracking-[0.01em] text-(--color-text-muted)">{vatText}</p>}
                </div>
                {contact.phone && (
                  <div className="shrink-0 text-center">
                    <a
                      href={`tel:${contact.phone}`}
                      onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)}
                      className="btn-gold touch-target flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                    >
                      <Phone size={14} />
                      {t.common.call}
                    </a>
                    {dealerPhoneDisplay && (
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)}
                        className="mx-auto mt-1.5 block max-w-[9.5rem] truncate text-center text-[11px] font-semibold leading-none tracking-[0.01em] text-[var(--color-text-muted)] opacity-80 transition-colors hover:text-[var(--color-text)] hover:opacity-100 min-[390px]:text-xs"
                        aria-label={`${t.common.call} ${dealerPhoneDisplay}`}
                      >
                        {dealerPhoneDisplay}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            {/*
              Double-wrapper ensures the frame never expands to image intrinsic size:
              - Outer: hard clips any overflow from Next.js <Image> wrappers or browser quirks
              - Inner: owns the visible aspect ratio (the "golden frame")
              Using plain <img> (not Next.js <Image>) so no extra wrapper elements can
              inject in-flow width and push the grid column wider than min-w-0 allows.
            */}
            <div className="w-full max-w-full overflow-hidden rounded-2xl">
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-(--color-surface-2) shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                {activeImageUrl ? (
                  // Using explicit width/height (not fill) so Next.js generates
                  // optimised srcsets without injecting extra wrapper elements.
                  // CSS absolute+inset-0+h-full+w-full controls the rendered size.
                  <Image
                    src={activeImageUrl}
                    alt={activeVehicleImage?.alt || vehicle.title}
                    width={1600}
                    height={900}
                    priority
                    unoptimized={isR2Image(activeImageUrl)}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <PremiumVehiclePlaceholder />
                )}

                {/* Overlay + watermark */}
                <span className="absolute inset-0 bg-black/10" aria-hidden="true" />
                {activeImageUrl && <span className="vehicle-watermark" aria-hidden="true">MOJAUTODILER</span>}

                {/* Transparent lightbox trigger
                    suppressHydrationWarning: password-manager extensions inject
                    fdprocessedid on this button client-side; the prop prevents
                    React from reporting a mismatch for that attribute. */}
                <button
                  type="button"
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={vehicleDetailCopy.galleryOpen}
                  suppressHydrationWarning
                />

                {/* Nav arrows — after the click target, naturally on top in stacking order */}
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImg}
                      aria-label={vehicleDetailCopy.previousImage}
                      suppressHydrationWarning
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-(--color-text) shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImg}
                      aria-label={vehicleDetailCopy.nextImage}
                      suppressHydrationWarning
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-(--color-text) shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                  {activeImage + 1} / {imageCount}
                </div>
              </div>

              {/* Thumbnail strip */}
              {vehicle.images.length > 1 && (
                <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {vehicle.images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      suppressHydrationWarning
                      className={cn(
                        'touch-target relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all min-[390px]:h-16 min-[390px]:w-24',
                        i === activeImage
                          ? 'border-(--color-gold) shadow-sm opacity-100'
                          : 'border-transparent opacity-55 hover:opacity-85'
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        width={192}
                        height={128}
                        unoptimized={isR2Image(img.url)}
                        sizes="96px"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                      <span className="vehicle-watermark vehicle-watermark-thumb" aria-hidden="true">MOJAUTODILER</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle highlights — fast-scan chips between gallery and confidence section */}
            <VehicleHighlights vehicle={vehicle} locale={locale} />

            {/* Videos — uploaded clips + embedded video, surfaced early so visitors see them before scrolling to specs */}
            {((vehicle.videos && vehicle.videos.length > 0) || vehicle.videoUrl) && (
              <section className="rounded-3xl border border-(--color-border) bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Video size={16} className="text-[var(--accent)]" />
                  <h3 className="font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>
                    Video
                  </h3>
                </div>
                <div className="space-y-4">
                  {vehicle.videos?.map((v) => (
                    <video
                      key={v.id}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full rounded-2xl bg-black"
                      style={{ aspectRatio: '16 / 9' }}
                    >
                      <source src={v.url} type={v.mimeType || 'video/mp4'} />
                    </video>
                  ))}
                  {vehicle.videoUrl && <EmbedPlayer url={vehicle.videoUrl} />}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 shadow-sm min-[390px]:p-5 sm:p-6">
              <div className="flex flex-col gap-4 min-[390px]:gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--accent-dark)] shadow-sm">
                    <ShieldCheck size={14} />
                    {vehicleDetailCopy.dealerConfidence}
                  </div>
                  <h2 className="text-xl font-black text-[var(--color-text)] min-[390px]:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {quickActionCopy.confidenceTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] min-[390px]:leading-7">{quickActionCopy.confidenceSub}</p>
                </div>
                <TrustBadges locale={locale} badges={trustBadges} className="lg:max-w-sm lg:justify-end" />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {quickActionCopy.confidenceBullets.map((bullet) => (
                  <div key={bullet} className="flex gap-2 rounded-2xl bg-white/80 p-3 text-[13px] leading-6 text-[var(--color-text-2)] min-[390px]:text-sm">
                    <Check size={16} className="mt-1 shrink-0 text-[var(--accent)]" />
                    {bullet}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-(--color-border) bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>{vehicleDetailCopy.quickActionsTitle}</h2>
                  <p className="mt-1 text-sm text-(--color-text-muted)">{vehicleDetailCopy.quickActionsSub}</p>
                </div>
                <MessageCircle size={20} className="shrink-0 text-[var(--accent)]" />
              </div>
              <div className="grid gap-2 min-[430px]:grid-cols-2 lg:grid-cols-5">
                <QuickLeadButton icon={<CalendarCheck size={15} />} label={quickActionCopy.book} onClick={(event) => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`, 'schedule_viewing', event.timeStamp)} />
                <QuickLeadButton icon={<Video size={15} />} label={quickActionCopy.video} onClick={(event) => {
                  recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp, false);
                  if (contact.phone) window.location.href = `tel:${contact.phone}`;
                }} />
                <QuickLeadButton icon={<ShieldCheck size={15} />} label={quickActionCopy.availability} onClick={(event) => {
                  recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp, false);
                  if (contact.phone) window.location.href = `tel:${contact.phone}`;
                }} />
                <QuickLeadButton icon={<LockKeyhole size={15} />} label={quickActionCopy.reserve} onClick={(event) => applyQuickLead(`${quickActionCopy.reserve}: ${vehicle.title}`, 'reservation_request', event.timeStamp)} />
                {contact.viber && (
                  <a href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`} onClick={(event) => recordLeadIntent('viber_click', 'viber', undefined, event.timeStamp)} className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7360F2]/20 bg-[#7360F2]/5 px-3 py-3 text-xs font-black text-[#6B5FDB] transition hover:bg-[#7360F2]/10">
                    <ViberIcon size={15} />
                    {quickActionCopy.viber}
                  </a>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-(--color-border) bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-gold-dark)">
                    <Building2 size={12} />
                    {vehicleDetailCopy.networkPartner}
                  </div>
                  <h2 className="text-2xl font-black text-(--color-text) sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {contact.name}
                  </h2>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-(--color-text-muted)">
                      <MapPin size={14} className="text-(--color-gold)" />
                      {contact.location}
                    </div>
                    {contact.isVerified && (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                        <ShieldCheck size={14} />
                        {vehicleDetailCopy.verifiedDealer}
                      </div>
                    )}
                  </div>
                  {contact.workingHours && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-(--color-text-muted)">
                      <Clock size={14} className="mt-0.5 shrink-0 text-(--color-gold)" />
                      <span className="whitespace-pre-line leading-relaxed">{contact.workingHours}</span>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 min-[430px]:min-w-40">
                  {contact.phone && <a href={`tel:${contact.phone}`} onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)} className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm"><Phone size={15} />{t.common.call}</a>}
                  {contact.viber && <a href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`} onClick={(event) => recordLeadIntent('viber_click', 'viber', undefined, event.timeStamp)} className="btn-outline inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm"><ViberIcon size={15} />Viber</a>}
                </div>
              </div>
              <p className="mt-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-xs leading-5 text-[var(--color-text-muted)] min-[390px]:p-4">
                {vehicleDetailCopy.platformDisclaimer}
              </p>
            </section>

            {/* Tabs */}
            <div className="rounded-2xl border border-(--color-border) bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="flex border-b border-(--color-border) overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
                      activeTab === tab.key
                        ? 'border-(--color-gold) text-(--color-gold-dark)'
                        : 'border-transparent text-(--color-text-muted) hover:text-(--color-text)'
                    )}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    <span className="text-xs min-[390px]:text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 min-[390px]:p-5 sm:p-6">
                {activeTab === 'specs' && (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {specs.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex min-h-[3.75rem] flex-col justify-center gap-1 rounded-xl bg-(--color-surface-2) px-3.5 py-3 min-[390px]:min-h-[4.25rem] min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between min-[390px]:px-4"
                      >
                        <span className="text-xs text-(--color-text-muted)">{label}</span>
                        <span className="text-sm font-semibold text-(--color-text) min-[390px]:text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'equipment' && (
                  <EquipmentGroups
                    groups={[
                      { label: vehicleDetailCopy.equipmentGroup, items: vehicle.equipment },
                      { label: vehicleDetailCopy.conditionGroup, items: vehicle.features },
                    ]}
                  />
                )}

                {activeTab === 'safety' && (
                  <EquipmentGroups
                    groups={[{ label: vehicleDetailCopy.safetyGroup, items: vehicle.safetyFeatures }]}
                    accent="green"
                  />
                )}

                {activeTab === 'description' && (
                  <div>
                    <p className="text-(--color-text-2) leading-relaxed whitespace-pre-line">
                      {vehicle.description}
                    </p>
                    {vehicle.dealerNotes && (
                      <div className="mt-6 rounded-2xl border border-(--color-gold-border) bg-(--color-gold-bg) p-4">
                        <h4
                          className="text-sm font-bold text-(--color-gold-dark) mb-2"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {t.vehicle.dealerNotes}
                        </h4>
                        <p className="text-sm text-(--color-text-muted)">{vehicle.dealerNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Share + discount section */}
            <VehicleShareSection vehicle={vehicle} locale={locale} dealer={dealer} />

            {/* Inquiry form */}
            <div ref={formRef} className="scroll-mt-28 rounded-2xl border border-(--color-border) bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] min-[390px]:p-6">
              <h3
                className="text-xl font-bold text-(--color-text) mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t.inquiry.title}
              </h3>
              <p className="text-(--color-text-muted) text-sm mb-1">
                {t.inquiry.interested}:{' '}
                <span className="font-semibold text-(--color-text)">{vehicle.title}</span>
              </p>
              <p className="text-(--color-text-muted) text-xs mb-6">
                {t.inquiry.requiredHint}
              </p>

              {submitted ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
                  <Check size={18} className="text-green-600 shrink-0" />
                  <span className="text-green-700 text-sm font-medium">{t.contact.success}</span>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormError(null);

                    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || form.message.trim().length < 5) {
                      setFormError(t.inquiry.validationError);
                      return;
                    }

                    setSubmitting(true);
                    try {
                      const res = await fetch('/api/leads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'inquiry',
                          name: form.name,
                          phone: form.phone,
                          email: form.email,
                          message: form.message,
                          vehicleId: vehicle.id,
                          vehicleTitle: vehicle.title,
                          dealerId: contact.dealerId,
                          dealerName: contact.dealerName,
                          dealerPhone: contact.phone,
                          intent: 'general_inquiry',
                          preferredContactChannel: 'email',
                          attribution: buildAttribution(),
                        }),
                      });
                      const data = await res.json() as { success?: boolean; error?: string };
                      if (!res.ok || !data.success) {
                        setFormError(data.error ?? vehicleDetailCopy.submitError);
                        return;
                      }
                      trackLead({ contentName: vehicle.title, value: vehicle.price, currency: vehicle.currency });
                      trackGA4Event('contact_form_submit', {
                        vehicle_id:   vehicle.id,
                        vehicle_slug: vehicle.slug,
                        make:         vehicle.brand,
                        model:        vehicle.model,
                        year:         vehicle.year,
                        dealer_id:    contact.dealerId ?? undefined,
                        dealer_name:  contact.dealerName ?? undefined,
                      });
                      setSubmitted(true);
                    } catch {
                      setFormError(vehicleDetailCopy.networkError);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      suppressHydrationWarning
                      required type="text"
                      placeholder={t.inquiry.namePlaceholder}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                    />
                    <input
                      suppressHydrationWarning
                      required type="tel"
                      placeholder={t.inquiry.phonePlaceholder}
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <input
                    suppressHydrationWarning
                    required
                    type="email"
                    placeholder={t.inquiry.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                  />
                  <textarea
                    ref={messageRef}
                    suppressHydrationWarning
                    required
                    minLength={5}
                    placeholder={t.inquiry.messagePlaceholder}
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm resize-none"
                  />
                  {formError && (
                    <p className="text-red-600 text-sm font-medium">{formError}</p>
                  )}
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    {submitting ? t.common.sending : t.inquiry.send}
                  </button>
                </form>
              )}
            </div>

            {(contact.locationName || isAllowedGoogleMapsEmbedUrl(contact.googleMapsEmbedUrl) || contact.googleMapsUrl) && (
              <section className="rounded-3xl border border-(--color-border) bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapIcon size={16} className="text-[var(--accent)]" />
                  <h3 className="font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>
                    {vehicleDetailCopy.locationSection}
                  </h3>
                </div>
                {contact.locationName && (
                  <div className="mb-4 flex items-center gap-1.5 text-sm font-medium text-(--color-text-muted)">
                    <MapPin size={14} className="text-(--color-gold)" />
                    {contact.locationName}
                  </div>
                )}
                {isAllowedGoogleMapsEmbedUrl(contact.googleMapsEmbedUrl) && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-[16/9]">
                    <iframe
                      src={contact.googleMapsEmbedUrl}
                      title={vehicleDetailCopy.locationSection}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                      suppressHydrationWarning
                    />
                  </div>
                )}
                {contact.googleMapsUrl && (
                  <a
                    href={contact.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'btn-outline inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm',
                      isAllowedGoogleMapsEmbedUrl(contact.googleMapsEmbedUrl) && 'mt-4',
                    )}
                  >
                    <ExternalLink size={15} />
                    {vehicleDetailCopy.openInGoogleMaps}
                  </a>
                )}
              </section>
            )}
          </div>

          {/* Right sticky column */}
          <div>
            <div className="sticky top-24 space-y-4">
              {/* Price + contact */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--accent-border)] bg-white p-5 shadow-[0_22px_70px_rgba(15,15,20,0.12),0_2px_10px_rgba(15,15,20,0.05)] min-[390px]:p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[var(--accent-soft)] opacity-90" aria-hidden="true" />

                <div className="relative border-b border-[var(--color-border)] pb-5">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {vehicleDetailCopy.priceLabel}
                  </p>
                  <div
                    className="text-[2rem] font-black leading-none text-[var(--color-text)] min-[390px]:text-[2.35rem]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatPrice(vehicle.price, vehicle.currency)}
                  </div>
                  {vatText && <p className="mt-2 text-xs font-semibold tracking-[0.01em] text-[var(--color-text-muted)]">{vatText}</p>}
                </div>

                <div className="relative mt-5 space-y-2.5">
                  {contact.phone && (
                    <div className="text-center">
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)}
                        className="btn-gold flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm shadow-[0_16px_34px_rgba(201,168,76,0.24)]"
                      >
                        <Phone size={15} />
                        {t.common.call}
                      </a>
                      {dealerPhoneDisplay && (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)}
                          className="mx-auto mt-2 block max-w-full truncate text-center text-xs font-semibold leading-none tracking-[0.01em] text-[var(--color-text-muted)] opacity-80 transition-colors hover:text-[var(--color-text)] hover:opacity-100"
                          aria-label={`${t.common.call} ${dealerPhoneDisplay}`}
                        >
                          {dealerPhoneDisplay}
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={(event) => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`, 'schedule_viewing', event.timeStamp)}
                    className="btn-outline flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm"
                  >
                    <CalendarCheck size={15} />
                    {quickActionCopy.book}
                  </button>
                  <div className={`grid gap-2.5 ${contact.viber ? 'grid-cols-1' : 'hidden'}`}>
                    {contact.viber && (
                      <a
                        href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`}
                        onClick={(event) => recordLeadIntent('viber_click', 'viber', undefined, event.timeStamp)}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#7360F2]/25 bg-[#7360F2]/5 px-3 text-sm font-semibold text-[#6B5FDB] transition-colors hover:bg-[#7360F2]/10"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <ViberIcon size={15} />
                        Viber
                      </a>
                    )}
                  </div>
                  {(contact.facebook || contact.instagram) && (
                    <div className={`grid gap-2 ${contact.facebook && contact.instagram ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {contact.facebook && (
                        <a
                          href={contact.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border border-[#1877F2]/20 text-[#1877F2] bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          <FacebookIcon size={13} />
                          Facebook
                        </a>
                      )}
                      {contact.instagram && (
                        <a
                          href={contact.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border border-[#E1306C]/20 text-[#E1306C] bg-[#E1306C]/5 hover:bg-[#E1306C]/10 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                          </svg>
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Dealer card */}
              <div className="rounded-2xl border border-(--color-border) bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-gold-bg) text-(--color-gold-dark) border border-(--color-gold-border)">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-gold-dark)">
                        {contact.hasPartnerDealer
                          ? vehicleDetailCopy.verifiedAutoDealer
                          : vehicleDetailCopy.platform}
                      </p>
                      <p className="truncate font-black text-(--color-text) text-base" style={{ fontFamily: 'var(--font-display)' }}>
                        {contact.name}
                      </p>
                      {contact.phone && dealerPhoneDisplay && (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(event) => recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp)}
                          className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-semibold leading-none tracking-[0.01em] text-[var(--color-text-muted)] opacity-80 transition-colors hover:text-[var(--color-text)] hover:opacity-100"
                          aria-label={`${t.common.call} ${dealerPhoneDisplay}`}
                        >
                          <Phone size={12} className="shrink-0 text-[var(--accent)] opacity-80" />
                          <span className="truncate">{dealerPhoneDisplay}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 100€ discount sidebar promo card */}
              <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-white p-5 shadow-sm">
                {/* Thin gold top accent — matches the price card language */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)]" aria-hidden="true" />

                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
                  {vehicleDetailCopy.promoEyebrow}
                </p>
                <h3
                  className="text-base font-black leading-snug text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {vehicleDetailCopy.promoTitle}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-[var(--color-text-muted)]">
                  {vehicleDetailCopy.promoText}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] opacity-70">
                  {vehicleDetailCopy.promoRule}
                </p>
                <Link
                  href={`/${locale}/contact?discount=share&vehicle=${encodeURIComponent(vehicle.slug)}&vehicleTitle=${encodeURIComponent(vehicle.title)}`}
                  className="btn-gold mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm"
                >
                  <Send size={14} />
                  {vehicleDetailCopy.promoButton}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Brand silo back-link — FIX #2: bi-directional internal linking.
            Only renders for brands that have a Phase 2 silo page.
            Improves crawl depth and PageRank flow: Vehicle → Brand → Homepage. */}
        {(() => {
          // Map vehicle.brand display names to their brand silo slugs.
          // Only brands with actual silo pages are listed here.
          const BRAND_SLUG_MAP: Record<string, string> = {
            'BMW':            'bmw',
            'Audi':           'audi',
            'Volkswagen':     'volkswagen',
            'Mercedes-Benz':  'mercedes-benz',
            'Škoda':          'skoda',
          };
          const brandSlug = BRAND_SLUG_MAP[vehicle.brand];
          if (!brandSlug) return null;
          return (
            <div className="mt-12 flex items-center gap-3">
              <div className="h-px flex-1 bg-(--color-border)" />
              <Link
                href={`/${locale}/cars/${brandSlug}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--accent-border) bg-(--accent-soft) px-4 py-2 text-xs font-bold text-(--accent-dark) transition hover:bg-(--accent) hover:text-white"
              >
                {vehicleDetailCopy.allBrandVehicles.replace('{brand}', vehicle.brand)}
                <ArrowLeft size={12} className="rotate-180" />
              </Link>
              <div className="h-px flex-1 bg-(--color-border)" />
            </div>
          );
        })()}

        {/* SEO content — server-generated, rendered in HTML for indexing */}
        {seoContent && (
          <VehicleSeoSection
            content={seoContent}
            brand={vehicle.brand}
            model={vehicle.model}
            generation={vehicle.generation}
            locale={locale}
          />
        )}

        {/* Similar vehicles */}
        {similar.length > 0 && (
          <div className="mt-16">
            <div className="divider-gold mb-4" />
            <h2
              className="text-2xl font-black text-(--color-text) mb-7"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t.vehicle.similar}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} locale={locale} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bar — primary conversion surface for Instagram/Facebook traffic */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-(--color-border) bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-2.5 min-[360px]:gap-2 min-[390px]:px-4 min-[390px]:py-3">
          {/* Price + visible phone number — trust signal for Instagram/Facebook visitors */}
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-black leading-tight text-(--color-gold-dark) min-[390px]:text-base"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                onClick={(event) => {
                  event.stopPropagation();
                  recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp);
                }}
                className="mt-0.5 block truncate text-[11px] font-semibold text-(--color-text-muted) transition-colors hover:text-(--color-text)"
              >
                {contact.phone}
              </a>
            ) : (
              <div className="mt-0.5 truncate text-xs text-(--color-text-muted)">{vehicle.title}</div>
            )}
          </div>

          {/* WhatsApp — highest-converting mobile channel */}
          {contact.phone && (
            <a
              href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                event.stopPropagation();
                recordLeadIntent('whatsapp_click', 'whatsapp', undefined, event.timeStamp);
              }}
              className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          )}

          {/* Call — direct phone, gold CTA */}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={(event) => {
                event.stopPropagation();
                recordLeadIntent('phone_call', 'phone', undefined, event.timeStamp);
              }}
              className="btn-gold touch-target flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm min-[390px]:px-4"
            >
              <Phone size={15} />
              <span className="hidden min-[360px]:inline">{t.common.call}</span>
            </a>
          )}

          {/* Viber */}
          {contact.viber && (
            <a
              href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`}
              onClick={(event) => {
                event.stopPropagation();
                recordLeadIntent('viber_click', 'viber', undefined, event.timeStamp);
              }}
              className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7360F2]/20 bg-[#7360F2]/10 text-[#6B5FDB]"
              aria-label="Viber"
            >
              <ViberIcon size={18} />
            </a>
          )}

          {/* Inquiry — scrolls to contact form */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={(event) => {
              event.stopPropagation();
              applyQuickLead(`${t.vehicle.inquiry}: ${vehicle.title}`, 'general_inquiry', event.timeStamp);
            }}
            className="btn-dark touch-target hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-3 text-xs min-[430px]:flex"
          >
            <MessageCircle size={14} />
            {t.vehicle.inquiry}
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
      <MobileContactFab
        locale={locale}
        phone={contact.phone}
        viber={contact.viber}
        instagram={contact.instagram || undefined}
        onPhoneClick={(firedAt) => recordLeadIntent('phone_call', 'phone', undefined, firedAt)}
        onViberClick={(firedAt) => recordLeadIntent('viber_click', 'viber', undefined, firedAt)}
        onWhatsAppClick={(firedAt) => recordLeadIntent('whatsapp_click', 'whatsapp', undefined, firedAt)}
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 animate-fade-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Image — pointer-events-none so it NEVER intercepts arrow or swipe events */}
          {activeImageUrl ? (
            <div className="pointer-events-none vehicle-lightbox-image relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageUrl}
                alt={activeVehicleImage?.alt || vehicle.title}
                className="block max-h-[90vh] max-w-[90vw] object-contain"
              />
              <span className="vehicle-watermark vehicle-watermark-lightbox" aria-hidden="true">MOJAUTODILER</span>
              <span className="vehicle-watermark-pattern" aria-hidden="true" />
            </div>
          ) : (
            <div className="pointer-events-none h-[60vh] w-[90vw] max-w-4xl overflow-hidden rounded-xl">
              <PremiumVehiclePlaceholder />
            </div>
          )}

          {/* Close — z-20 so it is always above the image div */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setLightboxOpen(false)}
            aria-label={vehicleDetailCopy.galleryClose}
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 sm:right-4 sm:top-4"
          >
            <X size={20} />
          </button>

          {/* Nav arrows — rendered AFTER the image div so they are naturally on top
              in the stacking context; z-20 makes this explicit and guarantees taps
              on both portrait and landscape mobile reach the buttons. */}
          {vehicle.images.length > 1 && (
            <>
              <button
                type="button"
                suppressHydrationWarning
                onClick={prevImg}
                aria-label={vehicleDetailCopy.previousImage}
                className="absolute left-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 sm:left-4"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={nextImg}
                aria-label={vehicleDetailCopy.nextImage}
                className="absolute right-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 sm:right-4"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white/80">
            {activeImage + 1} / {imageCount}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLeadButton({ icon, label, onClick }: { readonly icon: React.ReactNode; readonly label: string; readonly onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={onClick}
      className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-white px-3 py-3 text-xs font-black text-(--color-text-2) transition hover:border-(--accent-border) hover:bg-(--accent-soft) hover:text-(--accent-dark)"
    >
      <span className="text-(--accent)">{icon}</span>
      {label}
    </button>
  );
}

type EquipmentGroupAccent = 'gold' | 'green';

function EquipmentGroups({
  groups,
  accent = 'gold',
}: {
  readonly groups: { label: string; items: string[] }[];
  readonly accent?: EquipmentGroupAccent;
}) {
  const visibleGroups = groups.filter((g) => g.items.length > 0);

  if (visibleGroups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-(--color-text-muted)">
        Nema dostupnih podataka.
      </p>
    );
  }

  const dotCls =
    accent === 'green'
      ? 'bg-green-50 border-green-200 text-green-600'
      : 'bg-(--color-gold-bg) border-(--color-gold-border) text-(--color-gold-dark)';

  return (
    <div className="space-y-6">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          {visibleGroups.length > 1 && (
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-(--color-text-muted)">
              {group.label}
            </p>
          )}
          <div className="grid gap-1.5 sm:grid-cols-2">
            {group.items.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${dotCls}`}
                >
                  <Check size={11} />
                </div>
                <span className="text-sm text-(--color-text-2)">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SEO content section ──────────────────────────────────────────────────────

function VehicleSeoSection({
  content,
  brand,
  model,
  generation,
  locale,
}: {
  readonly content: SeoContent;
  readonly brand: string;
  readonly model: string;
  readonly generation?: string;
  readonly locale: Locale;
}) {
  const isSq = locale === 'sq';
  const gen = generation ? ` ${generation}` : '';
  const label = `${brand} ${model}${gen}`;

  return (
    <div className="mt-16 space-y-10">
      {/* SEO description */}
      <section className="rounded-3xl border border-(--color-border) bg-white p-6 sm:p-8">
        <div className="divider-gold mb-5" />
        <h2
          className="mb-4 text-xl font-black text-(--color-text) sm:text-2xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {isSq ? `Rreth ${label}` : `O vozilu ${label}`}
        </h2>
        <p className="text-sm leading-7 text-(--color-text-muted) sm:text-base sm:leading-8">
          {content.description}
        </p>
      </section>

      {/* Benefits */}
      {content.benefits.length > 0 && (
        <section>
          <div className="divider-gold mb-5" />
          <h2
            className="mb-6 text-xl font-black text-(--color-text) sm:text-2xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isSq ? `Avantazhet kryesore` : `Ključne prednosti`}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.benefits.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-(--color-border) bg-white p-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-(--accent)" />
                <p className="text-sm leading-6 text-(--color-text-2)">{point}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Buyer profile */}
      {content.buyerProfile.length > 0 && (
        <section className="rounded-3xl border border-(--color-border) bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--accent-soft)">
              <User size={16} className="text-(--accent-dark)" />
            </div>
            <h2
              className="text-sm font-black text-(--color-text) uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isSq ? 'Kush e zgjedh këtë automjet' : 'Kome je namenjeno ovo vozilo'}
            </h2>
          </div>
          <ul className="space-y-2.5">
            {content.buyerProfile.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-(--accent)" />
                <span className="text-sm leading-6 text-(--color-text-muted)">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {content.faq.length > 0 && (
        <section>
          <div className="divider-gold mb-5" />
          <div className="flex items-center gap-2.5 mb-6">
            <HelpCircle size={18} className="text-(--accent)" />
            <h2
              className="text-xl font-black text-(--color-text) sm:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isSq ? `Pyetjet e shpeshta — ${label}` : `Česta pitanja — ${label}`}
            </h2>
          </div>
          <div className="space-y-3">
            {content.faq.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-(--color-border) bg-white">
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-(--color-text) marker:hidden list-none">
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 text-(--color-text-muted) transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-(--color-border) px-5 py-4">
                  <p className="text-sm leading-7 text-(--color-text-muted)">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
