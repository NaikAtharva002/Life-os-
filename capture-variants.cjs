const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function capture() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  console.log('Capturing Variant 1 (Port 5173)...');
  const page1 = await context.newPage();
  try {
    await page1.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
    await page1.waitForTimeout(1500);
    await page1.screenshot({ path: path.join(ARTIFACTS_DIR, 'variant1-obsidian-executive.png') });
    console.log('Saved variant1-obsidian-executive.png');
  } catch (err) {
    console.error('Error capturing 5173:', err);
  }

  console.log('Capturing Variant 2 (Port 5174)...');
  const page2 = await context.newPage();
  try {
    await page2.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 15000 });
    await page2.waitForTimeout(1500);
    await page2.screenshot({ path: path.join(ARTIFACTS_DIR, 'variant2-taste-skill-craft.png') });
    console.log('Saved variant2-taste-skill-craft.png');
  } catch (err) {
    console.error('Error capturing 5174:', err);
  }

  console.log('Capturing Variant 3 (Port 5175)...');
  const page3 = await context.newPage();
  try {
    await page3.goto('http://localhost:5175', { waitUntil: 'networkidle', timeout: 15000 });
    await page3.waitForTimeout(1500);
    await page3.screenshot({ path: path.join(ARTIFACTS_DIR, 'variant3-impeccable-swiss.png') });
    console.log('Saved variant3-impeccable-swiss.png');

    // Click "Compare All 3 Matrix" button
    console.log('Opening Comparison Matrix drawer...');
    await page3.click('button:has-text("Compare All 3 Matrix")');
    await page3.waitForTimeout(1000);
    await page3.screenshot({ path: path.join(ARTIFACTS_DIR, 'variant-comparison-matrix-drawer.png') });
    console.log('Saved variant-comparison-matrix-drawer.png');
  } catch (err) {
    console.error('Error capturing 5175:', err);
  }

  await browser.close();
  console.log('Done capturing all 3 variants!');
}

capture().catch(console.error);
