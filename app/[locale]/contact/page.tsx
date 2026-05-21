import { isValidLocale, getTranslations } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { getDealerSettings } from '@/lib/db/settings';
import { getHeroVehicle } from '@/lib/db/vehicles';
import ContactClient from '@/components/ContactClient';

export const dynamic = 'force-dynamic';

interface ContactPageProps {
  readonly params:       Promise<{ locale: string }>;
  readonly searchParams: Promise<{ vehicle?: string; vehicleTitle?: string; discount?: string }>;
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const sp = await searchParams;
  const t  = getTranslations(locale);

  const [dealer, heroVehicle] = await Promise.all([
    getDealerSettings(),
    getHeroVehicle(),
  ]);

  return (
    <ContactClient
      locale={locale}
      t={t}
      dealer={dealer}
      heroVehicle={heroVehicle}
      discountMode={sp.discount === 'share'}
      discountVehicleSlug={sp.vehicle}
      discountVehicleTitle={sp.vehicleTitle}
    />
  );
}
