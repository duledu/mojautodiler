import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';
import { listBlogCategories, listBlogPostsForAdmin } from '@/lib/db/blog';
import AdminBlogListClient from '@/components/admin/AdminBlogListClient';
import type { BlogCategory, BlogPostAdminSummary } from '@/types/blog';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage({
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

  let initialPosts: BlogPostAdminSummary[] = [];
  let initialCategories: BlogCategory[] = [];

  try {
    const [postsResult, categories] = await Promise.all([
      listBlogPostsForAdmin({ page: 1, pageSize: 50 }),
      listBlogCategories(),
    ]);
    initialPosts = postsResult.items;
    initialCategories = categories;
  } catch (err) {
    console.warn(
      '[ADMIN BLOG] Unable to load initial blog rows (migration may be pending):',
      err instanceof Error ? err.message : String(err),
    );
  }

  return (
    <AdminBlogListClient
      initialPosts={initialPosts}
      initialCategories={initialCategories}
    />
  );
}
