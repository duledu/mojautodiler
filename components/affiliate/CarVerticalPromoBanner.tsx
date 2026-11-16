import Image from 'next/image';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import {
  CARVERTICAL_AFFILIATE_REL,
  CARVERTICAL_AFFILIATE_TARGET,
} from '@/lib/affiliate/carvertical';

/**
 * Shared carVertical promotional banner layout used by both the homepage hero
 * placement and the footer placement, so both look and behave identically:
 *
 *   ┌─────────────────────────────────────────────┐
 *   │  Official carVertical banner (728:180)      │  ← uncropped, unmodified
 *   ├─────────────────────────────────────────────┤
 *   │  [footer only] eyebrow · heading · text     │
 *   │  [20% POPUSTA] supporting text      [CTA →] │
 *   └─────────────────────────────────────────────┘
 *
 * The whole card is ONE semantic <a> — no nested anchors or buttons.
 */
export interface CarVerticalPromoBannerProps {
  readonly variant: 'hero' | 'footer';
  readonly href: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  /** Background matching the banner artwork, shown only while the image loads. */
  readonly imageBackground: string;
  readonly discountBadge: string;
  readonly supportingText: string;
  readonly cta: string;
  readonly ariaLabel: string;
  readonly testId: string;
  readonly priority?: boolean;
  /** Footer-only additional content. */
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly description?: string;
}

export default function CarVerticalPromoBanner({
  variant,
  href,
  imageSrc,
  imageAlt,
  imageBackground,
  discountBadge,
  supportingText,
  cta,
  ariaLabel,
  testId,
  priority = false,
  eyebrow,
  heading,
  description,
}: CarVerticalPromoBannerProps) {
  const showDetails = variant === 'footer' && Boolean(heading);

  return (
    <a
      href={href}
      target={CARVERTICAL_AFFILIATE_TARGET}
      rel={CARVERTICAL_AFFILIATE_REL}
      data-testid={testId}
      data-variant={variant}
      aria-label={ariaLabel}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_14px_40px_rgba(15,15,20,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[0_20px_50px_rgba(15,15,20,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:rounded-3xl"
    >
      {/* Official carVertical banner — exact 728:180 aspect ratio, never cropped or overlaid */}
      <div className="w-full overflow-hidden" style={{ backgroundColor: imageBackground }}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={2184}
          height={540}
          priority={priority}
          sizes="(min-width: 1280px) 1232px, (min-width: 640px) 94vw, 92vw"
          className="block aspect-[728/180] h-auto w-full object-contain"
        />
      </div>

      {/* Information bar — always outside the banner artwork */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 min-[390px]:px-4 sm:px-6 sm:py-3.5">
        {showDetails && (
          <div className="mb-3 border-b border-[var(--color-border)] pb-3 sm:mb-3.5 sm:pb-3.5">
            {eyebrow && (
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-dark)] sm:text-[11px]">
                {eyebrow}
              </span>
            )}
            <h2
              className="text-base font-black leading-snug text-[var(--color-text)] min-[390px]:text-lg sm:text-xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading}
            </h2>
            {description && (
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)] sm:text-sm sm:leading-6">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--accent-dark)] sm:px-3 sm:text-[11px]">
                <ShieldCheck size={13} className="shrink-0 text-[var(--accent)]" />
                {discountBadge}
              </span>
              <span className="text-xs font-bold leading-5 text-[var(--color-text)] sm:text-sm">
                20% popusta sa kodom <strong className="font-mono text-[var(--accent-dark)]">MOJAUTODILER</strong>
              </span>
            </div>
            {supportingText && (
              <span className="text-[11px] font-medium leading-4 text-[var(--color-text-muted)] sm:text-xs">
                {supportingText}
              </span>
            )}
          </div>

          <span
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-text)] px-4 py-2 text-xs font-bold text-white transition group-hover:bg-[var(--accent-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>{cta}</span>
            <ArrowUpRight size={14} className="shrink-0" />
          </span>
        </div>
      </div>
    </a>
  );
}
