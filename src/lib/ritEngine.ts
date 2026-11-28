import { v4 as uuidv4 } from 'uuid';
import { todayLocal, toLocalDateString } from './dates';
import { parseQuickTaskInput } from './quickAddParser';
import type { WorkspaceContextSummary } from './nvidiaModels';
import type {
  AcademicAssignment,
  AcademicExam,
  AcademicSubject,
  CareerProject,
  EveningReview,
  FinanceBudget,
  FinanceTransaction,
  FitnessGoal,
  Goal,
  Habit,
  HabitEntry,
  JobApplication,
  Priority,
  RitPendingAction,
  SkillItem,
  Task,
  TimetableSlot,
  WorkoutSession,
} from '../types';

export interface RitWorkspaceState {
  userName: string;
  currency: string;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  financeTransactions: FinanceTransaction[];
  financeBudgets: FinanceBudget[];
  workoutSessions: WorkoutSession[];
  fitnessGoals: FitnessGoal[];
  academicSubjects: AcademicSubject[];
  academicAssignments: AcademicAssignment[];
  academicExams: AcademicExam[];
  timetableSlots: TimetableSlot[];
  careerProjects: CareerProject[];
  careerApplications: JobApplication[];
  careerSkills: SkillItem[];
  eveningReviews: EveningReview[];
}

export interface RitMetricsSnapshot {
  todayStr: string;
  productivityScore: number;
  taskCompletionRate: number;
  habitAdherence14d: number;
  monthlyConsistencyPct: number;
  avgGoalProgress: number;
  pendingTasks: Task[];
  overdueTasks: Task[];
  todayTasks: Task[];
  completedTodayCount: number;
  completedThisWeekCount: number;
  habitsToday: Habit[];
  habitsDoneToday: number;
  attendanceWarnings: Array<{ subject: string; pct: number; target: number }>;
  overallAttendancePct: number;
  pendingAssignments: AcademicAssignment[];
  upcomingExams: AcademicExam[];
  monthlyIncome: number;
  monthlySpend: number;
  savingsRatePct: number;
  topExpenseCategories: Array<[string, number]>;
  workoutsThisWeek: WorkoutSession[];
  activeApplications: JobApplication[];
  interviewApplications: JobApplication[];
}

export interface RitLocalReply {
  content: string;
  suggestedViews?: Array<{ viewId: string; label: string }>;
  pendingAction?: RitPendingAction;
}

