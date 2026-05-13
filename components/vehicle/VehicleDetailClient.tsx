'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon } from '@/components/ui/SocialIcons';
import {
  Phone, ChevronLeft, ChevronRight, X, Check,
  ArrowLeft, Send, MapPin, Clock, ShieldCheck,
} from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { formatPrice, formatMileage, cn } from '@/lib/utils';
import { getDealerInfo } from '@/data/vehicles';
import VehicleCard from '@/components/vehicle/VehicleCard';

interface Props {
  readonly vehicle: Vehicle;
  readonly similar: Vehicle[];
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function VehicleDetailClient({ vehicle, similar, locale, t }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'equipment' | 'safety' | 'description'>('specs');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const dealer = getDealerInfo();
  const activeVehicleImage = vehicle.images[activeImage] || vehicle.images[0];
  const activeImageUrl =
    activeVehicleImage?.url ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80';

  const nextImg = () => setActiveImage((i) => (i + 1) % vehicle.images.length);
  const prevImg = () => setActiveImage((i) => (i - 1 + vehicle.images.length) % vehicle.images.length);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href={`/${locale}/inventory`}
          className="inline-flex items-center gap-2 text-(--color-text-muted) hover:text-(--color-text) text-sm transition-colors mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowLeft size={15} />
          Nazad na listu vozila
        </Link>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div className="space-y-7">
            {/* Title */}
            <div>
              <h1
                className="text-3xl font-black text-(--color-text) sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {vehicle.title}
              </h1>
              <p className="mt-1.5 text-(--color-text-muted)">
                {vehicle.year}. godište · {t.condition[vehicle.condition]}
              </p>
            </div>

            {/* Gallery */}
            <div>
              <button
                type="button"
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-(--color-surface-2) cursor-zoom-in shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                onClick={() => setLightboxOpen(true)}
                aria-label="Otvori galeriju"
              >
                <Image
                  src={activeImageUrl}
                  alt={activeVehicleImage?.alt || vehicle.title}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); prevImg(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-(--color-text) shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); nextImg(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-(--color-text) shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                  {activeImage + 1} / {vehicle.images.length}
                </div>
              </button>

              {vehicle.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {vehicle.images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        'relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all',
                        i === activeImage
                          ? 'border-(--color-gold) shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      )}
                    >
                      <Image src={img.url} alt={img.alt} fill sizes="96px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                {activeTab === 'specs' && (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {specs.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-xl bg-(--color-surface-2) px-4 py-3"
                      >
                        <span className="text-xs text-(--color-text-muted)">{label}</span>
                        <span className="text-sm font-semibold text-(--color-text)">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'equipment' && (
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {vehicle.equipment.map((item) => (
                      <div key={item} className="flex items-center gap-2.5 py-2">
                        <div className="w-5 h-5 rounded-full bg-(--color-gold-bg) border border-(--color-gold-border) flex items-center justify-center shrink-0">
                          <Check size={11} className="text-(--color-gold-dark)" />
                        </div>
                        <span className="text-sm text-(--color-text-2)">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {vehicle.safetyFeatures.map((item) => (
                      <div key={item} className="flex items-center gap-2.5 py-2">
                        <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-green-600" />
                        </div>
                        <span className="text-sm text-(--color-text-2)">{item}</span>
                      </div>
                    ))}
                  </div>
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
            <div className="rounded-2xl border border-(--color-border) bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
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
              <div className="rounded-2xl border border-(--color-border) bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
                <div
                  className="text-3xl font-black text-(--color-gold-dark)"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {formatPrice(vehicle.price, vehicle.currency)}
                </div>
                <p className="text-xs text-(--color-text-muted) mt-1 mb-5">Cena uključuje PDV</p>

                <div className="space-y-2.5">
                  <a
                    href={`tel:${dealer.phone}`}
                    className="btn-gold flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm"
                  >
                    <Phone size={15} />
                    {t.common.call}
                  </a>
                  <a
                    href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold border border-[#7360F2]/25 text-[#6B5FDB] bg-[#7360F2]/5 hover:bg-[#7360F2]/10 transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.79 14.22c-.2.2-.42.33-.67.37-.46.08-.93-.06-1.34-.29-.91-.51-1.77-1.1-2.53-1.79-.73-.67-1.39-1.41-1.96-2.22-.48-.69-.88-1.43-1.08-2.24-.08-.34-.04-.7.13-1.01.17-.31.46-.55.79-.63.08-.02.17-.03.25-.03.24 0 .48.1.64.28.41.44.77.92 1.06 1.43.15.26.12.59-.08.82l-.28.33c-.09.11-.11.27-.04.4.26.51.61.97 1.02 1.37.41.4.87.75 1.38 1.01.12.06.27.05.38-.04l.33-.27c.23-.19.56-.22.82-.07.51.29 1 .65 1.43 1.07.19.18.28.44.26.7-.02.26-.14.5-.31.67z" />
                    </svg>
                    Viber
                  </a>
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
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white border-t border-(--color-border) shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center p-3 gap-2">
          <div className="flex-1 min-w-0">
            <div
              className="font-black text-base leading-tight text-(--color-gold-dark)"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            <div className="text-xs text-(--color-text-muted) truncate">{vehicle.title}</div>
          </div>
          <a
            href={`tel:${dealer.phone}`}
            className="btn-gold flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm shrink-0"
          >
            <Phone size={14} />
            {t.common.call}
          </a>
          <a
            href={`viber://chat?number=${dealer.viber.replace(/\s/g, '')}`}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7360F2]/10 border border-[#7360F2]/20 text-[#6B5FDB] shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.79 14.22c-.2.2-.42.33-.67.37-.46.08-.93-.06-1.34-.29-.91-.51-1.77-1.1-2.53-1.79-.73-.67-1.39-1.41-1.96-2.22-.48-.69-.88-1.43-1.08-2.24-.08-.34-.04-.7.13-1.01.17-.31.46-.55.79-.63.08-.02.17-.03.25-.03.24 0 .48.1.64.28.41.44.77.92 1.06 1.43.15.26.12.59-.08.82l-.28.33c-.09.11-.11.27-.04.4.26.51.61.97 1.02 1.37.41.4.87.75 1.38 1.01.12.06.27.05.38-.04l.33-.27c.23-.19.56-.22.82-.07.51.29 1 .65 1.43 1.07.19.18.28.44.26.7-.02.26-.14.5-.31.67z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

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
          <Image
            src={activeImageUrl}
            alt={activeVehicleImage?.alt || vehicle.title}
            width={1400}
            height={900}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeImage + 1} / {vehicle.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
