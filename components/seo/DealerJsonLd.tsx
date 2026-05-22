const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs';

interface DealerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  facebook?: string;
  instagram?: string;
  mapUrl?: string;
}

export default function DealerJsonLd({ dealer }: { readonly dealer: DealerInfo }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name || 'Moj Auto Diler',
    description: 'Pažljivo odabrana premium vozila iz uvoza sa transparentnom istorijom, dokumentovanim stanjem i sigurnom kupovinom u Srbiji.',
    telephone: dealer.phone,
    email: dealer.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Srbija',
      addressRegion: 'Srbija',
      addressCountry: 'RS',
      streetAddress: dealer.address,
    },
    url: SITE,
    openingHours: dealer.workingHours,
    areaServed: { '@type': 'Country', name: 'Serbia' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Premium uvozna vozila',
      itemListElement: [{
        '@type': 'OfferCatalog',
        name: 'Polovni automobili iz uvoza',
      }],
    },
    sameAs: [dealer.facebook, dealer.instagram].filter(Boolean),
    priceRange: '€€€',
    currenciesAccepted: 'EUR, RSD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
