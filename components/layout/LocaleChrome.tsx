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
  const isDealersLandingRoute =
    pathname === `/${locale}/carvertical-za-dilere` ||
    pathname.startsWith(`/${locale}/carvertical-za-dilere/`);

  if (isAdminRoute || isDealersLandingRoute) {
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
