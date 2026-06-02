const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

interface DealerInfo {
  readonly name:         string;
  readonly phone:        string;
  readonly email:        string;
  readonly address:      string;
  readonly workingHours: string;
  readonly facebook?:    string;
  readonly instagram?:   string;
  readonly mapUrl?:      string;
}

/**
 * Renders two JSON-LD blocks on the homepage:
 *
 * 1. AutoDealer (LocalBusiness) — tells Google the entity, address, and
 *    area served. Critical for local pack visibility and EEAT.
 *
 * 2. WebSite — enables Google Sitelinks Search Box and helps establish
 *    the site as a known entity in the Knowledge Graph.
 */
export default function DealerJsonLd({ dealer }: { readonly dealer: DealerInfo }) {
  const dealerJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['AutoDealer', 'LocalBusiness'],
    name:        dealer.name || 'Moj Auto Diler',
    description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom u Srbiji.',
    url:         SITE,
    telephone:   dealer.phone,
    email:       dealer.email,

    // Proper PostalAddress — "addressLocality: Srbija" was incorrect;
    // locality is the city, region is the county/district.
    address: {
      '@type':           'PostalAddress',
      streetAddress:     dealer.address,
      addressLocality:   'Preševo',
      addressRegion:     'Pčinjski okrug',
      addressCountry:    'RS',
    },

    // Opening hours in schema.org standard format
    openingHoursSpecification: dealer.workingHours
      ? [{
          '@type':     'OpeningHoursSpecification',
          description: dealer.workingHours,
        }]
      : undefined,

    // Area served — national importer
    areaServed: [
      { '@type': 'Country', name: 'Serbia' },
    ],

    // Brand social accounts
    sameAs: [dealer.facebook, dealer.instagram].filter(Boolean),

    priceRange:         '€€€',
    currenciesAccepted: 'EUR, RSD',
    paymentAccepted:    'Cash, Credit Card, Bank Transfer',

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    'Premium uvozna vozila',
      itemListElement: [{
        '@type': 'OfferCatalog',
        name:    'Polovni automobili iz uvoza',
      }],
    },
  };

  // WebSite schema — needed for Google Sitelinks Search Box eligibility
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:       dealer.name || 'Moj Auto Diler',
    url:        SITE,
    description: 'Premium automobili iz uvoza u Srbiji.',
    potentialAction: {
      '@type':        'SearchAction',
      target:         {
        '@type':  'EntryPoint',
        urlTemplate: `${SITE}/sr/inventory?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
