import { toLocalDateString } from './dates';
import { isHabitScheduledOnDate } from '../store/useStore';
import type {
  AcademicAssignment,
  AcademicExam,
  AcademicSubject,
  EveningReview,
  FinanceTransaction,
  Goal,
  Habit,
  HabitEntry,
  LifestyleItem,
  Priority,
  Task,
  TimetableSlot,
  WorkoutSession,
} from '../types';

export interface UpcomingEventItem {
  id: string;
  title: string;
  date: string;
  domain: 'task' | 'assignment' | 'exam' | 'lifestyle';
  viewId: string;
  meta: string;
}

export interface DashboardViewModelInput {
  isDemoMode: boolean;
  todayStr: string;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  financeTransactions: FinanceTransaction[];
  academicSubjects: AcademicSubject[];
  academicAssignments: AcademicAssignment[];
  academicExams: AcademicExam[];
  timetableSlots: TimetableSlot[];
  workoutSessions: WorkoutSession[];
  eveningReviews: EveningReview[];
  lifestyleItems: LifestyleItem[];
}

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function addDays(baseDateStr: string, offsetDays: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + offsetDays);
  return toLocalDateString(dt);
}

function visibleOnly<T extends { isDemo?: boolean; deletedAt?: string | null }>(
  items: T[],
  isDemoMode: boolean
): T[] {
  return (items || []).filter((item) => {
    if (item.deletedAt) return false;
    if (!isDemoMode && item.isDemo === true) return false;
    return true;
  });
}

export function buildDashboardViewModel(input: DashboardViewModelInput) {
  const { isDemoMode, todayStr } = input;
  const tasks = visibleOnly(input.tasks, isDemoMode);
  const goals = visibleOnly(input.goals, isDemoMode);
  const habits = visibleOnly(input.habits, isDemoMode);
  const habitEntries = visibleOnly(input.habitEntries, isDemoMode);
  const financeTransactions = visibleOnly(input.financeTransactions, isDemoMode);
  const academicSubjects = visibleOnly(input.academicSubjects, isDemoMode);
  const academicAssignments = visibleOnly(input.academicAssignments, isDemoMode);
  const academicExams = visibleOnly(input.academicExams, isDemoMode);
  const timetableSlots = visibleOnly(input.timetableSlots, isDemoMode);
  const workoutSessions = visibleOnly(input.workoutSessions, isDemoMode);
  const eveningReviews = visibleOnly(input.eveningReviews, isDemoMode);
  const lifestyleItems = visibleOnly(input.lifestyleItems, isDemoMode);

  const todayTasks = tasks
    .filter((t) => !t.isCompleted && !t.isArchived && t.dueDate === todayStr)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  const overdueTasks = tasks
    .filter(
      (t) =>
        !t.isCompleted &&
        !t.isArchived &&
        (t.isOverdue || (t.dueDate && t.dueDate < todayStr))
    )
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  const completedTodayCount = tasks.filter(
    (t) => t.isCompleted && t.completedAt?.startsWith(todayStr)
  ).length;

  const habitsToday = habits.filter((h) => isHabitScheduledOnDate(h, todayStr));
  const habitsCompletedTodayCount = habitsToday.filter((h) =>
    habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed)
  ).length;

  const totalCadenceItems = todayTasks.length + completedTodayCount + habitsToday.length;
  const completedCadenceItems = completedTodayCount + habitsCompletedTodayCount;
  const dailyProgress =
    totalCadenceItems > 0 ? Math.round((completedCadenceItems / totalCadenceItems) * 100) : 0;

  const priorityGoals = goals
    .filter((g) => !g.isArchived && g.status !== 'completed')
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 3);

  const totalClasses = academicSubjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const attendedClasses = academicSubjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const attendanceAvg =
    academicSubjects.length === 0
      ? null
      : totalClasses > 0
      ? (attendedClasses / totalClasses) * 100
      : 100;

  const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayClasses = timetableSlots
    .filter((s) => s.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const academicAlertSubject = academicSubjects.find(
    (s) =>
      s.totalClasses > 0 &&
      (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
  );

  const monthlyExpenses = financeTransactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(todayStr.slice(0, 7)))
    .reduce((sum, t) => sum + t.amount, 0);

  const hasReviewedToday = eveningReviews.some((r) => r.date === todayStr);

  const horizonEnd = addDays(todayStr, 7);
  const upcomingEvents: UpcomingEventItem[] = [
    ...tasks
      .filter(
        (t) =>
          !t.isCompleted &&
          !t.isArchived &&
          t.dueDate &&
          t.dueDate > todayStr &&
          t.dueDate <= horizonEnd
      )
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.dueDate!,
        domain: 'task' as const,
        viewId: 'tasks',
        meta: `${t.priority} priority`,
      })),
    ...academicAssignments
      .filter((a) => !a.isSubmitted && a.dueDate >= todayStr && a.dueDate <= horizonEnd)
      .map((a) => ({
        id: `asg-${a.id}`,
        title: a.title,
        date: a.dueDate,
        domain: 'assignment' as const,
        viewId: 'academics',
        meta: 'Assignment due',
      })),
    ...academicExams
      .filter((e) => e.examDate >= todayStr && e.examDate <= horizonEnd)
      .map((e) => ({
        id: `exam-${e.id}`,
        title: e.title,
        date: e.examDate,
        domain: 'exam' as const,
        viewId: 'academics',
        meta: `Exam · ${e.syllabusCoveragePercentage}% syllabus ready`,
      })),
    ...lifestyleItems
      .filter((l) => l.status !== 'completed' && l.date && l.date >= todayStr && l.date <= horizonEnd)
      .map((l) => ({
        id: `life-${l.id}`,
        title: l.title,
        date: l.date!,
        domain: 'lifestyle' as const,
        viewId: 'lifestyle',
        meta: l.location ? `${l.category} · ${l.location}` : l.category,
      })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const isBrandNewUser =
    tasks.length === 0 &&
    goals.length === 0 &&
    habits.length === 0 &&
    academicSubjects.length === 0 &&
    financeTransactions.length === 0 &&
    workoutSessions.length === 0 &&
    lifestyleItems.length === 0;

  return {
    todayTasks,
    overdueTasks,
    completedTodayCount,
    habitsToday,
    habitsCompletedTodayCount,
    dailyProgress,
    priorityGoals,
    academicSubjects,
    attendanceAvg,
    todayClasses,
    academicAlertSubject,
    monthlyExpenses,
    workoutSessions,
    hasReviewedToday,
    upcomingEvents,
    lifestyleItems,
    isBrandNewUser,
  };
}
