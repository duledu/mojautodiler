import { NextRequest, NextResponse } from 'next/server';
import { getPublicVehicleBySlug } from '@/lib/db/vehicles';

export const dynamic = 'force-dynamic';

async function handleSqVehicle(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const vehicle = await getPublicVehicleBySlug(slug);

  if (!vehicle) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const encodedSlug = encodeURIComponent(vehicle.slug);
  const destination = `/sr/vehicle/${encodedSlug}${request.nextUrl.search}`;
  return new NextResponse(null, {
    status: 308,
    headers: { Location: destination },
  });
}

export async function GET(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  return handleSqVehicle(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { readonly params: Promise<{ slug: string }> },
) {
  return handleSqVehicle(request, context);
}
