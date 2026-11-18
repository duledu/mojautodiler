import Image from 'next/image';
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
      'Saznaj više o dostupnim podacima o kilometraži, oštećenjima i istoriji vozila uz carVertical.',
    discount: '20% POPUSTA',
    discountCode: 'MOJAUTODILER',
    supportingText:
      'Popust se automatski primenjuje putem našeg partnerskog linka.',
    cta: 'Proveri istoriju vozila',
    disclaimer: 'Dostupnost podataka zavisi od vozila i izvora.',
  },
  sq: {
    eyebrow: 'HISTORIA E MJETIT',
    heading: 'Kontrollo historinë e këtij automjeti',
    description:
      'Mëso më shumë mbi të dhënat e disponueshme të kilometrazhit, dëmtimeve dhe historisë së automjetit me carVertical.',
    discount: '20% ZBRITJE',
    discountCode: 'MOJAUTODILER',
    supportingText:
      'Zbritja zbatohet automatikisht përmes linkut tonë partner.',
    cta: 'Kontrollo historinë e mjetit',
    disclaimer: 'Disponueshmëria e të dhënave varet nga automjeti dhe burimet.',
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
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_4px_24px_rgba(15,15,20,0.05)] transition-all duration-300 hover:border-[var(--accent-border)] hover:shadow-[0_12px_36px_rgba(15,15,20,0.09)] sm:rounded-3xl"
    >
      <a
        href={url}
        target={CARVERTICAL_AFFILIATE_TARGET}
        rel={CARVERTICAL_AFFILIATE_REL}
        data-testid="carvertical-vehicle-cta-link"
        aria-label={`${copy.heading} — ${copy.discount} (${copy.discountCode}). ${copy.supportingText}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      >
        <div className="flex flex-col md:flex-row md:items-stretch">
          {/* LEFT SIDE: Official carVertical banner RS_336x280-5 */}
          <div className="relative flex items-center justify-center overflow-hidden border-b border-[var(--color-border)] bg-[#aadcff] md:w-[38%] md:shrink-0 md:border-b-0 md:border-r lg:w-[36%] xl:w-[35%]">
            <div className="flex h-full w-full items-center justify-center p-3 sm:p-4 md:p-3 lg:p-4">
              <Image
                src={CARVERTICAL_ASSETS.listingBannerRs}
                alt="carVertical — Pravo stanje automobila bez skrivenih mana. Proverite odmah."
                width={1008}
                height={840}
                priority
                unoptimized
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 768px) 320px, 100vw"
                className="block aspect-[336/280] h-auto max-h-[240px] w-full max-w-[320px] object-contain transition-transform duration-300 group-hover:scale-[1.02] md:max-h-none md:max-w-none"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Information, Discount code, CTA and Disclaimer */}
          <div className="flex flex-1 flex-col justify-between p-4 min-[390px]:p-5 sm:p-6">
            <div>
              {/* Eyebrow badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-dark)] sm:text-[11px]">
                  <ShieldCheck size={13} className="shrink-0 text-[var(--accent)]" />
                  {copy.eyebrow}
                </span>
              </div>

              {/* Heading */}
              <h2
                id="carvertical-listing-heading"
                className="mt-2 text-base font-black leading-snug text-[var(--color-text)] min-[390px]:text-lg sm:text-xl lg:text-2xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {copy.heading}
              </h2>

              {/* Supporting text */}
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-muted)] min-[390px]:text-[13px] sm:text-sm">
                {copy.description}
              </p>

              {/* Promotional highlight & discount code */}
              <div className="mt-3.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/50 p-2.5 sm:mt-4 sm:p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs sm:text-[11px]">
                    {copy.discount}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-2)] sm:text-xs">
                    <span>kod:</span>
                    <code className="rounded border border-[var(--accent-border)] bg-white px-1.5 py-0.5 font-mono text-xs font-black tracking-wider text-[var(--accent-dark)] shadow-2xs sm:text-[13px]">
                      {copy.discountCode}
                    </code>
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--color-text-muted)] sm:text-xs">
                  {copy.supportingText}
                </p>
              </div>
            </div>

            {/* Primary CTA and Disclaimer */}
            <div className="mt-4 flex flex-col gap-2 pt-1 sm:mt-5">
              <span
                className="btn-dark touch-target inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 group-hover:bg-[var(--accent-dark)] sm:w-auto sm:self-start sm:px-6 sm:text-sm"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span>{copy.cta}</span>
                <ArrowUpRight
                  size={15}
                  className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>

              <p className="text-[10px] leading-normal text-[var(--color-text-muted)]/75 sm:text-[11px]">
                {copy.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}
