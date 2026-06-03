/**
 * UTM attribution capture — MojAutoDiler
 *
 * Stores UTM params from the landing URL in sessionStorage so they survive
 * SPA navigation. When a lead action fires on a vehicle page the UTMs from
 * the original Instagram/Facebook ad click are still available.
 *
 * Data shape stored in sessionStorage under key 'mad_utm':
 * {
 *   utm_source:   'instagram' | 'facebook' | 'google' | …
 *   utm_medium:   'paid' | 'social' | 'cpc' | …
 *   utm_campaign: 'golf-7-promo' | …
 *   utm_content:  optional
 *   utm_term:     optional
 *   referrer:     'https://www.instagram.com/' | …
 *   landingPage:  '/sr'  ← the path the user first landed on
 *   capturedAt:   ISO timestamp
 * }
 */

const SESSION_KEY = 'mad_utm';

export interface UtmData {
  utm_source?:   string;
  utm_medium?:   string;
  utm_campaign?: string;
  utm_content?:  string;
  utm_term?:     string;
  referrer?:     string;
  landingPage?:  string;
  capturedAt?:   string;
}

/**
 * Call on every page load / route change.
 *
 * If the current URL contains UTM params they are persisted to sessionStorage,
 * replacing any previous entry (a fresh ad click overrides the old one).
 * If the current URL has NO UTM params and sessionStorage is still empty,
 * the bare referrer + landing page are stored so even direct / organic visits
 * carry some attribution context.
 */
export function captureUtm(): void {
  if (typeof window === 'undefined') return;

  const params   = new URLSearchParams(window.location.search);
  const source   = params.get('utm_source')   ?? undefined;
  const medium   = params.get('utm_medium')   ?? undefined;
  const campaign = params.get('utm_campaign') ?? undefined;
  const content  = params.get('utm_content')  ?? undefined;
  const term     = params.get('utm_term')     ?? undefined;

  const hasUtm = Boolean(source ?? medium ?? campaign);

  if (hasUtm) {
    // User arrived via a tagged link — persist the full UTM set.
    const data: UtmData = {
      utm_source:   source,
      utm_medium:   medium,
      utm_campaign: campaign,
      utm_content:  content,
      utm_term:     term,
      referrer:     document.referrer || undefined,
      landingPage:  window.location.pathname,
      capturedAt:   new Date().toISOString(),
    };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* private mode */ }
    return;
  }

  // No UTM in URL. Only write if nothing is stored yet — do NOT overwrite
  // an existing UTM session (the user may have navigated away from the ad landing page).
  try {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const data: UtmData = {
        referrer:    document.referrer || undefined,
        landingPage: window.location.pathname,
        capturedAt:  new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }
  } catch { /* private mode */ }
}

/** Read the stored UTM data (may be null if sessionStorage is unavailable). */
export function readUtm(): UtmData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UtmData) : null;
  } catch {
    return null;
  }
}

/**
 * Build a compact JSON string suitable for storing as the `attribution` column
 * in the Lead table. Includes UTM + referrer + landing page.
 * Returns undefined if there is nothing meaningful to store.
 */
export function buildAttribution(): string | undefined {
  const utm = readUtm();
  if (!utm) return undefined;

  // Only store non-empty values to keep the JSON lean.
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(utm)) {
    if (v) cleaned[k] = v;
  }

  if (Object.keys(cleaned).length === 0) return undefined;

  try {
    return JSON.stringify(cleaned);
  } catch {
    return undefined;
  }
}

/**
 * Parse the attribution JSON stored in the Lead row back into a typed object.
 * Returns null for malformed or missing strings.
 */
export function parseAttribution(raw: string | null | undefined): UtmData | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as UtmData; } catch { return null; }
}
