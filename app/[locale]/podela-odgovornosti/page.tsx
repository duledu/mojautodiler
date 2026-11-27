import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n';
import {
  LEGAL_RESPONSIBILITY_CANONICAL_PATH,
  LEGAL_RESPONSIBILITY_PAGE,
} from '@/lib/legal/responsibility-disclaimer';
import ResponsibilityDisclaimerContent from '@/components/legal/ResponsibilityDisclaimerContent';
import { SITE_URL } from '@/lib/site-url';

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  return {
    title: { absolute: LEGAL_RESPONSIBILITY_PAGE.seoTitle },
    description: LEGAL_RESPONSIBILITY_PAGE.seoDescription,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: LEGAL_RESPONSIBILITY_CANONICAL_PATH,
    },
    openGraph: {
      type: 'website',
      locale: 'sr_RS',
      title: LEGAL_RESPONSIBILITY_PAGE.seoTitle,
      description: LEGAL_RESPONSIBILITY_PAGE.seoDescription,
      url: `${SITE_URL}${LEGAL_RESPONSIBILITY_CANONICAL_PATH}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Moj Auto Diler: Podela odgovornosti i odricanje od odgovornosti',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: LEGAL_RESPONSIBILITY_PAGE.seoTitle,
      description: LEGAL_RESPONSIBILITY_PAGE.seoDescription,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function PodelaOdgovornostiPage({
  params,
}: {
  readonly params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return <ResponsibilityDisclaimerContent locale={locale} />;
}
