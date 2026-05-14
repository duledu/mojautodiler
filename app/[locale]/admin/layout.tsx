import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
