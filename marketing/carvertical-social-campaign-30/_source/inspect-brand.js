const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  const brandDir = path.resolve(__dirname, 'brand');
  const files = ['cv-mockup-1.png', 'cv-mockup-2.png', 'cv-mockup-3.png', 'cv-lifestyle-laptop.jpg', 'mojautodiler-storefront.jpg'];
  for (const f of files) {
    const p = path.join(brandDir, f).replace(/\\/g, '/');
    await page.setContent(`<body style="margin:0;background:#111;"><img src="file:///${p}" style="width:100%;height:100%;object-fit:contain;"></body>`);
    const out = path.join(__dirname, f.replace(/\.(png|jpg)/, '-thumb.jpg'));
    await page.screenshot({ path: out });
    console.log('Saved', out);
  }
  await browser.close();
})();
