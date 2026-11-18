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
  await page.setViewport({ width: 1080, height: 1350 });

  const renderCard = async (imgSrc, tagText, outFile) => {
    let html = fs.readFileSync(path.join(HTML, 'test-fb18.html'), 'utf8');
    html = html.replace('../brand/cv-mockup-2.png', imgSrc);
    html = html.replace('carVertical digitalni izveštaj', tagText);
    const tmp = path.join(HTML, 'tmp-fb18.html');
    fs.writeFileSync(tmp, html, 'utf8');
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SRC, outFile) });
    console.log('Saved', outFile);
  };

  await renderCard('../brand/cv-lifestyle-laptop.jpg', 'carVertical izveštaj o kilometraži', 'test-fb18-laptop.png');
  await renderCard('../brand/mojautodiler-storefront.jpg', 'MojAutoDiler ponuda proverenih vozila', 'test-fb18-storefront.png');

  await browser.close();
})();
