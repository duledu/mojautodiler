'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

export type ImageFallbackStage = 'optimized' | 'original' | 'failed';

/**
 * Pure state-transition helper for OptimizedImage error recovery.
 * Guarantees at most ONE fallback attempt (optimized -> original -> failed)
 * with zero infinite loops or repeated failed network requests.
 */
export function nextImageFallbackStage(
  current: ImageFallbackStage,
  allowOriginalFallback: boolean,
): ImageFallbackStage {
  if (current === 'optimized' && allowOriginalFallback) {
    return 'original';
  }
  return 'failed';
}

export interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  /** Optional fallback element rendered if both optimized and original URLs fail (e.g. R2 outage). */
  readonly fallback?: React.ReactNode;
}

/**
 * Production-safe wrapper around `next/image`:
 * 1. Serves responsive AVIF/WebP via Next.js Image Optimizer by default.
 * 2. On first error, falls back ONCE to the untouched original URL (`unoptimized={true}`).
 * 3. If the original URL also fails, stops retrying cleanly (no infinite loop).
 */
export default function OptimizedImage({
  src,
  alt,
  unoptimized = false,
  fallback,
  ...rest
}: OptimizedImageProps) {
  const srcKey = typeof src === 'string' ? src : 'static';
  const [stageBySrc, setStageBySrc] = useState<{ key: string; stage: ImageFallbackStage }>({
    key: srcKey,
    stage: unoptimized ? 'original' : 'optimized',
  });

  const stage: ImageFallbackStage =
    stageBySrc.key === srcKey
      ? stageBySrc.stage
      : unoptimized
        ? 'original'
        : 'optimized';

  if (stage === 'failed') {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-text-muted)]"
      />
    );
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      unoptimized={stage === 'original'}
      onError={() => {
        setStageBySrc({
          key: srcKey,
          stage: nextImageFallbackStage(stage, !unoptimized),
        });
      }}
    />
  );
}
