interface FaqItem {
  readonly q: string;
  readonly a: string;
}

interface Props {
  readonly faq: FaqItem[];
}

export default function VehicleFaqJsonLd({ faq }: Props) {
  if (faq.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
