'use client';

import { useState } from 'react';
import { Check, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { FacebookIcon, InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import { Locale, TranslationKeys } from '@/lib/i18n';
import type { DealerInfo } from '@/lib/db/mappers';

interface ContactClientProps {
  locale: Locale;
  t: TranslationKeys;
  dealer: DealerInfo;
}

export default function ContactClient({ t, dealer }: ContactClientProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const cleanViber = dealer.viber.replace(/\D/g, '');

  // Only show contact rows that have data
  const contactRows = [
    dealer.phone       && { icon: Phone,   label: 'Telefon',              value: dealer.phone,       href: `tel:${dealer.phone}` },
    dealer.email       && { icon: Mail,    label: 'Email',                value: dealer.email,       href: `mailto:${dealer.email}` },
    dealer.address     && { icon: MapPin,  label: t.contact.address,      value: dealer.address,     href: undefined },
    dealer.workingHours && { icon: Clock,  label: t.contact.workingHours, value: dealer.workingHours, href: undefined },
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number }>; label: string; value: string; href?: string }[];

  // Quick-action buttons — only those with a configured value
  const quickActions = [
    dealer.viber     && { icon: <ViberIcon size={20} />,    label: 'Viber',         href: `viber://chat?number=%2B${cleanViber}`,                  cls: 'text-[#7360F2]' },
    dealer.phone     && { icon: <Phone size={20} />,        label: t.common.call,   href: `tel:${dealer.phone}`,                                   cls: 'text-[var(--accent)]' },
    dealer.smsPhone  && { icon: <MessageSquare size={20} />, label: 'SMS',           href: `sms:${dealer.smsPhone}`,                                cls: 'text-emerald-600' },
    dealer.facebook  && { icon: <FacebookIcon size={20} />, label: 'Facebook',      href: dealer.facebook,                                         cls: 'text-[#1877F2]' },
    dealer.instagram && { icon: <InstagramIcon size={20} />, label: 'Instagram',     href: dealer.instagram,                                        cls: 'text-[#C13584]' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string; cls: string }[];

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
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="space-y-5">
            {/* Contact info card */}
            {contactRows.length > 0 && (
              <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-7">
                <h2 className="mb-6 text-xl font-black text-[var(--color-text)]">
                  {dealer.name || 'AutoFerari'}
                </h2>
                <div className="space-y-5">
                  {contactRows.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                          {label}
                        </div>
                        {href ? (
                          <a href={href} className="break-words whitespace-pre-line text-base font-semibold text-[var(--color-text)] transition hover:text-[var(--accent-dark)]">
                            {value}
                          </a>
                        ) : (
                          <div className="break-words whitespace-pre-line text-base font-semibold text-[var(--color-text)]">{value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick-action buttons */}
            {quickActions.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[0_12px_28px_rgba(15,15,20,0.08)]"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-2)] ${item.cls}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text)]">{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Inquiry form */}
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_48px_rgba(15,15,20,0.08)] sm:p-8">
            <h2 className="mb-6 text-2xl font-black text-[var(--color-text)]">{t.contact.sendMessage}</h2>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check size={28} />
                </div>
                <p className="font-bold text-[var(--color-text)]">{t.contact.success}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Kontaktiraćemo vas uskoro.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                <Field label={`${t.contact.name} *`}>
                  <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={`${t.contact.phone} *`}>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={t.contact.email}>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={`${t.contact.message} *`}>
                  <textarea required rows={5} placeholder={t.contact.messagePlaceholder} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input-premium w-full resize-none rounded-xl px-4 py-3 text-sm" />
                </Field>
                <button type="submit" className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm">
                  <Send size={16} />
                  {t.contact.sendMessage}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-2)]">
        {label}
      </span>
      {children}
    </label>
  );
}
