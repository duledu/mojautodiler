/**
 * Structured data for model silo pages (/sr/model/golf-7 etc.)
 *
 * Emits two JSON-LD blocks:
 *   1. CollectionPage — curated list of vehicles for a specific model
 *   2. FAQPage        — model-specific FAQ (for FAQ rich results)
 *
 * BreadcrumbList is handled separately via BreadcrumbJsonLd.
 */

import type { Vehicle } from '@/types/vehicle';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface Props {
  readonly modelName:    string;
  readonly brandName:    string;
  readonly pageUrl:      string;
  readonly pageTitle:    string;
  readonly description:  string;
  readonly vehicles:     Vehicle[];
  readonly locale:       string;
  readonly faq:          FaqItem[];
}

export default function ModelSiloJsonLd({
  modelName, brandName, pageUrl, pageTitle, description, vehicles, locale, faq,
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
      '@type': 'Product',
      name:    modelName,
      brand: {
        '@type': 'Brand',
        name:    brandName,
      },
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
