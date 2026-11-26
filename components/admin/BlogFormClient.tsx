'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Tag,
  Car,
  Archive,
  RotateCcw,
  Plus,
  X,
} from 'lucide-react';
import BlogRichTextEditor from '@/components/admin/BlogRichTextEditor';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer';
import VehicleCard from '@/components/vehicle/VehicleCard';
import { slugifySr } from '@/lib/utils';
import { getTranslations } from '@/lib/i18n';
import type {
  BlogCategory,
  BlogContentDocument,
  BlogPostAdminDetail,
  BlogPostStatus,
} from '@/types/blog';
import type { Vehicle } from '@/types/vehicle';

interface Props {
  readonly mode: 'new' | 'edit';
  readonly post?: BlogPostAdminDetail;
  readonly initialCategories: BlogCategory[];
  readonly availableVehicles: Vehicle[];
}

const DEFAULT_EMPTY_DOCUMENT: BlogContentDocument = {
  version: 1,
  blocks: [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: 'Unesite tekst članka ovde...' }],
    },
  ],
};

type EditorTab = 'content' | 'media' | 'seo' | 'vehicles' | 'preview';

export default function BlogFormClient({
  mode,
  post,
  initialCategories,
  availableVehicles,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'sr') as 'sr' | 'sq';
  const t = getTranslations('sr');

  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories);

  // Form fields
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState<BlogContentDocument>(
    post?.content && post.content.blocks.length > 0
      ? post.content
      : DEFAULT_EMPTY_DOCUMENT,
  );
  const [categoryId, setCategoryId] = useState<string>(post?.categoryId ?? '');
  const [authorName, setAuthorName] = useState(
    post?.authorName ?? 'Moj Auto Diler',
  );
  const [status, setStatus] = useState<BlogPostStatus>(post?.status ?? 'draft');

  // Featured image
  const [featuredImage, setFeaturedImage] = useState<string>(
    post?.featuredImage ?? '',
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState<string>(
    post?.featuredImageAlt ?? '',
  );
  const [featuredImageR2Key, setFeaturedImageR2Key] = useState<string | null>(
    post?.featuredImageR2Key ?? null,
  );
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement | null>(null);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? '',
  );
  const [ogImage, setOgImage] = useState(post?.ogImage ?? '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? '');
  const [noindex, setNoindex] = useState<boolean>(post?.noindex ?? false);
  const [noindexManuallyToggled, setNoindexManuallyToggled] = useState(false);

  // Related vehicles
  const [relatedVehicleIds, setRelatedVehicleIds] = useState<string[]>(
    post?.relatedVehicleIds ?? [],
  );
  const [relatedBrand, setRelatedBrand] = useState(post?.relatedBrand ?? '');
  const [relatedModel, setRelatedModel] = useState(post?.relatedModel ?? '');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Quick category creation
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Dirty state & Save feedback
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editorValidationError, setEditorValidationError] = useState<
    string | null
  >(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  // Protect against accidental loss of unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(null);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugifySr(val));
    }
    markDirty();
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugifySr(val));
    markDirty();
  };

  const handleFeaturedUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingFeatured(true);
    setSaveError(null);

    try {
      const presignRes = await fetch('/api/admin/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          scope: 'blog',
          postId: post?.id || undefined,
          kind: 'image',
        }),
      });

      const presignData = (await presignRes.json().catch(() => ({}))) as {
        uploadUrl?: string;
        publicUrl?: string;
        key?: string;
        error?: string;
      };

      if (!presignRes.ok || !presignData.uploadUrl || !presignData.publicUrl) {
        throw new Error(
          presignData.error || `Greška pri pripremi otpremanja (${presignRes.status}).`,
        );
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error(`Otpremanje slike na R2 nije uspelo (${putRes.status}).`);
      }

      setFeaturedImage(presignData.publicUrl);
      setFeaturedImageR2Key(presignData.key ?? null);
      if (!featuredImageAlt.trim() && title.trim()) {
        setFeaturedImageAlt(title.trim());
      }
      markDirty();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Greška pri otpremanju naslovne slike.',
      );
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleCreateQuickCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        category?: BlogCategory;
        error?: string;
      };
      if (!res.ok || !data.category) {
        throw new Error(data.error || 'Greška pri kreiranju kategorije.');
      }
      const created = data.category;
      setCategories((prev) =>
        [...prev.filter((c) => c.id !== created.id), created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setCategoryId(created.id);
      setNewCategoryName('');
      markDirty();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Greška pri kreiranju kategorije.',
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    setRelatedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId],
    );
    markDirty();
  };

  const handleSave = async (targetStatus: BlogPostStatus = status) => {
    setSaveError(null);
    setSaveSuccess(null);

    if (!title.trim()) {
      setSaveError('Naslov članka je obavezan.');
      return;
    }
    const effectiveSlug = slug.trim() || slugifySr(title);
    if (!effectiveSlug) {
      setSaveError('URL slug nije validan.');
      return;
    }
    if (!excerpt.trim()) {
      setSaveError('Kratak opis (excerpt) članka je obavezan.');
      return;
    }
    if (featuredImage.trim() && !featuredImageAlt.trim()) {
      setSaveError('Alt tekst je obavezan kada je postavljena naslovna slika.');
      setActiveTab('media');
      return;
    }
    if (editorValidationError) {
      setSaveError(editorValidationError);
      return;
    }

    setSaving(true);

    try {
      const isTransitioningToPublished =
        targetStatus === 'published' && status !== 'published';
      const isTransitioningOutOfPublished =
        targetStatus !== 'published' && status === 'published';
      const effectiveNoindex = noindexManuallyToggled
        ? noindex
        : isTransitioningToPublished
          ? false
          : isTransitioningOutOfPublished
            ? true
            : noindex;

      const payload = {
        title: title.trim(),
        slug: effectiveSlug,
        excerpt: excerpt.trim(),
        content,
        featuredImage: featuredImage.trim() || null,
        featuredImageAlt: featuredImageAlt.trim() || null,
        featuredImageR2Key: featuredImage.trim() ? featuredImageR2Key : null,
        seoTitle: seoTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImage: ogImage.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        noindex: effectiveNoindex,
        authorName: authorName.trim() || 'Moj Auto Diler',
        categoryId: categoryId || null,
        status: targetStatus,
        relatedBrand: relatedBrand.trim() || null,
        relatedModel: relatedModel.trim() || null,
        relatedVehicleIds,
      };

      const url =
        mode === 'edit' && post?.id
          ? `/api/admin/blog/${post.id}`
          : '/api/admin/blog';
      const method = mode === 'edit' && post?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        post?: BlogPostAdminDetail;
        error?: string;
      };

      if (!res.ok || !data.post) {
        setSaveError(data.error || `Greška pri čuvanju (${res.status}).`);
        return;
      }

      setStatus(data.post.status);
      setSlug(data.post.slug);
      setNoindex(data.post.noindex);
      setNoindexManuallyToggled(false);
      setIsDirty(false);
      setConfirmArchive(false);

      if (mode === 'new') {
        router.push(`/${locale}/admin/blog/${data.post.id}/edit`);
        return;
      }

      setSaveSuccess(
        targetStatus === 'published'
          ? 'Članak je objavljen i javno dostupan na /sr/blog/' + data.post.slug
          : targetStatus === 'archived'
            ? 'Članak je bezbedno arhiviran i uklonjen sa javnog bloga.'
            : 'Nacrt članka je uspešno sačuvan.',
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Mrežna greška pri čuvanju članka.',
      );
    } finally {
      setSaving(false);
    }
  };

  // Active vehicles available for linking (AVAILABLE only)
  const activeVehicles = availableVehicles.filter((v) => v.status === 'active');
  const filteredVehicles = activeVehicles.filter((v) => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  const selectedActiveVehicles = relatedVehicleIds
    .map((id) => activeVehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
      {/* Top Action Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/blog`}
            onClick={(e) => {
              if (
                isDirty &&
                !window.confirm(
                  'Imate nesačuvane izmene. Da li ste sigurni da želite da napustite stranicu?',
                )
              ) {
                e.preventDefault();
              }
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
            title="Nazad na listu članaka"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1
              className="text-xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {mode === 'new' ? 'Novi blog članak' : 'Uredi blog članak'}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Status:{' '}
              <span className="font-bold uppercase">{status}</span>
              {isDirty && (
                <span className="ml-2 text-amber-700">• Nesačuvane izmene</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'published' && slug && (
            <Link
              href={`/sr/blog/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-100"
            >
              <ExternalLink size={14} />
              Javni članak
            </Link>
          )}

          {mode === 'edit' && post?.id && (
            <Link
              href={`/${locale}/admin/blog/${post.id}/preview`}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-xs font-bold text-[var(--color-text-2)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-dark)]"
            >
              <Eye size={14} />
              Admin Pregled
            </Link>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Čuvanje...' : 'Sačuvaj nacrt'}
          </button>

          {status !== 'published' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black/85 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              Objavi članak
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('published')}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black/85 disabled:opacity-50"
              >
                <Save size={14} />
                Sačuvaj izmene
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('draft')}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Vrati u nacrt
              </button>
            </>
          )}

          {mode === 'edit' && status !== 'archived' && (
            confirmArchive ? (
              <div className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
                <span className="text-xs font-bold text-red-700">
                  Potvrdi arhiviranje?
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave('archived')}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white"
                >
                  Arhiviraj
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmArchive(false)}
                  className="px-2 py-1 text-xs font-semibold text-gray-600"
                >
                  Otkaži
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmArchive(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Archive size={14} />
                Arhiviraj
              </button>
            )
          )}
        </div>
      </div>

      {/* Banners */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-800">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3">
        {(
          [
            { id: 'content', label: 'Sadržaj & Tekst', icon: FileText },
            { id: 'media', label: 'Naslovna slika', icon: ImageIcon },
            { id: 'seo', label: 'SEO & Indeksiranje', icon: Tag },
            {
              id: 'vehicles',
              label: `Povezana vozila (${relatedVehicleIds.length})`,
              icon: Car,
            },
            { id: 'preview', label: 'Pregled uživo', icon: Eye },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === id
                ? 'bg-[#11100E] text-white shadow-sm'
                : 'border border-[var(--color-border)] bg-white text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: Content & Basic Fields */}
      {activeTab === 'content' && (
        <div className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Naslov članka (srpski latinica) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="npr. Volkswagen Golf 7 – vodič za kupovinu"
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                URL Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="volkswagen-golf-7-vodic-za-kupovinu"
                  className="input-premium flex-1 rounded-2xl px-3.5 py-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlug(slugifySr(title));
                    setSlugManuallyEdited(false);
                    markDirty();
                  }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-xs font-bold text-[var(--color-text-2)] hover:text-[var(--color-text)]"
                  title="Generiši slug iz naslova"
                >
                  Auto-slug
                </button>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Budući URL: /sr/blog/{slug || slugifySr(title) || '...'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Kategorija
              </label>
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    markDirty();
                  }}
                  className="input-premium flex-1 rounded-2xl px-3.5 py-3 text-sm"
                >
                  <option value="">— Bez kategorije —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova kategorija..."
                  className="input-premium flex-1 rounded-xl px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={creatingCategory || !newCategoryName.trim()}
                  onClick={handleCreateQuickCategory}
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-text-2)] hover:border-[var(--accent-border)] disabled:opacity-50"
                >
                  <Plus size={13} />
                  Dodaj
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Autor
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  markDirty();
                }}
                placeholder="Moj Auto Diler"
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Kratak uvod / Excerpt (prikazuje se na kartici članka) *
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                markDirty();
              }}
              placeholder="Sažet pregled teme članka u 1–3 rečenice..."
              className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Sadržaj članka (H2–H6, paragrafi, liste, citati, tabele, slike, linkovi) *
            </label>
            <BlogRichTextEditor
              value={content}
              postId={post?.id}
              onChange={(nextDoc) => {
                setContent(nextDoc);
                markDirty();
              }}
              onValidationError={setEditorValidationError}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Featured Image */}
      {activeTab === 'media' && (
        <div className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
                Naslovna slika članka (Cloudflare R2 blog/ prostor)
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Podržani formati: JPG, PNG, WebP (maks. 10 MB). Čuva se pod R2 prefiksom{' '}
                <code>blog/</code>.
              </p>
            </div>

            <div>
              <input
                ref={featuredInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFeaturedUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingFeatured}
                onClick={() => featuredInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#11100E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/85 disabled:opacity-50"
              >
                <Upload size={14} />
                {uploadingFeatured ? 'Otpremanje...' : 'Otpremi naslovnu sliku'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                URL naslovne slike
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => {
                  setFeaturedImage(e.target.value);
                  markDirty();
                }}
                placeholder="https://pub-....r2.dev/blog/..."
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Alt tekst naslovne slike (obavezno uz sliku) *
              </label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => {
                  setFeaturedImageAlt(e.target.value);
                  markDirty();
                }}
                placeholder="npr. Volkswagen Golf 7 2.0 TDI na parkingu"
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>
          </div>

          {featuredImage && (
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt={featuredImageAlt || 'Preview'}
                className="max-h-[360px] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFeaturedImage('');
                  setFeaturedImageR2Key(null);
                  markDirty();
                }}
                className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold text-white hover:bg-black"
              >
                <X size={13} />
                Ukloni prikaz
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEO & Indexing */}
      {activeTab === 'seo' && (
        <div className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                SEO Title (opciono — podrazumevano naslov članka)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  markDirty();
                }}
                placeholder={title || 'SEO naslov za Google pretragu'}
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Canonical URL override (opciono)
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => {
                  setCanonicalUrl(e.target.value);
                  markDirty();
                }}
                placeholder="/sr/blog/..."
                className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Meta Description (opciono — podrazumevano Excerpt)
            </label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                markDirty();
              }}
              placeholder={excerpt || 'Opis članka za Google rezultate (do 160 karaktera)...'}
              className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Open Graph slika URL (opciono — podrazumevano naslovna slika)
            </label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => {
                setOgImage(e.target.value);
                markDirty();
              }}
              placeholder={featuredImage || 'https://...'}
              className="input-premium w-full rounded-2xl px-3.5 py-3 text-sm"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 p-4">
            <input
              type="checkbox"
              checked={noindex}
              onChange={(e) => {
                setNoindex(e.target.checked);
                setNoindexManuallyToggled(true);
                markDirty();
              }}
              className="h-4 w-4 rounded accent-[#11100E]"
            />
            <div>
              <div className="text-xs font-bold text-[var(--color-text)]">
                Zabrani indeksiranje ovog članka (<code>noindex</code>)
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                Ako je uključeno, članak neće biti uključen u sitemap.xml i imaće{' '}
                <code>robots: noindex</code>.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* TAB 4: Related Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)]">
              Povezana vozila iz aktivne ponude (samo AVAILABLE vozila)
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Izaberite konkretna aktivna vozila za prikaz uz članak i/ili definišite automatsko
              dopunjavanje po marki i modelu. Prodata (SOLD), skrivena (HIDDEN) i rezervisana
              (RESERVED) vozila se nikada ne prikazuju posetiocima.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Automatska dopuna — Marka (opciono, npr. Volkswagen)
              </label>
              <input
                type="text"
                value={relatedBrand}
                onChange={(e) => {
                  setRelatedBrand(e.target.value);
                  markDirty();
                }}
                placeholder="npr. Volkswagen"
                className="input-premium w-full rounded-2xl px-3.5 py-2.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Automatska dopuna — Model (opciono, npr. Golf)
              </label>
              <input
                type="text"
                value={relatedModel}
                onChange={(e) => {
                  setRelatedModel(e.target.value);
                  markDirty();
                }}
                placeholder="npr. Golf"
                className="input-premium w-full rounded-2xl px-3.5 py-2.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Pretraži aktivna vozila po naslovu, marki ili modelu..."
              className="input-premium w-full rounded-2xl px-3.5 py-2.5 text-xs"
            />

            <div className="max-h-[340px] divide-y divide-[var(--color-border)] overflow-y-auto rounded-2xl border border-[var(--color-border)]">
              {filteredVehicles.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
                  Nema aktivnih (AVAILABLE) vozila koja odgovaraju pretrazi.
                </div>
              ) : (
                filteredVehicles.map((v) => {
                  const checked = relatedVehicleIds.includes(v.id);
                  return (
                    <label
                      key={v.id}
                      className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-black/[0.015]"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVehicleSelection(v.id)}
                          className="h-4 w-4 rounded accent-[#11100E]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[var(--color-text)]">
                            {v.title} ({v.year})
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {v.brand} {v.model} • {v.price.toLocaleString('de-DE')} EUR
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        AVAILABLE
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Live Admin Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6 rounded-3xl border border-[var(--color-border)] bg-white p-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800">
            INTERNI ADMIN PREGLED — Ovaj prikaz je dostupan isključivo prijavljenom administratoru.
          </div>

          <article className="mx-auto max-w-3xl space-y-6">
            <header className="space-y-3 border-b border-[var(--color-border)] pb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                {categories.find((c) => c.id === categoryId)?.name ?? 'Blog'} •{' '}
                {authorName || 'Moj Auto Diler'}
              </div>
              <h1
                className="text-3xl font-extrabold text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title || 'Naslov članka'}
              </h1>
              <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                {excerpt || 'Kratak uvod članka...'}
              </p>
            </header>

            {featuredImage && (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt={featuredImageAlt || title}
                  className="max-h-[460px] w-full object-cover"
                />
              </div>
            )}

            <BlogContentRenderer document={content} />
          </article>

          {selectedActiveVehicles.length > 0 && (
            <section className="border-t border-[var(--color-border)] pt-6">
              <h2
                className="mb-4 text-lg font-extrabold text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Povezana dostupna vozila ({selectedActiveVehicles.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedActiveVehicles.map((vehicle) => (
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
      )}
    </div>
  );
}
