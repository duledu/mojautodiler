'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import {
  MessageSquare, Phone, Mail, Car, Clock, Search,
  ChevronDown, User, X
} from 'lucide-react';

interface Props {
  leads: Lead[];
}

const statusConfig: Record<string, { label: string; classes: string; next: string; nextLabel: string }> = {
  new: { label: 'Novo', classes: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', next: 'read', nextLabel: 'Označi pročitano' },
  read: { label: 'Pročitano', classes: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', next: 'replied', nextLabel: 'Označi odgovoreno' },
  replied: { label: 'Odgovoreno', classes: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', next: 'closed', nextLabel: 'Zatvori upit' },
  closed: { label: 'Zatvoreno', classes: 'bg-zinc-600/40 text-zinc-400 border border-zinc-600/30', next: 'new', nextLabel: 'Ponovo otvori' },
};

const typeLabels: Record<string, string> = {
  inquiry: 'Upit za vozilo',
  contact: 'Kontakt poruka',
};

const sourceLabels: Record<string, string> = {
  web: 'Web',
  viber: 'Viber',
  phone: 'Telefon',
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Upravo';
  if (hours < 24) return `Pre ${hours}h`;
  if (days < 7) return `Pre ${days}d`;
  return new Date(date).toLocaleDateString('sr-RS');
}

export default function AdminLeadsClient({ leads: initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase();
      if (q && !l.name.toLowerCase().includes(q) && !(l.vehicleTitle || '').toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateStatus = (id: string, status: Lead['status']) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    read: leads.filter(l => l.status === 'read').length,
    replied: leads.filter(l => l.status === 'replied').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Upiti</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {counts.new > 0 && <span className="text-amber-400 font-medium">{counts.new} novih · </span>}
            {leads.length} ukupno
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pretraži po imenu ili vozilu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#131315] border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#131315] border border-zinc-700 rounded-lg px-3 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A84C]/60 appearance-none cursor-pointer"
          >
            <option value="all">Svi ({counts.all})</option>
            <option value="new">Nova ({counts.new})</option>
            <option value="read">Pročitana ({counts.read})</option>
            <option value="replied">Odgovorena ({counts.replied})</option>
            <option value="closed">Zatvorena ({counts.closed})</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-4 min-h-[500px]">
        {/* Lead list */}
        <div className="bg-[#131315] border border-zinc-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MessageSquare className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-zinc-400 text-sm">Nema upita</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {filtered.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className={`w-full text-left px-5 py-4 hover:bg-zinc-800/30 transition-colors ${selected?.id === lead.id ? 'bg-zinc-800/50 border-l-2 border-[#C9A84C]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${lead.status === 'new' ? 'bg-amber-400' : 'bg-zinc-700'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{lead.name}</p>
                          <span className="text-xs text-zinc-500">{lead.source ? (sourceLabels[lead.source] ?? lead.source) : ''}</span>
                        </div>
                        {lead.vehicleTitle && (
                          <p className="text-xs text-[#C9A84C] mt-0.5 truncate">{lead.vehicleTitle}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{lead.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[lead.status]?.classes}`}>
                        {statusConfig[lead.status]?.label}
                      </span>
                      <span className="text-xs text-zinc-600">{timeAgo(lead.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="bg-[#131315] border border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{typeLabels[selected.type]}</p>
                <h3 className="text-lg font-bold text-white mt-1 font-display">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                  </div>
                  {selected.phone}
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
                  </div>
                  {selected.email}
                </a>
              )}
              {selected.vehicleTitle && (
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5 text-[#C9A84C]" />
                  </div>
                  {selected.vehicleTitle}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                {new Date(selected.createdAt).toLocaleString('sr-RS')}
              </div>
            </div>

            {/* Message */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">Poruka</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{selected.message}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selected.id, key as Lead['status'])}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                      selected.status === key
                        ? cfg.classes + ' ring-1 ring-offset-1 ring-offset-[#131315] ring-current'
                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="pt-2 space-y-2">
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#b8963e] text-black font-semibold text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Pozovi odmah
                </a>
              )}
              {selected.phone && (
                <a
                  href={`viber://chat?number=${selected.phone.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors border border-zinc-700"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Pošalji Viber
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#131315] border border-zinc-800 rounded-xl flex flex-col items-center justify-center h-48 lg:h-auto text-center p-8">
            <User className="w-8 h-8 text-zinc-700 mb-3" />
            <p className="text-zinc-400 text-sm">Odaberi upit za detalje</p>
          </div>
        )}
      </div>
    </div>
  );
}
