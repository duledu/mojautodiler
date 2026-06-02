import type { Vehicle } from '@/types/vehicle';

interface Props {
  readonly vehicle:    Vehicle;
  readonly dealerName: string;
  readonly dealerUrl:  string;
}

/**
 * Schema.org Car + Offer structured data for vehicle detail pages.
 *
 * Provides Google with rich, factual vehicle data for potential rich results.
 * Adds countryOfOrigin and itemCondition — key differentiators for an import
 * specialist. No invented reviews or ratings are ever included.
 */
export default function VehicleJsonLd({ vehicle, dealerName, dealerUrl }: Props) {
  const availability = vehicle.status === 'active'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/SoldOut';

  const itemCondition = vehicle.condition === 'novo'
    ? 'https://schema.org/NewCondition'
    : 'https://schema.org/UsedCondition';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Car',

    // Identity
    name:  vehicle.title,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    itemCondition,

    // Specs
    mileageFromOdometer: {
      '@type':   'QuantitativeValue',
      value:     vehicle.mileage,
      unitCode:  'KMT',
    },
    fuelType:            vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    driveWheelConfiguration: vehicle.drivetrain,
    bodyType:            vehicle.bodyType,
    numberOfDoors:       vehicle.doors,
    seatingCapacity:     vehicle.seats,
    color:               vehicle.color,
    ...(vehicle.interiorColor && { vehicleInteriorColor: vehicle.interiorColor }),
    ...(vehicle.vin            && { vehicleIdentificationNumber: vehicle.vin }),

    // countryOfOrigin — key import-authority signal for SERP
    ...(vehicle.origin?.trim() && {
      countryOfOrigin: {
        '@type': 'Country',
        name:    vehicle.origin.trim(),
      },
    }),

    // Engine
    ...(vehicle.engineSize && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        engineDisplacement: {
          '@type':   'QuantitativeValue',
          value:     vehicle.engineSize,
          unitCode:  'CMQ',
        },
        ...(vehicle.kilowatts && {
          enginePower: {
            '@type':   'QuantitativeValue',
            value:     vehicle.kilowatts,
            unitCode:  'KWT',
          },
        }),
      },
    }),

    // Offer / pricing
    offers: {
      '@type':        'Offer',
      price:          vehicle.price,
      priceCurrency:  vehicle.currency,
      availability,
      itemCondition,
      url:            `${dealerUrl}/sr/vehicle/${vehicle.slug}`,
      seller: {
        '@type': 'AutoDealer',
        name:    dealerName,
        url:     dealerUrl,
      },
    },

    // Description & images
    ...(vehicle.description && { description: vehicle.description }),
    image: vehicle.images.map((img) => img.url),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
