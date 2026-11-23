const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1280x800', width: 1280, height: 800 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 }
];

async function runDesignSystemVerification() {
  console.log('Launching browser to verify Design System 2.0...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });

  // 1. Desktop Showcase (Design System Gallery)
  console.log('Testing Design System Showcase Gallery in Dark and Light themes...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktopContext.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1200);

  // Navigate to Settings then click Developer Tools -> Design System Gallery
  await page.click('button:has-text("Settings"), span:has-text("Settings")');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Open Design System Component Gallery")');
  await page.waitForTimeout(1000);

  // Capture Design System Gallery (Dark)
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'ds2-gallery-dark-tokens.png'), fullPage: false });

  // Switch to Components Tab
  await page.click('button:has-text("Core Component Kit")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'ds2-gallery-dark-components.png'), fullPage: false });

  // Switch to Light Mode
  await page.click('button:has-text("Toggle Light Mode")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'ds2-gallery-light-components.png'), fullPage: false });

  // Switch back to Dark Mode
  await page.click('button:has-text("Toggle Dark Mode")');
  await page.waitForTimeout(500);

  await desktopContext.close();

  // 2. Responsive Multi-Viewport Suite (Testing Dashboard & Shell across screen sizes)
  for (const vp of VIEWPORTS) {
    console.log(`Verifying viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const vpPage = await vpContext.newPage();

    await vpPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
    await vpPage.waitForTimeout(1000);

    // Capture Viewport Dashboard
    await vpPage.screenshot({
      path: path.join(ARTIFACTS_DIR, `ds2-responsive-${vp.name}.png`),
      fullPage: false
    });

    await vpContext.close();
  }

  await browser.close();
  console.log('✓ Design System 2.0 multi-viewport & theme verification complete!');
}

runDesignSystemVerification().catch((err) => {
  console.error('Error during design system verification:', err);
  process.exit(1);
});
