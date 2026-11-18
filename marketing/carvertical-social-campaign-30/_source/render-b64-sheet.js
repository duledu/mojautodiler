const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1600 });
  const brandDir = path.resolve(__dirname, 'brand');
  const files = ['cv-mockup-1.png', 'cv-mockup-2.png', 'cv-mockup-3.png', 'cv-lifestyle-laptop.jpg'];
  const items = files.map(f => {
    const b64 = fs.readFileSync(path.join(brandDir, f)).toString('base64');
    const ext = f.endsWith('.png') ? 'png' : 'jpeg';
    return `<div style="margin:20px;background:#333;padding:10px;border-radius:8px;">
      <h3 style="color:#fff;margin:0 0 10px 0;">${f}</h3>
      <img src="data:image/${ext};base64,${b64}" style="width:400px;display:block;">
    </div>`;
  }).join('');

  await page.setContent(`<body style="background:#111;margin:0;font-family:sans-serif;">${items}</body>`);
  await page.screenshot({ path: path.join(__dirname, 'mockups-b64-sheet.jpg') });
  console.log('Done b64 sheet');
  await browser.close();
})();
