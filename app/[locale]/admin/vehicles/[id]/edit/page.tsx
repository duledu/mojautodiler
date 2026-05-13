import { mockVehicles } from '@/data/vehicles';
import VehicleFormClient from '@/components/admin/VehicleFormClient';
import { notFound } from 'next/navigation';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = mockVehicles.find(v => v.id === id);
  if (!vehicle) notFound();

  return <VehicleFormClient mode="edit" vehicle={vehicle} />;
}
