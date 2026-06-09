/**
 * GA4 custom event helper — MojAutoDiler
 *
 * Mirrors the pattern in lib/meta-pixel.ts: safe no-op callers that work
 * even when window.gtag is not yet loaded (SSR, blocked scripts, no ID set).
 *
 * Usage:
 *   import { trackGA4Event } from '@/lib/ga4';
 *   trackGA4Event('phone_click', { vehicle_id: vehicle.id, ... });
 *
 * PRIVACY: never pass user-entered form content (message text, email, name)
 * as event parameters — only structural vehicle/dealer metadata.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

function isGa4Enabled(): boolean {
  return Boolean(GA_ID);
}

type Params = Record<string, string | number | boolean | null | undefined>;

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(...args);
}

/**
 * Send a custom GA4 event.
 * Silent no-op when GA4 is not configured, not yet loaded, or called from SSR.
 */
export function trackGA4Event(eventName: string, params?: Params): void {
  if (!isGa4Enabled()) return;
  gtag('event', eventName, { send_to: GA_ID, ...params });
}
