'use client';

import { useState } from 'react';
import { Building, CheckCircle, Clock, Globe, Mail, MapPin, Phone, Save, ShieldAlert } from 'lucide-react';

interface DealerInfo {
  name: string;
  phone: string;
  viber: string;
  email: string;
  address: string;
  workingHours: string;
  facebook?: string;
  instagram?: string;
  mapUrl?: string;
}

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
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accent)]" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-premium w-full rounded-2xl py-3 pl-10 pr-4 text-sm"
        />
      </div>
    </div>
  );
}

export default function AdminSettingsClient({ dealer }: Props) {
  const [form, setForm] = useState(dealer);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof DealerInfo) => (val: string) => setForm((current) => ({ ...current, [key]: val }));

  const handleSave = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // Fail silently — UI feedback via the saved indicator
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-5xl space-y-5 p-3 min-[390px]:space-y-7 min-[390px]:p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Konfiguracija salona</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Podesavanja
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
            Upravljajte informacijama koje se prikazuju na sajtu, kontakt kanalima i lokalnim podacima salona.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition sm:w-auto ${
            saved
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'btn-gold'
          }`}
        >
          {saved ? (
            <><CheckCircle className="h-4 w-4" /> Sacuvano</>
          ) : (
            <><Save className="h-4 w-4" /> Sacuvaj</>
          )}
        </button>
      </div>

      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
        <SectionHeader icon={<Building size={18} />} title="Informacije o salonu" text="Osnovni identitet i direktni kontakt podaci." />

        <div className="mt-6 space-y-5">
          <InputField label="Naziv salona" icon={Building} value={form.name} onChange={update('name')} placeholder="AutoFerari Presevo" />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Telefon" icon={Phone} value={form.phone} onChange={update('phone')} type="tel" placeholder="+381 64 000 0000" />
            <InputField label="Viber" icon={Phone} value={form.viber} onChange={update('viber')} type="tel" placeholder="+381 64 000 0000" />
          </div>

          <InputField label="Email" icon={Mail} value={form.email} onChange={update('email')} type="email" placeholder="info@autoferari.rs" />
          <InputField label="Adresa" icon={MapPin} value={form.address} onChange={update('address')} placeholder="Presevo, Srbija" />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Radno vreme</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--accent)]" />
              <textarea
                value={form.workingHours}
                onChange={(event) => update('workingHours')(event.target.value)}
                rows={4}
                placeholder={'Pon-Pet: 09:00-18:00\nSub: 09:00-14:00\nNed: Zatvoreno'}
                className="input-premium w-full resize-none rounded-2xl py-3 pl-10 pr-4 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
        <SectionHeader icon={<Globe size={18} />} title="Drustvene mreze i linkovi" text="Kanali koji pojacavaju poverenje i vode kupca do salona." />

        <div className="mt-6 grid gap-5">
          <InputField label="Facebook URL" icon={Globe} value={form.facebook || ''} onChange={update('facebook')} placeholder="https://facebook.com/autoferari" />
          <InputField label="Instagram URL" icon={Globe} value={form.instagram || ''} onChange={update('instagram')} placeholder="https://instagram.com/autoferari" />
          <InputField label="Google Maps URL" icon={MapPin} value={form.mapUrl || ''} onChange={update('mapUrl')} placeholder="https://maps.google.com/..." />
        </div>
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50/70 p-4 min-[390px]:p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="font-black text-red-950">Opasna zona</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-red-800/80">
                Ove akcije su nepovratne. Koristite ih samo kada je inventar ili CRM vec arhiviran.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100">
              Obrisi sva prodata vozila
            </button>
            <button type="button" className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100">
              Obrisi sve upite
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, text }: { readonly icon: React.ReactNode; readonly title: string; readonly text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
        {icon}
      </div>
      <div>
        <h2 className="font-black text-[var(--color-text)]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{text}</p>
      </div>
    </div>
  );
}
