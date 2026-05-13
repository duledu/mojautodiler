import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations, Locale } from '@/lib/i18n';
import { mockVehicles, getDealerInfo } from '@/data/vehicles';
import VehicleDetailClient from '@/components/vehicle/VehicleDetailClient';
import VehicleJsonLd from '@/components/seo/VehicleJsonLd';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return mockVehicles.flatMap(v => [
    { locale: 'sr', slug: v.slug },
    { locale: 'sq', slug: v.slug },
  ]);
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const vehicle = mockVehicles.find(v => v.slug === slug);
  if (!vehicle) return {};

  const dealer = getDealerInfo();
  const image = vehicle.images[0]?.url;
  const title = `${vehicle.title} — ${vehicle.year} | ${dealer.name}`;
  const description = `${vehicle.title}, ${vehicle.year}. godište, ${vehicle.mileage.toLocaleString('sr-RS')} km, ${vehicle.price.toLocaleString('sr-RS')} ${vehicle.currency}. ${(vehicle.description || '').slice(0, 120)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: vehicle.title }] : [],
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/vehicle/${slug}`,
      languages: {
        sr: `/sr/vehicle/${slug}`,
        sq: `/sq/vehicle/${slug}`,
      },
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const vehicle = mockVehicles.find(v => v.slug === slug);
  if (!vehicle) notFound();

  const dealer = getDealerInfo();
  const t = getTranslations(locale as Locale);
  const similar = mockVehicles
    .filter(v => v.id !== vehicle.id && v.status === 'active' && v.brand === vehicle.brand)
    .slice(0, 4);

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} dealerName={dealer.name} dealerUrl="https://autoelite.rs" />
      <VehicleDetailClient vehicle={vehicle} similar={similar} locale={locale as Locale} t={t} />
    </>
  );
}
