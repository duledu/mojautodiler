'use client';

import { useState, useMemo } from 'react';
import { BadgeCheck, SlidersHorizontal, X, ChevronDown, Search, ShieldCheck } from 'lucide-react';
import { Vehicle, VehicleFilters, SortOption, FuelType, TransmissionType, BodyType } from '@/types/vehicle';
import { filterVehicles, sortVehicles, getUniqueBrands } from '@/lib/utils';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { TrustBadges } from '@/components/vehicle/TrustBadges';

interface InventoryClientProps {
  readonly locale: Locale;
  readonly t: TranslationKeys;
  readonly vehicles: Vehicle[];
}

export default function InventoryClient({ locale, t, vehicles }: InventoryClientProps) {
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [sort, setSort] = useState<SortOption>('newest');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeVehicles = useMemo(() => vehicles, [vehicles]);
  const brands = useMemo(() => getUniqueBrands(activeVehicles), [activeVehicles]);

  const filtered = useMemo(() => {
    let vehicles = filterVehicles(activeVehicles, filters);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      vehicles = vehicles.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      );
    }
    return sortVehicles(vehicles, sort);
  }, [activeVehicles, filters, sort, searchQuery]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const filterPanel = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label
          htmlFor="vehicle-search"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Pretraga
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
          <input
            id="vehicle-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BMW, Audi, Mercedes..."
            className="input-premium w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {/* Brand */}
      <FilterField label={t.inventory.filters.brand}>
        <select
          value={filters.brand || ''}
          onChange={(e) => updateFilter('brand', e.target.value)}
          className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">Sve marke</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </FilterField>

      {/* Year range */}
      <FilterField label="Godište">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" placeholder="Od" min="2000" max="2025"
            value={filters.yearFrom || ''}
            onChange={(e) => updateFilter('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
            className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="number" placeholder="Do" min="2000" max="2025"
            value={filters.yearTo || ''}
            onChange={(e) => updateFilter('yearTo', e.target.value ? Number(e.target.value) : undefined)}
            className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </div>
      </FilterField>

      {/* Price */}
      <FilterField label="Cena (€)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" placeholder="Od"
            value={filters.priceFrom || ''}
            onChange={(e) => updateFilter('priceFrom', e.target.value ? Number(e.target.value) : undefined)}
            className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="number" placeholder="Do"
            value={filters.priceTo || ''}
            onChange={(e) => updateFilter('priceTo', e.target.value ? Number(e.target.value) : undefined)}
            className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </div>
      </FilterField>

      {/* Fuel */}
      <FilterField label={t.inventory.filters.fuelType}>
        <select
          value={filters.fuelType || ''}
          onChange={(e) => updateFilter('fuelType', (e.target.value as FuelType) || undefined)}
          className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">Sve vrste goriva</option>
          {Object.entries(t.fuel).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FilterField>

      {/* Transmission */}
      <FilterField label={t.inventory.filters.transmission}>
        <select
          value={filters.transmission || ''}
          onChange={(e) => updateFilter('transmission', (e.target.value as TransmissionType) || undefined)}
          className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">Svi menjači</option>
          {Object.entries(t.transmission).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FilterField>

      {/* Body type */}
      <FilterField label={t.inventory.filters.bodyType}>
        <select
          value={filters.bodyType || ''}
          onChange={(e) => updateFilter('bodyType', (e.target.value as BodyType) || undefined)}
          className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
        >
          <option value="">Sve karoserije</option>
          {Object.entries(t.bodyType).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FilterField>

      {/* Mileage */}
      <FilterField label="Kilometraža do">
        <input
          type="number" placeholder="npr. 100000"
          value={filters.mileageTo || ''}
          onChange={(e) => updateFilter('mileageTo', e.target.value ? Number(e.target.value) : undefined)}
          className="input-premium w-full rounded-xl px-3 py-2.5 text-sm"
        />
      </FilterField>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t.common.clear}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-(--color-bg) pt-20">
      {/* Page header */}
      <div className="bg-white border-b border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="divider-gold mb-4" />
          <h1
            className="text-3xl font-black text-(--color-text) sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t.inventory.title}
          </h1>
          <p className="mt-2 text-(--color-text-muted)">{t.inventory.subtitle}</p>
          <TrustBadges locale={locale} badges={['verified', 'inspection', 'transparent', 'dealer']} compact className="mt-5" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-6 min-[390px]:px-4 min-[390px]:py-8 sm:px-6">
        <div className="flex gap-7">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-68 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-(--color-border) bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-sm font-bold text-(--color-text) uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t.common.filter}
                </h2>
                {activeFilterCount > 0 && (
                  <span className="bg-(--color-gold) text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {filterPanel}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 min-[390px]:gap-3">
              <div className="flex items-center gap-2 min-[390px]:gap-3">
                {/* Mobile filter button */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="touch-target flex items-center gap-2 rounded-xl border border-(--color-border) bg-white px-3 py-2.5 text-sm font-semibold text-(--color-text-muted) shadow-sm transition-colors hover:text-(--color-text) lg:hidden min-[390px]:px-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <SlidersHorizontal size={14} />
                  <span>{t.common.filter}</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--color-gold) text-[10px] font-black text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="text-(--color-text-muted) text-sm">
                  <span className="font-bold text-(--color-text)">{filtered.length}</span>
                  {' '}vozila
                </span>
              </div>

              {/* Sort */}
              <div className="relative shrink-0">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="input-premium max-w-[9rem] cursor-pointer appearance-none rounded-xl py-2.5 pl-3 pr-8 text-sm min-[390px]:max-w-[11.25rem] sm:max-w-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {Object.entries(t.inventory.sort).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none" />
              </div>
            </div>

            <div className="mb-5 grid gap-3 rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3.5 min-[390px]:p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--accent)] shadow-sm">
                <ShieldCheck size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Premium selekcija, ne masovna ponuda</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Svaki oglas vodi ka direktnom kontaktu, proveri dostupnosti i mirnoj kupovini.</p>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.brand && (
                  <FilterPill label={filters.brand} onRemove={() => updateFilter('brand', undefined)} />
                )}
                {filters.fuelType && (
                  <FilterPill label={t.fuel[filters.fuelType]} onRemove={() => updateFilter('fuelType', undefined)} />
                )}
                {filters.bodyType && (
                  <FilterPill label={t.bodyType[filters.bodyType]} onRemove={() => updateFilter('bodyType', undefined)} />
                )}
                {filters.transmission && (
                  <FilterPill label={t.transmission[filters.transmission]} onRemove={() => updateFilter('transmission', undefined)} />
                )}
              </div>
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 min-[390px]:gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} t={t} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-white px-4 py-16 text-center shadow-sm min-[390px]:px-6 min-[390px]:py-20">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm">
                  <BadgeCheck size={24} />
                </div>
                <p
                  className="mb-2 text-xl font-black text-(--color-text)"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t.inventory.noResults}
                </p>
                <p className="mb-6 max-w-md text-sm leading-6 text-(--color-text-muted)">Pokusajte sa sirem pretragom ili nas kontaktirajte da proverimo dolazeca vozila iz uvoza.</p>
                <button type="button" onClick={clearFilters} className="btn-outline touch-target rounded-xl px-5 py-2.5 text-sm">
                  {t.common.clear}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Zatvori filtere"
            className="absolute inset-0 w-full bg-black/40 backdrop-blur-sm cursor-default"
            onClick={() => setDrawerOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 w-[min(100vw,360px)] overflow-y-auto bg-white shadow-2xl animate-fade-in">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-white p-4 min-[390px]:p-5">
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold text-(--color-text)"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {t.common.filter}
                </h2>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--color-gold) text-[10px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="touch-target flex items-center justify-center rounded-lg text-(--color-text-muted) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text)"
                aria-label="Zatvori filtere"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 min-[390px]:p-5">
              {filterPanel}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-gold w-full mt-6 py-3.5 rounded-xl text-sm"
              >
                {t.common.apply} ({filtered.length} vozila)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterPill({ label, onRemove }: { readonly label: string; readonly onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-(--color-gold-border) bg-(--color-gold-bg) px-3 py-1.5 text-xs font-semibold text-(--color-gold-dark)">
      {label}
      <button type="button" onClick={onRemove} className="touch-target -my-3 -mr-2 inline-flex items-center justify-center hover:text-(--color-gold)" aria-label={`Ukloni filter ${label}`}>
        <X size={11} />
      </button>
    </span>
  );
}
