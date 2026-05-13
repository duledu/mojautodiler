'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Bell, ExternalLink } from 'lucide-react';
import { mockLeads } from '@/data/leads';

const breadcrumbMap: Record<string, string> = {
  admin: 'Dashboard',
  vehicles: 'Vozila',
  leads: 'Upiti',
  settings: 'Podešavanja',
  new: 'Novo vozilo',
  edit: 'Uredi vozilo',
};

export default function AdminTopBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  // segments: ['sr', 'admin', 'vehicles', ...]
  const locale = segments[0] || 'sr';
  const adminSegments = segments.slice(2); // after locale and 'admin'

  const newLeads = mockLeads.filter(l => l.status === 'new').length;

  // Build breadcrumb
  const crumbs = [
    { label: 'Admin', href: `/${locale}/admin` },
    ...adminSegments.map((seg, i) => ({
      label: breadcrumbMap[seg] || seg,
      href: `/${locale}/admin/${adminSegments.slice(0, i + 1).join('/')}`,
    })),
  ];

  return (
    <header className="h-14 bg-[var(--color-carbon)] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
            {i === crumbs.length - 1 ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Leads notification */}
        {newLeads > 0 && (
          <Link
            href={`/${locale}/admin/leads`}
            className="relative flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="font-medium">{newLeads} {newLeads === 1 ? 'novi upit' : 'nova upita'}</span>
          </Link>
        )}

        {/* View site */}
        <Link
          href={`/${locale}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Pogledaj sajt</span>
        </Link>
      </div>
    </header>
  );
}
