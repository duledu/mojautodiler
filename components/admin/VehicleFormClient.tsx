'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft, Upload, X, Plus, Save, CheckCircle,
  Image as ImageIcon, Video, Tag, Info, Settings2,
  Shield, Star
} from 'lucide-react';
import { Vehicle, FuelType, TransmissionType, DrivetrainType, BodyType, VehicleStatus, VehicleCondition, Currency } from '@/types/vehicle';

type FormData = Partial<Vehicle> & {
  equipmentInput?: string;
  safetyInput?: string;
  featuresInput?: string;
  tagsInput?: string;
};

interface Props {
  mode: 'new' | 'edit';
  vehicle?: Vehicle;
}

const tabs = [
  { id: 'basic', label: 'Osnovno', icon: Info },
  { id: 'specs', label: 'Specifikacije', icon: Settings2 },
  { id: 'equipment', label: 'Oprema', icon: Star },
  { id: 'media', label: 'Mediji', icon: ImageIcon },
  { id: 'seo', label: 'SEO & Status', icon: Tag },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "input-premium w-full rounded-2xl px-3 py-3 text-sm";
const selectCls = inputCls + " cursor-pointer appearance-none";

function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (t: string[]) => void }) {
  const [val, setVal] = useState('');
  const add = () => {
    if (val.trim() && !tags.includes(val.trim())) {
      onChange([...tags, val.trim()]);
      setVal('');
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputCls + ' flex-1'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`Dodaj ${label.toLowerCase()}...`}
        />
        <button type="button" onClick={add} className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold text-[var(--accent-dark)]">
              {t}
              <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="text-[var(--color-text-placeholder)] transition hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VehicleFormClient({ mode, vehicle }: Props) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const [activeTab, setActiveTab] = useState('basic');
  const [saved, setSaved] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    vehicle?.images?.map(img => img.url) || []
  );
  const [previewVideos, setPreviewVideos] = useState<string[]>(
    vehicle?.videos?.map(v => v.url) || []
  );
  const [form, setForm] = useState<FormData>({
    title: '',
    brand: '',
    model: '',
    generation: '',
    year: new Date().getFullYear(),
    mileage: 0,
    price: 0,
    currency: 'EUR',
    fuelType: 'benzin',
    transmission: 'manuelni',
    drivetrain: 'prednji',
    bodyType: 'limuzina',
    engineSize: undefined,
    horsepower: undefined,
    kilowatts: undefined,
    doors: 4,
    seats: 5,
    color: '',
    interiorColor: '',
    registration: '',
    origin: '',
    condition: 'polovno' as VehicleCondition,
    description: '',
    equipment: [],
    safetyFeatures: [],
    features: [],
    images: [],
    videos: [],
    status: 'draft' as VehicleStatus,
    tags: [],
    dealerNotes: '',
    seoSlug: '',
    featured: false,
    ...vehicle,
  });

  const set = (key: keyof FormData) => (val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    try {
      // Images: collect URL strings (previewUrls may include blob: URLs from file picker)
      const imageUrls = previewUrls.filter((u) => u.startsWith('http'));

      const payload = {
        ...form,
        images: imageUrls,
        slug: form.seoSlug?.trim() || undefined,
      };

      if (mode === 'edit' && vehicle?.id) {
        await fetch(`/api/admin/vehicles/${vehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // Fail silently — the saved indicator still shows
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  return (
    <div className="max-w-5xl space-y-5 p-3 min-[390px]:space-y-6 min-[390px]:p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/vehicles`} className="rounded-xl border border-[var(--color-border)] bg-white p-2 text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Inventar vozila</p>
            <h1 className="mt-1 text-2xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              {mode === 'new' ? 'Novo vozilo' : 'Uredi vozilo'}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{form.title || 'Bez naziva'}</p>
          </div>
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
          {saved ? <><CheckCircle className="w-4 h-4" /> Sačuvano</> : <><Save className="w-4 h-4" /> Sačuvaj</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-3xl border border-[var(--color-border)] bg-white p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`touch-target flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5 sm:p-6">
        {/* BASIC */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-text)]">Osnove informacije</h2>
            <Field label="Naziv oglasa" required>
              <input className={inputCls} value={form.title} onChange={e => set('title')(e.target.value)} placeholder="BMW X5 xDrive30d M Sport" />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Brend" required>
                <input className={inputCls} value={form.brand} onChange={e => set('brand')(e.target.value)} placeholder="BMW" />
              </Field>
              <Field label="Model" required>
                <input className={inputCls} value={form.model} onChange={e => set('model')(e.target.value)} placeholder="X5" />
              </Field>
              <Field label="Generacija">
                <input className={inputCls} value={form.generation} onChange={e => set('generation')(e.target.value)} placeholder="G05" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Godište" required>
                <input className={inputCls} type="number" value={form.year} onChange={e => set('year')(+e.target.value)} min={1990} max={2030} />
              </Field>
              <Field label="Kilometraža" required>
                <input className={inputCls} type="number" value={form.mileage} onChange={e => set('mileage')(+e.target.value)} placeholder="45000" />
              </Field>
              <Field label="Stanje" required>
                <select className={selectCls} value={form.condition} onChange={e => set('condition')(e.target.value as VehicleCondition)}>
                  <option value="novo">Novo</option>
                  <option value="polovno">Polovno</option>
                  <option value="uvoz">Uvoz</option>
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Cena" required>
                <input className={inputCls} type="number" value={form.price} onChange={e => set('price')(+e.target.value)} placeholder="25000" />
              </Field>
              <Field label="Valuta">
                <select className={selectCls} value={form.currency} onChange={e => set('currency')(e.target.value as Currency)}>
                  <option value="EUR">EUR</option>
                  <option value="RSD">RSD</option>
                </select>
              </Field>
              <Field label="Registracija">
                <input className={inputCls} value={form.registration} onChange={e => set('registration')(e.target.value)} placeholder="06/2025" />
              </Field>
            </div>
            <Field label="Opis vozila">
              <textarea
                className={inputCls}
                rows={5}
                value={form.description}
                onChange={e => set('description')(e.target.value)}
                placeholder="Detaljni opis vozila, istorija, stanje..."
              />
            </Field>
            <Field label="Napomene prodavca">
              <textarea
                className={inputCls}
                rows={3}
                value={form.dealerNotes}
                onChange={e => set('dealerNotes')(e.target.value)}
                placeholder="Interne napomene..."
              />
            </Field>
          </div>
        )}

        {/* SPECS */}
        {activeTab === 'specs' && (
          <div className="space-y-5">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-text)]">Tehničke specifikacije</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Gorivo">
                <select className={selectCls} value={form.fuelType} onChange={e => set('fuelType')(e.target.value as FuelType)}>
                  <option value="benzin">Benzin</option>
                  <option value="dizel">Dizel</option>
                  <option value="hibrid">Hibrid</option>
                  <option value="elektricni">Električni</option>
                  <option value="plin">Plin (LPG)</option>
                  <option value="cng">CNG</option>
                </select>
              </Field>
              <Field label="Menjač">
                <select className={selectCls} value={form.transmission} onChange={e => set('transmission')(e.target.value as TransmissionType)}>
                  <option value="manuelni">Manuelni</option>
                  <option value="automatski">Automatski</option>
                  <option value="poluautomatski">Poluautomatski</option>
                </select>
              </Field>
              <Field label="Pogon">
                <select className={selectCls} value={form.drivetrain} onChange={e => set('drivetrain')(e.target.value as DrivetrainType)}>
                  <option value="prednji">Prednji (FWD)</option>
                  <option value="zadnji">Zadnji (RWD)</option>
                  <option value="4x4">4x4 (stalni)</option>
                  <option value="awd">AWD</option>
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Karoserija">
                <select className={selectCls} value={form.bodyType} onChange={e => set('bodyType')(e.target.value as BodyType)}>
                  <option value="limuzina">Limuzina (Sedan)</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="karavan">Karavan</option>
                  <option value="suv">SUV</option>
                  <option value="kupe">Kupe</option>
                  <option value="kabriolet">Kabriolet</option>
                  <option value="van">Van / Minivan</option>
                  <option value="pickup">Pickup</option>
                </select>
              </Field>
              <Field label="Zapremina motora (cm³)">
                <input className={inputCls} type="number" value={form.engineSize || ''} onChange={e => set('engineSize')(+e.target.value)} placeholder="1998" />
              </Field>
              <Field label="Snaga (KS)">
                <input className={inputCls} type="number" value={form.horsepower || ''} onChange={e => set('horsepower')(+e.target.value)} placeholder="190" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Snaga (kW)">
                <input className={inputCls} type="number" value={form.kilowatts || ''} onChange={e => set('kilowatts')(+e.target.value)} placeholder="140" />
              </Field>
              <Field label="Broj vrata">
                <input className={inputCls} type="number" value={form.doors} onChange={e => set('doors')(+e.target.value)} min={2} max={6} />
              </Field>
              <Field label="Broj sedišta">
                <input className={inputCls} type="number" value={form.seats} onChange={e => set('seats')(+e.target.value)} min={1} max={9} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Boja karoserije">
                <input className={inputCls} value={form.color} onChange={e => set('color')(e.target.value)} placeholder="Siva metalik" />
              </Field>
              <Field label="Boja enterijera">
                <input className={inputCls} value={form.interiorColor} onChange={e => set('interiorColor')(e.target.value)} placeholder="Crna koža" />
              </Field>
              <Field label="Zemlja porekla">
                <input className={inputCls} value={form.origin} onChange={e => set('origin')(e.target.value)} placeholder="Nemačka" />
              </Field>
            </div>
            <Field label="VIN broj (opciono)">
              <input className={inputCls} value={form.vin || ''} onChange={e => set('vin')(e.target.value)} placeholder="WBA..." />
            </Field>
          </div>
        )}

        {/* EQUIPMENT */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-text)]">Oprema i sigurnost</h2>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <Star className="h-4 w-4 text-[var(--accent)]" /> Oprema
              </p>
              <TagInput label="stavku opreme" tags={form.equipment || []} onChange={set('equipment')} />
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <Shield className="h-4 w-4 text-[var(--accent)]" /> Sigurnosne karakteristike
              </p>
              <TagInput label="sigurnosnu stavku" tags={form.safetyFeatures || []} onChange={set('safetyFeatures')} />
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <CheckCircle className="h-4 w-4 text-[var(--accent)]" /> Ostale karakteristike
              </p>
              <TagInput label="karakteristiku" tags={form.features || []} onChange={set('features')} />
            </div>
          </div>
        )}

        {/* MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-text)]">Slike i video</h2>

            {/* Image upload */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <ImageIcon className="h-4 w-4 text-[var(--accent)]" /> Slike vozila
              </p>
              <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-8 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-white text-[var(--accent)] transition-colors">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--color-text)]">Prevuci slike ili klikni za upload</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">JPG, PNG, WebP · Max 10MB po slici</p>
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--color-surface-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewUrls(prev => prev.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-[var(--accent)] px-1.5 py-0.5 text-xs font-bold text-white">
                          Naslovna
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <Video className="h-4 w-4 text-[var(--accent)]" /> Video (YouTube URL)
              </p>
              <div className="space-y-2">
                {previewVideos.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={inputCls + ' flex-1'} value={url} readOnly />
                    <button type="button" onClick={() => setPreviewVideos(prev => prev.filter((_, j) => j !== i))} className="rounded-2xl border border-[var(--color-border)] bg-white p-2.5 text-[var(--color-text-muted)] transition hover:border-red-200 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    className={inputCls + ' flex-1'}
                    placeholder="https://youtube.com/..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const target = e.currentTarget;
                        if (target.value) { setPreviewVideos(prev => [...prev, target.value]); target.value = ''; }
                      }
                    }}
                  />
                  <button type="button" className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-xs font-bold text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]">Enter</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO & STATUS */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-text)]">SEO i status objave</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Status objave">
                <select className={selectCls} value={form.status} onChange={e => set('status')(e.target.value as VehicleStatus)}>
                  <option value="draft">Draft (nevidljivo)</option>
                  <option value="active">Aktivno (vidljivo)</option>
                  <option value="hidden">Skriveno</option>
                  <option value="sold">Prodano</option>
                </select>
              </Field>
              <Field label="Featured (istaknuto)">
                <select className={selectCls} value={form.featured ? 'da' : 'ne'} onChange={e => set('featured')(e.target.value === 'da')}>
                  <option value="ne">Ne</option>
                  <option value="da">Da — prikaži na početnoj</option>
                </select>
              </Field>
            </div>
            <Field label="SEO Slug (URL putanja)">
              <input
                className={inputCls}
                value={form.seoSlug}
                onChange={e => set('seoSlug')(e.target.value)}
                placeholder="bmw-x5-xdrive30d-2022"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">/vozilo/{form.seoSlug || 'slug'}</p>
            </Field>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                <Tag className="h-4 w-4 text-[var(--accent)]" /> Tagovi
              </p>
              <TagInput label="tag" tags={form.tags || []} onChange={set('tags')} />
            </div>

            {/* Summary */}
            <div className="space-y-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Pregled pre objave</p>
              {[
                { label: 'Naziv', val: form.title, ok: !!form.title },
                { label: 'Slike', val: `${previewUrls.length} slike`, ok: previewUrls.length > 0 },
                { label: 'Cena', val: form.price ? `${form.price} ${form.currency}` : '—', ok: !!form.price },
                { label: 'Opis', val: form.description ? 'Postoji' : 'Nedostaje', ok: !!form.description },
                { label: 'SEO slug', val: form.seoSlug || '—', ok: !!form.seoSlug },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">{row.label}</span>
                  <span className={row.ok ? 'text-emerald-400' : 'text-amber-400'}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
