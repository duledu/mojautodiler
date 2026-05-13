import { isValidLocale, getTranslations, Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ContactClient from '@/components/ContactClient';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = getTranslations(locale as Locale);
  return <ContactClient locale={locale as Locale} t={t} />;
}
