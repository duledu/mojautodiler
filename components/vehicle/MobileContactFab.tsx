'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import { cn } from '@/lib/utils';

interface MobileContactFabProps {
  readonly phone: string;
  readonly viber?: string;
  readonly instagram?: string;
  readonly onPhoneClick?: () => void;
  readonly onViberClick?: () => void;
}

export default function MobileContactFab({ phone, viber, instagram, onPhoneClick, onViberClick }: MobileContactFabProps) {
  const [open, setOpen] = useState(false);
  const cleanViber = viber ? viber.replace(/\D/g, '') : '';

  return (
    <div className="fixed bottom-[5.65rem] right-3 z-40 min-[390px]:right-4 lg:hidden">
      <div className={cn('mb-2 grid gap-2 transition-all duration-300', open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0')}>
        {viber && (
          <a href={`viber://chat?number=%2B${cleanViber}`} onClick={onViberClick} className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7360F2] text-white shadow-[0_12px_28px_rgba(115,96,242,0.28)] min-[390px]:h-12 min-[390px]:w-12" aria-label="Viber">
            <ViberIcon size={20} />
          </a>
        )}
        <a href={`tel:${phone}`} onClick={onPhoneClick} className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl bg-(--color-text) text-white shadow-[0_12px_28px_rgba(15,15,20,0.2)] min-[390px]:h-12 min-[390px]:w-12" aria-label="Pozovi">
          <Phone size={19} />
        </a>
        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E1306C]/20 bg-white text-[#E1306C] shadow-[0_12px_28px_rgba(15,15,20,0.12)] min-[390px]:h-12 min-[390px]:w-12" aria-label="Instagram">
            <InstagramIcon size={19} />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="touch-target flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[0_16px_36px_rgba(15,15,20,0.22)] transition hover:bg-[var(--accent-dark)] min-[390px]:h-14 min-[390px]:w-14"
        aria-label={open ? 'Zatvori brzi kontakt' : 'Otvori brzi kontakt'}
        aria-expanded={open}
      >
        {open ? <X size={21} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
