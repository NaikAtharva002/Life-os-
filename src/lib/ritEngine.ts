import { v4 as uuidv4 } from 'uuid';
import type {
  AcademicAssignment,
  AcademicExam,
  AcademicSubject,
  AppSettings,
  AssistantMessage,
  CareerProject,
  FinanceBudget,
  FinanceTransaction,
  Goal,
  Habit,
  HabitEntry,
  JobApplication,
  LifestyleCategory,
  LifestyleItem,
  ObsidianNote,
  Priority,
  RitActionProposal,
  RitActionType,
  RitMemoryItem,
  Task,
  WorkoutSession,
} from '../types';
import { todayLocal } from './dates';
import { parseQuickTaskInput } from './quickAddParser';

export interface RitStoreSnapshot {
  settings: AppSettings;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  financeTransactions: FinanceTransaction[];
  financeBudgets: FinanceBudget[];
  academicSubjects: AcademicSubject[];
  academicAssignments: AcademicAssignment[];
  academicExams: AcademicExam[];
  workoutSessions: WorkoutSession[];
  careerProjects: CareerProject[];
  careerApplications: JobApplication[];
  obsidianNotes: ObsidianNote[];
  lifestyleItems: LifestyleItem[];
  ritMemories: RitMemoryItem[];
}

export interface RitActionExecutor {
  quickAddTask: (
    title: string,
    priority?: Priority,
    dueDate?: string,
    category?: string,
    estimatedDuration?: number,
    tags?: string[]
  ) => Promise<Task>;
  completeTask: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<void>;
  addGoal: (goal: Partial<Goal> & { title: string; priority: Priority }) => Promise<Goal>;
  addHabit: (habit: Partial<Habit> & { name: string; category?: string }) => Promise<Habit>;
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => Promise<void>;
  saveNote: (
    note: Omit<ObsidianNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<void>;
  saveRitMemory: (
    memory: Omit<RitMemoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<RitMemoryItem>;
  saveLifestyleItem: (
    item: Omit<LifestyleItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<LifestyleItem>;
  setActiveView: (view: string) => void;
}

export interface RitContextSummary {
  todayStr: string;
  userName: string;
  currency: string;
  hasAnyData: boolean;
  openTasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  completedLast7Days: number;
  activeGoals: Goal[];
  criticalGoals: Goal[];
  habits: Habit[];
  completedHabitsTodayCount: number;
  pendingHabitsToday: Habit[];
  monthlyIncome: number;
  monthlyExpense: number;
  topExpenseCategories: Array<{ category: string; amount: number }>;
  atRiskSubjects: Array<{ code: string; name: string; pct: number; target: number }>;
  upcomingAssignments: AcademicAssignment[];
  upcomingExams: AcademicExam[];
  weeklyWorkouts: WorkoutSession[];
  activeCareerProjects: CareerProject[];
  openApplications: JobApplication[];
  notesCount: number;
  lifestyleItems: LifestyleItem[];
  memories: RitMemoryItem[];
}

function visibleRecords<T extends { isDemo?: boolean; deletedAt?: string | null }>(
  items: T[],
  isDemoMode: boolean
): T[] {
  return (items || []).filter((item) => {
    if (item.deletedAt) return false;
    if (!isDemoMode && item.isDemo === true) return false;
    return true;
  });
}

function addDaysISO(baseDateStr: string, days: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildRitContext(snapshot: RitStoreSnapshot): RitContextSummary {
  const isDemoMode = Boolean(snapshot.settings?.isDemoMode);
  const todayStr = todayLocal();
  const sevenDaysAgo = addDaysISO(todayStr, -7);
  const next14Days = addDaysISO(todayStr, 14);
  const next21Days = addDaysISO(todayStr, 21);
  const currentMonth = todayStr.slice(0, 7);

  const tasks = visibleRecords(snapshot.tasks, isDemoMode);
  const goals = visibleRecords(snapshot.goals, isDemoMode);
  const habits = visibleRecords(snapshot.habits, isDemoMode);
  const habitEntries = visibleRecords(snapshot.habitEntries, isDemoMode);
  const transactions = visibleRecords(snapshot.financeTransactions, isDemoMode);
  const subjects = visibleRecords(snapshot.academicSubjects, isDemoMode);
  const assignments = visibleRecords(snapshot.academicAssignments, isDemoMode);
  const exams = visibleRecords(snapshot.academicExams, isDemoMode);
  const workouts = visibleRecords(snapshot.workoutSessions, isDemoMode);
  const careerProjects = visibleRecords(snapshot.careerProjects, isDemoMode);
  const careerApplications = visibleRecords(snapshot.careerApplications, isDemoMode);
  const notes = visibleRecords(snapshot.obsidianNotes, isDemoMode);
  const lifestyleItems = visibleRecords(snapshot.lifestyleItems, isDemoMode);
  const memories = visibleRecords(snapshot.ritMemories, isDemoMode);

  const openTasks = tasks.filter((t) => !t.isCompleted && !t.isArchived);
  const todayTasks = openTasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const completedLast7Days = tasks.filter(
    (t) => t.isCompleted && t.completedAt && t.completedAt.slice(0, 10) >= sevenDaysAgo
  ).length;

  const activeGoals = goals.filter((g) => !g.isArchived && g.status !== 'completed');
  const criticalGoals = activeGoals.filter(
    (g) => g.priority === 'critical' || g.priority === 'high'
  );

  const doneHabitIdsToday = new Set(
    habitEntries
      .filter((e) => e.date === todayStr && (e.completed || e.status === 'completed'))
      .map((e) => e.habitId)
  );
  const pendingHabitsToday = habits.filter((h) => !doneHabitIdsToday.has(h.id));

  const monthlyTx = transactions.filter((t) => (t.date || '').startsWith(currentMonth));
  const monthlyIncome = monthlyTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory: Record<string, number> = {};
  for (const t of monthlyTx) {
    if (t.type === 'expense') {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  }
  const topExpenseCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount]) => ({ category, amount }));

  const atRiskSubjects = subjects
    .filter((s) => s.totalClasses > 0)
    .map((s) => ({
      code: s.code,
      name: s.name,
      pct: Math.round((s.attendedClasses / s.totalClasses) * 100),
      target: s.targetAttendancePercentage,
    }))
    .filter((s) => s.pct < s.target);

  const upcomingAssignments = assignments
    .filter((a) => !a.isSubmitted && a.dueDate >= todayStr && a.dueDate <= next14Days)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcomingExams = exams
    .filter((e) => e.examDate >= todayStr && e.examDate <= next21Days)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  const weeklyWorkouts = workouts.filter((w) => w.date >= sevenDaysAgo);
  const activeCareerProjects = careerProjects.filter((p) => p.status !== 'completed');
  const openApplications = careerApplications.filter(
    (a) => a.stage !== 'rejected' && a.stage !== 'offer'
  );

  const hasAnyData =
    tasks.length > 0 ||
    goals.length > 0 ||
    habits.length > 0 ||
    transactions.length > 0 ||
    subjects.length > 0 ||
    assignments.length > 0 ||
    exams.length > 0 ||
    workouts.length > 0 ||
    careerProjects.length > 0 ||
    notes.length > 0 ||
    lifestyleItems.length > 0;

  return {
    todayStr,
    userName: snapshot.settings?.userName?.trim() || 'there',
    currency: snapshot.settings?.currencySymbol || '₹',
    hasAnyData,
    openTasks,
    todayTasks,
    overdueTasks,
    completedLast7Days,
    activeGoals,
    criticalGoals,
    habits,
    completedHabitsTodayCount: doneHabitIdsToday.size,
    pendingHabitsToday,
    monthlyIncome,
    monthlyExpense,
    topExpenseCategories,
    atRiskSubjects,
    upcomingAssignments,
    upcomingExams,
    weeklyWorkouts,
    activeCareerProjects,
    openApplications,
    notesCount: notes.length,
    lifestyleItems,
    memories,
  };
}

function makeProposal(
  type: RitActionType,
  label: string,
  description: string,
  payload: Record<string, any>
): RitActionProposal {
  return {
    id: uuidv4(),
    type,
    label,
    description,
    payload,
    status: 'proposed',
  };
}

export function detectRitActionProposals(
  query: string,
  ctx: RitContextSummary
): RitActionProposal[] {
  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const proposals: RitActionProposal[] = [];

  // Explicit task creation intent
  const taskMatch = trimmed.match(/^(?:add|create|new|schedule|remind me to)\s+(?:a\s+)?task(?:\s+to)?[:\s-]+(.+)$/i)
    || trimmed.match(/^(?:remind me to)\s+(.+)$/i);
  if (taskMatch && taskMatch[1]?.trim()) {
    const parsed = parseQuickTaskInput(taskMatch[1].trim());
    proposals.push(
      makeProposal(
        'create_task',
        `Create task: "${parsed.title}"`,
        `Schedule for ${parsed.dueDate || ctx.todayStr} (${parsed.priority} priority, ${parsed.category}).`,
        {
          title: parsed.title,
          priority: parsed.priority,
          dueDate: parsed.dueDate || ctx.todayStr,
          category: parsed.category,
        }
      )
    );
  }

  // Explicit goal creation intent
  const goalMatch = trimmed.match(/^(?:add|create|set|new)\s+(?:a\s+)?goal(?:\s+to)?[:\s-]+(.+)$/i);
  if (goalMatch && goalMatch[1]?.trim()) {
    const title = goalMatch[1].trim();
    proposals.push(
      makeProposal(
        'create_goal',
        `Create goal: "${title}"`,
        'Adds an active personal milestone goal.',
        { title, priority: 'high', category: 'Personal' }
      )
    );
  }

  // Explicit habit creation intent
  const habitMatch = trimmed.match(/^(?:add|create|start|build)\s+(?:a\s+)?habit[:\s-]+(.+)$/i);
  if (habitMatch && habitMatch[1]?.trim()) {
    const name = habitMatch[1].trim();
    proposals.push(
      makeProposal(
        'create_habit',
        `Create daily habit: "${name}"`,
        'Tracks daily streak consistency.',
        { name, category: 'Personal' }
      )
    );
  }

  // Explicit expense intent
  const expMatch = trimmed.match(/^(?:log|add|spent|expense)\s+(?:expense\s+)?(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:on|for|-)?\s*(.+)$/i);
  if (expMatch && expMatch[1] && expMatch[2]?.trim()) {
    const amount = Number(expMatch[1]);
    const title = expMatch[2].trim();
    if (!Number.isNaN(amount) && amount > 0) {
      proposals.push(
        makeProposal(
          'log_expense',
          `Log ${ctx.currency}${amount.toLocaleString()} for "${title}"`,
          `Records an expense on ${ctx.todayStr}.`,
          { amount, title, category: 'General', date: ctx.todayStr }
        )
      );
    }
  }

  // Personal memory intent
  const memMatch = trimmed.match(/^(?:remember(?:\s+that)?|save memory)[:\s-]+(.+)$/i);
  if (memMatch && memMatch[1]?.trim()) {
    const content = memMatch[1].trim();
    proposals.push(
      makeProposal(
        'save_memory',
        'Save to RIT Personal Memory',
        content,
        { content, category: 'context', pinned: true }
      )
    );
  }

  // Lifestyle / experience / trip / memory intent
  const lifeMatch = trimmed.match(/^(?:add|log|save)\s+(?:a\s+)?(trip|travel|hobby|memory|relationship|experience)[:\s-]+(.+)$/i);
  if (lifeMatch && lifeMatch[2]?.trim()) {
    const rawCat = lifeMatch[1].toLowerCase();
    const category: LifestyleCategory =
      rawCat === 'trip' || rawCat === 'travel'
        ? 'travel'
        : rawCat === 'hobby'
        ? 'hobby'
        : rawCat === 'memory'
        ? 'memory'
        : rawCat === 'relationship'
        ? 'relationship'
        : 'experience';
    const title = lifeMatch[2].trim();
    proposals.push(
      makeProposal(
        'add_lifestyle_item',
        `Add ${category}: "${title}"`,
        `Saves to your Lifestyle & Experiences hub.`,
        { title, category, status: category === 'memory' ? 'completed' : 'planned', date: ctx.todayStr }
      )
    );
  }

  // Contextual rescue action when overdue tasks exist
  if ((q.includes('reschedule') || q.includes('plan my day') || q.includes('behind') || q.includes('overdue')) && ctx.overdueTasks.length > 0) {
    proposals.push(
      makeProposal(
        'reschedule_overdue',
        `Reschedule ${ctx.overdueTasks.length} overdue task${ctx.overdueTasks.length > 1 ? 's' : ''} to today`,
        'Clears backlog drift by moving overdue items onto today’s queue.',
        { count: ctx.overdueTasks.length, targetDate: ctx.todayStr }
      )
    );
  }

  // Starter proposal when user has zero data
  if (!ctx.hasAnyData && proposals.length === 0) {
    proposals.push(
      makeProposal(
        'create_task',
        'Create your first priority task',
        'Sets a clear first anchor for today.',
        {
          title: 'Define my top focus for today',
          priority: 'high',
          dueDate: ctx.todayStr,
          category: 'Personal',
        }
      )
    );
  }

  // Deep focus quick trigger
  if (q.includes('focus') || q.includes('pomodoro') || q.includes('study plan')) {
    proposals.push(
      makeProposal(
        'start_focus',
        'Launch Deep Focus session',
        'Opens the timed Deep Focus workspace.',
        { viewId: 'focus' }
      )
    );
  }

  return proposals;
}

export async function executeRitProposal(
  proposal: RitActionProposal,
  actions: RitStoreSnapshot & RitActionExecutor
): Promise<{ ok: boolean; message: string }> {
  const { type, payload } = proposal;
  const todayStr = todayLocal();

  try {
    switch (type) {
      case 'create_task': {
        const title = String(payload.title || '').trim();
        if (!title) return { ok: false, message: 'Task title was empty.' };
        const priority: Priority =
          payload.priority === 'critical' ||
          payload.priority === 'high' ||
          payload.priority === 'medium' ||
          payload.priority === 'low'
            ? payload.priority
            : 'medium';
        const created = await actions.quickAddTask(
          title,
          priority,
          String(payload.dueDate || todayStr),
          String(payload.category || 'Personal')
        );
        return { ok: true, message: `Added task "${created.title}".` };
      }

      case 'complete_task': {
        const taskId = String(payload.taskId || '');
        if (!taskId) return { ok: false, message: 'No task ID provided.' };
        await actions.completeTask(taskId);
        return { ok: true, message: 'Task marked complete.' };
      }

      case 'reschedule_overdue': {
        const targetDate = String(payload.targetDate || todayStr);
        const isDemoMode = Boolean(actions.settings?.isDemoMode);
        const overdue = actions.tasks.filter(
          (t) =>
            !t.deletedAt &&
            (isDemoMode || t.isDemo !== true) &&
            !t.isCompleted &&
            !t.isArchived &&
            t.dueDate &&
            t.dueDate < todayStr
        );
        for (const t of overdue) {
          await actions.rescheduleTask(t.id, targetDate);
        }
        return {
          ok: true,
          message: `Moved ${overdue.length} overdue task${overdue.length === 1 ? '' : 's'} to ${targetDate}.`,
        };
      }

      case 'create_goal': {
        const title = String(payload.title || '').trim();
        if (!title) return { ok: false, message: 'Goal title was empty.' };
        const priority: Priority =
          payload.priority === 'critical' ||
          payload.priority === 'high' ||
          payload.priority === 'medium' ||
          payload.priority === 'low'
            ? payload.priority
            : 'high';
        const goal = await actions.addGoal({
          title,
          priority,
          category: String(payload.category || 'Personal') as any,
          targetDate: payload.targetDate || payload.deadline ? String(payload.targetDate || payload.deadline) : undefined,
        });
        return { ok: true, message: `Created goal "${goal.title}".` };
      }

      case 'create_habit': {
        const name = String(payload.name || '').trim();
        if (!name) return { ok: false, message: 'Habit name was empty.' };
        const habit = await actions.addHabit({
          name,
          category: String(payload.category || 'Personal'),
        });
        return { ok: true, message: `Started habit "${habit.name}".` };
      }

      case 'log_expense': {
        const amount = Number(payload.amount);
        const title = String(payload.title || '').trim() || 'Expense';
        if (Number.isNaN(amount) || amount <= 0) {
          return { ok: false, message: 'Expense amount must be positive.' };
        }
        await actions.addTransaction({
          type: 'expense',
          amount,
          description: title,
          category: String(payload.category || 'General'),
          date: String(payload.date || todayStr),
          paymentMethod: 'UPI',
        });
        return { ok: true, message: `Logged expense "${title}" (${amount}).` };
      }

      case 'save_note': {
        const title = String(payload.title || '').trim() || `RIT Note (${todayStr})`;
        const content = String(payload.content || '').trim();
        await actions.saveNote({
          title,
          folder: String(payload.folder || 'RIT'),
          content,
          tags: ['rit'],
        });
        return { ok: true, message: `Saved note "${title}".` };
      }

      case 'save_memory': {
        const content = String(payload.content || '').trim();
        if (!content) return { ok: false, message: 'Memory content was empty.' };
        await actions.saveRitMemory({
          content,
          category: (payload.category as any) || 'context',
          source: 'user',
          pinned: payload.pinned !== false,
        });
        return { ok: true, message: 'Saved to RIT Personal Memory.' };
      }

      case 'add_lifestyle_item': {
        const title = String(payload.title || '').trim();
        if (!title) return { ok: false, message: 'Lifestyle item title was empty.' };
        const validCategories: LifestyleCategory[] = [
          'travel',
          'hobby',
          'memory',
          'relationship',
          'experience',
        ];
        const category = validCategories.includes(payload.category)
          ? (payload.category as LifestyleCategory)
          : 'experience';
        await actions.saveLifestyleItem({
          title,
          category,
          status: payload.status === 'completed' || payload.status === 'active' ? payload.status : 'planned',
          date: payload.date ? String(payload.date) : todayStr,
          notes: payload.notes ? String(payload.notes) : undefined,
        });
        return { ok: true, message: `Saved "${title}" in Lifestyle (${category}).` };
      }

      case 'start_focus': {
        actions.setActiveView('focus');
        return { ok: true, message: 'Opened Deep Focus workspace.' };
      }

      case 'navigate': {
        const viewId = String(payload.viewId || 'dashboard');
        actions.setActiveView(viewId);
        return { ok: true, message: `Navigated to ${viewId}.` };
      }

      default:
        return { ok: false, message: `Unsupported action type: ${type}` };
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Action execution failed.',
    };
  }
}

export function generateLocalRitReply(
  query: string,
  ctx: RitContextSummary
): Omit<AssistantMessage, 'id' | 'timestamp'> {
  const q = query.toLowerCase();
  const proposedActions = detectRitActionProposals(query, ctx);

  // If user gave an explicit creation command, acknowledge clearly without pretending it already ran
  if (
    proposedActions.some(
      (p) =>
        p.type === 'create_task' ||
        p.type === 'create_goal' ||
        p.type === 'create_habit' ||
        p.type === 'log_expense' ||
        p.type === 'save_memory' ||
        p.type === 'add_lifestyle_item'
    ) &&
    !q.includes('plan') &&
    !q.includes('summary')
  ) {
    const primary = proposedActions[0];
    return {
      role: 'assistant',
      provider: 'local',
      content: `Ready to execute: ${primary.label}. Review the action below and click Run Action to commit it to your local Life OS database.`,
      proposedActions,
    };
  }

  if (!ctx.hasAnyData) {
    return {
      role: 'assistant',
      provider: 'local',
      content:
        `Your Life OS workspace is currently a clean slate, ${ctx.userName}. No tasks, habits, goals, courses, transactions, or lifestyle items are recorded yet. Start by adding one real task below, or open Goals, Academics, Finance, or Lifestyle from the navigation bar.`,
      proposedActions,
    };
  }

  if (q.includes('plan') || q.includes('today') || q.includes('focus')) {
    const topTasks = [...ctx.overdueTasks, ...ctx.todayTasks].slice(0, 5);
    const pendingHabits = ctx.pendingHabitsToday.slice(0, 4);
    const urgentDeadlines = [
      ...ctx.upcomingAssignments.map((a) => `${a.title} (due ${a.dueDate})`),
      ...ctx.upcomingExams.map((e) => `${e.title} (exam ${e.examDate})`),
    ].slice(0, 3);

    const lines: string[] = [
      `Daily Rhythm Briefing for ${ctx.todayStr}:`,
      `• Priority queue: ${topTasks.length > 0 ? topTasks.map((t) => `${t.title} [${t.priority}]`).join('; ') : 'No overdue or due-today tasks.'}`,
      `• Habits left today: ${pendingHabits.length > 0 ? pendingHabits.map((h) => h.name).join(', ') : ctx.habits.length > 0 ? 'All tracked habits completed today.' : 'No habits configured.'}`,
      `• Active goals: ${ctx.criticalGoals.length > 0 ? ctx.criticalGoals.map((g) => `${g.title} (${g.progress}%)`).join('; ') : `${ctx.activeGoals.length} active goal(s).`}`,
    ];
    if (urgentDeadlines.length > 0) {
      lines.push(`• Upcoming academic commitments: ${urgentDeadlines.join('; ')}`);
    }
    if (ctx.memories.length > 0) {
      lines.push(`• Active personal context remembered: ${ctx.memories.slice(0, 2).map((m) => m.content).join(' | ')}`);
    }

    return {
      role: 'assistant',
      provider: 'local',
      content: lines.join('\n'),
      actionCard: {
        type: 'plan_day',
        data: {
          tasksCount: topTasks.length,
          habitsPending: pendingHabits.length,
          deadlinesCount: urgentDeadlines.length,
        },
      },
      proposedActions,
    };
  }

  if (q.includes('week') || q.includes('summary')) {
    const lines = [
      `Weekly Life OS Snapshot:`,
      `• Tasks completed (last 7 days): ${ctx.completedLast7Days}`,
      `• Open tasks remaining: ${ctx.openTasks.length} (${ctx.overdueTasks.length} overdue)`,
      `• Habits: ${ctx.completedHabitsTodayCount}/${ctx.habits.length} done today`,
      `• Workouts (last 7 days): ${ctx.weeklyWorkouts.length}`,
      `• Monthly cashflow: Income ${ctx.currency}${ctx.monthlyIncome.toLocaleString()} | Spent ${ctx.currency}${ctx.monthlyExpense.toLocaleString()}`,
      `• Career & Lifestyle: ${ctx.activeCareerProjects.length} active project(s), ${ctx.lifestyleItems.length} lifestyle record(s)`,
    ];
    return {
      role: 'assistant',
      provider: 'local',
      content: lines.join('\n'),
      actionCard: {
        type: 'weekly_summary',
        data: {
          completedLast7Days: ctx.completedLast7Days,
          weeklyWorkouts: ctx.weeklyWorkouts.length,
          openTasks: ctx.openTasks.length,
        },
      },
      proposedActions,
    };
  }

  if (q.includes('goal') || q.includes('priorit')) {
    const sorted = [...ctx.activeGoals].sort((a, b) => {
      const rank: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return (rank[b.priority] || 0) - (rank[a.priority] || 0);
    });
    const content =
      sorted.length > 0
        ? `Top Active Goals:\n${sorted
            .slice(0, 6)
            .map(
              (g, idx) =>
                `${idx + 1}. ${g.title}: ${g.progress}% (${g.priority}${g.targetDate ? `, target ${g.targetDate}` : ''})`
            )
            .join('\n')}`
        : 'You currently have no active non-archived goals.';
    return {
      role: 'assistant',
      provider: 'local',
      content,
      actionCard: { type: 'prioritize_goals', data: { count: sorted.length } },
      proposedActions,
    };
  }

  if (q.includes('behind') || q.includes('neglect') || q.includes('miss') || q.includes('audit')) {
    const gaps: string[] = [];
    if (ctx.overdueTasks.length > 0) {
      gaps.push(`${ctx.overdueTasks.length} overdue task(s): ${ctx.overdueTasks.slice(0, 4).map((t) => t.title).join(', ')}`);
    }
    if (ctx.pendingHabitsToday.length > 0) {
      gaps.push(`${ctx.pendingHabitsToday.length} habit(s) waiting today: ${ctx.pendingHabitsToday.slice(0, 4).map((h) => h.name).join(', ')}`);
    }
    if (ctx.atRiskSubjects.length > 0) {
      gaps.push(
        `Attendance below target in ${ctx.atRiskSubjects.map((s) => `${s.code} (${s.pct}% vs ${s.target}%)`).join(', ')}`
      );
    }
    if (ctx.upcomingAssignments.length > 0) {
      gaps.push(`${ctx.upcomingAssignments.length} open assignment(s) due within 14 days`);
    }
    const content =
      gaps.length > 0
        ? `Neglected & Urgent Signals:\n${gaps.map((g) => `• ${g}`).join('\n')}`
        : 'No overdue tasks, missed attendance targets, or uncompleted habits are flagged right now.';

    return {
      role: 'assistant',
      provider: 'local',
      content,
      actionCard: {
        type: 'behind_alert',
        data: {
          overdueCount: ctx.overdueTasks.length,
          atRiskSubjects: ctx.atRiskSubjects.length,
          pendingHabits: ctx.pendingHabitsToday.length,
        },
      },
      proposedActions,
    };
  }

  if (q.includes('spend') || q.includes('finance') || q.includes('budget') || q.includes('money')) {
    const net = ctx.monthlyIncome - ctx.monthlyExpense;
    const catText =
      ctx.topExpenseCategories.length > 0
        ? ctx.topExpenseCategories
            .map((c) => `${c.category}: ${ctx.currency}${c.amount.toLocaleString()}`)
            .join(', ')
        : 'No expenses logged this month.';
    const content = [
      `Monthly Finance Summary (${ctx.todayStr.slice(0, 7)}):`,
      `• Income: ${ctx.currency}${ctx.monthlyIncome.toLocaleString()}`,
      `• Expenses: ${ctx.currency}${ctx.monthlyExpense.toLocaleString()}`,
      `• Net Cashflow: ${ctx.currency}${net.toLocaleString()}`,
      `• Breakdown: ${catText}`,
    ].join('\n');
    return {
      role: 'assistant',
      provider: 'local',
      content,
      actionCard: {
        type: 'spending_summary',
        data: {
          monthlyIncome: ctx.monthlyIncome,
          monthlyExpense: ctx.monthlyExpense,
          net,
        },
      },
      proposedActions,
    };
  }

  if (q.includes('exam') || q.includes('study') || q.includes('academic') || q.includes('deadline')) {
    const lines = [`Academic & Study Outlook:`];
    if (ctx.upcomingExams.length > 0) {
      lines.push(
        `• Upcoming exams: ${ctx.upcomingExams.map((e) => `${e.title} (${e.examDate})`).join('; ')}`
      );
    } else {
      lines.push(`• Upcoming exams (next 21 days): None scheduled.`);
    }
    if (ctx.upcomingAssignments.length > 0) {
      lines.push(
        `• Assignments (next 14 days): ${ctx.upcomingAssignments.map((a) => `${a.title} (due ${a.dueDate})`).join('; ')}`
      );
    } else {
      lines.push(`• Open assignments (next 14 days): None.`);
    }
    if (ctx.atRiskSubjects.length > 0) {
      lines.push(
        `• Attendance watch: ${ctx.atRiskSubjects.map((s) => `${s.code} at ${s.pct}% (target ${s.target}%)`).join(', ')}`
      );
    }
    return {
      role: 'assistant',
      provider: 'local',
      content: lines.join('\n'),
      actionCard: {
        type: 'study_plan',
        data: {
          examsCount: ctx.upcomingExams.length,
          assignmentsCount: ctx.upcomingAssignments.length,
        },
      },
      proposedActions,
    };
  }

  // Whole-life pulse fallback
  return {
    role: 'assistant',
    provider: 'local',
    content: [
      `Life OS Rhythm Overview for ${ctx.todayStr}:`,
      `• Today & Tasks: ${ctx.todayTasks.length} due today, ${ctx.overdueTasks.length} overdue, ${ctx.openTasks.length} total open.`,
      `• Goals & Habits: ${ctx.activeGoals.length} active goal(s); ${ctx.completedHabitsTodayCount}/${ctx.habits.length} habits checked today.`,
      `• Academics & Career: ${ctx.upcomingAssignments.length} upcoming assignment(s), ${ctx.upcomingExams.length} exam(s), ${ctx.activeCareerProjects.length} active project(s).`,
      `• Finance & Fitness: ${ctx.currency}${ctx.monthlyExpense.toLocaleString()} spent this month; ${ctx.weeklyWorkouts.length} workout(s) in 7 days.`,
      `• Lifestyle & Memory: ${ctx.lifestyleItems.length} lifestyle record(s) and ${ctx.memories.length} saved memory note(s).`,
    ].join('\n'),
    actionCard: {
      type: 'life_rhythm',
      data: {
        openTasks: ctx.openTasks.length,
        activeGoals: ctx.activeGoals.length,
        lifestyleCount: ctx.lifestyleItems.length,
      },
    },
    proposedActions,
  };
}

function sanitizeProposals(raw: any): RitActionProposal[] {
  if (!Array.isArray(raw)) return [];
  const allowed: Set<RitActionType> = new Set([
    'create_task',
    'complete_task',
    'reschedule_overdue',
    'create_goal',
    'create_habit',
    'log_expense',
    'save_note',
    'save_memory',
    'add_lifestyle_item',
    'start_focus',
    'navigate',
  ]);
  const results: RitActionProposal[] = [];
  for (const item of raw.slice(0, 4)) {
    if (!item || typeof item !== 'object') continue;
    if (!allowed.has(item.type)) continue;
    if (typeof item.label !== 'string' || !item.label.trim()) continue;
    results.push({
      id: uuidv4(),
      type: item.type,
      label: item.label.trim(),
      description: typeof item.description === 'string' ? item.description.trim() : '',
      payload: item.payload && typeof item.payload === 'object' ? item.payload : {},
      status: 'proposed',
    });
  }
  return results;
}

export async function askRitIntelligence(
  query: string,
  snapshot: RitStoreSnapshot
): Promise<{
  message: Omit<AssistantMessage, 'id' | 'timestamp'>;
  geminiError?: string;
}> {
  const ctx = buildRitContext(snapshot);
  const apiKey = snapshot.settings?.geminiApiKey?.trim();

  if (!apiKey) {
    return { message: generateLocalRitReply(query, ctx) };
  }

  const compactContext = {
    todayStr: ctx.todayStr,
    userName: ctx.userName,
    currency: ctx.currency,
    tasks: {
      overdue: ctx.overdueTasks.slice(0, 8).map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, priority: t.priority })),
      today: ctx.todayTasks.slice(0, 8).map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
      openCount: ctx.openTasks.length,
      completedLast7Days: ctx.completedLast7Days,
    },
    goals: ctx.activeGoals.slice(0, 8).map((g) => ({ title: g.title, progress: g.progress, priority: g.priority, targetDate: g.targetDate })),
    habits: {
      total: ctx.habits.length,
      completedToday: ctx.completedHabitsTodayCount,
      pendingToday: ctx.pendingHabitsToday.slice(0, 8).map((h) => h.name),
    },
    academics: {
      atRiskSubjects: ctx.atRiskSubjects,
      upcomingAssignments: ctx.upcomingAssignments.slice(0, 6).map((a) => ({ title: a.title, dueDate: a.dueDate })),
      upcomingExams: ctx.upcomingExams.slice(0, 6).map((e) => ({ title: e.title, examDate: e.examDate })),
    },
    finance: {
      monthlyIncome: ctx.monthlyIncome,
      monthlyExpense: ctx.monthlyExpense,
      topExpenseCategories: ctx.topExpenseCategories,
    },
    fitness: { weeklyWorkouts: ctx.weeklyWorkouts.length },
    career: {
      activeProjects: ctx.activeCareerProjects.slice(0, 5).map((p) => p.title),
      openApplications: ctx.openApplications.length,
    },
    lifestyle: ctx.lifestyleItems.slice(0, 6).map((l) => ({ title: l.title, category: l.category, status: l.status, date: l.date })),
    personalMemories: ctx.memories.slice(0, 10).map((m) => ({ category: m.category, content: m.content })),
  };

  const systemInstruction = [
    'You are RIT, the central intelligence layer of LIFE OS ("Bring your life into rhythm").',
    'Be calm, practical, concise, and grounded strictly in the JSON context provided.',
    'NEVER invent tasks, numbers, dates, or events not present in the JSON context.',
    'Do not reveal chain-of-thought or internal reasoning steps.',
    'Respond with strict JSON only matching:',
    '{"reply": "clear concise answer using bullet points if helpful", "proposals": [{"type": "create_task|reschedule_overdue|create_goal|create_habit|log_expense|save_memory|add_lifestyle_item|save_note|start_focus|navigate", "label": "short action title", "description": "what will change", "payload": {}}]}',
    'Include proposals only when an actionable next step clearly matches the user request.',
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `User Context JSON:\n${JSON.stringify(compactContext)}\n\nUser Request:\n${query}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty response returned by Gemini API');
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { reply: rawText.trim(), proposals: [] };
    }

    const replyText =
      typeof parsed?.reply === 'string' && parsed.reply.trim()
        ? parsed.reply.trim()
        : rawText.trim();

    const proposals = sanitizeProposals(parsed?.proposals);
    const localCard = generateLocalRitReply(query, ctx).actionCard;

    return {
      message: {
        role: 'assistant',
        provider: 'gemini',
        content: replyText,
        actionCard: localCard,
        proposedActions:
          proposals.length > 0 ? proposals : detectRitActionProposals(query, ctx),
      },
    };
  } catch (err) {
    const errMsg =
      err instanceof Error ? err.message : 'Unable to reach Gemini API; switched to Local Intelligence.';
    const fallback = generateLocalRitReply(query, ctx);
    return {
      geminiError: errMsg,
      message: {
        ...fallback,
        content: `${fallback.content}\n\n[Gemini fallback note: ${errMsg}]`,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}
