const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

const C = {
  cv: '#0073F0', cvY: '#FFEB28', cvSky: '#AADCFF', navy: '#0B1630', ink: '#0F0F14',
  gold: '#C59B4C', goldL: '#E8C97A', goldD: '#9A7A2E', muted: '#6B6B7C',
};
const CODE = 'MOJAUTODILER';
const DISC = 'Dostupnost podataka zavisi od vozila i izvora.';

const cvLogo = (h, v = 'white') => {
  const f = { white: 'carVertical White.svg', primary: 'carVertical Primary.svg', black: 'carVertical Black.svg' }[v];
  return `<img class="cvl" src="brand/${f}" style="height:${h}px;width:${(h * 7.2).toFixed(1)}px;" alt="carVertical">`;
};
const mad = (h = 24, theme = 'light') =>
  `<div class="mad ${theme}" style="gap:${Math.max(6, Math.round(h * 0.28))}px;opacity:0.95;">
    <img src="brand/mojautodiler-logo.png" style="height:${h}px;width:${h}px;border-radius:50%;flex:none;" alt="MojAutoDiler">
    <div class="wm">
      <b style="font-size:${Math.round(h * 0.54)}px;">MojAutoDiler<em style="font-weight:600;color:${C.gold};">.com</em></b>
    </div>
  </div>`;
const cta = (cls = 'y', text = 'PROVERI ISTORIJU VOZILA', extra = '') =>
  `<div class="cta ${cls}" style="${extra}">${text}<span class="arr">→</span></div>`;
const code = (cls = '', extra = '') =>
  `<div class="code ${cls}" style="${extra}"><small>PROMO KOD</small><b>${CODE}</b></div>`;
const disc = (color = 'rgba(255,255,255,.72)', extra = '') =>
  `<div class="disc" style="color:${color};${extra}">${DISC}</div>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350 });

  // Variation 1: cv-mockup-2 (tablet showing report) in the center angled/floating
  const htmlVar1 = `<!doctype html><html><head><meta charset="utf-8">
  <style>
    @import url('fonts/fonts.css');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;color:${C.ink};position:relative;width:1080px;height:1350px;overflow:hidden;background:${C.cv}}
    .a{position:absolute}
    .top{position:absolute;inset:0;background:linear-gradient(160deg,#0B1630 0%,#121f3f 100%);clip-path:polygon(0 0,100% 0,100% 50%,0 60%)}
    .goldline{position:absolute;inset:0;background:${C.gold};clip-path:polygon(0 60%,100% 50%,100% 50.6%,0 60.6%)}
    .center{left:0;right:0;display:flex;flex-direction:column;align-items:center;text-align:center}
    .cvl{display:block;flex:none}
    .mad{display:inline-flex;align-items:center;white-space:nowrap;line-height:1}
    .mad .wm{display:flex;align-items:center;line-height:1}
    .mad .wm b{font-weight:800;letter-spacing:-.02em;line-height:1}
    .mad.light{color:#fff}.mad.dark{color:${C.ink}}
    .cta{display:inline-flex;align-items:center;justify-content:center;gap:18px;font-weight:800;border-radius:999px;padding:0 46px;height:90px;font-size:28px;background:${C.cvY};color:${C.ink}}
    .code{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:3px dashed #fff;border-radius:20px;padding:12px 32px 14px;color:#fff}
    .code small{font-size:18px;font-weight:700;letter-spacing:.22em;opacity:.85;margin-bottom:6px}
    .code b{font-size:46px;font-weight:900;letter-spacing:.05em}
    .o{font-size:56px;font-weight:900;color:#fff;letter-spacing:-.02em}
    .o span{background:${C.cvY};color:${C.ink};padding:2px 16px;border-radius:12px}
    .disc{font-size:20px;font-weight:500;letter-spacing:.01em}

    /* mockup visual */
    .mockup-wrap{
      position:absolute;
      left:100px;
      right:100px;
      top:260px;
      height:460px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .mockup-card{
      width:780px;
      height:440px;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 30px 80px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(255,255,255,0.15);
      position:relative;
    }
    .mockup-card img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .mockup-tag{
      position:absolute;
      bottom:16px;
      right:20px;
      background:rgba(11,22,48,0.85);
      backdrop-filter:blur(10px);
      color:rgba(255,255,255,0.85);
      font-size:16px;
      font-weight:600;
      padding:6px 14px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,0.2);
    }
  </style>
  </head>
  <body>
    <div class="top"></div><div class="goldline"></div>
    <div class="a center" style="top:70px">
      <div style="font-size:22px;font-weight:700;letter-spacing:.2em;color:rgba(255,255,255,.75);margin-bottom:16px;">PROVERA ISTORIJE VOZILA</div>
      ${cvLogo(58, 'white')}
      <div style="margin-top:20px;display:inline-flex;align-items:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:6px 20px;">
        ${mad(24, 'light')}
      </div>
    </div>

    <div class="mockup-wrap">
      <div class="mockup-card">
        <img src="brand/cv-mockup-2.png" />
        <div class="mockup-tag">carVertical detaljan izveštaj</div>
      </div>
    </div>

    <div class="a center" style="top:760px">
      <div style="color:#fff;font-size:32px;font-weight:600;margin-bottom:18px;">Zajedno za sigurniju kupovinu automobila</div>
      <div class="o"><span>20% POPUSTA</span> na izveštaje</div>
    </div>
    <div class="a center" style="top:940px">${code()}</div>
    <div class="a center" style="top:1100px">${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:88px;font-size:28px')}</div>
    ${disc('rgba(255,255,255,.78)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
  </body></html>`;

  await page.setContent(htmlVar1);
  await page.screenshot({ path: path.join(__dirname, 'fb18-test-v1.png') });
  console.log('Saved fb18-test-v1.png');

  // Variation 2: laptop lifestyle shot
  const htmlVar2 = htmlVar1.replace('brand/cv-mockup-2.png', 'brand/cv-lifestyle-laptop.jpg');
  await page.setContent(htmlVar2);
  await page.screenshot({ path: path.join(__dirname, 'fb18-test-v2.png') });
  console.log('Saved fb18-test-v2.png');

  await browser.close();
})();
