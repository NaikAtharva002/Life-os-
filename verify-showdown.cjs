const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function runShowdownVerification() {
  console.log('Launching browser to capture 3-Way Design Showdown...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // 1. Variant 1: Antigravity Editorial Architecture
  console.log('Capturing Variant 1: Antigravity Editorial...');
  await page.click('button:has-text("1. Antigravity")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-variant1-agent.png'), fullPage: false });

  // 2. Variant 2: Taste-Skill Craftsmanship
  console.log('Capturing Variant 2: Taste-Skill Craft...');
  await page.click('button:has-text("2. Taste-Skill")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-variant2-taste.png'), fullPage: false });

  // 3. Variant 3: Impeccable Precision
  console.log('Capturing Variant 3: Impeccable Precision...');
  await page.click('button:has-text("3. Impeccable")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-variant3-impeccable.png'), fullPage: false });

  // 4. Split-View Comparison
  console.log('Capturing Split-View Comparison...');
  await page.click('button:has-text("Split Compare")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-split-comparison.png'), fullPage: false });

  // Exit split view
  await page.click('button:has-text("Exit Split View")');
  await page.waitForTimeout(500);

  // 5. Open Scorecard Matrix Drawer
  console.log('Capturing Scorecard Matrix Drawer...');
  await page.click('button:has-text("Scorecard Matrix")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-scorecard-matrix.png'), fullPage: false });

  await browser.close();
  console.log('✓ All 3-way showdown screenshots successfully captured!');
}

runShowdownVerification().catch((err) => {
  console.error('Error verifying showdown:', err);
  process.exit(1);
});
