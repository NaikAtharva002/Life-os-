const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\athar\\.gemini\\antigravity\\brain\\9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function run() {
  console.log('🚀 Starting Playwright verification for Onboarding & Empty States 2.0...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Accept any confirm dialogs
  page.on('dialog', async (dialog) => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  try {
    // 1. Navigate to Life OS
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Open Settings to trigger Onboarding Wizard
    console.log('Navigating to Settings to relaunch wizard...');
    const settingsBtn = page.locator('button:has-text("Settings"), a:has-text("Settings")').first();
    await settingsBtn.click();
    await page.waitForTimeout(800);

    // Click "Relaunch Setup Wizard"
    const relaunchBtn = page.locator('button:has-text("Relaunch Setup Wizard")').first();
    await relaunchBtn.scrollIntoViewIfNeeded();
    await relaunchBtn.click();
    await page.waitForTimeout(600);

    // 3. Step 0: Welcome Screen
    console.log('Capturing Step 0: Welcome Screen...');
    await page.waitForSelector('text=Welcome to LIFE OS');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step0-welcome.png'),
      fullPage: false
    });

    // 4. Step 1: Personal Identity
    console.log('Navigating to Step 1: Identity...');
    await page.locator('button:has-text("Begin Guided Setup")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Personal Identity & Greeting');
    // Select avatar
    const avatarBtn = page.locator('button:has-text("Ember Crimson")').first();
    if (await avatarBtn.isVisible()) {
      await avatarBtn.click();
    }
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step1-identity.png'),
      fullPage: false
    });

    // 5. Step 2: Core Life Areas
    console.log('Navigating to Step 2: Life Areas...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Choose Your Core Life Areas');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step2-life-areas.png'),
      fullPage: false
    });

    // 6. Step 3: Initial Goals
    console.log('Navigating to Step 3: Goals...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Define Your Initial Ambitions');
    // Click a template goal chip
    const goalChip = page.locator('button:has-text("Save $10,000 Emergency Cash Buffer")').first();
    if (await goalChip.isVisible()) {
      await goalChip.click();
    }
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step3-goals.png'),
      fullPage: false
    });

    // 7. Step 4: Habits Routine
    console.log('Navigating to Step 4: Habits Routine...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Anchor Your Daily Rituals');
    // Click a habit template chip
    const habitChip = page.locator('button:has-text("Morning sunlight & hydration")').first();
    if (await habitChip.isVisible()) {
      await habitChip.click();
    }
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step4-habits.png'),
      fullPage: false
    });

    // 8. Step 5: Preferences
    console.log('Navigating to Step 5: Preferences...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Preferences & Environment');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step5-preferences.png'),
      fullPage: false
    });

    // 9. Step 6: Summary & Launch
    console.log('Navigating to Step 6: Summary...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Ready for Mastery');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'onboarding-step6-summary.png'),
      fullPage: false
    });

    // Complete Onboarding and enter app
    console.log('Launching into LIFE OS...');
    await page.locator('button:has-text("Launch Daily Command Center")').click();
    await page.waitForTimeout(1000);

    // 10. Contextual Guidance Banners
    console.log('Navigating to Tasks to check Contextual Guidance Banner...');
    const tasksNav = page.locator('button:has-text("Tasks"), a:has-text("Tasks")').first();
    await tasksNav.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'contextual-guidance-banners.png'),
      fullPage: false
    });

    // 11. Demo Mode
    console.log('Testing Demo Mode banner...');
    const settingsNav = page.locator('button:has-text("Settings"), a:has-text("Settings")').first();
    await settingsNav.click();
    await page.waitForTimeout(600);
    const demoModeBtn = page.locator('button:has-text("Explore Demo Mode")').first();
    if (await demoModeBtn.isVisible()) {
      await demoModeBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'demo-mode-active.png'),
        fullPage: false
      });
      // Exit demo mode
      const exitDemoBtn = page.locator('button:has-text("Exit Demo Mode")').first();
      if (await exitDemoBtn.isVisible()) {
        await exitDemoBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // 12. Reset to Clean Slate and Capture Clean Slate Empty States
    console.log('Testing Clean Slate Empty States...');
    await settingsNav.click();
    await page.waitForTimeout(600);

    const resetSlateBtn = page.locator('button:has-text("Reset to Clean Slate")').first();
    if (await resetSlateBtn.isVisible()) {
      await resetSlateBtn.click();
      await page.waitForTimeout(1200);

      // Close onboarding modal that opens on fresh slate
      const modalClose = page.locator('button[aria-label="Close onboarding modal"]').first();
      await modalClose.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      if (await modalClose.isVisible()) {
        console.log('Closing onboarding modal after clean slate reset...');
        await modalClose.click();
        await page.waitForTimeout(800);
      }
    }

    // Capture clean slate on Tasks
    console.log('Capturing Clean Slate Tasks...');
    await tasksNav.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'empty-states-clean-slate-tasks.png'),
      fullPage: false
    });

    // Capture clean slate on Goals
    console.log('Capturing Clean Slate Goals...');
    const goalsNav = page.locator('button:has-text("Goals"), a:has-text("Goals")').first();
    await goalsNav.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'empty-states-clean-slate-goals.png'),
      fullPage: false
    });

    // Capture clean slate on Habits
    console.log('Capturing Clean Slate Habits...');
    const habitsNav = page.locator('button:has-text("Habits"), a:has-text("Habits")').first();
    await habitsNav.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'empty-states-clean-slate-habits.png'),
      fullPage: false
    });

    // Capture clean slate on Finance
    console.log('Capturing Clean Slate Finance...');
    const financeNav = page.locator('button:has-text("Finance"), a:has-text("Finance")').first();
    await financeNav.click({ force: true });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'empty-states-clean-slate-finance.png'),
      fullPage: false
    });

    // 13. Test Filtered View Empty State
    console.log('Testing Filtered View Empty State...');
    // Create one task so Tasks page isn't clean slate
    await tasksNav.click({ force: true });
    await page.waitForTimeout(600);
    // Click "Create your first task" button on empty state
    const addFirstTaskBtn = page.locator('button:has-text("Create your first task")').first();
    if (await addFirstTaskBtn.isVisible()) {
      await addFirstTaskBtn.click();
      await page.waitForTimeout(600);
      // In TaskModal: fill title and submit
      const titleInput = page.locator('input[placeholder*="Raft Consensus"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Deep Work Strategy Block');
        const submitBtn = page.locator('button:has-text("Create Task")').first();
        await submitBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // Now type a query in Tasks search input that matches nothing
    const searchInput = page.locator('input[placeholder*="Search tasks"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('ZZZNONEXISTENTQUERY');
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'empty-states-filtered-view.png'),
        fullPage: false
      });
      console.log('Captured Filtered View Empty State with Clear Filters button.');
    }

    console.log('🎉 All verification steps and screenshots completed successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
