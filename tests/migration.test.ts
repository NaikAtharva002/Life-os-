import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/db';
import { LifeOSRepository } from '../src/db/repository';
import { parseAndValidateBackup } from '../src/lib/backupSchema';

describe('Dexie v2 Schema & Migration Tests', () => {
  beforeEach(async () => {
    await db.goals.clear();
    await db.tasks.clear();
    await db.habits.clear();
    await db.habitEntries.clear();
    await db.financeTransactions.clear();
    await db.appMeta.clear();
  });

  it('validates and imports v1 canonical backup fixture and upgrades records to v2', async () => {
    const fixturePath = path.resolve(__dirname, 'fixtures', 'v1-backup.json');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');

    // Schema validation succeeds on v1 format
    const validation = parseAndValidateBackup(fixtureContent);
    expect(validation.success).toBe(true);
    expect(validation.data?.version).toBe(1);

    // Import into repository
    const success = await LifeOSRepository.importEntireDatabaseJSON(fixtureContent);
    expect(success).toBe(true);

    // Verify goals have been migrated with isDemo, deletedAt, and updatedAt
    const goals = await db.goals.toArray();
    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].isDemo).toBe(false);
    expect(goals[0].deletedAt).toBe(null);
    expect(typeof goals[0].updatedAt).toBe('string');

    // Verify tasks have been migrated
    const tasks = await db.tasks.toArray();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].isDemo).toBe(false);
    expect(tasks[0].deletedAt).toBe(null);
  });

  it('rejects malformed or invalid backup JSON', async () => {
    const invalidJson = '{"version": 99, "invalidField": true}';
    const validation = parseAndValidateBackup(invalidJson);
    expect(validation.success).toBe(false);

    const importSuccess = await LifeOSRepository.importEntireDatabaseJSON(invalidJson);
    expect(importSuccess).toBe(false);
  });

  it('exports v2 backup format matching ValidatedBackup', async () => {
    await LifeOSRepository.saveGoal({
      id: 'g-v2-test',
      title: 'v2 Export Goal',
      priority: 'high',
      type: 'short-term',
      category: 'Personal',
      progress: 0,
      milestones: [],
      createdAt: '2026-11-24',
      updatedAt: '2026-11-24',
      isDemo: false,
      deletedAt: null,
    });

    const exportedStr = await LifeOSRepository.exportEntireDatabaseJSON();
    const validation = parseAndValidateBackup(exportedStr);
    expect(validation.success).toBe(true);
    expect(validation.data?.version).toBe(2);
    expect(validation.data?.appVersion).toBe('3.0.0');
    expect(validation.data?.goals.some((g: any) => g.id === 'g-v2-test')).toBe(true);
  });

  it('handles clean first-run initialization with 0 sample data and INR ₹ default', async () => {
    await db.appMeta.clear();
    const initData = await LifeOSRepository.initialize();

    expect(initData.goals.length).toBe(0);
    expect(initData.tasks.length).toBe(0);
    expect(initData.habits.length).toBe(0);
    expect(initData.financeTransactions.length).toBe(0);
    expect(initData.academicSubjects.length).toBe(0);
    expect(initData.settings.currencySymbol).toBe('₹');
    expect(initData.settings.dayStartHour).toBe(4);
  });

  it('tags demo data on load and selectively purges it while preserving real user records', async () => {
    // 1. Load showcase demo data
    await LifeOSRepository.loadDemoData();
    const demoTasks = await db.tasks.toArray();
    expect(demoTasks.length).toBeGreaterThan(0);
    expect(demoTasks.every((t) => t.isDemo === true)).toBe(true);

    // 2. Add a genuine user task
    await LifeOSRepository.saveTask({
      id: 'user-task-unique-123',
      title: 'Real Student Homework',
      priority: 'critical',
      category: 'Academics',
      status: 'todo',
      isCompleted: false,
      isOverdue: false,
      isDemo: false,
      createdAt: '2026-11-24',
    });

    // 3. Purge demo data
    await LifeOSRepository.purgeDemoData();

    // 4. Verify only genuine user task remains
    const remainingTasks = await db.tasks.toArray();
    expect(remainingTasks.length).toBe(1);
    expect(remainingTasks[0].id).toBe('user-task-unique-123');
    expect(remainingTasks[0].title).toBe('Real Student Homework');

    // Verify demo goals are also cleared
    const remainingGoals = await db.goals.toArray();
    expect(remainingGoals.length).toBe(0);
  });
});
