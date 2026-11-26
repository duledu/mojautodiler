import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequestAuthenticated } from '@/lib/admin-auth';
import {
  BlogSlugConflictError,
  createBlogPost,
  listBlogCategories,
  listBlogPostsForAdmin,
  type BlogDatabaseClient,
} from '@/lib/db/blog';
import { BlogContentValidationError } from '@/lib/blog-content';
import type { BlogPostStatus, CreateBlogPostInput } from '@/types/blog';

const ALLOWED_STATUSES = new Set<BlogPostStatus>(['draft', 'published', 'archived']);

function prismaCode(err: unknown): string {
  return (err as { code?: string })?.code ?? '';
}

export async function handleAdminBlogGet(
  request: NextRequest,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get('status')?.trim();
    const status =
      rawStatus && ALLOWED_STATUSES.has(rawStatus as BlogPostStatus)
        ? (rawStatus as BlogPostStatus)
        : undefined;
    const categoryId = searchParams.get('categoryId')?.trim() || undefined;
    const search = searchParams.get('search')?.trim() || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : undefined;

    const [result, categories] = await Promise.all([
      listBlogPostsForAdmin({ status, categoryId, search, page, pageSize }, db),
      listBlogCategories(db),
    ]);

    return NextResponse.json({
      success: true,
      ...result,
      categories,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri učitavanju blog članaka: ${msg}` },
      { status: 500 },
    );
  }
}

export async function handleAdminBlogPost(
  request: NextRequest,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
    const input: CreateBlogPostInput = {
      title: String(body.title ?? ''),
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      locale: 'sr',
      excerpt: String(body.excerpt ?? ''),
      content: body.content as CreateBlogPostInput['content'],
      featuredImage:
        typeof body.featuredImage === 'string' ? body.featuredImage : null,
      featuredImageAlt:
        typeof body.featuredImageAlt === 'string' ? body.featuredImageAlt : null,
      featuredImageR2Key:
        typeof body.featuredImageR2Key === 'string'
          ? body.featuredImageR2Key
          : null,
      seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : null,
      metaDescription:
        typeof body.metaDescription === 'string' ? body.metaDescription : null,
      ogImage: typeof body.ogImage === 'string' ? body.ogImage : null,
      canonicalUrl:
        typeof body.canonicalUrl === 'string' ? body.canonicalUrl : null,
      noindex: Boolean(body.noindex),
      authorName:
        typeof body.authorName === 'string' ? body.authorName : undefined,
      categoryId:
        typeof body.categoryId === 'string' ? body.categoryId : null,
      status: (body.status as BlogPostStatus | undefined) ?? 'draft',
      publishedAt:
        typeof body.publishedAt === 'string' ? body.publishedAt : null,
      relatedBrand:
        typeof body.relatedBrand === 'string' ? body.relatedBrand : null,
      relatedModel:
        typeof body.relatedModel === 'string' ? body.relatedModel : null,
      // carVertical affiliate CTA remains disabled in Phase 2
      affiliateCtaEnabled: false,
      affiliatePlacement: 'none',
      affiliateLabel: null,
      relatedVehicleIds: Array.isArray(body.relatedVehicleIds)
        ? body.relatedVehicleIds.map((v) => String(v))
        : undefined,
      relatedPostIds: Array.isArray(body.relatedPostIds)
        ? body.relatedPostIds.map((p) => String(p))
        : undefined,
    };

    const post = await createBlogPost(input, db);
    try { revalidatePath('/sitemap.xml'); } catch { /* unit test context */ }
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err) {
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
      { success: false, error: `Greška pri čuvanju članka: ${msg}` },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleAdminBlogGet(request);
}

export async function POST(request: NextRequest) {
  return handleAdminBlogPost(request);
}
