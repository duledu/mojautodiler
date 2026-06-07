import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getVehicleBySlug, getSimilarVehicles, getActiveVehicleSlugs } from '@/lib/db/vehicles';
import { getDealerSettings } from '@/lib/db/settings';
import VehicleDetailClient from '@/components/vehicle/VehicleDetailClient';
import VehicleJsonLd from '@/components/seo/VehicleJsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';

export const dynamic = 'force-dynamic';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');

// ── SEO helpers ───────────────────────────────────────────────────────────────

/**
 * Builds the SEO title for a vehicle page.
 *
 * Target format: "{Year} {Title} — {Price} EUR | Moj Auto Diler"
 * Falls back to shorter variants when the full title exceeds 65 characters
 * to stay within the ~60-char visible limit in Google search results.
 *
 * Uses `title: { absolute }` in Metadata so the root layout template
 * (which appends "| Moj Auto Diler") is bypassed — preventing duplication.
 */
function buildVehicleTitle(vehicle: Vehicle): string {
  const price  = vehicle.price.toLocaleString('sr-RS');
  const suffix = ` — ${price} EUR | Moj Auto Diler`;

  // Tier 1: year + full listing title (most descriptive)
  const full = `${vehicle.year} ${vehicle.title}${suffix}`;
  if (full.length <= 65) return full;

  // Tier 2: year + brand + model + generation
  const gen = vehicle.generation ? ` ${vehicle.generation}` : '';
  const mid  = `${vehicle.year} ${vehicle.brand} ${vehicle.model}${gen}${suffix}`;
  if (mid.length <= 65) return mid;

  // Tier 3: year + brand + model only
  return `${vehicle.year} ${vehicle.brand} ${vehicle.model}${suffix}`;
}

/**
 * Builds the meta description for a vehicle page.
 * Uses a structured formula (not the raw description text) for SEO quality.
 * Output is clamped to 155 characters to stay within the SERP snippet window.
 */
function buildVehicleDescription(vehicle: Vehicle, locale: string): string {
  const t       = getTranslations(locale as 'sr' | 'sq');
  const mileage = vehicle.mileage.toLocaleString('sr-RS');
  const fuel    = t.fuel[vehicle.fuelType]          ?? vehicle.fuelType;
  const trans   = t.transmission[vehicle.transmission] ?? vehicle.transmission;
  const origin  = vehicle.origin?.trim();

  if (locale === 'sq') {
    const base = `Automjet premium ${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${mileage} km, ${fuel}, ${trans}.`;
    const org  = origin ? ` Origjinë e verifikuar nga ${origin}.` : '';
    return `${base}${org} Blerje transparente dhe e sigurt në Serbi.`.slice(0, 155);
  }

  const base = `Premium uvozni ${vehicle.brand} ${vehicle.model} ${vehicle.year}. godište, ${mileage} km, ${fuel}, ${trans}.`;
  const org  = origin ? ` Provereno poreklo iz ${origin}.` : '';
  return `${base}${org} Transparentna kupovina.`.slice(0, 155);
}

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
  const [vehicle, dealer] = await Promise.all([getVehicleBySlug(slug), getDealerSettings()]);
  if (!vehicle) return {};

  const isSold      = vehicle.status === 'sold';
  const title       = buildVehicleTitle(vehicle);
  const description = buildVehicleDescription(vehicle, locale);
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
  { params }: { readonly params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const [vehicle, dealer, similar] = await Promise.all([
    getVehicleBySlug(slug),
    getDealerSettings(),
    getVehicleBySlug(slug).then((v) =>
      v ? getSimilarVehicles(v.id, v.brand, 4) : Promise.resolve([]),
    ),
  ]);

  if (!vehicle) notFound();

  const t = getTranslations(locale);

  const breadcrumbs = [
    { name: t.vehicleDetail.home, url: `${SITE}/${locale}` },
    { name: t.nav.inventory,      url: `${SITE}/${locale}/inventory` },
    { name: vehicle.title,        url: `${SITE}/${locale}/vehicle/${slug}` },
  ];

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} dealerName={dealer.name} dealerUrl={SITE} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <VehicleDetailClient vehicle={vehicle} similar={similar} locale={locale} t={t} dealer={dealer} />
    </>
  );
}
