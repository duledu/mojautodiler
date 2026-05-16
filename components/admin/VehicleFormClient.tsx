'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle, ArrowLeft, CheckCircle, Image as ImageIcon,
  Info, Plus, Save, Settings2, Shield, Star, Tag, Upload, Video, X,
} from 'lucide-react';
import { Dealer, Vehicle, FuelType, TransmissionType, DrivetrainType, BodyType, VehicleStatus, VehicleCondition, Currency, VatMode } from '@/types/vehicle';
import EquipmentPicker from '@/components/admin/EquipmentPicker';
import { EQUIPMENT_PRESETS, SAFETY_PRESETS, CONDITION_PRESETS } from '@/data/equipment-presets';
import SortableImageGrid from '@/components/admin/SortableImageGrid';
import type { ImageSlot } from '@/components/admin/media-types';

// Browser password-manager extensions (e.g. LastPass, Bitwarden) inject
// fdprocessedid on interactive elements after hydration. These thin wrappers
// suppress the resulting React warning without changing any behaviour.
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input suppressHydrationWarning {...props} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select suppressHydrationWarning {...props} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea suppressHydrationWarning {...props} />;
}

type FormData = Partial<Vehicle> & {
  equipmentInput?: string;
  safetyInput?: string;
  featuresInput?: string;
  tagsInput?: string;
};

// ImageSlot is imported from media-types.ts (shared with SortableImageGrid)

