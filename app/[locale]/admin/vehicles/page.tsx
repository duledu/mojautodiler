import { getAllVehicles } from '@/lib/db/vehicles';
import AdminVehiclesClient from '@/components/admin/AdminVehiclesClient';

export const dynamic = 'force-dynamic';

export default async function AdminVehiclesPage() {
  const vehicles = await getAllVehicles();
  return <AdminVehiclesClient vehicles={vehicles} />;
}
