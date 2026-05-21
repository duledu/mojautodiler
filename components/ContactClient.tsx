'use client';

import { useRef, useState } from 'react';
import { Check, Paperclip, Send, X } from 'lucide-react';
import { Locale, TranslationKeys } from '@/lib/i18n';
import type { DealerInfo } from '@/lib/db/mappers';
import type { Vehicle } from '@/types/vehicle';
import HeroVehicleCard from '@/components/vehicle/HeroVehicleCard';

// Labels for the hero card — mirrors homepage homeCopy
const heroCardCopy: Record<Locale, { featuredLabel: string; verifiedLine: string; viewDetails: string }> = {
  sr: {
    featuredLabel: 'Izdvojena ponuda',
    verifiedLine: 'Provereno poreklo, servis i stanje',
    viewDetails: 'Pogledaj detalje',
  },
  sq: {
    featuredLabel: 'Ofertë e zgjedhur',
    verifiedLine: 'Origjine, servis dhe gjendje e verifikuar',
    viewDetails: 'Shiko detajet',
  },
};

const ACCEPTED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface ContactClientProps {
  locale: Locale;
  t: TranslationKeys;
  dealer: DealerInfo;
  heroVehicle: Vehicle | null;
  discountMode?: boolean;
  discountVehicleSlug?: string;
  discountVehicleTitle?: string;
}

