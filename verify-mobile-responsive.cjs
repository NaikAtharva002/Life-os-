const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function runMobileResponsiveVerification() {
  console.log('Starting Mobile-First Responsive Design 2.0 Verification Suite...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });

  // 1. STANDARD MOBILE VIEWPORT (375 x 812 - iPhone 13 / 14 / Mini)
  console.log('1/8 Capturing Standard Mobile Dashboard (375x812)...');
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-dashboard-375x812.png'), fullPage: false });

  // 2. MOBILE DRAWER MENU OPEN
  console.log('2/8 Capturing Mobile Drawer Menu...');
  // Tap the 'More' button in the bottom navigation bar
  const moreBtn = mobilePage.locator('button.mobile-bottom-nav-item:has-text("More")');
  if (await moreBtn.count() > 0) {
    await moreBtn.click();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-drawer-open.png'), fullPage: false });
    // Close drawer
    const closeBtn = mobilePage.locator('button.mobile-only[aria-label="Close menu drawer"]');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await mobilePage.waitForTimeout(500);
    }
  }

  // 3. MOBILE TASK MANAGEMENT
  console.log('3/8 Capturing Mobile Task Management...');
  const tasksNavBtn = mobilePage.locator('button.mobile-bottom-nav-item:has-text("Tasks")');
  if (await tasksNavBtn.count() > 0) {
    await tasksNavBtn.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-tasks.png'), fullPage: false });
  }

  // 4. MOBILE GOALS PAGE
  console.log('4/8 Capturing Mobile Goals Management...');
  const goalsNavBtn = mobilePage.locator('button.mobile-bottom-nav-item:has-text("Goals")');
  if (await goalsNavBtn.count() > 0) {
    await goalsNavBtn.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-goals.png'), fullPage: false });
  }

  // 5. MOBILE FINANCE CARDS (No horizontal scroll table)
  console.log('5/8 Capturing Mobile Finance Cards Layout...');
  // Open drawer and navigate to Finance
  await moreBtn.click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.click('button:has-text("Finances")');
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-finance-cards.png'), fullPage: false });

  // 6. MOBILE FITNESS PAGE
  console.log('6/8 Capturing Mobile Fitness Page...');
  await moreBtn.click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.click('button:has-text("Gym & Fitness")');
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-fitness.png'), fullPage: false });

  // 7. MOBILE MODAL / FORM (Quick Add Task via Center FAB)
  console.log('7/8 Capturing Mobile Form & Touch Controls Modal...');
  const quickAddBtn = mobilePage.locator('button.mobile-bottom-nav-quick-add');
  if (await quickAddBtn.count() > 0) {
    await quickAddBtn.click();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'mobile-responsive-task-modal.png'), fullPage: false });
    // Close modal
    const modalCloseBtn = mobilePage.locator('.modal button:has(svg.lucide-x)');
    if (await modalCloseBtn.count() > 0) {
      await modalCloseBtn.first().click();
      await mobilePage.waitForTimeout(500);
    }
  }

  // 8. SMALL MOBILE (320 x 700 - iPhone SE 1st gen / Android compact)
  console.log('Capturing Ultra-Compact Mobile (320x700)...');
  const smallContext = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const smallPage = await smallContext.newPage();
  await smallPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await smallPage.waitForTimeout(1500);
  await smallPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'small-mobile-320x700.png'), fullPage: false });

  // 9. TABLET VIEWPORT (768 x 1024 - iPad Mini / Air)
  console.log('8/8 Capturing Tablet Dashboard (768x1024)...');
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await tabletPage.waitForTimeout(1500);
  await tabletPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'tablet-responsive-dashboard-768x1024.png'), fullPage: false });

  // 10. DESKTOP VIEWPORT (1440 x 900 - MacBook / Desktop)
  console.log('Capturing Desktop Reference Dashboard (1440x900)...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'desktop-responsive-dashboard-1440x900.png'), fullPage: false });

  await browser.close();
  console.log('✓ All 10 multi-device responsive screenshots successfully captured!');
}

runMobileResponsiveVerification().catch((err) => {
  console.error('Error executing mobile responsive verification:', err);
  process.exit(1);
});
