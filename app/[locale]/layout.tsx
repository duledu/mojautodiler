import { notFound } from 'next/navigation';
import { isValidLocale, getTranslations, Locale } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    <div className={`theme-${locale} flex flex-col min-h-screen`}>
      <Header locale={locale as Locale} t={t} />
      <main className="flex-1">
        {children}
      </main>
      <Footer locale={locale as Locale} t={t} />
    </div>
  );
}
