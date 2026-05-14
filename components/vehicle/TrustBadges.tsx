import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  History,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';
import type { Vehicle } from '@/types/vehicle';

export type TrustBadgeKey =
  | 'verified'
  | 'swiss'
  | 'service'
  | 'vin'
  | 'inspection'
  | 'transparent'
  | 'warranty'
  | 'dealer';

const iconMap = {
  verified: BadgeCheck,
  swiss: Sparkles,
  service: History,
  vin: FileCheck2,
  inspection: ClipboardCheck,
  transparent: ShieldCheck,
  warranty: Wrench,
  dealer: Gauge,
} satisfies Record<TrustBadgeKey, React.ComponentType<{ size?: number; className?: string }>>;

const copy = {
  sr: {
    verified: 'Provereno vozilo',
    swiss: 'Uvoz iz Svajcarske',
    service: 'Servisna istorija',
    vin: 'VIN proveren',
    inspection: 'Multi-point provera',
    transparent: 'Transparentna kupovina',
    warranty: 'Garancija salona',
    dealer: 'Pouzdan prodavac',
  },
  sq: {
    verified: 'Automjet i verifikuar',
    swiss: 'Import nga Zvicra',
    service: 'Histori servisi',
    vin: 'VIN i verifikuar',
    inspection: 'Kontroll profesional',
    transparent: 'Blerje transparente',
    warranty: 'Garanci salloni',
    dealer: 'Shites i besuar',
  },
} satisfies Record<Locale, Record<TrustBadgeKey, string>>;

interface TrustBadgesProps {
  readonly locale: Locale;
  readonly badges?: TrustBadgeKey[];
  readonly compact?: boolean;
  readonly className?: string;
}

export function TrustBadges({
  locale,
  badges = ['verified', 'swiss', 'service', 'inspection', 'transparent', 'dealer'],
  compact = false,
  className,
}: TrustBadgesProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5 min-[390px]:gap-2', className)}>
      {badges.map((badge) => {
        const Icon = iconMap[badge];
        return (
          <span
            key={badge}
            className={cn(
              'inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] font-bold leading-tight text-[var(--accent-dark)]',
              compact ? 'px-2 py-1 text-[10px] min-[390px]:px-2.5 min-[390px]:text-[11px]' : 'px-2.5 py-1.5 text-[11px] min-[390px]:px-3 min-[390px]:text-xs'
            )}
          >
            <Icon size={compact ? 12 : 14} className="shrink-0 text-[var(--accent)]" />
            {copy[locale][badge]}
          </span>
        );
      })}
    </div>
  );
}

export function getVehicleTrustBadges(vehicle: Vehicle): TrustBadgeKey[] {
  const badges: TrustBadgeKey[] = ['verified', 'transparent', 'dealer'];

  if ((vehicle.origin || '').toLowerCase().includes('svaj') || (vehicle.origin || '').toLowerCase().includes('swiss')) {
    badges.splice(1, 0, 'swiss');
  }
  if (vehicle.registration || vehicle.dealerNotes || vehicle.features.length > 0) badges.push('service');
  if (vehicle.vin) badges.push('vin');
  if (vehicle.condition === 'uvoz' || vehicle.mileage < 160000) badges.push('inspection');

  return Array.from(new Set(badges)).slice(0, 6);
}
