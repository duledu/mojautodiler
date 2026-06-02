interface BreadcrumbItem {
  readonly name: string;
  readonly url:  string;
}

interface Props {
  readonly items: BreadcrumbItem[];
}

/**
 * Schema.org BreadcrumbList structured data.
 *
 * Enables Google to show breadcrumb trail in SERPs, giving the vehicle page
 * a richer appearance and helping users understand site hierarchy.
 *
 * Usage: pass absolute URLs for every crumb.
 * Example: Početna → Vozila → {Vehicle title}
 */
export default function BreadcrumbJsonLd({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type':   'ListItem',
      position:  index + 1,
      name:      item.name,
      item:      item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
