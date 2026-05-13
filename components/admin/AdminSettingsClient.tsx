'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Globe, Save, CheckCircle, Clock, Building } from 'lucide-react';

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
  dealer: DealerInfo;
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
        />
      </div>
    </div>
  );
}

export default function AdminSettingsClient({ dealer }: Props) {
  const [form, setForm] = useState(dealer);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof DealerInfo) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    // In production: API call to update dealer info
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Podešavanja</h1>
          <p className="text-zinc-400 text-sm mt-1">Informacije o salonu i kontakt podaci</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-[#C9A84C] hover:bg-[#b8963e] text-black'
          }`}
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Sačuvano!</>
          ) : (
            <><Save className="w-4 h-4" /> Sačuvaj</>
          )}
        </button>
      </div>

      {/* Salon Info */}
      <div className="bg-[#131315] border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center">
            <Building className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <h2 className="font-semibold text-white">Informacije o salonu</h2>
        </div>

        <InputField label="Naziv salona" icon={Building} value={form.name} onChange={update('name')} placeholder="AutoElite Preševo" />

        <div className="grid sm:grid-cols-2 gap-4">
          <InputField label="Telefon" icon={Phone} value={form.phone} onChange={update('phone')} type="tel" placeholder="+381 64 000 0000" />
          <InputField label="Viber" icon={Phone} value={form.viber} onChange={update('viber')} type="tel" placeholder="+381 64 000 0000" />
        </div>

        <InputField label="Email" icon={Mail} value={form.email} onChange={update('email')} type="email" placeholder="info@autoelite.rs" />
        <InputField label="Adresa" icon={MapPin} value={form.address} onChange={update('address')} placeholder="Ulica bb, Grad" />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Radno vreme</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <textarea
              value={form.workingHours}
              onChange={e => update('workingHours')(e.target.value)}
              rows={3}
              placeholder="Pon–Pet: 09:00–18:00&#10;Sub: 09:00–14:00&#10;Ned: Zatvoreno"
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A84C]/60 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Social & Links */}
      <div className="bg-[#131315] border border-zinc-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <h2 className="font-semibold text-white">Društvene mreže i linkovi</h2>
        </div>

        <InputField label="Facebook URL" icon={Globe} value={form.facebook || ''} onChange={update('facebook')} placeholder="https://facebook.com/autoelite" />
        <InputField label="Instagram URL" icon={Globe} value={form.instagram || ''} onChange={update('instagram')} placeholder="https://instagram.com/autoelite" />
        <InputField label="Google Maps URL" icon={MapPin} value={form.mapUrl || ''} onChange={update('mapUrl')} placeholder="https://maps.google.com/..." />
      </div>

      {/* Danger Zone */}
      <div className="bg-[#131315] border border-red-900/30 rounded-xl p-6">
        <h2 className="font-semibold text-red-400 mb-1">Opasna zona</h2>
        <p className="text-zinc-500 text-sm mb-4">Ove akcije su nepovratne. Budite pažljivi.</p>
        <div className="flex flex-wrap gap-3">
          <button className="text-sm px-4 py-2 rounded-lg border border-red-900/50 text-red-400/70 hover:border-red-500/40 hover:text-red-400 transition-colors">
            Obriši sva prodata vozila
          </button>
          <button className="text-sm px-4 py-2 rounded-lg border border-red-900/50 text-red-400/70 hover:border-red-500/40 hover:text-red-400 transition-colors">
            Obriši sve upite
          </button>
        </div>
      </div>
    </div>
  );
}
