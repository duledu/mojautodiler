import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import nextConfig from '@/next.config';
import { nextImageFallbackStage } from '@/components/ui/OptimizedImage';
import { buildBlogObjectKey, buildObjectKey } from '@/lib/r2';

describe('Phase 4 Option 3 — Image Optimization & Loop-Free Fallback', () => {
  test('next.config.ts defines AVIF/WebP formats, controlled device/image sizes, and 31-day TTL', () => {
    const img = nextConfig.images;
    assert.ok(img);
    assert.deepEqual(img.formats, ['image/avif', 'image/webp']);
    assert.deepEqual(img.deviceSizes, [640, 828, 1080, 1280, 1920]);
    assert.deepEqual(img.imageSizes, [96, 192, 384]);
    assert.equal(img.minimumCacheTTL, 2678400);
  });

  test('OptimizedImage fallback transitions optimized -> original -> failed without infinite loops', () => {
    assert.equal(nextImageFallbackStage('optimized', true), 'original');
    assert.equal(nextImageFallbackStage('original', true), 'failed');
    assert.equal(nextImageFallbackStage('failed', true), 'failed');
    assert.equal(nextImageFallbackStage('optimized', false), 'failed');
  });

  test('R2 upload flow remains untouched (Content-Type only, unique timestamped keys)', () => {
    const vehKey = buildObjectKey('veh-123', 'Front Photo.JPG');
    assert.match(vehKey, /^vehicles\/veh-123\/\d+-front-photo\.jpg$/);

    const blogKey = buildBlogObjectKey('post-456', 'Cover Image.PNG');
    assert.match(blogKey, /^blog\/post-456\/\d+-cover-image\.png$/);

    for (const rel of [
      '../lib/r2.ts',
      '../app/api/admin/upload/presign/route.ts',
      '../components/admin/VehicleFormClient.tsx',
      '../components/admin/BlogFormClient.tsx',
      '../components/admin/BlogRichTextEditor.tsx',
    ]) {
      const src = readFileSync(new URL(rel, import.meta.url), 'utf8');
      assert.equal(src.includes('Cache-Control'), false, `${rel} must not send Cache-Control`);
      assert.equal(src.includes('CacheControl'), false, `${rel} must not sign CacheControl`);
    }
  });

  test('vehicle display components use OptimizedImage instead of unoptimized={isR2Image(...)}', () => {
    for (const rel of [
      '../components/vehicle/HeroVehicleCard.tsx',
      '../components/vehicle/VehicleCard.tsx',
      '../components/vehicle/VehicleDetailClient.tsx',
    ]) {
      const src = readFileSync(new URL(rel, import.meta.url), 'utf8');
      assert.equal(src.includes('unoptimized={isR2Image'), false);
      assert.ok(src.includes('OptimizedImage'));
    }
  });
});

describe('Phase 4 Option 3 — Typography Preservation, Lazy Maps & Untouched Rendering/Admin Scope', () => {
  test('preserves exact original 5dfed25 typography and font loading (no next/font/google override)', () => {
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
    const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
    assert.equal(layout.includes('next/font/google'), false);
    assert.ok(css.includes("--font-display: 'Syne', sans-serif;"));
    assert.ok(css.includes("--font-body: 'DM Sans', sans-serif;"));
  });

  test('preserves original stable force-dynamic rendering in [locale]/layout.tsx (no ISR risk)', () => {
    const localeLayout = readFileSync(new URL('../app/[locale]/layout.tsx', import.meta.url), 'utf8');
    assert.ok(localeLayout.includes("export const dynamic = 'force-dynamic'"));
  });

  test('VehicleDetailClient uses LazyGoogleMap for deferred map loading', () => {
    const detail = readFileSync(new URL('../components/vehicle/VehicleDetailClient.tsx', import.meta.url), 'utf8');
    assert.ok(detail.includes('LazyGoogleMap'));
  });
});
