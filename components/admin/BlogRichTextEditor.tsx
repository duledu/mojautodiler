'use client';

import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Blockquote from '@tiptap/extension-blockquote';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Pilcrow,
} from 'lucide-react';
import {
  blogDocumentToTiptapJson,
  tiptapJsonToBlogDocument,
} from '@/lib/blog-tiptap-adapter';
import { sanitizeBlogImageUrl, sanitizeBlogLinkUrl } from '@/lib/blog-content';
import type { BlogContentDocument, BlogHeadingLevel } from '@/types/blog';

// Extend Tiptap nodes/marks so all Phase 1 BlogContentDocument attributes round-trip losslessly
const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      citation: {
        default: null,
      },
    };
  },
});

const CustomLink = LinkExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      sponsored: {
        default: false,
      },
      openInNewTab: {
        default: null,
      },
    };
  },
});

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
      },
      r2Key: {
        default: null,
      },
    };
  },
});

const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
      },
    };
  },
});

interface Props {
  readonly value: BlogContentDocument;
  readonly postId?: string;
  readonly onChange: (doc: BlogContentDocument) => void;
  readonly onValidationError?: (msg: string | null) => void;
}

export default function BlogRichTextEditor({
  value,
  postId,
  onChange,
  onValidationError,
}: Props) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkHref, setLinkHref] = useState('');
  const [linkError, setLinkError] = useState('');

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageR2Key, setImageR2Key] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4, 5, 6],
        },
        blockquote: false,
        link: false,
      }),
      CustomBlockquote,
      CustomLink.configure({
        openOnClick: false,
        autolink: false,
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),
      CustomTable.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: blogDocumentToTiptapJson(value),
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[360px] px-4 py-4 text-sm text-[var(--color-text)] focus:outline-none [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-base [&_h4]:font-bold [&_p]:my-2.5 [&_p]:leading-relaxed [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)] [&_blockquote]:bg-[var(--accent-soft)]/40 [&_blockquote]:px-4 [&_blockquote]:py-2.5 [&_blockquote]:italic [&_a]:font-semibold [&_a]:text-[var(--accent-dark)] [&_a]:underline [&_img]:my-4 [&_img]:max-h-[340px] [&_img]:rounded-xl [&_img]:border [&_img]:border-[var(--color-border)] [&_img]:object-cover [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[var(--color-border)] [&_th]:bg-[var(--color-surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-3 [&_td]:py-2',
      },
    },
    onUpdate: ({ editor: ed }) => {
      try {
        const nextDoc = tiptapJsonToBlogDocument(ed.getJSON());
        onChange(nextDoc);
        onValidationError?.(null);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Sadržaj članka nije validan.';
        onValidationError?.(msg);
      }
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[360px] rounded-2xl border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-text-muted)]">
        Učitavanje editora...
      </div>
    );
  }

  const toggleHeading = (level: BlogHeadingLevel) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href ?? '';
    setLinkHref(String(previousUrl));
    setLinkError('');
    setLinkModalOpen(true);
  };

  const applyLink = () => {
    const trimmed = linkHref.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkModalOpen(false);
      return;
    }

    const safeHref = sanitizeBlogLinkUrl(trimmed);
    if (!safeHref) {
      setLinkError(
        'Unesite bezbedan URL (npr. https://... ili internu putanju /sr/vozila).',
      );
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: safeHref,
        target: safeHref.startsWith('/') ? null : '_blank',
        rel: safeHref.startsWith('/') ? null : 'noopener noreferrer',
      })
      .run();

    setLinkModalOpen(false);
  };

  const handleInlineImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImageUploading(true);
    setImageError('');

    try {
      const presignRes = await fetch('/api/admin/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          scope: 'blog',
          postId: postId || undefined,
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
        throw new Error(`Otpremanje na R2 nije uspelo (${putRes.status}).`);
      }

      setImageSrc(presignData.publicUrl);
      setImageR2Key(presignData.key ?? null);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : 'Greška pri otpremanju slike.',
      );
    } finally {
      setImageUploading(false);
    }
  };

  const insertImageIntoEditor = () => {
    const safeSrc = sanitizeBlogImageUrl(imageSrc);
    if (!safeSrc) {
      setImageError('Unesite validnu sliku (otpremite fajl ili unesite https:// URL).');
      return;
    }
    const cleanAlt = imageAlt.trim();
    if (!cleanAlt) {
      setImageError('Alt tekst slike je obavezan zbog SEO-a i pristupačnosti.');
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'image',
        attrs: {
          src: safeSrc,
          alt: cleanAlt,
          title: imageCaption.trim() || null,
          caption: imageCaption.trim() || null,
          r2Key: imageR2Key,
        },
      })
      .run();

    setImageModalOpen(false);
    setImageSrc('');
    setImageAlt('');
    setImageCaption('');
    setImageR2Key(null);
    setImageError('');
  };

  const btnCls = (active = false) =>
    `inline-flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
      active
        ? 'bg-[#11100E] text-white shadow-sm'
        : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
    }`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnCls(editor.isActive('paragraph'))}
          title="Paragraf"
        >
          <Pilcrow size={14} />
          <span>P</span>
        </button>

        {([2, 3, 4, 5, 6] as BlogHeadingLevel[]).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => toggleHeading(lvl)}
            className={btnCls(editor.isActive('heading', { level: lvl }))}
            title={`Podnaslov H${lvl}`}
          >
            {lvl === 2 ? (
              <Heading2 size={14} />
            ) : lvl === 3 ? (
              <Heading3 size={14} />
            ) : lvl === 4 ? (
              <Heading4 size={14} />
            ) : null}
            <span>H{lvl}</span>
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive('bold'))}
          title="Podebljano (Bold)"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive('italic'))}
          title="Kurziv (Italic)"
        >
          <Italic size={14} />
        </button>

        <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnCls(editor.isActive('bulletList'))}
          title="Lista sa tačkama"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnCls(editor.isActive('orderedList'))}
          title="Numerisana lista"
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnCls(editor.isActive('blockquote'))}
          title="Citat (Blockquote)"
        >
          <Quote size={14} />
        </button>

        <span className="mx-1 h-5 w-px bg-[var(--color-border)]" />

        <button
          type="button"
          onClick={openLinkModal}
          className={btnCls(editor.isActive('link'))}
          title="Dodaj ili izmeni link"
        >
          <LinkIcon size={14} />
          <span>Link</span>
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={btnCls(false)}
            title="Ukloni link"
          >
            <Unlink size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setImageError('');
            setImageModalOpen(true);
          }}
          className={btnCls(false)}
          title="Ubaci sliku u članak"
        >
          <ImageIcon size={14} />
          <span>Slika</span>
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={btnCls(editor.isActive('table'))}
          title="Ubaci tabelu (3x3)"
        >
          <TableIcon size={14} />
          <span>Tabela</span>
        </button>

        {editor.isActive('table') && (
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2 py-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-1 text-[11px] font-bold text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              title="Dodaj red"
            >
              +Red
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-1 text-[11px] font-bold text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              title="Dodaj kolonu"
            >
              +Kol
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700"
              title="Obriši red"
            >
              -Red
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="inline-flex items-center gap-0.5 px-1.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700"
              title="Obriši tabelu"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Inline Link Dialog */}
      {linkModalOpen && (
        <div className="border-b border-[var(--color-border)] bg-amber-50/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={linkHref}
              onChange={(e) => setLinkHref(e.target.value)}
              placeholder="https://... ili /sr/vozila"
              className="input-premium flex-1 rounded-xl px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={applyLink}
              className="rounded-xl bg-[#11100E] px-3 py-2 text-xs font-bold text-white transition hover:bg-black/85"
            >
              Primeni link
            </button>
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]"
            >
              Otkaži
            </button>
          </div>
          {linkError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600">
              <AlertCircle size={13} />
              {linkError}
            </p>
          )}
        </div>
      )}

      {/* Inline Image Dialog */}
      {imageModalOpen && (
        <div className="space-y-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Ubaci sliku u članak (Cloudflare R2 blog/ prostor)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInlineImageFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={imageUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent-dark)] transition hover:bg-[var(--accent)] hover:text-white disabled:opacity-50"
            >
              <Upload size={13} />
              {imageUploading ? 'Otpremanje...' : 'Otpremi sliku sa računara'}
            </button>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              value={imageSrc}
              onChange={(e) => setImageSrc(e.target.value)}
              placeholder="URL slike (https://...)"
              className="input-premium rounded-xl px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Alt opis slike (obavezno)*"
              className="input-premium rounded-xl px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Potpis ispod slike (opciono)"
              className="input-premium rounded-xl px-3 py-2 text-xs"
            />
          </div>

          {imageError && (
            <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <AlertCircle size={13} />
              {imageError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]"
            >
              Otkaži
            </button>
            <button
              type="button"
              disabled={imageUploading}
              onClick={insertImageIntoEditor}
              className="inline-flex items-center gap-1 rounded-xl bg-[#11100E] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-black/85 disabled:opacity-50"
            >
              <Plus size={13} />
              Ubaci sliku
            </button>
          </div>
        </div>
      )}

      {/* Editor Surface */}
      <EditorContent editor={editor} />
    </div>
  );
}
