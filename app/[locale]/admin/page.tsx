import { mockVehicles } from '@/data/vehicles';
import { mockLeads } from '@/data/leads';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default function AdminDashboardPage() {
  const stats = {
    total: mockVehicles.length,
    active: mockVehicles.filter(v => v.status === 'active').length,
    sold: mockVehicles.filter(v => v.status === 'sold').length,
    hidden: mockVehicles.filter(v => v.status === 'hidden').length,
    newLeads: mockLeads.filter(l => l.status === 'new').length,
    totalLeads: mockLeads.length,
  };

  const recentLeads = [...mockLeads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentVehicles = [...mockVehicles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <AdminDashboardClient
      stats={stats}
      recentLeads={recentLeads}
      recentVehicles={recentVehicles}
    />
  );
}
