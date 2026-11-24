import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CarVerticalDealersLanding from '@/components/affiliate/CarVerticalDealersLanding';
import { getCarVerticalDealersPagePath } from '@/lib/affiliate/carvertical';
import { isValidLocale } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site-url';

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params;
  const pagePath = getCarVerticalDealersPagePath(locale);
  const title = 'Pokažite istoriju vozila. Steknite poverenje kupca. | Moj Auto Diler';
  const description =
    'Pripremite carVertical izveštaj uz 20% popusta i pošaljite dostupne podatke o istoriji vozila kupcu pre razgledanja.';

  return {
    title: { absolute: title },
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: pagePath,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${pagePath}`,
      title,
      description,
      images: [
        {
          url: '/carVertical asset/RS/RS_300x250-4.png',
          width: 900,
          height: 750,
          alt: 'carVertical: Proverite kilometražu i izbegnite iznenađenja',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/carVertical asset/RS/RS_300x250-4.png'],
    },
  };
}

export default async function CarVerticalDealersPage({
  params,
}: {
  readonly params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return <CarVerticalDealersLanding locale={locale} />;
}
