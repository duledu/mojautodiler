import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequestAuthenticated } from '@/lib/admin-auth';
import {
  listBlogCategories,
  upsertBlogCategory,
  type BlogDatabaseClient,
} from '@/lib/db/blog';
import { BlogContentValidationError } from '@/lib/blog-content';

export async function handleAdminBlogCategoriesGet(
  request: NextRequest,
  db?: BlogDatabaseClient,
): Promise<NextResponse> {
  const authenticated = await isAdminRequestAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await listBlogCategories(db);
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri učitavanju kategorija: ${msg}` },
      { status: 500 },
    );
  }
}

export async function handleAdminBlogCategoriesPost(
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

  try {
    const category = await upsertBlogCategory(
      {
        name: String(body.name ?? ''),
        slug: typeof body.slug === 'string' ? body.slug : undefined,
        description:
          typeof body.description === 'string' ? body.description : null,
      },
      db,
    );
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    if (err instanceof BlogContentValidationError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 422 },
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Greška pri čuvanju kategorije: ${msg}` },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleAdminBlogCategoriesGet(request);
}

export async function POST(request: NextRequest) {
  return handleAdminBlogCategoriesPost(request);
}
