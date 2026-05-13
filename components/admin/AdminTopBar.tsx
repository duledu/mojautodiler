'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Car, ChevronRight, ExternalLink, Menu, MessageSquare, Settings, ShieldCheck } from 'lucide-react';
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
  const locale = segments[0] || 'sr';
  const adminSegments = segments.slice(2);
  const newLeads = mockLeads.filter((lead) => lead.status === 'new').length;

  const crumbs = [
    { label: 'Admin', href: `/${locale}/admin` },
    ...adminSegments.map((segment, index) => ({
      label: breadcrumbMap[segment] || segment,
      href: `/${locale}/admin/${adminSegments.slice(0, index + 1).join('/')}`,
    })),
  ];

  const mobileLinks = [
    { href: `/${locale}/admin`, label: 'Dashboard', icon: ShieldCheck },
    { href: `/${locale}/admin/vehicles`, label: 'Vozila', icon: Car },
    { href: `/${locale}/admin/leads`, label: 'Upiti', icon: MessageSquare },
    { href: `/${locale}/admin/settings`, label: 'Podešavanja', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-black/10 bg-white/92 px-4 py-3 backdrop-blur-md lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Breadcrumb">
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={14} className="text-[var(--color-text-placeholder)]" />}
                {index === crumbs.length - 1 ? (
                  <span className="font-bold text-[var(--color-text)]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-[var(--color-text-muted)] transition hover:text-[var(--accent-dark)]">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Menu size={18} className="text-[var(--color-text-muted)]" />
            <select
              aria-label="Admin navigacija"
              value={pathname}
              onChange={(event) => { window.location.href = event.target.value; }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text)]"
            >
              {mobileLinks.map(({ href, label }) => (
                <option key={href} value={href}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {newLeads > 0 && (
            <Link
              href={`/${locale}/admin/leads`}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
            >
              <Bell size={14} />
              <span className="hidden sm:inline">{newLeads} {newLeads === 1 ? 'novi upit' : 'nova upita'}</span>
              <span className="sm:hidden">{newLeads}</span>
            </Link>
          )}
          <Link
            href={`/${locale}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Pogledaj sajt</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
