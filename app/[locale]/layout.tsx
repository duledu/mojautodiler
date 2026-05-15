import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations } from '@/lib/i18n';
import { getDealerSettings } from '@/lib/db/settings';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocaleChrome from '@/components/layout/LocaleChrome';

export const dynamic = 'force-dynamic';

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
