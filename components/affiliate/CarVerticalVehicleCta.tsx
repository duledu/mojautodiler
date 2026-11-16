import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import type { VehicleStatus } from '@/types/vehicle';
import {
  CARVERTICAL_AFFILIATE_REL,
  CARVERTICAL_AFFILIATE_TARGET,
  CARVERTICAL_ASSETS,
  getCarVerticalListingUrl,
} from '@/lib/affiliate/carvertical';

interface CarVerticalVehicleCtaProps {
  readonly vin?: string | null;
  readonly carVerticalVinMode?: 'WITH_VIN' | 'NO_VIN' | null;
  readonly status?: VehicleStatus | null;
  readonly locale?: Locale;
}

const listingCopy = {
  sr: {
    eyebrow: 'ISTORIJA VOZILA',
    heading: 'Proveri istoriju ovog vozila',
    description:
      'Saznaj više o dostupnoj istoriji automobila uz carVertical.',
    discount: '20% popusta sa kodom MOJAUTODILER',
    supportingText:
      'Popust se automatski primenjuje putem našeg partnerskog linka.',
    cta: 'Proveri istoriju vozila',
  },
  sq: {
    eyebrow: 'ISTORIJA VOZILA',
    heading: 'Proveri istoriju ovog vozila',
    description:
      'Saznaj više o dostupnoj istoriji automobila uz carVertical.',
    discount: '20% popusta sa kodom MOJAUTODILER',
    supportingText:
      'Popust se automatski primenjuje putem našeg partnerskog linka.',
    cta: 'Proveri istoriju vozila',
  },
} as const;

export default function CarVerticalVehicleCta({
  vin,
  carVerticalVinMode,
  status,
  locale = 'sr',
}: CarVerticalVehicleCtaProps) {
  const copy = listingCopy[locale] ?? listingCopy.sr;
  const { url, hasValidVin } = getCarVerticalListingUrl(vin, { status, carVerticalVinMode });

  return (
    <section
      aria-labelledby="carvertical-listing-heading"
      data-testid="carvertical-vehicle-cta"
      data-vin-mode={hasValidVin ? 'vin' : 'no-vin'}
      className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm"
    >
      <a
        href={url}
        target={CARVERTICAL_AFFILIATE_TARGET}
        rel={CARVERTICAL_AFFILIATE_REL}
        data-testid="carvertical-vehicle-cta-link"
        aria-label={`${copy.heading} — ${copy.discount}. ${copy.supportingText}`}
        className="group block p-4 transition duration-300 hover:bg-[var(--color-surface)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset min-[390px]:p-5 sm:p-6"
      >
        {/* Top bar: Eyebrow + official full carVertical logo */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 sm:mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-dark)] sm:text-[11px]">
            <ShieldCheck size={13} className="shrink-0 text-[var(--accent)]" />
            {copy.eyebrow}
          </span>

          {/* Official full carVertical Primary logo */}
          <span className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/70 px-2.5 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CARVERTICAL_ASSETS.logoPrimary}
              alt="carVertical"
              width={112}
              height={16}
              decoding="async"
              className="h-[14px] w-auto object-contain sm:h-[16px]"
            />
          </span>
        </div>

        {/* Main content & CTA row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <h2
              id="carvertical-listing-heading"
              className="text-lg font-black leading-snug text-[var(--color-text)] min-[390px]:text-xl sm:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {copy.heading}
            </h2>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--color-text-muted)] min-[390px]:text-sm min-[390px]:leading-6">
              {copy.description}
            </p>

            {/* Automatic 20% discount strip */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/70 px-3 py-2 sm:mt-4 sm:inline-flex sm:px-3.5">
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--accent-dark)] shadow-2xs sm:text-[11px]">
                {copy.discount}
              </span>
              <span className="text-xs font-medium leading-5 text-[var(--color-text-2)]">
                {copy.supportingText}
              </span>
            </div>
          </div>

          <span
            className="btn-dark touch-target inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition group-hover:bg-[var(--accent-dark)] sm:w-auto sm:px-6 sm:text-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>{copy.cta}</span>
            <ArrowUpRight size={15} className="shrink-0" />
          </span>
        </div>
      </a>
    </section>
  );
}
