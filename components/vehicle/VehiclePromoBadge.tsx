import { Flame, Star, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslations, type Locale } from '@/lib/i18n';

export type PromoBadgeVariant = 'featured' | 'new' | 'akcija';

interface Props {
  readonly variant: PromoBadgeVariant;
  readonly locale?: Locale;
  readonly compact?: boolean;
  readonly label?: string;    // override auto-label
  readonly className?: string;
}

const ICONS: Record<PromoBadgeVariant, React.ElementType> = {
  featured: Star,
  new:      Flame,
  akcija:   Tag,
};

export function VehiclePromoBadge({ variant, locale = 'sr', compact = false, label, className }: Props) {
  const Icon = ICONS[variant];
  const badges = getTranslations(locale).badges;
  const text = label ?? (compact
    ? (variant === 'featured' ? badges.featuredShort : variant === 'new' ? badges.newShort : badges.akcija)
    : badges[variant]);

  const baseSize = compact
    ? 'px-2.5 py-1 text-[10px] gap-1'
    : 'px-2.5 py-1.5 text-[10px] gap-1.5 min-[390px]:px-3.5 min-[390px]:text-[11px]';

  if (variant === 'akcija') {
    return (
      <span
        className={cn(
          'badge-akcija inline-flex items-center rounded-full font-black uppercase tracking-[0.12em] text-white',
          baseSize,
          className,
        )}
        style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)' }}
      >
        <Icon size={compact ? 9 : 10} />
        {text}
      </span>
    );
  }

  if (variant === 'new') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] font-black uppercase tracking-[0.12em] text-[var(--accent-dark)]',
          baseSize,
          className,
        )}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Icon size={compact ? 9 : 10} />
        {text}
      </span>
    );
  }

  // featured
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[var(--accent)] font-black uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(201,168,76,0.45)]',
        baseSize,
        className,
      )}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <Icon size={compact ? 9 : 10} fill="currentColor" />
      {text}
    </span>
  );
}
