import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Camera, Fuel, Gauge, MapPin, Settings2 } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { cn, formatMileage, formatPrice, formatVatMode } from '@/lib/utils';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';

interface VehicleCardProps {
  readonly vehicle: Vehicle;
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function VehicleCard({ vehicle, locale, t }: VehicleCardProps) {
  const mainImage = vehicle.images[0]?.url || '';
  const isSold = vehicle.status === 'sold';
  const trustBadges = getVehicleTrustBadges(vehicle).slice(0, 2);
  const vatText = formatVatMode(vehicle.vatMode);

  return (
    <Link href={`/${locale}/vehicle/${vehicle.slug}`} className="group block h-full">
      <article
        className={cn(
          'vehicle-card flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-[0_10px_34px_rgba(15,15,20,0.07)]',
          isSold && 'opacity-70'
        )}
      >
        {/* Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--color-surface-2)]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={vehicle.title}
              width={800}
              height={500}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="card-image absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <PremiumVehiclePlaceholder className="card-image" />
          )}
          <div className="absolute inset-0 bg-black/10" />

          {isSold && <VehicleStatusBadge vehicle={vehicle} compact className="absolute left-3 top-3" />}
          {vehicle.featured && !isSold && (
            <div
              className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Izdvojeno
            </div>
          )}

          {vehicle.images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
              <Camera size={11} />
              <span>{vehicle.images.length}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3.5 min-[390px]:p-4">
          <div className="mb-3 flex min-h-[3.75rem] flex-col gap-2 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between min-[360px]:gap-3">
            <div className="min-w-0">
              <h3
                className="line-clamp-2 text-sm font-bold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--accent-dark)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {vehicle.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                {vehicle.generation || vehicle.model}
              </p>
            </div>
            <div className="shrink-0 text-left min-[360px]:text-right">
              <div
                className="whitespace-nowrap text-base font-black leading-tight text-[var(--accent-dark)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPrice(vehicle.price, vehicle.currency)}
              </div>
              {vatText && <div className="text-[11px] text-[var(--color-text-muted)]">{vatText}</div>}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <Spec icon={<Calendar size={11} />} value={`${vehicle.year}. god.`} />
            <Spec icon={<Gauge size={11} />} value={formatMileage(vehicle.mileage)} />
            <Spec icon={<Fuel size={11} />} value={t.fuel[vehicle.fuelType]} />
            <Spec icon={<Settings2 size={11} />} value={t.transmission[vehicle.transmission]} />
          </div>

          <TrustBadges locale={locale} badges={trustBadges} compact className="mt-3" />

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <MapPin size={11} className="shrink-0" />
              <span>Srbija</span>
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Pogledaj
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Spec({ icon, value }: { readonly icon: React.ReactNode; readonly value: string }) {
  return (
    <div className="flex min-h-8 items-center gap-1.5 rounded-lg bg-[var(--color-surface-2)] px-2 text-[11px] text-[var(--color-text-2)] min-[390px]:px-2.5 min-[390px]:text-xs">
      <span className="shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
