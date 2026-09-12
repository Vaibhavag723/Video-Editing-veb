import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

// Screenshots the frontend (e:\project\frontend) marketing site — the ported
// FlowStep design — at desktop + mobile sizes using true device-metric
// emulation. Run from e:\project\vidiocut after `npm run build` in
// e:\project\frontend:  node scripts/shot-frontend.mjs

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = CHROME_PATHS.find((p) => p && existsSync(p));
if (!executablePath) {
  console.error('Chrome not found; set CHROME_PATHS entry manually.');
  process.exit(1);
}

const FRONTEND_DIR = 'e:\\project\\frontend';
const OUT_DIR = 'e:\\project\\vidiocut';
const PORT = 3123;
const BASE = `http://localhost:${PORT}/`;

const server = spawn('cmd', ['/c', 'npm', 'run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
  cwd: FRONTEND_DIR,
  stdio: 'ignore',
});

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('vite preview server did not start');
}

const SHOTS = [
  { name: 'desktop', width: 1440, height: 2600 },
  { name: 'mobile', width: 390, height: 2400 },
];

try {
  await waitForServer(BASE);
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] });

  for (const { name, width, height } of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 800));
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 1200));

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
    }));
    const overflow = metrics.scrollWidth > metrics.clientWidth ? '  << HORIZONTAL OVERFLOW' : '';
    console.log(`${name}: viewport ${width}px | clientWidth=${metrics.clientWidth} scrollWidth=${metrics.scrollWidth}${overflow}`);
    console.log(`  title: ${metrics.title}`);

    await page.screenshot({ path: `${OUT_DIR}\\frontend-home-${name}.png` });
    await page.close();
    console.log(`  saved frontend-home-${name}.png`);
  }

  await browser.close();
} finally {
  server.kill();
}
