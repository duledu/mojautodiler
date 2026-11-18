import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

function createSessionToken(secret: string): string {
  const iat = Math.floor(Date.now() / 1000).toString();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(iat);
  const sig = hmac
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${iat}.${sig}`;
}

const secret = process.env.ADMIN_SECRET || 'dev-fallback-secret-change-before-production';
const token = createSessionToken(secret);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = 'C:\\Users\\PC\\.gemini\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\responsive_audit';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const posts = [
  { id: 'cmwlwjzks0002uk5kzjgg1mtz', short: 'art01_cene' },
  { id: 'cmwlwjzoi0005uk5k08qbp41s', short: 'art02_kilometraza' },
  { id: 'cmwlwjzrb0008uk5kpqx8d2ce', short: 'art03_ostecenja' },
  { id: 'cmwlwjzu4000buk5k42ai64pz', short: 'art04_svajcarska' },
  { id: 'cmwlwjzwx000euk5knm79nwcf', short: 'art05_pogon' },
];

const viewports = [
  { name: '320px_small_mobile', width: 320, height: 700, capture: true },
  { name: '360px_android_mobile', width: 360, height: 740, capture: false },
  { name: '375px_iphone', width: 375, height: 812, capture: true },
  { name: '390px_modern_phone', width: 390, height: 844, capture: true },
  { name: '430px_large_phone', width: 430, height: 932, capture: true },
  { name: '768px_tablet_portrait', width: 768, height: 1024, capture: true },
  { name: '1024px_tablet_landscape', width: 1024, height: 768, capture: true },
  { name: '1280px_small_laptop', width: 1280, height: 800, capture: true },
  { name: '1440px_desktop', width: 1440, height: 900, capture: true },
  { name: '1920px_full_hd', width: 1920, height: 1080, capture: true },
  { name: '2560px_large_desktop', width: 2560, height: 1440, capture: true },
  { name: '844x390_mobile_landscape', width: 844, height: 390, capture: true },
  { name: '1024x768_tablet_landscape', width: 1024, height: 768, capture: false },
];

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

async function audit() {
  const tempProfile = path.resolve('scratch/chrome-audit-profile');
  if (!fs.existsSync(tempProfile)) {
    fs.mkdirSync(tempProfile, { recursive: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  let wsUrl = '';
  for (let i = 0; i < 10; i++) {
    const data = await fetchJson('http://127.0.0.1:9223/json/version');
    if (data?.webSocketDebuggerUrl) {
      wsUrl = data.webSocketDebuggerUrl;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!wsUrl) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome CDP');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
  const pending = new Map<number, (res: any) => void>();
  ws.onmessage = (e: MessageEvent) => {
    const p = JSON.parse(e.data as string);
    if (p.id && pending.has(p.id)) {
      pending.get(p.id)!(p);
      pending.delete(p.id);
    }
  };

  function sendCmd(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const target = await sendCmd('Target.createTarget', { url: 'about:blank' });
  const tabWs = new WebSocket(`ws://127.0.0.1:9223/devtools/page/${target.result.targetId}`);
  await new Promise((res, rej) => {
    tabWs.onopen = res;
    tabWs.onerror = rej;
  });

  let tabMsgId = 1;
  const tabPending = new Map<number, (res: any) => void>();
  tabWs.onmessage = (e: MessageEvent) => {
    const p = JSON.parse(e.data as string);
    if (p.id && tabPending.has(p.id)) {
      tabPending.get(p.id)!(p);
      tabPending.delete(p.id);
    }
  };

  function sendTab(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve) => {
      const id = tabMsgId++;
      tabPending.set(id, resolve);
      tabWs.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendTab('Page.enable');
  await sendTab('Network.enable');
  await sendTab('Runtime.enable');

  await sendTab('Network.setCookie', {
    name: 'admin_token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
  });

  const auditResults: any[] = [];

  for (const post of posts) {
    const url = `http://localhost:3000/sr/admin/blog/${post.id}/preview`;
    console.log(`\n======================================================`);
    console.log(`Auditing: ${post.short} (${url})`);
    console.log(`======================================================`);

    for (const vp of viewports) {
      await sendTab('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width <= 430,
      });

      await sendTab('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1500));

      // Evaluate metrics in page context
      const evalRes = await sendTab('Runtime.evaluate', {
        expression: `
          (() => {
            const docEl = document.documentElement;
            const scrollW = docEl.scrollWidth;
            const clientW = docEl.clientWidth;
            const hasHOverflow = scrollW > clientW;

            // Find elements wider than clientWidth
            const overflowingEls = [];
            document.querySelectorAll('*').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientW + 2) {
                overflowingEls.push({
                  tag: el.tagName,
                  className: (el.className || '').toString().slice(0, 50),
                  right: Math.round(rect.right),
                  clientW
                });
              }
            });

            // Inspect Cover image
            const coverImg = document.querySelector('article img');
            const imgData = coverImg ? {
              src: coverImg.src,
              naturalWidth: coverImg.naturalWidth,
              naturalHeight: coverImg.naturalHeight,
              renderedWidth: Math.round(coverImg.getBoundingClientRect().width),
              renderedHeight: Math.round(coverImg.getBoundingClientRect().height),
              aspectRatioMatch: Math.abs((coverImg.naturalWidth / coverImg.naturalHeight) - (coverImg.getBoundingClientRect().width / coverImg.getBoundingClientRect().height)) < 0.2
            } : null;

            // Inspect Tables
            const tables = Array.from(document.querySelectorAll('table')).map(t => {
              const parent = t.closest('figure') || t.parentElement;
              return {
                tableWidth: t.scrollWidth,
                parentOverflow: parent ? window.getComputedStyle(parent).overflowX : 'unknown',
                parentWidth: parent ? parent.clientWidth : 0
              };
            });

            // Inspect Headings
            const h1 = document.querySelector('h1');
            const h2 = document.querySelector('h2');
            const typography = {
              h1: h1 ? { fontSize: window.getComputedStyle(h1).fontSize, lineHeight: window.getComputedStyle(h1).lineHeight } : null,
              h2: h2 ? { fontSize: window.getComputedStyle(h2).fontSize, lineHeight: window.getComputedStyle(h2).lineHeight } : null,
              body: { fontSize: window.getComputedStyle(document.body).fontSize }
            };

            return {
              hasHOverflow,
              scrollW,
              clientW,
              overflowCount: overflowingEls.length,
              overflowSample: overflowingEls.slice(0, 3),
              imgData,
              tables,
              typography
            };
          })()
        `,
        returnByValue: true,
      });

      const metrics = evalRes.result?.value;
      const pass = !metrics?.hasHOverflow;

      console.log(`[${vp.name}] ${vp.width}x${vp.height} -> Overflow: ${metrics?.hasHOverflow ? 'FAIL (' + metrics.scrollW + 'px > ' + metrics.clientW + 'px)' : 'PASS (No overflow)'}`);

      if (metrics?.overflowCount > 0) {
        console.warn(`  Warning: ${metrics.overflowCount} overflowing elements:`, metrics.overflowSample);
      }

      auditResults.push({
        post: post.short,
        viewport: vp.name,
        width: vp.width,
        pass,
        metrics,
      });

      // Capture screenshot if representative
      if (vp.capture) {
        const shot = await sendTab('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false,
        });
        const shotPath = path.join(outputDir, `${post.short}_${vp.name}.png`);
        fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
      }
    }
  }

  tabWs.close();
  ws.close();
  chromeProc.kill();

  const reportJson = path.join(outputDir, 'responsive_audit_summary.json');
  fs.writeFileSync(reportJson, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\nAudit complete! Results saved to ${reportJson}`);
}

audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
