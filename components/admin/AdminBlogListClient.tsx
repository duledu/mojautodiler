'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Eye,
  ExternalLink,
  Archive,
  CheckCircle2,
  FileText,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { slugifySr } from '@/lib/utils';
import type {
  BlogCategory,
  BlogPostAdminSummary,
  BlogPostStatus,
} from '@/types/blog';

interface Props {
  readonly initialPosts: BlogPostAdminSummary[];
  readonly initialCategories: BlogCategory[];
}

const STATUS_BADGE: Record<
  BlogPostStatus,
  { label: string; cls: string }
> = {
  draft: {
    label: 'Draft (Nacrt)',
    cls: 'bg-amber-50 text-amber-800 border border-amber-200',
  },
  published: {
    label: 'Objavljeno',
    cls: 'bg-green-50 text-green-700 border border-green-200',
  },
  archived: {
    label: 'Arhivirano',
    cls: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
};

const PAGE_SIZE = 10;

export default function AdminBlogListClient({
  initialPosts,
  initialCategories,
}: Props) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sr';

  const [posts, setPosts] = useState<BlogPostAdminSummary[]>(initialPosts);
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogPostStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // Category Manager state
  const [showCategories, setShowCategories] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  const filtered = posts.filter((post) => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && post.categoryId !== categoryFilter) {
      return false;
    }
    const q = search.trim().toLowerCase();
    if (
      q &&
      !post.title.toLowerCase().includes(q) &&
      !post.slug.toLowerCase().includes(q) &&
      !post.excerpt.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updatePostStatus = async (id: string, nextStatus: BlogPostStatus) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        post?: BlogPostAdminSummary;
        error?: string;
      };
      if (!res.ok || !data.post) {
        throw new Error(data.error || `Greška (${res.status})`);
      }
      setPosts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data.post } : item)),
      );
      setConfirmArchiveId(null);
      setFeedback({
        type: 'ok',
        text:
          nextStatus === 'published'
            ? 'Članak je uspešno objavljen i dostupan na javnoj stranici /sr/blog.'
            : nextStatus === 'archived'
              ? 'Članak je bezbedno arhiviran i uklonjen sa javnog bloga.'
              : 'Članak je vraćen u nacrt (Draft) i sakriven sa javnog bloga.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Greška pri promeni statusa.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName.trim(),
          slug: catSlug.trim() || slugifySr(catName),
          description: catDesc.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        category?: BlogCategory;
        error?: string;
      };
      if (!res.ok || !data.category) {
        throw new Error(data.error || `Greška (${res.status})`);
      }
      const savedCat = data.category;
      setCategories((prev) => {
        const exists = prev.some((c) => c.id === savedCat.id);
        const next = exists
          ? prev.map((c) => (c.id === savedCat.id ? savedCat : c))
          : [...prev, savedCat];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setFeedback({
        type: 'ok',
        text: `Kategorija "${savedCat.name}" (${savedCat.slug}) je sačuvana.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text:
          err instanceof Error ? err.message : 'Greška pri čuvanju kategorije.',
      });
    } finally {
      setCatSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-2xl font-extrabold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Blog Manager
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Upravljanje SEO člancima, kategorijama i povezanim vozilima (srpski latinica)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCategories((v) => !v)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
          >
            <FolderPlus size={15} />
            Kategorije ({categories.length})
          </button>

          <Link
            href={`/${locale}/admin/blog/new`}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black/85"
          >
            <Plus size={15} />
            Novi članak
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'ok' ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            {feedback.text}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline"
          >
            Zatvori
          </button>
        </div>
      )}

      {/* Category Management Panel */}
      {showCategories && (
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-xs">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
            Upravljanje kategorijama bloga
          </h2>

          <form
            onSubmit={handleSaveCategory}
            className="mb-4 grid gap-3 sm:grid-cols-4"
          >
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => {
                setCatName(e.target.value);
                if (!catSlug) {
                  // Auto-preview slug in placeholder
                }
              }}
              placeholder="Naziv kategorije (npr. Vodiči za kupovinu)"
              className="input-premium rounded-2xl px-3 py-2.5 text-xs"
            />
            <input
              type="text"
              value={catSlug}
              onChange={(e) => setCatSlug(slugifySr(e.target.value))}
              placeholder={
                catName
                  ? `Slug: ${slugifySr(catName)}`
                  : 'Slug (automatski iz naziva)'
              }
              className="input-premium rounded-2xl px-3 py-2.5 text-xs"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Kratak opis kategorije (opciono)"
              className="input-premium rounded-2xl px-3 py-2.5 text-xs"
            />
            <button
              type="submit"
              disabled={catSaving || !catName.trim()}
              className="rounded-2xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/85 disabled:opacity-50"
            >
              {catSaving ? 'Čuvanje...' : 'Sačuvaj kategoriju'}
            </button>
          </form>

          {categories.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Još nema kreiranih kategorija.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 px-3 py-1.5 text-xs"
                >
                  <span className="font-bold text-[var(--color-text)]">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    /{cat.slug}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Pretraži po naslovu, slugu ili opisu..."
            className="input-premium w-full rounded-2xl py-2.5 pr-3 pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'draft', 'published', 'archived'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#11100E] text-white'
                  : 'border border-[var(--color-border)] bg-white text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {st === 'all'
                ? 'Svi statusi'
                : st === 'draft'
                  ? 'Nacrti'
                  : st === 'published'
                    ? 'Objavljeni'
                    : 'Arhivirani'}
            </button>
          ))}

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="input-premium rounded-xl px-3 py-2 text-xs"
          >
            <option value="all">Sve kategorije</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Article Table */}
      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <FileText size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-bold text-[var(--color-text)]">
              Nema pronađenih blog članaka
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Kreirajte novi članak ili promenite filtere pretrage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="px-4 py-3.5">Članak</th>
                  <th className="px-4 py-3.5">Kategorija</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Izmenjeno</th>
                  <th className="px-4 py-3.5 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {paginated.map((post) => {
                  const badge = STATUS_BADGE[post.status] ?? STATUS_BADGE.draft;
                  const isBusy = busyId === post.id;

                  return (
                    <tr key={post.id} className="hover:bg-black/[0.015]">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[var(--color-text)]">
                          {post.title}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                          /sr/blog/{post.slug}
                          {post.noindex && (
                            <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              noindex
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--color-text-2)]">
                        {post.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">
                        {new Date(post.updatedAt).toLocaleDateString('sr-Latn-RS')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'published' && (
                            <Link
                              href={`/sr/blog/${post.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-100"
                              title="Otvori javni članak u novoj kartici"
                            >
                              <ExternalLink size={13} />
                              <span>Javni URL</span>
                            </Link>
                          )}

                          <Link
                            href={`/${locale}/admin/blog/${post.id}/preview`}
                            className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
                            title="Pregled članka (samo za admina)"
                          >
                            <Eye size={13} />
                            <span>Pregled</span>
                          </Link>

                          <Link
                            href={`/${locale}/admin/blog/${post.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
                            title="Uredi članak"
                          >
                            <Edit2 size={13} />
                            <span>Uredi</span>
                          </Link>

                          {post.status === 'draft' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => updatePostStatus(post.id, 'published')}
                              className="inline-flex items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} />
                              <span>Objavi</span>
                            </button>
                          )}

                          {post.status === 'published' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => updatePostStatus(post.id, 'draft')}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              <span>U nacrt</span>
                            </button>
                          )}

                          {post.status !== 'archived' ? (
                            confirmArchiveId === post.id ? (
                              <div className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 py-1">
                                <span className="text-[11px] font-bold text-red-700">
                                  Arhiviraj?
                                </span>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    updatePostStatus(post.id, 'archived')
                                  }
                                  className="rounded-lg bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white"
                                >
                                  Da
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmArchiveId(null)}
                                  className="px-1.5 py-0.5 text-[11px] font-semibold text-gray-600"
                                >
                                  Ne
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setConfirmArchiveId(post.id)}
                                className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                title="Arhiviraj članak"
                              >
                                <Archive size={13} />
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => updatePostStatus(post.id, 'draft')}
                              className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-2)] transition hover:bg-[var(--color-surface-2)]"
                            >
                              <RotateCcw size={13} />
                              <span>Vrati u nacrt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-muted)]">
            <span>
              Strana {currentPage} od {totalPages} (ukupno {filtered.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 font-semibold disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Prethodna
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-1.5 font-semibold disabled:opacity-40"
              >
                Sledeća
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
