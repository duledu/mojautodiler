import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequestAuthenticated } from '@/lib/admin-auth';
import {
  archiveBlogPost,
  BlogNotFoundError,
  BlogSlugConflictError,
  getBlogPostByIdForAdmin,
  updateBlogPost,
  type BlogDatabaseClient,
} from '@/lib/db/blog';
import { BlogContentValidationError } from '@/lib/blog-content';
import type { BlogPostStatus, UpdateBlogPostInput } from '@/types/blog';

const ALLOWED_STATUSES = new Set<BlogPostStatus>(['draft', 'published', 'archived']);

function prismaCode(err: unknown): string {
  return (err as { code?: string })?.code ?? '';
}

export async function handleAdminBlogDetailGet(
  request: NextRequest,
  id: string,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!id || !id.trim()) {
    return NextResponse.json(
      { success: false, error: 'ID članka je obavezan.' },
      { status: 400 },
    );
  }

  try {
    const post = await getBlogPostByIdForAdmin(id.trim(), db);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Članak nije pronađen.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, post });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri učitavanju članka: ${msg}` },
      { status: 500 },
    );
  }
}

export async function handleAdminBlogDetailPut(
  request: NextRequest,
  id: string,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!id || !id.trim()) {
    return NextResponse.json(
      { success: false, error: 'ID članka je obavezan.' },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Nevalidan JSON format zahteva.' },
      { status: 400 },
    );
  }

  if (
    body.status !== undefined &&
    !ALLOWED_STATUSES.has(String(body.status) as BlogPostStatus)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: 'Nevalidan status članka. Dozvoljeni statusi: draft, published, archived.',
      },
      { status: 422 },
    );
  }

  try {
    const input: UpdateBlogPostInput = {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.slug !== undefined ? { slug: String(body.slug) } : {}),
      ...(body.excerpt !== undefined ? { excerpt: String(body.excerpt) } : {}),
      ...(body.content !== undefined
        ? { content: body.content as UpdateBlogPostInput['content'] }
        : {}),
      ...(body.featuredImage !== undefined
        ? {
            featuredImage:
              typeof body.featuredImage === 'string' ? body.featuredImage : null,
          }
        : {}),
      ...(body.featuredImageAlt !== undefined
        ? {
            featuredImageAlt:
              typeof body.featuredImageAlt === 'string'
                ? body.featuredImageAlt
                : null,
          }
        : {}),
      ...(body.featuredImageR2Key !== undefined
        ? {
            featuredImageR2Key:
              typeof body.featuredImageR2Key === 'string'
                ? body.featuredImageR2Key
                : null,
          }
        : {}),
      ...(body.seoTitle !== undefined
        ? { seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null }
        : {}),
      ...(body.metaDescription !== undefined
        ? {
            metaDescription:
              typeof body.metaDescription === 'string'
                ? body.metaDescription
                : null,
          }
        : {}),
      ...(body.ogImage !== undefined
        ? { ogImage: typeof body.ogImage === 'string' ? body.ogImage : null }
        : {}),
      ...(body.canonicalUrl !== undefined
        ? {
            canonicalUrl:
              typeof body.canonicalUrl === 'string' ? body.canonicalUrl : null,
          }
        : {}),
      ...(body.noindex !== undefined ? { noindex: Boolean(body.noindex) } : {}),
      ...(body.authorName !== undefined
        ? {
            authorName:
              typeof body.authorName === 'string'
                ? body.authorName
                : 'Moj Auto Diler',
          }
        : {}),
      ...(body.categoryId !== undefined
        ? {
            categoryId:
              typeof body.categoryId === 'string' ? body.categoryId : null,
          }
        : {}),
      ...(body.status !== undefined
        ? { status: body.status as BlogPostStatus }
        : {}),
      ...(body.publishedAt !== undefined
        ? {
            publishedAt:
              typeof body.publishedAt === 'string' ? body.publishedAt : null,
          }
        : {}),
      ...(body.relatedBrand !== undefined
        ? {
            relatedBrand:
              typeof body.relatedBrand === 'string' ? body.relatedBrand : null,
          }
        : {}),
      ...(body.relatedModel !== undefined
        ? {
            relatedModel:
              typeof body.relatedModel === 'string' ? body.relatedModel : null,
          }
        : {}),
      ...(Array.isArray(body.relatedVehicleIds)
        ? { relatedVehicleIds: body.relatedVehicleIds.map((v) => String(v)) }
        : {}),
      ...(Array.isArray(body.relatedPostIds)
        ? { relatedPostIds: body.relatedPostIds.map((p) => String(p)) }
        : {}),
    };

    const post = await updateBlogPost(id.trim(), input, db);
    try {
      revalidatePath('/sitemap.xml');
      revalidatePath('/sr/blog');
      revalidatePath(`/sr/blog/${post.slug}`);
    } catch { /* unit test context */ }
    return NextResponse.json({ success: true, post });
  } catch (err) {
    if (err instanceof BlogNotFoundError || prismaCode(err) === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Članak nije pronađen.' },
        { status: 404 },
      );
    }
    if (err instanceof BlogSlugConflictError || prismaCode(err) === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error:
            err instanceof BlogSlugConflictError
              ? `URL slug "${err.slug}" je već zauzet. Izaberite drugačiji slug.`
              : 'Ovaj URL slug je već zauzet.',
        },
        { status: 409 },
      );
    }
    if (err instanceof BlogContentValidationError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 422 },
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri ažuriranju članka: ${msg}` },
      { status: 500 },
    );
  }
}

export async function handleAdminBlogDetailDelete(
  request: NextRequest,
  id: string,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!id || !id.trim()) {
    return NextResponse.json(
      { success: false, error: 'ID članka je obavezan.' },
      { status: 400 },
    );
  }

  try {
    const post = await archiveBlogPost(id.trim(), db);
    try {
      revalidatePath('/sitemap.xml');
      revalidatePath('/sr/blog');
      revalidatePath(`/sr/blog/${post.slug}`);
    } catch { /* unit test context */ }
    return NextResponse.json({ success: true, post });
  } catch (err) {
    if (err instanceof BlogNotFoundError || prismaCode(err) === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Članak nije pronađen.' },
        { status: 404 },
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri arhiviranju članka: ${msg}` },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleAdminBlogDetailGet(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleAdminBlogDetailPut(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleAdminBlogDetailDelete(request, id);
}
