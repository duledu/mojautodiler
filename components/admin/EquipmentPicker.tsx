'use client';

import { useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';

interface Props {
  readonly predefined: readonly string[];
  readonly selected: string[];
  readonly onChange: (items: string[]) => void;
}

export default function EquipmentPicker({ predefined, selected, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [customInput, setCustomInput] = useState('');

  const filtered = query.trim()
    ? predefined.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
    : predefined;

  const toggle = (item: string) => {
    onChange(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item],
    );
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomInput('');
  };

  // Items in `selected` that are not in the predefined list are custom entries
  const customItems = selected.filter((item) => !predefined.includes(item));

  return (
    <div className="space-y-3">
      {/* Search / filter */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži stavke..."
          className="input-premium w-full rounded-xl py-2 pl-8 pr-3 text-sm"
          suppressHydrationWarning
        />
      </div>

      {/* Predefined checkbox grid — scrollable */}
      <div className="max-h-56 overflow-y-auto overscroll-contain rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-2">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-xs text-(--color-text-muted)">Nema rezultata</p>
        ) : (
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {filtered.map((item) => {
              const checked = selected.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggle(item)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors ${
                    checked
                      ? 'bg-white font-semibold text-(--accent-dark)'
                      : 'text-(--color-text-muted) hover:bg-white/70 hover:text-(--color-text)'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                      checked
                        ? 'border-(--accent) bg-(--accent) text-white'
                        : 'border-(--color-border-strong) bg-white'
                    }`}
                  >
                    {checked && <Check size={10} />}
                  </span>
                  <span className="text-left leading-tight">{item}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-xs text-(--color-text-muted)">
          <span className="font-bold text-(--color-text)">{selected.length}</span> izabrano
          {customItems.length > 0 && ` (${customItems.length} prilagođeno)`}
        </p>
      )}

      {/* Custom items chips */}
      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customItems.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-(--accent-border) bg-(--accent-soft) px-2.5 py-1 text-xs font-bold text-(--accent-dark)"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(selected.filter((s) => s !== item))}
                className="text-(--color-text-placeholder) transition hover:text-red-500"
                aria-label={`Ukloni ${item}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Dodaj stavku po izboru..."
          className="input-premium flex-1 rounded-xl px-3 py-2.5 text-sm"
          suppressHydrationWarning
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="rounded-xl border border-(--color-border) bg-white px-3 py-2.5 text-(--color-text-muted) transition hover:border-(--accent-border) hover:text-(--accent-dark) disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
