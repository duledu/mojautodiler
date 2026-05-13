import { getAllLeads } from '@/lib/db/leads';
import { mockLeads } from '@/data/leads';
import AdminLeadsClient from '@/components/admin/AdminLeadsClient';

export default async function AdminLeadsPage() {
  const leads = await getAllLeads();
  const data = leads.length > 0 ? leads : mockLeads;
  return <AdminLeadsClient leads={data} />;
}
