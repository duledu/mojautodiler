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

export default function DealerJsonLd({ dealer }: { dealer: DealerInfo }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.name || 'Moj Auto Diler',
    telephone: dealer.phone,
    email: dealer.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Srbija',
      addressRegion: 'Srbija',
      addressCountry: 'RS',
      streetAddress: dealer.address,
    },
    url: 'https://mojautodiler.rs',
    openingHours: dealer.workingHours,
    sameAs: [
      dealer.facebook,
      dealer.instagram,
    ].filter(Boolean),
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
