'use client';

import { usePathname } from 'next/navigation';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const pathname = usePathname();
  const { isInstallable, isStandalone, promptInstall, dismiss } = usePwaInstall();

  // Never render when already installed / running as PWA
  if (isStandalone) return null;

  // Never render on admin pages
  if (pathname.includes('/admin')) return null;

  // Only render when Chrome has confirmed the site is installable
  if (!isInstallable) return null;

  return (
    <div
      role="banner"
      aria-label="Instaliraj aplikaciju"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 shadow-lg
                 bg-[#0A0A0B] border-t border-[rgba(201,168,76,0.22)]
                 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-xl"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={40} height={40} />
      </div>

      {/* Copy */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">Moj Auto Diler</p>
        <p className="text-xs text-[#9A9AAC] leading-tight mt-0.5">Dodaj na početni ekran</p>
      </div>

      {/* Install button */}
      <button
        onClick={promptInstall}
        className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-[#C9A84C] text-[#0A0A0B] hover:bg-[#E8C97A] transition-colors"
        aria-label="Instaliraj"
      >
        <Download size={13} aria-hidden />
        Instaliraj
      </button>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="flex-shrink-0 p-1 rounded text-[#6B6B7C] hover:text-white transition-colors"
        aria-label="Zatvori"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
