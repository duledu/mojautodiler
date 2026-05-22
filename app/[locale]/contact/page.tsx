import type { Metadata } from 'next';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { getDealerSettings } from '@/lib/db/settings';
import { getHeroVehicle } from '@/lib/db/vehicles';
import ContactClient from '@/components/ContactClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const isSq = locale === 'sq';
  return {
    title: isSq ? 'Na Kontaktoni | Moj Auto Diler' : 'Kontaktirajte Nas | Moj Auto Diler',
    description: isSq
      ? 'Na dërgoni mesazh ose na telefononi për çdo pyetje rreth automjeteve premium, blerjes dhe rezervimit. Moj Auto Diler — Serbi.'
      : 'Pošaljite poruku ili nas pozovite za sva pitanja oko premium vozila, kupovine i rezervacije. Moj Auto Diler — Srbija.',
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { sr: '/sr/contact', sq: '/sq/contact' },
    },
    openGraph: {
      type: 'website',
      title: isSq ? 'Na Kontaktoni | Moj Auto Diler' : 'Kontaktirajte Nas | Moj Auto Diler',
      description: isSq
        ? 'Na dërgoni mesazh për çdo pyetje rreth automjeteve premium.'
        : 'Pošaljite poruku za sva pitanja oko premium vozila.',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler — premium automobili iz uvoza' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.jpg'],
    },
  };
}

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
