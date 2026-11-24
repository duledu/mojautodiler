'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface LazyGoogleMapProps {
  readonly src: string;
  readonly title: string;
}

/**
 * Defers mounting the Google Maps embed iframe until the container enters
 * within 200px of the viewport via IntersectionObserver.
 * Reserves exact aspect ratio (4:3 mobile / 16:9 desktop) to guarantee CLS = 0
 * while eliminating ~470 KB of third-party Maps JS from initial page load.
 */
export default function LazyGoogleMap({ src, title }: LazyGoogleMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setShouldLoad(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--color-surface-2)] sm:aspect-[16/9]"
    >
      {shouldLoad ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          suppressHydrationWarning
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
          <MapPin size={20} className="text-[var(--accent)]" aria-hidden="true" />
          <span>{title}</span>
        </div>
      )}
    </div>
  );
}
