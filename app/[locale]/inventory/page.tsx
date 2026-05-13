import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InventoryClient from '@/components/vehicle/InventoryClient';
import { getActiveVehicles } from '@/lib/db/vehicles';
import { mockVehicles } from '@/data/vehicles';
import { getTranslations, isValidLocale } from '@/lib/i18n';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;

  // Use DB count; fall back to mock count
  let activeCount: number;
  try {
    const vehicles = await getActiveVehicles();
    activeCount = vehicles.length;
  } catch {
    activeCount = mockVehicles.filter((v) => v.status === 'active').length;
  }

  const title = locale === 'sq'
    ? `Inventari i Automjeteve — ${activeCount} Automjete | AutoElite Preševo`
    : `Inventar Vozila — ${activeCount} Vozila | AutoElite Preševo`;
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
  return <InventoryClient locale={locale} t={t} />;
}
