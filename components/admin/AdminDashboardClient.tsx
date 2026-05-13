'use client';

import { Vehicle } from '@/types/vehicle';
import { Lead } from '@/types/lead';
import Link from 'next/link';
import {
  Car, TrendingUp, CheckCircle, EyeOff, MessageSquare, Plus,
  Clock, User, Phone, ArrowRight, BarChart3, AlertCircle,
} from 'lucide-react';

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

const statusBadge: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border border-amber-200',
  read: 'bg-blue-50 text-blue-700 border border-blue-200',
  replied: 'bg-green-50 text-green-700 border border-green-200',
  closed: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const statusLabel: Record<string, string> = {
  new: 'Novo',
  read: 'Pročitano',
  replied: 'Odgovoreno',
  closed: 'Zatvoreno',
};

const vehicleStatusMap: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktivan', cls: 'bg-green-50 text-green-700 border border-green-200' },
  sold:   { label: 'Prodat',  cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  hidden: { label: 'Skriven', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  draft:  { label: 'Draft',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

function VehicleStatusBadge({ status }: { readonly status: string }) {
  const { label, cls } = vehicleStatusMap[status] ?? vehicleStatusMap.hidden;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

export default function AdminDashboardClient({ stats, recentLeads, recentVehicles }: Props) {
  return (
    <div className="p-6 lg:p-8 space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black text-(--color-text)"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Dashboard
          </h1>
          <p className="text-(--color-text-muted) text-sm mt-1">
            {new Date().toLocaleDateString('sr-RS', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="admin/vehicles/new"
          className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={15} />
          Dodaj vozilo
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Ukupno', value: stats.total, icon: Car, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Aktivna', value: stats.active, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Prodana', value: stats.sold, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Skrivena', value: stats.hidden, icon: EyeOff, color: 'text-gray-500', bg: 'bg-gray-100' },
          { label: 'Novi upiti', value: stats.newLeads, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Svi upiti', value: stats.totalLeads, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-(--color-border) bg-white p-4 flex flex-col gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p
                className="text-2xl font-black text-(--color-text)"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.value}
              </p>
              <p className="text-xs text-(--color-text-muted) mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Recent leads */}
        <div className="lg:col-span-3 rounded-2xl border border-(--color-border) bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={15} className="text-(--color-gold)" />
              <h2
                className="font-bold text-(--color-text) text-sm"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Poslednji upiti
              </h2>
              {stats.newLeads > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {stats.newLeads}
                </span>
              )}
            </div>
            <Link
              href="admin/leads"
              className="text-xs text-(--color-text-muted) hover:text-(--color-gold-dark) flex items-center gap-1 transition-colors"
            >
              Svi upiti <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-(--color-border)">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-4 hover:bg-(--color-surface-2) transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-(--color-surface-2) border border-(--color-border) flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-(--color-text-muted)" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-(--color-text) truncate">{lead.name}</p>
                      {lead.vehicleTitle && (
                        <p className="text-xs text-(--color-gold-dark) truncate mt-0.5">{lead.vehicleTitle}</p>
                      )}
                      <p className="text-xs text-(--color-text-muted) truncate mt-1 line-clamp-1">
                        {lead.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[lead.status]}`}>
                      {statusLabel[lead.status]}
                    </span>
                    <div className="flex items-center gap-1 text-(--color-text-muted)">
                      <Clock size={11} />
                      <span className="text-xs">{timeAgo(lead.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + recent vehicles */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick actions */}
          <div className="rounded-2xl border border-(--color-border) bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-(--color-gold)" />
              <h2
                className="font-bold text-(--color-text) text-sm"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Brze akcije
              </h2>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Dodaj novo vozilo', href: 'admin/vehicles/new', icon: Plus, accent: true },
                { label: 'Upravljaj vozilima', href: 'admin/vehicles', icon: Car },
                { label: 'Pregled upita', href: 'admin/leads', icon: MessageSquare },
                { label: 'Podešavanja salona', href: 'admin/settings', icon: Phone },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    action.accent
                      ? 'bg-(--color-gold-bg) text-(--color-gold-dark) hover:bg-(--color-gold-border) border border-(--color-gold-border)'
                      : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-2)'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <action.icon size={15} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent vehicles */}
          <div className="rounded-2xl border border-(--color-border) bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
              <div className="flex items-center gap-2.5">
                <Car size={15} className="text-(--color-gold)" />
                <h2
                  className="font-bold text-(--color-text) text-sm"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Poslednja vozila
                </h2>
              </div>
              <Link
                href="admin/vehicles"
                className="text-xs text-(--color-text-muted) hover:text-(--color-gold-dark) flex items-center gap-1 transition-colors"
              >
                Sva <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-(--color-border)">
              {recentVehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-(--color-surface-2) transition-colors"
                >
                  {v.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.images[0].url}
                      alt={v.title}
                      className="w-12 h-9 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-9 rounded-lg bg-(--color-surface-2) border border-(--color-border) shrink-0 flex items-center justify-center">
                      <Car size={14} className="text-(--color-text-muted)" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-(--color-text) truncate">{v.title}</p>
                    <p className="text-xs font-semibold text-(--color-gold-dark)">
                      {v.price.toLocaleString('sr-RS')} {v.currency}
                    </p>
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
