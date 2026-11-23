const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function capture() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  const dest = path.join(ARTIFACTS_DIR, 'life-os-3-dashboard-full.png');
  await page.screenshot({ path: dest, fullPage: true });
  console.log(`Saved fullPage screenshot to ${dest}`);

  await browser.close();
}

capture().catch(console.error);
