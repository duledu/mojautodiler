'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon, InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import {
  Phone, ChevronLeft, ChevronRight, X, Check,
  ArrowLeft, Send, MapPin, Clock, ShieldCheck, CalendarCheck, Video, LockKeyhole, MessageCircle,
  Building2,
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { formatPrice, formatMileage, cn, formatVatMode } from '@/lib/utils';
import type { DealerInfo } from '@/lib/db/mappers';
import { resolveVehicleContact } from '@/lib/vehicle-contact';
import VehicleCard from '@/components/vehicle/VehicleCard';
import VehicleShareSection from '@/components/vehicle/VehicleShareSection';
import MobileContactFab from '@/components/vehicle/MobileContactFab';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';

// ssr: false guarantees no SSR output → zero hydration mismatch risk
const VehicleTitleShareButton = dynamic(
  () => import('@/components/vehicle/VehicleTitleShareButton'),
  { ssr: false },
);

interface Props {
  readonly vehicle: Vehicle;
  readonly similar: Vehicle[];
  readonly locale: Locale;
  readonly t: TranslationKeys;
  readonly dealer: DealerInfo;
}

export default function VehicleDetailClient({ vehicle, similar, locale, t, dealer }: Props) {
  const formRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'equipment' | 'safety' | 'description'>('specs');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const trustBadges = getVehicleTrustBadges(vehicle);
  const contact = resolveVehicleContact(vehicle, dealer);
  const quickActionCopy = locale === 'sq'
    ? {
        book: 'Rezervo shikim',
        video: 'Kerko video',
        availability: 'Kontrollo disponueshmerine',
        reserve: 'Rezervo automjetin',
        viber: 'Pyet ne Viber',
        confidenceTitle: 'Pse ky automjet dallohet',
        confidenceSub: 'Perzgjedhje e kujdesshme, kontroll profesional dhe prezantim transparent para vendimit.',
        bullets: ['Kilometrazha dhe dokumentet kontrollohen para publikimit.', 'Automjeti vleresohet vizualisht dhe teknikisht para rekomandimit.', 'Import i zgjedhur me kujdes per bleres serioze.', 'Proces blerjeje i qarte, pa presion dhe pa kosto te fshehura.'],
      }
    : {
        book: 'Zakazi gledanje',
        video: 'Zatrazi video',
        availability: 'Proveri dostupnost',
        reserve: 'Rezervisi vozilo',
        viber: 'Pitaj na Viber',
        confidenceTitle: 'Zasto se ovo vozilo izdvaja',
        confidenceSub: 'Pazljivo odabrano vozilo, profesionalno provereno i predstavljeno transparentno pre odluke.',
        bullets: ['Kilometraza i dokumentacija proveravaju se pre objave.', 'Vozilo se vizuelno i tehnicki pregleda pre preporuke.', 'Pazljivo selektovan uvoz za kupce koji traze sigurnost.', 'Kupovina je jasna, bez pritiska i bez skrivenih stavki.'],
      };
  const platformDisclaimer = locale === 'sq'
    ? 'Automjetet ne platforme vijne nga oferta e auto dilereve partnere te perzgjedhur. MojAutoDiler nuk i posedon domosdoshmerisht te gjitha automjetet direkt, por i kuron dhe i prezanton ne nje vend per nje pregled me te lehte dhe me te sigurt.'
    : 'Vozila prikazana na platformi dolaze iz ponude odabranih partnerskih auto dilera. MojAutoDiler ne poseduje nuzno sva vozila direktno, vec ih pazljivo bira i predstavlja na jednom mestu radi lakseg i sigurnijeg pregleda ponude.';
  const activeVehicleImage = vehicle.images[activeImage] || vehicle.images[0];
  const activeImageUrl = activeVehicleImage?.url || '';
  const imageCount = Math.max(vehicle.images.length, 1);
  const vatText = formatVatMode(vehicle.vatMode);

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

  const recordLeadIntent = (intent: string, channel: string, message?: string) => {
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
      }),
    }).catch(console.error);
  };

  const applyQuickLead = (message: string, intent: string = 'general_inquiry') => {
    setForm((current) => ({ ...current, message }));
    recordLeadIntent(intent, 'web', message);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-(--color-bg) pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-(--color-text-muted)">
          <Link href={`/${locale}`} className="hover:text-(--color-text) transition-colors">
            Početna
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
          Nazad na listu vozila
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
                <VehicleStatusBadge vehicle={vehicle} />
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
                <a
                  href={`tel:${contact.phone}`}
                  onClick={() => recordLeadIntent('phone_call', 'phone')}
                  className="btn-gold touch-target flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                >
                  <Phone size={14} />
                  {t.common.call}
                </a>
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
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <PremiumVehiclePlaceholder />
                )}

                {/* Overlay + watermark */}
                <span className="absolute inset-0 bg-black/10" aria-hidden="true" />
                {activeImageUrl && <span className="vehicle-watermark" aria-hidden="true">MOJAUTODILER</span>}

                {/* Transparent lightbox trigger */}
                <button
                  type="button"
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Otvori galeriju"
                />

                {/* Nav arrows — after the click target, naturally on top in stacking order */}
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImg}
                      aria-label="Prethodna slika"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-(--color-text) shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImg}
                      aria-label="Sledeća slika"
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
                        sizes="96px"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                      <span className="vehicle-watermark vehicle-watermark-thumb" aria-hidden="true">MOJAUTODILER</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <section className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 shadow-sm min-[390px]:p-5 sm:p-6">
              <div className="flex flex-col gap-4 min-[390px]:gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--accent-dark)] shadow-sm">
                    <ShieldCheck size={14} />
                    Dealer confidence
                  </div>
                  <h2 className="text-xl font-black text-[var(--color-text)] min-[390px]:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {quickActionCopy.confidenceTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] min-[390px]:leading-7">{quickActionCopy.confidenceSub}</p>
                </div>
                <TrustBadges locale={locale} badges={trustBadges} className="lg:max-w-sm lg:justify-end" />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {quickActionCopy.bullets.map((bullet) => (
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
                  <h2 className="font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>Brze akcije za kupce</h2>
                  <p className="mt-1 text-sm text-(--color-text-muted)">Izaberite najbrzi sledeci korak za ovo vozilo.</p>
                </div>
                <MessageCircle size={20} className="shrink-0 text-[var(--accent)]" />
              </div>
              <div className="grid gap-2 min-[430px]:grid-cols-2 lg:grid-cols-5">
                <QuickLeadButton icon={<CalendarCheck size={15} />} label={quickActionCopy.book} onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`, 'schedule_viewing')} />
                <QuickLeadButton icon={<Video size={15} />} label={quickActionCopy.video} onClick={() => applyQuickLead(`${quickActionCopy.video}: ${vehicle.title}`, 'request_video')} />
                <QuickLeadButton icon={<ShieldCheck size={15} />} label={quickActionCopy.availability} onClick={() => applyQuickLead(`${quickActionCopy.availability}: ${vehicle.title}`, 'general_inquiry')} />
                <QuickLeadButton icon={<LockKeyhole size={15} />} label={quickActionCopy.reserve} onClick={() => applyQuickLead(`${quickActionCopy.reserve}: ${vehicle.title}`, 'reservation_request')} />
                {contact.viber && (
                  <a href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`} onClick={() => recordLeadIntent('viber_click', 'viber')} className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7360F2]/20 bg-[#7360F2]/5 px-3 py-3 text-xs font-black text-[#6B5FDB] transition hover:bg-[#7360F2]/10">
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
                    {locale === 'sq' ? 'Partner i Rrjetit' : 'Partnerska Mreža'}
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
                        {locale === 'sq' ? 'Verifikuar' : 'Verifikovan diler'}
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
                  {contact.phone && <a href={`tel:${contact.phone}`} onClick={() => recordLeadIntent('phone_call', 'phone')} className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm"><Phone size={15} />{t.common.call}</a>}
                  {contact.viber && <a href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`} onClick={() => recordLeadIntent('viber_click', 'viber')} className="btn-outline inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm"><ViberIcon size={15} />Viber</a>}
                </div>
              </div>
              <p className="mt-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-xs leading-5 text-[var(--color-text-muted)] min-[390px]:p-4">
                {platformDisclaimer}
              </p>
            </section>

            {/* Tabs */}
            <div className="rounded-2xl border border-(--color-border) bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="flex border-b border-(--color-border) overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
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
                      { label: 'Oprema', items: vehicle.equipment },
                      { label: 'Stanje vozila', items: vehicle.features },
                    ]}
                  />
                )}

                {activeTab === 'safety' && (
                  <EquipmentGroups
                    groups={[{ label: 'Sigurnost', items: vehicle.safetyFeatures }]}
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
              <p className="text-(--color-text-muted) text-sm mb-6">
                {t.inquiry.interested}:{' '}
                <span className="font-semibold text-(--color-text)">{vehicle.title}</span>
              </p>

              {submitted ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
                  <Check size={18} className="text-green-600 shrink-0" />
                  <span className="text-green-700 text-sm font-medium">{t.contact.success}</span>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  recordLeadIntent('general_inquiry', form.email ? 'email' : 'phone', form.message || `${t.inquiry.interested}: ${vehicle.title}`);
                  setSubmitted(true);
                }} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      required type="text"
                      placeholder={t.inquiry.namePlaceholder}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                    />
                    <input
                      required type="tel"
                      placeholder={t.inquiry.phonePlaceholder}
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t.inquiry.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                  />
                  <textarea
                    placeholder={t.inquiry.messagePlaceholder}
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm resize-none"
                  />
                  <button type="submit" className="btn-gold w-full rounded-xl py-3.5 text-sm flex items-center justify-center gap-2">
                    <Send size={14} />
                    {t.inquiry.send}
                  </button>
                </form>
              )}
            </div>
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
                    Cena vozila
                  </p>
                  <div
                    className="text-[2rem] font-black leading-none text-[var(--color-text)] min-[390px]:text-[2.35rem]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatPrice(vehicle.price, vehicle.currency)}
                  </div>
                  {vatText && <p className="mt-2 text-xs font-semibold tracking-[0.01em] text-[var(--color-text-muted)]">{vatText}</p>}
                </div>

                <div className="relative mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`, 'schedule_viewing')}
                    className="btn-gold flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm shadow-[0_16px_34px_rgba(201,168,76,0.24)]"
                  >
                    <CalendarCheck size={15} />
                    {quickActionCopy.book}
                  </button>
                  <div className={`grid gap-2.5 ${contact.phone && contact.viber ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={() => recordLeadIntent('phone_call', 'phone')}
                        className="btn-dark flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm"
                      >
                        <Phone size={15} />
                        {t.common.call}
                      </a>
                    )}
                    {contact.viber && (
                      <a
                        href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`}
                        onClick={() => recordLeadIntent('viber_click', 'viber')}
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
                          ? (locale === 'sq' ? 'Verifikuar' : 'Verifikovan auto diler')
                          : 'Platforma'}
                      </p>
                      <p className="truncate font-black text-(--color-text) text-base" style={{ fontFamily: 'var(--font-display)' }}>
                        {contact.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 100€ discount sidebar promo card */}
              <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-white p-5 shadow-sm">
                {/* Thin gold top accent — matches the price card language */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)]" aria-hidden="true" />

                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
                  Posebna akcija
                </p>
                <h3
                  className="text-base font-black leading-snug text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ostvari 100€ popusta
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-[var(--color-text-muted)]">
                  Podeli jedno drugo vozilo iz naše ponude, zaprati i taguj MojAutoDiler, pa nam pošalji screenshot.
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)] opacity-70">
                  Popust je fiksno 100€ i ne uvećava se deljenjem više vozila.
                </p>
                <Link
                  href={`/${locale}/contact?discount=share&vehicle=${encodeURIComponent(vehicle.slug)}&vehicleTitle=${encodeURIComponent(vehicle.title)}`}
                  className="btn-gold mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm"
                >
                  <Send size={14} />
                  Pošalji screenshot
                </Link>
              </div>
            </div>
          </div>
        </div>

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

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-(--color-border) bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center gap-1.5 px-2.5 py-2.5 min-[360px]:gap-2 min-[390px]:px-4 min-[390px]:py-3">
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-sm font-black leading-tight text-(--color-gold-dark) min-[390px]:text-lg"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            <div className="mt-0.5 truncate text-xs text-(--color-text-muted)">{vehicle.title}</div>
          </div>
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={() => recordLeadIntent('phone_call', 'phone')}
              className="btn-gold touch-target flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm min-[390px]:px-5 min-[390px]:py-3"
            >
              <Phone size={15} />
              <span className="hidden min-[360px]:inline">{t.common.call}</span>
            </a>
          )}
          {contact.viber && (
            <a
              href={`viber://chat?number=%2B${contact.viber.replace(/\D/g, '')}`}
              onClick={() => recordLeadIntent('viber_click', 'viber')}
              className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7360F2]/20 bg-[#7360F2]/10 text-[#6B5FDB]"
              aria-label="Viber"
            >
              <ViberIcon size={18} />
            </a>
          )}
          {contact.instagram && (
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E1306C]/20 bg-[#E1306C]/10 text-[#E1306C]"
              aria-label="Instagram"
            >
              <InstagramIcon size={17} />
            </a>
          )}
          <button
            type="button"
            onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`, 'schedule_viewing')}
            className="btn-dark touch-target hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-3 text-xs min-[430px]:flex"
          >
            <CalendarCheck size={14} />
            Book
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
      <MobileContactFab
        phone={contact.phone}
        viber={contact.viber}
        instagram={contact.instagram || undefined}
        onPhoneClick={() => recordLeadIntent('phone_call', 'phone')}
        onViberClick={() => recordLeadIntent('viber_click', 'viber')}
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
            onClick={() => setLightboxOpen(false)}
            aria-label="Zatvori galeriju"
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
                onClick={prevImg}
                aria-label="Prethodna slika"
                className="absolute left-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 sm:left-4"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                onClick={nextImg}
                aria-label="Sledeća slika"
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

function QuickLeadButton({ icon, label, onClick }: { readonly icon: React.ReactNode; readonly label: string; readonly onClick: () => void }) {
  return (
    <button
      type="button"
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
