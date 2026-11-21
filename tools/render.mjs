// Renders page/index.html at 1024x1024 with headless Chromium.
// Writes entry.png as JPEG bytes (the lossless PNG is over 1 MB; the rules accept
// JPEG bytes in entry.png) and a lossless preview to out/render.png.
// Usage: PW_NODE_MODULES=<dir containing playwright> node tools/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pwDir = process.env.PW_NODE_MODULES;
if (!pwDir) { console.error('Set PW_NODE_MODULES'); process.exit(1); }
const require = createRequire(path.join(pwDir, 'noop.js'));
const { chromium } = require('playwright');

const out = path.join(root, 'entry.png');
const preview = path.join(root, 'out', 'render.png');
fs.mkdirSync(path.dirname(preview), { recursive: true });
const url = pathToFileURL(path.join(root, 'page', 'index.html')).href;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 10000 });
  await page.waitForTimeout(200);
  const clip = { x: 0, y: 0, width: 1024, height: 1024 };
  await page.screenshot({ path: preview, type: 'png', clip });
  await page.screenshot({ path: out, type: 'jpeg', quality: 95, clip });
} finally {
  await browser.close();
}
console.log('wrote', path.relative(root, out), fs.statSync(out).size, 'bytes');
