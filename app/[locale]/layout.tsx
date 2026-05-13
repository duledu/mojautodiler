import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations, Locale } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocaleChrome from '@/components/layout/LocaleChrome';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  
  const t = getTranslations(locale as Locale);

  return (
    <LocaleChrome
      locale={locale}
      header={<Header locale={locale as Locale} t={t} />}
      footer={<Footer locale={locale as Locale} t={t} />}
    >
      {children}
    </LocaleChrome>
  );
}
