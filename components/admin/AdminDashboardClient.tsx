'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, BarChart3, Car, CheckCircle, Clock, EyeOff, MessageSquare, Phone, Plus, TrendingUp, User } from 'lucide-react';
import { Lead } from '@/types/lead';
import { Vehicle } from '@/types/vehicle';

interface Props {
  readonly stats: {
    total: number;
    active: number;
    sold: number;
    hidden: number;
    newLeads: number;
    totalLeads: number;
  };
  readonly recentLeads: Lead[];
  readonly recentVehicles: Vehicle[];
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Upravo';
  if (hours < 24) return `Pre ${hours}h`;
  if (days < 7) return `Pre ${days}d`;
  return new Date(date).toLocaleDateString('sr-RS');
}

const leadStatus: Record<string, string> = {
  new: 'bg-amber-50 text-amber-800 border-amber-200',
  read: 'bg-blue-50 text-blue-800 border-blue-200',
  replied: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  closed: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

const leadStatusLabel: Record<string, string> = {
  new: 'Novo',
  read: 'Pročitano',
  replied: 'Odgovoreno',
  closed: 'Zatvoreno',
};

const vehicleStatus: Record<string, { label: string; className: string }> = {
  active: { label: 'Aktivan', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  sold: { label: 'Prodat', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  hidden: { label: 'Skriven', className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  draft: { label: 'Draft', className: 'bg-amber-50 text-amber-800 border-amber-200' },
};

export default function AdminDashboardClient({ stats, recentLeads, recentVehicles }: Props) {
  const kpis = [
    { label: 'Ukupno vozila', value: stats.total, icon: Car, note: 'ceo inventar' },
    { label: 'Aktivna vozila', value: stats.active, icon: TrendingUp, note: 'vidljivo na sajtu' },
    { label: 'Prodata vozila', value: stats.sold, icon: CheckCircle, note: 'zatvoren promet' },
    { label: 'Skrivena', value: stats.hidden, icon: EyeOff, note: 'van javne ponude' },
    { label: 'Novi upiti - poruke', value: stats.newLeads, icon: AlertCircle, note: 'za brzu obradu' },
    { label: 'Svi upiti', value: stats.totalLeads, icon: MessageSquare, note: 'CRM istorija' },
  ];

  return (
    <div className="space-y-7 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">AutoFerari Preševo</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Dealership Command
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {new Date().toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="vehicles/new" className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm">
          <Plus size={16} />
          Dodaj vozilo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map(({ label, value, icon: Icon, note }) => (
          <article key={label} className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-placeholder)]">Live</span>
            </div>
            <div className="text-3xl font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
            <div className="mt-1 text-sm font-bold text-[var(--color-text)]">{label}</div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
          <PanelHeader icon={<MessageSquare size={17} />} title="Poslednji upiti" href="leads" action="Otvori CRM" badge={stats.newLeads} />
          <div className="divide-y divide-[var(--color-border)]">
            {recentLeads.length === 0 ? (
              <EmptyState icon={<MessageSquare size={22} />} title="Nema novih upita" text="Kada kupci pošalju zahtev, pojaviće se ovde." />
            ) : recentLeads.map((lead) => (
              <article key={lead.id} className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-[var(--color-surface-2)]">
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                    <User size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[var(--color-text)]">{lead.name}</p>
                      <span className="text-xs text-[var(--color-text-placeholder)]">{lead.source}</span>
                    </div>
                    {lead.vehicleTitle && <p className="mt-0.5 truncate text-xs font-bold text-[var(--accent-dark)]">{lead.vehicleTitle}</p>}
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-muted)]">{lead.message}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${leadStatus[lead.status]}`}>{leadStatusLabel[lead.status]}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-placeholder)]"><Clock size={11} />{timeAgo(lead.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={17} className="text-[var(--accent)]" />
              <h2 className="font-black text-[var(--color-text)]">Brze akcije</h2>
            </div>
            <div className="grid gap-2">
              <QuickAction href="vehicles/new" icon={<Plus size={16} />} label="Dodaj novo vozilo" featured />
              <QuickAction href="vehicles" icon={<Car size={16} />} label="Upravljaj vozilima" />
              <QuickAction href="leads" icon={<MessageSquare size={16} />} label="Pregled upita" />
              <QuickAction href="settings" icon={<Phone size={16} />} label="Podešavanja salona" />
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
            <PanelHeader icon={<Car size={17} />} title="Poslednja vozila" href="vehicles" action="Sva vozila" />
            <div className="divide-y divide-[var(--color-border)]">
              {recentVehicles.map((vehicle) => {
                const status = vehicleStatus[vehicle.status] ?? vehicleStatus.hidden;
                return (
                  <article key={vehicle.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-[var(--color-surface-2)]">
                    {vehicle.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vehicle.images[0].url} alt={vehicle.title} className="h-12 w-16 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                        <Car size={16} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--color-text)]">{vehicle.title}</p>
                      <p className="text-xs font-bold text-[var(--accent-dark)]">{vehicle.price.toLocaleString('sr-RS')} {vehicle.currency}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ icon, title, href, action, badge }: { icon: React.ReactNode; title: string; href: string; action: string; badge?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-[var(--accent)]">{icon}</span>
        <h2 className="font-black text-[var(--color-text)]">{title}</h2>
        {!!badge && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-white">{badge}</span>}
      </div>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)] transition hover:text-[var(--accent-dark)]">
        {action}<ArrowRight size={12} />
      </Link>
    </div>
  );
}

function QuickAction({ href, icon, label, featured = false }: { href: string; icon: React.ReactNode; label: string; featured?: boolean }) {
  return (
    <Link
      href={href}
      className={featured
        ? 'flex items-center gap-3 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-bold text-[var(--accent-dark)] transition hover:-translate-y-0.5'
        : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'}
    >
      <span className={featured ? 'text-[var(--accent)]' : 'text-[var(--color-text-placeholder)]'}>{icon}</span>
      {label}
    </Link>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{icon}</div>
      <p className="font-black text-[var(--color-text)]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}