export function buildRitMetricsSnapshot(state: RitWorkspaceState): RitMetricsSnapshot {
  const todayStr = todayLocal();
  const curMonth = todayStr.substring(0, 7);
  const weekCutoffStr = toLocalDateString(new Date(Date.now() - 6 * 86400000));
  const monthCutoffStr = toLocalDateString(new Date(Date.now() - 29 * 86400000));
  const past14Days = Array.from({ length: 14 }).map((_, i) =>
    toLocalDateString(new Date(Date.now() - i * 86400000))
  );
  const past30Days = Array.from({ length: 30 }).map((_, i) =>
    toLocalDateString(new Date(Date.now() - i * 86400000))
  );

  const pendingTasks = state.tasks.filter((t) => !t.isCompleted && !t.isArchived);
  const overdueTasks = pendingTasks.filter(
    (t) => t.isOverdue || (Boolean(t.dueDate) && t.dueDate! < todayStr)
  );
  const todayTasks = pendingTasks.filter((t) => t.dueDate === todayStr);
  const completedTasks = state.tasks.filter((t) => t.isCompleted);
  const completedTodayCount = completedTasks.filter(
    (t) => t.completedAt && toLocalDateString(new Date(t.completedAt)) === todayStr
  ).length;
  const completedThisWeekCount = completedTasks.filter(
    (t) => t.completedAt && toLocalDateString(new Date(t.completedAt)) >= weekCutoffStr
  ).length;

  const taskCompletionRate =
    state.tasks.length > 0 ? Math.round((completedTasks.length / state.tasks.length) * 100) : 0;

  const dayOfWeek = new Date().getDay();
  const activeHabits = state.habits.filter((h) => !h.isArchived);
  const habitsToday = activeHabits.filter((h) => h.targetDays.includes(dayOfWeek));
  const habitsDoneToday = habitsToday.filter((h) =>
    state.habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed)
  ).length;

  const expected14d = activeHabits.length * 14;
  const actual14d = state.habitEntries.filter(
    (e) => past14Days.includes(e.date) && e.completed
  ).length;
  const habitAdherence14d =
    expected14d > 0 ? Math.min(100, Math.round((actual14d / expected14d) * 100)) : 0;

  const expected30d = activeHabits.length * 30;
  const actual30d = state.habitEntries.filter(
    (e) => (past30Days.includes(e.date) || e.date >= monthCutoffStr) && e.completed
  ).length;
  const monthlyConsistencyPct =
    expected30d > 0 ? Math.min(100, Math.round((actual30d / expected30d) * 100)) : 0;

  const activeGoals = state.goals.filter((g) => !g.isArchived);
  const avgGoalProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
      : 0;

  const activePillars = [
    state.tasks.length > 0 ? taskCompletionRate : null,
    activeHabits.length > 0 ? habitAdherence14d : null,
    activeGoals.length > 0 ? avgGoalProgress : null,
  ].filter((v): v is number => v !== null);

  const productivityScore =
    activePillars.length > 0
      ? Math.round(activePillars.reduce((sum, v) => sum + v, 0) / activePillars.length)
      : 0;

  const monthTx = state.financeTransactions.filter((t) => t.date.startsWith(curMonth));
  const monthlyIncome = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlySpend = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const net = monthlyIncome - monthlySpend;
  const savingsRatePct = monthlyIncome > 0 ? Math.round((net / monthlyIncome) * 100) : 0;

  const catTotals: Record<string, number> = {};
  monthTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
  const topExpenseCategories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  let totalAtt = 0;
  let totalCls = 0;
  const attendanceWarnings: Array<{ subject: string; pct: number; target: number }> = [];
  state.academicSubjects.forEach((s) => {
    totalAtt += s.attendedClasses;
    totalCls += s.totalClasses;
    if (s.totalClasses > 0) {
      const pct = Number(((s.attendedClasses / s.totalClasses) * 100).toFixed(1));
      if (pct < s.targetAttendancePercentage) {
        attendanceWarnings.push({
          subject: `${s.code} ${s.name}`.trim(),
          pct,
          target: s.targetAttendancePercentage,
        });
      }
    }
  });
  const overallAttendancePct = totalCls > 0 ? Math.round((totalAtt / totalCls) * 100) : 0;

  const pendingAssignments = state.academicAssignments
    .filter((a) => !a.isSubmitted)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcomingExams = state.academicExams
    .filter((e) => e.examDate >= todayStr)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  const workoutsThisWeek = state.workoutSessions.filter((w) => w.date >= weekCutoffStr);
  const activeApplications = state.careerApplications.filter((a) => a.stage !== 'rejected');
  const interviewApplications = state.careerApplications.filter(
    (a) => a.stage === 'interview' || a.stage === 'oa'
  );

  return {
    todayStr,
    productivityScore,
    taskCompletionRate,
    habitAdherence14d,
    monthlyConsistencyPct,
    avgGoalProgress,
    pendingTasks,
    overdueTasks,
    todayTasks,
    completedTodayCount,
    completedThisWeekCount,
    habitsToday,
    habitsDoneToday,
    attendanceWarnings,
    overallAttendancePct,
    pendingAssignments,
    upcomingExams,
    monthlyIncome,
    monthlySpend,
    savingsRatePct,
    topExpenseCategories,
    workoutsThisWeek,
    activeApplications,
    interviewApplications,
  };
}

