import { serializeJsonLd } from '@/lib/blog-content';
import { buildVehicleJsonLd } from '@/lib/seo/structured-data';
import type { Vehicle } from '@/types/vehicle';

interface Props {
  readonly vehicle:    Vehicle;
  readonly dealerName?: string;
  readonly dealerUrl:  string;
  readonly locale?:    string;
}

/**
 * Schema.org Car + Offer structured data for vehicle detail pages.
 *
 * Uses standardized Schema.org enums for transmission and drivetrain,
 * attributes Offer.seller to the partner auto-plac (never falsely labeling
 * MojAutoDiler as an AutoDealer), and emits localized canonical URLs.
 */
export default function VehicleJsonLd({ vehicle, dealerUrl, locale = 'sr' }: Props) {
  const jsonLd = buildVehicleJsonLd(vehicle, dealerUrl, locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
