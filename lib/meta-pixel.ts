/**
 * Meta Pixel (Meta Ads) utility — MojAutoDiler
 *
 * Pixel / Dataset ID: 1312301523740484
 * Ad Account:         4454959194793844
 * Business Manager:   26968405266187000
 *
 * Browser-only integration. No Conversions API (CAPI) yet.
 * All calls are no-ops when fbq is not loaded (SSR, script blocked).
 *
 * Usage:
 *   import { trackViewContent } from '@/lib/meta-pixel';
 *   trackViewContent({ id: vehicle.id, name: vehicle.title, value: vehicle.price });
 */

// ── Config ────────────────────────────────────────────────────────────────────

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1312301523740484';

// Set NEXT_PUBLIC_META_PIXEL_DISABLED=true in staging/preview to silence events.
export function isPixelEnabled(): boolean {
  return process.env.NEXT_PUBLIC_META_PIXEL_DISABLED !== 'true';
}

// ── fbq type ──────────────────────────────────────────────────────────────────

type FbqParams = Record<string, string | number | boolean | string[] | undefined>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FbqFn = (...args: any[]) => void;

declare global {
  // fbq is added to globalThis by the Meta Pixel base script.
  var fbq: FbqFn | undefined;
}

/** Safe fbq caller — silently no-ops if the script hasn't loaded yet. */
function fbq(action: string, event: string, params?: FbqParams): void {
  if (typeof globalThis.fbq === 'function') {
    globalThis.fbq(action, event, params);
  }
}

// ── Event helpers ─────────────────────────────────────────────────────────────

/**
 * PageView — fired automatically on every route change by MetaPixelProvider.
 * Call manually only if you need to fire it outside the provider context.
 */
export function trackPageView(): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'PageView');
}

/**
 * ViewContent — fire on vehicle detail pages.
 * Maps to the Meta "ViewContent" standard event.
 */
export function trackViewContent(params: {
  readonly id:       string;
  readonly name:     string;
  readonly category?: string;
  readonly value?:   number;
  readonly currency?: string;
}): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'ViewContent', {
    content_ids:  [params.id],
    content_name: params.name,
    content_type: params.category ?? 'vehicle',
    value:        params.value,
    currency:     params.currency ?? 'EUR',
  });
}

/**
 * Lead — fire when a contact form is submitted or a phone/WhatsApp click occurs.
 */
export function trackLead(params?: {
  readonly contentName?: string;
  readonly value?:       number;
  readonly currency?:    string;
}): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'Lead', {
    content_name: params?.contentName,
    value:        params?.value,
    currency:     params?.currency ?? 'EUR',
  });
}

/**
 * Contact — fire when the user opens the contact form or taps a contact CTA.
 */
export function trackContact(): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'Contact');
}

/**
 * Search — fire when the user searches or filters the inventory.
 */
export function trackSearch(searchString: string): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'Search', { search_string: searchString });
}

/**
 * Purchase — reserved for future use (Conversions API recommended alongside).
 */
export function trackPurchase(params: {
  readonly id:       string;
  readonly name:     string;
  readonly value:    number;
  readonly currency?: string;
}): void {
  if (!isPixelEnabled()) return;
  fbq('track', 'Purchase', {
    content_ids:  [params.id],
    content_name: params.name,
    value:        params.value,
    currency:     params.currency ?? 'EUR',
  });
}
