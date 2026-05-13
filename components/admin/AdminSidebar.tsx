'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, MessageSquare, Settings, ExternalLink, ShieldCheck } from 'lucide-react';
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
    <aside className="w-16 lg:w-60 bg-white border-r border-(--color-border) flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 lg:p-5 border-b border-(--color-border)">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--color-gold) flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(201,168,76,0.25)]">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <div
              className="text-sm font-bold text-(--color-text) leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AutoElite
            </div>
            <div className="text-[10px] text-(--color-gold-dark) mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 lg:p-3 space-y-0.5">
        {links.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all admin-sidebar-link',
                isActive
                  ? 'active bg-(--color-gold-bg) text-(--color-gold-dark) border-l-2 border-l-(--color-gold)'
                  : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-2)'
              )}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Icon size={17} className="shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 lg:p-3 border-t border-(--color-border)">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-2) transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ExternalLink size={15} className="shrink-0" />
          <span className="hidden lg:block">Pogledaj sajt</span>
        </Link>
      </div>
    </aside>
  );
}
