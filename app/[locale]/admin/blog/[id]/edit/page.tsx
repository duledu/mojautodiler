import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';
import { getBlogPostByIdForAdmin, listBlogCategories } from '@/lib/db/blog';
import { getActiveVehicles } from '@/lib/db/vehicles';
import BlogFormClient from '@/components/admin/BlogFormClient';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({
  params,
}: {
  readonly params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const authenticated = token ? await verifySessionToken(token) : false;
  if (!authenticated) {
    redirect(`/${locale}/admin/login`);
  }

  const [post, categories, availableVehicles] = await Promise.all([
    getBlogPostByIdForAdmin(id),
    listBlogCategories().catch(() => []),
    getActiveVehicles().catch(() => []),
  ]);

  if (!post) notFound();

  return (
    <BlogFormClient
      mode="edit"
      post={post}
      initialCategories={categories}
      availableVehicles={availableVehicles}
    />
  );
}
