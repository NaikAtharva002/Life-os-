import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const views = [
    { name: 'goals', label: 'Goals' },
    { name: 'tasks', label: 'Tasks' },
    { name: 'habits', label: 'Habits' },
    { name: 'finance', label: 'Finances' },
    { name: 'fitness', label: 'Gym & Fitness' },
    { name: 'academics', label: 'Academics' },
    { name: 'career', label: 'Career & Work' },
    { name: 'analytics', label: 'Analytics' },
    { name: 'assistant', label: 'AI Copilot' },
    { name: 'obsidian', label: 'Obsidian Notes' },
    { name: 'review', label: 'Evening Review' },
    { name: 'settings', label: 'Settings' },
  ];

  for (const v of views) {
    try {
      await page.click(`button:has(span:text-is("${v.label}"))`);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `view-${v.name}.png` });
      console.log(`Captured view-${v.name}.png`);
    } catch (e) {
      console.error(`Failed ${v.name}:`, e.message);
    }
  }

  await browser.close();
}

capture();
