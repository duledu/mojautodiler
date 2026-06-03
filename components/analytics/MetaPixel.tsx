'use client';

/**
 * MetaPixel — loads the Meta Pixel base script and tracks SPA route changes.
 *
 * Architecture (Next.js App Router):
 * 1. <MetaPixelScript> — renders the base fbq init code via next/script
 *    with strategy="afterInteractive". The script fires the FIRST PageView.
 * 2. <MetaPixelRouteTracker> — listens to usePathname() and fires PageView
 *    on every subsequent SPA navigation (skips the initial mount since the
 *    base script already fired it).
 * 3. <MetaPixel> — the single export that combines both; mount once in
 *    the root layout.
 */

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { META_PIXEL_ID, isPixelEnabled, trackPageView } from '@/lib/meta-pixel';

// ── Base script ───────────────────────────────────────────────────────────────

function MetaPixelScript() {
  if (!isPixelEnabled()) return null;

  // The standard Meta Pixel base code, minified.
  // Includes fbq('init', ID) + fbq('track', 'PageView') for the initial load.
  const initScript = `
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${META_PIXEL_ID}');
    fbq('track','PageView');
  `.trim();

  return (
    <>
      {/* Main pixel script — loads after hydration, non-blocking */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: initScript }}
      />

      {/* No-JS fallback — fires a PageView for users with JavaScript disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// ── SPA route-change tracker ──────────────────────────────────────────────────

function MetaPixelRouteTracker() {
  const pathname     = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the very first render — the base script already fired PageView.
    // Every subsequent pathname change is a client-side navigation that needs tracking.
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  return null;
}

// ── Public export ─────────────────────────────────────────────────────────────

/**
 * Mount once in the root layout:
 *   import MetaPixel from '@/components/analytics/MetaPixel';
 *   // inside layout body:
 *   <MetaPixel />
 */
export default function MetaPixel() {
  return (
    <>
      <MetaPixelScript />
      <MetaPixelRouteTracker />
    </>
  );
}
