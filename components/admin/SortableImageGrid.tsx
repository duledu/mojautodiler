'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, GripVertical, Star, X } from 'lucide-react';
import type { ImageSlot } from './media-types';

// ─── Sortable card ─────────────────────────────────────────────────────────────

interface CardProps {
  readonly slot: ImageSlot;
  readonly isPrimary: boolean;
  readonly onDelete: (slot: ImageSlot) => void;
  readonly onSetPrimary: () => void;
}

function SortableCard({ slot, isPrimary, onDelete, onSetPrimary }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id,
    disabled: slot.uploading || !!slot.error,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-4/3 overflow-hidden rounded-2xl bg-(--color-surface-2) transition-opacity ${
        isDragging ? 'opacity-30 ring-2 ring-(--accent)' : 'opacity-100'
      }`}
    >
      {slot.uploading ? (
        /* Uploading spinner */
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-(--accent-border) border-t-(--accent)" />
          <span className="text-[10px] font-medium text-(--color-text-muted)">Uploading…</span>
        </div>
      ) : slot.error ? (
        /* Error state */
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="line-clamp-3 text-[10px] leading-tight text-red-600">{slot.error}</p>
          <button
            type="button"
            onClick={() => onDelete(slot)}
            className="mt-1 rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-100"
          >
            Ukloni
          </button>
        </div>
      ) : (
        /* Uploaded image */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.previewUrl} alt="" className="h-full w-full object-cover" />

          {/* Primary badge — position 0 */}
          {isPrimary && (
            <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-(--accent) px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_2px_8px_rgba(201,168,76,0.45)]">
              <Star className="h-2.5 w-2.5" fill="currentColor" />
              Naslovna
            </div>
          )}

          {/* Set-primary button — non-primary images */}
          {!isPrimary && (
            <button
              type="button"
              aria-pressed={false}
              onClick={onSetPrimary}
              title="Postavi kao naslovnu sliku"
              className="absolute left-1.5 top-1.5 flex items-center justify-center rounded-md border border-white/25 bg-black/50 p-1 text-white/60 backdrop-blur-sm transition-all hover:border-(--accent) hover:bg-(--accent) hover:text-white"
            >
              <Star className="h-3 w-3" />
            </button>
          )}

          {/* Drag handle — touch-safe, low-opacity at rest, full on hover */}
          <button
            type="button"
            aria-label="Prevuci za promenu redosleda"
            className="absolute bottom-1.5 right-1.5 z-10 cursor-grab touch-none rounded-lg bg-black/50 p-1.5 text-white/60 opacity-40 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* Delete overlay — pointer-events-none on wrapper so star/drag handle still work */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onDelete(slot)}
              className="pointer-events-auto rounded-full bg-red-500/90 p-1.5 text-white transition-colors hover:bg-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Drag overlay preview ──────────────────────────────────────────────────────

function OverlayCard({ slot }: { readonly slot: ImageSlot }) {
  return (
    <div className="aspect-4/3 scale-105 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-(--accent)">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={slot.previewUrl} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

// ─── Grid ──────────────────────────────────────────────────────────────────────

interface GridProps {
  readonly slots: ImageSlot[];
  readonly vehicleId?: string;
  readonly onSlotsChange: (newSlots: ImageSlot[]) => void;
  readonly onDelete: (slot: ImageSlot) => void;
}

export default function SortableImageGrid({ slots, vehicleId, onSlotsChange, onDelete }: GridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // PointerSensor: drag starts after 8 px movement — prevents accidental drags on clicks
  // TouchSensor: 150 ms hold + 8 px tolerance — avoids conflicts with page scrolling
  // KeyboardSensor: arrow-key support for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeSlot = activeId ? (slots.find((s) => s.id === activeId) ?? null) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const from = slots.findIndex((s) => s.id === active.id);
    const to   = slots.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;

    commit(arrayMove(slots, from, to));
  }

  /** Move slot at `slotId` to index 0 (makes it the primary image). */
  function setPrimary(slotId: string) {
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx <= 0) return;
    commit(arrayMove(slots, idx, 0));
  }

  /** Apply a new slot order: update state + fire-and-forget API call. */
  function commit(reordered: ImageSlot[]) {
    onSlotsChange(reordered);

    if (!vehicleId) return; // new vehicle — order will be saved on vehicle create

    const urls = reordered
      .filter((s) => s.uploadedUrl && !s.uploading)
      .map((s) => s.uploadedUrl as string);

    fetch(`/api/admin/vehicles/${vehicleId}/media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: urls }),
    }).catch((err) => console.error('[REORDER] persist failed:', err));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={slots.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {slots.map((slot, i) => (
            <SortableCard
              key={slot.id}
              slot={slot}
              isPrimary={i === 0}
              onDelete={onDelete}
              onSetPrimary={() => setPrimary(slot.id)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeSlot && <OverlayCard slot={activeSlot} />}
      </DragOverlay>
    </DndContext>
  );
}
