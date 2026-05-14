import { Clock3, Flame, LockKeyhole, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle';

interface VehicleStatusBadgeProps {
  readonly vehicle: Vehicle;
  readonly compact?: boolean;
  readonly className?: string;
}

function isRecentlyAdded(date: string) {
  const created = new Date(date).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 1000 * 60 * 60 * 24 * 21;
}

export default function VehicleStatusBadge({ vehicle, compact = false, className }: VehicleStatusBadgeProps) {
  const state =
    vehicle.status === 'sold'
      ? { label: 'Prodato', icon: ShieldCheck, cls: 'border-red-200 bg-red-50 text-red-700' }
      : vehicle.status === 'draft'
        ? { label: 'Rezervisano', icon: LockKeyhole, cls: 'border-amber-200 bg-amber-50 text-amber-800' }
        : isRecentlyAdded(vehicle.createdAt)
          ? { label: 'Novo u ponudi', icon: Flame, cls: 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-dark)]' }
          : { label: 'Dostupno', icon: Clock3, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' };

  const Icon = state.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-black shadow-sm',
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
        state.cls,
        className
      )}
    >
      <Icon size={compact ? 11 : 13} />
      {state.label}
    </span>
  );
}
