import { CarFront, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PremiumVehiclePlaceholder({ className }: { readonly className?: string }) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-[var(--color-surface-2)]', className)}>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-x-8 top-1/3 h-px bg-gradient-to-r from-transparent via-[var(--accent-border)] to-transparent" />
        <div className="absolute inset-x-12 bottom-1/3 h-px bg-gradient-to-r from-transparent via-[var(--color-border-strong)] to-transparent" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.65rem] border border-[var(--accent-border)] bg-white text-[var(--accent)] shadow-sm">
          <CarFront size={30} />
          <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[var(--accent)] text-white shadow-sm">
            <ShieldCheck size={15} />
          </span>
        </div>
      </div>
    </div>
  );
}
