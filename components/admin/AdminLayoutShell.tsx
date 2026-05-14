'use client';

import { usePathname } from 'next/navigation';
import AdminMobileNav from './AdminMobileNav';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export default function AdminLayoutShell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page: render children without any admin chrome
  if (pathname.endsWith('/admin/login')) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F3F1EC]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
