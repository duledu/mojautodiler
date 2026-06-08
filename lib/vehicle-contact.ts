import type { DealerInfo } from '@/lib/db/mappers';
import type { Vehicle } from '@/types/vehicle';

export interface VehicleContact {
  name: string;
  phone: string;
  viber: string;
  instagram: string;
  facebook: string;
  location: string;
  address: string;
  locationName?: string;
  googleMapsEmbedUrl?: string;
  googleMapsUrl?: string;
  workingHours: string;
  isVerified: boolean;
  dealerId?: string;
  dealerName?: string;
  hasPartnerDealer: boolean;
}

export function resolveVehicleContact(vehicle: Vehicle, fallback: DealerInfo): VehicleContact {
  const dealer = vehicle.dealer;
  const phone = vehicle.contactPhone || dealer?.phone || fallback.phone;
  const viber = vehicle.contactViber || dealer?.viber || fallback.viber;
  const name = vehicle.contactName || dealer?.name || fallback.name;

  return {
    name,
    phone,
    viber,
    instagram: dealer?.instagram || fallback.instagram,
    facebook: dealer?.facebook || fallback.facebook,
    location: dealer?.location || fallback.address || 'Srbija',
    address: dealer?.address || fallback.address,
    locationName: dealer?.locationName,
    googleMapsEmbedUrl: dealer?.googleMapsEmbedUrl,
    googleMapsUrl: dealer?.googleMapsUrl,
    workingHours: dealer?.workingHours || fallback.workingHours,
    isVerified: dealer?.isVerified ?? true,
    dealerId: dealer?.id,
    dealerName: dealer?.name,
    hasPartnerDealer: Boolean(dealer),
  };
}
