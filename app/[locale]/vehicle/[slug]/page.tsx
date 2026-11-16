import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getPublicVehicleBySlug, getSimilarVehicles, getActiveVehicleSlugs } from '@/lib/db/vehicles';
import { getDealerSettings } from '@/lib/db/settings';
import VehicleDetailClient from '@/components/vehicle/VehicleDetailClient';
import VehicleJsonLd from '@/components/seo/VehicleJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import VehicleFaqJsonLd from '@/components/seo/VehicleFaqJsonLd';
import { generateVehicleSeo } from '@/lib/seo/vehicle-seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getActiveVehicleSlugs();
  return slugs.flatMap((v) => [
    { locale: 'sr', slug: v.slug },
    { locale: 'sq', slug: v.slug },
  ]);
}

export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { slug, locale } = await params;
  const [vehicle, dealer] = await Promise.all([getPublicVehicleBySlug(slug), getDealerSettings()]);
  if (!vehicle) return {};

  const isSold      = vehicle.status === 'sold';
  const seo         = generateVehicleSeo(vehicle, (locale === 'sq' ? 'sq' : 'sr'));
  const title       = seo.seoTitle;
  const description = seo.metaDescription;
  const image       = vehicle.images[0]?.url;
  const imageAlt    = `${vehicle.year} ${vehicle.title}`;
  const canonicalPath = `/${locale}/vehicle/${slug}`;

  return {
    // `absolute` bypasses the root layout template "%s | Moj Auto Diler"
    // preventing the "| Moj Auto Diler" suffix from appearing twice.
    title: { absolute: title },
    description,

    robots: isSold
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',   // required for Google Discover image cards
          'max-snippet': -1,
          'max-video-preview': -1,
        },

    alternates: {
      canonical: canonicalPath,
      languages: {
        sr: `/sr/vehicle/${slug}`,
        sq: `/sq/vehicle/${slug}`,
      },
    },

    openGraph: {
      title,
      description,
      type:   'website',
      url:    `${SITE}${canonicalPath}`,
      siteName: dealer.name || 'Moj Auto Diler',
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: imageAlt }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Moj Auto Diler' }],
    },

    twitter: {
      card:   'summary_large_image',
      title,
      description,
      images: image ? [image] : ['/og-image.jpg'],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VehiclePage(
  {
    params,
    searchParams,
  }: {
    readonly params: Promise<{ locale: string; slug: string }>;
    readonly searchParams?: Promise<{ qa_vin?: string; qa_vin_mode?: string }>;
  },
) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const [vehicle, dealer, resolvedSearchParams] = await Promise.all([
    getPublicVehicleBySlug(slug),
    getDealerSettings(),
    searchParams ?? Promise.resolve({ qa_vin: undefined, qa_vin_mode: undefined }),
  ]);

  if (!vehicle) notFound();

  const devQaVin =
    process.env.NODE_ENV === 'development' &&
    typeof resolvedSearchParams?.qa_vin === 'string'
      ? resolvedSearchParams.qa_vin
      : undefined;

  const devQaVinMode =
    process.env.NODE_ENV === 'development' &&
    (resolvedSearchParams?.qa_vin_mode === 'WITH_VIN' || resolvedSearchParams?.qa_vin_mode === 'NO_VIN')
      ? (resolvedSearchParams.qa_vin_mode as 'WITH_VIN' | 'NO_VIN')
      : undefined;

  const vehicleForClient = {
    ...vehicle,
    ...(devQaVin !== undefined ? { vin: devQaVin } : {}),
    ...(devQaVinMode !== undefined ? { carVerticalVinMode: devQaVinMode } : {}),
  };

  const similar = await getSimilarVehicles(vehicle.id, vehicle.brand, 4);

  const t   = getTranslations(locale);
  const seo = generateVehicleSeo(vehicle, locale);

  const breadcrumbs = [
    { name: t.vehicleDetail.home, url: `${SITE}/${locale}` },
    { name: t.nav.inventory,      url: `${SITE}/${locale}/inventory` },
    { name: vehicle.title,        url: `${SITE}/${locale}/vehicle/${slug}` },
  ];

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} dealerName={dealer.name} dealerUrl={SITE} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <VehicleFaqJsonLd faq={seo.faq} />
      <VehicleDetailClient
        vehicle={vehicleForClient}
        similar={similar}
        locale={locale}
        t={t}
        dealer={dealer}
        seoContent={{
          description: seo.seoDescription,
          benefits:    seo.benefits,
          buyerProfile: seo.buyerProfile,
          faq:         seo.faq,
        }}
      />
    </>
  );
}
