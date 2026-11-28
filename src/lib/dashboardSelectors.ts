import type {
  AcademicAssignment,
  AcademicExam,
  AcademicSubject,
  AppSettings,
  FinanceBudget,
  FinanceTransaction,
  Goal,
  Habit,
  JobApplication,
  Priority,
  Task,
  TimetableSlot,
  WorkoutSession,
} from '../types';
import { formatCurrencyINR, getEffectiveDate, toLocalDateString } from './dates';

export type DashboardWidgetKey =
  | 'focusTimer'
  | 'todayTasks'
  | 'habits'
  | 'goals'
  | 'academics'
  | 'finance'
  | 'fitness';

export interface EffectiveTodayContext {
  todayStr: string;
  currentMonthStr: string;
  currentDayOfWeek: number; // 1 = Monday .. 7 = Sunday
  todayFormatted: string;
  sevenDaysLaterStr: string;
}

export interface UpcomingEventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: 'task' | 'assignment' | 'exam' | 'career' | 'goal';
  badgeLabel: string;
  subtitle: string;
  targetView: string;
  isToday: boolean;
}

export interface DashboardFinanceSummary {
  monthlyExpenses: number;
  monthlyIncome: number;
  netCashflow: number;
  totalBudgetLimit: number;
  budgetUtilizationPct: number | null;
  monthTransactionCount: number;
  totalTransactionCount: number;
}

export interface DashboardAcademicSummary {
  todayClasses: TimetableSlot[];
  attendanceAvg: number | null;
  atRiskSubject: AcademicSubject | undefined;
  pendingAssignmentsCount: number;
  overdueAssignmentsCount: number;
  upcomingExamsCount: number;
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Excludes soft-deleted rows and isolates demo records when Demo Mode is off.
 */
export function filterUserRecords<
  T extends { isDemo?: boolean; deletedAt?: string | null }
>(items: T[], isDemoMode?: boolean): T[] {
  return items.filter((item) => {
    if (item.deletedAt) return false;
    if (!isDemoMode && item.isDemo === true) return false;
    return true;
  });
}

/**
 * Derives logical today markers using the user's configured dayStartHour cutoff.
 */
export function getEffectiveTodayContext(
  dayStartHour: number = 4,
  now: Date = new Date()
): EffectiveTodayContext {
  const effective = getEffectiveDate(now, dayStartHour);
  const todayStr = toLocalDateString(effective);
  const currentMonthStr = todayStr.slice(0, 7);
  const currentDayOfWeek = effective.getDay() === 0 ? 7 : effective.getDay();
  const todayFormatted = effective.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const sevenDaysOut = new Date(effective.getTime() + 7 * 86400000);
  const sevenDaysLaterStr = toLocalDateString(sevenDaysOut);

  return {
    todayStr,
    currentMonthStr,
    currentDayOfWeek,
    todayFormatted,
    sevenDaysLaterStr,
  };
}

/**
 * Resolves widget visibility from explicit dashboardWidgets overrides first,
 * then selectedLifeAreas from onboarding, defaulting to visible.
 */
export function resolveDashboardWidgets(
  settings: AppSettings
): Record<DashboardWidgetKey, boolean> {
  const overrides = settings.dashboardWidgets || {};
  const areas = settings.selectedLifeAreas;
  const hasAreaPrefs = Array.isArray(areas) && areas.length > 0;

  const resolve = (key: DashboardWidgetKey, areaId?: string): boolean => {
    const explicit = overrides[key];
    if (typeof explicit === 'boolean') return explicit;
    if (areaId && hasAreaPrefs) return areas.includes(areaId);
    return true;
  };

  return {
    focusTimer: resolve('focusTimer'),
    todayTasks: resolve('todayTasks', 'tasks'),
    habits: resolve('habits', 'habits'),
    goals: resolve('goals', 'goals'),
    academics: resolve('academics', 'academics'),
    finance: resolve('finance', 'finance'),
    fitness: resolve('fitness', 'fitness'),
  };
}

export function formatDashboardCurrency(
  amount: number,
  currencySymbol?: string
): string {
  if (!currencySymbol || currencySymbol === '₹') {
    return formatCurrencyINR(amount);
  }
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const sign = safeAmount < 0 ? '-' : '';
  return `${sign}${currencySymbol}${Math.abs(safeAmount).toLocaleString('en-IN')}`;
}

export function computeDashboardFinanceSummary(
  transactions: FinanceTransaction[],
  budgets: FinanceBudget[],
  currentMonthStr: string
): DashboardFinanceSummary {
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonthStr));
  let monthlyExpenses = 0;
  let monthlyIncome = 0;

  for (const tx of monthTxs) {
    if (tx.type === 'expense') monthlyExpenses += tx.amount;
    else if (tx.type === 'income') monthlyIncome += tx.amount;
  }

  const monthBudgets = budgets.filter((b) => b.month === currentMonthStr);
  const totalBudgetLimit = monthBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetUtilizationPct =
    totalBudgetLimit > 0
      ? Math.round((monthlyExpenses / totalBudgetLimit) * 100)
      : null;

  return {
    monthlyExpenses,
    monthlyIncome,
    netCashflow: monthlyIncome - monthlyExpenses,
    totalBudgetLimit,
    budgetUtilizationPct,
    monthTransactionCount: monthTxs.length,
    totalTransactionCount: transactions.length,
  };
}

