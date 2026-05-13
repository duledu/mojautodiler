'use client';

import { usePathname } from 'next/navigation';

interface LocaleChromeProps {
  readonly children: React.ReactNode;
  readonly footer: React.ReactNode;
  readonly header: React.ReactNode;
  readonly locale: string;
}

export default function LocaleChrome({ children, footer, header, locale }: LocaleChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);

  if (isAdminRoute) {
    return (
      <div className={`theme-${locale} min-h-screen`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`theme-${locale} flex min-h-screen flex-col`}>
      {header}
      <main className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
