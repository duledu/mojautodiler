import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Calendar, Camera, Fuel, Gauge, MapPin, Settings2, ShieldCheck } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { cn, formatMileage, formatPrice, formatVatMode } from '@/lib/utils';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';
import { VehiclePromoBadge } from '@/components/vehicle/VehiclePromoBadge';

interface VehicleCardProps {
  readonly vehicle: Vehicle;
  readonly locale: Locale;
  readonly t: TranslationKeys;
}

export default function VehicleCard({ vehicle, locale, t }: VehicleCardProps) {
  const mainImage = vehicle.images[0]?.url || '';
  const isSold = vehicle.status === 'sold';
  const trustBadges = getVehicleTrustBadges(vehicle).slice(0, 2);
  const vatText = formatVatMode(vehicle.vatMode, t);
  const cardCopy = t.vehicleCard;

  return (
    <Link href={`/${locale}/vehicle/${vehicle.slug}`} className="group block h-full">
      <article
        className={cn(
          'vehicle-card flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_8px_28px_rgba(15,15,20,0.065)] sm:rounded-3xl sm:shadow-[0_10px_34px_rgba(15,15,20,0.07)]',
          isSold && 'opacity-70'
        )}
      >
        {/* Image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--color-surface-2)] sm:aspect-[16/10]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={`${vehicle.title} ${vehicle.year}`}
              width={800}
              height={500}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="card-image absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <PremiumVehiclePlaceholder className="card-image" />
          )}
          <div className="absolute inset-0 bg-black/10" />

          {isSold && <VehicleStatusBadge vehicle={vehicle} locale={locale} compact className="absolute left-3 top-3" />}
          {!isSold && vehicle.onSale && (
            <VehiclePromoBadge variant="akcija" locale={locale} compact className="absolute left-3 top-3" />
          )}
          {!isSold && !vehicle.onSale && vehicle.featured && (
            <VehiclePromoBadge variant="featured" locale={locale} compact className="absolute left-3 top-3" />
          )}

          {vehicle.images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
              <Camera size={11} />
              <span>{vehicle.images.length}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3 min-[390px]:p-3.5 sm:p-4">
          <div className="mb-2.5 flex flex-col gap-1.5 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between min-[360px]:gap-2.5 sm:mb-3 sm:min-h-[3.75rem] sm:gap-3">
            <div className="min-w-0">
              <h3
                className="line-clamp-2 text-[13px] font-bold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--accent-dark)] min-[390px]:text-sm"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {vehicle.title}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)] min-[390px]:text-xs">
                {vehicle.generation || vehicle.model}
              </p>
            </div>
            <div className="shrink-0 text-left min-[360px]:text-right">
              <div
                className="whitespace-nowrap text-[15px] font-black leading-tight text-[var(--accent-dark)] min-[390px]:text-base"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPrice(vehicle.price, vehicle.currency)}
              </div>
              {vatText && <div className="text-[11px] text-[var(--color-text-muted)]">{vatText}</div>}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <Spec icon={<Calendar size={11} />} value={`${vehicle.year}. ${t.vehicle.yearShort}`} />
            <Spec icon={<Gauge size={11} />} value={formatMileage(vehicle.mileage)} />
            <Spec icon={<Fuel size={11} />} value={t.fuel[vehicle.fuelType]} />
            <Spec icon={<Settings2 size={11} />} value={t.transmission[vehicle.transmission]} />
          </div>

          <TrustBadges locale={locale} badges={trustBadges} compact className="mt-3 sm:mt-4" />

          <div className="mt-3 mb-4 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:mb-5">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black text-[var(--accent-dark)] sm:py-1">
              <Building2 size={11} />
              {cardCopy.partnerDealer}
            </span>
            {vehicle.dealer?.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 sm:py-1">
                <ShieldCheck size={11} />
                {cardCopy.verified}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 sm:pt-4">
            <div className="flex min-w-0 items-center gap-1 text-[11px] text-[var(--color-text-muted)] min-[390px]:text-xs">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{vehicle.dealer?.location || cardCopy.defaultLocation}</span>
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {cardCopy.view}
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
    <div className="flex min-h-7 items-center gap-1.5 rounded-lg bg-[var(--color-surface-2)] px-2 text-[10px] text-[var(--color-text-2)] min-[390px]:min-h-8 min-[390px]:px-2.5 min-[390px]:text-[11px] sm:text-xs">
      <span className="shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
