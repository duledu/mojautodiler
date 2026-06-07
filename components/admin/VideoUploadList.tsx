'use client';

import { AlertCircle, Film, X } from 'lucide-react';
import type { VideoSlot } from './media-types';

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface RowProps {
  readonly slot: VideoSlot;
  readonly onDelete: (slot: VideoSlot) => void;
}

function VideoRow({ slot, onDelete }: RowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-2.5">
      <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/80">
        {slot.uploading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : slot.error ? (
          <AlertCircle className="h-5 w-5 text-red-400" />
        ) : (
          <video src={slot.previewUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
        )}
        {!slot.uploading && !slot.error && (
          <Film className="pointer-events-none absolute h-5 w-5 text-white/80 drop-shadow" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-(--color-text)">{slot.filename}</p>
        {slot.error ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-red-600">{slot.error}</p>
        ) : (
          <p className="mt-0.5 text-[11px] text-(--color-text-muted)">
            {slot.uploading ? 'Otpremanje…' : formatMb(slot.sizeBytes)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(slot)}
        title="Ukloni video"
        className="shrink-0 rounded-xl border border-(--color-border) bg-white p-2 text-(--color-text-muted) transition hover:border-red-200 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ListProps {
  readonly slots: VideoSlot[];
  readonly onDelete: (slot: VideoSlot) => void;
}

export default function VideoUploadList({ slots, onDelete }: ListProps) {
  if (slots.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {slots.map((slot) => (
        <VideoRow key={slot.id} slot={slot} onDelete={onDelete} />
      ))}
    </div>
  );
}
