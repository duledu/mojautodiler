import { SITE_URL, normalizeSiteUrl } from '@/lib/site-url';
import type { DrivetrainType, FuelType, TransmissionType, Vehicle } from '@/types/vehicle';

export interface PlatformContactInfo {
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
  readonly workingHours?: string;
  readonly facebook?: string;
  readonly instagram?: string;
  readonly mapUrl?: string;
}

const TRANSMISSION_SCHEMA_MAP: Record<TransmissionType, string> = {
  automatski: 'Automatic',
  manuelni: 'Manual',
  poluautomatski: 'Semi-automatic',
};

const DRIVETRAIN_SCHEMA_MAP: Record<DrivetrainType, string> = {
  prednji: 'https://schema.org/FrontWheelDriveConfiguration',
  zadnji: 'https://schema.org/RearWheelDriveConfiguration',
  '4x4': 'https://schema.org/FourWheelDriveConfiguration',
  awd: 'https://schema.org/AllWheelDriveConfiguration',
};

const FUEL_TYPE_SCHEMA_MAP: Record<FuelType, string> = {
  dizel: 'Diesel',
  benzin: 'Gasoline',
  hibrid: 'Hybrid',
  elektricni: 'Electric',
  lpg: 'LPG',
  cng: 'CNG',
};

export function mapTransmissionToSchema(transmission: TransmissionType | string): string {
  const key = String(transmission).trim().toLowerCase() as TransmissionType;
  return TRANSMISSION_SCHEMA_MAP[key] ?? transmission;
}

export function mapDrivetrainToSchema(drivetrain: DrivetrainType | string): string {
  const key = String(drivetrain).trim().toLowerCase() as DrivetrainType;
  return DRIVETRAIN_SCHEMA_MAP[key] ?? drivetrain;
}

export function mapFuelTypeToSchema(fuelType: FuelType | string): string {
  const key = String(fuelType).trim().toLowerCase() as FuelType;
  return FUEL_TYPE_SCHEMA_MAP[key] ?? fuelType;
}

/**
 * Builds the Schema.org Organization entity for MojAutoDiler.
 * MojAutoDiler is legally an informational and listing platform connecting buyers
 * with partner dealerships (not an AutoDealer or direct vehicle seller).
 */
