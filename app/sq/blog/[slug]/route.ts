import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBlogPostBySlug } from '@/lib/db/blog';

export const dynamic = 'force-dynamic';

async function handleSqBlog(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const post = await getPublishedBlogPostBySlug(slug);

  // Non-existent, draft, archived, or future-dated blog posts must return
  // a direct HTTP 404 with zero redirect hops.
  if (!post) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const encodedSlug = encodeURIComponent(post.slug);
  const destination = `/sr/blog/${encodedSlug}${request.nextUrl.search}`;
  return new NextResponse(null, {
    status: 308,
    headers: { Location: destination },
  });
}

export async function GET(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  return handleSqBlog(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  return handleSqBlog(request, context);
}
