import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildRitContext,
  detectRitActionProposals,
  executeRitProposal,
  generateLocalRitReply,
  askRitIntelligence,
  type RitStoreSnapshot,
  type RitActionExecutor,
} from '../src/lib/ritEngine';
import { todayLocal } from '../src/lib/dates';
import type { AppSettings, Task } from '../src/types';

const baseSettings: AppSettings = {
  theme: 'dark',
  userName: 'Atharva',
  currencySymbol: '₹',
  dayStartHour: 4,
  reminder: { enabled: false, time: '21:30', timezone: 'Asia/Kolkata' },
  onboardingCompleted: true,
  selectedLifeAreas: ['tasks', 'goals', 'habits', 'academics', 'finance', 'lifestyle'],
  isDemoMode: false,
};

function makeEmptySnapshot(overrides: Partial<RitStoreSnapshot> = {}): RitStoreSnapshot {
  return {
    settings: { ...baseSettings },
    tasks: [],
    goals: [],
    habits: [],
    habitEntries: [],
    financeTransactions: [],
    financeBudgets: [],
    academicSubjects: [],
    academicAssignments: [],
    academicExams: [],
    workoutSessions: [],
    careerProjects: [],
    careerApplications: [],
    obsidianNotes: [],
    lifestyleItems: [],
    ritMemories: [],
    ...overrides,
  };
}

describe('RIT Intelligence Engine', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('isolates demo records when isDemoMode is false', () => {
    const todayStr = todayLocal(4);
    const snap = makeEmptySnapshot({
      tasks: [
        {
          id: 'demo-1',
          title: 'Demo task should be hidden',
          priority: 'high',
          dueDate: todayStr,
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true,
        },
        {
          id: 'real-1',
          title: 'Real user task',
          priority: 'critical',
          dueDate: todayStr,
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false,
        },
      ],
    });

    const ctx = buildRitContext(snap);
    expect(ctx.todayTasks).toHaveLength(1);
    expect(ctx.todayTasks[0].title).toBe('Real user task');
  });

  it('gives an honest clean-slate briefing when a new user has zero data', () => {
    const ctx = buildRitContext(makeEmptySnapshot());
    expect(ctx.hasAnyData).toBe(false);
    const reply = generateLocalRitReply('Plan my day', ctx);
    expect(reply.provider).toBe('local');
    expect(reply.content.toLowerCase()).toContain('clean slate');
    expect(reply.proposedActions?.some((p) => p.type === 'create_task')).toBe(true);
  });

  it('detects and executes real task, memory, and lifestyle proposals', async () => {
    const todayStr = todayLocal(4);
    const addedTasks: Task[] = [];
    const savedMemories: string[] = [];
    const savedLifestyle: string[] = [];

    const executors: RitActionExecutor = {
      quickAddTask: async (title, priority = 'medium', dueDate = todayStr, category = 'Personal') => {
        const task: Task = {
          id: 't-new',
          title,
          priority,
          dueDate,
          category,
          status: 'todo',
          isCompleted: false,
          isOverdue: false,
          tags: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addedTasks.push(task);
        return task;
      },
      completeTask: async () => {},
      rescheduleTask: async () => {},
      addGoal: async (g) => ({
        id: 'g-new',
        title: g.title,
        description: g.description || '',
        priority: g.priority,
        type: 'milestone',
        category: 'Personal',
        measurementType: 'milestone',
        milestones: [],
        progress: 0,
        status: 'on_track',
        activityHistory: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      addHabit: async (h) => ({
        id: 'h-new',
        name: h.name,
        category: h.category || 'Personal',
        type: 'build',
        scheduleType: 'daily',
        frequency: 'daily',
        streak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        entries: [],
        createdAt: new Date().toISOString(),
      }),
      addTransaction: async () => {},
      saveNote: async () => {},
      saveRitMemory: async (m) => {
        savedMemories.push(m.content);
        return { ...m, id: 'mem-1', createdAt: new Date().toISOString() };
      },
      saveLifestyleItem: async (item) => {
        savedLifestyle.push(item.title);
        return { ...item, id: 'life-1', createdAt: new Date().toISOString() };
      },
      setActiveView: () => {},
    };

    const snap = makeEmptySnapshot();
    const ctx = buildRitContext(snap);

    const taskProposals = detectRitActionProposals('Add task revise OS notes tomorrow high', ctx);
    expect(taskProposals[0]?.type).toBe('create_task');
    const taskRes = await executeRitProposal(taskProposals[0], { ...snap, ...executors });
    expect(taskRes.ok).toBe(true);
    expect(addedTasks).toHaveLength(1);

    const memProposals = detectRitActionProposals('Remember that I study best after 7 AM', ctx);
    expect(memProposals[0]?.type).toBe('save_memory');
    const memRes = await executeRitProposal(memProposals[0], { ...snap, ...executors });
    expect(memRes.ok).toBe(true);
    expect(savedMemories[0]).toContain('7 AM');

    const lifeProposals = detectRitActionProposals('Add trip: Spiti Valley in December', ctx);
    expect(lifeProposals[0]?.type).toBe('add_lifestyle_item');
    const lifeRes = await executeRitProposal(lifeProposals[0], { ...snap, ...executors });
    expect(lifeRes.ok).toBe(true);
    expect(savedLifestyle[0]).toContain('Spiti Valley');
  });

  it('calls Gemini API when configured and falls back cleanly on network errors', async () => {
    const snapWithKey = makeEmptySnapshot({
      settings: { ...baseSettings, geminiApiKey: 'test-key-123' },
    });

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: 'Focus on finishing one real priority task today.',
                    proposals: [
                      {
                        type: 'create_task',
                        label: 'Create top focus task',
                        description: 'Sets today anchor',
                        payload: { title: 'Review AI Notes', priority: 'high' },
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
    } as any);

    const liveResult = await askRitIntelligence('Plan my day', snapWithKey);
    expect(liveResult.message.provider).toBe('gemini');
    expect(liveResult.message.content).toContain('Focus on finishing one real priority task');
    expect(liveResult.message.proposedActions?.[0]?.type).toBe('create_task');

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as any);

    const fallbackResult = await askRitIntelligence('Plan my day', snapWithKey);
    expect(fallbackResult.geminiError).toContain('401');
    expect(fallbackResult.message.provider).toBe('local');
    expect(fallbackResult.message.content).toContain('Gemini fallback note');
  });
});
