'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, ExternalLink, LayoutDashboard, MessageSquare, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';

  const links = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: `/${locale}/admin/vehicles`, icon: Car, label: 'Vozila' },
    { href: `/${locale}/admin/leads`, icon: MessageSquare, label: 'Upiti' },
    { href: `/${locale}/admin/settings`, icon: Settings, label: 'Podešavanja' },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 border-r border-black/10 bg-[#11100E] p-4 text-white lg:flex lg:flex-col">
      <Link href={`/${locale}/admin`} className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="font-bold leading-none text-white" style={{ fontFamily: 'var(--font-display)' }}>AutoFerari</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/50">Preševo Admin</div>
        </div>
      </Link>

      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        Upravljanje
      </div>
      <nav className="flex-1 space-y-1.5">
        {links.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition',
                isActive
                  ? 'bg-white text-[#11100E] shadow-[0_14px_32px_rgba(0,0,0,0.22)]'
                  : 'text-white/68 hover:bg-white/[0.065] hover:text-white'
              )}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Icon size={18} className={cn('shrink-0', isActive ? 'text-[var(--accent)]' : 'text-white/48 group-hover:text-[var(--accent)]')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-white/62 transition hover:bg-white/[0.065] hover:text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ExternalLink size={17} className="text-white/42" />
          Pogledaj sajt
        </Link>
      </div>
    </aside>
  );
}
