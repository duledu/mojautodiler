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
const outputDir = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\cdfc4f51-37c2-4b05-801c-9e7c6392048e\\responsive_audit';

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

async function captureCtas() {
  const tempProfile = path.resolve('scratch/chrome-cta-profile');
  if (!fs.existsSync(tempProfile)) {
    fs.mkdirSync(tempProfile, { recursive: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  let wsUrl = '';
  for (let i = 0; i < 10; i++) {
    const data = await fetchJson('http://127.0.0.1:9224/json/version');
    if (data?.webSocketDebuggerUrl) {
      wsUrl = data.webSocketDebuggerUrl;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
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
  const tabWs = new WebSocket(`ws://127.0.0.1:9224/devtools/page/${target.result.targetId}`);
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

  await sendTab('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const postsWithAffiliate = [
    { id: 'cmwlwjzoi0005uk5k08qbp41s', name: 'art02_carvertical_cta' },
    { id: 'cmwlwjzrb0008uk5kpqx8d2ce', name: 'art03_carvertical_cta' },
    { id: 'cmwlwjzu4000buk5k42ai64pz', name: 'art04_carvertical_cta' },
    { id: 'cmwlwjzwx000euk5knm79nwcf', name: 'art05_carvertical_cta' },
  ];

  for (const item of postsWithAffiliate) {
    const url = `http://localhost:3000/sr/admin/blog/${item.id}/preview`;
    await sendTab('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to blockquote containing carVertical
    await sendTab('Runtime.evaluate', {
      expression: `
        (() => {
          const bq = Array.from(document.querySelectorAll('blockquote')).find(b => b.textContent.includes('carVertical'));
          if (bq) {
            bq.scrollIntoView({ behavior: 'instant', block: 'center' });
            return true;
          }
          return false;
        })()
      `,
    });

    await new Promise((r) => setTimeout(r, 500));

    const shot = await sendTab('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });

    const shotPath = path.join(outputDir, `${item.name}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    console.log(`Saved scrolled CTA screenshot: ${shotPath}`);
  }

  tabWs.close();
  ws.close();
  chromeProc.kill();
}

captureCtas().catch(console.error);
