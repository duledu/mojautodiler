'use client';

import { useState } from 'react';
import { CheckCircle, MapPin, Phone, Plus, Save, ShieldCheck, XCircle } from 'lucide-react';
import type { Dealer } from '@/types/vehicle';

interface Props {
  readonly dealers: Dealer[];
}

type DealerForm = Partial<Dealer>;

const emptyForm: DealerForm = {
  name: '',
  slug: '',
  phone: '',
  viber: '',
  instagram: '',
  facebook: '',
  location: '',
  address: '',
  locationName: '',
  googleMapsEmbedUrl: '',
  googleMapsUrl: '',
  description: '',
  workingHours: '',
  isVerified: true,
  status: 'active',
};

export default function AdminDealersClient({ dealers: initialDealers }: Props) {
  const [dealers, setDealers] = useState(initialDealers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DealerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const startEdit = (dealer: Dealer) => {
    setEditingId(dealer.id);
    setForm(dealer);
    setError('');
  };

  const update = (key: keyof DealerForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(editingId ? `/api/admin/dealers/${editingId}` : '/api/admin/dealers', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({})) as { dealer?: Dealer; error?: string };
      if (!res.ok || !data.dealer) {
        setError(data.error ?? `Greska ${res.status}`);
        return;
      }
      setDealers((items) => editingId ? items.map((d) => d.id === editingId ? data.dealer as Dealer : d) : [...items, data.dealer as Dealer]);
      startNew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mrezna greska');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (dealer: Dealer) => {
    const nextStatus = dealer.status === 'active' ? 'hidden' : 'active';
    setDealers((items) => items.map((d) => d.id === dealer.id ? { ...d, status: nextStatus } : d));
    await fetch(`/api/admin/dealers/${dealer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(console.error);
  };

  return (
    <div className="space-y-5 p-3 min-[390px]:space-y-6 min-[390px]:p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Partnerska mreza</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Auto placevi</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{dealers.length} kuriranih partnera u mrezi</p>
        </div>
        <button type="button" onClick={startNew} className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm">
          <Plus size={15} />
          Novi partner
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-3">
          {dealers.map((dealer) => (
            <article key={dealer.id} className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5">
              <div className="flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{dealer.name}</h2>
                    {dealer.isVerified && <Badge icon={<ShieldCheck size={12} />} label="Verifikovan" />}
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${dealer.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-neutral-100 text-neutral-500'}`}>
                      {dealer.status === 'active' ? 'Aktivan' : 'Skriven'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                    <span className="inline-flex items-center gap-1"><MapPin size={13} />{dealer.location}</span>
                    <span className="inline-flex items-center gap-1"><Phone size={13} />{dealer.phone}</span>
                  </div>
                  {dealer.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">{dealer.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 min-[430px]:w-44">
                  <button type="button" onClick={() => startEdit(dealer)} className="touch-target rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)]">Uredi</button>
                  <button type="button" onClick={() => toggleStatus(dealer)} className="touch-target rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)]">
                    {dealer.status === 'active' ? 'Sakrij' : 'Aktiviraj'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-placeholder)]">{editingId ? 'Uredi partnera' : 'Novi partner'}</p>
          <div className="mt-4 space-y-3">
            <Field label="Naziv"><Input value={form.name ?? ''} onChange={(v) => update('name', v)} /></Field>
            <Field label="Slug"><Input value={form.slug ?? ''} onChange={(v) => update('slug', v)} placeholder="auto-plac-ime" /></Field>
            <div className="grid gap-3 min-[390px]:grid-cols-2">
              <Field label="Telefon"><Input value={form.phone ?? ''} onChange={(v) => update('phone', v)} /></Field>
              <Field label="Viber"><Input value={form.viber ?? ''} onChange={(v) => update('viber', v)} /></Field>
            </div>
            <Field label="Lokacija"><Input value={form.location ?? ''} onChange={(v) => update('location', v)} placeholder="Presevo, Srbija" /></Field>
            <Field label="Adresa"><Input value={form.address ?? ''} onChange={(v) => update('address', v)} /></Field>
            <Field label="Naziv lokacije na mapi"><Input value={form.locationName ?? ''} onChange={(v) => update('locationName', v)} placeholder="Naziv koji se prikazuje uz mapu" /></Field>
            <Field label="Google Maps embed URL"><Input value={form.googleMapsEmbedUrl ?? ''} onChange={(v) => update('googleMapsEmbedUrl', v)} placeholder="https://www.google.com/maps/embed?pb=..." /></Field>
            <Field label="Google Maps URL (otvaranje)"><Input value={form.googleMapsUrl ?? ''} onChange={(v) => update('googleMapsUrl', v)} placeholder="https://maps.google.com/?q=..." /></Field>
            <div className="grid gap-3 min-[390px]:grid-cols-2">
              <Field label="Instagram"><Input value={form.instagram ?? ''} onChange={(v) => update('instagram', v)} /></Field>
              <Field label="Facebook"><Input value={form.facebook ?? ''} onChange={(v) => update('facebook', v)} /></Field>
            </div>
            <Field label="Radno vreme"><Input value={form.workingHours ?? ''} onChange={(v) => update('workingHours', v)} /></Field>
            <Field label="Opis"><textarea value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} rows={3} className="input-premium w-full resize-none rounded-2xl px-3 py-3 text-sm" /></Field>
            <div className="grid gap-3 min-[390px]:grid-cols-2">
              <Toggle label="Verifikovan" value={form.isVerified !== false} onChange={(v) => update('isVerified', v)} />
              <Toggle label="Aktivan" value={form.status !== 'hidden'} onChange={(v) => update('status', v ? 'active' : 'hidden')} />
            </div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
            <button type="button" onClick={save} disabled={saving} className="btn-gold inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm disabled:opacity-60">
              <Save size={15} />
              {saving ? 'Cuva se...' : 'Sacuvaj partnera'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Badge({ icon, label }: { readonly icon: React.ReactNode; readonly label: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-black text-[var(--accent-dark)]">{icon}{label}</span>;
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{label}</span>{children}</label>;
}

function Input({ value, onChange, placeholder }: { readonly value: string; readonly onChange: (value: string) => void; readonly placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-premium w-full rounded-2xl px-3 py-3 text-sm" />;
}

function Toggle({ label, value, onChange }: { readonly label: string; readonly value: boolean; readonly onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-bold ${value ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-neutral-200 bg-neutral-100 text-neutral-500'}`}>
      {value ? <CheckCircle size={15} /> : <XCircle size={15} />}
      {label}
    </button>
  );
}
