// MojAutoDiler × carVertical — 30-ad campaign compositor (REFINED VERSION).
// Fixes:
// 1. Clean MojAutoDiler logo without any Partner label (~24-26px).
// 2. carVertical established as PRIMARY brand across all 30 creatives (dominant left/top positions).
// 3. Fixed branding collisions (especially TT_05 and headers).
// 4. Fixed typography & line breaks (no orphan words, perfect Serbian diacritics č, ć, ž, š, đ).
// 5. Consistent promotional code MOJAUTODILER and 20% POPUSTA.
// 6. Strict safe zones and mobile-first margins.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SRC = __dirname;
const OUT = path.resolve(SRC, '..');
const HTML = path.join(SRC, 'html');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const only = process.argv.slice(2);

// ---------- brand tokens ----------
const C = {
  cv: '#0073F0', cvY: '#FFEB28', cvSky: '#AADCFF', navy: '#0B1630', ink: '#0F0F14',
  gold: '#C59B4C', goldL: '#E8C97A', goldD: '#9A7A2E', muted: '#6B6B7C',
};
const CODE = 'MOJAUTODILER';
const DISC = 'Dostupnost podataka zavisi od vozila i izvora.';

// ---------- shared snippets (primary carVertical, subtle MojAutoDiler) ----------
const cvLogo = (h, v = 'white') => {
  const f = { white: 'carVertical White.svg', primary: 'carVertical Primary.svg', black: 'carVertical Black.svg' }[v];
  return `<img class="cvl" src="../brand/${f}" style="height:${h}px;width:${(h * 7.2).toFixed(1)}px;" alt="carVertical">`;
};

// Subtle, discreet secondary logo
const mad = (h = 24, theme = 'light') =>
  `<div class="mad ${theme}" style="gap:${Math.max(6, Math.round(h * 0.28))}px;opacity:0.95;">
    <img src="../brand/mojautodiler-logo.png" style="height:${h}px;width:${h}px;border-radius:50%;flex:none;" alt="MojAutoDiler">
    <div class="wm">
      <b style="font-size:${Math.round(h * 0.54)}px;">MojAutoDiler<em style="font-weight:600;color:${C.gold};">.com</em></b>
    </div>
  </div>`;

// Standard co-branded lockup: carVertical dominant on left, subtle MojAutoDiler on right
const lock = (theme = 'light', cvH = 38, madH = 24) =>
  `<div class="lock ${theme}">
    ${cvLogo(cvH, theme === 'light' ? 'white' : 'primary')}
    <span class="sep">×</span>
    ${mad(madH, theme)}
  </div>`;

const cta = (cls = 'y', text = 'PROVERI ISTORIJU VOZILA', extra = '') =>
  `<div class="cta ${cls}" style="${extra}">${text}<span class="arr">→</span></div>`;

const code = (cls = '', extra = '') =>
  `<div class="code ${cls}" style="${extra}"><small>PROMO KOD</small><b>${CODE}</b></div>`;

const disc = (color = 'rgba(255,255,255,.72)', extra = '') =>
  `<div class="disc" style="color:${color};${extra}">${DISC}</div>`;

const I = {
  gauge: '<path d="M3.5 17.5a8.5 8.5 0 1 1 17 0"/><path d="M12 17.5l4.2-5.6"/><circle cx="12" cy="17.5" r="1.3"/><path d="M6 12.6l1.2.7M12 8v1.4M18 12.6l-1.2.7"/>',
  car: '<path d="M3 16.5v-3.2l2.2-5.3h9.6l3.4 5.3H21v3.2"/><circle cx="7.2" cy="17" r="1.9"/><circle cx="16.6" cy="17" r="1.9"/><path d="M5.6 13.3h12.6"/><path d="M19 4.5l-1.3 2M21.2 6.8l-2 .8M16.4 3.8l.1 2.2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"/><circle cx="12" cy="15.5" r="1.3"/>',
  cam: '<rect x="3" y="7" width="18" height="13" rx="2.4"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8.3 7l1.5-2.8h4.4L15.7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.3 11.7L20 3M16.5 6.5l2.5 2.5M14.5 8.5l2 2"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-5z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1L20 20M8.1 15.9L20 4"/>',
};
const icon = (n, size = 48, color = 'currentColor', sw = 1.8) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;

const BASE = `
@import url('../fonts/fonts.css');
*{margin:0;padding:0;box-sizing:border-box}
html,body{overflow:hidden}
body{font-family:'Inter',sans-serif;color:${C.ink};position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}
.bg{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat}
.cvl{display:block;flex:none}
.mad{display:inline-flex;align-items:center;white-space:nowrap;line-height:1}
.mad .wm{display:flex;align-items:center;line-height:1}
.mad .wm b{font-weight:800;letter-spacing:-.02em;line-height:1}
.mad.light{color:#fff}.mad.dark{color:${C.ink}}
.lock{display:inline-flex;align-items:center;gap:18px}
.lock .sep{font-weight:300;font-size:20px;opacity:.45;line-height:1}
.lock.light .sep{color:#fff}.lock.dark .sep{color:${C.ink}}
.cta{display:inline-flex;align-items:center;justify-content:center;gap:18px;font-weight:800;border-radius:999px;padding:0 46px;height:94px;font-size:30px;letter-spacing:.02em;white-space:nowrap}
.cta .arr{font-size:34px;font-weight:600}
.cta.y{background:${C.cvY};color:${C.ink}}
.cta.b{background:${C.cv};color:#fff}
.cta.n{background:${C.navy};color:#fff}
.cta.w{background:#fff;color:${C.cv}}
.cta.k{background:${C.ink};color:#fff}
.code{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:3px dashed currentColor;border-radius:20px;padding:12px 32px 14px;line-height:1.05}
.code small{font-size:18px;font-weight:700;letter-spacing:.22em;opacity:.85;margin-bottom:6px}
.code b{font-size:46px;font-weight:900;letter-spacing:.05em}
.disc{font-size:20px;font-weight:500;letter-spacing:.01em}
.pct{font-weight:900;letter-spacing:-.04em;line-height:.9}
.eyebrow{font-size:24px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
.center{left:0;right:0;display:flex;flex-direction:column;align-items:center;text-align:center}
`;

// ---------- the 30 ads ----------
const ads = [];
const ad = (id, folder, w, h, bg, css, body) => ads.push({ id, folder, w, h, bg, css, body });
const IG = 'instagram', FB = 'facebook', TT = 'tiktok-stories';

// ============================================================================
// GROUP A: INSTAGRAM (1080 × 1350 px, 4:5)
// ============================================================================

