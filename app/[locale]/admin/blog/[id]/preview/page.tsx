import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, ShieldAlert } from 'lucide-react';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';
import {
  getBlogPostByIdForAdmin,
  getRelatedAvailableVehiclesForPost,
} from '@/lib/db/blog';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getTranslations } from '@/lib/i18n';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Pregled Članka',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPreviewPage({
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

  const post = await getBlogPostByIdForAdmin(id);
  if (!post) notFound();

  const relatedVehicles = await getRelatedAvailableVehiclesForPost({
    postId: post.id,
    relatedBrand: post.relatedBrand,
    relatedModel: post.relatedModel,
    limit: 4,
  }).catch(() => []);

  const t = getTranslations('sr');

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>
            INTERNI ADMIN PREGLED — Status članka: {post.status.toUpperCase()} (javne
            blog stranice nisu aktivirane u Fazi 2)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/blog`}
            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
          >
            <ArrowLeft size={13} />
            Lista članaka
          </Link>
          <Link
            href={`/${locale}/admin/blog/${post.id}/edit`}
            className="inline-flex items-center gap-1 rounded-xl bg-[#11100E] px-3 py-1.5 text-xs font-bold text-white hover:bg-black/85"
          >
            <Edit2 size={13} />
            Uredi članak
          </Link>
        </div>
      </div>

      <article className="rounded-3xl border border-[var(--color-border)] bg-white p-6 lg:p-10">
        <header className="mx-auto max-w-3xl space-y-3 border-b border-[var(--color-border)] pb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
            {post.category?.name ?? 'Blog'} • {post.authorName}
          </div>
          <h1
            className="text-3xl font-extrabold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
            {post.excerpt}
          </p>
        </header>

        {post.featuredImage && (
          <div className="mx-auto my-6 max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="max-h-[480px] w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-6 max-w-3xl">
          <BlogContentRenderer document={post.content} />
        </div>
      </article>

      {relatedVehicles.length > 0 && (
        <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6">
          <h2
            className="mb-4 text-lg font-extrabold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Povezana dostupna vozila ({relatedVehicles.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                locale="sr"
                t={t}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
