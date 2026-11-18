const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

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
  const fb = Array.from({ length: 10 }, (_, i) => `FB_${String(i + 11).padStart(2, '0')}.png`);
  const tt = Array.from({ length: 10 }, (_, i) => `TT_${String(i + 1).padStart(2, '0')}.png`);

  const card = (f, folder) => `
    <div class="item">
      <div class="thumb-wrap ${folder === 'tiktok-stories' ? 't916' : 't45'}">
        <img src="../${folder}/${f}" />
      </div>
      <div class="label">${f.replace('.png', '')}</div>
    </div>
  `;

  const html = `<!doctype html>
  <html lang="mk">
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
        color: rgba(255,255,255,0.6);
        background: rgba(255,255,255,0.08);
        padding: 6px 16px;
        border-radius: 999px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 28px;
        margin-bottom: 50px;
      }
      .item {
        background: #121A2C;
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .thumb-wrap {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .thumb-wrap.t45 {
        aspect-ratio: 4 / 5;
      }
      .thumb-wrap.t916 {
        aspect-ratio: 9 / 16;
      }
      .thumb-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .label {
        margin-top: 14px;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: rgba(255,255,255,0.9);
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>car<span>Vertical</span> × <em>MojAutoDiler</em> — Македонска кампања</h1>
        <p>30 премиум статични рекламни банери за социјални мрежи (Македонски јазик / Кирилица)</p>
      </div>
      <div class="badge-row">
        <div class="badge gold">КОД: MOJAVTODILER</div>
        <div class="badge yellow">20% ПОПУСТ</div>
        <div class="badge blue">30 БАНЕРИ (4:5 & 9:16)</div>
      </div>
    </div>

    <div class="section-title">
      Група A — Instagram Feed
      <span>1080 × 1350 px (4:5) — 10 банери</span>
    </div>
    <div class="grid">
      ${ig.map(f => card(f, 'instagram')).join('')}
    </div>

    <div class="section-title">
      Група B — Facebook Feed
      <span>1080 × 1350 px (4:5) — 10 банери</span>
    </div>
    <div class="grid">
      ${fb.map(f => card(f, 'facebook')).join('')}
    </div>

    <div class="section-title">
      Група C — TikTok & Instagram Stories / Reels
      <span>1080 × 1920 px (9:16) — 10 банери</span>
    </div>
    <div class="grid">
      ${tt.map(f => card(f, 'tiktok-stories')).join('')}
    </div>
  </body>
  </html>`;

  await page.setViewport({ width: 2560, height: 3200, deviceScaleFactor: 1 });
  const htmlPath = path.join(BASE, '_source', 'overview-mk.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 2560, height: bodyHeight, deviceScaleFactor: 1 });

  const outPath = path.join(BASE, 'previews', 'campaign-overview.png');
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 2560, height: bodyHeight } });
  console.log('Saved Macedonian overview to:', outPath);

  await browser.close();
})();
