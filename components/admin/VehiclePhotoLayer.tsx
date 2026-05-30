import { useEffect, useRef } from 'react';

/**
 * Waits for VehiclePhotoLayer canvas(es) to finish drawing and for any <img>
 * elements (QR codes etc.) to fully decode before html-to-image capture.
 *
 * The canvas sets data-vehicle-ready="true" in its onload callback.
 * Polls every 50 ms, gives up after 3 s.
 */
export async function waitForExportReady(el: HTMLElement): Promise<void> {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const canvases = Array.from(el.querySelectorAll<HTMLCanvasElement>('canvas'));
    if (canvases.length > 0 && canvases.every((c) => c.dataset['vehicleReady'] === 'true')) break;
    await new Promise<void>((r) => setTimeout(r, 50));
  }
  await Promise.all(
    Array.from(el.querySelectorAll('img')).map((img) => img.decode().catch(() => {})),
  );
}

interface Props {
  readonly src:     string;
  readonly width:   number;
  readonly height:  number;
  /** Vertical focal point for object-fit:cover crop (0 = top, 0.5 = center, 1 = bottom) */
  readonly posY?:   number;
  /** CSS/canvas filter string, e.g. 'saturate(1.08) contrast(1.08) brightness(0.92)' */
  readonly filter?: string;
}

/**
 * Renders the vehicle photo onto a <canvas> element instead of an <img>.
 *
 * WHY CANVAS INSTEAD OF <img>:
 * html-to-image v1.11.x calls fetch(img.src) to re-encode every <img> into the
 * SVG foreignObject. This call silently fails for large payloads (vehicle photos
 * ≥200 KB) regardless of whether src is a blob URL or a data URL — the image
 * is dropped from the export with no error thrown.
 *
 * Canvas elements are handled differently by html-to-image: it calls
 * canvas.toDataURL() directly and embeds the result inline. No fetch, no size
 * limit, no CORS, always works.
 */
export function VehiclePhotoLayer({ src, width, height, posY = 0.5, filter = 'none' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    // Reset the ready flag on every new src so the export handler waits for the new draw.
    delete canvas.dataset['vehicleReady'];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const img = new Image();

    img.onload = () => {
      console.log(
        '[VehiclePhoto] onload — natural:', img.naturalWidth, '×', img.naturalHeight,
        '| canvas:', width, '×', height,
        '| src[:60]:', src.slice(0, 60),
      );

      // Implement object-fit: cover with posY focal point.
      const imgAspect = img.naturalWidth  / img.naturalHeight;
      const cvAspect  = width / height;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

      if (imgAspect > cvAspect) {
        // Image is wider than canvas — fit height, center-crop left/right.
        sw = img.naturalHeight * cvAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        // Image is taller than canvas — fit width, crop top/bottom using posY.
        sh = img.naturalWidth / cvAspect;
        sy = (img.naturalHeight - sh) * posY;
      }

      if (filter && filter !== 'none') ctx.filter = filter;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      ctx.filter = 'none';

      console.log('[VehiclePhoto] drawImage — src rect:', Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh));

      // Signal the export handler that this canvas is ready to be captured.
      canvas.dataset['vehicleReady'] = 'true';
    };

    img.onerror = () => {
      console.error('[VehiclePhoto] ERROR — failed to load. src[:80]:', src.slice(0, 80));
    };

    img.src = src;
    console.log('[VehiclePhoto] loading → src type:', src.startsWith('blob:') ? 'blob' : src.startsWith('data:') ? 'data' : 'url', '| src[:60]:', src.slice(0, 60));
  }, [src, width, height, posY, filter]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}
