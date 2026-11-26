import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Clock,
  Tag,
  User,
} from 'lucide-react';
import { getPublishedBlogPostBySlug } from '@/lib/db/blog';
import {
  buildBlogPostMetadata,
  estimateBlogReadingTimeMinutes,
  resolveBlogCanonicalUrl,
} from '@/lib/seo/blog-seo';
import { resolveSiloLinksForBlogPost } from '@/lib/seo/silos';
import BlogJsonLd from '@/components/seo/BlogJsonLd';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import BlogShareButton from '@/components/blog/BlogShareButton';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { getTranslations } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== 'sr') return {};

  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  return buildBlogPostMetadata(post);
}

function formatSerbianDate(iso: string | null): string {
  if (!iso) return '';
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

export default async function PublicBlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (locale !== 'sr') notFound();

  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const t = getTranslations('sr');
  const siloLinks = resolveSiloLinksForBlogPost(post);
  const readingTimeMinutes = estimateBlogReadingTimeMinutes(post.content);
  const canonicalUrl = post.canonicalUrl?.trim()
    ? resolveBlogCanonicalUrl(post.canonicalUrl)
    : resolveBlogCanonicalUrl(`/sr/blog/${post.slug}`);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-20">
      <BlogJsonLd post={post} />

      {/* Top Breadcrumb & Back Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/65 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)]"
          >
            <Link
              href="/sr"
              className="transition hover:text-[var(--accent-dark)]"
            >
              Početna
            </Link>
            <span>/</span>
            <Link
              href="/sr/blog"
              className="transition hover:text-[var(--accent-dark)]"
            >
              Auto magazin
            </Link>
            {post.category && (
              <>
                <span>/</span>
                <Link
                  href={`/sr/blog?category=${encodeURIComponent(post.category.slug)}`}
                  className="transition hover:text-[var(--accent-dark)]"
                >
                  {post.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="line-clamp-1 max-w-[240px] font-bold text-[var(--color-text)] sm:max-w-[360px]">
              {post.title}
            </span>
          </nav>

          <Link
            href="/sr/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-2)] transition hover:text-[var(--accent-dark)]"
          >
            <ArrowLeft size={14} />
            Nazad na sve članke
          </Link>
        </div>
      </div>

      {/* Article Container */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <article className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-xs sm:p-10 lg:p-12">
          {/* Article Header */}
          <header className="mx-auto max-w-3xl space-y-4 border-b border-[var(--color-border)] pb-8">
            {post.category && (
              <div>
                <Link
                  href={`/sr/blog?category=${encodeURIComponent(post.category.slug)}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold text-[var(--accent-dark)] transition hover:bg-[var(--accent)] hover:text-white"
                >
                  <Tag size={12} />
                  {post.category.name}
                </Link>
              </div>
            )}

            <h1
              className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-[2.5rem]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Calendar size={13} className="text-[var(--accent)]" />
                  <time dateTime={post.publishedAt}>
                    {formatSerbianDate(post.publishedAt)}
                  </time>
                </span>

                <span className="inline-flex items-center gap-1.5 font-medium">
                  <User size={13} className="text-[var(--accent)]" />
                  <span>{post.authorName}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[var(--accent)]" />
                  <span>{readingTimeMinutes} min čitanja</span>
                </span>
              </div>

              <BlogShareButton url={canonicalUrl} title={post.title} />
            </div>

            <p className="text-base leading-relaxed font-medium text-[var(--color-text-muted)] sm:text-lg">
              {post.excerpt}
            </p>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <figure className="mx-auto my-8 max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                width={1600}
                height={900}
                fetchPriority="high"
                decoding="async"
                className="max-h-[520px] w-full object-cover"
              />
            </figure>
          )}

          {/* Safe Structured Article Content */}
          <div className="mx-auto mt-8 max-w-3xl">
            <BlogContentRenderer document={post.content} />
          </div>

          {/* Internal Links Footer Box */}
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/60 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2
                  className="text-base font-extrabold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Tražite proveren polovni automobil u Srbiji?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)] sm:text-sm">
                  Pogledajte aktuelnu ponudu vozila sa transparentnom istorijom ili nas
                  kontaktirajte za stručni savet pri izboru.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/sr/inventory"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/85"
                >
                  <Car size={14} />
                  Ponuda vozila
                </Link>
                <Link
                  href="/sr/contact"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-text)] transition hover:border-[var(--accent-border)]"
                >
                  Kontakt
                </Link>
              </div>
            </div>
            {(siloLinks.brands.length > 0 || siloLinks.models.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--accent-border)]/60 pt-4">
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] mr-1">
                  Povezane kategorije:
                </span>
                {siloLinks.models.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/sr/model/${m.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-white px-3 py-1 text-xs font-bold text-[var(--accent-dark)] transition hover:bg-[var(--accent)] hover:text-white"
                  >
                    Polovni {m.fullName}
                  </Link>
                ))}
                {siloLinks.brands.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/sr/cars/${b.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
                  >
                    Polovni {b.displayName}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Related Available Vehicles Section */}
        {post.relatedVehicles.length > 0 && (
          <section className="mt-12 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
                  Aktuelna ponuda na MojAutoDiler
                </span>
                <h2
                  className="mt-1 text-2xl font-extrabold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Povezana dostupna vozila
                </h2>
              </div>

              <Link
                href="/sr/inventory"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-dark)] transition hover:gap-2"
              >
                Pogledaj sva vozila
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {post.relatedVehicles.map((vehicle) => (
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

        {/* Related Articles Section */}
        {post.relatedPosts.length > 0 && (
          <section className="mt-12 space-y-5 border-t border-[var(--color-border)] pt-10">
            <h2
              className="text-2xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Povezani vodiči i članci
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.relatedPosts.map((rel) => (
                <article
                  key={rel.id}
                  className="group flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--accent-border)]"
                >
                  <div className="space-y-2.5">
                    {rel.category && (
                      <span className="inline-block rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--accent-dark)]">
                        {rel.category.name}
                      </span>
                    )}
                    <h3
                      className="text-base font-extrabold text-[var(--color-text)] group-hover:text-[var(--accent-dark)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <Link href={`/sr/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-2)]">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-text-muted)]">
                    <span>{formatSerbianDate(rel.publishedAt)}</span>
                    <Link
                      href={`/sr/blog/${rel.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[var(--accent-dark)]"
                    >
                      Pročitaj
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
