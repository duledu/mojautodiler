import { getAllVehicles } from '@/lib/db/vehicles';
import { mockVehicles } from '@/data/vehicles';
import AdminVehiclesClient from '@/components/admin/AdminVehiclesClient';

export default async function AdminVehiclesPage() {
  const vehicles = await getAllVehicles();
  // Fall back to mock data if DB returns nothing
  const data = vehicles.length > 0 ? vehicles : mockVehicles;
  return <AdminVehiclesClient vehicles={data} />;
}
