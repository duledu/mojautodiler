import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  History,
  Images,
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
  | 'dealer'
  | 'gallery';

const iconMap = {
  verified:    BadgeCheck,
  swiss:       Sparkles,
  service:     History,
  vin:         FileCheck2,
  inspection:  ClipboardCheck,
  transparent: ShieldCheck,
  warranty:    Wrench,
  dealer:      Gauge,
  gallery:     Images,
} satisfies Record<TrustBadgeKey, React.ComponentType<{ size?: number; className?: string }>>;

const copy = {
  sr: {
    verified:    'Provereno vozilo',
    swiss:       'Uvoz iz inostranstva',
    service:     'Servisna istorija',
    vin:         'VIN proveren',
    inspection:  'Pregled moguć',
    transparent: 'Transparentna kupovina',
    warranty:    'Garancija dilera',
    dealer:      'Pouzdan prodavac',
    gallery:     'Detaljna galerija',
  },
  sq: {
    verified:    'Automjet i verifikuar',
    swiss:       'Import nga jashtë vendit',
    service:     'Histori servisi',
    vin:         'VIN i verifikuar',
    inspection:  'Kontroll i mundshëm',
    transparent: 'Blerje transparente',
    warranty:    'Garanci dileri',
    dealer:      'Shites i besuar',
    gallery:     'Galeri e detajuar',
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
  const origin = (vehicle.origin ?? '').toLowerCase().trim();

  // Show import badge for any non-blank, non-Serbia origin
  if (origin && !origin.includes('srbija') && !origin.includes('serbia')) {
    badges.splice(1, 0, 'swiss');
  }

  if (vehicle.registration || vehicle.dealerNotes || vehicle.features.length > 0) {
    badges.push('service');
  }
  if (vehicle.vin) badges.push('vin');
  if (vehicle.condition === 'uvoz' || vehicle.mileage < 160_000) badges.push('inspection');

  // Rich gallery signal
  if (vehicle.images.length >= 10) badges.push('gallery');

  return Array.from(new Set(badges)).slice(0, 6);
}
