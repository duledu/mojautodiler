import Reveal from '@/components/ui/Reveal';
import CarVerticalPromoBanner from '@/components/affiliate/CarVerticalPromoBanner';
import type { Locale } from '@/lib/i18n';
import {
  CARVERTICAL_ASSETS,
  getCarVerticalHomepageUrl,
} from '@/lib/affiliate/carvertical';

interface CarVerticalHomepageSectionProps {
  readonly locale: Locale;
}

const sectionCopy = {
  sr: {
    srOnlyHeading: 'Proveri istoriju vozila uz carVertical — 20% popusta',
    bannerAlt:
      'carVertical — Proverite kilometražu i izbegnite iznenađenja! Proverite odmah.',
    discountBadge: '20% POPUSTA',
    supportingText:
      'Popust se automatski primenjuje putem našeg partnerskog linka.',
    cta: 'Proveri istoriju vozila',
  },
  sq: {
    srOnlyHeading: 'Proveri istoriju vozila uz carVertical — 20% popusta',
    bannerAlt:
      'carVertical — Proverite kilometražu i izbegnite iznenađenja! Proverite odmah.',
    discountBadge: '20% POPUSTA',
    supportingText:
      'Popust se automatski primenjuje putem našeg partnerskog linka.',
    cta: 'Proveri istoriju vozila',
  },
} as const;

export default function CarVerticalHomepageSection({
  locale,
}: CarVerticalHomepageSectionProps) {
  const copy = sectionCopy[locale] ?? sectionCopy.sr;

  return (
    <section
      aria-labelledby="carvertical-home-heading"
      data-testid="carvertical-homepage-section"
      className="bg-white pt-6 pb-2 min-[390px]:pt-7 sm:pt-10 sm:pb-4"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="carvertical-home-heading" className="sr-only">
          {copy.srOnlyHeading}
        </h2>

        <Reveal>
          <CarVerticalPromoBanner
            variant="hero"
            href={getCarVerticalHomepageUrl()}
            imageSrc={CARVERTICAL_ASSETS.homepageBannerRs}
            imageAlt={copy.bannerAlt}
            imageBackground="#B5DCFF"
            discountBadge={copy.discountBadge}
            supportingText={copy.supportingText}
            cta={copy.cta}
            ariaLabel={`${copy.cta} — ${copy.discountBadge}. ${copy.supportingText}`}
            testId="carvertical-homepage-cta"
            priority
          />
        </Reveal>
      </div>
    </section>
  );
}
