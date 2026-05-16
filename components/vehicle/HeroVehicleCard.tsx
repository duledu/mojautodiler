import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Calendar, Camera, Fuel, Gauge, MapPin, Settings2, ShieldCheck, Star } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { Locale, TranslationKeys } from '@/lib/i18n';
import { formatMileage, formatPrice, formatVatMode } from '@/lib/utils';
import PremiumVehiclePlaceholder from '@/components/vehicle/PremiumVehiclePlaceholder';
import { getVehicleTrustBadges, TrustBadges } from '@/components/vehicle/TrustBadges';
import VehicleStatusBadge from '@/components/vehicle/VehicleStatusBadge';

interface HeroVehicleCardProps {
  readonly vehicle: Vehicle;
  readonly locale: Locale;
  readonly t: TranslationKeys;
  readonly featuredLabel: string;
  readonly verifiedLine: string;
  readonly viewLabel: string;
}

export default function HeroVehicleCard({
  vehicle, locale, t, featuredLabel, verifiedLine, viewLabel,
}: HeroVehicleCardProps) {
  const mainImage = vehicle.images[0]?.url || '';
  const trustBadges = getVehicleTrustBadges(vehicle).slice(0, 4);
  const vatText = formatVatMode(vehicle.vatMode);

  return (
    <Link href={`/${locale}/vehicle/${vehicle.slug}`} className="group block">
      <article className="hero-vehicle-card overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_16px_56px_rgba(15,15,20,0.12)] min-[390px]:rounded-3xl sm:rounded-[34px]">

        {/* Image */}
        <div className="relative w-full aspect-[3/2] overflow-hidden bg-[var(--color-surface-2)]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={vehicle.title}
              width={1200}
              height={800}
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="hero-card-image absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <PremiumVehiclePlaceholder className="hero-card-image" />
          )}
          {/* Gradient for price readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          {/* Featured badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(201,168,76,0.45)] min-[390px]:left-4 min-[390px]:top-4 min-[390px]:px-3.5 min-[390px]:text-[11px]">
            <Star size={10} fill="currentColor" />
            {featuredLabel}
          </div>
          <VehicleStatusBadge vehicle={vehicle} compact className="absolute right-3 top-3 min-[390px]:right-4 min-[390px]:top-4" />

          {/* Photo count */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
              <Camera size={11} />
              <span>{vehicle.images.length}</span>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-4 min-[390px]:bottom-4 min-[390px]:left-5">
            <div
                className="text-xl font-black leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] min-[390px]:text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            {vatText && <p className="mt-0.5 text-xs font-medium text-white/75">{vatText}</p>}
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 min-[390px]:p-5 sm:p-6">

          {/* Title + generation */}
          <div>
            <h2
              className="text-lg font-black leading-snug text-[var(--color-text)] transition-colors duration-300 group-hover:text-[var(--accent-dark)] min-[390px]:text-xl sm:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {vehicle.title}
            </h2>
            {vehicle.generation && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{vehicle.generation}</p>
            )}
          </div>

          {/* Specs grid — 2×2 on mobile, 4 cols on sm+ */}
          <div className="mt-4 grid grid-cols-2 gap-1.5 min-[390px]:gap-2 sm:grid-cols-4">
            <SpecChip icon={<Calendar size={12} />} value={`${vehicle.year}.`} />
            <SpecChip icon={<Gauge size={12} />} value={formatMileage(vehicle.mileage)} />
            <SpecChip icon={<Fuel size={12} />} value={t.fuel[vehicle.fuelType]} />
            <SpecChip icon={<Settings2 size={12} />} value={t.transmission[vehicle.transmission]} />
          </div>

          <TrustBadges locale={locale} badges={trustBadges.slice(0, 3)} compact className="mt-4 min-[390px]:hidden" />
          <TrustBadges locale={locale} badges={trustBadges} compact className="mt-4 hidden min-[390px]:flex" />

          <div className="mt-6 mb-6 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--accent-dark)] min-[390px]:text-[11px]">
              <Building2 size={11} />
              {locale === 'sq' ? 'Auto diler partner' : 'Partnerski auto diler'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-muted)] min-[390px]:text-[11px]">
              <MapPin size={11} />
              {vehicle.dealer?.location || 'Srbija'}
            </span>
          </div>

          {/* Footer — verified line + CTA */}
          <div className="mt-0 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between min-[390px]:gap-4">
            <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <ShieldCheck size={14} className="shrink-0 text-[var(--accent)]" />
              <span className="line-clamp-2 leading-snug min-[390px]:truncate">{verifiedLine}</span>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-black text-[var(--accent-dark)] transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {viewLabel}
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SpecChip({ icon, value }: { readonly icon: React.ReactNode; readonly value: string }) {
  return (
    <div className="flex min-h-9 items-center gap-1.5 rounded-xl bg-[var(--color-surface-2)] px-2.5 py-2 text-xs text-[var(--color-text-2)]">
      <span className="shrink-0 text-[var(--accent)]">{icon}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
