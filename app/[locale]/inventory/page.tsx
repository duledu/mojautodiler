import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import InventoryJsonLd from '@/components/seo/InventoryJsonLd';
import InventoryClient from '@/components/vehicle/InventoryClient';
import { getActiveVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale } from '@/lib/i18n';
import { getBreadcrumbLabels } from '@/lib/seo/silos';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const vehicles = await getActiveVehicles();
  const activeCount = vehicles.length;

  const title = locale === 'sq'
    ? 'Oferta e automjeteve të përdorura nga importi | Moj Auto Diler'
    : 'Ponuda polovnih automobila iz uvoza | Moj Auto Diler';
  const description = locale === 'sq'
    ? `Shfletoni ofertën aktuale prej ${activeCount} automjetesh të përdorura nga importi në Serbi. Filtroni sipas markës, modelit, çmimit dhe kilometrazhit në Moj Auto Diler.`
    : `Pregledajte aktuelnu ponudu od ${activeCount} polovnih automobila iz uvoza u Srbiji. Filtrirajte po marki, modelu, ceni i kilometraži na platformi Moj Auto Diler.`;

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

  const pageTitle = locale === 'sq'
    ? 'Oferta e automjeteve të përdorura nga importi | Moj Auto Diler'
    : 'Ponuda polovnih automobila iz uvoza | Moj Auto Diler';
  const description = locale === 'sq'
    ? `Shfletoni ofertën aktuale prej ${vehicles.length} automjetesh të përdorura nga importi në Serbi. Filtroni sipas markës, modelit, çmimit dhe kilometrazhit në Moj Auto Diler.`
    : `Pregledajte aktuelnu ponudu od ${vehicles.length} polovnih automobila iz uvoza u Srbiji. Filtrirajte po marki, modelu, ceni i kilometraži na platformi Moj Auto Diler.`;

  const bcLabels = getBreadcrumbLabels(locale);
  const breadcrumbs = [
    { name: bcLabels.home, url: `${SITE_URL}/${locale}` },
    { name: bcLabels.inventory, url: `${SITE_URL}/${locale}/inventory` },
  ];

  return (
    <>
      <InventoryJsonLd
        vehicles={vehicles}
        locale={locale}
        pageTitle={pageTitle}
        description={description}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <InventoryClient locale={locale} t={t} vehicles={vehicles} />
    </>
  );
}
