const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function verifyThemes() {
  console.log('Launching browser to verify Brick Ember & Dark Walnut Brand Theme...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // 1. Force Dark Theme for dark baseline verification
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(500);

  console.log('Capturing Dark Theme views...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-dashboard.png'), fullPage: false });

  // Goals (Dark)
  await page.click('button:has-text("Strategic Goals"), button:has-text("Goals")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-goals.png'), fullPage: false });

  // Tasks (Dark)
  await page.click('button:has-text("Tasks"), span:has-text("Tasks")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-tasks.png'), fullPage: false });

  // Habits (Dark)
  await page.click('button:has-text("Habits"), span:has-text("Habits")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-habits.png'), fullPage: false });

  // Finances (Dark)
  await page.click('button:has-text("Finances"), span:has-text("Finances")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-finance.png'), fullPage: false });

  // Gym & Fitness (Dark)
  await page.click('button:has-text("Gym & Fitness"), span:has-text("Gym & Fitness"), button:has-text("Gym")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-fitness.png'), fullPage: false });

  // Academics (Dark)
  await page.click('button:has-text("Academics"), span:has-text("Academics")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-dark-academics.png'), fullPage: false });

  // 2. Switch to Light Theme
  console.log('Switching to Light Theme...');
  // Click theme toggle button in sidebar
  const themeToggle = await page.$('button[aria-label="Toggle theme"]');
  if (themeToggle) {
    await themeToggle.click();
    await page.waitForTimeout(800);
  } else {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
  }

  const currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Current active theme: ${currentTheme}`);

  // Navigate to Dashboard in Light mode
  await page.click('button:has-text("Dashboard"), span:has-text("Dashboard")');
  await page.waitForTimeout(1000);
  console.log('Capturing Light Theme Dashboard...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-dashboard.png'), fullPage: false });

  // Goals (Light)
  await page.click('button:has-text("Strategic Goals"), button:has-text("Goals")');
  await page.waitForTimeout(800);
  console.log('Capturing Light Theme Goals...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-goals.png'), fullPage: false });

  // Tasks (Light)
  await page.click('button:has-text("Tasks"), span:has-text("Tasks")');
  await page.waitForTimeout(800);
  console.log('Capturing Light Theme Tasks...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-tasks.png'), fullPage: false });

  // Habits (Light)
  await page.click('button:has-text("Habits"), span:has-text("Habits")');
  await page.waitForTimeout(800);
  console.log('Capturing Light Theme Habits...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-habits.png'), fullPage: false });

  // Finances (Light)
  await page.click('button:has-text("Finances"), span:has-text("Finances")');
  await page.waitForTimeout(800);
  console.log('Capturing Light Theme Finances...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-finance.png'), fullPage: false });

  // Settings (Light)
  await page.click('button:has-text("Settings"), span:has-text("Settings")');
  await page.waitForTimeout(800);
  console.log('Capturing Light Theme Settings...');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'brand-light-settings.png'), fullPage: false });

  // 3. Test Theme Persistence on Reload
  console.log('Testing reload persistence...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const reloadedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Theme after reload: ${reloadedTheme}`);

  await browser.close();
  console.log('Brand Theme verification and screenshot capture complete!');
}

verifyThemes().catch(console.error);
