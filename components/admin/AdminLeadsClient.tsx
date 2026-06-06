'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import { parseAttribution } from '@/lib/utm';
import {
  Car,
  ChevronDown,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';

interface Props {
  readonly leads: Lead[];
}

const statusConfig: Record<string, { label: string; classes: string; next: string; nextLabel: string }> = {
  novo: { label: 'Novo', classes: 'bg-amber-50 text-amber-800 border-amber-200', next: 'kontaktiran', nextLabel: 'Oznaci kontaktirano' },
  kontaktiran: { label: 'Kontaktiran', classes: 'bg-blue-50 text-blue-800 border-blue-200', next: 'zakazano', nextLabel: 'Zakazi gledanje' },
  zakazano: { label: 'Zakazano gledanje', classes: 'bg-cyan-50 text-cyan-800 border-cyan-200', next: 'rezervisano', nextLabel: 'Rezervisi' },
  rezervisano: { label: 'Rezervisano', classes: 'bg-violet-50 text-violet-800 border-violet-200', next: 'prodato', nextLabel: 'Prodato' },
  prodato: { label: 'Prodato', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200', next: 'novo', nextLabel: 'Ponovo otvori' },
  izgubljeno: { label: 'Izgubljeno', classes: 'bg-neutral-100 text-neutral-500 border-neutral-200', next: 'novo', nextLabel: 'Ponovo otvori' },
};

const typeLabels: Record<string, string> = {
  inquiry: 'Upit za vozilo',
  contact: 'Kontakt poruka',
};

const sourceLabels: Record<string, string> = {
  web: 'Web',
  viber: 'Viber',
  whatsapp: 'WhatsApp',
  phone: 'Telefon',
  email: 'Email',
};

const intentLabels: Record<string, string> = {
  phone_call: 'Poziv',
  viber_click: 'Viber klik',
  whatsapp_click: 'WhatsApp klik',
  request_video: 'Video zahtev',
  reservation_request: 'Rezervacija',
  schedule_viewing: 'Zakazivanje',
  general_inquiry: 'Opsti upit',
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


async function callDeleteLead(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export default function AdminLeadsClient({ leads: initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const filtered = leads
    .filter((lead) => {
      const q = search.toLowerCase();
      if (q && !lead.name.toLowerCase().includes(q) && !(lead.vehicleTitle || '').toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateStatus = async (id: string, status: Lead['status']) => {
    const prevStatus = leads.find((l) => l.id === id)?.status;
    setLeads((items) => items.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok && prevStatus !== undefined) {
        setLeads((items) => items.map((lead) => (lead.id === id ? { ...lead, status: prevStatus } : lead)));
        setSelected((prev) => (prev?.id === id ? { ...prev, status: prevStatus } : prev));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id: string) => setDeleteConfirmId(id);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    setDeleteError(false);
    const ok = await callDeleteLead(deleteConfirmId);
    setDeleting(false);
    if (ok) {
      setLeads((items) => items.filter((l) => l.id !== deleteConfirmId));
      if (selected?.id === deleteConfirmId) setSelected(null);
      setDeleteConfirmId(null);
    } else {
      setDeleteError(true);
    }
  };

  const counts = {
    all: leads.length,
    novo: leads.filter((lead) => lead.status === 'novo').length,
    kontaktiran: leads.filter((lead) => lead.status === 'kontaktiran').length,
    zakazano: leads.filter((lead) => lead.status === 'zakazano').length,
    rezervisano: leads.filter((lead) => lead.status === 'rezervisano').length,
    prodato: leads.filter((lead) => lead.status === 'prodato').length,
    izgubljeno: leads.filter((lead) => lead.status === 'izgubljeno').length,
  };

  return (
    <div className="space-y-5 p-3 min-[390px]:space-y-6 min-[390px]:p-4 sm:p-6 lg:p-8">
      {/* ── Delete confirmation modal ───────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>
            <h2 className="text-lg font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              Brisanje upita
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Da li ste sigurni da želite da obrišete ovaj lead?
            </p>
            {deleteError && (
              <p className="mt-3 text-sm font-semibold text-red-600">Greška pri brisanju. Pokušajte ponovo.</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteError(false); }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--color-text)] disabled:opacity-50"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Brisanje…' : 'Obriši'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Prodajni CRM</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Upiti kupaca
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {counts.novo > 0 && <span className="font-bold text-amber-800">{counts.novo} novih / </span>}
            {leads.length} ukupno evidentiranih kontakata
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {([
          { label: 'Novo', key: 'novo' },
          { label: 'Kontaktiran', key: 'kontaktiran' },
          { label: 'Zakazano', key: 'zakazano' },
          { label: 'Rezervisano', key: 'rezervisano' },
          { label: 'Prodato', key: 'prodato' },
          { label: 'Izgubljeno', key: 'izgubljeno' },
        ] as const).map(({ label, key }) => (
          <button
            type="button"
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className={`rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 min-[390px]:p-5 ${
              statusFilter === key
                ? 'border-(--accent-border) bg-(--accent-soft)'
                : 'border-(--color-border) bg-white hover:border-(--accent-border)'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-placeholder)]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{counts[key]}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Pretrazi po imenu ili vozilu..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-premium w-full rounded-2xl py-3 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="relative sm:w-64">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="input-premium w-full cursor-pointer appearance-none rounded-2xl py-3 pl-4 pr-10 text-sm"
          >
            <option value="all">Svi ({counts.all})</option>
            <option value="novo">Novo ({counts.novo})</option>
            <option value="kontaktiran">Kontaktiran ({counts.kontaktiran})</option>
            <option value="zakazano">Zakazano ({counts.zakazano})</option>
            <option value="rezervisano">Rezervisano ({counts.rezervisano})</option>
            <option value="prodato">Prodato ({counts.prodato})</option>
            <option value="izgubljeno">Izgubljeno ({counts.izgubljeno})</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>
      </div>

      <div className="grid min-h-[520px] gap-5 xl:grid-cols-[1fr_430px]">
        <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <MessageSquare size={22} />
              </div>
              <p className="font-black text-[var(--color-text)]">Nema upita</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Promenite filter ili proverite kasnije.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {filtered.map((lead) => {
                const active = selected?.id === lead.id;
                return (
                  <div
                    key={lead.id}
                    className={`flex items-start gap-2 px-4 py-4 transition min-[390px]:px-5 ${active ? 'bg-[var(--accent-soft)] shadow-[inset_3px_0_0_var(--accent)]' : 'hover:bg-[var(--color-surface-2)]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(lead)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${lead.status === 'novo' ? 'bg-[var(--accent)]' : 'bg-[var(--color-border-strong)]'}`} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="font-bold text-[var(--color-text)]">{lead.name}</p>
                              <span className="text-xs font-semibold text-[var(--color-text-placeholder)]">{lead.source ? (sourceLabels[lead.source] ?? lead.source) : ''}</span>
                            </div>
                            {lead.vehicleTitle && (
                              <p className="mt-1 truncate text-xs font-bold text-[var(--accent-dark)]">{lead.vehicleTitle}</p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">{intentLabels[lead.intent] ?? lead.intent}</span>
                              {lead.dealerName && <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-dark)]">{lead.dealerName}</span>}
                            </div>
                            <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">{lead.message}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig[lead.status]?.classes}`}>
                            {statusConfig[lead.status]?.label}
                          </span>
                          <span className="text-xs text-[var(--color-text-placeholder)]">{timeAgo(lead.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(lead.id)}
                      aria-label="Obriši upit"
                      className="mt-1 shrink-0 rounded-xl p-2 text-[var(--color-text-muted)] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {selected ? (
          <aside className="rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-sm min-[390px]:p-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-placeholder)]">{typeLabels[selected.type]}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                aria-label="Zatvori detalje"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {selected.phone && <ContactRow href={`tel:${selected.phone}`} icon={<Phone size={15} />} label={selected.phone} />}
              {selected.email && <ContactRow href={`mailto:${selected.email}`} icon={<Mail size={15} />} label={selected.email} />}
              {selected.vehicleTitle && <ContactRow icon={<Car size={15} />} label={selected.vehicleTitle} />}
              {selected.dealerName && <ContactRow icon={<Car size={15} />} label={`Partner: ${selected.dealerName}`} />}
              <ContactRow icon={<MessageSquare size={15} />} label={`Intent: ${intentLabels[selected.intent] ?? selected.intent}`} />
              <ContactRow icon={<MessageSquare size={15} />} label={`Kanal: ${sourceLabels[selected.preferredContactChannel] ?? selected.preferredContactChannel}`} />
              <ContactRow icon={<Clock size={15} />} label={new Date(selected.createdAt).toLocaleString('sr-RS')} muted />
            </div>

            {/* Attribution — UTM params captured at the moment of the lead action */}
            {selected.attribution && (() => {
              const utm = parseAttribution(selected.attribution);
              if (!utm) return null;
              return (
                <div className="mt-4 rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-text-placeholder)">
                    Poreklo posete
                  </p>
                  <div className="space-y-1.5 text-xs text-(--color-text-muted)">
                    {utm.utm_source   && <p><span className="font-semibold text-(--color-text)">Izvor:</span> {utm.utm_source}</p>}
                    {utm.utm_medium   && <p><span className="font-semibold text-(--color-text)">Medium:</span> {utm.utm_medium}</p>}
                    {utm.utm_campaign && <p><span className="font-semibold text-(--color-text)">Kampanja:</span> {utm.utm_campaign}</p>}
                    {utm.utm_content  && <p><span className="font-semibold text-(--color-text)">Sadržaj:</span> {utm.utm_content}</p>}
                    {utm.referrer     && <p><span className="font-semibold text-(--color-text)">Referrer:</span> {utm.referrer}</p>}
                    {utm.landingPage  && <p><span className="font-semibold text-(--color-text)">Landing:</span> {utm.landingPage}</p>}
                  </div>
                </div>
              );
            })()}

            <div className="mt-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-placeholder)]">Poruka</p>
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">{selected.message}</p>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-placeholder)]">Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateStatus(selected.id, key as Lead['status'])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      selected.status === key
                        ? cfg.classes
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm">
                  <Phone size={16} />
                  Pozovi odmah
                </a>
              )}
              {selected.phone && (
                <a
                  href={`viber://chat?number=${selected.phone.replace(/\s/g, '')}`}
                  className="btn-outline inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm"
                >
                  <MessageSquare size={16} />
                  Posalji Viber
                </a>
              )}
              <button
                type="button"
                onClick={() => confirmDelete(selected.id)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={15} />
                Obriši upit
              </button>
            </div>
          </aside>
        ) : (
          <aside className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              <User size={22} />
            </div>
            <p className="font-black text-[var(--color-text)]">Odaberite upit</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Detalji kupca, status i kontakt akcije prikazuju se ovde.</p>
          </aside>
        )}
      </div>
    </div>
  );
}

function ContactRow({ icon, label, href, muted = false }: { readonly icon: React.ReactNode; readonly label: string; readonly href?: string; readonly muted?: boolean }) {
  const className = 'flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-semibold transition hover:border-[var(--accent-border)]';
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">{icon}</span>
      <span className={muted ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}>{label}</span>
    </>
  );

  if (href) {
    return <a href={href} className={className}>{content}</a>;
  }

  return <div className={className}>{content}</div>;
}
