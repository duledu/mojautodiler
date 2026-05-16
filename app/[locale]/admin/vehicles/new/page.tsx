import VehicleFormClient from '@/components/admin/VehicleFormClient';
import { getActiveDealers } from '@/lib/db/dealers';

export default async function NewVehiclePage() {
  const dealers = await getActiveDealers();
  return <VehicleFormClient mode="new" dealers={dealers} />;
}
