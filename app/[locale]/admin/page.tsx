import { getVehicleStats, getAllVehicles } from '@/lib/db/vehicles';
import { getLeadStats, getRecentLeads } from '@/lib/db/leads';
import { mockVehicles } from '@/data/vehicles';
import { mockLeads } from '@/data/leads';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
  // Load all data concurrently; each helper has its own fallback
  const [vehicleStats, leadStats, recentLeads, allVehicles] = await Promise.all([
    getVehicleStats(),
    getLeadStats(),
    getRecentLeads(5),
    getAllVehicles(),
  ]);

  const recentVehicles = allVehicles
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Ensure we always have something to show (extra safety net)
  const stats = {
    total:      vehicleStats.total      || mockVehicles.length,
    active:     vehicleStats.active     || mockVehicles.filter((v) => v.status === 'active').length,
    sold:       vehicleStats.sold       || mockVehicles.filter((v) => v.status === 'sold').length,
    hidden:     vehicleStats.hidden     || 0,
    newLeads:   leadStats.newLeads      || mockLeads.filter((l) => l.status === 'new').length,
    totalLeads: leadStats.totalLeads    || mockLeads.length,
  };

  const leads  = recentLeads.length  > 0 ? recentLeads  : [...mockLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recent = recentVehicles.length > 0 ? recentVehicles : [...mockVehicles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <AdminDashboardClient
      stats={stats}
      recentLeads={leads}
      recentVehicles={recent}
    />
  );
}
