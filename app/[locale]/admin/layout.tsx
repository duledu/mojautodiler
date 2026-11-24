import type { Metadata } from 'next';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
