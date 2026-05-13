import { mockVehicles } from '@/data/vehicles';
import AdminVehiclesClient from '@/components/admin/AdminVehiclesClient';

export default function AdminVehiclesPage() {
  return <AdminVehiclesClient vehicles={mockVehicles} />;
}