export function buildRitWorkspaceContext(
  state: RitWorkspaceState,
  snap: RitMetricsSnapshot
): WorkspaceContextSummary {
  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return {
    userName: state.userName || 'Student',
    todayStr: snap.todayStr,
    currency: state.currency,
    pendingTasksCount: snap.pendingTasks.length,
    overdueTasksCount: snap.overdueTasks.length,
    completedTodayCount: snap.completedTodayCount,
    todayTasks: snap.todayTasks
      .slice()
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 12)
      .map((t) => ({ title: t.title, priority: t.priority, dueTime: t.dueTime })),
    overdueTasks: snap.overdueTasks.slice(0, 8).map((t) => ({
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
    activeGoals: state.goals
      .filter((g) => !g.isArchived)
      .slice(0, 8)
      .map((g) => ({
        title: g.title,
        progress: g.progress,
        priority: g.priority,
        targetDate: g.targetDate,
        nextMilestone: g.milestones.find((m) => !m.isCompleted)?.title,
      })),
    habitsTodayCount: snap.habitsToday.length,
    habitsDoneTodayCount: snap.habitsDoneToday,
    monthlyHabitConsistencyPct: snap.monthlyConsistencyPct,
    habitHighlights: state.habits
      .filter((h) => !h.isArchived)
      .slice(0, 8)
      .map((h) => ({
        name: h.name,
        streak: h.streak,
        doneToday: state.habitEntries.some(
          (e) => e.habitId === h.id && e.date === snap.todayStr && e.completed
        ),
      })),
    attendanceWarnings: snap.attendanceWarnings.slice(0, 10).map((w) => ({
      subject: w.subject,
      pct: w.pct,
    })),
    overallAttendancePct: snap.overallAttendancePct,
    pendingAssignmentsCount: snap.pendingAssignments.length,
    upcomingExams: snap.upcomingExams.slice(0, 6).map((e) => ({
      title: e.title,
      examDate: e.examDate,
      coveragePct: e.syllabusCoveragePercentage,
    })),
    monthlySpendFormatted: `${state.currency}${snap.monthlySpend.toLocaleString('en-IN')}`,
    monthlyIncomeFormatted: `${state.currency}${snap.monthlyIncome.toLocaleString('en-IN')}`,
    savingsRatePct: snap.savingsRatePct,
    workoutsLogged: state.workoutSessions.length,
    workoutsThisWeek: snap.workoutsThisWeek.length,
    latestWorkoutTitle: state.workoutSessions[0]?.title,
    careerProjectsCount: state.careerProjects.length,
    activeApplicationsCount: snap.activeApplications.length,
    interviewApplicationsCount: snap.interviewApplications.length,
    topSkills: state.careerSkills.slice(0, 6).map((s) => `${s.name} (${s.proficiency}/${s.targetProficiency})`),
    productivityScore: snap.productivityScore,
    taskCompletionRate: snap.taskCompletionRate,
    habitAdherenceRate: snap.habitAdherence14d,
  };
}

function inferCategoryFromText(text: string, fallback: string): string {
  if (fallback !== 'General') return fallback;
  const low = text.toLowerCase();
  if (/\b(dsa|study|exam|midterm|quiz|assignment|lab|lecture|notes|syllabus|course|chapter|revision)\b/.test(low)) {
    return 'Academics';
  }
  if (/\b(gym|workout|run|cardio|push|pull|legs|protein|stretch|yoga)\b/.test(low)) {
    return 'Health & Fitness';
  }
  if (/\b(resume|interview|leetcode|project|portfolio|apply|internship|career|github)\b/.test(low)) {
    return 'Career & Work';
  }
  if (/\b(budget|expense|rent|bill|bank|tax|invest|fee)\b/.test(low)) {
    return 'Finance & Money';
  }
  return 'General';
}

export function detectRitActionIntent(
  rawQuery: string,
  state: RitWorkspaceState
): RitLocalReply | null {
  const trimmed = rawQuery.trim();
  if (!trimmed) return null;
  const todayStr = todayLocal();

  // 1. Add / Create / Remind task (e.g., "Add a task to study DSA at 6 PM.")
  const addTaskMatch = trimmed.match(
    /^(?:please\s+|can you\s+|could you\s+)?(?:add|create|schedule|make|set)\s+(?:a\s+)?(?:new\s+)?(?:task|todo|reminder)\s*(?:to|for|:)?\s+(.+)$/i
  ) || trimmed.match(/^(?:remind\s+me\s+to)\s+(.+)$/i);

  if (addTaskMatch && addTaskMatch[1]) {
    const cleanedBody = addTaskMatch[1].replace(/[.!?]+$/, '').trim();
    const parsed = parseQuickTaskInput(cleanedBody);
    const titleRaw = (parsed.title || cleanedBody).trim();
    const title = titleRaw.charAt(0).toUpperCase() + titleRaw.slice(1);
    const category = inferCategoryFromText(cleanedBody, parsed.category);
    const dueDate = parsed.dueDate || (parsed.dueTime ? todayStr : todayStr);

    return {
      content: `### Ready to Schedule Task\nI prepared **${title}** from your command:\n- **When**: ${dueDate}${parsed.dueTime ? ` at ${parsed.dueTime}` : ''}\n- **Priority**: ${parsed.priority}\n- **Category**: ${category}\n\nConfirm below to add it directly to your Life OS Tasks.`,
      suggestedViews: [{ viewId: 'tasks', label: 'Open Tasks' }],
      pendingAction: {
        id: uuidv4(),
        type: 'create_task',
        title,
        dueDate,
        dueTime: parsed.dueTime,
        priority: parsed.priority,
        category,
        status: 'pending',
      },
    };
  }

  // 2. Add / Set Goal
  const addGoalMatch = trimmed.match(
    /^(?:please\s+)?(?:add|create|set|start)\s+(?:a\s+)?(?:new\s+)?goal\s*(?:to|for|:)?\s+(.+)$/i
  );
  if (addGoalMatch && addGoalMatch[1]) {
    const cleanedBody = addGoalMatch[1].replace(/[.!?]+$/, '').trim();
    const parsed = parseQuickTaskInput(cleanedBody);
    const title = parsed.title.charAt(0).toUpperCase() + parsed.title.slice(1);
    const category = inferCategoryFromText(cleanedBody, parsed.category);
    return {
      content: `### Ready to Establish Goal\nI drafted goal **${title}** (${category}, ${parsed.priority} priority).\n\nConfirm below to save it into Life OS Goals.`,
      suggestedViews: [{ viewId: 'goals', label: 'Open Goals' }],
      pendingAction: {
        id: uuidv4(),
        type: 'create_goal',
        title,
        priority: parsed.priority,
        category,
        targetDate: parsed.dueDate,
        status: 'pending',
      },
    };
  }

  // 3. Complete / Finish existing task
  const completeMatch = trimmed.match(
    /^(?:mark|complete|finish|check\s+off)\s+(?:task\s+)?["']?(.+?)["']?(?:\s+as\s+(?:done|complete|completed))?[.!?]*$/i
  );
  if (completeMatch && completeMatch[1] && !/habit/i.test(trimmed)) {
    const needle = completeMatch[1].trim().toLowerCase();
    const candidate = state.tasks.find(
      (t) => !t.isCompleted && (t.title.toLowerCase() === needle || t.title.toLowerCase().includes(needle))
    );
    if (candidate) {
      return {
        content: `### Confirm Task Completion\nFound open task **${candidate.title}**${candidate.dueDate ? ` (due ${candidate.dueDate})` : ''}.\n\nConfirm below to mark it completed.`,
        suggestedViews: [{ viewId: 'tasks', label: 'Open Tasks' }],
        pendingAction: {
          id: uuidv4(),
          type: 'complete_task',
          taskId: candidate.id,
          taskTitle: candidate.title,
          status: 'pending',
        },
      };
    }
  }

  // 4. Toggle / Log Habit today
  const habitMatch = trimmed.match(
    /^(?:log|complete|check\s+off|mark|track)\s+habit\s+["']?(.+?)["']?[.!?]*$/i
  );
  if (habitMatch && habitMatch[1]) {
    const needle = habitMatch[1].trim().toLowerCase();
    const habit = state.habits.find(
      (h) => !h.isArchived && (h.name.toLowerCase() === needle || h.name.toLowerCase().includes(needle))
    );
    if (habit) {
      return {
        content: `### Confirm Habit Check-In\nToggle **${habit.name}** for today (${todayStr})?`,
        suggestedViews: [{ viewId: 'habits', label: 'Open Habits' }],
        pendingAction: {
          id: uuidv4(),
          type: 'toggle_habit',
          habitId: habit.id,
          habitName: habit.name,
          date: todayStr,
          status: 'pending',
        },
      };
    }
  }

  // 5. Log Expense (Finance)
  const expenseMatch = trimmed.match(
    /^(?:log|add|record|track)\s+(?:an?\s+)?expense\s+(?:of\s+)?(?:₹|rs\.?|inr|\$)?\s*(\d+(?:\.\d{1,2})?)\s*(?:for|on)?\s*(.*)$/i
  );
  if (expenseMatch && expenseMatch[1]) {
    const amount = Number(expenseMatch[1]);
    const desc = (expenseMatch[2] || 'General expense').replace(/[.!?]+$/, '').trim() || 'General expense';
    if (Number.isFinite(amount) && amount > 0) {
      const lowDesc = desc.toLowerCase();
      const category = /coffee|food|lunch|dinner|snack|chai|meal|zomato|swiggy/.test(lowDesc)
        ? 'Food'
        : /book|course|tuition|exam|print/.test(lowDesc)
        ? 'Education'
        : /uber|bus|metro|train|fuel|auto/.test(lowDesc)
        ? 'Transport'
        : 'Personal';
      return {
        content: `### Confirm Expense Entry\nPrepared **${state.currency}${amount.toFixed(2)}** for **${desc}** (${category}) on ${todayStr}.\n\nConfirm below to record it in Finance.`,
        suggestedViews: [{ viewId: 'finance', label: 'Open Finance' }],
        pendingAction: {
          id: uuidv4(),
          type: 'create_transaction',
          txType: 'expense',
          amount,
          description: desc.charAt(0).toUpperCase() + desc.slice(1),
          category,
          date: todayStr,
          status: 'pending',
        },
      };
    }
  }

  return null;
}

export function generateRitLocalResponse(
  query: string,
  state: RitWorkspaceState
): RitLocalReply {
  const actionIntent = detectRitActionIntent(query, state);
  if (actionIntent) return actionIntent;

  const snap = buildRitMetricsSnapshot(state);
  const q = query.toLowerCase();
  const priorityWeight: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  // 1. Overdue tasks
  if (q.includes('overdue') || q.includes('late') || q.includes('missed tasks')) {
    const sorted = snap.overdueTasks
      .slice()
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    let response = `### Overdue Task Audit (${sorted.length})\n\n`;
    if (sorted.length === 0) {
      response += `> [!TIP] Clear Horizon — You have **0 overdue tasks** right now. Everything open is either scheduled for today or upcoming.`;
    } else {
      response += `> [!WARNING] **${sorted.length} task(s)** passed their due date and need triage or rescheduling:\n`;
      sorted.slice(0, 12).forEach((t) => {
        response += `- **${t.title}** — due ${t.dueDate || 'earlier'} [${t.priority.toUpperCase()}] (${t.category})\n`;
      });
      response += `\n#### Suggested Next Steps\n- Complete or reschedule the top 1–2 overdue items first before taking new tasks.\n- Ask me *"Mark <task name> as done"* to close one quickly.`;
    }
    return {
      content: response,
      suggestedViews: [
        { viewId: 'tasks', label: 'Review Tasks' },
        { viewId: 'dashboard', label: 'Today View' },
      ],
    };
  }

  // 2. Plan my day
  if (q.includes('plan') && (q.includes('day') || q.includes('today') || q.includes('schedule'))) {
    const todayClasses = state.timetableSlots
      .filter((slot) => {
        const jsDay = new Date().getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;
        return slot.dayOfWeek === isoDay;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let response = `### Daily Rhythm Plan (${snap.todayStr})\n\n`;

    if (snap.overdueTasks.length > 0) {
      response += `> [!WARNING] **${snap.overdueTasks.length} Overdue Task(s)** need triage first:\n`;
      snap.overdueTasks.slice(0, 4).forEach((t) => {
        response += `- **${t.title}** [${t.priority.toUpperCase()}]\n`;
      });
      response += `\n`;
    }

    response += `#### Scheduled Focus Tasks (${snap.todayTasks.length})\n`;
    if (snap.todayTasks.length === 0) {
      const nextBacklog = snap.pendingTasks
        .slice()
        .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
        .slice(0, 3);
      if (nextBacklog.length > 0) {
        response += `*No tasks pinned specifically to today — pull one top open item:*\n`;
        nextBacklog.forEach((t) => {
          response += `- [ ] **${t.title}** [${t.priority.toUpperCase()}]\n`;
        });
      } else {
        response += `*All tasks are clear for today. Consider advancing a goal milestone.*\n`;
      }
    } else {
      snap.todayTasks
        .slice()
        .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
        .forEach((t) => {
          response += `- [ ] **${t.title}** — ${t.dueTime ? `${t.dueTime}` : 'Flexible'} [${t.priority.toUpperCase()}]\n`;
        });
    }

    if (todayClasses.length > 0) {
      response += `\n#### Classes Today\n`;
      todayClasses.forEach((c) => {
        response += `- **${c.startTime}–${c.endTime}**: ${c.subjectName || c.courseCode || 'Class'} (${c.room})\n`;
      });
    }

    response += `\n#### Habits in Rhythm (${snap.habitsDoneToday}/${snap.habitsToday.length})\n`;
    if (snap.habitsToday.length === 0) {
      response += `*No habits scheduled for today.*\n`;
    } else {
      snap.habitsToday.forEach((h) => {
        const done = state.habitEntries.some(
          (e) => e.habitId === h.id && e.date === snap.todayStr && e.completed
        );
        response += `- ${done ? 'Done' : 'Pending'}: **${h.name}** (${h.streak}d streak)\n`;
      });
    }

    response += `\n> [!TIP] Protect one uninterrupted 60–90 minute deep work block around your top academic or goal task before context-switching.`;
    return {
      content: response,
      suggestedViews: [
        { viewId: 'tasks', label: 'Open Tasks' },
        { viewId: 'focus', label: 'Start Deep Focus' },
        { viewId: 'habits', label: 'Habits' },
      ],
    };
  }

  // 3. What should I prioritize today?
  if (q.includes('priorit') || q.includes('focus today') || q.includes('most important right now')) {
    let response = `### Priority Order for Today\n\n`;
    const criticalTasks = snap.pendingTasks
      .slice()
      .sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
      .slice(0, 4);

    if (snap.overdueTasks.length > 0 || snap.attendanceWarnings.length > 0 || snap.upcomingExams.length > 0) {
      response += `> [!WARNING] High-leverage items driving today's urgency:\n`;
      if (snap.overdueTasks.length > 0) {
        response += `- Clear **${snap.overdueTasks.length} overdue task(s)** starting with **${snap.overdueTasks[0].title}**.\n`;
      }
      if (snap.attendanceWarnings.length > 0) {
        const w = snap.attendanceWarnings[0];
        response += `- Protect **${w.subject}** attendance (${w.pct}% vs ${w.target}% target).\n`;
      }
      if (snap.upcomingExams.length > 0) {
        const ex = snap.upcomingExams[0];
        response += `- Advance **${ex.title}** revision (on ${ex.examDate}, ${ex.syllabusCoveragePercentage}% covered).\n`;
      }
      response += `\n`;
    }

    response += `#### Top Ranked Actions\n`;
    if (criticalTasks.length === 0 && snap.pendingAssignments.length === 0) {
      response += `- Workspace queue is calm — dedicate today to deep study, a goal milestone, or recovery.\n`;
    } else {
      criticalTasks.forEach((t, idx) => {
        response += `- **#${idx + 1} ${t.title}** [${t.priority.toUpperCase()}]${t.dueDate ? ` • Due ${t.dueDate}` : ''}\n`;
      });
      snap.pendingAssignments.slice(0, 2).forEach((a) => {
        response += `- **Assignment**: ${a.title} (due ${a.dueDate})\n`;
      });
    }

    return {
      content: response,
      suggestedViews: [
        { viewId: 'focus', label: 'Deep Focus' },
        { viewId: 'tasks', label: 'Open Tasks' },
        { viewId: 'goals', label: 'Open Goals' },
      ],
    };
  }

  // 4. Summarize my week
  if (q.includes('week') && (q.includes('summar') || q.includes('review') || q.includes('recap'))) {
    const weekCutoffStr = toLocalDateString(new Date(Date.now() - 6 * 86400000));
    const weekHabitCheckins = state.habitEntries.filter(
      (e) => e.date >= weekCutoffStr && e.completed
    ).length;
    const weekSpend = state.financeTransactions
      .filter((t) => t.type === 'expense' && t.date >= weekCutoffStr)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalVolumeKg = snap.workoutsThisWeek.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);

    let response = `### 7-Day Rhythm Summary\n\n`;
    response += `- **Tasks**: ${snap.completedThisWeekCount} completed this week • ${snap.pendingTasks.length} remaining (${snap.overdueTasks.length} overdue)\n`;
    response += `- **Habits**: ${weekHabitCheckins} check-ins over the past 7 days (${snap.habitAdherence14d}% 14-day adherence)\n`;
    response += `- **Gym & Fitness**: ${snap.workoutsThisWeek.length} session(s) logged (${totalVolumeKg.toLocaleString('en-IN')} kg volume)\n`;
    response += `- **Finance (7d spend)**: ${state.currency}${weekSpend.toLocaleString('en-IN')}\n`;
    response += `- **Academics**: ${snap.pendingAssignments.length} pending assignments • ${snap.upcomingExams.length} upcoming exams\n\n`;

    if (state.eveningReviews.length > 0) {
      const latest = state.eveningReviews.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
      response += `#### Latest Reflection (${latest.date})\n- Rating: **${latest.rating}/5**${latest.reflection ? ` — *${latest.reflection.slice(0, 120)}*` : ''}\n`;
    }

    return {
      content: response,
      suggestedViews: [
        { viewId: 'analytics', label: 'Open Analytics' },
        { viewId: 'review', label: 'Evening Review' },
      ],
    };
  }

  // 5. Upcoming goals
  if (q.includes('goal') || q.includes('milestone')) {
    const activeGoals = state.goals
      .filter((g) => !g.isArchived)
      .slice()
      .sort((a, b) => {
        if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      });

    let response = `### Active & Upcoming Goals (${activeGoals.length})\n\n`;
    if (activeGoals.length === 0) {
      response += `No active goals yet. Try telling me *"Create a goal to finish DSA Sheet"* or open Goals to add one.`;
    } else {
      activeGoals.slice(0, 6).forEach((g) => {
        const nextMs = g.milestones.find((m) => !m.isCompleted);
        response += `#### ${g.title} [${g.priority.toUpperCase()} • ${g.progress}%]\n`;
        response += `- **Area**: ${g.category} • **Target**: ${g.targetDate || 'Ongoing'}\n`;
        if (nextMs) {
          response += `- **Next Milestone**: ${nextMs.title}\n`;
        }
        response += `\n`;
      });
    }
    return {
      content: response,
      suggestedViews: [{ viewId: 'goals', label: 'Open Goals' }],
    };
  }

  // 6. Monthly consistency
  if (q.includes('consistent') || q.includes('consistency') || q.includes('streak') || q.includes('month')) {
    const activeHabits = state.habits.filter((h) => !h.isArchived);
    const monthPrefix = snap.todayStr.substring(0, 7);
    const monthWorkouts = state.workoutSessions.filter((w) => w.date.startsWith(monthPrefix)).length;
    const monthReviews = state.eveningReviews.filter((r) => r.date.startsWith(monthPrefix)).length;

    let response = `### Monthly Consistency Check (${monthPrefix})\n\n`;
    response += `- **30-Day Habit Consistency**: **${snap.monthlyConsistencyPct}%** (${snap.habitAdherence14d}% over the past 14 days)\n`;
    response += `- **Workouts This Month**: ${monthWorkouts} logged session(s)\n`;
    response += `- **Evening Reflections**: ${monthReviews} logged this month\n\n`;

    if (activeHabits.length > 0) {
      response += `#### Habit Streaks\n`;
      activeHabits
        .slice()
        .sort((a, b) => b.streak - a.streak)
        .forEach((h) => {
          response += `- **${h.name}**: ${h.streak}d current streak (best: ${h.longestStreak}d)\n`;
        });
    } else {
      response += `*Add daily habits in the Habits module to start tracking streak momentum.*`;
    }

    return {
      content: response,
      suggestedViews: [
        { viewId: 'habits', label: 'Open Habits' },
        { viewId: 'fitness', label: 'Open Fitness' },
      ],
    };
  }

  // 7. Overview of productivity / analytics
  if (q.includes('productivity') || q.includes('overview') || q.includes('status') || q.includes('score')) {
    let response = `### Life OS Productivity Overview\n\n`;
    response += `- **Composite Productivity Score**: **${snap.productivityScore}%**\n`;
    response += `- **Tasks**: ${snap.taskCompletionRate}% overall completion • ${snap.pendingTasks.length} open (${snap.overdueTasks.length} overdue)\n`;
    response += `- **Habits**: ${snap.habitAdherence14d}% (14-day) • ${snap.habitsDoneToday}/${snap.habitsToday.length} completed today\n`;
    response += `- **Goals**: ${state.goals.filter((g) => !g.isArchived).length} active goals (${snap.avgGoalProgress}% average progress)\n`;
    response += `- **Academics**: ${snap.overallAttendancePct}% attendance • ${snap.pendingAssignments.length} pending assignments\n`;
    response += `- **Finance (${snap.todayStr.substring(0, 7)})**: Spend ${state.currency}${snap.monthlySpend.toLocaleString('en-IN')} • Income ${state.currency}${snap.monthlyIncome.toLocaleString('en-IN')}\n`;
    response += `- **Fitness & Career**: ${state.workoutSessions.length} workouts • ${snap.activeApplications.length} career applications\n`;

    return {
      content: response,
      suggestedViews: [
        { viewId: 'analytics', label: 'Open Analytics' },
        { viewId: 'universe', label: 'Knowledge Universe' },
      ],
    };
  }

  // 8. Falling behind / friction
  if (q.includes('falling behind') || q.includes('neglected') || q.includes('behind')) {
    const missedHabits = state.habits.filter((h) => !h.isArchived && h.streak === 0);
    let response = `### Friction & Bottleneck Audit\n\n`;
    if (snap.overdueTasks.length === 0 && snap.attendanceWarnings.length === 0 && missedHabits.length === 0) {
      response += `> [!TIP] Everything is aligned right now — 0 overdue tasks, target academic attendance is met, and active habits maintain streaks.`;
    } else {
      if (snap.overdueTasks.length > 0) {
        response += `#### Overdue Action Items (${snap.overdueTasks.length})\n`;
        snap.overdueTasks.slice(0, 5).forEach((t) => {
          response += `- **${t.title}** (was due ${t.dueDate || 'earlier'})\n`;
        });
        response += `\n`;
      }
      if (snap.attendanceWarnings.length > 0) {
        response += `#### Academic Attendance Danger Zone\n`;
        snap.attendanceWarnings.forEach((w) => {
          response += `- **${w.subject}**: ${w.pct}% (target ${w.target}%)\n`;
        });
        response += `\n`;
      }
      if (missedHabits.length > 0) {
        response += `#### Reset Habits (2-Minute Version Today)\n`;
        missedHabits.slice(0, 5).forEach((h) => {
          response += `- **${h.name}**: streak currently at 0 days\n`;
        });
      }
    }
    return {
      content: response,
      suggestedViews: [
        { viewId: 'tasks', label: 'Open Tasks' },
        { viewId: 'academics', label: 'Open Academics' },
      ],
    };
  }

  // 9. Finance
  if (q.includes('spend') || q.includes('finance') || q.includes('budget') || q.includes('money')) {
    const net = snap.monthlyIncome - snap.monthlySpend;
    let response = `### Monthly Financial Snapshot (${snap.todayStr.substring(0, 7)})\n\n`;
    response += `- **Total Inflow**: ${state.currency}${snap.monthlyIncome.toLocaleString('en-IN')}\n`;
    response += `- **Total Outflow**: ${state.currency}${snap.monthlySpend.toLocaleString('en-IN')}\n`;
    response += `- **Net Cashflow**: ${net >= 0 ? '+' : '-'}${state.currency}${Math.abs(net).toLocaleString('en-IN')} (${snap.savingsRatePct}% savings rate)\n\n`;
    if (snap.topExpenseCategories.length > 0) {
      response += `#### Top Categories\n`;
      snap.topExpenseCategories.slice(0, 4).forEach(([cat, amt]) => {
        response += `- **${cat}**: ${state.currency}${amt.toLocaleString('en-IN')}\n`;
      });
    }
    return {
      content: response,
      suggestedViews: [{ viewId: 'finance', label: 'Open Finance' }],
    };
  }

  // 10. Study plan / exams / academics
  if (q.includes('study plan') || q.includes('exam') || q.includes('academic') || q.includes('attendance')) {
    let response = `### Academic & Study Roadmap\n\n`;
    response += `- **Overall Attendance**: ${snap.overallAttendancePct}%\n`;
    response += `- **Pending Assignments**: ${snap.pendingAssignments.length}\n`;
    response += `- **Upcoming Exams**: ${snap.upcomingExams.length}\n\n`;
    if (snap.upcomingExams.length > 0) {
      snap.upcomingExams.slice(0, 4).forEach((exam) => {
        const daysLeft = Math.max(1, Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000));
        const sub = state.academicSubjects.find((s) => s.id === exam.subjectId);
        response += `#### ${sub ? `${sub.code} ${sub.name}` : exam.title} (in ${daysLeft}d • ${exam.syllabusCoveragePercentage}% covered)\n`;
        response += `- **Days 1–${Math.max(1, Math.floor(daysLeft * 0.4))}**: Clear core concepts & lecture notes.\n`;
        response += `- **Days ${Math.floor(daysLeft * 0.4) + 1}–${Math.max(2, Math.floor(daysLeft * 0.8))}**: Practice assignments & past papers.\n`;
        response += `- **Final 48h**: Timed recall & weak-area review.\n\n`;
      });
    } else {
      response += `*No exams scheduled yet. Add exams in Academics to build an automated countdown study plan.*`;
    }
    return {
      content: response,
      suggestedViews: [{ viewId: 'academics', label: 'Open Academics' }],
    };
  }

  // 11. Gym / Fitness or Career
  if (q.includes('gym') || q.includes('workout') || q.includes('fitness')) {
    let response = `### Fitness & Conditioning Rhythm\n\n`;
    response += `- **Workouts This Week**: ${snap.workoutsThisWeek.length}\n`;
    response += `- **Total Sessions Logged**: ${state.workoutSessions.length}\n`;
    if (state.workoutSessions[0]) {
      const latest = state.workoutSessions[0];
      response += `- **Latest Session**: ${latest.title} (${latest.splitType}) on ${latest.date} — ${latest.durationMinutes} min\n`;
    }
    return {
      content: response,
      suggestedViews: [{ viewId: 'fitness', label: 'Open Fitness' }],
    };
  }

  if (q.includes('career') || q.includes('interview') || q.includes('job') || q.includes('skill')) {
    let response = `### Career & Portfolio Standing\n\n`;
    response += `- **Projects**: ${state.careerProjects.length} tracked\n`;
    response += `- **Applications**: ${snap.activeApplications.length} active (${snap.interviewApplications.length} in OA / Interview stage)\n`;
    if (state.careerSkills.length > 0) {
      response += `- **Core Skills**: ${state.careerSkills
        .slice(0, 5)
        .map((s) => `${s.name} (${s.proficiency}/${s.targetProficiency})`)
        .join(', ')}\n`;
    }
    return {
      content: response,
      suggestedViews: [{ viewId: 'career', label: 'Open Career' }],
    };
  }

  // Default calm overview
  return {
    content: `### RIT Workspace Rhythm\n\nEverything is connected to your live Life OS workspace:\n- **Productivity Index**: ${snap.productivityScore}%\n- **Tasks**: ${snap.pendingTasks.length} open (${snap.overdueTasks.length} overdue)\n- **Habits**: ${snap.habitsDoneToday}/${snap.habitsToday.length} today (${snap.monthlyConsistencyPct}% 30-day consistency)\n- **Goals**: ${state.goals.filter((g) => !g.isArchived).length} active\n\nTry *"Plan my day."*, *"What tasks are overdue?"*, *"Add a task to study DSA at 6 PM."*, or *"Give me an overview of my productivity."*`,
    suggestedViews: [
      { viewId: 'dashboard', label: 'Today View' },
      { viewId: 'tasks', label: 'Tasks' },
      { viewId: 'analytics', label: 'Analytics' },
    ],
  };
}