export function computeDashboardAcademicSummary(
  subjects: AcademicSubject[],
  assignments: AcademicAssignment[],
  exams: AcademicExam[],
  timetableSlots: TimetableSlot[],
  currentDayOfWeek: number,
  todayStr: string,
  sevenDaysLaterStr: string
): DashboardAcademicSummary {
  const todayClasses = timetableSlots
    .filter((s) => s.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let attendanceAvg: number | null = null;
  if (subjects.length > 0) {
    const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
    const attended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    attendanceAvg = totalClasses > 0 ? (attended / totalClasses) * 100 : null;
  }

  const atRiskSubject = subjects.find(
    (s) =>
      s.totalClasses > 0 &&
      (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
  );

  const pendingAssignments = assignments.filter((a) => !a.isSubmitted);
  const overdueAssignmentsCount = pendingAssignments.filter(
    (a) => a.dueDate && a.dueDate < todayStr
  ).length;
  const upcomingExamsCount = exams.filter(
    (e) => e.examDate >= todayStr && e.examDate <= sevenDaysLaterStr
  ).length;

  return {
    todayClasses,
    attendanceAvg,
    atRiskSubject,
    pendingAssignmentsCount: pendingAssignments.length,
    overdueAssignmentsCount,
    upcomingExamsCount,
  };
}

export function buildUpcomingEvents(params: {
  tasks: Task[];
  academicAssignments: AcademicAssignment[];
  academicExams: AcademicExam[];
  academicSubjects: AcademicSubject[];
  careerApplications: JobApplication[];
  goals: Goal[];
  todayStr: string;
  sevenDaysLaterStr: string;
}): UpcomingEventItem[] {
  const {
    tasks,
    academicAssignments,
    academicExams,
    academicSubjects,
    careerApplications,
    goals,
    todayStr,
    sevenDaysLaterStr,
  } = params;

  const subjectById = new Map(academicSubjects.map((s) => [s.id, s]));
  const events: UpcomingEventItem[] = [];

  for (const task of tasks) {
    if (task.isCompleted || task.isArchived || !task.dueDate) continue;
    if (task.dueDate > todayStr && task.dueDate <= sevenDaysLaterStr) {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        time: task.dueTime,
        kind: 'task',
        badgeLabel: 'Task',
        subtitle: `${task.category || 'General'}${task.dueTime ? ` at ${task.dueTime}` : ''}`,
        targetView: 'tasks',
        isToday: false,
      });
    }
  }

  for (const asg of academicAssignments) {
    if (asg.isSubmitted || !asg.dueDate) continue;
    if (asg.dueDate >= todayStr && asg.dueDate <= sevenDaysLaterStr) {
      const sub = subjectById.get(asg.subjectId);
      events.push({
        id: `asg-${asg.id}`,
        title: asg.title,
        date: asg.dueDate,
        kind: 'assignment',
        badgeLabel: 'Assignment',
        subtitle: sub ? `${sub.code || sub.name}` : 'Academics',
        targetView: 'academics',
        isToday: asg.dueDate === todayStr,
      });
    }
  }

  for (const exam of academicExams) {
    if (!exam.examDate) continue;
    if (exam.examDate >= todayStr && exam.examDate <= sevenDaysLaterStr) {
      const sub = subjectById.get(exam.subjectId);
      events.push({
        id: `exam-${exam.id}`,
        title: exam.title,
        date: exam.examDate,
        kind: 'exam',
        badgeLabel: 'Exam',
        subtitle: sub ? `${sub.code || sub.name}` : 'Academics',
        targetView: 'academics',
        isToday: exam.examDate === todayStr,
      });
    }
  }

  for (const app of careerApplications) {
    if (app.stage === 'rejected' || !app.nextFollowUpDate) continue;
    if (app.nextFollowUpDate >= todayStr && app.nextFollowUpDate <= sevenDaysLaterStr) {
      events.push({
        id: `career-${app.id}`,
        title: `${app.company}: ${app.role}`,
        date: app.nextFollowUpDate,
        kind: 'career',
        badgeLabel: 'Follow-up',
        subtitle: `Stage: ${app.stage}`,
        targetView: 'career',
        isToday: app.nextFollowUpDate === todayStr,
      });
    }
  }

  for (const goal of goals) {
    if (goal.isArchived || goal.status === 'completed' || goal.progress >= 100 || !goal.targetDate) {
      continue;
    }
    if (goal.targetDate >= todayStr && goal.targetDate <= sevenDaysLaterStr) {
      events.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        date: goal.targetDate,
        kind: 'goal',
        badgeLabel: 'Goal Target',
        subtitle: `${goal.progress}% complete`,
        targetView: 'goals',
        isToday: goal.targetDate === todayStr,
      });
    }
  }

  return events.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return (a.time || '99:99').localeCompare(b.time || '99:99');
  });
}

export function getLatestWorkoutSession(
  sessions: WorkoutSession[]
): WorkoutSession | null {
  if (sessions.length === 0) return null;
  const sorted = [...sessions].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
  return sorted[0];
}

export function formatShortEventDate(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return 'Today';
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getGoalProgressLabel(goal: Goal): string {
  if (
    goal.measurementType === 'numeric' &&
    typeof goal.targetValue === 'number' &&
    goal.targetValue > 0
  ) {
    const cur = goal.currentValue ?? 0;
    return `${cur.toLocaleString('en-IN')} / ${goal.targetValue.toLocaleString('en-IN')}${goal.unit ? ` ${goal.unit}` : ''}`;
  }
  if (goal.milestones.length > 0) {
    const completed = goal.milestones.filter((m) => m.isCompleted).length;
    return `${completed}/${goal.milestones.length} milestones`;
  }
  return goal.type.replace('-', ' ');
}
