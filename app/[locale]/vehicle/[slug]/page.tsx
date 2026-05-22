import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getVehicleBySlug, getSimilarVehicles, getActiveVehicleSlugs } from '@/lib/db/vehicles';
import { getDealerSettings } from '@/lib/db/settings';
import VehicleDetailClient from '@/components/vehicle/VehicleDetailClient';
import VehicleJsonLd from '@/components/seo/VehicleJsonLd';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getActiveVehicleSlugs();
  return slugs.flatMap((v) => [
    { locale: 'sr', slug: v.slug },
    { locale: 'sq', slug: v.slug },
  ]);
}

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const [vehicle, dealer] = await Promise.all([getVehicleBySlug(slug), getDealerSettings()]);
  if (!vehicle) return {};

  const image = vehicle.images[0]?.url;
  const isSq = locale === 'sq';
  const title = `${vehicle.title} — ${vehicle.year} | ${dealer.name}`;
  const mileageStr = vehicle.mileage.toLocaleString('sr-RS');
  const priceStr   = vehicle.price.toLocaleString('sr-RS');
  const snippet    = (vehicle.description || '').slice(0, 100);
  const description = isSq
    ? `${vehicle.title}, ${vehicle.year}, ${mileageStr} km, ${priceStr} ${vehicle.currency}. ${snippet}`
    : `${vehicle.title}, ${vehicle.year}. godište, ${mileageStr} km, ${priceStr} ${vehicle.currency}. ${snippet}`;
  const isSold = vehicle.status === 'sold';

  return {
    title,
    description,
    ...(isSold ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: `${vehicle.title} ${vehicle.year}` }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `/${locale}/vehicle/${slug}`,
      languages: { sr: `/sr/vehicle/${slug}`, sq: `/sq/vehicle/${slug}` },
    },
  };
}

export default async function VehiclePage(
  { params }: { readonly params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const [vehicle, dealer, similar] = await Promise.all([
    getVehicleBySlug(slug),
    getDealerSettings(),
    getVehicleBySlug(slug).then((v) =>
      v ? getSimilarVehicles(v.id, v.brand, 4) : Promise.resolve([])
    ),
  ]);

  if (!vehicle) notFound();

  const t = getTranslations(locale);

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} dealerName={dealer.name} dealerUrl="https://mojautodiler.rs" />
      <VehicleDetailClient vehicle={vehicle} similar={similar} locale={locale} t={t} dealer={dealer} />
    </>
  );
}
