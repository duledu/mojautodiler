import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';
import { listBlogCategories } from '@/lib/db/blog';
import { getActiveVehicles } from '@/lib/db/vehicles';
import BlogFormClient from '@/components/admin/BlogFormClient';
import type { BlogCategory } from '@/types/blog';
import type { Vehicle } from '@/types/vehicle';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage({
  params,
}: {
  readonly params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const authenticated = token ? await verifySessionToken(token) : false;
  if (!authenticated) {
    redirect(`/${locale}/admin/login`);
  }

  let categories: BlogCategory[] = [];
  let availableVehicles: Vehicle[] = [];

  try {
    [categories, availableVehicles] = await Promise.all([
      listBlogCategories(),
      getActiveVehicles(),
    ]);
  } catch (err) {
    console.warn(
      '[ADMIN BLOG NEW] Initial load warning:',
      err instanceof Error ? err.message : String(err),
    );
  }

  return (
    <BlogFormClient
      mode="new"
      initialCategories={categories}
      availableVehicles={availableVehicles}
    />
  );
}