interface Props {
  mode: 'new' | 'edit';
  vehicle?: Vehicle;
  dealers?: Dealer[];
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
        <Input
          className={inputCls + ' flex-1'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={`Dodaj ${label.toLowerCase()}...`}
        />
        <button type="button" onClick={add} suppressHydrationWarning className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]">
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

export default function VehicleFormClient({ mode, vehicle, dealers = [] }: Props) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';
  const [activeTab, setActiveTab] = useState('basic');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // Existing images initialised as already-uploaded slots (no blob, no spinner)
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
    (vehicle?.images ?? []).map((img, i) => ({
      id: `existing-${i}`,
      previewUrl: img.url,
      uploadedUrl: img.url,
      uploading: false,
    }))
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
    vatMode: 'NONE',
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
    dealerId: '',
    contactPhone: '',
    contactViber: '',
    contactName: '',
    ...vehicle,
  });
  const selectedDealer = dealers.find((dealer) => dealer.id === form.dealerId) ?? vehicle?.dealer;

  const set = (key: keyof FormData) => (val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    try {
      // Build the ordered list of persisted image slots
      const uploadedSlots = imageSlots.filter((s) => s.uploadedUrl && !s.uploading);
      const imageUrls = uploadedSlots.map((s) => s.uploadedUrl as string);
      // r2Key map: url → key (only for R2-uploaded images — pre-existing images have no key)
      const imageKeys: Record<string, string> = {};
      for (const s of uploadedSlots) {
        if (s.r2Key && s.uploadedUrl) imageKeys[s.uploadedUrl] = s.r2Key;
      }

      console.log('[SAVE] final imageUrls before PUT:', imageUrls);

      const { dealer: _dealer, ...formPayload } = form;
      void _dealer;
      const payload = {
        ...formPayload,
        images: imageUrls,
        imageKeys,          // consumed by the API to upsert VehicleMedia records
        slug: form.seoSlug?.trim() || undefined,
      };

      const res = mode === 'edit' && vehicle?.id
        ? await fetch(`/api/admin/vehicles/${vehicle.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error || `Greška ${res.status}`;
        setSaveError(msg);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Mrežna greška pri snimanju';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

/**
   * Removes an image slot from the gallery.
   * If the slot has an R2 key and the vehicle already exists in the DB, the
   * file is deleted from R2 and the VehicleMedia record is removed immediately.
   * For new vehicles (no vehicle.id yet) orphaned R2 files are acceptable; they
   * live under a tmp-xxx prefix and can be cleaned up by a scheduled job later.
   */
  const handleDeleteSlot = async (slot: ImageSlot) => {
    // Release the blob preview URL if still allocated
    if (slot.previewUrl.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl);

    // If we have both a key AND an existing vehicle ID, delete from R2 + DB now.
    if (slot.r2Key && vehicle?.id && slot.uploadedUrl) {
      try {
        const res = await fetch(`/api/admin/vehicles/${vehicle.id}/media`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: slot.uploadedUrl, r2Key: slot.r2Key }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          console.error('[DELETE MEDIA] server error:', data.error ?? res.status);
        }
      } catch (err) {
        console.error('[DELETE MEDIA] network error:', err);
        // Don't block the UI — the slot is removed from local state regardless.
        // The next vehicle save will also clean up orphaned VehicleMedia records.
      }
    }

    setImageSlots(prev => prev.filter(s => s.id !== slot.id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Reset input so the same file can be re-selected after an error
    e.target.value = '';
    if (files.length === 0) return;

    for (const file of files) {
      const slotId = crypto.randomUUID();
      const blobUrl = URL.createObjectURL(file);

      // Show preview immediately with loading spinner
      setImageSlots(prev => [...prev, { id: slotId, previewUrl: blobUrl, uploading: true }]);

      try {
        // ── Step 1: get presigned PUT URL ──────────────────────────────────
        console.log(`[UPLOAD] presign start — file="${file.name}" type=${file.type} size=${file.size}`);

        const presignRes = await fetch('/api/admin/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename:    file.name,
            contentType: file.type,
            size:        file.size,
            vehicleId:   vehicle?.id ?? null,
          }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({})) as { error?: string };
          const msg = data.error ?? `Presign HTTP ${presignRes.status}`;
          console.error('[UPLOAD] presign failed —', msg, data);
          throw new Error(msg);
        }

        const { uploadUrl, publicUrl, key } = (await presignRes.json()) as {
          uploadUrl: string;
          publicUrl: string;
          key: string;
        };

        console.log(`[UPLOAD] presign OK — publicUrl=${publicUrl}`);

        // ── Step 2: PUT file directly to R2 ───────────────────────────────
        console.log(`[UPLOAD] R2 PUT start — url starts with ${uploadUrl.slice(0, 60)}…`);

        let putRes: Response;
        try {
          putRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
        } catch (fetchErr) {
          // fetch() throws (does not return a Response) on network errors and CORS blocks
          const raw = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          const isCors =
            raw.toLowerCase().includes('failed to fetch') ||
            raw.toLowerCase().includes('networkerror');
          console.error('[UPLOAD] R2 PUT threw —', raw);
          throw new Error(
            isCors
              ? 'R2 CORS error: go to Cloudflare R2 → bucket → Settings → CORS and add ' +
                'AllowedOrigins: ["http://localhost:3000"], AllowedMethods: ["PUT"], ' +
                'AllowedHeaders: ["content-type"]'
              : `R2 network error: ${raw}`,
          );
        }

        if (!putRes.ok) {
          // Read the XML error body R2 returns for 4xx/5xx
          let detail = '';
          try {
            const text = await putRes.text();
            const codeMatch  = text.match(/<Code>(.+?)<\/Code>/);
            const msgMatch   = text.match(/<Message>(.+?)<\/Message>/);
            detail = codeMatch
              ? ` — ${codeMatch[1]}${msgMatch ? ': ' + msgMatch[1] : ''}`
              : text.slice(0, 200);
            console.error('[UPLOAD] R2 PUT error body —', text.slice(0, 400));
          } catch { /* ignore body read error */ }
          throw new Error(`R2 upload failed (HTTP ${putRes.status}${detail})`);
        }

        console.log('[UPLOAD] R2 PUT success');

        // ── Step 3: persist the public URL + R2 key ───────────────────────
        URL.revokeObjectURL(blobUrl);
        setImageSlots(prev =>
          prev.map(s =>
            s.id === slotId
              ? { id: slotId, previewUrl: publicUrl, uploadedUrl: publicUrl, r2Key: key, uploading: false }
              : s,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        console.error('[UPLOAD] slot error —', msg);
        setImageSlots(prev =>
          prev.map(s =>
            s.id === slotId ? { ...s, uploading: false, error: msg } : s,
          ),
        );
      }
    }
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
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || imageSlots.some(s => s.uploading)}
            suppressHydrationWarning
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:opacity-60 sm:w-auto ${
              saved
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : saveError
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'btn-gold'
            }`}
          >
            {saving ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /> Snima se…</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Sačuvano</>
            ) : saveError ? (
              <><AlertCircle className="w-4 h-4" /> Greška — pokušaj ponovo</>
            ) : (
              <><Save className="w-4 h-4" /> Sačuvaj</>
            )}
          </button>
          {saveError && (
            <p className="w-full text-right text-xs text-red-600 sm:max-w-xs">{saveError}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-3xl border border-[var(--color-border)] bg-white p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            suppressHydrationWarning
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
              <Input className={inputCls} value={form.title} onChange={e => set('title')(e.target.value)} placeholder="BMW X5 xDrive30d M Sport" />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Brend" required>
                <Input className={inputCls} value={form.brand} onChange={e => set('brand')(e.target.value)} placeholder="BMW" />
              </Field>
              <Field label="Model" required>
                <Input className={inputCls} value={form.model} onChange={e => set('model')(e.target.value)} placeholder="X5" />
              </Field>
              <Field label="Generacija">
                <Input className={inputCls} value={form.generation} onChange={e => set('generation')(e.target.value)} placeholder="G05" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Godište" required>
                <Input className={inputCls} type="number" value={form.year} onChange={e => set('year')(+e.target.value)} min={1990} max={2030} />
              </Field>
              <Field label="Kilometraža" required>
                <Input className={inputCls} type="number" value={form.mileage} onChange={e => set('mileage')(+e.target.value)} placeholder="45000" />
              </Field>
              <Field label="Stanje" required>
                <Select className={selectCls} value={form.condition} onChange={e => set('condition')(e.target.value as VehicleCondition)}>
                  <option value="novo">Novo</option>
                  <option value="polovno">Polovno</option>
                  <option value="uvoz">Uvoz</option>
                </Select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <Field label="Cena" required>
                <Input className={inputCls} type="number" value={form.price} onChange={e => set('price')(+e.target.value)} placeholder="25000" />
              </Field>
              <Field label="Valuta">
                <Select className={selectCls} value={form.currency} onChange={e => set('currency')(e.target.value as Currency)}>
                  <option value="EUR">EUR</option>
                  <option value="RSD">RSD</option>
                </Select>
              </Field>
              <Field label="PDV">
                <Select className={selectCls} value={form.vatMode ?? 'NONE'} onChange={e => set('vatMode')(e.target.value as VatMode)}>
                  <option value="INCLUDED">Cena uključuje PDV</option>
                  <option value="EXCLUDED">+ PDV</option>
                  <option value="NONE">Bez PDV informacije</option>
                </Select>
              </Field>
              <Field label="Registracija">
                <Input className={inputCls} value={form.registration} onChange={e => set('registration')(e.target.value)} placeholder="06/2025" />
              </Field>
            </div>
            <section className="rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4">
              <div className="mb-4 flex flex-col gap-1">
                <p className="text-sm font-black text-[var(--color-text)]">Partnerski auto plac</p>
                <p className="text-xs leading-5 text-[var(--color-text-muted)]">Dodelite vozilo kuriranom partneru. Kontakt override koristite samo kada ovo vozilo ima poseban broj ili kontakt osobu.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Partner">
                  <Select className={selectCls} value={form.dealerId || ''} onChange={e => set('dealerId')(e.target.value || undefined)}>
                    <option value="">MojAutoDiler platforma / bez partnera</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>{dealer.name} - {dealer.location}</option>
                    ))}
                  </Select>
                </Field>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-3 text-xs leading-5 text-[var(--color-text-muted)]">
                  {selectedDealer ? (
                    <>
                      <p className="font-black text-[var(--color-text)]">{selectedDealer.name}</p>
                      <p>{selectedDealer.location}</p>
                      <p>{selectedDealer.phone}</p>
                    </>
                  ) : (
                    <p>Bez partnera: koristi se glavni MojAutoDiler kontakt iz podesavanja.</p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Kontakt ime override">
                  <Input className={inputCls} value={form.contactName || ''} onChange={e => set('contactName')(e.target.value)} placeholder="npr. Menadzer prodaje" />
                </Field>
                <Field label="Telefon override">
                  <Input className={inputCls} value={form.contactPhone || ''} onChange={e => set('contactPhone')(e.target.value)} placeholder="+381..." />
                </Field>
                <Field label="Viber override">
                  <Input className={inputCls} value={form.contactViber || ''} onChange={e => set('contactViber')(e.target.value)} placeholder="+381..." />
                </Field>
              </div>
            </section>
            <Field label="Opis vozila">
              <TextArea
                className={inputCls}
                rows={5}
                value={form.description}
                onChange={e => set('description')(e.target.value)}
                placeholder="Detaljni opis vozila, istorija, stanje..."
              />
            </Field>
            <Field label="Napomene prodavca">
              <TextArea
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
                <Select className={selectCls} value={form.fuelType} onChange={e => set('fuelType')(e.target.value as FuelType)}>
                  <option value="benzin">Benzin</option>
                  <option value="dizel">Dizel</option>
                  <option value="hibrid">Hibrid</option>
                  <option value="elektricni">Električni</option>
                  <option value="plin">Plin (LPG)</option>
                  <option value="cng">CNG</option>
                </Select>
              </Field>
              <Field label="Menjač">
                <Select className={selectCls} value={form.transmission} onChange={e => set('transmission')(e.target.value as TransmissionType)}>
                  <option value="manuelni">Manuelni</option>
                  <option value="automatski">Automatski</option>
                  <option value="poluautomatski">Poluautomatski</option>
                </Select>
              </Field>
              <Field label="Pogon">
                <Select className={selectCls} value={form.drivetrain} onChange={e => set('drivetrain')(e.target.value as DrivetrainType)}>
                  <option value="prednji">Prednji (FWD)</option>
                  <option value="zadnji">Zadnji (RWD)</option>
                  <option value="4x4">4x4 (stalni)</option>
                  <option value="awd">AWD</option>
                </Select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Karoserija">
                <Select className={selectCls} value={form.bodyType} onChange={e => set('bodyType')(e.target.value as BodyType)}>
                  <option value="limuzina">Limuzina (Sedan)</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="karavan">Karavan</option>
                  <option value="suv">SUV</option>
                  <option value="kupe">Kupe</option>
                  <option value="kabriolet">Kabriolet</option>
                  <option value="van">Van / Minivan</option>
                  <option value="pickup">Pickup</option>
                </Select>
              </Field>
              <Field label="Zapremina motora (cm³)">
                <Input className={inputCls} type="number" value={form.engineSize || ''} onChange={e => set('engineSize')(+e.target.value)} placeholder="1998" />
              </Field>
              <Field label="Snaga (KS)">
                <Input className={inputCls} type="number" value={form.horsepower || ''} onChange={e => set('horsepower')(+e.target.value)} placeholder="190" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Snaga (kW)">
                <Input className={inputCls} type="number" value={form.kilowatts || ''} onChange={e => set('kilowatts')(+e.target.value)} placeholder="140" />
              </Field>
              <Field label="Broj vrata">
                <Input className={inputCls} type="number" value={form.doors} onChange={e => set('doors')(+e.target.value)} min={2} max={6} />
              </Field>
              <Field label="Broj sedišta">
                <Input className={inputCls} type="number" value={form.seats} onChange={e => set('seats')(+e.target.value)} min={1} max={9} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Boja karoserije">
                <Input className={inputCls} value={form.color} onChange={e => set('color')(e.target.value)} placeholder="Siva metalik" />
              </Field>
              <Field label="Boja enterijera">
                <Input className={inputCls} value={form.interiorColor} onChange={e => set('interiorColor')(e.target.value)} placeholder="Crna koža" />
              </Field>
              <Field label="Zemlja porekla">
                <Input className={inputCls} value={form.origin} onChange={e => set('origin')(e.target.value)} placeholder="Nemačka" />
              </Field>
            </div>
            <Field label="VIN broj (opciono)">
              <Input className={inputCls} value={form.vin || ''} onChange={e => set('vin')(e.target.value)} placeholder="WBA..." />
            </Field>
          </div>
        )}

        {/* EQUIPMENT */}
        {activeTab === 'equipment' && (
          <div className="space-y-7">
            <h2 className="border-b border-(--color-border) pb-3 font-black text-(--color-text)">Oprema i sigurnost</h2>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-(--color-text)">
                <Star className="h-4 w-4 text-(--accent)" /> Oprema
              </p>
              <EquipmentPicker
                predefined={EQUIPMENT_PRESETS}
                selected={form.equipment || []}
                onChange={set('equipment')}
              />
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-(--color-text)">
                <Shield className="h-4 w-4 text-(--accent)" /> Sigurnost
              </p>
              <EquipmentPicker
                predefined={SAFETY_PRESETS}
                selected={form.safetyFeatures || []}
                onChange={set('safetyFeatures')}
              />
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-(--color-text)">
                <CheckCircle className="h-4 w-4 text-(--accent)" /> Stanje vozila
              </p>
              <EquipmentPicker
                predefined={CONDITION_PRESETS}
                selected={form.features || []}
                onChange={set('features')}
              />
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
                <Input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
              </label>

              {imageSlots.length > 0 && (
                <SortableImageGrid
                  slots={imageSlots}
                  vehicleId={vehicle?.id}
                  onSlotsChange={setImageSlots}
                  onDelete={handleDeleteSlot}
                />
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
                    <Input className={inputCls + ' flex-1'} value={url} readOnly />
                    <button type="button" onClick={() => setPreviewVideos(prev => prev.filter((_, j) => j !== i))} className="rounded-2xl border border-[var(--color-border)] bg-white p-2.5 text-[var(--color-text-muted)] transition hover:border-red-200 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
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
                <Select className={selectCls} value={form.status} onChange={e => set('status')(e.target.value as VehicleStatus)}>
                  <option value="draft">Draft (nevidljivo)</option>
                  <option value="active">Aktivno (vidljivo)</option>
                  <option value="hidden">Skriveno</option>
                  <option value="sold">Prodano</option>
                </Select>
              </Field>
              <Field label="Featured (istaknuto)">
                <Select className={selectCls} value={form.featured ? 'da' : 'ne'} onChange={e => set('featured')(e.target.value === 'da')}>
                  <option value="ne">Ne</option>
                  <option value="da">Da — prikaži na početnoj</option>
                </Select>
              </Field>
            </div>
            <Field label="SEO Slug (URL putanja)">
              <Input
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
                { label: 'Slike', val: `${imageSlots.filter(s => s.uploadedUrl).length} slike`, ok: imageSlots.some(s => s.uploadedUrl) },
                { label: 'Cena', val: form.price ? `${form.price} ${form.currency}` : '—', ok: !!form.price },
                { label: 'PDV', val: form.vatMode === 'INCLUDED' ? 'Cena uključuje PDV' : form.vatMode === 'EXCLUDED' ? '+ PDV' : 'Bez informacije', ok: true },
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