// `dealer` is kept in props for when the left-side contact info block is restored
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ContactClient({ locale, t, dealer, heroVehicle, discountMode, discountVehicleTitle }: ContactClientProps) {
  const defaultMessage = discountMode && discountVehicleTitle
    ? `Zdravo, šaljem screenshot o deljenju za 100€ popusta za vozilo: ${discountVehicleTitle}.`
    : '';
  const [form, setForm]             = useState({ name: '', phone: '', email: '', message: defaultMessage });
  const [submitted, setSubmitted]   = useState(false);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardCopy = heroCardCopy[locale];

  // ── Image helpers ────────────────────────────────────────────────────────────
  const applyFile = (file: File | null) => {
    setImageError('');
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) { setImageFile(null); setImagePreview(''); return; }

    if (!ACCEPTED_MIMES.includes(file.type)) {
      setImageError('Dozvoljeni formati: JPG, PNG, WEBP');
      setImageFile(null); setImagePreview('');
      return;
    }
    if (file.size > MAX_BYTES) {
      setImageError('Maksimalna veličina je 5 MB');
      setImageFile(null); setImagePreview('');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0] ?? null);
  };

  const clearImage = () => {
    applyFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Form submit — sends multipart/form-data so the image travels with the lead
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('type', 'contact');
    fd.append('name', form.name);
    fd.append('phone', form.phone);
    if (form.email)  fd.append('email', form.email);
    fd.append('message', form.message);
    fd.append('intent', 'general_inquiry');
    fd.append('preferredContactChannel', form.email ? 'email' : 'phone');
    if (imageFile) fd.append('image', imageFile);

    // Fire-and-forget — mirrors existing behaviour; form never waits on network
    fetch('/api/leads', { method: 'POST', body: fd }).catch(console.error);
    setSubmitted(true);
  };

  /*
   * LEFT-SIDE CONTACT INFO — temporarily hidden, data kept for restore.
   *
   * const cleanViber = dealer.viber.replace(/\D/g, '');
   *
   * const contactRows = [
   *   dealer.phone        && { icon: Phone,         label: 'Telefon',               value: dealer.phone,        href: `tel:${dealer.phone}` },
   *   dealer.email        && { icon: Mail,           label: 'Email',                 value: dealer.email,        href: `mailto:${dealer.email}` },
   *   dealer.address      && { icon: MapPin,         label: t.contact.address,       value: dealer.address,      href: undefined },
   *   dealer.workingHours && { icon: Clock,          label: t.contact.workingHours,  value: dealer.workingHours, href: undefined },
   * ].filter(Boolean) as { icon: React.ComponentType<{ size?: number }>; label: string; value: string; href?: string }[];
   *
   * const quickActions = [
   *   dealer.viber     && { icon: <ViberIcon size={20} />,     label: 'Viber',       href: `viber://chat?number=%2B${cleanViber}`,  cls: 'text-[#7360F2]' },
   *   dealer.phone     && { icon: <Phone size={20} />,         label: t.common.call, href: `tel:${dealer.phone}`,                   cls: 'text-[var(--accent)]' },
   *   dealer.smsPhone  && { icon: <MessageSquare size={20} />, label: 'SMS',         href: `sms:${dealer.smsPhone}`,                cls: 'text-emerald-600' },
   *   dealer.facebook  && { icon: <FacebookIcon size={20} />,  label: 'Facebook',    href: dealer.facebook,                         cls: 'text-[#1877F2]' },
   *   dealer.instagram && { icon: <InstagramIcon size={20} />, label: 'Instagram',   href: dealer.instagram,                        cls: 'text-[#C13584]' },
   * ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string; cls: string }[];
   */

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 sm:pt-28">
      <section className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="divider-gold mb-5" />
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--color-text)] sm:text-5xl">
            {t.contact.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-[var(--color-text-muted)]">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/*
         * Grid: single column on mobile, two columns on lg+.
         * DOM order: form first (top on mobile), vehicle card second (below on mobile).
         * On lg+, CSS order flips them: vehicle card left (order-1), form right (order-2).
         */}
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">

          {/* ── Inquiry form — first in DOM → top on mobile, right column on desktop ── */}
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_48px_rgba(15,15,20,0.08)] sm:p-8 lg:order-2">
            <h2 className="mb-6 text-2xl font-black text-[var(--color-text)]">{t.contact.sendMessage}</h2>

            {/* Discount context banner — shown when arriving from vehicle share flow */}
            {discountMode && (
              <div className="mb-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4">
                <p className="text-sm font-black text-[var(--color-text)]">Deljenjem ostvarujete 100€ popusta</p>
                {discountVehicleTitle && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Vozilo: <strong className="text-[var(--color-text)]">{discountVehicleTitle}</strong>
                  </p>
                )}
                <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                  Priložite screenshot vaše objave ili tagovanja u polju ispod.
                </p>
              </div>
            )}

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check size={28} />
                </div>
                <p className="font-bold text-[var(--color-text)]">{t.contact.success}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Kontaktiraćemo vas uskoro.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label={`${t.contact.name} *`}>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>

                <Field label={`${t.contact.phone} *`}>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>

                <Field label={t.contact.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="input-premium w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>

                <Field label={`${t.contact.message} *`}>
                  <textarea
                    required
                    rows={5}
                    placeholder={t.contact.messagePlaceholder}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="input-premium w-full resize-none rounded-xl px-4 py-3 text-sm"
                  />
                </Field>

                {/* ── Image attachment ─────────────────────────────────────────── */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-2)]">
                    Priloži sliku (opciono)
                  </span>
                  {discountMode && (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Pošaljite screenshot objave kako bismo evidentirali vaš popust.
                    </p>
                  )}

                  {imageFile && imagePreview ? (
                    /* Selected — thumbnail + filename + clear */
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {imageFile.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {(imageFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        aria-label="Ukloni sliku"
                        className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    /* Empty — dashed upload trigger */
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-4 transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]">
                      <Paperclip size={16} className="shrink-0 text-[var(--accent)]" />
                      <span className="select-none text-sm text-[var(--color-text-muted)]">
                        Klikni za dodavanje slike — JPG, PNG, WEBP, max 5 MB
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}

                  {imageError && (
                    <p className="text-xs font-medium text-red-500">{imageError}</p>
                  )}
                </div>
                {/* ─────────────────────────────────────────────────────────────── */}

                <button
                  type="submit"
                  className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm"
                >
                  <Send size={16} />
                  {t.contact.sendMessage}
                </button>
              </form>
            )}
          </div>

          {/* ── Hero vehicle card — second in DOM → below form on mobile, left column on desktop ── */}
          {heroVehicle && (
            <div className="lg:order-1">
              <HeroVehicleCard
                vehicle={heroVehicle}
                locale={locale}
                t={t}
                featuredLabel={cardCopy.featuredLabel}
                verifiedLine={cardCopy.verifiedLine}
                viewLabel={cardCopy.viewDetails}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-2)]">
        {label}
      </span>
      {children}
    </label>
  );
}
