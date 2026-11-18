const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES = [
  {
    src: 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\used_car_market_cover_1794990210231.jpg',
    baseName: 'cene-polovnih-automobila-srbija-2026'
  },
  {
    src: 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\mileage_fraud_cover_1794990246699.jpg',
    baseName: 'vracena-kilometraza-prevara-provera'
  },
  {
    src: 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\vehicle_paint_inspection_cover_clean_1794990282064.jpg',
    baseName: 'istorija-ostecenja-vozila-farba-pregled'
  },
  {
    src: 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\swiss_alpine_estate_cover_1794990253418.jpg',
    baseName: 'polovni-automobili-svajcarska-uvoz-vodic'
  },
  {
    src: 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\fuel_comparison_studio_cover_1794990272060.jpg',
    baseName: 'dizel-benzin-hibrid-poredjenje-troskova'
  }
];

const TARGET_DIRS = [
  path.join(process.cwd(), 'public', 'blog'),
  path.join(process.cwd(), 'content', 'staging', 'seo-articles-2026', 'images')
];

async function main() {
  for (const img of IMAGES) {
    console.log(`Processing ${img.baseName}...`);
    const inputBuf = fs.readFileSync(img.src);
    
    // WebP 1600x900
    const webpBuf = await sharp(inputBuf)
      .resize(1600, 900, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toBuffer();

    // JPEG fallback 1600x900
    const jpgBuf = await sharp(inputBuf)
      .resize(1600, 900, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    for (const dir of TARGET_DIRS) {
      fs.writeFileSync(path.join(dir, `${img.baseName}.webp`), webpBuf);
      fs.writeFileSync(path.join(dir, `${img.baseName}.jpg`), jpgBuf);
    }

    console.log(`  Saved ${img.baseName}.webp (${webpBuf.length} bytes) and .jpg (${jpgBuf.length} bytes)`);
  }
  console.log('All 5 cover images successfully generated and saved!');
}

main().catch(console.error);