// IG_01 — Ne kupuj na slepo (dark cinematic)
ad('IG_01', IG, 1080, 1350, 'ig01', `
.bg{background-image:url(../backgrounds/ig01.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,16,.85) 0%,rgba(5,8,16,.15) 42%,rgba(5,8,16,.2) 62%,rgba(5,8,16,.96) 100%)}
h1{font-size:124px;font-weight:900;color:#fff;line-height:.95;letter-spacing:-.04em}
h1 span{color:${C.cv};text-shadow:0 0 40px rgba(0,115,240,.35)}
.sub{font-size:34px;color:rgba(255,255,255,.88);font-weight:500;margin-top:24px;max-width:760px;line-height:1.3}
.panel{left:64px;right:64px;bottom:92px;border-radius:32px;background:rgba(255,255,255,.1);backdrop-filter:blur(18px);border:1.5px solid rgba(255,255,255,.22);padding:32px 38px;display:flex;align-items:center;justify-content:space-between}
.off b{display:block;font-size:62px;font-weight:900;color:${C.cvY};letter-spacing:-.02em;line-height:1}
.off span{display:block;font-size:26px;color:#fff;font-weight:600;margin-top:8px}
.off span strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:64px">${cvLogo(40, 'white')}</div>
<div class="a" style="left:72px;top:180px">
  <h1>Ne kupuj<br><span>na slepo.</span></h1>
  <p class="sub">Proveri dostupnu istoriju vozila pre nego što kupiš polovan automobil.</p>
</div>
<div class="a panel">
  <div class="off"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// IG_02 — Proveri kilometražu (photo top / white panel)
ad('IG_02', IG, 1080, 1350, 'ig02', `
.ph{position:absolute;left:0;top:0;width:1080px;height:720px;background:url(../backgrounds/ig02.png) center/cover}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0) 30%)}
.panel{left:0;top:670px;width:1080px;height:680px;background:#fff;border-radius:44px 44px 0 0;padding:54px 72px 0}
h1{font-size:102px;font-weight:900;letter-spacing:-.04em;line-height:1;color:${C.navy}}
.sub{font-size:32px;color:#3A3A4A;margin-top:16px;line-height:1.3}
.row{display:flex;align-items:center;gap:24px;margin-top:32px}
.pill{background:${C.cv};color:#fff;border-radius:20px;padding:16px 28px;font-size:44px;font-weight:900;letter-spacing:-.01em;line-height:1}
.code{color:${C.navy}}
`, `
<div class="ph"></div>
<div class="a" style="left:72px;top:60px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a panel">
  <div class="eyebrow" style="color:${C.cv}">Kilometraža pod lupom</div>
  <h1 style="margin-top:14px">Proveri<br>kilometražu.</h1>
  <p class="sub">Uporedi dostupne zapise o kilometraži pre kupovine.</p>
  <div class="row">
    <div class="pill">20% POPUSTA</div>
    ${code('', 'padding:8px 24px 10px')}
  </div>
</div>
<div class="a" style="left:72px;bottom:54px;right:72px;display:flex;align-items:center;justify-content:space-between">
  ${mad(24, 'dark')}
  ${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:84px;font-size:26px;padding:0 34px')}
</div>
${disc(C.muted, 'position:absolute;left:72px;bottom:16px')}
`);

// IG_03 — Šta krije istorija automobila? (mystery, centered)
ad('IG_03', IG, 1080, 1350, 'ig03', `
.bg{background-image:url(../backgrounds/ig03.png)}
.shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,0) 0%,rgba(3,6,14,.6) 70%),linear-gradient(180deg,rgba(3,6,14,.85),rgba(3,6,14,0) 45%,rgba(3,6,14,.92) 78%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:96px;line-height:1.02;color:#fff}
h1 em{font-style:normal;color:${C.cvY}}
.card{background:#fff;border-radius:30px;padding:28px 40px;display:flex;align-items:center;gap:32px;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.card .l b{display:block;font-size:54px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.card .l span{display:block;font-size:24px;font-weight:600;margin-top:8px;color:${C.navy}}
.card .l strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:60px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a center" style="top:180px">
  <h1>Šta krije<br>istorija automobila<em>?</em></h1>
</div>
<div class="a center" style="top:920px">
  <div style="color:rgba(255,255,255,.9);font-size:28px;font-weight:600">Proveri dostupne podatke pre kupovine</div>
</div>
<div class="a center" style="top:985px">
  <div class="card">
    <div class="l" style="text-align:left">
      <b>20% POPUSTA</b>
      <span>Kod: <strong>${CODE}</strong></span>
    </div>
    ${cta('b', 'PROVERI ISTORIJU', 'height:84px;font-size:26px;padding:0 32px')}
  </div>
</div>
${disc('rgba(255,255,255,.68)', 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// IG_04 — 20% popusta na carVertical (bold blue typographic)
ad('IG_04', IG, 1080, 1350, null, `
body{background:${C.cv}}
.ring{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.16)}
.big{font-size:420px;color:#fff;font-weight:900;letter-spacing:-.06em;line-height:.8}
.bar{display:inline-block;background:${C.cvY};color:${C.ink};font-size:114px;font-weight:900;letter-spacing:.02em;padding:6px 34px 10px;transform:rotate(-2.5deg);line-height:1}
.sub{color:#fff;font-size:42px;font-weight:600;letter-spacing:-.01em}
.ticket{background:#fff;color:${C.navy};border-radius:24px;padding:20px 38px;display:flex;align-items:center;gap:20px;font-size:28px;font-weight:600}
.ticket b{font-size:46px;font-weight:900;letter-spacing:.05em;color:${C.cv}}
`, `
<div class="ring" style="width:1300px;height:1300px;left:-110px;top:-90px"></div>
<div class="ring" style="width:900px;height:900px;left:90px;top:110px"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(48, 'white')}
  <div style="display:inline-flex;align-items:center;background:#fff;border-radius:999px;padding:6px 20px;box-shadow:0 4px 16px rgba(0,0,0,.16);">${mad(24, 'dark')}</div>
</div>
<div class="a center" style="top:250px"><div class="big">20%</div></div>
<div class="a center" style="top:595px"><div class="bar">POPUSTA</div></div>
<div class="a center" style="top:765px"><div class="sub">na carVertical izveštaje o istoriji vozila</div></div>
<div class="a center" style="top:865px"><div class="ticket">Promo kod: <b>${CODE}</b></div></div>
<div class="a center" style="top:1020px">${cta('n', 'PROVERI ISTORIJU VOZILA')}</div>
${disc('rgba(255,255,255,.75)', 'position:absolute;left:0;right:0;bottom:50px;text-align:center')}
`);

// IG_05 — Polovan auto? Proveri pre kupovine. (bright inspection, floating card)
ad('IG_05', IG, 1080, 1350, 'ig05', `
.bg{background-image:url(../backgrounds/ig05.png)}
.fade{position:absolute;left:0;right:0;top:0;height:560px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.85) 55%,rgba(255,255,255,0) 100%)}
h1{font-size:94px;font-weight:900;letter-spacing:-.04em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.card{left:64px;right:64px;bottom:64px;background:#fff;border-radius:34px;padding:36px 42px 34px;box-shadow:0 24px 70px rgba(11,22,48,.28)}
.top{display:flex;justify-content:space-between;align-items:flex-start}
.top b{display:block;font-size:70px;font-weight:900;color:${C.cv};letter-spacing:-.03em;line-height:1}
.top span{display:block;font-size:26px;font-weight:600;color:${C.navy};margin-top:10px}
.top strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="fade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Polovan auto?<br><span>Proveri pre kupovine.</span></h1>
</div>
<div class="a card">
  <div class="top">
    <div>
      <b>20% POPUSTA</b>
      <span>Promo kod: <strong>${CODE}</strong></span>
    </div>
  </div>
  ${cta('b', 'PROVERI ISTORIJU VOZILA', 'width:100%;margin-top:26px')}
  ${disc(C.muted, 'margin-top:18px;text-align:center')}
</div>
`);

// IG_06 — Saznaj više o prošlosti vozila (official report mockup, polaroid on sky blue)
ad('IG_06', IG, 1080, 1350, null, `
body{background:${C.cvSky}}
h1{font-size:86px;font-weight:800;letter-spacing:-.03em;line-height:1.05;color:${C.ink}}
.pol{left:120px;top:385px;width:840px;background:#fff;border-radius:22px;padding:22px 22px 76px;transform:rotate(-3deg);box-shadow:0 30px 60px rgba(0,60,140,.25)}
.pol img{display:block;width:100%;height:470px;object-fit:cover;object-position:52% 40%;border-radius:12px}
.pol .cap{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-size:22px;color:${C.muted};font-weight:500}
.stk{right:70px;top:320px;width:230px;height:230px;border-radius:50%;background:${C.cv};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(10deg);box-shadow:0 14px 30px rgba(0,60,140,.35);border:6px solid #fff}
.stk b{font-size:78px;font-weight:900;letter-spacing:-.04em;line-height:.9}
.stk span{font-size:27px;font-weight:800;letter-spacing:.06em}
.line{font-size:30px;font-weight:600;color:${C.ink}}
.line strong{font-weight:900;letter-spacing:.05em;color:${C.cv}}
`, `
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:150px">
  <h1>Saznaj više o<br>prošlosti vozila.</h1>
</div>
<div class="a pol"><img src="../brand/cv-mockup-3.png"><div class="cap">Ilustrativni prikaz carVertical izveštaja</div></div>
<div class="a stk"><b>20%</b><span>POPUSTA</span></div>
<div class="a center" style="top:1030px"><div class="line">Promo kod: <strong>${CODE}</strong></div></div>
<div class="a center" style="top:1090px">${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:90px;font-size:30px;font-weight:800')}</div>
<div class="a" style="left:72px;right:72px;bottom:38px;display:flex;justify-content:space-between;align-items:center">
  ${mad(22, 'dark')}
  ${disc('#2A3A55', 'font-size:19px')}
</div>
`);

// IG_07 — Pametnija kupovina počinje proverom. (split: blue panel + photo)
ad('IG_07', IG, 1080, 1350, 'ig07', `
.ph{position:absolute;left:470px;top:0;width:610px;height:1060px;background:url(../backgrounds/ig07.png) 65% center/cover}
.side{position:absolute;left:0;top:0;width:470px;height:1060px;background:${C.cv}}
h1{font-size:74px;font-weight:900;color:#fff;letter-spacing:-.035em;line-height:1.02}
.sub{color:rgba(255,255,255,.9);font-size:28px;line-height:1.35;margin-top:24px;font-weight:500}
.strip{left:0;right:0;bottom:0;height:290px;background:#fff;padding:38px 64px 0;}
.r{display:flex;align-items:center;justify-content:space-between}
.r .o b{display:block;font-size:60px;font-weight:900;color:${C.cv};letter-spacing:-.02em;line-height:1}
.r .o span{display:block;font-size:25px;font-weight:600;color:${C.navy};margin-top:8px}
.r .o strong{font-weight:900;letter-spacing:.05em}
.tag{right:40px;top:40px;background:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 8px 24px rgba(0,0,0,.15)}
`, `
<div class="ph"></div><div class="side"></div>
<div class="a" style="left:60px;top:66px">${cvLogo(38, 'white')}</div>
<div class="a" style="left:60px;top:260px;width:380px">
  <h1>Pametnija kupovina počinje proverom.</h1>
  <p class="sub">Pre kupovine proveri dostupne podatke o istoriji vozila.</p>
</div>
<div class="a tag">${mad(22, 'dark')}</div>
<div class="a strip">
  <div class="r">
    <div class="o"><b>20% POPUSTA</b><span>Promo kod: <strong>${CODE}</strong></span></div>
    ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
  </div>
  ${disc(C.muted, 'margin-top:34px')}
</div>
`);

// IG_08 — MojAutoDiler preporučuje proveru istorije (co-branded, carVertical dominant)
ad('IG_08', IG, 1080, 1350, 'ig08', `
.bg{background-image:url(../backgrounds/ig08.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,26,.92) 0%,rgba(8,12,26,.4) 40%,rgba(8,12,26,.45) 58%,rgba(8,12,26,.96) 100%)}
.frame{position:absolute;inset:34px;border:2px solid rgba(197,155,76,.5);border-radius:8px}
h1{font-weight:900;letter-spacing:-.035em;font-size:80px;line-height:1.04;color:#fff}
h1 em{font-style:normal;color:${C.goldL}}
.subt{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:18px}
.off{font-size:46px;font-weight:900;color:${C.goldL};letter-spacing:-.01em}
.off span{color:#fff;font-weight:600;font-size:30px}
.code{color:${C.goldL}}
`, `
<div class="bg"></div><div class="shade"></div><div class="frame"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a center" style="top:220px">
  <h1>Proveri istoriju<br><em>pre kupovine.</em></h1>
  <p class="subt">MojAutoDiler preporučuje carVertical izveštaj.</p>
</div>
<div class="a center" style="top:860px"><div class="off">20% POPUSTA <span>na izveštaje</span></div></div>
<div class="a center" style="top:940px">${code()}</div>
<div class="a center" style="top:1080px">${cta('b', 'PROVERI ISTORIJU VOZILA', 'height:88px;font-size:28px')}</div>
${disc('rgba(255,255,255,.65)', 'position:absolute;left:0;right:0;bottom:54px;text-align:center')}
`);

// IG_09 — Proveri dostupne podatke o oštećenjima (white top / detail photo)
ad('IG_09', IG, 1080, 1350, 'ig09', `
body{background:#fff}
.ph{position:absolute;left:0;top:560px;width:1080px;height:790px;background:url(../backgrounds/ig09.png) center/cover}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(255,255,255,0) 18%,rgba(5,10,25,0) 50%,rgba(5,10,25,.9) 100%)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.chip{display:inline-flex;align-items:center;gap:14px;background:${C.cvY};border-radius:999px;padding:12px 26px;font-size:32px;font-weight:900}
.bot{left:64px;right:64px;bottom:76px;display:flex;align-items:center;justify-content:space-between}
.bot .code{color:#fff}
`, `
<div class="ph"></div>
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Proveri dostupne<br>podatke o <span>oštećenjima.</span></h1>
  <div class="chip" style="margin-top:28px">${icon('search', 32, C.ink, 2.4)} 20% POPUSTA</div>
</div>
<div class="a bot">
  ${code('', 'padding:8px 24px 10px')}
  ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:0;right:0;bottom:30px;text-align:center')}
`);

// IG_10 — Tvoj sledeći auto zaslužuje proveru (golden-hour lifestyle)
ad('IG_10', IG, 1080, 1350, 'ig08', `
.bg{background-image:url(../backgrounds/ig10.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,14,30,.75) 0%,rgba(10,14,30,0) 38%,rgba(10,14,30,0) 60%,rgba(10,14,30,.88) 100%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:86px;line-height:1.02;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.35)}
.bar{left:56px;right:56px;bottom:116px;display:grid;grid-template-columns:auto 1fr;gap:0;border-radius:30px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35)}
.b1{background:${C.cv};color:#fff;padding:24px 32px;display:flex;flex-direction:column;justify-content:center}
.b1 b{font-size:88px;font-weight:900;letter-spacing:-.05em;line-height:.85}
.b1 span{font-size:28px;font-weight:800;letter-spacing:.08em;margin-top:6px}
.b2{background:#fff;padding:22px 30px;display:flex;flex-direction:column;justify-content:center;gap:14px}
.b2 .t{font-size:24px;font-weight:600;color:${C.navy}}
.b2 .t strong{font-weight:900;letter-spacing:.05em;font-size:32px;color:${C.cv}}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:60px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a center" style="top:180px">
  <h1>Tvoj sledeći auto<br>zaslužuje proveru.</h1>
</div>
<div class="a bar">
  <div class="b1"><b>20%</b><span>POPUSTA</span></div>
  <div class="b2">
    <div class="t">Promo kod: <strong>${CODE}</strong></div>
    ${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:74px;font-size:24px;padding:0 28px;align-self:flex-start')}
  </div>
</div>
${disc('rgba(255,255,255,.78)', 'position:absolute;left:0;right:0;bottom:52px;text-align:center')}
`);

// ============================================================================
// GROUP B: FACEBOOK (1080 × 1350 px, 4:5)
// ============================================================================

// FB_11 — Kupuješ polovan automobil? (bubble + blue bar)
ad('FB_11', FB, 1080, 1350, 'fb11', `
.bg{background-image:url(../backgrounds/fb11.png)}
.bub{left:60px;top:160px;width:720px;background:#fff;border-radius:34px 34px 34px 6px;padding:38px 44px;box-shadow:0 24px 60px rgba(0,0,0,.25)}
h1{font-size:84px;font-weight:900;letter-spacing:-.035em;line-height:1;color:${C.navy}}
.sub{font-size:28px;color:#3A3A4A;margin-top:16px;line-height:1.3}
.barx{left:0;right:0;bottom:0;height:320px;background:${C.cv};padding:36px 64px 0}
.r{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
.o b{display:block;font-size:62px;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:1}
.o span{display:block;font-size:25px;color:#fff;font-weight:600;margin-top:8px}
.o strong{font-weight:900;letter-spacing:.05em;background:rgba(255,255,255,.18);padding:2px 10px;border-radius:8px}
.tag{right:56px;top:56px;background:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 6px 20px rgba(0,0,0,.15)}
`, `
<div class="bg"></div>
<div class="a" style="left:60px;top:56px">${cvLogo(42, 'white')}</div>
<div class="a tag">${mad(22, 'dark')}</div>
<div class="a bub">
  <h1>Kupuješ polovan automobil?</h1>
  <p class="sub">Proveri dostupnu istoriju vozila pre nego što platiš.</p>
</div>
<div class="a barx">
  <div class="r">
    <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
    ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
  </div>
  ${disc('rgba(255,255,255,.75)', 'margin-top:26px')}
</div>
`);

// FB_12 — Istorija vozila može biti važna (clean report-themed tiles)
const tile = (ic, t) => `<div class="tile"><div class="ic">${icon(ic, 50, C.cv, 1.9)}</div><span>${t}</span></div>`;
ad('FB_12', FB, 1080, 1350, null, `
body{background:#F5F8FD}
h1{font-size:86px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.lbl{font-size:28px;color:#3A3A4A;font-weight:600}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;left:72px;right:72px;top:500px}
.tile{background:#fff;border-radius:26px;padding:26px 28px;display:flex;align-items:center;gap:20px;box-shadow:0 8px 24px rgba(11,22,48,.07);border:1.5px solid #E5ECF7}
.tile .ic{width:80px;height:80px;border-radius:20px;background:#E8F2FF;display:flex;align-items:center;justify-content:center}
.tile span{font-size:32px;font-weight:700;color:${C.navy}}
.box{left:72px;right:72px;bottom:104px;background:${C.cv};border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between}
.box .o b{display:block;font-size:56px;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:1}
.box .o span{display:block;font-size:25px;color:#fff;font-weight:600;margin-top:8px}
.box .o strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Istorija vozila<br><span>može biti važna.</span></h1>
</div>
<div class="a lbl" style="left:72px;top:440px">Izveštaj može sadržati dostupne podatke o:</div>
<div class="a grid">${tile('gauge', 'Kilometraži')}${tile('car', 'Oštećenjima')}${tile('lock', 'Krađi')}${tile('cam', 'Fotografijama')}</div>
<div class="a box">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc(C.muted, 'position:absolute;left:0;right:0;bottom:46px;text-align:center')}
`);

// FB_13 — Proveri pre nego što odlučiš (dealership, sticker)
ad('FB_13', FB, 1080, 1350, 'fb13', `
body{background:#fff}
.ph{position:absolute;left:0;top:0;width:1080px;height:750px;background:url(../backgrounds/fb13.png) center/cover}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,0) 25%)}
.wave{left:0;top:690px;width:1080px;height:660px;background:#fff;border-radius:60px 60px 0 0}
h1{font-size:88px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:${C.navy}}
.stk{right:64px;top:550px;width:240px;height:240px;border-radius:50%;background:${C.cvY};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-8deg);box-shadow:0 18px 40px rgba(0,0,0,.25)}
.stk b{font-size:88px;font-weight:900;letter-spacing:-.05em;line-height:.85}
.stk span{font-size:28px;font-weight:900;letter-spacing:.06em}
.r{display:flex;align-items:center;gap:22px}
.code{color:${C.navy}}
`, `
<div class="ph"></div>
<div class="a" style="left:64px;top:56px;right:64px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  <div style="background:#fff;border-radius:999px;padding:8px 16px;">${mad(22, 'dark')}</div>
</div>
<div class="a wave"></div>
<div class="a stk"><b>20%</b><span>POPUSTA</span></div>
<div class="a" style="left:72px;top:770px">
  <h1>Proveri pre nego<br>što odlučiš.</h1>
  <p style="font-size:30px;color:#3A3A4A;margin-top:16px">Proveri dostupnu istoriju vozila uz carVertical.</p>
</div>
<div class="a r" style="left:72px;top:1040px">
  ${code('', 'padding:8px 22px 10px')}
  ${cta('b', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
</div>
<div class="a" style="left:72px;right:72px;bottom:40px;display:flex;justify-content:space-between;align-items:center">
  ${mad(22, 'dark')}
  ${disc(C.muted, 'font-size:19px')}
</div>
`);

// FB_14 — 20% popusta uz MOJAUTODILER (coupon ticket typography)
ad('FB_14', FB, 1080, 1350, null, `
body{background:#F2F5FA}
h1{font-size:74px;font-weight:900;letter-spacing:-.035em;line-height:1.04;color:${C.navy};text-align:center}
h1 span{color:${C.cv}}
.tk{left:90px;right:90px;top:430px;height:520px;display:flex;filter:drop-shadow(0 26px 40px rgba(0,60,140,.28))}
.tk .m{flex:1;background:${C.cv};border-radius:30px 0 0 30px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;
  -webkit-mask:radial-gradient(circle 30px at 100% 0,transparent 98%,#000) top/100% 51% no-repeat,radial-gradient(circle 30px at 100% 100%,transparent 98%,#000) bottom/100% 51% no-repeat}
.tk .m b{font-size:260px;font-weight:900;letter-spacing:-.06em;line-height:.8}
.tk .m span{font-size:62px;font-weight:900;letter-spacing:.1em;margin-top:18px}
.tk .s{width:250px;background:${C.cvY};border-radius:0 30px 30px 0;border-left:5px dashed rgba(11,22,48,.35);display:flex;align-items:center;justify-content:center;
  -webkit-mask:radial-gradient(circle 30px at 0 0,transparent 98%,#000) top/100% 51% no-repeat,radial-gradient(circle 30px at 0 100%,transparent 98%,#000) bottom/100% 51% no-repeat}
.tk .s div{transform:rotate(-90deg);text-align:center;white-space:nowrap}
.tk .s small{display:block;font-size:22px;font-weight:700;letter-spacing:.26em}
.tk .s strong{display:block;font-size:46px;font-weight:900;letter-spacing:.05em}
`, `
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a center" style="top:190px">
  <h1>20% popusta uz kod<br><span>${CODE}</span></h1>
</div>
<div class="a tk"><div class="m"><b>20%</b><span>POPUSTA</span></div><div class="s"><div><small>PROMO KOD</small><strong>${CODE}</strong></div></div></div>
<div class="a center" style="top:1000px"><p style="font-size:31px;color:#3A3A4A;font-weight:500">na carVertical izveštaje o istoriji vozila</p></div>
<div class="a center" style="top:1080px">${cta('y', 'PROVERI ISTORIJU VOZILA')}</div>
${disc(C.muted, 'position:absolute;left:0;right:0;bottom:48px;text-align:center')}
`);

// FB_15 — Proveri dostupne podatke o kilometraži (amber odometer + counter)
ad('FB_15', FB, 1080, 1350, 'fb15', `
.bg{background-image:url(../backgrounds/fb15.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,14,.9) 0%,rgba(8,8,14,.35) 45%,rgba(8,8,14,.5) 62%,rgba(8,8,14,.96) 100%)}
h1{font-size:78px;font-weight:900;letter-spacing:-.035em;line-height:1.03;color:#fff}
h1 span{color:${C.cvY}}
.odo{display:flex;gap:10px;padding:18px;background:rgba(0,0,0,.55);border-radius:20px;border:2px solid rgba(255,255,255,.18)}
.odo div{width:96px;height:130px;border-radius:12px;background:linear-gradient(180deg,#1b1f2a,#0a0c12 50%,#1b1f2a);color:#fff;font-size:86px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.odo .u{width:auto;background:none;box-shadow:none;font-size:40px;color:rgba(255,255,255,.8);padding:0 10px}
.panel{left:64px;right:64px;bottom:94px;background:${C.cv};border-radius:30px;padding:28px 36px;display:flex;align-items:center;justify-content:space-between}
.panel .o b{display:block;font-size:56px;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:1}
.panel .o span{display:block;font-size:24px;color:#fff;font-weight:600;margin-top:8px}
.panel .o strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(40, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:180px">
  <h1>Proveri dostupne podatke<br>o <span>kilometraži.</span></h1>
</div>
<div class="a center" style="top:560px"><div class="odo"><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div><div class="u">km</div></div></div>
<div class="a panel">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// FB_16 — Više informacija. Bolja odluka. (minimal white + car)
ad('FB_16', FB, 1080, 1350, 'fb16', `
body{background:#fff}
.ph{position:absolute;left:0;top:380px;width:1080px;height:660px;background:url(../backgrounds/fb16.png) center 62%/cover}
h1{font-size:94px;font-weight:800;letter-spacing:-.04em;line-height:1.02;color:${C.ink}}
h1 span{color:${C.cv}}
.rule{left:72px;right:72px;top:1060px;height:2px;background:#E2E2EA}
.r{left:72px;right:72px;top:1095px;display:flex;align-items:center;justify-content:space-between}
.r .o b{display:block;font-size:54px;font-weight:900;color:${C.cv};letter-spacing:-.02em;line-height:1}
.r .o span{display:block;font-size:25px;font-weight:600;margin-top:8px}
.r .o strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="ph"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:160px">
  <h1>Više informacija.<br><span>Bolja odluka.</span></h1>
</div>
<div class="a rule"></div>
<div class="a r">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('b', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
</div>
${disc(C.muted, 'position:absolute;left:72px;bottom:44px')}
`);

// FB_17 — Automobil izgleda odlično. A istorija? (dramatic night)
ad('FB_17', FB, 1080, 1350, 'fb17', `
.bg{background-image:url(../backgrounds/fb17.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,16,.88) 0%,rgba(2,6,16,.1) 42%,rgba(2,6,16,.2) 60%,rgba(2,6,16,.96) 100%)}
.l1{font-size:64px;font-weight:700;color:#fff;letter-spacing:-.03em}
.l2{font-size:144px;font-weight:900;color:${C.cvY};letter-spacing:-.05em;line-height:.95}
.r{left:64px;right:64px;bottom:106px;display:flex;align-items:flex-end;justify-content:space-between}
.r .o b{display:block;font-size:62px;font-weight:900;color:#fff;letter-spacing:-.02em;line-height:1}
.r .code{color:#fff;margin-top:16px}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:180px">
  <div class="l1">Automobil izgleda odlično.</div>
  <div class="l2">A istorija?</div>
</div>
<div class="a r">
  <div class="o"><b>20% POPUSTA</b>${code('', 'padding:8px 22px 10px')}</div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:0;right:0;bottom:44px;text-align:center')}
`);

// FB_18 — carVertical × MojAutoDiler (carVertical primary co-branding)
ad('FB_18', FB, 1080, 1350, null, `
body{background:${C.cv}}
.top{position:absolute;inset:0;background:linear-gradient(160deg,#0B1630 0%,#121f3f 100%);clip-path:polygon(0 0,100% 0,100% 50%,0 60%)}
.goldline{position:absolute;inset:0;background:${C.gold};clip-path:polygon(0 60%,100% 50%,100% 50.6%,0 60.6%)}
.o{font-size:56px;font-weight:900;color:#fff;letter-spacing:-.02em}
.o span{background:${C.cvY};color:${C.ink};padding:2px 16px;border-radius:12px}
.code{color:#fff}
.mockup-wrap{position:absolute;left:90px;right:90px;top:240px;height:470px;display:flex;align-items:center;justify-content:center}
.mockup-card{width:860px;height:440px;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.65),0 0 0 1.5px rgba(255,255,255,.18);position:relative}
.mockup-card img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.mockup-tag{position:absolute;bottom:16px;right:20px;background:rgba(11,22,48,.85);backdrop-filter:blur(10px);color:rgba(255,255,255,.9);font-size:17px;font-weight:600;padding:6px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2)}
`, `
<div class="top"></div><div class="goldline"></div>
<div class="a center" style="top:55px">
  <div style="font-size:22px;font-weight:700;letter-spacing:.2em;color:rgba(255,255,255,.75);margin-bottom:14px;">PROVERA ISTORIJE VOZILA</div>
  ${cvLogo(56, 'white')}
  <div style="margin-top:16px;display:inline-flex;align-items:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:6px 20px;">
    ${mad(24, 'light')}
  </div>
</div>
<div class="mockup-wrap">
  <div class="mockup-card">
    <img src="../brand/cv-mockup-2.png" />
    <div class="mockup-tag">carVertical digitalni izveštaj</div>
  </div>
</div>
<div class="a center" style="top:765px">
  <div style="color:#fff;font-size:32px;font-weight:600;margin-bottom:18px;">Zajedno za sigurniju kupovinu automobila</div>
  <div class="o"><span>20% POPUSTA</span> na izveštaje</div>
</div>
<div class="a center" style="top:940px">${code()}</div>
<div class="a center" style="top:1100px">${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:88px;font-size:28px')}</div>
${disc('rgba(255,255,255,.78)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_19 — Saznaj dostupnu istoriju vozila (official mockup on navy, digital)
ad('FB_19', FB, 1080, 1350, null, `
body{background:${C.navy}}
.ph{position:absolute;left:0;top:0;width:1080px;height:760px;background:url(../brand/cv-mockup-1.png) 42% 35%/auto 125% no-repeat}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,22,48,.6) 0%,rgba(11,22,48,0) 22%,rgba(11,22,48,0) 70%,${C.navy} 100%)}
.cap{right:40px;top:700px;font-size:19px;color:rgba(255,255,255,.65)}
h1{font-size:86px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:#5AA9FF}
.r{left:72px;right:72px;top:1060px;display:flex;align-items:center;justify-content:space-between}
.o b{display:block;font-size:58px;font-weight:900;color:${C.cvY};letter-spacing:-.02em;line-height:1}
.o span{display:block;font-size:25px;font-weight:600;color:#fff;margin-top:8px}
.o strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="ph"></div>
<div class="a" style="left:72px;top:60px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a cap">Ilustrativni prikaz carVertical izveštaja</div>
<div class="a" style="left:72px;top:770px">
  <h1>Saznaj dostupnu<br><span>istoriju vozila.</span></h1>
</div>
<div class="a r">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:86px;font-size:27px;padding:0 34px')}
</div>
<div class="a" style="left:72px;right:72px;bottom:42px;display:flex;justify-content:space-between;align-items:center">
  ${mad(22, 'light')}
  ${disc('rgba(255,255,255,.65)', 'font-size:19px')}
</div>
`);

// FB_20 — Pre kupovine proveri ono što možeš (buyer education checklist)
const step = (n, t, hi) => `<div class="st ${hi ? 'hi' : ''}"><div class="n">${hi ? icon('check', 32, '#fff', 3) : n}</div><span>${t}</span></div>`;
ad('FB_20', FB, 1080, 1350, 'fb20', `
body{background:#fff}
.ph{position:absolute;left:0;top:0;width:1080px;height:450px;background:url(../backgrounds/fb20.png) center 30%/cover}
h1{font-size:72px;font-weight:900;letter-spacing:-.035em;line-height:1.03;color:${C.navy}}
.st{display:flex;align-items:center;gap:20px;font-size:30px;font-weight:600;color:${C.navy};padding:12px 0}
.st .n{width:54px;height:54px;border-radius:50%;background:#E8F2FF;color:${C.cv};font-weight:900;font-size:26px;display:flex;align-items:center;justify-content:center;flex:none}
.st.hi{background:#E8F2FF;border-radius:20px;padding:12px 20px;margin-left:-20px}
.st.hi .n{background:${C.cv}}
.st.hi span{font-weight:800;color:${C.cv}}
.r{left:72px;right:72px;bottom:94px;display:flex;align-items:center;justify-content:space-between}
.o b{display:block;font-size:50px;font-weight:900;color:${C.cv};letter-spacing:-.02em;line-height:1}
.o span{display:block;font-size:24px;font-weight:600;margin-top:6px;color:${C.navy}}
.o strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="ph"></div>
<div class="a" style="left:56px;top:48px;right:56px;display:flex;justify-content:space-between;align-items:center">
  <div style="background:#fff;border-radius:999px;padding:12px 24px;box-shadow:0 6px 20px rgba(0,0,0,.12);">${cvLogo(32, 'primary')}</div>
  <div style="background:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 6px 20px rgba(0,0,0,.12);">${mad(22, 'dark')}</div>
</div>
<div class="a" style="left:72px;top:490px">
  <h1>Pre kupovine proveri<br>ono što možeš.</h1>
</div>
<div class="a" style="left:72px;top:670px;right:72px">
  ${step(1, 'Pregledaj vozilo uživo')}
  ${step(2, 'Obavi probnu vožnju')}
  ${step(3, 'Zatraži pregled kod mehaničara')}
  ${step(4, 'Proveri dostupnu istoriju vozila', true)}
</div>
<div class="a r">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
  ${cta('y', 'PROVERI ISTORIJU', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc(C.muted, 'position:absolute;left:72px;bottom:38px')}
`);

// ============================================================================
// GROUP C: TIKTOK & STORIES (1080 × 1920 px, 9:16)
// ============================================================================
const ttFooter = (theme = 'light') =>
  disc(theme === 'light' ? 'rgba(255,255,255,.72)' : C.muted, 'position:absolute;left:80px;right:140px;top:1590px;text-align:center;font-size:23px');

// TT_01 — STOP! Kupuješ polovan auto?
ad('TT_01', TT, 1080, 1920, 'tt21', `
.bg{background-image:url(../backgrounds/tt21.png);filter:saturate(.75)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,16,.9) 0%,rgba(5,8,16,.55) 40%,rgba(5,8,16,.3) 55%,rgba(5,8,16,.95) 82%)}
.stop{display:inline-block;background:${C.cvY};color:${C.ink};font-size:240px;font-weight:900;letter-spacing:-.05em;line-height:1;padding:10px 50px 24px;transform:rotate(-4deg);box-shadow:0 20px 50px rgba(0,0,0,.4)}
h1{font-size:100px;font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1}
.sub{font-size:36px;color:rgba(255,255,255,.9);font-weight:500;line-height:1.3}
.card{background:#fff;border-radius:36px;padding:34px 42px;display:flex;flex-direction:column;align-items:center;gap:18px;width:860px}
.card b{font-size:80px;font-weight:900;color:${C.cv};letter-spacing:-.03em;line-height:1}
.card .code{color:${C.navy}}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a center" style="top:410px"><div class="stop">STOP!</div></div>
<div class="a center" style="top:740px"><h1>Kupuješ<br>polovan auto?</h1></div>
<div class="a center" style="top:980px"><p class="sub">Proveri dostupnu istoriju<br>vozila pre kupovine.</p></div>
<div class="a center" style="top:1160px">
  <div class="card">
    <b>20% POPUSTA</b>
    ${code('', 'padding:8px 30px 10px')}
    ${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:90px;font-size:29px')}
  </div>
</div>
${ttFooter('light')}
`);

// TT_02 — A kilometraža? (bold minimal)
ad('TT_02', TT, 1080, 1920, null, `
body{background:#fff}
.dots{position:absolute;inset:0;background-image:radial-gradient(#DCE8F8 2px,transparent 2px);background-size:36px 36px;opacity:.7}
.a1{font-size:190px;font-weight:900;color:${C.ink};letter-spacing:-.06em;line-height:.9}
.a2{font-size:150px;font-weight:900;color:${C.cv};letter-spacing:-.06em;line-height:.95}
.odo{display:flex;gap:12px}
.odo div{width:110px;height:150px;border-radius:16px;background:${C.navy};color:#fff;font-size:96px;font-weight:800;display:flex;align-items:center;justify-content:center}
.odo div:nth-child(odd){background:${C.cv}}
.sub{font-size:38px;color:#3A3A4A;font-weight:500;line-height:1.3}
.o{font-size:88px;font-weight:900;color:${C.ink};letter-spacing:-.03em;line-height:1}
.o span{background:${C.cvY};padding:0 18px;border-radius:14px}
.code{color:${C.navy}}
`, `
<div class="dots"></div>
<div class="a" style="left:90px;top:280px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:90px;top:420px"><div class="a1">A</div><div class="a2">kilometraža?</div></div>
<div class="a" style="left:90px;top:770px"><div class="odo"><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div></div></div>
<div class="a" style="left:90px;top:965px"><p class="sub">Proveri dostupne podatke o<br>kilometraži pre kupovine.</p></div>
<div class="a" style="left:90px;top:1130px"><div class="o"><span>20% POPUSTA</span></div></div>
<div class="a" style="left:90px;top:1260px">${code('', 'padding:8px 26px 10px')}</div>
<div class="a" style="left:90px;top:1410px">${cta('b', 'PROVERI ISTORIJU VOZILA', 'height:94px;font-size:30px')}</div>
${disc(C.muted, 'position:absolute;left:90px;top:1590px;font-size:24px')}
`);

// TT_03 — Da li znaš istoriju ovog auta? (cinematic)
ad('TT_03', TT, 1080, 1920, 'tt23', `
.bg{background-image:url(../backgrounds/tt23.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,16,.9) 0%,rgba(2,6,16,.2) 38%,rgba(2,6,16,.15) 52%,rgba(2,6,16,.95) 80%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:104px;line-height:1.02;color:#fff}
h1 em{font-style:normal;color:#5AA9FF}
.ln{width:120px;height:6px;background:${C.cv};border-radius:3px}
.o{font-size:92px;font-weight:900;color:#fff;letter-spacing:-.03em;line-height:1}
.code{color:#fff}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a center" style="top:410px;padding-right:40px">
  <h1>Da li znaš<br>istoriju ovog auta<em>?</em></h1>
</div>
<div class="a center" style="top:800px"><div class="ln"></div></div>
<div class="a center" style="top:1120px"><div class="o">20% POPUSTA</div></div>
<div class="a center" style="top:1240px">${code()}</div>
<div class="a center" style="top:1400px">${cta('y', 'PROVERI ISTORIJU VOZILA')}</div>
${ttFooter('light')}
`);

// TT_04 — 20% POPUSTA (yellow discount-first)
ad('TT_04', TT, 1080, 1920, null, `
body{background:${C.cvY}}
.stripe{position:absolute;left:-200px;right:-200px;height:120px;background:rgba(0,0,0,.05);transform:rotate(-12deg)}
.p{font-size:380px;font-weight:900;color:${C.ink};letter-spacing:-.07em;line-height:.8}
.w{font-size:150px;font-weight:900;color:${C.cv};letter-spacing:-.03em;line-height:1}
.sub{font-size:38px;font-weight:600;color:${C.ink};line-height:1.3}
.tk{background:${C.ink};color:#fff;border-radius:26px;padding:22px 46px;display:flex;flex-direction:column;align-items:center}
.tk small{font-size:22px;font-weight:700;letter-spacing:.26em;color:${C.cvY}}
.tk b{font-size:58px;font-weight:900;letter-spacing:.05em}
`, `
<div class="stripe" style="top:300px"></div><div class="stripe" style="top:1500px"></div>
<div class="a" style="left:90px;top:280px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  <div style="display:inline-flex;align-items:center;background:#fff;border-radius:999px;padding:6px 20px;box-shadow:0 4px 16px rgba(0,0,0,.12);">${mad(24, 'dark')}</div>
</div>
<div class="a" style="left:80px;top:470px">
  <div class="p">20%</div>
  <div class="w" style="margin-top:28px">POPUSTA</div>
</div>
<div class="a" style="left:90px;top:990px">
  <p class="sub">na carVertical izveštaje<br>o istoriji vozila</p>
</div>
<div class="a" style="left:90px;top:1160px">
  <div class="tk"><small>PROMO KOD</small><b>${CODE}</b></div>
</div>
<div class="a" style="left:90px;top:1380px">${cta('b', 'PROVERI ISTORIJU VOZILA')}</div>
${disc('#3A3A1A', 'position:absolute;left:90px;top:1590px;font-size:24px')}
`);

// TT_05 — Proveri pre nego što platiš (keys exchange — FIXED BRANDING COLLISION)
ad('TT_05', TT, 1080, 1920, 'tt25', `
.bg{background-image:url(../backgrounds/tt25.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,24,.6) 0%,rgba(5,10,24,0) 30%,rgba(5,10,24,0) 55%,rgba(5,10,24,.9) 78%)}
.box{background:#fff;border-radius:34px;padding:36px 42px;box-shadow:0 24px 60px rgba(0,0,0,.25)}
h1{font-size:94px;font-weight:900;letter-spacing:-.04em;line-height:1;color:${C.navy}}
h1 span{color:${C.cv}}
.sub{font-size:32px;color:#3A3A4A;line-height:1.3;margin-top:16px}
.card{left:80px;right:140px;top:1140px;background:${C.cv};border-radius:34px;padding:34px 38px;color:#fff}
.card .toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.card .toprow b{font-size:74px;font-weight:900;letter-spacing:-.03em;line-height:1}
.card .code-wrap{display:flex;justify-content:center}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:340px;right:140px">
  <div class="box">
    <h1>Proveri pre<br>nego što <span>platiš.</span></h1>
    <p class="sub">Pre nego što predaš novac, proveri dostupne podatke o vozilu.</p>
  </div>
</div>
<div class="a card">
  <div class="toprow">
    <b>20% POPUSTA</b>
  </div>
  <div class="code-wrap">
    ${code('', 'color:#fff;width:100%;padding:10px 20px 12px;')}
  </div>
  ${cta('y', 'PROVERI ISTORIJU VOZILA', 'width:100%;margin-top:24px;height:90px;font-size:29px')}
</div>
${ttFooter('light')}
`);

// TT_06 — Izgleda savršeno. Proveri istoriju. (headlight macro)
ad('TT_06', TT, 1080, 1920, 'tt26', `
.bg{background-image:url(../backgrounds/tt26.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,16,.88) 0%,rgba(2,6,16,.1) 35%,rgba(2,6,16,.1) 50%,rgba(2,6,16,.92) 75%)}
.l1{font-weight:900;letter-spacing:-.035em;font-size:104px;color:#fff;line-height:1}
.l2{display:inline-block;background:${C.cv};color:#fff;font-size:92px;font-weight:900;letter-spacing:-.04em;line-height:1;padding:14px 30px 18px;border-radius:18px}
.glass{left:80px;right:140px;top:1180px;border-radius:34px;background:rgba(255,255,255,.12);backdrop-filter:blur(20px);border:1.5px solid rgba(255,255,255,.25);padding:34px 40px}
.glass b{display:block;font-size:74px;font-weight:900;color:${C.cvY};letter-spacing:-.03em;line-height:1}
.glass .t{font-size:28px;color:#fff;font-weight:600;margin-top:12px}
.glass .t strong{font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:390px"><div class="l1">Izgleda<br>savršeno.</div></div>
<div class="a" style="left:80px;top:1010px"><div class="l2">Proveri istoriju.</div></div>
<div class="a glass">
  <b>20% POPUSTA</b>
  <div class="t">Promo kod: <strong>${CODE}</strong></div>
  ${cta('y', 'PROVERI ISTORIJU VOZILA', 'width:100%;margin-top:24px;height:88px;font-size:28px')}
</div>
${ttFooter('light')}
`);

// TT_07 — Jedna provera. Više informacija. (minimal report illustration)
const row = (ic, t) => `<div class="rw"><div class="ic">${icon(ic, 36, C.cv, 2)}</div><div style="flex:1"><div class="t">${t}</div><div class="sk" style="width:${60 + (t.length * 7) % 30}%"></div></div><div class="dot"></div></div>`;
ad('TT_07', TT, 1080, 1920, null, `
body{background:linear-gradient(180deg,#F3F8FF 0%,#E3EFFF 100%)}
h1{font-size:92px;font-weight:800;letter-spacing:-.04em;line-height:1.02;color:${C.ink}}
h1 span{color:${C.cv}}
.ph{left:250px;top:620px;width:500px;height:640px;background:#fff;border-radius:56px 56px 0 0;border:14px solid ${C.navy};border-bottom:none;padding:36px 28px 0;overflow:hidden;box-shadow:0 30px 70px rgba(0,60,140,.18)}
.ph .hd{display:flex;justify-content:center;margin-bottom:24px}
.rw{display:flex;align-items:center;gap:16px;padding:16px 14px;border:2px solid #E8EEF8;border-radius:18px;margin-bottom:12px}
.rw .ic{width:56px;height:56px;border-radius:14px;background:#E8F2FF;display:flex;align-items:center;justify-content:center}
.rw .t{font-size:23px;font-weight:700;color:${C.navy}}
.rw .sk{height:8px;border-radius:4px;background:#E8EEF8;margin-top:8px}
.rw .dot{width:14px;height:14px;border-radius:50%;background:#CBD8EA}
.base{left:0;right:0;top:1260px;height:6px;background:${C.navy}}
.card{left:80px;right:140px;top:1300px;display:flex;align-items:center;justify-content:space-between}
.o b{display:block;font-size:60px;font-weight:900;color:${C.cv};letter-spacing:-.02em;line-height:1}
.o span{display:block;font-size:25px;font-weight:600;margin-top:8px;color:${C.navy}}
.o strong{font-weight:900;letter-spacing:.05em}
.cap{font-size:20px;color:${C.muted}}
`, `
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:80px;top:380px">
  <h1>Jedna provera.<br><span>Više informacija.</span></h1>
</div>
<div class="a ph"><div class="hd">${cvLogo(26, 'primary')}</div>${row('gauge', 'Kilometraža')}${row('car', 'Oštećenja')}${row('cam', 'Fotografije')}${row('lock', 'Krađa')}${row('doc', 'Registracije')}</div>
<div class="a base"></div>
<div class="a card">
  <div class="o"><b>20% POPUSTA</b><span>Kod: <strong>${CODE}</strong></span></div>
</div>
<div class="a" style="left:80px;top:1430px">${cta('y', 'PROVERI ISTORIJU VOZILA', 'height:90px;font-size:29px')}</div>
${disc(C.muted, 'position:absolute;left:80px;top:1590px;font-size:23px')}
<div class="a cap" style="right:80px;top:1645px">Ilustracija; bez stvarnih podataka.</div>
`);

// TT_08 — Kupuj informisanije (lifestyle)
ad('TT_08', TT, 1080, 1920, 'tt28', `
.bg{background-image:url(../backgrounds/tt28.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,26,.92) 0%,rgba(8,12,26,.85) 36%,rgba(8,12,26,.55) 54%,rgba(8,12,26,.95) 75%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:120px;color:#fff;line-height:.98;text-shadow:0 4px 30px rgba(0,0,0,.3)}
h1 em{font-style:normal;color:${C.cvY}}
.sub{font-size:34px;color:#fff;font-weight:600;line-height:1.3;text-shadow:0 2px 20px rgba(0,0,0,.9)}
.o{display:flex;align-items:center;gap:24px}
.o b{font-size:80px;font-weight:900;color:#fff;letter-spacing:-.03em;line-height:1;background:${C.cv};padding:10px 24px 14px;border-radius:18px}
.code{color:#fff}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:390px">
  <h1>Kupuj<br><em>informisanije.</em></h1>
  <p class="sub" style="margin-top:24px">Proveri dostupnu istoriju vozila<br>pre nego što doneseš odluku.</p>
</div>
<div class="a" style="left:80px;top:1130px"><div class="o"><b>20% POPUSTA</b></div></div>
<div class="a" style="left:80px;top:1260px">${code()}</div>
<div class="a" style="left:80px;top:1410px">${cta('y', 'PROVERI ISTORIJU VOZILA')}</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_09 — carVertical + MojAutoDiler (carVertical dominant co-brand)
ad('TT_09', TT, 1080, 1920, 'tt29', `
.bg{background-image:url(../backgrounds/tt29.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,.94) 0%,rgba(6,10,24,.4) 36%,rgba(6,10,24,.35) 52%,rgba(6,10,24,.96) 72%)}
.frame{position:absolute;left:50px;right:50px;top:230px;bottom:300px;border:2px solid rgba(197,155,76,.5);border-radius:10px}
.o{font-size:74px;font-weight:900;color:${C.goldL};letter-spacing:-.02em}
.code{color:#fff}
.tag{font-size:24px;font-weight:700;letter-spacing:.26em;color:rgba(255,255,255,.75)}
`, `
<div class="bg"></div><div class="shade"></div><div class="frame"></div>
<div class="a center" style="top:280px"><div class="tag">SPECIJALNA PONUDA</div></div>
<div class="a center" style="top:350px">
  ${cvLogo(58, 'white')}
  <div style="margin-top:26px;display:inline-flex;align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:8px 22px;">
    ${mad(24, 'light')}
  </div>
</div>
<div class="a center" style="top:1160px"><div class="o">20% POPUSTA</div></div>
<div class="a center" style="top:1270px">${code()}</div>
<div class="a center" style="top:1420px">${cta('b', 'PROVERI ISTORIJU VOZILA', 'height:90px;font-size:29px')}</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;top:1650px;text-align:center;font-size:23px')}
`);

// TT_10 — Tvoj kod za 20% popusta (final coupon CTA)
ad('TT_10', TT, 1080, 1920, 'tt30', `
.bg{background-image:url(../backgrounds/tt30.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,60,150,.75),rgba(0,40,110,.8))}
.cp{left:110px;right:110px;top:460px;background:#fff;border-radius:40px;padding:52px 46px 46px;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.35)}
h1{font-size:80px;font-weight:900;letter-spacing:-.04em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.perf{width:calc(100% + 92px);margin:36px -46px 32px;border-top:4px dashed #C9D6EA;position:relative}
.perf:before,.perf:after{content:'';position:absolute;top:-28px;width:56px;height:56px;border-radius:50%;background:#0a3d8f}
.perf:before{left:-28px}.perf:after{right:-28px}
.perf .sc{position:absolute;left:50%;top:-22px;transform:translateX(-50%);background:#fff;padding:0 12px}
.cd{border:4px dashed ${C.cv};border-radius:24px;padding:20px 28px;background:#F1F7FF;width:100%}
.cd small{display:block;font-size:20px;font-weight:700;letter-spacing:.24em;color:${C.muted}}
.cd b{display:block;font-size:72px;font-weight:900;letter-spacing:.04em;color:${C.ink};line-height:1.1}
.hint{font-size:26px;color:#3A3A4A;margin-top:22px;line-height:1.3}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:110px;top:290px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(38, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a cp">
  <h1>Tvoj kod za<br><span>20% popusta</span></h1>
  <div class="perf"><div class="sc">${icon('scissors', 40, '#9AAAC4', 2)}</div></div>
  <div class="cd">
    <small>PROMO KOD</small>
    <b>${CODE}</b>
  </div>
  <p class="hint">Unesi kod pri poručivanju<br>carVertical izveštaja.</p>
  ${cta('y', 'PROVERI ISTORIJU VOZILA', 'margin-top:30px;height:90px;font-size:28px')}
</div>
${disc('rgba(255,255,255,.78)', 'position:absolute;left:0;right:0;top:1600px;text-align:center;font-size:24px')}
`);

// ---------- render execution ----------
(async () => {
  fs.mkdirSync(HTML, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const page = await browser.newPage();
  const done = [];

  for (const a of ads) {
    if (only.length && !only.includes(a.id)) continue;
    if (a.bg && !fs.existsSync(path.join(SRC, 'backgrounds', a.bg + '.png'))) {
      console.log('SKIP (no bg)', a.id);
      continue;
    }
    const html = `<!doctype html><html lang="sr"><head><meta charset="utf-8"><style>${BASE}html,body{width:${a.w}px;height:${a.h}px}${a.css}</style></head><body>${a.body}</body></html>`;
    const f = path.join(HTML, a.id + '.html');
    fs.writeFileSync(f, html, 'utf8');

    await page.setViewport({ width: a.w, height: a.h, deviceScaleFactor: 1 });
    await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));

    const overflow = await page.evaluate((W, H) => {
      const selectors = 'h1,.cta,.code,.disc,.lock,.mad,.cvl,.sub,.o,.card,.panel,.cp,.ph,.strip,.box,.tag';
      return [...document.querySelectorAll(selectors)].filter(e => {
        const r = e.getBoundingClientRect();
        return r.right > W + 2 || r.left < -2 || r.bottom > H + 2;
      }).map(e => e.className || e.tagName);
    }, a.w, a.h);

    const out = path.join(OUT, a.folder, a.id + '.png');
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: a.w, height: a.h } });
    console.log('OK', a.id, overflow.length ? 'OVERFLOW: ' + overflow.join(', ') : '');
    done.push(a.id);
  }
  await browser.close();
  console.log(`Successfully rendered ${done.length} ads.`);
})();
