import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Car,
  Tag,
} from 'lucide-react';
import { listBlogCategories, listPublishedBlogPosts } from '@/lib/db/blog';
import {
  BLOG_CANONICAL_SITE_URL,
  buildBlogListingMetadata,
} from '@/lib/seo/blog-seo';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

interface PageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ category?: string; page?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'sr') return {};

  const sp = await searchParams;
  const categorySlug = sp.category?.trim().toLowerCase() || undefined;
  const page = sp.page ? Math.max(1, Number(sp.page) || 1) : 1;

  const categories = await listBlogCategories();
  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  return buildBlogListingMetadata({
    categoryName: activeCategory?.name ?? null,
    categorySlug: activeCategory?.slug ?? null,
    page,
  });
}

function formatSerbianDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('sr-Latn-RS', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function buildBlogPageHref(categorySlug: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (categorySlug) params.set('category', categorySlug);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/sr/blog?${qs}` : '/sr/blog';
}

export default async function PublicBlogListingPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (locale !== 'sr') notFound();

  const sp = await searchParams;
  const categorySlug = sp.category?.trim().toLowerCase() || undefined;
  const rawPage = sp.page ? Number(sp.page) : 1;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const [postsResult, categories] = await Promise.all([
    listPublishedBlogPosts({
      categorySlug,
      page,
      pageSize: PAGE_SIZE,
    }),
    listBlogCategories(),
  ]);

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  const showFeaturedHero =
    page === 1 && !categorySlug && postsResult.items.length > 0;
  const featuredPost = showFeaturedHero ? postsResult.items[0] : null;
  const gridPosts = showFeaturedHero
    ? postsResult.items.slice(1)
    : postsResult.items;

  const breadcrumbs = [
    { name: 'Početna', url: `${BLOG_CANONICAL_SITE_URL}/sr` },
    { name: 'Auto magazin', url: `${BLOG_CANONICAL_SITE_URL}/sr/blog` },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20">
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Hero / Header Section */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/75 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            <Link
              href="/sr"
              className="transition hover:text-[var(--accent-dark)]"
            >
              Početna
            </Link>
            <span>/</span>
            <span className="font-bold text-[var(--color-text)]">Auto magazin</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="font-bold text-[var(--accent-dark)]">
                  {activeCategory.name}
                </span>
              </>
            )}
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-dark)]">
              <BookOpen size={13} />
              Moj Auto Diler • Auto magazin
            </span>
            <h1
              className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {activeCategory
                ? activeCategory.name
                : 'Vodiči za kupovinu i saveti za polovne automobile'}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
              {activeCategory?.description ||
                'Detaljni pregledi modela, iskustva sa motorima i menjačima, provera istorije vozila i praktični saveti za sigurnu kupovinu automobila u Srbiji.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link
                href="/sr/blog"
                className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  !categorySlug
                    ? 'bg-[#11100E] text-white shadow-sm'
                    : 'border border-[var(--color-border)] bg-white text-[var(--color-text-2)] hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]'
                }`}
              >
                Sve teme
              </Link>
              {categories.map((cat) => {
                const isActive = categorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={buildBlogPageHref(cat.slug, 1)}
                    className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#11100E] text-white shadow-sm'
                        : 'border border-[var(--color-border)] bg-white text-[var(--color-text-2)] hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]'
                    }`}
                  >
                    <Tag size={12} />
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {postsResult.items.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-xl rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-xs sm:p-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-dark)]">
              <BookOpen size={22} />
            </div>
            <h2
              className="text-xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Trenutno nema objavljenih članaka u ovoj sekciji
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Uskoro objavljujemo nove stručne vodiče za kupovinu i održavanje vozila. U
              međuvremenu pogledajte aktuelnu ponudu proverenih automobila.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {categorySlug && (
                <Link
                  href="/sr/blog"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
                >
                  Svi članci
                </Link>
              )}
              <Link
                href="/sr/inventory"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#11100E] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-black/85"
              >
                <Car size={15} />
                Pogledaj dostupna vozila
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article Spotlight */}
            {featuredPost && (
              <article className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-xs transition hover:border-[var(--accent-border)]">
                <div className="grid lg:grid-cols-[1.15fr_1fr]">
                  <Link
                    href={`/sr/blog/${featuredPost.slug}`}
                    className="relative block min-h-[260px] overflow-hidden bg-[var(--color-surface-2)] sm:min-h-[340px]"
                  >
                    {featuredPost.featuredImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={featuredPost.featuredImage}
                        alt={featuredPost.featuredImageAlt || featuredPost.title}
                        width={1600}
                        height={900}
                        fetchPriority="high"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center text-[var(--color-text-muted)]">
                        <BookOpen size={36} className="text-[var(--accent)]" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Moj Auto Diler Vodič
                        </span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-[#11100E]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      Izdvojeni vodič
                    </span>
                  </Link>

                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--color-text-muted)]">
                        {featuredPost.category && (
                          <Link
                            href={buildBlogPageHref(featuredPost.category.slug, 1)}
                            className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-dark)]"
                          >
                            {featuredPost.category.name}
                          </Link>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {formatSerbianDate(featuredPost.publishedAt)}
                        </span>
                      </div>

                      <h2
                        className="text-2xl font-extrabold leading-tight text-[var(--color-text)] sm:text-3xl"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <Link
                          href={`/sr/blog/${featuredPost.slug}`}
                          className="transition hover:text-[var(--accent-dark)]"
                        >
                          {featuredPost.title}
                        </Link>
                      </h2>

                      <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-text-2)] sm:text-base">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                        Autor: {featuredPost.authorName}
                      </span>
                      <Link
                        href={`/sr/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-dark)] transition hover:gap-2"
                      >
                        Pročitaj ceo vodič
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Article Cards Grid */}
            {gridPosts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-[var(--accent-border)]"
                  >
                    <Link
                      href={`/sr/blog/${post.slug}`}
                      className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-surface-2)]"
                    >
                      {post.featuredImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={post.featuredImage}
                          alt={post.featuredImageAlt || post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[var(--color-text-muted)]">
                          <BookOpen size={28} className="text-[var(--accent)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Moj Auto Diler
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                          {post.category && (
                            <Link
                              href={buildBlogPageHref(post.category.slug, 1)}
                              className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--accent-dark)]"
                            >
                              {post.category.name}
                            </Link>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Calendar size={11} />
                            {formatSerbianDate(post.publishedAt)}
                          </span>
                        </div>

                        <h2
                          className="text-lg font-extrabold leading-snug text-[var(--color-text)]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          <Link
                            href={`/sr/blog/${post.slug}`}
                            className="transition group-hover:text-[var(--accent-dark)]"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="line-clamp-3 text-xs leading-relaxed text-[var(--color-text-2)] sm:text-sm">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-3.5">
                        <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                          {post.authorName}
                        </span>
                        <Link
                          href={`/sr/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-dark)] transition group-hover:translate-x-0.5"
                        >
                          Pročitaj
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {postsResult.totalPages > 1 && (
              <nav
                aria-label="Paginacija bloga"
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4"
              >
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                  Strana {postsResult.page} od {postsResult.totalPages} (ukupno{' '}
                  {postsResult.total} članaka)
                </span>

                <div className="flex items-center gap-2">
                  {postsResult.page > 1 ? (
                    <Link
                      href={buildBlogPageHref(categorySlug, postsResult.page - 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--color-text)] transition hover:border-[var(--accent-border)]"
                    >
                      <ChevronLeft size={14} />
                      Prethodna
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-muted)] opacity-50">
                      <ChevronLeft size={14} />
                      Prethodna
                    </span>
                  )}

                  {postsResult.page < postsResult.totalPages ? (
                    <Link
                      href={buildBlogPageHref(categorySlug, postsResult.page + 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--color-text)] transition hover:border-[var(--accent-border)]"
                    >
                      Sledeća
                      <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-muted)] opacity-50">
                      Sledeća
                      <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
