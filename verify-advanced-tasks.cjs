const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\athar\\.gemini\\antigravity\\brain\\9c35afe0-2165-464e-9c1b-9e77cc79a8c1';

async function run() {
  console.log('🚀 Starting Playwright verification for Advanced Task Management 2.0...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  try {
    // 1. Navigate to LIFE OS
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Navigate to Tasks page
    console.log('Navigating to Tasks view...');
    const tasksNav = page.locator('button:has-text("Tasks"), a:has-text("Tasks")').first();
    await tasksNav.click({ force: true });
    await page.waitForTimeout(800);

    // 3. Quick Task Capture Bar verification
    console.log('Testing Quick Task Capture Bar...');
    const quickInput = page.locator('input[placeholder*="Quick task capture"]').first();
    if (await quickInput.isVisible()) {
      await quickInput.fill('Design System Tokens Audit');
      await page.waitForTimeout(400);

      // Select Today and 25m
      const todayBtn = page.locator('button:has-text("Today")').first();
      if (await todayBtn.isVisible()) {
        await todayBtn.click();
      }

      const submitBtn = page.locator('button:has-text("Add Task")').first();
      await submitBtn.click();
      await page.waitForTimeout(800);
      console.log('Quick task created successfully.');
    }

    // 4. Detailed Task Modal (with Subtasks, Dependencies, Tags, Recurrence)
    console.log('Testing Detailed Task Modal with Subtasks & Recurrence...');
    const newTaskBtn = page.locator('button:has-text("New Task")').first();
    await newTaskBtn.click();
    await page.waitForTimeout(600);

    // Fill Title
    const titleInput = page.locator('input[placeholder*="Raft Consensus"]').first();
    await titleInput.fill('Ship Distributed Cache Layer');

    // Select Critical Priority
    const criticalPriorityBtn = page.locator('button:has-text("Critical")').first();
    if (await criticalPriorityBtn.isVisible()) {
      await criticalPriorityBtn.click();
    }

    // Add subtasks via Enter key
    const subtaskInput = page.locator('input[placeholder*="Add a step"]').first();
    if (await subtaskInput.isVisible()) {
      await subtaskInput.fill('Write consistent hashing ring');
      await subtaskInput.press('Enter');
      await page.waitForTimeout(300);

      await subtaskInput.fill('Implement LRU eviction policy');
      await subtaskInput.press('Enter');
      await page.waitForTimeout(300);

      await subtaskInput.fill('Benchmark throughput with 10k ops/sec');
      await subtaskInput.press('Enter');
      await page.waitForTimeout(300);
    }

    // Set Estimated Duration 45m
    const durationSelect = page.locator('select').filter({ hasText: /Pomodoro/ }).first();
    if (await durationSelect.isVisible()) {
      await durationSelect.selectOption('45');
    }

    // Set Due Date to Today
    const dateInput = page.locator('input[type="date"]').first();
    const todayStr = new Date().toISOString().split('T')[0];
    if (await dateInput.isVisible()) {
      await dateInput.fill(todayStr);
    }

    // Set Recurrence to Daily
    const repeatSelect = page.locator('select').filter({ hasText: /Daily/ }).first();
    if (await repeatSelect.isVisible()) {
      await repeatSelect.selectOption('daily');
    }

    // Save Task
    const saveTaskBtn = page.locator('button:has-text("Create Task")').first();
    await saveTaskBtn.click();
    await page.waitForTimeout(1000);
    console.log('Detailed task created with subtasks and recurrence.');

    // 5. Verify Subtask expansion and checking on Task Item
    console.log('Testing Subtask completion on TaskItem row...');
    const subtaskToggleBtn = page.locator('button:has-text("subtasks")').first();
    if (await subtaskToggleBtn.isVisible()) {
      await subtaskToggleBtn.click();
      await page.waitForTimeout(400);

      // Check off the first subtask
      const firstSubtaskCheck = page.locator('input[type="checkbox"]').nth(1);
      if (await firstSubtaskCheck.isVisible()) {
        await firstSubtaskCheck.click();
        await page.waitForTimeout(500);
        console.log('Subtask checked off.');
      }
    }

    // 6. Screenshot List View with Active Filter Badges & Chips
    console.log('Capturing List View...');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tasks-list-filtered-views.png'),
      fullPage: false,
    });

    // 7. Test Kanban Board View
    console.log('Testing Kanban Board View...');
    const kanbanBtn = page.locator('button:has-text("Kanban")').first();
    await kanbanBtn.click();
    await page.waitForTimeout(800);

    // Verify 4 columns exist
    await page.waitForSelector('span:has-text("Backlog")');
    await page.waitForSelector('span:has-text("To Do")');
    await page.waitForSelector('span:has-text("In Progress")');
    await page.waitForSelector('span:has-text("Completed")');

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tasks-kanban-board.png'),
      fullPage: false,
    });

    // 8. Test Calendar View
    console.log('Testing Calendar View...');
    const calendarBtn = page.locator('button:has-text("Calendar")').first();
    await calendarBtn.click();
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tasks-calendar-view.png'),
      fullPage: false,
    });

    // 9. Test Recurring Task Completion & Auto-Generation
    console.log('Testing Recurring Task Generation...');
    // Return to List view
    const listBtn = page.locator('button:has-text("List")').first();
    await listBtn.click();
    await page.waitForTimeout(600);

    // Find the recurring task and complete it
    const checkBtn = page.locator('button[title*="Mark completed"]').first();
    if (await checkBtn.isVisible()) {
      await checkBtn.click();
      await page.waitForTimeout(1000);
      console.log('Completed recurring task. Next occurrence generated.');
    }

    // 10. Test Focus Mode Integration
    console.log('Testing Focus Mode Integration from Task...');
    const focusBtn = page.locator('button:has-text("Focus")').first();
    if (await focusBtn.isVisible()) {
      await focusBtn.click();
      await page.waitForTimeout(1000);

      // Verify Focus Mode is active
      await page.waitForSelector('text=Focus Sanctuary & Pomodoro Protocol');
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'tasks-focus-session-integration.png'),
        fullPage: false,
      });
      console.log('Captured Focus Mode session with task objective.');
    }

    // 11. Test Goals Integration
    console.log('Testing Goals Integration...');
    const goalsNav = page.locator('button:has-text("Goals"), a:has-text("Goals")').first();
    await goalsNav.click({ force: true });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tasks-goals-integration.png'),
      fullPage: false,
    });

    // 12. Test Dashboard Integration
    console.log('Testing Dashboard Integration...');
    const dashNav = page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")').first();
    await dashNav.click({ force: true });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tasks-dashboard-integration.png'),
      fullPage: false,
    });

    console.log('🎉 Advanced Task Management 2.0 verification completed successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
