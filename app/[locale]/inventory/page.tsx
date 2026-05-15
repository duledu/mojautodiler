import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InventoryClient from '@/components/vehicle/InventoryClient';
import { getActiveVehicles } from '@/lib/db/vehicles';
import { getTranslations, isValidLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const vehicles = await getActiveVehicles();
  const activeCount = vehicles.length;

  const title = locale === 'sq'
    ? `Inventari i Automjeteve — ${activeCount} Automjete | AutoFerari Preševo`
    : `Inventar Vozila — ${activeCount} Vozila | AutoFerari Preševo`;
  const description = locale === 'sq'
    ? `Shfletoni koleksionin tone te ${activeCount} automjeteve premium ne Preševo me histori transparente.`
    : `Premium vozila dostupna u Preševu. Pregledajte ${activeCount} pažljivo odabranih automobila sa transparentnom istorijom.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/inventory`,
      languages: { sr: '/sr/inventory', sq: '/sq/inventory' },
    },
  };
}

export default async function InventoryPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = getTranslations(locale);
  const vehicles = await getActiveVehicles();
  return <InventoryClient locale={locale} t={t} vehicles={vehicles} />;
}
