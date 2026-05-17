import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import QRCode from 'qrcode';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin-auth';
import { getVehicleById } from '@/lib/db/vehicles';
import { generateMarketingStyle } from '@/lib/ai/marketing';

/**
 * POST /api/admin/vehicles/[id]/marketing-image
 *
 * Returns all data required for client-side marketing poster composition:
 * - vehicle fields (title, specs, price, dealer, slug …)
 * - AI-generated style (theme, accentColor, tagline)
 * - QR code as a data URL (generated server-side for reliability)
 * - resolved listing URL
 *
 * Client (MarketingImageGenerator) fetches the primary image through
 * /api/admin/proxy-image to avoid canvas CORS issues, then composes
 * the final poster with html-to-image.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Validate env ────────────────────────────────────────────────────────────
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured.' },
      { status: 500 },
    );
  }

  // ── Load vehicle ────────────────────────────────────────────────────────────
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  // ── Require primary image ───────────────────────────────────────────────────
  const primaryImageUrl = vehicle.images[0]?.url ?? null;
  if (!primaryImageUrl) {
    return NextResponse.json(
      { error: 'Vozilo nema postavljenu sliku. Dodajte sliku pre generisanja marketinškog materijala.' },
      { status: 422 },
    );
  }

  // ── Build listing URL ───────────────────────────────────────────────────────
  const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mojautodiler.rs').replace(/\/$/, '');
  const listingUrl = `${siteOrigin}/sr/vehicle/${vehicle.slug}`;

  // ── Generate QR code (server-side — reliable, no client CORS issues) ────────
  let qrDataUrl: string;
  try {
    qrDataUrl = await QRCode.toDataURL(listingUrl, {
      width:  320,
      margin: 1,
      color:  { dark: '#080809', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('[Marketing Image] QR generation failed:', err);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }

  // ── AI style generation (non-blocking fallback on error) ────────────────────
  const style = await generateMarketingStyle({
    brand:        vehicle.brand,
    model:        vehicle.model,
    year:         vehicle.year,
    color:        vehicle.color,
    price:        vehicle.price,
    currency:     vehicle.currency,
    fuelType:     vehicle.fuelType,
    transmission: vehicle.transmission,
    mileage:      vehicle.mileage,
  });

  // ── Build safe vehicle subset for client ────────────────────────────────────
  // Never expose internal DB IDs, dealer notes, or PII beyond what the
  // public listing page already shows.
  const vehicleData = {
    id:           vehicle.id,
    slug:         vehicle.slug,
    title:        vehicle.title,
    brand:        vehicle.brand,
    model:        vehicle.model,
    generation:   vehicle.generation ?? '',
    year:         vehicle.year,
    mileage:      vehicle.mileage,
    price:        vehicle.price,
    currency:     vehicle.currency,
    fuelType:     vehicle.fuelType,
    transmission: vehicle.transmission,
    color:        vehicle.color,
    featured:     vehicle.featured,
    dealerName:   vehicle.dealer?.name ?? vehicle.contactName ?? 'Moj Auto Diler',
    dealerPhone:  vehicle.contactPhone ?? vehicle.dealer?.phone ?? '',
  };

  return NextResponse.json({
    vehicle:         vehicleData,
    primaryImageUrl,
    listingUrl,
    qrDataUrl,
    style,
    /** Truthy when OPENAI_API_KEY is present — lets the UI say "AI-styled" */
    aiEnabled: Boolean(process.env.OPENAI_API_KEY),
  });
}
