import { getAllLeads } from '@/lib/db/leads';
import AdminLeadsClient from '@/components/admin/AdminLeadsClient';

export default async function AdminLeadsPage() {
  const leads = await getAllLeads();
  return <AdminLeadsClient leads={leads} />;
}
