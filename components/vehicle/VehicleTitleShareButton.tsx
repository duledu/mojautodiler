'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.com').replace(/\/$/, '');

interface Props {
  readonly vehicleSlug: string;
  readonly vehicleTitle: string;
  readonly locale: Locale;
}

export default function VehicleTitleShareButton({ vehicleSlug, vehicleTitle, locale }: Props) {
  const [copied, setCopied] = useState(false);

  const vehicleUrl = `${SITE}/${locale}/vehicle/${vehicleSlug}`;
  const copy = locale === 'sq'
    ? {
        shareText: `Shiko këtë automjet në MojAutoDiler:\n${vehicleTitle}`,
        ariaLabel: 'Shpërndaje shpalljen',
        copied: 'U kopjua',
        share: 'Shpërndaje',
      }
    : {
        shareText: `Pogledaj ovaj automobil na MojAutoDiler:\n${vehicleTitle}`,
        ariaLabel: 'Podeli oglas',
        copied: 'Kopirano',
        share: 'Podeli',
      };

  const handleShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: vehicleTitle,
          text: copy.shareText,
          url: vehicleUrl,
        });
        return;
      } catch { /* user cancelled or unsupported */ }
    }
    try { await navigator.clipboard.writeText(vehicleUrl); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copy.ariaLabel}
      className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) px-2.5 py-1.5 text-xs font-semibold text-(--color-text-muted) transition hover:border-(--accent-border) hover:text-(--color-text) sm:mt-2"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Share2 size={12} />}
      {copied ? copy.copied : copy.share}
    </button>
  );
}
