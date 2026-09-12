import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = CHROME_PATHS.find((p) => p && existsSync(p));
const FRONTEND_DIR = 'e:\\project\\frontend';
const OUT_DIR = 'e:\\project\\vidiocut';
const PORT = 3124;
const BASE = `http://localhost:${PORT}/`;

const server = spawn('cmd', ['/c', 'npm', 'run', 'preview', '--', '--port', String(PORT), '--strictPort'], { cwd: FRONTEND_DIR, stdio: 'ignore' });

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const res = await fetch(url); if (res.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('preview server did not start');
}

try {
  await waitForServer(BASE);
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1400, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));

  const shoot = async (label, navText, file) => {
    const clicked = await page.evaluate((txt) => {
      const btn = [...document.querySelectorAll('.nav-links button')].find((b) => b.textContent.trim() === txt);
      if (btn) { btn.click(); return true; }
      return false;
    }, navText);
    await new Promise((r) => setTimeout(r, 900));
    console.log(label, 'clicked:', clicked);
    await page.screenshot({ path: `${OUT_DIR}\\${file}` });
    console.log('  saved', file);
  };

  await shoot('features', 'Features', 'frontend-features.png');
  await shoot('faq', 'FAQ', 'frontend-faq.png');
  await shoot('ask', 'Ask', 'frontend-ask.png');

  await browser.close();
} finally {
  server.kill();
}
