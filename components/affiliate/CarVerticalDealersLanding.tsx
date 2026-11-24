import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import {
  CARVERTICAL_AFFILIATE_REL,
  CARVERTICAL_AFFILIATE_TARGET,
  CARVERTICAL_ASSETS,
  getCarVerticalDealersUrl,
} from '@/lib/affiliate/carvertical';

interface CarVerticalDealersLandingProps {
  readonly locale: Locale;
}

export default function CarVerticalDealersLanding({
  locale,
}: CarVerticalDealersLandingProps) {
  const dealersUrl = getCarVerticalDealersUrl();
  const homeHref = `/${locale}`;

  return (
    <div
      data-testid="carvertical-dealers-landing"
      className="min-h-screen bg-[#F7F7F9] text-[#0F0F14]"
    >
      {/* ── Co-Branded Standalone Header (MojAutoDiler + carVertical + Back CTA) ── */}
      <header className="border-b border-[#E2E2EA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.10)] sm:h-9 sm:w-9 sm:rounded-xl">
                <Image
                  src="/brand-logo.png"
                  alt="Moj Auto Diler"
                  width={36}
                  height={36}
                  sizes="36px"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div
                  className="truncate text-xs font-bold leading-none text-[#0F0F14] sm:text-[15px]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Moj Auto Diler
                </div>
                <Image
                  src={CARVERTICAL_ASSETS.logoPrimary}
                  alt="carVertical"
                  width={96}
                  height={15}
                  unoptimized
                  className="mt-1 block h-2.5 w-auto object-contain sm:hidden"
                />
                <div className="mt-1 hidden text-[9px] uppercase leading-none tracking-[0.16em] text-[#9A7A2E] md:block">
                  Premium Auto Market
                </div>
              </div>
            </div>

            <span className="hidden h-5 w-px shrink-0 bg-[#D8D8E2] sm:block" aria-hidden="true" />

            <Image
              src={CARVERTICAL_ASSETS.logoPrimary}
              alt="carVertical"
              width={112}
              height={18}
              unoptimized
              className="hidden h-4 w-auto shrink-0 object-contain sm:block"
            />
          </div>

          <Link
            href={homeHref}
            data-testid="carvertical-dealers-back-home"
            className="btn-outline touch-target inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[11px] sm:min-h-[44px] sm:gap-2 sm:px-4 sm:text-xs md:text-sm"
          >
            <ArrowLeft size={14} className="shrink-0" />
            <span>Nazad na početnu</span>
          </Link>
        </div>
      </header>

      <main>
        {/* ── Unified Hero Stage ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="dealers-hero-heading"
          className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8 lg:px-8 lg:pt-8 lg:pb-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[24px] border border-[#E2E2EA] bg-white shadow-[0_20px_60px_rgba(15,15,20,0.07)] sm:rounded-[30px]">
              <div className="grid grid-cols-1 items-stretch md:grid-cols-12">
                {/* Left Column: Persuasive Dealer Headline, Lead, CTA & 20% Offer */}
                <div className="flex flex-col justify-between p-5 sm:p-8 md:col-span-6 md:p-7 lg:col-span-7 lg:p-10 xl:p-12">
                  <div>
                    <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
                      <span className="h-[2.5px] w-7 rounded-xs bg-[#C9A84C]" aria-hidden="true" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7A2E] sm:text-[11px]">
                        Za prodavce i auto-dilere
                      </span>
                    </div>

                    <h1
                      id="dealers-hero-heading"
                      className="text-[1.7rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#0F0F14] min-[390px]:text-[1.9rem] sm:text-[2.35rem] md:text-[2rem] lg:text-[2.55rem] xl:text-[3.05rem]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Pokažite istoriju vozila.{' '}
                      <span className="block sm:inline">Steknite poverenje kupca.</span>
                    </h1>

                    <p className="mt-3.5 max-w-2xl text-[15px] leading-[1.62] text-[#3A3A4A] sm:mt-4 sm:text-base md:text-[15px] lg:mt-5 lg:text-[17px] lg:leading-[1.68]">
                      Danas svaki kupac koji ima VIN može da naruči carVertical izveštaj. Pošaljite mu ga pre nego što ga zatraži. Time pokazujete da otvoreno govorite o istoriji vozila i da ste spremni da odgovorite na pitanja o kilometraži, prethodnim oštećenjima i drugim dostupnim podacima.
                    </p>
                  </div>

                  {/* Primary CTA + Highlighted 20% Offer Next to Button */}
                  <div className="mt-6 border-t border-[#ECECF2] pt-5 sm:mt-8 sm:pt-6 md:mt-6 md:pt-5 lg:mt-8 lg:pt-6">
                    <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:gap-5">
                      <a
                        href={dealersUrl}
                        target={CARVERTICAL_AFFILIATE_TARGET}
                        rel={CARVERTICAL_AFFILIATE_REL}
                        data-testid="carvertical-dealers-primary-cta"
                        className="btn-dark touch-target inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[15px] font-bold text-white hover:bg-[#9A7A2E] sm:w-auto sm:min-w-[264px] sm:px-7"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <span>Pripremite izveštaj za kupca</span>
                        <ArrowUpRight size={18} strokeWidth={2.3} className="shrink-0" />
                      </a>

                      <div className="flex items-start gap-3 sm:items-center">
                        <span
                          className="inline-flex shrink-0 items-center rounded-lg bg-[#C9A84C] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-white shadow-xs"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          20% popusta
                        </span>
                        <p className="text-xs font-medium leading-5 text-[#3A3A4A]">
                          Popust se automatski primenjuje putem našeg partnerskog linka.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Full-Area Clickable #AADCFF Link Hosting RS_300x250-4.png */}
                <a
                  href={dealersUrl}
                  target={CARVERTICAL_AFFILIATE_TARGET}
                  rel={CARVERTICAL_AFFILIATE_REL}
                  data-testid="carvertical-dealers-hero-image-link"
                  aria-label="Pripremite izveštaj za kupca uz 20% popusta"
                  className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden border-t border-[#E2E2EA] bg-[#AADCFF] p-3 transition-colors duration-200 hover:bg-[#9ED5FF] sm:p-5 md:col-span-6 md:border-t-0 md:border-l lg:col-span-5 lg:p-6"
                >
                  <Image
                    src={CARVERTICAL_ASSETS.dealersBannerRs}
                    alt="carVertical: Proverite kilometražu i izbegnite iznenađenja"
                    width={900}
                    height={750}
                    priority
                    sizes="(min-width: 1280px) 480px, (min-width: 768px) 44vw, 92vw"
                    className="pointer-events-none block aspect-[300/250] h-auto max-h-[400px] w-full object-contain transition-transform duration-300 ease-[var(--ease-luxury)] group-hover:-translate-y-0.5 group-hover:scale-[1.02]"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Message + Single-Line Instruction + Official Banner ──────── */}
        <section
          aria-labelledby="dealers-trust-heading"
          className="pb-12 sm:pb-16 lg:pb-20"
        >
          <div className="mx-auto max-w-7xl space-y-6 px-4 sm:space-y-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[24px] border border-[#E2E2EA] bg-white shadow-[0_8px_32px_rgba(15,15,20,0.04)] sm:rounded-[28px]">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="h-[2.5px] w-7 rounded-xs bg-[#C9A84C]" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7A2E] sm:text-[11px]">
                    Dostupni podaci o istoriji vozila
                  </span>
                </div>

                <h2
                  id="dealers-trust-heading"
                  className="max-w-3xl text-xl font-extrabold leading-[1.14] tracking-[-0.02em] text-[#0F0F14] sm:text-2xl lg:text-[2rem]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Kupac sigurnije odlučuje kada zna šta kupuje
                </h2>

                <p className="mt-3.5 max-w-3xl text-[15px] leading-[1.68] text-[#3A3A4A] sm:mt-4 sm:text-base lg:text-[17px] lg:leading-[1.72]">
                  Ako je zabeleženo ranije oštećenje, pokažite šta je popravljeno. Ako kupca zanima kilometraža, zajedno pogledajte zabeležena očitavanja. Kada vi prvi otvorite te teme, ostavljate manje prostora za sumnju i dajete kupcu konkretan razlog da vam veruje.
                </p>
              </div>

              {/* Single-Line Technical Instruction Placed After Main Trust Message */}
              <div className="flex items-center gap-3 border-t border-[#22201C] bg-[#0F0F14] px-6 py-4 text-white sm:px-8 lg:px-10">
                <CheckCircle2 size={17} className="shrink-0 text-[#C9A84C]" />
                <p className="text-xs font-medium leading-5 text-white/92 sm:text-sm">
                  Unesite VIN, preuzmite izveštaj i pošaljite ga kupcu pre razgledanja.
                </p>
              </div>
            </div>

            {/* Secondary Official Banner: Full-Area Clickable RS_728x90.png */}
            <a
              href={dealersUrl}
              target={CARVERTICAL_AFFILIATE_TARGET}
              rel={CARVERTICAL_AFFILIATE_REL}
              data-testid="carvertical-dealers-secondary-banner"
              aria-label="Pripremite carVertical izveštaj za kupca uz 20% popusta"
              className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#D4E9FC] bg-[#AADCFF] px-3 py-2 shadow-[0_8px_28px_rgba(15,15,20,0.05)] transition-all duration-200 hover:border-[#C9A84C] hover:bg-[#9ED5FF] sm:rounded-3xl sm:px-6 sm:py-3"
            >
              <Image
                src={CARVERTICAL_ASSETS.dealersLeaderboardRs}
                alt="carVertical: Proverite kilometražu i izbegnite iznenađenja"
                width={2184}
                height={270}
                sizes="(min-width: 1280px) 1180px, 94vw"
                className="pointer-events-none mx-auto block aspect-[728/90] h-auto w-full max-w-[980px] object-contain transition-transform duration-300 ease-[var(--ease-luxury)] group-hover:scale-[1.01]"
              />
            </a>

            <p className="pt-1 text-xs leading-5 text-[#6B6B7C]">
              Dostupni podaci o istoriji vozila zavise od konkretnog automobila, zemlje porekla i zvaničnih izvora. Zvanični baneri pripadaju platformi carVertical.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
