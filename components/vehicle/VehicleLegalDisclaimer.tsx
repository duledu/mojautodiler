import { ArrowRight, Info } from 'lucide-react';
import { VEHICLE_DETAIL_DISCLAIMER } from '@/lib/legal/responsibility-disclaimer';

export default function VehicleLegalDisclaimer() {
  return (
    <section
      aria-labelledby="vehicle-legal-disclaimer-heading"
      data-testid="vehicle-legal-disclaimer"
      className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] min-[390px]:p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-dark)]">
          <Info size={14} aria-hidden="true" />
        </span>
        <h2
          id="vehicle-legal-disclaimer-heading"
          className="text-sm font-black text-[var(--color-text)] sm:text-base"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {VEHICLE_DETAIL_DISCLAIMER.heading}
        </h2>
      </div>

      <div className="mt-3 space-y-2.5 text-xs leading-6 text-[var(--color-text-muted)] sm:text-[13px]">
        {VEHICLE_DETAIL_DISCLAIMER.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]/70">
        <a
          href={VEHICLE_DETAIL_DISCLAIMER.linkHref}
          data-testid="vehicle-legal-disclaimer-link"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-dark)] transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] sm:text-[13px]"
        >
          {VEHICLE_DETAIL_DISCLAIMER.linkLabel}
          <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
