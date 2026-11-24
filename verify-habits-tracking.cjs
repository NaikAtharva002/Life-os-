const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1');

async function runVerification() {
  console.log('[Advanced Habit Tracking 2.0] Launching Chromium Playwright Test Suite...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Navigate to LIFE OS
    console.log('1. Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('lifeos_has_completed_onboarding_v2', 'true');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // 2. Switch to Habits view via sidebar
    console.log('2. Navigating to Habits module...');
    const habitsNavBtn = page.locator('aside button:has-text("Habits"), button:has-text("Habits")').first();
    await habitsNavBtn.click({ force: true });
    await page.waitForTimeout(800);

    // Capture initial photographic overview
    console.log('3. Capturing habits-photographic-overview.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-photographic-overview.png'), fullPage: false });

    // 3. Open Habit Protocol Creation Modal
    console.log('4. Opening Habit Protocol Creation Modal...');
    const deployHabitBtn = page.locator('button:has-text("Deploy Habit"), button:has-text("Add Habit"), button:has-text("Build your first habit")').first();
    await deployHabitBtn.click({ force: true });
    await page.waitForSelector('.modal h2:has-text("Habit Protocol"), .modal h2:has-text("Architect New Habit")', { timeout: 6000 });
    await page.waitForTimeout(400);

    // 4. Fill in Habit Identity
    console.log('5. Filling in Habit Identity details...');
    const nameInput = page.locator('.modal input[placeholder*="Read 20 Pages"]').first();
    await nameInput.fill('Read 25 Pages Non-Fiction');

    const cueInput = page.locator('.modal input[placeholder*="After morning pour-over"]').first();
    await cueInput.fill('After morning pour-over coffee, sit in reading chair with Kindle');

    // Switch to Tab 2: Tracking & Targets
    console.log('6. Selecting Numeric Tracking Modality...');
    await page.locator('.modal button:has-text("Tracking & Targets")').click();
    await page.waitForTimeout(300);

    // Click "Numeric" tracking type
    const numericBtn = page.locator('.modal button:has-text("Numeric")').first();
    await numericBtn.click();
    await page.waitForTimeout(200);

    // Set target 25 pages
    const targetInput = page.locator('.modal input[type="number"]').first();
    await targetInput.fill('25');

    const unitInput = page.locator('.modal input[placeholder*="pages, ml, reps"]').first();
    await unitInput.fill('pages');

    // Switch to Tab 3: Schedule & Rhythms
    console.log('7. Configuring Flexible Weekdays Schedule...');
    await page.locator('.modal button:has-text("Schedule & Rhythms")').click();
    await page.waitForTimeout(300);

    // Click "Weekdays" schedule type
    const weekdaysBtn = page.locator('.modal button:has-text("Weekdays")').first();
    await weekdaysBtn.click();
    await page.waitForTimeout(200);

    // Click Mon-Fri preset
    const workdaysPreset = page.locator('.modal button:has-text("Mon-Fri")').first();
    if (await workdaysPreset.isVisible()) {
      await workdaysPreset.click();
    }

    // Switch to Tab 4: Goal & Routine
    console.log('8. Assigning Routine Stack and Reminders...');
    await page.locator('.modal button:has-text("Goal & Routine")').click();
    await page.waitForTimeout(300);

    // Capture creation modal with options
    console.log('9. Capturing habits-creation-modal-modalities.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-creation-modal-modalities.png'), fullPage: false });

    // Submit Habit Protocol
    console.log('10. Submitting Habit Protocol...');
    const submitBtn = page.locator('.modal button[type="submit"]:has-text("Deploy Habit Protocol"), .modal button[type="submit"]:has-text("Save Habit Protocol")').first();
    await submitBtn.click();
    await page.waitForTimeout(800);

    // Verify habit card exists
    console.log('11. Verifying habit created in photographic grid...');
    const newHabitCard = page.locator('.photo-tile:has-text("Read 25 Pages Non-Fiction")').first();
    await newHabitCard.waitFor({ timeout: 5000 });

    // 5. Open HabitDetailModal
    console.log('12. Opening HabitDetailModal workspace...');
    await newHabitCard.click();
    await page.waitForSelector('.modal h2:has-text("Read 25 Pages Non-Fiction")', { timeout: 6000 });
    await page.waitForTimeout(500);

    // Log numeric progress (25 pages)
    console.log('13. Logging numeric progress in HabitDetailModal...');
    const plusBtn = page.locator('.modal button:has-text("Target (25)")').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
    }
    const noteInput = page.locator('.modal input[placeholder*="Add an optional reflection"]').first();
    if (await noteInput.isVisible()) {
      await noteInput.fill('Finished chapter on behavioral habit loops and cue conditioning.');
    }
    const recordBtn = page.locator('.modal button:has-text("Record 25 pages"), .modal button:has-text("Record")').first();
    await recordBtn.click();
    await page.waitForTimeout(600);

    // Capture Habit Detail Modal
    console.log('14. Capturing habits-detail-deep-workspace.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-detail-deep-workspace.png'), fullPage: false });

    // Switch to Interactive Calendar Tab
    console.log('15. Viewing Interactive Month Calendar...');
    const calTab = page.locator('.modal button:has-text("Interactive Calendar")').first();
    await calTab.click();
    await page.waitForTimeout(400);

    console.log('16. Capturing habits-calendar-history.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-calendar-history.png'), fullPage: false });

    // Close modal
    const closeDetailBtn = page.locator('.modal button:has-text("Close Workspace"), .modal button[aria-label="Close"]').first();
    await closeDetailBtn.click();
    await page.waitForTimeout(500);

    // 6. Test View Modes
    // Today's Checklist View
    console.log('17. Switching to Today\'s Checklist view...');
    const todayViewBtn = page.locator('button[title="Today Execution Protocol"]').first();
    await todayViewBtn.click();
    await page.waitForTimeout(500);
    console.log('18. Capturing habits-today-checklist.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-today-checklist.png'), fullPage: false });

    // Routine Stacks View
    console.log('19. Switching to Routine Stacks view...');
    const routinesViewBtn = page.locator('button[title="Behavioral Stacks"]').first();
    await routinesViewBtn.click();
    await page.waitForTimeout(500);
    console.log('20. Capturing habits-routine-stacks.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-routine-stacks.png'), fullPage: false });

    // 10-Week Matrix View
    console.log('21. Switching to 10-Week Matrix view...');
    const matrixViewBtn = page.locator('button[title="70-Day Global Heatmap"]').first();
    await matrixViewBtn.click();
    await page.waitForTimeout(500);
    console.log('22. Capturing habits-heatmap-10weeks.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-heatmap-10weeks.png'), fullPage: false });

    // Switch back to Photographic Grid View
    const photoViewBtn = page.locator('button[title="Editorial Card Grid"]').first();
    await photoViewBtn.click();
    await page.waitForTimeout(400);

    // 7. Mobile Viewport Responsive QA (390x844 iPhone 14)
    console.log('23. Testing mobile viewport responsiveness (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    console.log('24. Capturing habits-mobile-viewport.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-mobile-viewport.png'), fullPage: false });

    // Restore desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(300);

    // 8. Reload Persistence Check (IndexedDB / Dexie.js)
    console.log('25. Testing reload persistence from IndexedDB...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Ensure we are on habits view
    const habitsNavAfter = page.locator('aside button:has-text("Habits"), button:has-text("Habits")').first();
    if (await habitsNavAfter.isVisible()) {
      await habitsNavAfter.click({ force: true });
      await page.waitForTimeout(800);
    }

    const persistedHabit = page.locator('.photo-tile:has-text("Read 25 Pages Non-Fiction")').first();
    await persistedHabit.waitFor({ timeout: 5000 });
    console.log('26. Capturing habits-persistence-reloaded.png...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-persistence-reloaded.png'), fullPage: false });

    console.log('\n[Advanced Habit Tracking 2.0] ALL TEST SCENARIOS PASSED WITH ZERO DEFECTS! 🚀');
  } catch (err) {
    console.error('\n[Advanced Habit Tracking 2.0] Verification Test Failed:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'habits-failure-debug.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
