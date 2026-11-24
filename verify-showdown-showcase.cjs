const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\athar\\.gemini\\antigravity\\brain\\9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function run() {
  console.log('🚀 Starting Playwright verification for 3-Way Showdown Showcase...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to Life OS
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Navigate to Product Showcase View
    console.log('Navigating to Showcase view...');
    // Click on 3-Way Showdown Showcase link in the top banner or sidebar
    const showcaseBtn = page.locator('button:has-text("3-Way Showdown Showcase")').first();
    if (await showcaseBtn.isVisible()) {
      await showcaseBtn.click();
    } else {
      const sidebarShowcase = page.locator('button:has-text("Product Showcase (3-Way)")').first();
      await sidebarShowcase.click();
    }
    await page.waitForTimeout(1000);

    // 3. Screenshot Variant 1: Antigravity Editorial
    console.log('Capturing Variant 1: Antigravity Editorial...');
    const variant1Btn = page.locator('button:has-text("1. Antigravity")').first();
    await variant1Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'showdown-showcase-variant1-antigravity.png'),
      fullPage: false
    });

    // 4. Screenshot Variant 2: Taste-Skill Craft
    console.log('Capturing Variant 2: Taste-Skill Craft...');
    const variant2Btn = page.locator('button:has-text("2. Taste-Skill")').first();
    await variant2Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'showdown-showcase-variant2-taste.png'),
      fullPage: false
    });

    // 5. Screenshot Variant 3: Impeccable Precision
    console.log('Capturing Variant 3: Impeccable Precision...');
    const variant3Btn = page.locator('button:has-text("3. Impeccable")').first();
    await variant3Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'showdown-showcase-variant3-impeccable.png'),
      fullPage: false
    });

    // 6. Test Interactive Live Demo in Showcase
    console.log('Testing Interactive Demo...');
    const taskItem = page.locator('div:has-text("Synthesize Q3 Life OS Capital & Career Runway")').first();
    if (await taskItem.isVisible()) {
      await taskItem.click();
      await page.waitForTimeout(300);
    }
    const habitCell = page.locator('button:has-text("✓")').first();
    if (await habitCell.isVisible()) {
      await habitCell.click();
      await page.waitForTimeout(300);
    }
    const focusTimerBtn = page.locator('button:has-text("Start Focus")').first();
    if (await focusTimerBtn.isVisible()) {
      await focusTimerBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'showdown-showcase-interactive-demo.png'),
      fullPage: false
    });

    // 7. Test Side-by-Side Split View
    console.log('Testing Split View...');
    const splitBtn = page.locator('button:has-text("Split View"), button:has-text("Side-by-Side")').first();
    if (await splitBtn.isVisible()) {
      await splitBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'showdown-showcase-split-view.png'),
        fullPage: false
      });
      // Toggle back to single
      await splitBtn.click();
      await page.waitForTimeout(500);
    }

    // 8. Open Audit Matrix / Comparison Drawer
    console.log('Testing Comparison Drawer...');
    const matrixBtn = page.locator('button:has-text("Audit Rubrics"), button:has-text("Showdown Rubrics"), button:has-text("Matrix")').first();
    if (await matrixBtn.isVisible()) {
      await matrixBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'showdown-showcase-audit-rubrics.png'),
        fullPage: false
      });
    }

    console.log('✅ All Playwright screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Playwright error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
