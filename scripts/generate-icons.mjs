/**
 * Generates all favicon/icon sizes from the source 512px PNG.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const SOURCE = join(ROOT, 'public', 'favicon_512 (1).png');

async function main() {
  const src = sharp(SOURCE).png();
  mkdirSync(join(ROOT, 'public', 'icons'), { recursive: true });

  // ── PNG sizes ────────────────────────────────────────────────────────────────
  const pngJobs = [
    // App Router file conventions (auto-wired by Next.js)
    { size: 512, dest: join(ROOT, 'app', 'icon.png') },
    { size: 180, dest: join(ROOT, 'app', 'apple-icon.png') },
    // Manifest / PWA icons (referenced from manifest.json)
    { size: 192, dest: join(ROOT, 'public', 'icons', 'icon-192.png') },
    { size: 512, dest: join(ROOT, 'public', 'icons', 'icon-512.png') },
    // Small sizes for ICO construction
    { size: 16,  dest: null },
    { size: 32,  dest: null },
  ];

  const buffers = {};
  for (const { size, dest } of pngJobs) {
    const buf = await src.clone().resize(size, size).toBuffer();
    buffers[size] = buf;
    if (dest) {
      writeFileSync(dest, buf);
      console.log(`  ✓ ${dest.replace(ROOT, '')}`);
    }
  }

  // ── favicon.ico (16 + 32 embedded as PNG-in-ICO) ─────────────────────────────
  const ico = buildIco([buffers[16], buffers[32]]);
  writeFileSync(join(ROOT, 'app', 'favicon.ico'), ico);
  console.log('  ✓ app/favicon.ico');

  console.log('\nAll icons generated.');
}

/**
 * Builds an ICO file that embeds the given PNG buffers.
 * Modern browsers (Chrome, Firefox, Edge, Safari 15+) support PNG-in-ICO.
 */
function buildIco(pngBuffers) {
  const HEADER = 6;
  const ENTRY  = 16;
  const dataStart = HEADER + ENTRY * pngBuffers.length;

  let dataOffset = dataStart;
  const entries = pngBuffers.map((buf) => {
    // Width/height from PNG IHDR chunk (bytes 16–23)
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const entry = { buf, w, h, offset: dataOffset };
    dataOffset += buf.length;
    return entry;
  });

  const total = dataOffset;
  const out = Buffer.alloc(total);
  let p = 0;

  // ICONDIR header
  out.writeUInt16LE(0, p); p += 2; // reserved
  out.writeUInt16LE(1, p); p += 2; // type = icon
  out.writeUInt16LE(pngBuffers.length, p); p += 2;

  // ICONDIRENTRY per image
  for (const { buf, w, h, offset } of entries) {
    out.writeUInt8(w >= 256 ? 0 : w, p);  p += 1; // width  (0 = 256)
    out.writeUInt8(h >= 256 ? 0 : h, p);  p += 1; // height (0 = 256)
    out.writeUInt8(0, p);                  p += 1; // color count
    out.writeUInt8(0, p);                  p += 1; // reserved
    out.writeUInt16LE(1, p);               p += 2; // color planes
    out.writeUInt16LE(32, p);              p += 2; // bits per pixel
    out.writeUInt32LE(buf.length, p);      p += 4; // size of image data
    out.writeUInt32LE(offset, p);          p += 4; // offset of image data
  }

  // PNG image data
  for (const { buf, offset } of entries) {
    buf.copy(out, offset);
  }

  return out;
}

main().catch((err) => { console.error(err); process.exit(1); });
