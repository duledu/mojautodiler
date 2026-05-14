import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { verifySessionToken, ADMIN_COOKIE } from '@/lib/admin-auth';
import { isValidLocale, type Locale } from '@/lib/i18n';
import AdminLoginClient from '@/components/admin/AdminLoginClient';

export const metadata = { title: 'Admin Login' };

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  // If already authenticated, go directly to admin dashboard
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) {
    redirect(`/${locale}/admin`);
  }

  const { from } = await searchParams;
  // Validate the `from` param so we never redirect to an external URL
  const redirectTo =
    from && from.startsWith(`/${locale}/admin`) && !from.includes('/admin/login')
      ? from
      : `/${locale}/admin`;

  return <AdminLoginClient locale={locale as Locale} redirectTo={redirectTo} />;
}
