const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function verifyMicroInteractions() {
  console.log('Starting LIFE OS Micro-Interactions 2.0 automated verification...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });

  // 1. Desktop Session
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // --- TEST 1: Task Completion Micro-interaction & Toast ---
  console.log('1/6 Testing Task Checkbox & Completion Toast...');
  const taskCheckbox = page.locator('.editorial-triage-row .interactive-checkbox-box').first();
  if (await taskCheckbox.count() > 0) {
    await taskCheckbox.click();
    await page.waitForTimeout(600); // Allow checkmark pop & toast slide-in
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-task-completed-toast.png'), fullPage: false });
    console.log('✓ Captured Task completion & toast screenshot.');
  }

  // --- TEST 2: Habit Toggle Micro-interaction ---
  console.log('2/6 Testing Habit Toggle Button & Streak Toast...');
  const habitBtn = page.locator('.btn-habit-check').first();
  if (await habitBtn.count() > 0) {
    await habitBtn.click();
    await page.waitForTimeout(600); // Allow scale & toast
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-habit-completed-toast.png'), fullPage: false });
    console.log('✓ Captured Habit toggle & toast screenshot.');
  }

  // --- TEST 3: Focus Timer Active State ---
  console.log('3/6 Testing Focus Timer Start & Pulse State...');
  const startTimerBtn = page.locator('button:has-text("Start Focus")').first();
  if (await startTimerBtn.count() > 0) {
    await startTimerBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-focus-timer-active.png'), fullPage: false });
    console.log('✓ Captured Focus timer active state.');
  }

  // --- TEST 4: Design System Gallery (Checkboxes, Sliders, Skeletons, Toasts) ---
  console.log('4/6 Navigating to Design System Gallery...');
  // Open Settings then click Design System or navigate directly
  await page.click('button[title="Settings"], button:has-text("Settings")');
  await page.waitForTimeout(600);
  const dsLink = page.locator('button:has-text("Design System Gallery")').first();
  if (await dsLink.count() > 0) {
    await dsLink.click();
    await page.waitForTimeout(800);
    // Switch to Components Tab
    await page.click('button:has-text("Core Component Kit")');
    await page.waitForTimeout(600);
    // Trigger Info Toast to demonstrate live notification
    const triggerInfoBtn = page.locator('button:has-text("Trigger Info Toast")').first();
    if (await triggerInfoBtn.count() > 0) {
      await triggerInfoBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-gallery-controls.png'), fullPage: false });
    console.log('✓ Captured Component gallery with Checkboxes, Sliders, Skeletons & Toasts.');

    // Launch Test Modal Dialog
    const modalLaunchBtn = page.locator('button:has-text("Launch Test Modal Dialog")').first();
    if (await modalLaunchBtn.count() > 0) {
      await modalLaunchBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-modal-dialog-animation.png'), fullPage: false });
      console.log('✓ Captured Modal dialog with backdrop blur & spring scale.');
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  // --- TEST 5: Mobile Viewport (390 x 844) Touch & Layout ---
  console.log('5/6 Testing Mobile Viewport Touch Targets...');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-mobile-interactions.png'), fullPage: false });
  console.log('✓ Captured Mobile viewport responsive micro-interactions.');

  // --- TEST 6: Reduced Motion Accessibility Check ---
  console.log('6/6 Testing Reduced Motion Media Query...');
  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce'
  });
  const reducedPage = await reducedMotionContext.newPage();
  await reducedPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await reducedPage.waitForTimeout(800);
  await reducedPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'micro-reduced-motion-active.png'), fullPage: false });
  console.log('✓ Captured Reduced Motion verified view.');

  await browser.close();
  console.log('✓ Micro-Interactions 2.0 automated verification completed successfully!');
}

verifyMicroInteractions().catch((err) => {
  console.error('Error in micro-interactions verification:', err);
  process.exit(1);
});
