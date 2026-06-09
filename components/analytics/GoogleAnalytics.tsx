'use client';

/**
 * GoogleAnalytics — loads GA4 and tracks SPA route changes.
 *
 * Architecture mirrors MetaPixel (same file, same approach):
 * 1. <GoogleAnalyticsScript> — loads gtag.js + fires the initial config/pageview
 *    via next/script with strategy="afterInteractive".
 * 2. <GoogleAnalyticsRouteTracker> — listens to usePathname() and fires a
 *    page_view event on every subsequent SPA navigation (skips the first mount
 *    since the init script already fired it).
 * 3. <GoogleAnalytics> — single export, mount once in the root layout.
 */

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ── Constants ─────────────────────────────────────────────────────────────────

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

function isGaEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

// ── Global gtag type ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function trackPageView(pathname: string): void {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'page_view', {
    page_path: pathname,
    send_to: GA_MEASUREMENT_ID,
  });
}

// ── Base script ───────────────────────────────────────────────────────────────

function GoogleAnalyticsScript() {
  if (!isGaEnabled()) return null;

  return (
    <>
      {/* Load the gtag.js library asynchronously — non-blocking */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      {/* Inline init: set up dataLayer, configure the measurement ID, and fire
          the initial pageview. Runs after hydration, same as MetaPixel init. */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

// ── SPA route-change tracker ──────────────────────────────────────────────────

function GoogleAnalyticsRouteTracker() {
  const pathname     = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the very first render — the base script already fired the pageview.
    // Every subsequent pathname change is a client-side navigation.
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    trackPageView(pathname);
  }, [pathname]);

  return null;
}

// ── Public export ─────────────────────────────────────────────────────────────

export default function GoogleAnalytics() {
  return (
    <>
      <GoogleAnalyticsScript />
      <GoogleAnalyticsRouteTracker />
    </>
  );
}
