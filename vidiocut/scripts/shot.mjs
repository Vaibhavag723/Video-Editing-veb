import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

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

const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;

// start `vite preview` (production build)
const server = spawn('cmd', ['/c', 'node_modules\\.bin\\vite.cmd', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  stdio: 'ignore',
});

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('preview server did not start');
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
    // true device-metrics emulation (works below Chrome's 500px window minimum)
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1700)); // let reveal animations settle

    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    const overflow = metrics.scrollWidth > metrics.clientWidth ? '  << HORIZONTAL OVERFLOW' : '';
    console.log(`${name}: viewport ${width}px | layout clientWidth=${metrics.clientWidth} scrollWidth=${metrics.scrollWidth}${overflow}`);

    await page.screenshot({ path: `preview-${name}.png` });
    await page.close();
    console.log(`  saved preview-${name}.png`);
  }

  await browser.close();
} finally {
  server.kill();
}
