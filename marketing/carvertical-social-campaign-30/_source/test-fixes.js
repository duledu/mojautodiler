const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

const SRC = __dirname;
const HTML = path.join(SRC, 'html');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const page = await browser.newPage();

  // Test TT_08 darker overlay
  await page.setViewport({ width: 1080, height: 1920 });
  let tt08Html = fs.readFileSync(path.join(HTML, 'TT_08.html'), 'utf8');
  tt08Html = tt08Html.replace(
    'linear-gradient(180deg,rgba(10,12,28,.82) 0%,rgba(10,12,28,0) 35%,rgba(10,12,28,0) 52%,rgba(10,12,28,.94) 76%)',
    'linear-gradient(180deg,rgba(8,12,26,.92) 0%,rgba(8,12,26,.85) 36%,rgba(8,12,26,.55) 54%,rgba(8,12,26,.95) 75%)'
  );
  tt08Html = tt08Html.replace('.sub{font-size:34px;color:#fff;font-weight:500;line-height:1.3}', '.sub{font-size:34px;color:#fff;font-weight:600;line-height:1.3;text-shadow:0 2px 20px rgba(0,0,0,0.9)}');
  const tmp08 = path.join(HTML, 'tmp-tt08.html');
  fs.writeFileSync(tmp08, tt08Html, 'utf8');
  await page.goto('file:///' + tmp08.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SRC, 'test-tt08-dark.png') });
  console.log('Saved test-tt08-dark.png');

  // Test IG_04 white pill
  await page.setViewport({ width: 1080, height: 1350 });
  let ig04Html = fs.readFileSync(path.join(HTML, 'IG_04.html'), 'utf8');
  // replace the mad logo with a white pill container
  ig04Html = ig04Html.replace(
    /<div class="mad light"[\s\S]*?<\/div>\s*<\/div>/,
    `<div style="display:inline-flex;align-items:center;background:#ffffff;border-radius:999px;padding:6px 18px;box-shadow:0 4px 16px rgba(0,0,0,0.18);">
      <div class="mad dark" style="gap:7px;opacity:1;">
        <img src="../brand/mojautodiler-logo.png" style="height:22px;width:22px;border-radius:50%;flex:none;" alt="MojAutoDiler">
        <div class="wm"><b style="font-size:13px;color:#0F0F14;">MojAutoDiler<em style="font-weight:600;color:#C59B4C;">.com</em></b></div>
      </div>
    </div>`
  );
  const tmp04 = path.join(HTML, 'tmp-ig04.html');
  fs.writeFileSync(tmp04, ig04Html, 'utf8');
  await page.goto('file:///' + tmp04.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SRC, 'test-ig04-pill.png') });
  console.log('Saved test-ig04-pill.png');

  // Test TT_04 pill on yellow
  await page.setViewport({ width: 1080, height: 1920 });
  let tt04Html = fs.readFileSync(path.join(HTML, 'TT_04.html'), 'utf8');
  tt04Html = tt04Html.replace(
    /<div class="mad dark"[\s\S]*?<\/div>\s*<\/div>/,
    `<div style="display:inline-flex;align-items:center;background:#ffffff;border-radius:999px;padding:6px 18px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
      <div class="mad dark" style="gap:7px;opacity:1;">
        <img src="../brand/mojautodiler-logo.png" style="height:22px;width:22px;border-radius:50%;flex:none;" alt="MojAutoDiler">
        <div class="wm"><b style="font-size:13px;color:#0F0F14;">MojAutoDiler<em style="font-weight:600;color:#C59B4C;">.com</em></b></div>
      </div>
    </div>`
  );
  const tmpTt04 = path.join(HTML, 'tmp-tt04.html');
  fs.writeFileSync(tmpTt04, tt04Html, 'utf8');
  await page.goto('file:///' + tmpTt04.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SRC, 'test-tt04-pill.png') });
  console.log('Saved test-tt04-pill.png');

  await browser.close();
})();
