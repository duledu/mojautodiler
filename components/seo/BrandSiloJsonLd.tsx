/**
 * Structured data for brand silo pages (/sr/cars/bmw etc.)
 *
 * Emits three JSON-LD blocks:
 *   1. CollectionPage — tells Google this is a curated list page
 *   2. ItemList       — the actual vehicle listings (for rich results)
 *   3. FAQPage        — brand-specific FAQ (for FAQ rich results in SERPs)
 *
 * Phase 1 BreadcrumbList is handled separately via BreadcrumbJsonLd.
 */

import type { Vehicle } from '@/types/vehicle';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface Props {
  readonly brandName:   string;
  readonly pageUrl:     string;
  readonly pageTitle:   string;
  readonly description: string;
  readonly vehicles:    Vehicle[];
  readonly locale:      string;
  readonly faq:         FaqItem[];
}

export default function BrandSiloJsonLd({
  brandName, pageUrl, pageTitle, description, vehicles, locale, faq,
}: Props) {
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type':    'CollectionPage',
    '@id':      pageUrl,
    name:       pageTitle,
    description,
    url:        pageUrl,
    inLanguage: locale,
    publisher: {
      '@type': 'AutoDealer',
      name:    'Moj Auto Diler',
      url:     SITE,
    },
    about: {
      '@type': 'Brand',
      name:    brandName,
    },
    mainEntity: {
      '@type':         'ItemList',
      name:            pageTitle,
      numberOfItems:   vehicles.length,
      itemListElement: vehicles.slice(0, 20).map((v, i) => ({
        '@type':    'ListItem',
        position:   i + 1,
        url:        `${SITE}/${locale}/vehicle/${v.slug}`,
        name:       `${v.title} — ${v.price.toLocaleString('sr-RS')} ${v.currency}`,
      })),
    },
  };

  const faqPage = faq.length > 0 ? {
    '@context':  'https://schema.org',
    '@type':     'FAQPage',
    mainEntity:  faq.map(({ q, a }) => ({
      '@type': 'Question',
      name:    q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage) }}
      />
      {faqPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
    </>
  );
}
