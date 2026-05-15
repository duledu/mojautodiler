import { isValidLocale, getTranslations, Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { getDealerSettings } from '@/lib/db/settings';
import ContactClient from '@/components/ContactClient';

export const dynamic = 'force-dynamic';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = getTranslations(locale as Locale);
  const dealer = await getDealerSettings();
  return <ContactClient locale={locale as Locale} t={t} dealer={dealer} />;
}
