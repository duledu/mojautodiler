import { serializeJsonLd } from '@/lib/blog-content';
import { SITE_URL } from '@/lib/site-url';
import { buildInventoryCollectionJsonLd } from '@/lib/seo/structured-data';
import type { Vehicle } from '@/types/vehicle';

interface Props {
  readonly vehicles: readonly Vehicle[];
  readonly locale: string;
  readonly pageTitle: string;
  readonly description: string;
}

/**
 * Renders Schema.org CollectionPage + ItemList JSON-LD for /inventory pages.
 */
export default function InventoryJsonLd({
  vehicles,
  locale,
  pageTitle,
  description,
}: Props) {
  const collectionPage = buildInventoryCollectionJsonLd({
    vehicles,
    locale,
    pageTitle,
    description,
    siteUrl: SITE_URL,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPage) }}
    />
  );
}
