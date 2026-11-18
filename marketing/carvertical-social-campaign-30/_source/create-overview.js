const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = path.resolve(__dirname, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const page = await browser.newPage();

  const ig = Array.from({ length: 10 }, (_, i) => `IG_${String(i + 1).padStart(2, '0')}.png`);
  const fb = Array.from({ length: 10 }, (_, i) => `FB_${String(i + 1).padStart(2, '0')}.png`);
  const tt = Array.from({ length: 10 }, (_, i) => `TT_${String(i + 1).padStart(2, '0')}.png`);

  const card = (f, folder, title) => `
    <div class="item">
      <div class="thumb-wrap">
        <img src="../${folder}/${f}" />
      </div>
      <div class="label">${f.replace('.png', '')}</div>
    </div>
  `;

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('../_source/fonts/fonts.css');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', sans-serif;
        background: #0B1220;
        color: #ffffff;
        padding: 60px 80px 80px;
        width: 2560px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(255,255,255,0.12);
        padding-bottom: 40px;
        margin-bottom: 50px;
      }
      .header h1 {
        font-size: 56px;
        font-weight: 900;
        letter-spacing: -0.03em;
      }
      .header h1 span {
        color: #0073F0;
      }
      .header h1 em {
        font-style: normal;
        color: #C59B4C;
      }
      .header p {
        font-size: 26px;
        color: rgba(255,255,255,0.7);
        margin-top: 10px;
      }
      .badge-row {
        display: flex;
        gap: 20px;
      }
      .badge {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 999px;
        padding: 14px 28px;
        font-size: 22px;
        font-weight: 700;
      }
      .badge.gold {
        border-color: #C59B4C;
        color: #E8C97A;
      }
      .badge.blue {
        border-color: #0073F0;
        color: #5AA9FF;
      }
      .badge.yellow {
        background: #FFEB28;
        color: #0F0F14;
        border: none;
      }
      .section-title {
        font-size: 38px;
        font-weight: 800;
        margin: 40px 0 24px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .section-title span {
        font-size: 22px;
        font-weight: 600;
        color: rgba(255,255,255,0.5);
        background: rgba(255,255,255,0.1);
        padding: 4px 14px;
        border-radius: 999px;
      }
      .grid-feed {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 30px;
        margin-bottom: 30px;
      }
      .grid-story {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 30px;
        margin-bottom: 40px;
      }
      .item {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        overflow: hidden;
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .thumb-wrap {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      .thumb-wrap img {
        display: block;
        width: 100%;
        height: auto;
      }
      .label {
        margin-top: 14px;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: rgba(255,255,255,0.85);
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1><em>MojAutoDiler</em> × <span>carVertical</span></h1>
        <p>30 Premium Social Media Advertisements — Official Marketing Campaign</p>
      </div>
      <div class="badge-row">
        <div class="badge yellow">20% POPUSTA</div>
        <div class="badge gold">KOD: MOJAUTODILER</div>
        <div class="badge blue">30 FINISHED PNGs</div>
      </div>
    </div>

    <div class="section-title">GROUP A: Instagram Feed <span>10 Creatives • 1080 × 1350 px (4:5)</span></div>
    <div class="grid-feed">
      ${ig.map(f => card(f, 'instagram')).join('')}
    </div>

    <div class="section-title" style="margin-top: 50px;">GROUP B: Facebook Feed <span>10 Creatives • 1080 × 1350 px (4:5)</span></div>
    <div class="grid-feed">
      ${fb.map(f => card(f, 'facebook')).join('')}
    </div>

    <div class="section-title" style="margin-top: 50px;">GROUP C: TikTok & Instagram Stories / Reels <span>10 Creatives • 1080 × 1920 px (9:16)</span></div>
    <div class="grid-story">
      ${tt.map(f => card(f, 'tiktok-stories')).join('')}
    </div>
  </body>
  </html>`;

  const htmlPath = path.join(BASE, '_source', 'overview.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  await page.setViewport({ width: 2560, height: 1000, deviceScaleFactor: 1 });
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const outPath = path.join(BASE, 'previews', 'campaign-overview.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved overview to:', outPath);
  await browser.close();
})();
