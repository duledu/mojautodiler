const fs = require('fs');
const puppeteer = require('./node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });
  const html = `
    <body style="background:#222;color:#fff;font-family:sans-serif;padding:20px;">
      <h1>Mockups</h1>
      ${[1, 2, 3, 4].map(i => `
        <div style="margin-bottom:30px;">
          <h3>Copy of ${i}.png</h3>
          <img src="file:///C:/Projects/mojautodiler/public/carVertical%20asset/Mockups%20for%20affiliate%20partners/Copy%20of%20${i}.png" style="width:500px;border:1px solid #555;">
        </div>
      `).join('')}
    </body>
  `;
  await page.setContent(html);
  await page.screenshot({ path: 'c:/Projects/carVertical & mojautodiler/marketing/carvertical-social-campaign-30/_source/mockups-sheet.jpg' });
  console.log('Saved mockups-sheet.jpg');
  await browser.close();
})();
