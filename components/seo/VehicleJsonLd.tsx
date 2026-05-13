import { Vehicle } from '@/types/vehicle';

interface Props {
  vehicle: Vehicle;
  dealerName: string;
  dealerUrl: string;
}

export default function VehicleJsonLd({ vehicle, dealerName, dealerUrl }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: vehicle.title,
    description: vehicle.description,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    numberOfDoors: vehicle.doors,
    seatingCapacity: vehicle.seats,
    color: vehicle.color,
    vehicleInteriorColor: vehicle.interiorColor,
    ...(vehicle.vin && { vehicleIdentificationNumber: vehicle.vin }),
    ...(vehicle.engineSize && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        engineDisplacement: {
          '@type': 'QuantitativeValue',
          value: vehicle.engineSize,
          unitCode: 'CMQ',
        },
        enginePower: {
          '@type': 'QuantitativeValue',
          value: vehicle.kilowatts,
          unitCode: 'KWT',
        },
      },
    }),
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: vehicle.currency,
      availability: vehicle.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'AutoDealer',
        name: dealerName,
        url: dealerUrl,
      },
    },
    image: vehicle.images.map(img => img.url),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
