const { chromium } = require('playwright');

async function testTaskGoal() {
  console.log('Testing task and goal creation...');
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);

  // 1. Click "New Task" in top toolbar
  console.log('Opening New Task modal...');
  await page.click('header.global-toolbar button:has-text("New Task")');
  await page.waitForTimeout(600);

  // Fill in title
  await page.fill('.modal input[type="text"]', 'Complete Brand Architecture Verification');
  
  // Submit modal
  await page.click('.modal button[type="submit"], .modal button:has-text("Create Task"), .modal button:has-text("Save Task")');
  await page.waitForTimeout(1000);
  console.log('Task created!');

  // 2. Click "New Goal" in top toolbar
  console.log('Opening New Goal modal...');
  await page.click('header.global-toolbar button:has-text("New Goal")');
  await page.waitForTimeout(600);

  // Fill in title
  await page.fill('.modal input[type="text"]', 'Achieve 100% Brand System Consistency');
  
  // Submit modal
  await page.click('.modal button[type="submit"], .modal button:has-text("Create Goal"), .modal button:has-text("Save Goal")');
  await page.waitForTimeout(1000);
  console.log('Goal created!');

  // Verify created task in Tasks page
  await page.click('button:has-text("Tasks"), span:has-text("Tasks")');
  await page.waitForTimeout(800);
  const taskFound = await page.content();
  const hasTask = taskFound.includes('Complete Brand Architecture Verification');
  console.log(`Task found in UI: ${hasTask}`);

  // Verify created goal in Goals page
  await page.click('button:has-text("Goals"), span:has-text("Goals")');
  await page.waitForTimeout(800);
  const goalFound = await page.content();
  const hasGoal = goalFound.includes('Achieve 100% Brand System Consistency');
  console.log(`Goal found in UI: ${hasGoal}`);

  await browser.close();

  if (!hasTask || !hasGoal) {
    throw new Error('Task or Goal verification failed!');
  }
  console.log('SUCCESS: Task and Goal creation successfully verified in live app!');
}

testTaskGoal().catch(err => {
  console.error(err);
  process.exit(1);
});
