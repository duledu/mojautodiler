import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getDealerSettings } from '@/lib/db/settings';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocaleChrome from '@/components/layout/LocaleChrome';

export const dynamic = 'force-dynamic';

// Propagates correct hreflang alternates for every page within this locale segment.
// Individual pages override title/description; this provides the language alternates baseline.
export async function generateMetadata(
  { params }: { readonly params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      languages: { sr: '/sr', sq: '/sq' },
    },
    ...(locale === 'sq' ? {
      openGraph: { locale: 'sq_AL' },
    } : {
      openGraph: { locale: 'sr_RS' },
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const t = getTranslations(locale);
  const dealer = await getDealerSettings();

  return (
    <LocaleChrome
      locale={locale}
      header={<Header locale={locale} t={t} dealer={dealer} />}
      footer={<Footer locale={locale} t={t} dealer={dealer} />}
    >
      {children}
    </LocaleChrome>
  );
}
