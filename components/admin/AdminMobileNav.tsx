'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Car, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminMobileNav() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';

  const links = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: `/${locale}/admin/vehicles`, icon: Car, label: 'Vozila' },
    { href: `/${locale}/admin/dealers`, icon: Building2, label: 'Partneri' },
    { href: `/${locale}/admin/leads`, icon: MessageSquare, label: 'Upiti' },
    { href: `/${locale}/admin/settings`, icon: Settings, label: 'Više' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#11100E] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {links.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                isActive ? 'text-[var(--accent)]' : 'text-white/45 hover:text-white/75'
              )}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
