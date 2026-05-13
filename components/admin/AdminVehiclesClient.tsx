'use client';

import { useState } from 'react';
import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';
import {
  Plus, Search, Filter, Edit2, Trash2, EyeOff, Eye,
  CheckCircle, Car, ChevronDown, MoreVertical, ArrowUpDown,
} from 'lucide-react';

interface Props {
  readonly vehicles: Vehicle[];
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktivan', cls: 'bg-green-50 text-green-700 border border-green-200' },
  sold:   { label: 'Prodat',  cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  hidden: { label: 'Skriven', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  draft:  { label: 'Draft',   cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

type SortKey = 'title' | 'price' | 'year' | 'createdAt';

function ToggleVisibilityButton({
  status,
  vehicleId,
  onToggle,
}: {
  readonly status: string;
  readonly vehicleId: string;
  readonly onToggle: (id: string, newStatus: Vehicle['status']) => void;
}) {
  if (status === 'active') {
    return (
      <button
        type="button"
        onClick={() => onToggle(vehicleId, 'hidden')}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-(--color-text-2) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
      >
        <EyeOff size={13} className="text-(--color-text-muted)" />
        Sakrij vozilo
      </button>
    );
  }
  if (status === 'hidden') {
    return (
      <button
        type="button"
        onClick={() => onToggle(vehicleId, 'active')}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-(--color-text-2) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
      >
        <Eye size={13} className="text-green-600" />
        Prikaži vozilo
      </button>
    );
  }
  return null;
}

function SortButton({
  col, label, sortKey, onSort,
}: {
  readonly col: SortKey;
  readonly label: string;
  readonly sortKey: SortKey;
  readonly onSort: (key: SortKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-semibold text-(--color-text-muted) hover:text-(--color-text) transition-colors group"
    >
      {label}
      <ArrowUpDown
        size={11}
        className={sortKey === col ? 'text-(--color-gold)' : 'opacity-0 group-hover:opacity-100'}
      />
    </button>
  );
}

export default function AdminVehiclesClient({ vehicles: initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = vehicles
    .filter((v) => {
      const q = search.toLowerCase();
      if (q && !v.title.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = typeof av === 'number' ? av : 0;
      const bn = typeof bv === 'number' ? bv : 0;
      return sortDir === 'asc' ? an - bn : bn - an;
    });

  const toggleStatus = (id: string, newStatus: Vehicle['status']) => {
    setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    setOpenMenu(null);
  };

  const deleteVehicle = (id: string) => {
    setVehicles((vs) => vs.filter((v) => v.id !== id));
    setConfirmDelete(null);
  };

  const counts = {
    all: vehicles.length,
    active: vehicles.filter((v) => v.status === 'active').length,
    sold: vehicles.filter((v) => v.status === 'sold').length,
    hidden: vehicles.filter((v) => v.status === 'hidden').length,
    draft: vehicles.filter((v) => v.status === 'draft').length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black text-(--color-text)"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vozila
          </h1>
          <p className="text-(--color-text-muted) text-sm mt-1">{vehicles.length} vozila u inventaru</p>
        </div>
        <Link
          href="vehicles/new"
          className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus size={15} />
          Dodaj vozilo
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
          <input
            type="text"
            placeholder="Pretraži po brendu ili nazivu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium rounded-xl pl-9 pr-8 py-2.5 text-sm appearance-none cursor-pointer"
          >
            <option value="all">Svi ({counts.all})</option>
            <option value="active">Aktivni ({counts.active})</option>
            <option value="sold">Prodani ({counts.sold})</option>
            <option value="hidden">Skriveni ({counts.hidden})</option>
            <option value="draft">Draft ({counts.draft})</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-(--color-border) bg-white overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] gap-4 px-5 py-3.5 border-b border-(--color-border) bg-(--color-surface-2)">
          <SortButton col="title" label="Vozilo" sortKey={sortKey} onSort={handleSort} />
          <SortButton col="price" label="Cena" sortKey={sortKey} onSort={handleSort} />
          <SortButton col="year" label="Godište" sortKey={sortKey} onSort={handleSort} />
          <span className="text-xs font-semibold text-(--color-text-muted)">Status</span>
          <span className="text-xs font-semibold text-(--color-text-muted) text-right">Akcije</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-(--color-surface-2) border border-(--color-border) flex items-center justify-center mb-4">
              <Car size={20} className="text-(--color-text-muted)" />
            </div>
            <p className="font-semibold text-(--color-text)" style={{ fontFamily: 'var(--font-display)' }}>
              Nema vozila
            </p>
            <p className="text-(--color-text-muted) text-sm mt-1">Promijenite filter ili dodajte novo vozilo</p>
          </div>
        ) : (
          <div className="divide-y divide-(--color-border)">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_72px] gap-4 px-5 py-4 items-center hover:bg-(--color-surface-2) transition-colors group"
              >
                {/* Vehicle */}
                <div className="flex items-center gap-3 min-w-0">
                  {v.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.images[0].url}
                      alt={v.title}
                      className="w-14 h-10 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-10 rounded-xl bg-(--color-surface-2) border border-(--color-border) shrink-0 flex items-center justify-center">
                      <Car size={15} className="text-(--color-text-muted)" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-(--color-text) truncate">{v.title}</p>
                    <p className="text-xs text-(--color-text-muted) mt-0.5">
                      {v.mileage.toLocaleString('sr-RS')} km · {v.fuelType}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <p className="text-sm font-bold text-(--color-gold-dark)">
                  {v.price.toLocaleString('sr-RS')} {v.currency}
                </p>

                {/* Year */}
                <p className="text-sm text-(--color-text-2)">{v.year}</p>

                {/* Status */}
                <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium w-fit ${statusConfig[v.status]?.cls ?? statusConfig.hidden.cls}`}>
                  {statusConfig[v.status]?.label ?? v.status}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 relative">
                  <Link
                    href={`vehicles/${v.id}/edit`}
                    className="p-1.5 rounded-lg text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
                    title="Uredi"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === v.id ? null : v.id)}
                    className="p-1.5 rounded-lg text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {openMenu === v.id && (
                    <menu
                      className="absolute right-0 top-full mt-1 z-20 bg-white border border-(--color-border) rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] py-1 w-48 list-none p-0 m-0"
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      {v.status !== 'sold' && (
                        <button
                          type="button"
                          onClick={() => toggleStatus(v.id, 'sold')}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-(--color-text-2) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
                        >
                          <CheckCircle size={13} className="text-blue-500" />
                          Označi kao prodano
                        </button>
                      )}
                      <ToggleVisibilityButton
                        status={v.status}
                        vehicleId={v.id}
                        onToggle={toggleStatus}
                      />
                      <div className="my-1 border-t border-(--color-border)" />
                      <button
                        type="button"
                        onClick={() => { setConfirmDelete(v.id); setOpenMenu(null); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                        Obriši vozilo
                      </button>
                    </menu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-(--color-border) rounded-3xl p-7 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3
              className="text-lg font-black text-(--color-text) text-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Obriši vozilo?
            </h3>
            <p className="text-(--color-text-muted) text-sm text-center mt-2">
              Ova akcija je nepovratna. Vozilo će biti trajno obrisano.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="btn-outline flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
              >
                Otkaži
              </button>
              <button
                type="button"
                onClick={() => deleteVehicle(confirmDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
