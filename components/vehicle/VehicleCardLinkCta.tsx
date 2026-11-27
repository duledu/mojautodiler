'use client';

import { useLinkStatus } from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

interface VehicleCardLinkCtaProps {
  readonly label: string;
  readonly pendingLabel?: string;
}

export default function VehicleCardLinkCta({
  label,
  pendingLabel = 'Otvaram…',
}: VehicleCardLinkCtaProps) {
  const { pending } = useLinkStatus();

  return (
    <span
      data-link-pending={pending ? 'true' : undefined}
      aria-live="polite"
      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-dark)]"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {pending ? (
        <>
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </>
      )}
    </span>
  );
}
