const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function captureAll() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('Opening LIFE OS 3.0 on http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // 1. Dashboard
  console.log('Capturing Dashboard...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-dashboard.png'), fullPage: true });

  // 2. Focus Sanctuary Mode
  console.log('Navigating to Focus Sanctuary Mode...');
  await page.click('button:has-text("Focus Sanctuary"), button:has-text("Focus Mode"), a:has-text("Focus Mode")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-focus.png'), fullPage: false });

  // 3. Goals
  console.log('Navigating to Goals...');
  await page.click('button:has-text("Goals"), a:has-text("Goals"), span:has-text("Goals")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-goals.png'), fullPage: true });

  // 4. Habits
  console.log('Navigating to Habits...');
  await page.click('button:has-text("Habits"), a:has-text("Habits"), span:has-text("Habits")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-habits.png'), fullPage: true });

  // 5. Gym & Fitness
  console.log('Navigating to Gym & Fitness...');
  await page.click('button:has-text("Gym & Fitness"), span:has-text("Gym & Fitness")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-gym.png'), fullPage: true });

  // 6. Academics
  console.log('Navigating to Academics...');
  await page.click('button:has-text("Academics"), span:has-text("Academics")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-academics.png'), fullPage: true });

  // 7. Finance
  console.log('Navigating to Finances...');
  await page.click('button:has-text("Finances"), span:has-text("Finances")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'life-os-3-finance.png'), fullPage: true });

  await browser.close();
  console.log('All LIFE OS 3.0 screenshots captured successfully!');
}

captureAll().catch(console.error);