export function buildOrganizationJsonLd(
  dealer: PlatformContactInfo,
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const name = dealer.name?.trim() || 'Moj Auto Diler';
  const sameAs = [dealer.facebook, dealer.instagram]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url));

  const hasContact = Boolean(dealer.phone?.trim() || dealer.email?.trim());

  const trimmedAddress = dealer.address?.trim();
  const isStreetAddress = Boolean(
    trimmedAddress && !/^(srbija|serbia)$/i.test(trimmedAddress),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name,
    description:
      'Informativna i oglasna platforma koja povezuje kupce sa partnerskim auto-placevima i proverenom ponudom polovnih automobila iz uvoza u Srbiji.',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/brand-logo.png`,
    },
    ...(dealer.phone?.trim() ? { telephone: dealer.phone.trim() } : {}),
    ...(dealer.email?.trim() ? { email: dealer.email.trim() } : {}),
    ...(hasContact
      ? {
          contactPoint: [
            {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              ...(dealer.phone?.trim() ? { telephone: dealer.phone.trim() } : {}),
              ...(dealer.email?.trim() ? { email: dealer.email.trim() } : {}),
              areaServed: 'RS',
              availableLanguage: ['sr', 'sq'],
            },
          ],
        }
      : {}),
    ...(trimmedAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(isStreetAddress ? { streetAddress: trimmedAddress } : {}),
            addressLocality: 'Preševo',
            addressRegion: 'Pčinjski okrug',
            addressCountry: 'RS',
          },
        }
      : {}),
    areaServed: [{ '@type': 'Country', name: 'Serbia' }],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/**
 * Builds the Schema.org WebSite entity for MojAutoDiler.
 * Omits deprecated Sitelinks Search Box `potentialAction` (retired by Google in Nov 2024).
 */
export function buildWebSiteJsonLd(
  dealer: PlatformContactInfo,
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const name = dealer.name?.trim() || 'Moj Auto Diler';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name,
    alternateName: ['MojAutoDiler'],
    url: baseUrl,
    description:
      'Informativna i oglasna platforma za pregled ponude polovnih automobila u Srbiji.',
    inLanguage: ['sr', 'sq'],
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

/**
 * Resolves the accurate Offer.seller entity for a vehicle listing.
 * Attributes the listing to the actual partner auto-plac (`vehicle.dealer`) or
 * individual contact (`vehicle.contactName`). Returns undefined if no seller is
 * present on the listing, avoiding fabricated seller data and never falsely
 * labeling the MojAutoDiler platform as an AutoDealer.
 */
export function buildVehicleOfferSeller(
  vehicle: Vehicle,
): Record<string, unknown> | undefined {
  if (vehicle.dealer?.name?.trim()) {
    const partner = vehicle.dealer;
    const hasAddress = Boolean(partner.address?.trim() || partner.location?.trim());
    return {
      '@type': 'AutoDealer',
      name: partner.name.trim(),
      ...(partner.phone?.trim() ? { telephone: partner.phone.trim() } : {}),
      ...(hasAddress
        ? {
            address: {
              '@type': 'PostalAddress',
              ...(partner.address?.trim() ? { streetAddress: partner.address.trim() } : {}),
              ...(partner.location?.trim() ? { addressLocality: partner.location.trim() } : {}),
              addressCountry: 'RS',
            },
          }
        : {}),
    };
  }

  if (vehicle.contactName?.trim()) {
    return {
      '@type': 'Person',
      name: vehicle.contactName.trim(),
      ...(vehicle.contactPhone?.trim() ? { telephone: vehicle.contactPhone.trim() } : {}),
    };
  }

  return undefined;
}

/**
 * Builds Schema.org Car + Offer structured data for a vehicle detail page.
 */
export function buildVehicleJsonLd(
  vehicle: Vehicle,
  siteUrl: string = SITE_URL,
  locale: string = 'sr',
): Record<string, unknown> {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const normalizedLocale = locale === 'sq' ? 'sq' : 'sr';
  const encodedSlug = encodeURIComponent(vehicle.slug);
  const vehicleUrl = `${baseUrl}/${normalizedLocale}/vehicle/${encodedSlug}`;

  const availability =
    vehicle.status === 'active'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/SoldOut';

  const itemCondition =
    vehicle.condition === 'novo'
      ? 'https://schema.org/NewCondition'
      : 'https://schema.org/UsedCondition';

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: vehicle.title,
    url: vehicleUrl,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    itemCondition,

    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    fuelType: mapFuelTypeToSchema(vehicle.fuelType),
    vehicleTransmission: mapTransmissionToSchema(vehicle.transmission),
    driveWheelConfiguration: mapDrivetrainToSchema(vehicle.drivetrain),
    bodyType: vehicle.bodyType,
    numberOfDoors: vehicle.doors,
    seatingCapacity: vehicle.seats,
    color: vehicle.color,
    ...(vehicle.interiorColor ? { vehicleInteriorColor: vehicle.interiorColor } : {}),
    ...(vehicle.vin ? { vehicleIdentificationNumber: vehicle.vin } : {}),

    ...(vehicle.origin?.trim()
      ? {
          countryOfOrigin: {
            '@type': 'Country',
            name: vehicle.origin.trim(),
          },
        }
      : {}),

    ...(vehicle.engineSize
      ? {
          vehicleEngine: {
            '@type': 'EngineSpecification',
            engineDisplacement: {
              '@type': 'QuantitativeValue',
              value: vehicle.engineSize,
              unitCode: 'CMQ',
            },
            ...(vehicle.kilowatts
              ? {
                  enginePower: {
                    '@type': 'QuantitativeValue',
                    value: vehicle.kilowatts,
                    unitCode: 'KWT',
                  },
                }
              : {}),
          },
        }
      : {}),

    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: vehicle.currency,
      availability,
      itemCondition,
      url: vehicleUrl,
      ...(() => {
        const seller = buildVehicleOfferSeller(vehicle);
        return seller ? { seller } : {};
      })(),
    },

    ...(vehicle.description ? { description: vehicle.description } : {}),
    image: vehicle.images.map((img) => img.url),
  };
}

/**
 * Builds Schema.org CollectionPage + ItemList structured data for the /inventory page.
 */
export function buildInventoryCollectionJsonLd(params: {
  readonly vehicles: readonly Vehicle[];
  readonly locale: string;
  readonly pageTitle: string;
  readonly description: string;
  readonly siteUrl?: string;
}): Record<string, unknown> {
  const baseUrl = normalizeSiteUrl(params.siteUrl ?? SITE_URL);
  const normalizedLocale = params.locale === 'sq' ? 'sq' : 'sr';
  const pageUrl = `${baseUrl}/${normalizedLocale}/inventory`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: params.pageTitle,
    description: params.description,
    url: pageUrl,
    inLanguage: normalizedLocale,
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Moj Auto Diler',
      url: baseUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: params.pageTitle,
      numberOfItems: params.vehicles.length,
      itemListElement: params.vehicles.slice(0, 50).map((vehicle, index) => {
        const vehicleUrl = `${baseUrl}/${normalizedLocale}/vehicle/${encodeURIComponent(vehicle.slug)}`;
        const primaryImage = vehicle.images[0]?.url;

        return {
          '@type': 'ListItem',
          position: index + 1,
          url: vehicleUrl,
          name: `${vehicle.title} (${vehicle.year})`,
          item: {
            '@type': 'Car',
            name: vehicle.title,
            url: vehicleUrl,
            brand: { '@type': 'Brand', name: vehicle.brand },
            model: vehicle.model,
            vehicleModelDate: String(vehicle.year),
            ...(primaryImage ? { image: primaryImage } : {}),
            offers: {
              '@type': 'Offer',
              price: vehicle.price,
              priceCurrency: vehicle.currency,
              availability:
                vehicle.status === 'active'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/SoldOut',
              url: vehicleUrl,
            },
          },
        };
      }),
    },
  };
}
