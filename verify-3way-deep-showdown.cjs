const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function runDeepShowdownVerification() {
  console.log('Launching browser to capture Comprehensive 3-Way Design Showdown...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });

  // 1. Desktop Context
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // 1. Variant 1: Antigravity Editorial Architecture
  console.log('1/8 Capturing Variant 1: Antigravity Editorial Desktop...');
  await page.click('button:has-text("1. Antigravity")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-variant1-agent-desktop.png'), fullPage: false });

  // 2. Variant 2: Taste-Skill Craftsmanship
  console.log('2/8 Capturing Variant 2: Taste-Skill Craft Desktop...');
  await page.click('button:has-text("2. Taste-Skill")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-variant2-taste-desktop.png'), fullPage: false });

  // 3. Variant 3: Impeccable Precision
  console.log('3/8 Capturing Variant 3: Impeccable Precision Desktop...');
  await page.click('button:has-text("3. Impeccable")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-variant3-impeccable-desktop.png'), fullPage: false });

  // 4. Split-View Comparison
  console.log('4/8 Capturing Split-View Side-by-Side Comparison...');
  await page.click('button:has-text("Split Compare")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-split-view.png'), fullPage: false });

  // Exit split view
  await page.click('button:has-text("Exit Split View")');
  await page.waitForTimeout(800);

  // 5. Open Scorecard Matrix Drawer (Tab 1: Feature Matrix)
  console.log('5/8 Capturing Scorecard Matrix Drawer (Feature Matrix)...');
  await page.click('button:has-text("Scorecard Matrix")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-matrix-drawer.png'), fullPage: false });

  // 6. Switch to 5-Rubric Scorecard Tab
  console.log('6/8 Capturing 5-Rubric Scorecard Tab...');
  await page.click('button:has-text("5-Rubric Scorecard")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-rubrics-drawer.png'), fullPage: false });

  // 7. Switch to Architectural Verdict Tab
  console.log('7/8 Capturing Architectural Verdict Tab...');
  await page.click('button:has-text("Architectural Verdict")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-verdict-drawer.png'), fullPage: false });

  // Close drawer
  const closeBtn = page.locator('button:has(svg.lucide-x)');
  if (await closeBtn.count() > 0) {
    await closeBtn.first().click();
    await page.waitForTimeout(500);
  }

  // 8. Mobile Viewport (390 x 844)
  console.log('8/8 Capturing Mobile Viewport (390x844)...');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'showdown-3way-mobile-view.png'), fullPage: false });

  await browser.close();
  console.log('✓ All 8 showdown verification screenshots successfully captured!');
}

runDeepShowdownVerification().catch((err) => {
  console.error('Error verifying deep showdown:', err);
  process.exit(1);
});
