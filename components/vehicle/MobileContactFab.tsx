'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { InstagramIcon, ViberIcon } from '@/components/ui/SocialIcons';
import { cn } from '@/lib/utils';

// Minimal inline WhatsApp icon — avoids adding a new icon dependency.
function WhatsAppIcon({ size = 20 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface MobileContactFabProps {
  readonly phone: string;
  readonly viber?: string;
  readonly instagram?: string;
  readonly onPhoneClick?: (firedAt: number) => void;
  readonly onViberClick?: (firedAt: number) => void;
  readonly onWhatsAppClick?: (firedAt: number) => void;
}

export default function MobileContactFab({ phone, viber, instagram, onPhoneClick, onViberClick, onWhatsAppClick }: MobileContactFabProps) {
  const [open, setOpen] = useState(false);
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanViber  = viber ? viber.replace(/\D/g, '') : '';

  return (
    <div className="fixed bottom-[5.65rem] right-3 z-40 min-[390px]:right-4 lg:hidden">
      <div className={cn('mb-2 grid gap-2 transition-all duration-300', open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0')}>
        {/* WhatsApp */}
        {phone && (
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              event.stopPropagation();
              onWhatsAppClick?.(event.timeStamp);
            }}
            className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.32)] min-[390px]:h-12 min-[390px]:w-12"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon size={20} />
          </a>
        )}
        {viber && (
          <a href={`viber://chat?number=%2B${cleanViber}`} onClick={(event) => { event.stopPropagation(); onViberClick?.(event.timeStamp); }} className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7360F2] text-white shadow-[0_12px_28px_rgba(115,96,242,0.28)] min-[390px]:h-12 min-[390px]:w-12" aria-label="Viber">
            <ViberIcon size={20} />
          </a>
        )}
        <a href={`tel:${phone}`} onClick={(event) => { event.stopPropagation(); onPhoneClick?.(event.timeStamp); }} className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl bg-(--color-text) text-white shadow-[0_12px_28px_rgba(15,15,20,0.2)] min-[390px]:h-12 min-[390px]:w-12" aria-label="Pozovi">
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
