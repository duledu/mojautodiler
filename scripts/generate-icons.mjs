/**
 * Icon generation script — MojAutoDiler
 *
 * Generates the complete PWA/launcher icon set from an SVG source.
 *
 * Design: Option A — Black background, Gold shield, White car
 * - Full-bleed black background (eliminates the "coin on a plate" effect
 *   caused by the old circular design on transparent/white canvas)
 * - Gold (#C9A84C) shield fills ~82 % of canvas height
 * - White car silhouette inside shield, designed for legibility at 48 px
 * - Separate maskable variant with design scaled to 78 % to keep artwork
 *   inside the Android maskable safe-zone circle
 *
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Brand colours ─────────────────────────────────────────────────────────────

const BLACK = '#0A0A0B';   // near-black (matches app theme-color)
const GOLD  = '#C9A84C';   // brand gold
const WHITE = '#FFFFFF';

// ── SVG source (512 × 512 coordinate space) ───────────────────────────────────
//
// Front-view sedan silhouette:
//   - Cabin (upper trapezoid)  y: 192–264, x: 178–334
//   - Body  (lower rectangle)  y: 264–376, x: 148–364
//   - Windshield               dark trapezoid between cabin & A-pillars
//   - Headlights               dark wedges at body left & right
//   - Grille                   two dark horizontal bars in lower body

function buildSvg(scale = 1) {
  const C  = 512;
  const cx = C / 2;   // 256
  const cy = C / 2;   // 256

  // Transform coordinate around canvas center
  const tx = (v) => cx + (v - cx) * scale;
  const ty = (v) => cy + (v - cy) * scale;

  // ── Shield (heater-shield / crest shape) ──────────────────────────────────
  const shield = [
    `M${tx(256)},${ty(42)}`,
    `L${tx(436)},${ty(108)}`,
    `L${tx(436)},${ty(282)}`,
    `C${tx(432)},${ty(398)} ${tx(350)},${ty(450)} ${tx(256)},${ty(474)}`,
    `C${tx(162)},${ty(450)} ${tx(80)},${ty(398)} ${tx(76)},${ty(282)}`,
    `L${tx(76)},${ty(108)}`,
    'Z',
  ].join(' ');

  // ── Car cabin ─────────────────────────────────────────────────────────────
  const cabin = [
    `M${tx(178)},${ty(264)}`,
    `L${tx(194)},${ty(214)}`,
    `Q${tx(200)},${ty(194)} ${tx(218)},${ty(192)}`,
    `L${tx(294)},${ty(192)}`,
    `Q${tx(312)},${ty(194)} ${tx(318)},${ty(214)}`,
    `L${tx(334)},${ty(264)}`,
    'Z',
  ].join(' ');

  // ── Car body ──────────────────────────────────────────────────────────────
  const body = [
    `M${tx(148)},${ty(264)}`,
    `L${tx(364)},${ty(264)}`,
    `L${tx(364)},${ty(362)}`,
    `Q${tx(362)},${ty(374)} ${tx(350)},${ty(376)}`,
    `L${tx(162)},${ty(376)}`,
    `Q${tx(150)},${ty(374)} ${tx(148)},${ty(362)}`,
    'Z',
  ].join(' ');

  // ── Windshield (dark tinted glass) ────────────────────────────────────────
  const wind = [
    `M${tx(197)},${ty(258)}`,
    `L${tx(209)},${ty(215)}`,
    `Q${tx(213)},${ty(202)} ${tx(222)},${ty(200)}`,
    `L${tx(290)},${ty(200)}`,
    `Q${tx(299)},${ty(202)} ${tx(303)},${ty(215)}`,
    `L${tx(315)},${ty(258)}`,
    'Z',
  ].join(' ');

  // ── Left headlight ────────────────────────────────────────────────────────
  const hlL = [
    `M${tx(149)},${ty(276)}`,
    `L${tx(178)},${ty(272)}`,
    `L${tx(178)},${ty(308)}`,
    `L${tx(149)},${ty(310)}`,
    `Q${tx(137)},${ty(304)} ${tx(137)},${ty(291)}`,
    `Q${tx(137)},${ty(279)} ${tx(149)},${ty(276)}`,
    'Z',
  ].join(' ');

  // ── Right headlight ───────────────────────────────────────────────────────
  const hlR = [
    `M${tx(363)},${ty(276)}`,
    `L${tx(334)},${ty(272)}`,
    `L${tx(334)},${ty(308)}`,
    `L${tx(363)},${ty(310)}`,
    `Q${tx(375)},${ty(304)} ${tx(375)},${ty(291)}`,
    `Q${tx(375)},${ty(279)} ${tx(363)},${ty(276)}`,
    'Z',
  ].join(' ');

  // ── Grille bars ───────────────────────────────────────────────────────────
  const gx1 = tx(199);  const gx2 = tx(313);
  const gw  = gx2 - gx1;
  const g1y = ty(322);  const g2y = ty(338);
  const gh  = Math.max(ty(322 + 8) - ty(322), 5);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${C} ${C}">
  <!-- Full-bleed black background — eliminates circular padding issues -->
  <rect width="${C}" height="${C}" fill="${BLACK}"/>
  <!-- Gold shield -->
  <path d="${shield}" fill="${GOLD}"/>
  <!-- White car silhouette: cabin + body -->
  <path d="${cabin}" fill="${WHITE}"/>
  <path d="${body}" fill="${WHITE}"/>
  <!-- Tinted windshield -->
  <path d="${wind}" fill="${BLACK}" opacity="0.42"/>
  <!-- Headlight recesses -->
  <path d="${hlL}" fill="${BLACK}" opacity="0.55"/>
  <path d="${hlR}" fill="${BLACK}" opacity="0.55"/>
  <!-- Grille bars -->
  <rect x="${gx1.toFixed(1)}" y="${g1y.toFixed(1)}" width="${gw.toFixed(1)}" height="${gh.toFixed(1)}" rx="3" fill="${BLACK}" opacity="0.48"/>
  <rect x="${gx1.toFixed(1)}" y="${g2y.toFixed(1)}" width="${gw.toFixed(1)}" height="${gh.toFixed(1)}" rx="3" fill="${BLACK}" opacity="0.48"/>
</svg>`;
}

// ── Generate PNG ──────────────────────────────────────────────────────────────

async function gen(svgStr, outPath, size) {
  await sharp(Buffer.from(svgStr))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const rel = outPath.replace(ROOT, '').replaceAll('\\', '/');
  console.log(`  ✓  ${rel}  (${size}×${size})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(join(ROOT, 'public/icons'), { recursive: true });
  mkdirSync(join(ROOT, 'app'),          { recursive: true });

  console.log('\n📐 Generating MojAutoDiler icons — Option A: Black / Gold / White\n');

  // Full artwork — used for all "any" purpose icons
  const svgFull = buildSvg(1);

  // Scaled to 78% for maskable — keeps design inside Android's safe-zone circle
  // (Android clips maskable icons to a circle whose diameter = 80% of canvas)
  const svgMask = buildSvg(0.78);

  // ── Next.js app/ icons (served automatically by Next.js) ──────────────────
  // app/icon.png       → /icon.png  (browser favicon + OG fallback)
  // app/apple-icon.png → /apple-icon.png  (iOS home-screen icon)
  // app/favicon.ico    → /favicon.ico
  await gen(svgFull, join(ROOT, 'app/icon.png'),        512);
  await gen(svgFull, join(ROOT, 'app/apple-icon.png'),  180);
  await gen(svgFull, join(ROOT, 'app/favicon.ico'),      32);

  // ── PWA manifest icons ────────────────────────────────────────────────────
  // Separate "any" (regular) and "maskable" files — the spec requires them
  // to be distinct entries with their own purpose fields.
  await gen(svgFull, join(ROOT, 'public/icons/icon-192.png'),          192);
  await gen(svgFull, join(ROOT, 'public/icons/icon-512.png'),          512);
  await gen(svgMask, join(ROOT, 'public/icons/maskable-icon-192.png'), 192);
  await gen(svgMask, join(ROOT, 'public/icons/maskable-icon-512.png'), 512);

  // ── Brand logo (used by LockScreen + social canvas) ───────────────────────
  await gen(svgFull, join(ROOT, 'public/brand-logo.png'), 512);

  // ── Remove stale file (referenced nowhere in source) ─────────────────────
  const stale = join(ROOT, 'public/favicon_512 (1).png');
  try {
    unlinkSync(stale);
    console.log('\n  🗑  Removed: public/favicon_512 (1).png  (unreferenced)');
  } catch {
    /* already gone */
  }

  console.log('\n✅ Done. Update manifest.json next.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
