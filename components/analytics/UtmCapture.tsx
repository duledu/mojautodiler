'use client';

/**
 * UtmCapture — captures UTM parameters on every route change.
 *
 * Completely independent of Meta Pixel. Mount once in the root layout
 * alongside <MetaPixel />.
 *
 * On every pathname change (initial load + SPA navigation) it calls
 * captureUtm() which:
 *  - reads UTM params from the current URL
 *  - persists them to sessionStorage
 *  - preserves existing UTMs if the new URL has none (the user navigated
 *    away from the ad landing page but the session is still the same)
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureUtm } from '@/lib/utm';

export default function UtmCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureUtm();
  }, [pathname]);

  return null;
}
