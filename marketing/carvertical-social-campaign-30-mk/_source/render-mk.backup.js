// MojAutoDiler × carVertical — 30-ad campaign compositor (MACEDONIAN VERSION).
// Requirements:
// 1. Language: Macedonian in Cyrillic script.
// 2. Brand names: MojAutoDiler and carVertical unchanged.
// 3. Promo code: MOJAVTODILER (with 'V').
// 4. Discount: 20% ПОПУСТ.
// 5. IG_01 has carVertical logo only.
// 6. IG_04 and TT_04 have the high-visibility white pill for MojAutoDiler.
// 7. FB_18 has the digital report mockup card in the upper half.
// 8. TT_08 has the darker overlay for maximum subtitle legibility.
// 9. IG_08 has no 'zvanični' ('MojAutoDiler препорачува carVertical извештај.').

const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

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
const CODE = 'MOJAVTODILER';
const DISC = 'Достапноста на податоците зависи од возилото и изворот.';

// ---------- shared snippets ----------
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

const cta = (cls = 'y', text = 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', extra = '') =>
  `<div class="cta ${cls}" style="${extra}">${text}<span class="arr">→</span></div>`;

const code = (cls = '', extra = '') =>
  `<div class="code ${cls}" style="${extra}"><small>ПРОМО КОД</small><b>${CODE}</b></div>`;

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

// IG_01 — Не купувај на слепо (dark cinematic, carVertical only)
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
  <h1>Не купувај<br><span>на слепо.</span></h1>
  <p class="sub">Провери ја достапната историја на возилото пред да купиш половен автомобил.</p>
</div>
<div class="a panel">
  <div class="off"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:86px;font-size:27px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// IG_02 — Провери километража (photo top / white panel)
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
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a panel">
  <h1>Провери<br>километража.</h1>
  <p class="sub">Вратената километража може да крие реални трошоци. Дознај ги запишаните податоци пред купување.</p>
  <div class="row">
    <div class="pill">20% ПОПУСТ</div>
    ${code('', 'padding:10px 24px')}
  </div>
  <div style="margin-top:34px">${cta('y', 'ПРОВЕРИ КИЛОМЕТРАЖА', 'width:100%')}</div>
</div>
${disc(C.muted, 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// IG_03 — Што крие историјата на автомобилот? (mysterious covered car)
ad('IG_03', IG, 1080, 1350, 'ig03', `
.bg{background-image:url(../backgrounds/ig03.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,9,20,.85) 0%,rgba(6,9,20,.15) 35%,rgba(6,9,20,.35) 60%,rgba(6,9,20,.95) 100%)}
h1{font-size:82px;font-weight:900;color:#fff;letter-spacing:-.035em;line-height:1.05}
h1 span{color:${C.cvY}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.3}
.bot{left:72px;right:72px;bottom:84px;display:flex;align-items:center;justify-content:space-between}
.off b{display:block;font-size:68px;font-weight:900;color:#fff;line-height:1;letter-spacing:-.03em}
.off span{display:block;font-size:26px;font-weight:600;color:${C.cvSky};margin-top:8px}
.off strong{color:#fff;font-weight:900;letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Што крие<br><span>историјата</span><br>на автомобилот?</h1>
  <p class="sub">Под совршениот изглед може да се кријат скриени оштетувања или вратена километража.</p>
</div>
<div class="a bot">
  <div class="off"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('b', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.68)', 'position:absolute;left:0;right:0;bottom:42px;text-align:center')}
`);

// IG_04 — 20% ПОПУСТ (bold blue typographic, white pill for MojAutoDiler)
ad('IG_04', IG, 1080, 1350, null, `
body{background:${C.cv}}
.ring{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.16)}
.big{font-size:420px;color:#fff;font-weight:900;letter-spacing:-.06em;line-height:.8}
.bar{display:inline-block;background:${C.cvY};color:${C.ink};font-size:114px;font-weight:900;letter-spacing:.02em;padding:6px 34px 10px;transform:rotate(-2.5deg);line-height:1}
.sub{color:#fff;font-size:40px;font-weight:600;letter-spacing:-.01em}
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
<div class="a center" style="top:595px"><div class="bar">ПОПУСТ</div></div>
<div class="a center" style="top:765px"><div class="sub">на carVertical извештаите за историја на возила</div></div>
<div class="a center" style="top:865px"><div class="ticket">Промо код: <b>${CODE}</b></div></div>
<div class="a center" style="top:1020px">${cta('n', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО')}</div>
${disc('rgba(255,255,255,.75)', 'position:absolute;left:0;right:0;bottom:50px;text-align:center')}
`);

// IG_05 — Половен автомобил? Провери пред купување.
ad('IG_05', IG, 1080, 1350, 'ig05', `
.bg{background-image:url(../backgrounds/ig05.png)}
.fade{position:absolute;left:0;right:0;top:0;height:560px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.85) 55%,rgba(255,255,255,0) 100%)}
h1{font-size:90px;font-weight:900;letter-spacing:-.04em;line-height:1.02;color:${C.navy}}
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
  <h1>Половен автомобил?<br><span>Провери пред купување.</span></h1>
</div>
<div class="a card">
  <div class="top">
    <div><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
    ${cta('y', 'ПРОВЕРИ ПРЕД КУПУВАЊЕ', 'height:84px;font-size:25px;padding:0 30px')}
  </div>
  <p style="margin-top:22px;font-size:27px;color:#3A3A4A;line-height:1.35;border-top:1px solid #E5ECF6;padding-top:20px;">
    Не носи одлука врз основа на првиот впечаток. Провери ги достапните записи и заштеди пари.
  </p>
</div>
${disc('rgba(255,255,255,.85)', 'position:absolute;left:0;right:0;bottom:26px;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.5)')}
`);

// IG_06 — Дознај повеќе за минатото на возилото (mockup 3)
ad('IG_06', IG, 1080, 1350, null, `
body{background:#F5F8FC}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.04;color:${C.navy}}
h1 span{color:${C.cv}}
.sub{font-size:30px;color:#3A3A4A;margin-top:16px;max-width:820px;line-height:1.35}
.pol{left:72px;top:430px;width:936px;height:570px;background:#fff;border-radius:28px;box-shadow:0 18px 50px rgba(11,22,48,.12);border:1.5px solid #E5ECF7;overflow:hidden;position:relative}
.pol img{width:100%;height:100%;object-fit:cover;object-position:center 30%}
.pol .cap{position:absolute;bottom:14px;right:20px;background:rgba(11,22,48,.8);color:#fff;font-size:16px;padding:6px 14px;border-radius:999px}
.bar{left:72px;right:72px;bottom:76px;background:${C.navy};border-radius:32px;padding:26px 36px;display:flex;align-items:center;justify-content:space-between}
.bar .o b{font-size:56px;font-weight:900;color:${C.cvY};line-height:1}
.bar .o span{font-size:24px;color:#fff;font-weight:600;margin-top:6px;display:block}
.bar .o strong{letter-spacing:.05em}
`, `
<div class="a" style="left:72px;top:64px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:150px">
  <h1>Дознај повеќе за<br><span>минатото на возилото.</span></h1>
  <p class="sub">Историја на километража, оштетувања, кражби и архивски фотографии на едно место.</p>
</div>
<div class="a pol"><img src="../brand/cv-mockup-3.png"><div class="cap">Илустративен приказ на carVertical извештај</div></div>
<div class="a bar">
  <div class="o"><b>20% ПОПУСТ</b><span>Промо код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc(C.muted, 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// IG_07 — Попаметно купување започнува со проверка
ad('IG_07', IG, 1080, 1350, 'ig07', `
.bg{background-image:url(../backgrounds/ig07.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,22,48,.92) 0%,rgba(11,22,48,.3) 38%,rgba(11,22,48,.4) 55%,rgba(11,22,48,.96) 100%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:82px;line-height:1.04;color:#fff}
h1 span{color:${C.cvSky}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.box{left:72px;right:72px;bottom:80px;background:rgba(255,255,255,.96);border-radius:32px;padding:34px 40px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box .o b{font-size:60px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.box .o span{font-size:24px;font-weight:700;color:${C.navy};margin-top:6px;display:block}
.box .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Попаметно купување<br><span>започнува со проверка.</span></h1>
  <p class="sub">Информираниот купувач е сигурен купувач. Провери го возилото во неколку клика пред потпишување договор.</p>
</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ПРЕД КУПУВАЊЕ', 'height:84px;font-size:25px;padding:0 30px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:38px;text-align:center')}
`);

// IG_08 — MojAutoDiler препорачува carVertical извештај
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
  <h1>Провери историја<br><em>пред купување.</em></h1>
  <p class="subt">MojAutoDiler препорачува carVertical извештај.</p>
</div>
<div class="a center" style="top:860px"><div class="off">20% ПОПУСТ <span>на извештаи</span></div></div>
<div class="a center" style="top:940px">${code()}</div>
<div class="a center" style="top:1080px">${cta('b', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'height:88px;font-size:26px')}</div>
${disc('rgba(255,255,255,.65)', 'position:absolute;left:0;right:0;bottom:54px;text-align:center')}
`);

// IG_09 — Провери податоци за оштетувања
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
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:72px;top:150px">
  <div class="chip">20% ПОПУСТ СО КОД ${CODE}</div>
  <h1 style="margin-top:24px">Провери податоци<br><span>за оштетувања.</span></h1>
  <p style="font-size:30px;color:#3A3A4A;margin-top:16px;max-width:820px;line-height:1.35">Дознај дали автомобилот учествувал во сообраќајни незгоди и колкава била проценетата штета.</p>
</div>
<div class="a bot">
  ${code('', 'padding:10px 26px')}
  ${cta('y', 'ПРОВЕРИ ОШТЕТУВАЊА', 'height:86px;font-size:26px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.75)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// IG_10 — Твојот следен автомобил заслужува проверка
ad('IG_10', IG, 1080, 1350, 'ig10', `
.bg{background-image:url(../backgrounds/ig10.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.18) 35%,rgba(5,9,20,.35) 55%,rgba(5,9,20,.96) 100%)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.04;color:#fff}
h1 span{color:${C.cvSky}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.card{left:64px;right:64px;bottom:80px;background:rgba(255,255,255,.12);backdrop-filter:blur(20px);border:1.5px solid rgba(255,255,255,.25);border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between}
.card .off b{font-size:62px;font-weight:900;color:${C.cvY};line-height:1;letter-spacing:-.02em}
.card .off span{font-size:25px;color:#fff;font-weight:600;margin-top:8px;display:block}
.card .off strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Твојот следен автомобил<br><span>заслужува проверка.</span></h1>
  <p class="sub">Не се потпирај на среќа. Провери ја комплетната достапна историја на автомобилот со carVertical попуст.</p>
</div>
<div class="a card">
  <div class="off"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:86px;font-size:26px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:38px;text-align:center')}
`);

// ============================================================================
// GROUP B: FACEBOOK (1080 × 1350 px, 4:5)
// ============================================================================

// FB_11 — Купуваш половен автомобил?
ad('FB_11', FB, 1080, 1350, 'fb11', `
.bg{background-image:url(../backgrounds/fb11.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 100%)}
h1{font-size:86px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvSky}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.box{left:64px;right:64px;bottom:76px;background:rgba(255,255,255,.96);border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box .o b{font-size:62px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.box .o span{font-size:24px;font-weight:700;color:${C.navy};margin-top:6px;display:block}
.box .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Купуваш половен<br><span>автомобил?</span></h1>
  <p class="sub">Избегни непријатни изненадувања. Провери ја запишаната километража, оштетувања и претходни сопственици.</p>
</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_12 — Историјата на возилото може да биде важна
const tile = (ic, t) => `<div class="tile"><div class="ic">${icon(ic, 50, C.cv, 1.9)}</div><span>${t}</span></div>`;
ad('FB_12', FB, 1080, 1350, null, `
body{background:#F5F8FD}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.lbl{font-size:28px;color:#3A3A4A;font-weight:600}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;left:72px;right:72px;top:490px}
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
<div class="a" style="left:72px;top:165px">
  <h1>Историјата на возилото<br><span>може да биде важна.</span></h1>
</div>
<div class="a lbl" style="left:72px;top:430px">Извештајот може да содржи достапни податоци за:</div>
<div class="a grid">${tile('gauge', 'Километража')}${tile('car', 'Оштетувања')}${tile('lock', 'Кражби')}${tile('cam', 'Фотографии')}</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc(C.muted, 'position:absolute;left:0;right:0;bottom:46px;text-align:center')}
`);

// FB_13 — Провери пред да одлучиш (dealership photo)
ad('FB_13', FB, 1080, 1350, 'fb13', `
.bg{background-image:url(../backgrounds/fb13.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,.88) 0%,rgba(6,10,24,.22) 36%,rgba(6,10,24,.4) 55%,rgba(6,10,24,.96) 100%)}
h1{font-size:86px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvY}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.row{left:64px;right:64px;bottom:76px;display:flex;align-items:center;justify-content:space-between}
.row .o b{font-size:62px;font-weight:900;color:${C.cvY};line-height:1;letter-spacing:-.02em}
.row .o span{font-size:25px;color:#fff;font-weight:600;margin-top:8px;display:block}
.row .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Провери пред<br><span>да одлучиш.</span></h1>
  <p class="sub">Паметниот избор започнува со проверени информации. Внеси број на шасија и дознај го минатото на возилото.</p>
</div>
<div class="a row">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ВОЗИЛО', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_14 — 20% ПОПУСТ со код MOJAVTODILER (balanced card with carVertical report mockup)
ad('FB_14', FB, 1080, 1350, null, `
body{background:${C.navy}}
.c{left:64px;right:64px;top:150px;bottom:70px;background:#fff;border-radius:36px;padding:38px 44px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.pct{font-size:105px;font-weight:900;color:${C.cv};line-height:.9;letter-spacing:-.05em}
.sub{font-size:32px;font-weight:800;color:${C.navy};margin-top:10px;line-height:1.2}
.sub em{font-style:normal;color:${C.cv}}
.items{display:flex;gap:14px;margin-top:18px}
.item{flex:1;background:#F2F6FC;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:${C.navy}}
.mockup-box{width:100%;height:470px;border-radius:24px;overflow:hidden;background:#0B1630;position:relative;box-shadow:0 18px 45px rgba(11,22,48,.18);border:1.5px solid #E5ECF7}
.mockup-box img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block}
.mockup-tag{position:absolute;bottom:14px;right:18px;background:rgba(11,22,48,.85);backdrop-filter:blur(8px);color:rgba(255,255,255,.95);font-size:17px;font-weight:600;padding:6px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2)}
.bot{display:flex;align-items:center;justify-content:space-between;gap:18px}
.code-box{border:3px dashed ${C.cv};border-radius:20px;padding:10px 24px;text-align:center;flex-shrink:0}
.code-box small{font-size:15px;font-weight:700;letter-spacing:.2em;color:${C.muted};display:block}
.code-box b{font-size:40px;font-weight:900;letter-spacing:.05em;color:${C.cv};display:block;margin-top:2px}
.cta{display:inline-flex;align-items:center;justify-content:center;gap:16px;font-weight:800;border-radius:999px;padding:0 32px;height:84px;font-size:24px;background:${C.cvY};color:${C.ink};flex:1}
.cta .arr{font-size:30px;font-weight:600}
`, `
<div class="a" style="left:72px;top:50px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a c">
  <div>
    <div class="pct">20% ПОПУСТ</div>
    <div class="sub">на carVertical извештаите со код <em>${CODE}</em></div>
    <div class="items">
      <div class="item">${icon('gauge', 28, C.cv)}<span>Километража</span></div>
      <div class="item">${icon('car', 28, C.cv)}<span>Оштетувања</span></div>
      <div class="item">${icon('lock', 28, C.cv)}<span>Кражби</span></div>
    </div>
  </div>
  <div class="mockup-box">
    <img src="../brand/cv-mockup-2.png" alt="carVertical дигитален извештај">
    <div class="mockup-tag">carVertical дигитален извештај</div>
  </div>
  <div class="bot">
    <div class="code-box"><small>ПРОМО КОД</small><b>${CODE}</b></div>
    ${cta('y', 'ИСКОРИСТИ 20% ПОПУСТ')}
  </div>
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:26px;text-align:center')}
`);

// FB_15 — Достапни податоци за километражата
ad('FB_15', FB, 1080, 1350, 'fb15', `
.bg{background-image:url(../backgrounds/fb15.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.9) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 100%)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvY}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.box{left:64px;right:64px;bottom:76px;background:rgba(255,255,255,.96);border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box .o b{font-size:62px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.box .o span{font-size:24px;font-weight:700;color:${C.navy};margin-top:6px;display:block}
.box .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Достапни податоци<br><span>за километражата.</span></h1>
  <p class="sub">Дознај дали километражата била враќана и спореди ги запишаните вредности по години.</p>
</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ КИЛОМЕТРАЖА', 'height:84px;font-size:25px;padding:0 30px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_16 — Повеќе информации. Подобра одлука.
ad('FB_16', FB, 1080, 1350, 'fb16', `
.bg{background-image:url(../backgrounds/fb16.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 100%)}
h1{font-size:86px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvSky}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.box{left:64px;right:64px;bottom:76px;background:rgba(255,255,255,.96);border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box .o b{font-size:62px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.box .o span{font-size:24px;font-weight:700;color:${C.navy};margin-top:6px;display:block}
.box .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Повеќе информации.<br><span>Подобра одлука.</span></h1>
  <p class="sub">Купувањето автомобил е голема инвестиција. Увери се во состојбата на возилото пред да платиш.</p>
</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_17 — Автомобилот изгледа одлично. А историјата?
ad('FB_17', FB, 1080, 1350, 'fb17', `
.bg{background-image:url(../backgrounds/fb17.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 100%)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvY}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:820px;line-height:1.35}
.r{left:64px;right:64px;bottom:76px;display:flex;align-items:center;justify-content:space-between}
.o b{display:block;font-size:62px;font-weight:900;color:${C.cvY};line-height:1}
.o span{display:block;font-size:25px;color:#fff;font-weight:600;margin-top:8px}
.o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Автомобилот изгледа одлично.<br><span>А историјата?</span></h1>
  <p class="sub">Убавиот лак не гарантира уредно минато. Провери ги достапните сервисни записи и историјата на оштетувања.</p>
</div>
<div class="a r">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:86px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:0;right:0;bottom:44px;text-align:center')}
`);

// FB_18 — carVertical × MojAutoDiler (tablet report mockup in upper half)
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
  <div style="font-size:22px;font-weight:700;letter-spacing:.2em;color:rgba(255,255,255,.75);margin-bottom:14px;">ПРОВЕРКА НА ИСТОРИЈА НА ВОЗИЛА</div>
  ${cvLogo(56, 'white')}
  <div style="margin-top:16px;display:inline-flex;align-items:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:6px 20px;">
    ${mad(24, 'light')}
  </div>
</div>
<div class="mockup-wrap">
  <div class="mockup-card">
    <img src="../brand/cv-mockup-2.png" />
    <div class="mockup-tag">carVertical дигитален извештај</div>
  </div>
</div>
<div class="a center" style="top:765px">
  <div style="color:#fff;font-size:32px;font-weight:600;margin-bottom:18px;">Заедно за посигурно купување автомобили</div>
  <div class="o"><span>20% ПОПУСТ</span> на извештаи</div>
</div>
<div class="a center" style="top:940px">${code()}</div>
<div class="a center" style="top:1100px">${cta('y', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'height:88px;font-size:26px')}</div>
${disc('rgba(255,255,255,.78)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_19 — Дознај ја достапната историја на возилото (mockup 1)
ad('FB_19', FB, 1080, 1350, null, `
body{background:${C.navy}}
.ph{position:absolute;left:0;top:0;width:1080px;height:760px;background:url(../brand/cv-mockup-1.png) 42% 35%/auto 125% no-repeat}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,22,48,.6) 0%,rgba(11,22,48,0) 22%,rgba(11,22,48,0) 70%,${C.navy} 100%)}
.cap{right:40px;top:700px;font-size:19px;color:rgba(255,255,255,.65)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
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
<div class="a cap">Илустративен приказ на дигитален извештај</div>
<div class="a" style="left:72px;top:800px;right:72px">
  <h1>Дознај ја достапната<br><span>историја на возилото.</span></h1>
  <p style="font-size:30px;color:rgba(255,255,255,.8);margin-top:16px">Дигитален извештај директно на твојот телефон за неколку моменти.</p>
</div>
<div class="a r">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ВЕДНАШ', 'height:86px;font-size:26px;padding:0 34px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// FB_20 — Пред купување провери што можеш
ad('FB_20', FB, 1080, 1350, 'fb20', `
.bg{background-image:url(../backgrounds/fb20.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 100%)}
h1{font-size:82px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvSky}}
.sub{font-size:30px;color:rgba(255,255,255,.9);font-weight:500;margin-top:18px;max-width:820px;line-height:1.35}
.box{left:64px;right:64px;bottom:76px;background:rgba(255,255,255,.96);border-radius:32px;padding:32px 38px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.box .o b{font-size:62px;font-weight:900;color:${C.cv};line-height:1;letter-spacing:-.02em}
.box .o span{font-size:24px;font-weight:700;color:${C.navy};margin-top:6px;display:block}
.box .o strong{letter-spacing:.05em}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:72px;top:66px;right:72px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:72px;top:170px">
  <h1>Пред купување<br><span>провери што можеш.</span></h1>
  <p class="sub">Знаењето е најдобра заштита од лош избор на половен автомобил.</p>
</div>
<div class="a box">
  <div class="o"><b>20% ПОПУСТ</b><span>КОД: <strong>${CODE}</strong></span></div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'height:84px;font-size:26px;padding:0 32px')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:0;right:0;bottom:36px;text-align:center')}
`);

// ============================================================================
// GROUP C: TIKTOK & STORIES / REELS (1080 × 1920 px, 9:16)
// ============================================================================

// TT_01 — СТОП! Купуваш автомобил?
ad('TT_01', TT, 1080, 1920, 'tt21', `
.bg{background-image:url(../backgrounds/tt21.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,18,.92) 0%,rgba(5,8,18,.25) 35%,rgba(5,8,18,.45) 55%,rgba(5,8,18,.96) 78%)}
.badge{background:${C.cvY};color:${C.ink};padding:14px 28px;border-radius:999px;font-weight:900;font-size:28px;letter-spacing:.08em;display:inline-block}
h1{font-weight:900;letter-spacing:-.04em;font-size:124px;line-height:.96;color:#fff;margin-top:28px}
h1 span{color:${C.cvY}}
.sub{font-size:36px;color:rgba(255,255,255,.92);line-height:1.35;margin-top:28px;max-width:860px}
.bot{left:80px;right:140px;top:1280px}
.off{display:flex;align-items:center;gap:26px;margin-bottom:26px}
.off b{font-size:74px;font-weight:900;color:${C.cvY};letter-spacing:-.02em;line-height:1}
.code{color:#fff}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:400px">
  <div class="badge">ВНИМАНИЕ КУПУВАЧИ НА ПОЛОВНИ ВОЗИЛА</div>
  <h1>СТОП!<br><span>Купуваш автомобил?</span></h1>
  <p class="sub">Пред да донесеш одлука, провери ги скриените оштетувања и реалната километража.</p>
</div>
<div class="a bot">
  <div class="off"><b>20% ПОПУСТ</b>${code()}</div>
  ${cta('y', 'ПРОВЕРИ ПРЕД КУПУВАЊЕ', 'width:100%')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_02 — А километражата? (odometer blocks layout matching Serbian)
ad('TT_02', TT, 1080, 1920, null, `
body{background:#fff}
.dots{position:absolute;inset:0;background-image:radial-gradient(#DCE8F8 2px,transparent 2px);background-size:36px 36px;opacity:.7}
.a1{font-size:190px;font-weight:900;color:${C.ink};letter-spacing:-.06em;line-height:.9}
.a2{font-size:130px;font-weight:900;color:${C.cv};letter-spacing:-.05em;line-height:.95}
.odo{display:flex;gap:12px}
.odo div{width:110px;height:150px;border-radius:16px;background:${C.navy};color:#fff;font-size:96px;font-weight:800;display:flex;align-items:center;justify-content:center}
.odo div:nth-child(odd){background:${C.cv}}
.sub{font-size:38px;color:#3A3A4A;font-weight:500;line-height:1.3}
.o{font-size:88px;font-weight:900;color:${C.ink};letter-spacing:-.03em;line-height:1}
.o span{background:${C.cvY};padding:0 18px;border-radius:14px}
.code{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:3px dashed ${C.navy};border-radius:20px;padding:12px 32px 14px;color:${C.navy}}
.code small{font-size:18px;font-weight:700;letter-spacing:.22em;opacity:.85;margin-bottom:6px}
.code b{font-size:46px;font-weight:900;letter-spacing:.05em}
.cta{display:inline-flex;align-items:center;justify-content:center;gap:18px;font-weight:800;border-radius:999px;padding:0 46px;height:96px;font-size:30px;letter-spacing:.02em;white-space:nowrap;background:${C.cvY};color:${C.ink}}
.cta .arr{font-size:34px;font-weight:600}
`, `
<div class="dots"></div>
<div class="a" style="left:90px;top:280px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:90px;top:420px"><div class="a1">А</div><div class="a2">километражата?</div></div>
<div class="a" style="left:90px;top:770px"><div class="odo"><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div><div>?</div></div></div>
<div class="a" style="left:90px;top:965px"><p class="sub">Провери ги достапните податоци за<br>километражата пред купување.</p></div>
<div class="a" style="left:90px;top:1180px"><div class="o"><b>20%</b> <span>ПОПУСТ</span></div></div>
<div class="a" style="left:90px;top:1300px">${code('dark')}</div>
<div class="a" style="left:90px;top:1470px;right:140px">${cta('y', 'ПРОВЕРИ КИЛОМЕТРАЖА', 'width:100%')}</div>
${disc(C.muted, 'position:absolute;left:90px;top:1630px;font-size:24px')}
`);

// TT_03 — Ја знаеш ли вистинската историја?
ad('TT_03', TT, 1080, 1920, 'tt23', `
.bg{background-image:url(../backgrounds/tt23.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 78%)}
h1{font-size:94px;font-weight:900;letter-spacing:-.035em;line-height:1.02;color:#fff}
h1 span{color:${C.cvY}}
.sub{font-size:34px;color:rgba(255,255,255,.9);font-weight:500;margin-top:24px;max-width:860px;line-height:1.35}
.card{left:80px;right:140px;top:1240px;background:rgba(255,255,255,.96);border-radius:36px;padding:36px 42px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.card .toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.card .toprow b{font-size:62px;font-weight:900;color:${C.cv};line-height:1}
.card .code{color:${C.navy}}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:410px">
  <h1>Ја знаеш ли вистинската<br><span>историја на автомобилот?</span></h1>
  <p class="sub">Не купувај на слепо. carVertical открива достапни податоци за оштетувања и километража.</p>
</div>
<div class="a card">
  <div class="toprow">
    <b>20% ПОПУСТ</b>
    ${code('', 'padding:10px 24px')}
  </div>
  ${cta('b', 'ПРОВЕРИ ИСТОРИЈА', 'width:100%')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_04 — 20% ПОПУСТ (yellow discount-first, white pill for MojAutoDiler)
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
  <div class="w" style="margin-top:28px">ПОПУСТ</div>
</div>
<div class="a" style="left:90px;top:990px">
  <p class="sub">на carVertical извештаите<br>за историја на возила</p>
</div>
<div class="a" style="left:90px;top:1160px">
  <div class="tk"><small>ПРОМО КОД</small><b>${CODE}</b></div>
</div>
<div class="a" style="left:90px;top:1380px">${cta('b', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО')}</div>
${disc('#3A3A1A', 'position:absolute;left:90px;top:1590px;font-size:24px')}
`);

// TT_05 — Провери пред да платиш
ad('TT_05', TT, 1080, 1920, 'tt25', `
.bg{background-image:url(../backgrounds/tt25.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,24,.6) 0%,rgba(5,10,24,0) 30%,rgba(5,10,24,0) 55%,rgba(5,10,24,.9) 78%)}
.box{background:#fff;border-radius:34px;padding:36px 42px;box-shadow:0 24px 60px rgba(0,0,0,.25)}
h1{font-size:94px;font-weight:900;letter-spacing:-.04em;line-height:1;color:${C.navy}}
h1 span{color:${C.cv}}
.sub{font-size:32px;color:#3A3A4A;line-height:1.3;margin-top:16px}
.card{left:80px;right:140px;top:1140px;background:${C.cv};border-radius:34px;padding:34px 38px;color:#fff}
.card .toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.card .o b{display:block;font-size:56px;font-weight:900;color:${C.cvY};letter-spacing:-.02em;line-height:1}
.card .o span{display:block;font-size:22px;color:#fff;font-weight:600;margin-top:6px}
.card .o strong{letter-spacing:.05em}
.card .code{color:#fff}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a box" style="left:80px;right:140px;top:390px">
  <h1>Провери пред<br><span>да платиш.</span></h1>
  <p class="sub">Една проверка може да ти заштеди илјадници евра на скриени поправки.</p>
</div>
<div class="a card">
  <div class="toprow">
    <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
    ${code('', 'padding:10px 22px')}
  </div>
  ${cta('y', 'ПРОВЕРИ ИСТОРИЈА', 'width:100%')}
</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_06 — Изгледа одлично. А минатото?
ad('TT_06', TT, 1080, 1920, 'tt26', `
.bg{background-image:url(../backgrounds/tt26.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 78%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:106px;color:#fff;line-height:.98}
h1 em{font-style:normal;color:${C.cvY}}
.sub{font-size:34px;color:rgba(255,255,255,.9);font-weight:500;margin-top:20px;max-width:860px;line-height:1.35}
.card{left:80px;right:140px;top:1220px;background:rgba(255,255,255,.96);border-radius:36px;padding:36px 42px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.card .toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.card .toprow b{font-size:62px;font-weight:900;color:${C.cv};line-height:1}
.card .code{color:${C.navy}}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:410px">
  <h1>Изгледа одлично.<br><em>А минатото?</em></h1>
  <p class="sub">Провери ги скриените оштетувања пред потпишување договор.</p>
</div>
<div class="a card">
  <div class="toprow">
    <b>20% ПОПУСТ</b>
    ${code('', 'padding:10px 24px')}
  </div>
  ${cta('b', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'width:100%')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_07 — Една проверка. Повеќе информации.
const row = (ic, t) => `<div class="row"><div class="ic">${icon(ic, 34, C.cv, 1.9)}</div><span>${t}</span></div>`;
ad('TT_07', TT, 1080, 1920, null, `
body{background:#F5F8FC}
h1{font-size:86px;font-weight:900;letter-spacing:-.04em;line-height:1.02;color:${C.navy}}
h1 span{color:${C.cv}}
.ph{left:80px;right:140px;top:490px;background:#fff;border-radius:32px;box-shadow:0 18px 50px rgba(11,22,48,.12);border:1.5px solid #E5ECF7;padding:32px 36px}
.ph .hd{display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1.5px solid #E5ECF7;margin-bottom:16px}
.row{display:flex;align-items:center;gap:18px;padding:14px 0;border-bottom:1px solid #F0F4FA}
.row:last-child{border-bottom:none}
.row .ic{width:56px;height:56px;border-radius:14px;background:#E8F2FF;display:flex;align-items:center;justify-content:center}
.row span{font-size:28px;font-weight:700;color:${C.navy}}
.card{left:80px;right:140px;top:1180px;background:${C.navy};border-radius:34px;padding:34px 38px;color:#fff}
.card .o{display:flex;align-items:center;justify-content:space-between}
.card .o b{font-size:56px;font-weight:900;color:${C.cvY};letter-spacing:-.02em}
.card .o span{font-size:24px;color:#fff;font-weight:600;margin-top:6px;display:block}
.card .o strong{letter-spacing:.05em}
.cap{font-size:20px;color:${C.muted}}
`, `
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(44, 'primary')}
  ${mad(24, 'dark')}
</div>
<div class="a" style="left:80px;top:370px">
  <h1>Една проверка.<br><span>Повеќе информации.</span></h1>
</div>
<div class="a ph"><div class="hd">${cvLogo(26, 'primary')}</div>${row('gauge', 'Километража')}${row('car', 'Оштетувања')}${row('cam', 'Фотографии')}${row('lock', 'Кражби')}${row('doc', 'Регистрации')}</div>
<div class="a card">
  <div class="o"><b>20% ПОПУСТ</b><span>Код: <strong>${CODE}</strong></span></div>
</div>
<div class="a" style="left:80px;top:1410px;right:140px">${cta('y', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'width:100%')}</div>
${disc(C.muted, 'position:absolute;left:80px;top:1590px;font-size:23px')}
<div class="a cap" style="right:140px;top:1645px">Илустрација; без вистински податоци.</div>
`);

// TT_08 — Купувај поинформирано (dark overlay, legible subtitle)
ad('TT_08', TT, 1080, 1920, 'tt28', `
.bg{background-image:url(../backgrounds/tt28.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,26,.92) 0%,rgba(8,12,26,.85) 36%,rgba(8,12,26,.55) 54%,rgba(8,12,26,.95) 75%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:104px;color:#fff;line-height:.98;text-shadow:0 4px 30px rgba(0,0,0,.3)}
h1 em{font-style:normal;color:${C.cvY}}
.sub{font-size:32px;color:#fff;font-weight:600;line-height:1.35;text-shadow:0 2px 20px rgba(0,0,0,.9);max-width:860px}
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
  <h1>Купувај<br><em>поинформирано.</em></h1>
  <p class="sub" style="margin-top:24px">Провери ја достапната историја<br>на возилото пред да донесеш одлука.</p>
</div>
<div class="a" style="left:80px;top:1130px"><div class="o"><b>20% ПОПУСТ</b></div></div>
<div class="a" style="left:80px;top:1260px">${code()}</div>
<div class="a" style="left:80px;top:1410px;right:140px">${cta('y', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'width:100%')}</div>
${disc('rgba(255,255,255,.72)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_09 — Посигурно купување на половно возило
ad('TT_09', TT, 1080, 1920, 'tt29', `
.bg{background-image:url(../backgrounds/tt29.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,.94) 0%,rgba(6,10,24,.4) 36%,rgba(6,10,24,.35) 52%,rgba(6,10,24,.96) 72%)}
.frame{position:absolute;left:50px;right:50px;top:230px;bottom:300px;border:2px solid rgba(197,155,76,.5);border-radius:10px}
h1{font-weight:900;letter-spacing:-.035em;font-size:94px;color:#fff;line-height:.98;text-align:center}
h1 em{font-style:normal;color:${C.goldL}}
.sub{font-size:32px;color:rgba(255,255,255,.9);font-weight:500;text-align:center;margin-top:22px;max-width:860px;line-height:1.35}
.off{font-size:52px;font-weight:900;color:${C.goldL};letter-spacing:-.01em;text-align:center}
.off span{color:#fff;font-weight:600;font-size:32px}
.code{color:${C.goldL}}
`, `
<div class="bg"></div><div class="shade"></div><div class="frame"></div>
<div class="a center" style="top:270px">
  <div style="display:inline-flex;align-items:center;gap:24px;">
    ${cvLogo(42, 'white')}
    ${mad(24, 'light')}
  </div>
</div>
<div class="a center" style="top:440px">
  <h1>Посигурно купување<br><em>на половно возило.</em></h1>
  <p class="sub">MojAutoDiler препорачува carVertical проверка на историјата пред секое купување.</p>
</div>
<div class="a center" style="top:1090px"><div class="off">20% ПОПУСТ <span>на извештаи</span></div></div>
<div class="a center" style="top:1180px">${code()}</div>
<div class="a center" style="top:1380px">${cta('b', 'ПРОВЕРИ ИСТОРИЈА НА ВОЗИЛОТО', 'height:90px;font-size:28px')}</div>
${disc('rgba(255,255,255,.68)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// TT_10 — Не погодувај. Провери.
ad('TT_10', TT, 1080, 1920, 'tt30', `
.bg{background-image:url(../backgrounds/tt30.png)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.88) 0%,rgba(5,9,20,.2) 36%,rgba(5,9,20,.45) 58%,rgba(5,9,20,.96) 78%)}
h1{font-weight:900;letter-spacing:-.035em;font-size:120px;color:#fff;line-height:.96}
h1 span{color:${C.cvY}}
.sub{font-size:36px;color:rgba(255,255,255,.9);font-weight:500;margin-top:24px;max-width:860px;line-height:1.35}
.card{left:80px;right:140px;top:1240px;background:rgba(255,255,255,.96);border-radius:36px;padding:36px 42px;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.card .toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.card .toprow b{font-size:62px;font-weight:900;color:${C.cv};line-height:1}
.card .code{color:${C.navy}}
`, `
<div class="bg"></div><div class="shade"></div>
<div class="a" style="left:80px;top:270px;right:140px;display:flex;justify-content:space-between;align-items:center">
  ${cvLogo(42, 'white')}
  ${mad(24, 'light')}
</div>
<div class="a" style="left:80px;top:420px">
  <h1>Не погодувај.<br><span>Провери.</span></h1>
  <p class="sub">Дознај ја историјата пред да стане твој проблем.</p>
</div>
<div class="a card">
  <div class="toprow">
    <b>20% ПОПУСТ</b>
    ${code('', 'padding:10px 24px')}
  </div>
  ${cta('y', 'ПРОВЕРИ ВЕДНАШ', 'width:100%')}
</div>
${disc('rgba(255,255,255,.7)', 'position:absolute;left:80px;top:1590px;font-size:24px')}
`);

// ---------- runner ----------
(async () => {
  if (!fs.existsSync(HTML)) fs.mkdirSync(HTML, { recursive: true });
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
    const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><style>${BASE}html,body{width:${a.w}px;height:${a.h}px}${a.css}</style></head><body>${a.body}</body></html>`;
    const f = path.join(HTML, a.id + '.html');
    fs.writeFileSync(f, html, 'utf8');

    await page.setViewport({ width: a.w, height: a.h, deviceScaleFactor: 1 });
    await page.goto('file:///' + f.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));

    const overflow = await page.evaluate((W, H) => {
      const selectors = 'h1,.cta,.code,.disc,.lock,.mad,.cvl,.sub,.o,.card,.panel,.cp,.ph,.strip,.box,.tag,.mockup-wrap';
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
  console.log(`Successfully rendered ${done.length} Macedonian ads.`);
})();
