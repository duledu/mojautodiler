'use client';

import { useState } from 'react';
import { Check, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { getDealerInfo } from '@/data/vehicles';

interface ContactClientProps {
  locale: Locale;
  t: TranslationKeys;
}

export default function ContactClient({ t }: ContactClientProps) {
  const dealer = getDealerInfo();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

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
            <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="mb-6 text-xl font-black text-[var(--color-text)]">
                AutoElite Preševo
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: 'Telefon', value: dealer.phone, href: `tel:${dealer.phone}` },
                  { icon: Mail, label: 'Email', value: dealer.email, href: `mailto:${dealer.email}` },
                  { icon: MapPin, label: t.contact.address, value: dealer.address },
                  { icon: Clock, label: t.contact.workingHours, value: dealer.workingHours },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        {label}
                      </div>
                      {href ? (
                        <a href={href} className="break-words text-base font-semibold text-[var(--color-text)] transition hover:text-[var(--accent-dark)]">
                          {value}
                        </a>
                      ) : (
                        <div className="break-words text-base font-semibold text-[var(--color-text)]">{value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.79 14.22c-.2.2-.42.33-.67.37-.46.08-.93-.06-1.34-.29-.91-.51-1.77-1.1-2.53-1.79-.73-.67-1.39-1.41-1.96-2.22-.48-.69-.88-1.43-1.08-2.24-.08-.34-.04-.7.13-1.01.17-.31.46-.55.79-.63.08-.02.17-.03.25-.03.24 0 .48.1.64.28.41.44.77.92 1.06 1.43.15.26.12.59-.08.82l-.28.33c-.09.11-.11.27-.04.4.26.51.61.97 1.02 1.37.41.4.87.75 1.38 1.01.12.06.27.05.38-.04l.33-.27c.23-.19.56-.22.82-.07.51.29 1 .65 1.43 1.07.19.18.28.44.26.7-.02.26-.14.5-.31.67z" />
                    </svg>
                  ),
                  label: 'Viber',
                  href: `viber://chat?number=${dealer.viber.replace(/\s/g, '')}`,
                  className: 'text-[#7360F2]',
                },
                { icon: <Phone size={20} />, label: t.common.call, href: `tel:${dealer.phone}`, className: 'text-[var(--accent)]' },
                { icon: <FacebookIcon size={20} />, label: 'Facebook', href: dealer.facebook, className: 'text-[#1877F2]' },
                { icon: <InstagramIcon size={20} />, label: 'Instagram', href: dealer.instagram, className: 'text-[#C13584]' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[0_12px_28px_rgba(15,15,20,0.08)]"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-2)] ${item.className}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_48px_rgba(15,15,20,0.08)] sm:p-8">
            <h2 className="mb-6 text-2xl font-black text-[var(--color-text)]">{t.contact.sendMessage}</h2>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check size={28} />
                </div>
                <p className="font-bold text-[var(--color-text)]">{t.contact.success}</p>
                <p className="text-sm text-[var(--color-text-muted)]">Kontaktiracemo vas uskoro.</p>
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="space-y-5">
                <Field label={`${t.contact.name} *`}>
                  <input required type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={`${t.contact.phone} *`}>
                  <input required type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={t.contact.email}>
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="input-premium w-full rounded-xl px-4 py-3 text-sm" />
                </Field>
                <Field label={`${t.contact.message} *`}>
                  <textarea required rows={5} placeholder={t.contact.messagePlaceholder} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="input-premium w-full resize-none rounded-xl px-4 py-3 text-sm" />
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
