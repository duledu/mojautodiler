/**
 * Brand OG image generator — MojAutoDiler
 *
 * Generates 1200×630 Open Graph images for each brand silo page.
 * Outputs to: public/og/brand-{slug}.jpg
 *
 * Design:
 *   - Near-black background (#0A0A0B)
 *   - Subtle gold radial glow at left
 *   - Vertical gold accent bar
 *   - Brand name in large gold text (adaptive size)
 *   - Tagline in white/muted
 *   - "MOJ AUTO DILER" wordmark bottom-right
 *
 * Run: node scripts/generate-og-images.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const OUT_DIR   = join(ROOT, 'public/og');

const GOLD  = '#C9A84C';
const BLACK = '#0A0A0B';
const WHITE = '#FFFFFF';
const W = 1200;
const H = 630;

// ── Adaptive font size so long names fit within the canvas ────────────────────

function brandFontSize(name) {
  if (name.length <= 5)  return 120;
  if (name.length <= 8)  return 100;
  if (name.length <= 10) return 84;
  return 68;   // 'Mercedes-Benz' etc.
}

// ── Per-brand tagline ─────────────────────────────────────────────────────────

const TAGLINES = {
  bmw:            'Automobili iz uvoza u Srbiji',
  audi:           'Automobili iz uvoza u Srbiji',
  volkswagen:     'Automobili iz uvoza u Srbiji',
  'mercedes-benz':'Automobili iz uvoza u Srbiji',
  skoda:          'Automobili iz uvoza u Srbiji',
};

// ── SVG template ──────────────────────────────────────────────────────────────

function buildSvg(brandName, tagline) {
  const fz = brandFontSize(brandName);

  // Vertical center of brand text block
  const textY   = H / 2 + fz * 0.35;  // baseline ≈ visual center
  const subY    = textY + fz * 0.62;   // tagline below brand name

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <!-- Radial gold glow at left third -->
    <radialGradient id="glow" cx="28%" cy="50%" r="55%" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="${GOLD}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <!-- Horizontal vignette: darker at edges -->
    <linearGradient id="vig" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.18"/>
      <stop offset="30%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="70%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>

  <!-- Base background -->
  <rect width="${W}" height="${H}" fill="${BLACK}"/>

  <!-- Gold glow -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Vignette -->
  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- Vertical gold accent bar -->
  <rect x="88" y="${H * 0.28}" width="4" height="${H * 0.44}" rx="2" fill="${GOLD}" opacity="0.9"/>

  <!-- Brand name -->
  <text
    x="120"
    y="${textY}"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="${fz}"
    font-weight="900"
    fill="${GOLD}"
    letter-spacing="-1"
  >${brandName}</text>

  <!-- Tagline -->
  <text
    x="122"
    y="${subY}"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="28"
    font-weight="400"
    fill="${WHITE}"
    opacity="0.55"
    letter-spacing="0.5"
  >${tagline}</text>

  <!-- Bottom-right wordmark -->
  <text
    x="${W - 88}"
    y="${H - 52}"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="17"
    font-weight="900"
    fill="${GOLD}"
    opacity="0.72"
    text-anchor="end"
    letter-spacing="2"
  >MOJ AUTO DILER</text>

  <!-- Thin rule above wordmark -->
  <line
    x1="${W - 280}"
    y1="${H - 70}"
    x2="${W - 88}"
    y2="${H - 70}"
    stroke="${GOLD}"
    stroke-width="1"
    opacity="0.28"
  />
</svg>`;
}

// ── Generate ──────────────────────────────────────────────────────────────────

const BRANDS = [
  { slug: 'bmw',            name: 'BMW' },
  { slug: 'audi',           name: 'Audi' },
  { slug: 'volkswagen',     name: 'Volkswagen' },
  { slug: 'mercedes-benz',  name: 'Mercedes-Benz' },
  { slug: 'skoda',          name: 'Škoda' },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('\n🖼  Generating brand OG images (1200×630)\n');

  for (const { slug, name } of BRANDS) {
    const tagline = TAGLINES[slug];
    const svg     = buildSvg(name, tagline);
    const outPath = join(OUT_DIR, `brand-${slug}.jpg`);

    await sharp(Buffer.from(svg))
      .resize(W, H)
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outPath);

    console.log(`  ✓  public/og/brand-${slug}.jpg`);
  }

  console.log('\n✅  Done.\n');
  console.log('Commit these files so Vercel serves them:');
  BRANDS.forEach(({ slug }) => console.log(`  public/og/brand-${slug}.jpg`));
  console.log();
}

main().catch((e) => { console.error(e); process.exit(1); });
