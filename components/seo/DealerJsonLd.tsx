import { serializeJsonLd } from '@/lib/blog-content';
import { SITE_URL } from '@/lib/site-url';
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  type PlatformContactInfo,
} from '@/lib/seo/structured-data';

/**
 * Renders two JSON-LD blocks on the homepage:
 *
 * 1. Organization — identifies MojAutoDiler as an informational/listing platform
 *    connecting buyers with partner dealerships (not an AutoDealer/LocalBusiness).
 *
 * 2. WebSite — establishes the site entity in the Knowledge Graph without the
 *    deprecated Sitelinks Search Box potentialAction.
 */
export default function DealerJsonLd({ dealer }: { readonly dealer: PlatformContactInfo }) {
  const organizationJsonLd = buildOrganizationJsonLd(dealer, SITE_URL);
  const websiteJsonLd = buildWebSiteJsonLd(dealer, SITE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
    </>
  );
}
