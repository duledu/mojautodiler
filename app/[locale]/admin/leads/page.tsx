import { mockLeads } from '@/data/leads';
import AdminLeadsClient from '@/components/admin/AdminLeadsClient';

export default function AdminLeadsPage() {
  return <AdminLeadsClient leads={mockLeads} />;
}
