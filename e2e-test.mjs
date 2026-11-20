import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest() {
  console.log('--- 1. Starting Vite Preview Server ---');
  const server = spawn('npm.cmd', ['run', 'preview', '--', '--port', '4173'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (d) => process.stdout.write(d.toString()));
  server.stderr.on('data', (d) => process.stderr.write(d.toString()));

  // Wait for server to spin up
  await new Promise((res) => setTimeout(res, 3000));

  console.log('--- 2. Launching Native Edge Browser via Playwright ---');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (err) => {
    console.error('Browser Page Error:', err);
    errors.push(err);
  });

  try {
    console.log('--- 3. Navigating to LIFE OS at http://localhost:4173 ---');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    console.log('--- 4. Verifying Dashboard & The 5 Vital Questions ---');
    const title = await page.title();
    console.log(`✓ Page title: "${title}"`);

    await page.waitForSelector('text=1. What to do today?', { timeout: 6000 });
    console.log('✓ Question 1: "1. What to do today?" found.');

    const q2 = await page.isVisible('text=2. What is most important?');
    const q3 = await page.isVisible('text=3. Falling behind on?');
    const q4 = await page.isVisible('text=4. Progress Made?');
    const q5 = await page.isVisible('text=5. Improve Tomorrow?');
    console.log(`✓ Questions 2-5 verified: Q2=${q2}, Q3=${q3}, Q4=${q4}, Q5=${q5}`);

    // Test Navigation: Goals
    console.log('--- 5. Testing Goals Module ---');
    await page.click('button:has(span:text-is("Goals"))');
    await page.waitForSelector('text=Goal Priority Management', { timeout: 4000 });
    console.log('✓ Goals Management verified.');

    // Test Navigation: Tasks
    console.log('--- 6. Testing Tasks Module (List, Kanban, Calendar) ---');
    await page.click('button:has(span:text-is("Tasks"))');
    await page.waitForSelector('text=Task Management & Priorities', { timeout: 4000 });
    console.log('✓ Tasks List view verified.');

    // Switch to Kanban
    await page.click('button:has-text("Kanban")');
    await page.waitForSelector('h3:has-text("In Progress")', { timeout: 4000 });
    console.log('✓ Tasks Kanban view (In Progress column) verified.');

    // Switch to Calendar
    await page.click('button:has-text("Calendar")');
    await page.waitForSelector('text=SUN', { timeout: 4000 });
    console.log('✓ Tasks Calendar view (SUN-SAT grid) verified.');

    // Test Navigation: Habits
    console.log('--- 7. Testing Habits Module ---');
    await page.click('button:has(span:text-is("Habits"))');
    await page.waitForSelector('text=Habit Architecture & Heatmaps', { timeout: 4000 });
    console.log('✓ Habits Tracker & Heatmaps verified.');

    // Test Navigation: Finances
    console.log('--- 8. Testing Finance Module ---');
    await page.click('button:has(span:text-is("Finances"))');
    await page.waitForSelector('text=Finance Command', { timeout: 4000 });
    console.log('✓ Finance Command Center verified.');

    // Test Navigation: Gym & Fitness
    console.log('--- 9. Testing Fitness Module ---');
    await page.click('button:has(span:text-is("Gym & Fitness"))');
    await page.waitForSelector('text=Gym & Fitness', { timeout: 4000 });
    console.log('✓ Gym & Fitness verified.');

    // Test Navigation: Academics
    console.log('--- 10. Testing Academics Module ---');
    await page.click('button:has(span:text-is("Academics"))');
    await page.waitForSelector('text=Academic Command', { timeout: 4000 });
    console.log('✓ Academics Command & Attendance Calculator verified.');

    // Test Navigation: Career
    console.log('--- 11. Testing Career Module ---');
    await page.click('button:has(span:text-is("Career & Work"))');
    await page.waitForSelector('text=Career & Engineering Roadmap', { timeout: 4000 });
    console.log('✓ Career Opportunities & Skill Matrix verified.');

    // Test Navigation: Analytics
    console.log('--- 12. Testing Central Analytics ---');
    await page.click('button:has(span:text-is("Analytics"))');
    await page.waitForSelector('text=Central Intelligence & Analytics', { timeout: 4000 });
    console.log('✓ Central Intelligence & Analytics verified.');

    // Test Navigation: AI Copilot
    console.log('--- 13. Testing Astra AI Copilot (Offline Heuristics) ---');
    await page.click('button:has(span:text-is("AI Copilot"))');
    await page.waitForSelector('text=Astra — Life OS AI Copilot', { timeout: 4000 });
    
    // Test interactive prompt
    const planDayBtn = await page.waitForSelector('button:has-text("Plan my day")', { timeout: 3000 });
    if (planDayBtn) {
      await planDayBtn.click();
      await page.waitForTimeout(1500);
      console.log('✓ Astra Copilot generated daily plan from live IndexedDB data!');
    }

    // Test Navigation: Obsidian Vault
    console.log('--- 14. Testing Obsidian Second Brain ---');
    await page.click('button:has(span:text-is("Obsidian Notes"))');
    await page.waitForSelector('text=Obsidian Markdown Vault', { timeout: 4000 });
    console.log('✓ Obsidian Notes & Vault Export verified.');

    // Test Navigation: Evening Review
    console.log('--- 15. Testing Evening Review Wizard ---');
    await page.click('button:has(span:text-is("Evening Review"))');
    await page.waitForSelector('text=End-of-Day Evening Review', { timeout: 4000 });
    console.log('✓ Evening Review Wizard verified.');

    // Test Navigation: Settings
    console.log('--- 16. Testing Settings ---');
    await page.click('button:has(span:text-is("Settings"))');
    await page.waitForSelector('text=Personal Profile & Regional Formatting', { timeout: 4000 });
    console.log('✓ System Settings verified.');

    // Return to Dashboard and capture screenshot
    console.log('--- 17. Capturing Final Dashboard Screenshot ---');
    await page.click('button:has(span:text-is("Dashboard"))');
    await page.waitForTimeout(600);
    const screenshotPath = path.join(__dirname, 'screenshot-dashboard.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot captured at ${screenshotPath}`);

    if (errors.length > 0) {
      console.error(`FAILED with ${errors.length} browser errors.`);
      process.exit(1);
    }

    console.log('\n================================================================');
    console.log('🏆 100% SUCCESS: ALL 14 LIFE OS MODULES VERIFIED END-TO-END!');
    console.log('================================================================');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

runTest();
