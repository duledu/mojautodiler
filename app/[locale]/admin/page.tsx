import { getVehicleStats, getAllVehicles } from '@/lib/db/vehicles';
import { getLeadStats, getRecentLeads } from '@/lib/db/leads';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const [vehicleStats, leadStats, recentLeads, allVehicles] = await Promise.all([
    getVehicleStats(),
    getLeadStats(),
    getRecentLeads(5),
    getAllVehicles(),
  ]);

  const recentVehicles = allVehicles
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const stats = {
    total:      vehicleStats.total,
    active:     vehicleStats.active,
    sold:       vehicleStats.sold,
    hidden:     vehicleStats.hidden     || 0,
    newLeads:   leadStats.newLeads,
    totalLeads: leadStats.totalLeads,
  };

  return (
    <AdminDashboardClient
      stats={stats}
      recentLeads={recentLeads}
      recentVehicles={recentVehicles}
    />
  );
}
