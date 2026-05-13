import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { getDealerInfo } from '@/data/vehicles';

export default function AdminSettingsPage() {
  const dealer = getDealerInfo();
  return <AdminSettingsClient dealer={dealer} />;
}
