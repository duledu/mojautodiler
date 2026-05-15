'use client';

import { useState } from 'react';
import { Building, CheckCircle, Clock, Globe, Mail, MapPin, MessageSquare, Phone, Save, ShieldAlert } from 'lucide-react';
import type { DealerInfo } from '@/lib/db/mappers';

interface Props {
  readonly dealer: DealerInfo;
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly type?: string;
  readonly placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-text-muted)">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--accent)" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-premium w-full rounded-2xl py-3 pl-10 pr-4 text-sm"
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, text }: { readonly icon: React.ReactNode; readonly title: string; readonly text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--accent-border) bg-(--accent-soft) text-(--accent)">
        {icon}
      </div>
      <div>
        <h2 className="font-black text-(--color-text)">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-(--color-text-muted)">{text}</p>
      </div>
    </div>
  );
}

export default function AdminSettingsClient({ dealer }: Props) {
  const [form, setForm] = useState<DealerInfo>(dealer);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof DealerInfo) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          phone:        form.phone,
          smsPhone:     form.smsPhone,
          email:        form.email,
          address:      form.address,
          workingHours: form.workingHours,
          viber:        form.viber,
          facebook:     form.facebook,
          instagram:    form.instagram,
          mapUrl:       form.mapUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? `Greška ${res.status}`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Mrežna greška pri snimanju');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-5 p-3 min-[390px]:space-y-7 min-[390px]:p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-(--accent-dark)">Konfiguracija placa</p>
          <h1 className="mt-2 text-3xl font-black text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>
            Podešavanja
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--color-text-muted)">
            Kontakt podaci uneseni ovde prikazuju se na svim stranicama sajta — header, footer, kontakt stranica i detalj vozila.
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:opacity-60 sm:w-auto ${
              saved ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'btn-gold'
            }`}
          >
            {saving ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /> Snima se…</>
            ) : saved ? (
              <><CheckCircle className="h-4 w-4" /> Sačuvano</>
            ) : (
              <><Save className="h-4 w-4" /> Sačuvaj</>
            )}
          </button>
          {error && <p className="text-right text-xs text-red-600">{error}</p>}
        </div>
      </div>

      {/* Contact info */}
      <section className="rounded-3xl border border-(--color-border) bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
        <SectionHeader icon={<Building size={18} />} title="Informacije o placu" text="Osnovni identitet i direktni kontakt podaci — koriste se na svim stranicama." />
        <div className="mt-6 space-y-5">
          <InputField label="Naziv placa" icon={Building} value={form.name} onChange={update('name')} placeholder="AutoFerari Preševo" />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Telefon (poziv)" icon={Phone} value={form.phone} onChange={update('phone')} type="tel" placeholder="+381 64 000 0000" />
            <InputField label="SMS broj" icon={MessageSquare} value={form.smsPhone} onChange={update('smsPhone')} type="tel" placeholder="+381 64 000 0000" />
          </div>

          <InputField label="Viber broj" icon={Phone} value={form.viber} onChange={update('viber')} type="tel" placeholder="+381 64 000 0000" />
          <InputField label="Email" icon={Mail} value={form.email} onChange={update('email')} type="email" placeholder="info@autoferari.rs" />
          <InputField label="Adresa" icon={MapPin} value={form.address} onChange={update('address')} placeholder="Preševo, Srbija" />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-text-muted)">Radno vreme</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-(--accent)" />
              <textarea
                value={form.workingHours}
                onChange={(e) => update('workingHours')(e.target.value)}
                rows={3}
                placeholder={'Pon–Pet: 09:00–18:00\nSub: 09:00–14:00\nNed: Zatvoreno'}
                className="input-premium w-full resize-none rounded-2xl py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social + maps */}
      <section className="rounded-3xl border border-(--color-border) bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
        <SectionHeader icon={<Globe size={18} />} title="Društvene mreže i linkovi" text="Prazna polja se automatski skrivaju na sajtu." />
        <div className="mt-6 grid gap-5">
          <InputField label="Facebook URL" icon={Globe} value={form.facebook} onChange={update('facebook')} placeholder="https://facebook.com/autoferari" />
          <InputField label="Instagram URL" icon={Globe} value={form.instagram} onChange={update('instagram')} placeholder="https://instagram.com/autoferari" />
          <InputField label="Google Maps URL" icon={MapPin} value={form.mapUrl} onChange={update('mapUrl')} placeholder="https://maps.google.com/..." />
        </div>
      </section>

      {/* Preview */}
      <section className="rounded-3xl border border-(--color-border) bg-(--color-surface-2) p-4 min-[390px]:p-5 sm:p-6">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-(--color-text-muted)">Pregled dugmadi</p>
        <div className="flex flex-wrap gap-2">
          {form.phone     && <ContactChip label={`Pozovi: ${form.phone}`}    />}
          {form.smsPhone  && <ContactChip label={`SMS: ${form.smsPhone}`}    />}
          {form.viber     && <ContactChip label={`Viber: ${form.viber}`}     />}
          {form.email     && <ContactChip label={`Email: ${form.email}`}     />}
          {form.facebook  && <ContactChip label="Facebook"                   />}
          {form.instagram && <ContactChip label="Instagram"                  />}
        </div>
        {!form.phone && !form.email && !form.viber && (
          <p className="text-sm text-(--color-text-muted)">Unesite bar jedan kontakt kanal gore.</p>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-3xl border border-red-200 bg-red-50/70 p-4 min-[390px]:p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="font-black text-red-950">Opasna zona</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-red-800/80">
                Ove akcije su nepovratne. Koristite ih samo kada je inventar ili CRM već arhiviran.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100">
              Obriši sva prodata vozila
            </button>
            <button type="button" className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100">
              Obriši sve upite
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactChip({ label }: { readonly label: string }) {
  return (
    <span className="rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-1.5 text-xs font-bold text-(--accent-dark)">
      {label}
    </span>
  );
}
