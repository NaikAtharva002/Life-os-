const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/athar/.gemini/antigravity/brain/9c35afe0-2165-464e-9c1b-9e77cc79a8c1');

async function runVerification() {
  console.log('[Goal Management 2.0] Launching Chromium Playwright Test Suite...');
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

    // Switch to goals view via sidebar or dashboard button
    console.log('2. Navigating to Goals view...');
    const goalsNavBtn = page.locator('aside button:has-text("Goals"), button:has-text("Manage Goals"), button:has-text("Goals")').first();
    await goalsNavBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // 2. Open GoalModal
    console.log('3. Opening Goal Creation Modal...');
    const createGoalBtn = page.locator('button:has-text("Create Goal"), button:has-text("Create your first goal")').first();
    await createGoalBtn.click({ force: true });
    await page.waitForSelector('.modal h2:has-text("Establish New Goal")', { timeout: 6000 });
    await page.waitForTimeout(400);

    // 3. Fill in Goal Essentials
    console.log('4. Filling in Goal Details...');
    const titleInput = page.locator('.modal input[placeholder*="Master Full-Stack"]').first();
    await titleInput.fill('Conquer Distributed Systems & Go');

    const descInput = page.locator('.modal textarea[placeholder*="What does tangible success"]').first();
    await descInput.fill('Master Raft consensus, distributed caching, and microservice telemetry.');

    // Click "Career & Work" life area inside modal
    const careerAreaBtn = page.locator('.modal button:has-text("Career & Work")').first();
    if (await careerAreaBtn.isVisible()) {
      await careerAreaBtn.click();
    }

    // Switch to Tab 2: Targets & Milestones
    console.log('5. Configuring Milestones Roadmap...');
    const targetsTabBtn = page.locator('.modal button:has-text("Targets & Milestones")').first();
    await targetsTabBtn.click();
    await page.waitForTimeout(300);

    // Add Milestone 1
    const milestoneTitleInput = page.locator('.modal input[placeholder*="Milestone title"]').first();
    await milestoneTitleInput.fill('Implement Raft consensus algorithm');
    await page.locator('.modal button:has-text("Add")').first().click();
    await page.waitForTimeout(200);

    // Add Milestone 2
    await milestoneTitleInput.fill('Build distributed cache with consistent hashing');
    await page.locator('.modal button:has-text("Add")').first().click();
    await page.waitForTimeout(200);

    // Add Milestone 3
    await milestoneTitleInput.fill('Deploy benchmark cluster on Cloud Run');
    await page.locator('.modal button:has-text("Add")').first().click();
    await page.waitForTimeout(200);

    // Switch to Tab 3: Strategic Execution
    console.log('6. Adding Strategic Motivation & Next Action...');
    const strategyTabBtn = page.locator('.modal button:has-text("Strategic Execution")').first();
    await strategyTabBtn.click();
    await page.waitForTimeout(200);

    const motivationInput = page.locator('.modal textarea[placeholder*="Why is conquering this goal"]').first();
    await motivationInput.fill('Foundational competence for Staff Systems Architect trajectory.');

    const nextActionInput = page.locator('.modal input[placeholder*="What is the single next task"]').first();
    await nextActionInput.fill('Read Ongaro & Ousterhout Raft paper Sections 5.1 to 5.4');

    // Submit Goal
    console.log('7. Submitting Goal Creation...');
    const submitBtn = page.locator('.modal button:has-text("Create Strategic Goal"), .modal button:has-text("Create Goal")').last();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // 8. Verify Goal in Editorial Grid
    console.log('8. Verifying Goal in Editorial Grid...');
    await page.waitForSelector('text=Conquer Distributed Systems & Go', { timeout: 6000 });
    const goalCard = page.locator('.photo-tile:has-text("Conquer Distributed Systems & Go")').first();

    // 9. Open GoalDetailModal
    console.log('9. Opening Goal Detail Modal...');
    await goalCard.click({ force: true });
    await page.waitForSelector('.modal h1:has-text("Conquer Distributed Systems & Go")', { timeout: 6000 });
    await page.waitForTimeout(600);

    // Complete Milestone 1 inside Detail Modal
    console.log('10. Completing Milestone 1 to test progress engine...');
    const circleBtn = page.locator('.modal button:has(svg.lucide-circle)').first();
    if (await circleBtn.isVisible()) {
      await circleBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }

    const modalTabulars = await page.locator('.modal .tabular').allTextContents();
    console.log('Modal tabular values after clicking milestone:', modalTabulars);

    // Switch to Horizon Timeline inside Modal
    const modalTimelineTab = page.locator('.modal button:has-text("Horizon Timeline")').first();
    await modalTimelineTab.click();
    await page.waitForTimeout(400);

    // Take screenshot of Goal Detail Modal
    console.log('11. Capturing goals-detail-roadmap-modal.png...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-detail-roadmap-modal.png'),
      fullPage: false,
    });

    // Close Detail Modal
    const closeModalBtn = page.locator('.modal button:has-text("Close")').last();
    await closeModalBtn.click();
    await page.waitForTimeout(500);

    // 12. Switch to Cross-Goal Horizon Timeline View
    console.log('12. Switching to Master Horizon Timeline View...');
    const timelineViewBtn = page.locator('button[title="Roadmap Horizon Timeline"]').first();
    await timelineViewBtn.click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-timeline-horizon-view.png'),
      fullPage: false,
    });

    // 13. Switch to Analytics View
    console.log('13. Switching to Goal Intelligence Analytics View...');
    const analyticsViewBtn = page.locator('button[title="Goal Intelligence Analytics"]').first();
    await analyticsViewBtn.click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-analytics-dashboard.png'),
      fullPage: false,
    });

    // 14. Switch to Table View & Expand Milestones
    console.log('14. Switching to Table View & Expanding Milestones...');
    const tableViewBtn = page.locator('button[title="Structured Data Table"]').first();
    await tableViewBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Click row expander
    const expandIcon = page.locator('table svg.lucide-chevron-right').first();
    if (await expandIcon.isVisible()) {
      await expandIcon.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-table-expanded-view.png'),
      fullPage: false,
    });

    // 15. Switch back to Editorial Grid View
    const gridViewBtn = page.locator('button[title="Editorial Card Grid"]').first();
    await gridViewBtn.click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-editorial-grid-view.png'),
      fullPage: false,
    });

    // 16. Test Mobile Viewport Responsiveness
    console.log('16. Testing Mobile Viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-mobile-viewport.png'),
      fullPage: false,
    });

    // 17. Test Local-First Persistence after Reload
    console.log('17. Testing IndexedDB Persistence after Reload...');
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.waitForSelector('text=Conquer Distributed Systems & Go', { timeout: 6000 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'goals-persistence-reloaded.png'),
      fullPage: false,
    });

    console.log('====================================================');
    console.log('🎉 ALL GOAL MANAGEMENT 2.0 PLAYWRIGHT TESTS PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('Playwright Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
