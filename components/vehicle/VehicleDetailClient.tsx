'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon, InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import {
  Phone, ChevronLeft, ChevronRight, X, Check,
  ArrowLeft, Send, MapPin, Clock, ShieldCheck, CalendarCheck, Video, LockKeyhole, MessageCircle,
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { formatPrice, formatMileage, cn, formatVatMode } from '@/lib/utils';
import { getDealerInfo } from '@/data/vehicles';
import VehicleCard from '@/components/vehicle/VehicleCard';
import MobileContactFab from '@/components/vehicle/MobileContactFab';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';

interface Props {
  readonly vehicle: Vehicle;
  readonly similar: Vehicle[];
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function VehicleDetailClient({ vehicle, similar, locale, t }: Props) {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'equipment' | 'safety' | 'description'>('specs');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const dealer = getDealerInfo();
  const trustBadges = getVehicleTrustBadges(vehicle);
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
  const activeVehicleImage = vehicle.images[activeImage] || vehicle.images[0];
  const activeImageUrl = activeVehicleImage?.url || '';
  const imageCount = Math.max(vehicle.images.length, 1);
  const vatText = formatVatMode(vehicle.vatMode);

  const nextImg = () => setActiveImage((i) => (i + 1) % imageCount);
  const prevImg = () => setActiveImage((i) => (i - 1 + imageCount) % imageCount);

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

  const applyQuickLead = (message: string) => {
    setForm((current) => ({ ...current, message }));
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
          {/* Left column */}
          <div className="space-y-5 min-[390px]:space-y-7">
            {/* Title */}
            <div>
              <h1
                className="text-xl font-black leading-tight text-(--color-text) min-[390px]:text-2xl sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {vehicle.title}
              </h1>
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
                  href={`tel:${dealer.phone}`}
                  className="btn-gold touch-target flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                >
                  <Phone size={14} />
                  {t.common.call}
                </a>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-(--color-surface-2) shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:aspect-video">
                <button
                  type="button"
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Otvori galeriju"
                >
                  {activeImageUrl ? (
                    <Image
                      src={activeImageUrl}
                      alt={activeVehicleImage?.alt || vehicle.title}
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <PremiumVehiclePlaceholder />
                  )}
                  <span className="absolute inset-0 bg-black/10" aria-hidden="true" />
                  {activeImageUrl && <span className="vehicle-watermark" aria-hidden="true">MOJAUTODILER</span>}
                </button>
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
                      <Image src={img.url} alt={img.alt} fill sizes="96px" className="object-cover" />
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
                <QuickLeadButton icon={<CalendarCheck size={15} />} label={quickActionCopy.book} onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`)} />
                <QuickLeadButton icon={<Video size={15} />} label={quickActionCopy.video} onClick={() => applyQuickLead(`${quickActionCopy.video}: ${vehicle.title}`)} />
                <QuickLeadButton icon={<ShieldCheck size={15} />} label={quickActionCopy.availability} onClick={() => applyQuickLead(`${quickActionCopy.availability}: ${vehicle.title}`)} />
                <QuickLeadButton icon={<LockKeyhole size={15} />} label={quickActionCopy.reserve} onClick={() => applyQuickLead(`${quickActionCopy.reserve}: ${vehicle.title}`)} />
                <a href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`} className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7360F2]/20 bg-[#7360F2]/5 px-3 py-3 text-xs font-black text-[#6B5FDB] transition hover:bg-[#7360F2]/10">
                  <ViberIcon size={15} />
                  {quickActionCopy.viber}
                </a>
              </div>
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
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
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
                    onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`)}
                    className="btn-gold flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm shadow-[0_16px_34px_rgba(201,168,76,0.24)]"
                  >
                    <CalendarCheck size={15} />
                    {quickActionCopy.book}
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${dealer.phone}`}
                      className="btn-dark flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl px-3 text-sm"
                    >
                      <Phone size={15} />
                      {t.common.call}
                    </a>
                    <a
                      href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`}
                      className="flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl border border-[#7360F2]/25 bg-[#7360F2]/5 px-3 text-sm font-semibold text-[#6B5FDB] transition-colors hover:bg-[#7360F2]/10"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <ViberIcon size={15} />
                      Viber
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={dealer.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border border-[#1877F2]/20 text-[#1877F2] bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <FacebookIcon size={13} />
                      Facebook
                    </a>
                    <a
                      href={dealer.instagram}
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
                  </div>
                </div>
              </div>

              {/* Dealer card */}
              <div className="rounded-2xl border border-(--color-border) bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-(--color-gold) flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <p
                      className="font-bold text-(--color-text) text-sm"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {dealer.name}
                    </p>
                    <p className="text-xs text-(--color-text-muted)">Verifikovani prodavac</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-(--color-text-muted)">
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="shrink-0 mt-0.5 text-(--color-gold)" />
                    <span>{dealer.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={13} className="shrink-0 mt-0.5 text-(--color-gold)" />
                    <span>{dealer.workingHours}</span>
                  </div>
                </div>
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
          <a
            href={`tel:${dealer.phone}`}
            className="btn-gold touch-target flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm min-[390px]:px-5 min-[390px]:py-3"
          >
            <Phone size={15} />
            <span className="hidden min-[360px]:inline">{t.common.call}</span>
          </a>
          <a
            href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`}
            className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7360F2]/20 bg-[#7360F2]/10 text-[#6B5FDB]"
            aria-label="Viber"
          >
            <ViberIcon size={18} />
          </a>
          <a
            href={dealer.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E1306C]/20 bg-[#E1306C]/10 text-[#E1306C]"
            aria-label="Instagram"
          >
            <InstagramIcon size={17} />
          </a>
          <button
            type="button"
            onClick={() => applyQuickLead(`${quickActionCopy.book}: ${vehicle.title}`)}
            className="btn-dark touch-target hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-3 text-xs min-[430px]:flex"
          >
            <CalendarCheck size={14} />
            Book
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
      <MobileContactFab phone={dealer.phone} viber={dealer.viber} instagram={dealer.instagram} />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center animate-fade-in">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/15 rounded-full hover:bg-white/25 z-10"
          >
            <X size={20} />
          </button>
          {vehicle.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-white/15 rounded-full hover:bg-white/25"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white bg-white/15 rounded-full hover:bg-white/25"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {activeImageUrl ? (
            <div className="vehicle-lightbox-image relative overflow-hidden rounded-xl">
              <Image
                src={activeImageUrl}
                alt={activeVehicleImage?.alt || vehicle.title}
                width={1400}
                height={900}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
              <span className="vehicle-watermark vehicle-watermark-lightbox" aria-hidden="true">MOJAUTODILER</span>
              <span className="vehicle-watermark-pattern" aria-hidden="true" />
            </div>
          ) : (
            <div className="h-[60vh] w-[90vw] max-w-4xl overflow-hidden rounded-xl">
              <PremiumVehiclePlaceholder />
            </div>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
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
