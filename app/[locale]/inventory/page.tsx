import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InventoryClient from '@/components/vehicle/InventoryClient';
import { getActiveVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const vehicles = await getActiveVehicles();
  const activeCount = vehicles.length;

  const title = locale === 'sq'
    ? `Inventari i Automjeteve (${activeCount} automjete) | Moj Auto Diler`
    : `Inventar Vozila (${activeCount} vozila) | Moj Auto Diler`;
  const description = locale === 'sq'
    ? `Shfletoni koleksionin tone te ${activeCount} automjeteve premium me histori transparente.`
    : `Premium vozila dostupna u Srbiji. Pregledajte ${activeCount} pažljivo odabranih automobila sa transparentnom istorijom.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${locale}/inventory`,
      languages: {
        sr: '/sr/inventory',
        sq: '/sq/inventory',
        'x-default': '/sr/inventory',
      },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${locale}/inventory`,
      title,
      description,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler, premium automobili iz uvoza' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  };
}

export default async function InventoryPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = getTranslations(locale);
  const vehicles = await getActiveVehicles();
  return <InventoryClient locale={locale} t={t} vehicles={vehicles} />;
}
