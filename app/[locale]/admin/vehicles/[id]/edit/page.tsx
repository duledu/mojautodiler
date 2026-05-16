import { notFound } from 'next/navigation';
import { getVehicleById } from '@/lib/db/vehicles';
import { getActiveDealers } from '@/lib/db/dealers';
import VehicleFormClient from '@/components/admin/VehicleFormClient';

export default async function EditVehiclePage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [vehicle, dealers] = await Promise.all([
    getVehicleById(id),
    getActiveDealers(),
  ]);

  console.info(
    `[EDIT PAGE] id=${id} images=${JSON.stringify(vehicle?.images?.map(i => i.url))}`,
  );

  if (!vehicle) notFound();

  return <VehicleFormClient mode="edit" vehicle={vehicle} dealers={dealers} />;
}
