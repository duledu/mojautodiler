import { getDealerSettings } from '@/lib/db/settings';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export default async function AdminSettingsPage() {
  const dealer = await getDealerSettings();
  return <AdminSettingsClient dealer={dealer} />;
}
