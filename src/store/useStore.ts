import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LifeOSRepository } from '../db/repository';
import { todayLocal, toLocalDateString } from '../lib/dates';
import type {
  Goal,
  Task,
  Habit,
  HabitEntry,
  FinanceTransaction,
  FinanceBudget,
  SavingsGoal,
  WorkoutSession,
  ExerciseItem,
  BodyMetric,
  FitnessGoal,
  AcademicSemester,
  AcademicSubject,
  AcademicAssignment,
  AcademicExam,
  TimetableSlot,
  CareerGoal,
  SkillItem,
  CareerProject,
  JobApplication,
  CareerDocument,
  EveningReview,
  ObsidianNote,
  AppSettings,
  DesignVariant,
  AssistantMessage,
  ReminderSettings,
  ToastItem,
  Priority,
  SubTask,
  TaskStatus,
  TaskRecurrence,
  TaskRecurrenceConfig,
  LifeArea,
  GoalStatus,
  GoalMeasurementType,
  Milestone,
  GoalActivityEvent,
  HabitType,
  HabitScheduleType,
  HabitRoutine,
  UserWorkspace,
} from '../types';

interface StoreState {
  isLoaded: boolean;
  activeView: string;

  // 1. Goals
  goals: Goal[];
  addGoal: (goal: Partial<Goal> & { title: string; priority: Priority }) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'isCompleted'>) => Promise<void>;
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  reorderMilestones: (goalId: string, milestoneIds: string[]) => Promise<void>;
  setGoalStatus: (goalId: string, status: GoalStatus, isOverride?: boolean) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  unarchiveGoal: (goalId: string) => Promise<void>;
  updateGoalProgress: (goalId: string, currentValueOrPercent: number) => Promise<void>;
  linkTaskToGoal: (taskId: string, goalId: string, milestoneId?: string) => Promise<void>;
  unlinkTaskFromGoal: (taskId: string) => Promise<void>;

  // 2. Tasks
  tasks: Task[];
  activeFocusTaskId?: string;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'isOverdue'> & Partial<Pick<Task, 'category' | 'status' | 'isCompleted' | 'isOverdue' | 'subtasks'>>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<Task>;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  quickAddTask: (title: string, priority?: Priority, dueDate?: string, category?: string, estimatedDuration?: number, tags?: string[]) => Promise<Task>;
  startTaskFocusSession: (taskId: string) => void;
  recordTaskFocusDuration: (taskId: string, minutes: number) => Promise<void>;
  markOverdueTasks: () => Promise<void>;

  // 3. Habits (Advanced Habit Tracking 2.0)
  habits: Habit[];
  habitEntries: HabitEntry[];
  habitRoutines: HabitRoutine[];
  addHabit: (habit: Partial<Habit> & { name: string; category?: string }) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitEntry: (habitId: string, date: string) => Promise<void>;
  recordHabitProgress: (habitId: string, date: string, value: number, note?: string, status?: 'completed' | 'skipped' | 'partial') => Promise<void>;
  skipHabitEntry: (habitId: string, date: string, note?: string) => Promise<void>;
  addRoutine: (routine: Omit<HabitRoutine, 'id'>) => Promise<HabitRoutine>;
  updateRoutine: (id: string, updates: Partial<HabitRoutine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  reorderRoutineHabits: (routineId: string, habitIds: string[]) => Promise<void>;

  // 4. Finance
  financeTransactions: FinanceTransaction[];
  financeBudgets: FinanceBudget[];
  savingsGoals: SavingsGoal[];
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (b: Omit<FinanceBudget, 'id'> & { id?: string }) => Promise<void>;
  addSavingsGoal: (sg: Omit<SavingsGoal, 'id' | 'createdAt' | 'isReached'>) => Promise<void>;
  depositSavings: (id: string, amount: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // 5. Fitness
  exercises: ExerciseItem[];
  workoutSessions: WorkoutSession[];
  bodyMetrics: BodyMetric[];
  fitnessGoals: FitnessGoal[];
  addWorkoutSession: (ws: Omit<WorkoutSession, 'id' | 'createdAt'>) => Promise<void>;
  deleteWorkoutSession: (id: string) => Promise<void>;
  addExercise: (ex: Omit<ExerciseItem, 'id'>) => Promise<void>;
  addBodyMetric: (bm: Omit<BodyMetric, 'id'>) => Promise<void>;
  deleteBodyMetric: (id: string) => Promise<void>;
  addFitnessGoal: (fg: Omit<FitnessGoal, 'id' | 'isAchieved'>) => Promise<void>;
  toggleFitnessGoal: (id: string) => Promise<void>;

  // 6. Academics
  academicSemesters: AcademicSemester[];
  academicSubjects: AcademicSubject[];
  academicAssignments: AcademicAssignment[];
  academicExams: AcademicExam[];
  timetableSlots: TimetableSlot[];
  addSemester: (sem: Omit<AcademicSemester, 'id'>) => Promise<void>;
  addSubject: (sub: Omit<AcademicSubject, 'id' | 'totalClasses' | 'attendedClasses'>) => Promise<void>;
  updateSubjectAttendance: (id: string, attendedDelta: number, totalDelta: number) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addAssignment: (asg: Omit<AcademicAssignment, 'id' | 'isSubmitted'>) => Promise<void>;
  toggleAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addExam: (exam: Omit<AcademicExam, 'id'>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => Promise<void>;
  deleteTimetableSlot: (id: string) => Promise<void>;

  // 7. Career
  careerGoals: CareerGoal[];
  careerSkills: SkillItem[];
  careerProjects: CareerProject[];
  careerApplications: JobApplication[];
  careerDocuments: CareerDocument[];
  addCareerGoal: (cg: Omit<CareerGoal, 'id'>) => Promise<void>;
  toggleCareerMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  updateSkillProficiency: (id: string, proficiency: number) => Promise<void>;
  addCareerSkill: (skill: Omit<SkillItem, 'id'>) => Promise<void>;
  addCareerProject: (proj: Omit<CareerProject, 'id'>) => Promise<void>;
  deleteCareerProject: (id: string) => Promise<void>;
  addJobApplication: (app: Omit<JobApplication, 'id'>) => Promise<void>;
  updateJobStage: (id: string, stage: JobApplication['stage']) => Promise<void>;
  deleteJobApplication: (id: string) => Promise<void>;

  // 8. Evening Review
  eveningReviews: EveningReview[];
  saveEveningReview: (review: Omit<EveningReview, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;

  // 9. Obsidian Notes
  obsidianNotes: ObsidianNote[];
  saveNote: (note: Omit<ObsidianNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // 10. AI Assistant
  assistantMessages: AssistantMessage[];
  addAssistantMessage: (msg: Omit<AssistantMessage, 'id' | 'timestamp'>) => void;
  clearAssistantChat: () => void;

  // 11. Settings & Nav
  settings: AppSettings;
  workspaces: UserWorkspace[];
  activeWorkspaceId: string;
  createWorkspace: (name: string) => Promise<UserWorkspace>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  loadDemoData: () => Promise<void>;
  purgeSeedData: () => Promise<void>;
  designVariant: DesignVariant;
  comparisonMode: 'single' | 'split';
  setDesignVariant: (variant: DesignVariant) => Promise<void>;
  setComparisonMode: (mode: 'single' | 'split') => void;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateReminderSettings: (updates: Partial<ReminderSettings>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
  setActiveView: (view: string) => void;
  initializeFromDB: () => Promise<void>;
  initError: string | null;
  setInitError: (err: string | null) => void;

  // 12. Micro-Interactions & Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  // 13. Navigation & Command Center 2.0
  pinnedViews: string[];
  recentViews: string[];
  togglePinView: (viewId: string) => void;

  // 14. Onboarding & Contextual Guidance 2.0
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  dismissTip: (tipId: string) => Promise<void>;
  resetDismissedTips: () => Promise<void>;
  toggleDemoMode: (enable: boolean) => Promise<void>;
  completeOnboarding: (data: {
    userName: string;
    selectedLifeAreas: string[];
    theme: 'dark' | 'light';
    weekStartDay: 'monday' | 'sunday';
    defaultFocusDuration: number;
    userAvatar?: string;
    userGreeting?: string;
    initialGoals?: Array<{ title: string; category: string; priority: Priority; targetDate?: string }>;
    initialHabits?: Array<{ name: string; category: string; frequency: string }>;
  }) => Promise<void>;
  resetToFreshSlate: () => Promise<void>;
}

export function computeNextDueDate(
  currentDueDate: string | undefined,
  recurrence: TaskRecurrence,
  config?: TaskRecurrenceConfig
): string {
  const baseDate = currentDueDate ? new Date(currentDueDate + 'T12:00:00') : new Date();
  const next = new Date(baseDate.getTime());

  const recType = config?.type || recurrence;
  const interval = config?.interval && config.interval > 0 ? config.interval : 1;

  if (recType === 'daily') {
    next.setDate(next.getDate() + interval);
  } else if (recType === 'weekdays') {
    do {
      next.setDate(next.getDate() + 1);
    } while (next.getDay() === 0 || next.getDay() === 6);
  } else if (recType === 'weekly') {
    next.setDate(next.getDate() + 7 * interval);
  } else if (recType === 'monthly') {
    next.setMonth(next.getMonth() + interval);
  } else if (recType === 'yearly') {
    next.setFullYear(next.getFullYear() + interval);
  } else if (recType === 'custom') {
    if (config?.weekdays && config.weekdays.length > 0) {
      let daysChecked = 0;
      do {
        next.setDate(next.getDate() + 1);
        daysChecked++;
      } while (!config.weekdays.includes(next.getDay()) && daysChecked < 14);
    } else {
      next.setDate(next.getDate() + interval);
    }
  } else {
    next.setDate(next.getDate() + 1);
  }

  return toLocalDateString(next);
}

// ---------------------------------------------------------------------------
// GOAL PROGRESS & LIFECYCLE ENGINE HELPERS
// ---------------------------------------------------------------------------
export function computeGoalProgress(
  goal: Partial<Goal>,
  relatedTasks: Task[] = [],
  habitEntries: HabitEntry[] = []
): number {
  if (goal.progressCalculationMode === 'manual' && typeof goal.manualProgress === 'number') {
    return Math.min(100, Math.max(0, Math.round(goal.manualProgress)));
  }

  const measurementType =
    goal.measurementType ||
    (goal.milestones && goal.milestones.length > 0 ? 'milestone-based' : 'numeric');

  if (measurementType === 'numeric') {
    if (typeof goal.targetValue === 'number' && goal.targetValue > 0) {
      const current = goal.currentValue || 0;
      return Math.min(100, Math.max(0, Math.round((current / goal.targetValue) * 100)));
    }
  }

  if (measurementType === 'milestone-based') {
    if (goal.milestones && goal.milestones.length > 0) {
      const completed = goal.milestones.filter((m) => m.isCompleted).length;
      return Math.round((completed / goal.milestones.length) * 100);
    }
  }

  if (measurementType === 'completion') {
    if (goal.status === 'completed') return 100;
    if (relatedTasks.length > 0) {
      const completedTasks = relatedTasks.filter((t) => t.isCompleted).length;
      return Math.round((completedTasks / relatedTasks.length) * 100);
    }
    if (goal.milestones && goal.milestones.length > 0) {
      const completed = goal.milestones.filter((m) => m.isCompleted).length;
      return Math.round((completed / goal.milestones.length) * 100);
    }
  }

  if (measurementType === 'habit-based') {
    if (goal.linkedHabitIds && goal.linkedHabitIds.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startStr = toLocalDateString(thirtyDaysAgo);

      const relevantEntries = habitEntries.filter(
        (e) => goal.linkedHabitIds!.includes(e.habitId) && e.date >= startStr
      );
      if (relevantEntries.length > 0) {
        const completed = relevantEntries.filter((e) => e.completed).length;
        return Math.round((completed / relevantEntries.length) * 100);
      }
    }
  }

  return Math.min(100, Math.max(0, Math.round(goal.progress || 0)));
}

export function computeGoalStatus(
  goal: Partial<Goal>,
  progress: number
): GoalStatus {
  if (goal.status === 'paused' || goal.status === 'abandoned') {
    return goal.status;
  }
  if (goal.statusOverride && goal.status) {
    return goal.status;
  }

  if (progress >= 100) {
    return 'completed';
  }

  const today = todayLocal();

  if (goal.targetDate && goal.targetDate < today && progress < 100) {
    return 'at-risk';
  }

  if (goal.milestones && goal.milestones.some((m) => !m.isCompleted && m.dueDate && m.dueDate < today)) {
    return 'at-risk';
  }

  if (goal.startDate && goal.targetDate && goal.startDate < goal.targetDate) {
    const startMs = new Date(goal.startDate).getTime();
    const endMs = new Date(goal.targetDate).getTime();
    const nowMs = Date.now();
    const totalDuration = endMs - startMs;
    const elapsed = nowMs - startMs;

    if (totalDuration > 0 && elapsed > 0) {
      const elapsedRatio = elapsed / totalDuration;
      if (elapsedRatio > 0.5 && progress < 25) {
        return 'at-risk';
      }
      if (elapsedRatio > 0.75 && progress < 50) {
        return 'at-risk';
      }
    }
  }

  if (progress > 0) {
    return 'on-track';
  }

  return 'not-started';
}

export function createActivityEvent(
  goalId: string,
  type: GoalActivityEvent['type'],
  description: string,
  metadata?: Record<string, any>
): GoalActivityEvent {
  return {
    id: uuidv4(),
    goalId,
    type,
    description,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

// ----------------------------------------------------
// HABIT 2.0 HELPERS & SCHEDULING SYSTEM
// ----------------------------------------------------
export const DEFAULT_HABIT_ROUTINES: HabitRoutine[] = [
  {
    id: 'routine-morning',
    title: 'Morning Ignition',
    description: 'High-energy priming routine to conquer the morning.',
    timeOfDay: 'morning',
    habitIds: [],
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-afternoon',
    title: 'Deep Work & Focus',
    description: 'Midday focus, hydration, and mental stamina habits.',
    timeOfDay: 'afternoon',
    habitIds: [],
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'routine-evening',
    title: 'Evening Wind-Down',
    description: 'Decompression, screen disconnect, and restorative reflection.',
    timeOfDay: 'evening',
    habitIds: [],
    order: 2,
    createdAt: new Date().toISOString(),
  },
];

export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.startDate && dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfMonth = dateObj.getDate();

  const scheduleType = habit.scheduleType || 'daily';

  if (scheduleType === 'daily') {
    if (habit.targetDays && habit.targetDays.length > 0 && !habit.targetDays.includes(dayOfWeek)) {
      return false;
    }
    return true;
  }

  if (scheduleType === 'weekdays') {
    const days = habit.scheduleDays && habit.scheduleDays.length > 0 ? habit.scheduleDays : (habit.targetDays || [1, 2, 3, 4, 5]);
    return days.includes(dayOfWeek);
  }

  if (scheduleType === 'monthly_dates') {
    const dates = habit.monthlyDates && habit.monthlyDates.length > 0 ? habit.monthlyDates : [1];
    return dates.includes(dayOfMonth);
  }

  if (scheduleType === 'custom_interval') {
    const interval = Math.max(1, habit.customIntervalDays || 2);
    const startStr = habit.startDate || habit.createdAt?.split('T')[0] || dateStr;
    const startObj = new Date(startStr + 'T00:00:00');
    const diffDays = Math.round((dateObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % interval === 0;
  }

  if (scheduleType === 'weekly_target' || scheduleType === 'monthly_target') {
    return true;
  }

  if (habit.targetDays && habit.targetDays.length > 0) {
    return habit.targetDays.includes(dayOfWeek);
  }

  return true;
}

export function computeHabitStreak(
  habit: Habit,
  entries: HabitEntry[]
): { streak: number; longestStreak: number; totalCompletions: number } {
  const habitEntries = entries.filter((e) => e.habitId === habit.id);
  const entryMap = new Map<string, HabitEntry>();
  habitEntries.forEach((e) => entryMap.set(e.date, e));

  const totalCompletions = habitEntries.filter(
    (e) => e.completed || e.status === 'completed'
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute current streak walking backward from today
  let currentStreak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = toLocalDateString(checkDate);
    const isScheduled = isHabitScheduledOnDate(habit, dateStr);

    if (isScheduled) {
      const entry = entryMap.get(dateStr);
      const isCompleted = entry && (entry.completed || entry.status === 'completed');
      const isSkipped = entry && entry.status === 'skipped';

      if (i === 0) {
        if (isCompleted) {
          currentStreak++;
        } else if (isSkipped) {
          // Preserved without incrementing
        } else {
          // Today not completed yet - streak from yesterday remains alive
        }
      } else {
        if (isCompleted) {
          currentStreak++;
        } else if (isSkipped) {
          // Preserved without incrementing
        } else {
          // Missed scheduled day -> streak broken
          break;
        }
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Compute longest streak
  let longest = habit.longestStreak || 0;
  let runningStreak = 0;
  const scanDate = new Date(today);
  scanDate.setDate(scanDate.getDate() - 365);

  for (let d = 0; d <= 365; d++) {
    const dStr = toLocalDateString(scanDate);
    const isScheduled = isHabitScheduledOnDate(habit, dStr);

    if (isScheduled) {
      const entry = entryMap.get(dStr);
      const isCompleted = entry && (entry.completed || entry.status === 'completed');
      const isSkipped = entry && entry.status === 'skipped';

      if (isCompleted) {
        runningStreak++;
        if (runningStreak > longest) longest = runningStreak;
      } else if (isSkipped) {
        // preserve
      } else {
        runningStreak = 0;
      }
    }

    scanDate.setDate(scanDate.getDate() + 1);
  }

  longest = Math.max(longest, currentStreak);

  return {
    streak: currentStreak,
    longestStreak: longest,
    totalCompletions,
  };
}

export function computeHabitConsistency(
  habit: Habit,
  entries: HabitEntry[],
  days: number = 30
): { rate: number; scheduledCount: number; completedCount: number } {
  const habitEntries = entries.filter((e) => e.habitId === habit.id);
  const entryMap = new Map<string, HabitEntry>();
  habitEntries.forEach((e) => entryMap.set(e.date, e));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let scheduledCount = 0;
  let completedCount = 0;

  for (let i = 0; i < days; i++) {
    const cur = new Date(today);
    cur.setDate(cur.getDate() - i);
    const dateStr = toLocalDateString(cur);

    if (isHabitScheduledOnDate(habit, dateStr)) {
      scheduledCount++;
      const entry = entryMap.get(dateStr);
      if (entry && (entry.completed || entry.status === 'completed')) {
        completedCount++;
      }
    }
  }

  const rate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 100;
  return { rate, scheduledCount, completedCount };
}

export const useStore = create<StoreState>((set, get) => ({
  isLoaded: false,
  activeView: 'dashboard',
  designVariant: 'agent',
  comparisonMode: 'single',
  pinnedViews: (() => {
    try {
      const saved = localStorage.getItem('lifeos_pinned_views');
      return saved ? JSON.parse(saved) : ['tasks', 'habits', 'finance'];
    } catch {
      return ['tasks', 'habits', 'finance'];
    }
  })(),
  recentViews: (() => {
    try {
      const saved = localStorage.getItem('lifeos_recent_views');
      return saved ? JSON.parse(saved) : ['dashboard'];
    } catch {
      return ['dashboard'];
    }
  })(),

  goals: [],
  tasks: [],
  habits: [],
  habitEntries: [],
  habitRoutines: (() => {
    try {
      const saved = localStorage.getItem('lifeos_habit_routines');
      return saved ? JSON.parse(saved) : DEFAULT_HABIT_ROUTINES;
    } catch {
      return DEFAULT_HABIT_ROUTINES;
    }
  })(),
  financeTransactions: [],
  financeBudgets: [],
  savingsGoals: [],
  exercises: [],
  workoutSessions: [],
  bodyMetrics: [],
  fitnessGoals: [],
  academicSemesters: [],
  academicSubjects: [],
  academicAssignments: [],
  academicExams: [],
  timetableSlots: [],
  careerGoals: [],
  careerSkills: [],
  careerProjects: [],
  careerApplications: [],
  careerDocuments: [],
  eveningReviews: [],
  obsidianNotes: [],
  assistantMessages: [
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'Greetings! I am Astra, your LIFE OS AI copilot. I analyze your tasks, goals, habits, finances, workouts, and academics in real-time. Ask me to plan your day, audit your spending, or review your priorities.',
      timestamp: new Date().toISOString(),
    },
  ],
  isOnboardingOpen: false,
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),

  workspaces: [
    {
      id: 'workspace-default',
      name: 'Personal Space',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  activeWorkspaceId: 'workspace-default',

  settings: {
    theme: 'dark',
    userName: '',
    currencySymbol: '$',
    reminder: {
      enabled: false,
      time: '21:30',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    onboardingCompleted: false,
    selectedLifeAreas: ['goals', 'tasks', 'habits', 'finance', 'fitness', 'academics', 'career'],
    weekStartDay: 'monday',
    defaultFocusDuration: 25,
    dismissedTips: [],
    isDemoMode: false,
    activeWorkspaceId: 'workspace-default',
    workspaces: [
      {
        id: 'workspace-default',
        name: 'Personal Space',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },

  initError: null,
  setInitError: (err) => set({ initError: err }),

  initializeFromDB: async () => {
    try {
      const data = await LifeOSRepository.initialize();

      // Attach habitEntries to habit objects and recalculate streak & total completions
      const habitsWithEntries = data.habits.map((h) => {
        const hEntries = data.habitEntries.filter((e) => e.habitId === h.id);
        const streakInfo = computeHabitStreak(h, hEntries);
        return {
          ...h,
          streak: streakInfo.streak,
          longestStreak: Math.max(h.longestStreak || 0, streakInfo.longestStreak),
          totalCompletions: streakInfo.totalCompletions,
          entries: hEntries,
        };
      });

      const loadedVariant = (data.settings?.designVariant as DesignVariant) || 'agent';

      // Check onboarding status
      const hasCompleted =
        data.settings?.onboardingCompleted ??
        (localStorage.getItem('lifeos_onboarding_completed') === 'true');
      const shouldOpenOnboarding = !hasCompleted;

      const loadedWorkspaces = data.settings?.workspaces?.length
        ? data.settings.workspaces
        : [
            {
              id: 'workspace-default',
              name: 'Personal Space',
              isDefault: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
      const activeWorkspaceId = data.settings?.activeWorkspaceId || 'workspace-default';

      set({
        ...data,
        habits: habitsWithEntries,
        workspaces: loadedWorkspaces,
        activeWorkspaceId,
        designVariant: loadedVariant,
        isLoaded: true,
        initError: null,
        isOnboardingOpen: shouldOpenOnboarding,
      });
      document.documentElement.setAttribute('data-variant', loadedVariant);
      get().markOverdueTasks();

      // Request persistent storage on first run with one-time notice
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persisted().then((isPersisted) => {
          if (!isPersisted) {
            navigator.storage.persist().then((granted) => {
              if (granted && !localStorage.getItem('lifeos_persist_notified')) {
                get().addToast({
                  type: 'success',
                  title: 'Persistent Storage Granted',
                  message: 'Your browser has granted permanent local storage for LIFE OS records.',
                });
                localStorage.setItem('lifeos_persist_notified', 'true');
              }
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[LifeOS Store] Failed to initialize from IndexedDB:', err);
      const errMsg = err instanceof Error ? err.message : 'Database initialization failed';
      set({ isLoaded: true, initError: errMsg });
      get().addToast({
        type: 'error',
        title: 'Database Load Error',
        message: 'Could not load your local records from IndexedDB.',
      });
    }
  },

  // ----------------------------------------------------
  // GOALS (Goals 2.0 Engine)
  // ----------------------------------------------------
  addGoal: async (goalData) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    const initialMilestones: Milestone[] = (goalData.milestones || []).map((m, idx) => ({
      ...m,
      id: m.id || uuidv4(),
      order: m.order ?? idx,
      isCompleted: m.isCompleted ?? false,
    }));

    const partialGoal: Partial<Goal> = {
      ...goalData,
      id,
      milestones: initialMilestones,
    };

    const initialProgress = computeGoalProgress(partialGoal, [], get().habitEntries);
    const initialStatus = goalData.status || computeGoalStatus(partialGoal, initialProgress);

    const initialActivity: GoalActivityEvent = createActivityEvent(
      id,
      'created',
      `Goal "${goalData.title}" established.`
    );

    const newGoal: Goal = {
      id,
      title: goalData.title,
      description: goalData.description || '',
      priority: goalData.priority,
      type: goalData.type || 'short-term',
      category: goalData.category || 'General',
      lifeArea: goalData.lifeArea || 'personal',
      startDate: goalData.startDate,
      targetDate: goalData.targetDate,
      status: initialStatus,
      statusOverride: goalData.statusOverride ?? false,
      measurementType:
        goalData.measurementType ||
        (initialMilestones.length > 0 ? 'milestone-based' : 'numeric'),
      targetValue: goalData.targetValue,
      currentValue: goalData.currentValue ?? 0,
      unit: goalData.unit,
      progress: initialProgress,
      progressCalculationMode: goalData.progressCalculationMode || 'automatic',
      manualProgress: goalData.manualProgress,
      isArchived: false,
      milestones: initialMilestones,
      linkedHabitIds: goalData.linkedHabitIds || [],
      coverImage: goalData.coverImage,
      tags: goalData.tags || [],
      notes: goalData.notes,
      whyItMatters: goalData.whyItMatters,
      desiredOutcome: goalData.desiredOutcome,
      nextAction: goalData.nextAction,
      obstacles: goalData.obstacles,
      activityHistory: [initialActivity],
      createdAt: now,
      updatedAt: now,
    };

    set((s) => ({ goals: [newGoal, ...s.goals] }));
    try {
      await LifeOSRepository.saveGoal(newGoal);
    } catch (err) {
      set((s) => ({ goals: s.goals.filter((g) => g.id !== newGoal.id) }));
      get().addToast({
        type: 'error',
        title: 'Goal Save Failed',
        message: 'Could not write goal to local database. Changes rolled back.',
      });
      throw err;
    }
    return newGoal;
  },

  updateGoal: async (id, updates) => {
    const now = new Date().toISOString();
    let updatedGoal: Goal | undefined;
    const currentGoal = get().goals.find((g) => g.id === id);
    if (!currentGoal) return;

    const newEvents: GoalActivityEvent[] = [];
    if (updates.targetDate && updates.targetDate !== currentGoal.targetDate) {
      newEvents.push(createActivityEvent(id, 'deadline_changed', `Deadline moved to ${updates.targetDate}`));
    }
    if (updates.status && updates.status !== currentGoal.status) {
      newEvents.push(createActivityEvent(id, 'status_changed', `Status transitioned to ${updates.status}`));
    }
    if (typeof updates.targetValue === 'number' && updates.targetValue !== currentGoal.targetValue) {
      newEvents.push(createActivityEvent(id, 'target_changed', `Target value updated to ${updates.targetValue} ${currentGoal.unit || ''}`));
    }
    if (typeof updates.currentValue === 'number' && updates.currentValue !== currentGoal.currentValue) {
      newEvents.push(createActivityEvent(id, 'progress_updated', `Current value progressed to ${updates.currentValue} ${currentGoal.unit || ''}`));
    }

    const merged: Goal = {
      ...currentGoal,
      ...updates,
      updatedAt: now,
      activityHistory: [
        ...newEvents,
        ...(currentGoal.activityHistory || []),
      ].slice(0, 50),
    };

    const relatedTasks = get().tasks.filter((t) => t.goalId === id && !t.isArchived);
    if (updates.progress === undefined) {
      merged.progress = computeGoalProgress(merged, relatedTasks, get().habitEntries);
    }
    if (updates.status === undefined && !merged.statusOverride) {
      merged.status = computeGoalStatus(merged, merged.progress);
    }
    if (merged.progress >= 100 && !merged.completedAt) {
      merged.completedAt = now;
      merged.activityHistory = [
        createActivityEvent(id, 'completed', `Goal "${merged.title}" completed!`),
        ...(merged.activityHistory || []),
      ];
    }

    updatedGoal = merged;
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? updatedGoal! : g)),
    }));
    try {
      await LifeOSRepository.saveGoal(updatedGoal);
    } catch (err) {
      set((s) => ({
        goals: s.goals.map((g) => (g.id === id ? currentGoal : g)),
      }));
      get().addToast({
        type: 'error',
        title: 'Goal Update Failed',
        message: 'Could not save goal updates. Changes rolled back.',
      });
      throw err;
    }
  },

  deleteGoal: async (id) => {
    const prevGoal = get().goals.find((g) => g.id === id);
    if (!prevGoal) return;
    const prevTasks = get().tasks;

    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
      tasks: s.tasks.map((t) => (t.goalId === id ? { ...t, goalId: undefined, milestoneId: undefined } : t)),
    }));
    try {
      await LifeOSRepository.deleteGoal(id);
    } catch (err) {
      set({ goals: [prevGoal, ...get().goals], tasks: prevTasks });
      get().addToast({
        type: 'error',
        title: 'Goal Deletion Failed',
        message: 'Could not remove goal from database. Goal restored.',
      });
      throw err;
    }
  },

  toggleMilestone: async (goalId, milestoneId) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    let toggledTitle = '';
    let becameCompleted = false;

    const milestones = currentGoal.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      toggledTitle = m.title;
      becameCompleted = !m.isCompleted;
      return {
        ...m,
        isCompleted: !m.isCompleted,
        completedAt: !m.isCompleted ? now : undefined,
      };
    });

    const eventDesc = becameCompleted
      ? `Completed milestone: "${toggledTitle}"`
      : `Reopened milestone: "${toggledTitle}"`;
    const milestoneEvent = createActivityEvent(goalId, 'milestone_completed', eventDesc);

    const partialGoal: Goal = {
      ...currentGoal,
      milestones,
      activityHistory: [milestoneEvent, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    const relatedTasks = get().tasks.filter((t) => t.goalId === goalId && !t.isArchived);
    const progress = computeGoalProgress(partialGoal, relatedTasks, get().habitEntries);
    const status = currentGoal.statusOverride ? currentGoal.status : computeGoalStatus(partialGoal, progress);

    const updatedGoal: Goal = {
      ...partialGoal,
      progress,
      status,
      completedAt: progress >= 100 ? currentGoal.completedAt || now : undefined,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);

    if (becameCompleted) {
      get().addToast({
        type: 'success',
        title: 'Milestone Completed!',
        message: `${updatedGoal.title} progress updated to ${updatedGoal.progress}%.`,
      });
    }
  },

  addMilestone: async (goalId, milestoneData) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const newMilestone: Milestone = {
      id: uuidv4(),
      title: milestoneData.title,
      description: milestoneData.description,
      dueDate: milestoneData.dueDate,
      isCompleted: false,
      order: currentGoal.milestones.length,
      targetValue: milestoneData.targetValue,
      currentValue: milestoneData.currentValue,
      unit: milestoneData.unit,
    };

    const milestones = [...currentGoal.milestones, newMilestone];
    const addEvent = createActivityEvent(goalId, 'milestone_added', `Added milestone: "${newMilestone.title}"`);

    const partialGoal: Goal = {
      ...currentGoal,
      milestones,
      activityHistory: [addEvent, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    const relatedTasks = get().tasks.filter((t) => t.goalId === goalId && !t.isArchived);
    const progress = computeGoalProgress(partialGoal, relatedTasks, get().habitEntries);
    const status = currentGoal.statusOverride ? currentGoal.status : computeGoalStatus(partialGoal, progress);

    const updatedGoal: Goal = {
      ...partialGoal,
      progress,
      status,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  updateMilestone: async (goalId, milestoneId, updates) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const milestones = currentGoal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, ...updates } : m
    );

    const partialGoal: Goal = {
      ...currentGoal,
      milestones,
      updatedAt: now,
    };

    const relatedTasks = get().tasks.filter((t) => t.goalId === goalId && !t.isArchived);
    const progress = computeGoalProgress(partialGoal, relatedTasks, get().habitEntries);
    const status = currentGoal.statusOverride ? currentGoal.status : computeGoalStatus(partialGoal, progress);

    const updatedGoal: Goal = {
      ...partialGoal,
      progress,
      status,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  deleteMilestone: async (goalId, milestoneId) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const deleted = currentGoal.milestones.find((m) => m.id === milestoneId);
    const milestones = currentGoal.milestones.filter((m) => m.id !== milestoneId);
    const deleteEvent = createActivityEvent(
      goalId,
      'progress_updated',
      `Deleted milestone: "${deleted?.title || milestoneId}"`
    );

    const partialGoal: Goal = {
      ...currentGoal,
      milestones,
      activityHistory: [deleteEvent, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    const relatedTasks = get().tasks.filter((t) => t.goalId === goalId && !t.isArchived);
    const progress = computeGoalProgress(partialGoal, relatedTasks, get().habitEntries);
    const status = currentGoal.statusOverride ? currentGoal.status : computeGoalStatus(partialGoal, progress);

    const updatedGoal: Goal = {
      ...partialGoal,
      progress,
      status,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  reorderMilestones: async (goalId, milestoneIds) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const map = new Map(currentGoal.milestones.map((m) => [m.id, m]));
    const reordered: Milestone[] = [];
    milestoneIds.forEach((id, idx) => {
      const m = map.get(id);
      if (m) {
        reordered.push({ ...m, order: idx });
      }
    });

    const updatedGoal: Goal = {
      ...currentGoal,
      milestones: reordered,
      updatedAt: now,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  setGoalStatus: async (goalId, status, isOverride = true) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    let eventType: GoalActivityEvent['type'] = 'status_changed';
    let msg = `Status updated to ${status}`;
    if (status === 'paused') {
      eventType = 'paused';
      msg = `Goal "${currentGoal.title}" paused.`;
    } else if (status === 'in-progress' && currentGoal.status === 'paused') {
      eventType = 'resumed';
      msg = `Goal "${currentGoal.title}" resumed.`;
    } else if (status === 'completed') {
      eventType = 'completed';
      msg = `Goal "${currentGoal.title}" marked as completed.`;
    }

    const statusEvent = createActivityEvent(goalId, eventType, msg);
    const updatedGoal: Goal = {
      ...currentGoal,
      status,
      statusOverride: isOverride,
      completedAt: status === 'completed' ? now : undefined,
      activityHistory: [statusEvent, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  archiveGoal: async (goalId) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const event = createActivityEvent(goalId, 'archived', `Goal "${currentGoal.title}" archived.`);
    const updatedGoal: Goal = {
      ...currentGoal,
      isArchived: true,
      activityHistory: [event, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  unarchiveGoal: async (goalId) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    const event = createActivityEvent(goalId, 'resumed', `Goal "${currentGoal.title}" restored from archive.`);
    const updatedGoal: Goal = {
      ...currentGoal,
      isArchived: false,
      activityHistory: [event, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  updateGoalProgress: async (goalId, currentValueOrPercent) => {
    const now = new Date().toISOString();
    const currentGoal = get().goals.find((g) => g.id === goalId);
    if (!currentGoal) return;

    let updates: Partial<Goal> = {};
    if (currentGoal.measurementType === 'numeric') {
      const newCurrent = currentValueOrPercent;
      const targetVal = currentGoal.targetValue || 1;
      const pct = Math.min(100, Math.max(0, Math.round((newCurrent / targetVal) * 100)));
      updates = {
        currentValue: newCurrent,
        progress: pct,
      };
    } else {
      const pct = Math.min(100, Math.max(0, Math.round(currentValueOrPercent)));
      updates = {
        progress: pct,
        manualProgress: pct,
        progressCalculationMode: 'manual',
      };
    }

    const event = createActivityEvent(
      goalId,
      'progress_updated',
      `Progress updated to ${updates.progress}%${currentGoal.unit && updates.currentValue !== undefined ? ` (${updates.currentValue} ${currentGoal.unit})` : ''}`
    );

    const updatedGoal: Goal = {
      ...currentGoal,
      ...updates,
      activityHistory: [event, ...(currentGoal.activityHistory || [])].slice(0, 50),
      updatedAt: now,
    };

    if (!updatedGoal.statusOverride) {
      updatedGoal.status = computeGoalStatus(updatedGoal, updatedGoal.progress);
    }
    if (updatedGoal.progress >= 100 && !updatedGoal.completedAt) {
      updatedGoal.completedAt = now;
    }

    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    }));
    await LifeOSRepository.saveGoal(updatedGoal);
  },

  linkTaskToGoal: async (taskId, goalId, milestoneId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    await get().updateTask(taskId, { goalId, milestoneId });
    const goal = get().goals.find((g) => g.id === goalId);
    if (goal) {
      const event = createActivityEvent(
        goalId,
        'task_linked',
        `Linked task "${task.title}"${milestoneId ? ' to milestone' : ''}.`
      );
      await get().updateGoal(goalId, {
        activityHistory: [event, ...(goal.activityHistory || [])].slice(0, 50),
      });
    }
  },

  unlinkTaskFromGoal: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    await get().updateTask(taskId, { goalId: undefined, milestoneId: undefined });
  },

  // ----------------------------------------------------
  // TASKS
  // ----------------------------------------------------
  activeFocusTaskId: undefined,

  addTask: async (taskData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      title: taskData.title,
      description: taskData.description,
      notes: taskData.notes,
      priority: taskData.priority,
      category: taskData.category || 'General',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      goalId: taskData.goalId,
      academicSubjectId: taskData.academicSubjectId,
      careerProjectId: taskData.careerProjectId,
      recurrence: taskData.recurrence || 'none',
      recurrenceConfig: taskData.recurrenceConfig,
      parentRecurringTaskId: taskData.parentRecurringTaskId,
      tags: taskData.tags || [],
      estimatedDuration: taskData.estimatedDuration,
      actualDuration: taskData.actualDuration || 0,
      dependsOnTaskIds: taskData.dependsOnTaskIds || [],
      isArchived: taskData.isArchived ?? false,
      id: uuidv4(),
      isCompleted: taskData.isCompleted ?? false,
      isOverdue: false,
      subtasks: taskData.subtasks ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ tasks: [newTask, ...s.tasks] }));
    try {
      await LifeOSRepository.saveTask(newTask);
    } catch (err) {
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== newTask.id) }));
      get().addToast({
        type: 'error',
        title: 'Task Save Failed',
        message: 'Could not write task to local database. Changes rolled back.',
      });
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    const now = new Date().toISOString();
    const prevTask = get().tasks.find((t) => t.id === id);
    if (!prevTask) return;

    let updatedTask: Task | undefined;
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...updates, updatedAt: now };
          return updatedTask;
        }
        return t;
      }),
    }));
    if (updatedTask) {
      try {
        await LifeOSRepository.saveTask(updatedTask);
      } catch (err) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? prevTask : t)),
        }));
        get().addToast({
          type: 'error',
          title: 'Task Update Failed',
          message: 'Could not save updates to local database. Changes rolled back.',
        });
        throw err;
      }
    }
  },

  deleteTask: async (id) => {
    const prevTask = get().tasks.find((t) => t.id === id);
    if (!prevTask) return;

    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      await LifeOSRepository.deleteTask(id);
    } catch (err) {
      set((s) => ({ tasks: [prevTask, ...s.tasks] }));
      get().addToast({
        type: 'error',
        title: 'Task Deletion Failed',
        message: 'Could not remove task from database. Task restored.',
      });
      throw err;
    }
  },

  completeTask: async (id) => {
    const now = new Date().toISOString();
    let updatedTask: Task | undefined;
    let nextRecurringTask: Task | undefined;

    set((s) => {
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;

      const nextCompleted = !task.isCompleted;
      updatedTask = {
        ...task,
        isCompleted: nextCompleted,
        status: nextCompleted ? 'completed' : 'todo',
        completedAt: nextCompleted ? now : undefined,
        isOverdue: false,
        updatedAt: now,
      };

      // Handle recurrence generation when completing a task
      const isRecurring = task.recurrence && task.recurrence !== 'none';
      if (nextCompleted && isRecurring) {
        const nextDate = computeNextDueDate(task.dueDate, task.recurrence!, task.recurrenceConfig);
        const maxOcc = task.recurrenceConfig?.maxOccurrences;
        const currentOcc = task.recurrenceConfig?.currentOccurrence || 1;
        const endDate = task.recurrenceConfig?.endDate;

        const canRecur = (!maxOcc || currentOcc < maxOcc) && (!endDate || nextDate <= endDate);

        if (canRecur) {
          nextRecurringTask = {
            id: uuidv4(),
            title: task.title,
            description: task.description,
            notes: task.notes,
            priority: task.priority,
            category: task.category,
            status: 'todo',
            dueDate: nextDate,
            dueTime: task.dueTime,
            isCompleted: false,
            isOverdue: false,
            recurrence: task.recurrence,
            recurrenceConfig: task.recurrenceConfig
              ? { ...task.recurrenceConfig, currentOccurrence: currentOcc + 1 }
              : undefined,
            parentRecurringTaskId: task.parentRecurringTaskId || task.id,
            subtasks: task.subtasks.map((st) => ({
              id: uuidv4(),
              title: st.title,
              isCompleted: false,
            })),
            tags: task.tags ? [...task.tags] : [],
            estimatedDuration: task.estimatedDuration,
            actualDuration: 0,
            dependsOnTaskIds: task.dependsOnTaskIds ? [...task.dependsOnTaskIds] : [],
            goalId: task.goalId,
            academicSubjectId: task.academicSubjectId,
            careerProjectId: task.careerProjectId,
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      const nextTasks = s.tasks.map((t) => (t.id === id ? updatedTask! : t));
      if (nextRecurringTask) {
        nextTasks.unshift(nextRecurringTask);
      }

      return { tasks: nextTasks };
    });

    if (updatedTask) {
      await LifeOSRepository.saveTask(updatedTask);
      if (nextRecurringTask) {
        await LifeOSRepository.saveTask(nextRecurringTask);
      }
      if (updatedTask.isCompleted) {
        get().addToast({
          type: 'success',
          title: 'Task Completed',
          message: nextRecurringTask
            ? `"${updatedTask.title}" completed. Next recurrence set for ${nextRecurringTask.dueDate}.`
            : `"${updatedTask.title}" marked done.`,
        });
      }

      if (updatedTask.goalId) {
        const goal = get().goals.find((g) => g.id === updatedTask!.goalId);
        if (goal && (goal.measurementType === 'completion' || !goal.measurementType)) {
          const goalTasks = get().tasks.filter((t) => t.goalId === goal.id && !t.isArchived);
          const completedCount = goalTasks.filter((t) => t.isCompleted).length;
          const newProgress = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : goal.progress;
          const newStatus = computeGoalStatus(goal, newProgress);
          await get().updateGoal(goal.id, { progress: newProgress, status: newStatus });
        }
      }
    }
  },

  reopenTask: async (id) => {
    const now = new Date().toISOString();
    let updatedTask: Task | undefined;
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = {
            ...t,
            isCompleted: false,
            status: 'todo',
            completedAt: undefined,
            updatedAt: now,
          };
          return updatedTask;
        }
        return t;
      }),
    }));
    if (updatedTask) {
      await LifeOSRepository.saveTask(updatedTask);
      get().addToast({
        type: 'info',
        title: 'Task Reopened',
        message: `"${updatedTask.title}" moved back to active to-do.`,
      });

      if (updatedTask.goalId) {
        const goal = get().goals.find((g) => g.id === updatedTask!.goalId);
        if (goal && (goal.measurementType === 'completion' || !goal.measurementType)) {
          const goalTasks = get().tasks.filter((t) => t.goalId === goal.id && !t.isArchived);
          const completedCount = goalTasks.filter((t) => t.isCompleted).length;
          const newProgress = goalTasks.length > 0 ? Math.round((completedCount / goalTasks.length) * 100) : goal.progress;
          const newStatus = computeGoalStatus(goal, newProgress);
          await get().updateGoal(goal.id, { progress: newProgress, status: newStatus });
        }
      }
    }
  },

  duplicateTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    const now = new Date().toISOString();
    const cloned: Task = {
      ...task,
      id: uuidv4(),
      title: `${task.title} (Copy)`,
      isCompleted: false,
      completedAt: undefined,
      isOverdue: false,
      status: task.status === 'completed' || task.status === 'done' ? 'todo' : task.status,
      subtasks: task.subtasks.map((st) => ({ ...st, id: uuidv4(), isCompleted: false })),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ tasks: [cloned, ...s.tasks] }));
    await LifeOSRepository.saveTask(cloned);
    get().addToast({
      type: 'info',
      title: 'Task Duplicated',
      message: `Created copy of "${task.title}".`,
    });
    return cloned;
  },

  archiveTask: async (id) => {
    await get().updateTask(id, { isArchived: true, status: 'archived' });
    get().addToast({ type: 'info', title: 'Task Archived' });
  },

  unarchiveTask: async (id) => {
    await get().updateTask(id, { isArchived: false, status: 'todo' });
    get().addToast({ type: 'info', title: 'Task Restored from Archive' });
  },

  setTaskStatus: async (id, status) => {
    if (status === 'completed' || status === 'done') {
      await get().completeTask(id);
    } else {
      await get().updateTask(id, {
        status,
        isCompleted: false,
        completedAt: undefined,
        isArchived: status === 'archived',
      });
    }
  },

  rescheduleTask: async (id, newDate) => {
    const now = new Date().toISOString();
    let updatedTask: Task | undefined;
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === id) {
          updatedTask = {
            ...t,
            dueDate: newDate,
            isOverdue: false,
            rescheduled: true,
            rescheduledTo: newDate,
            updatedAt: now,
          };
          return updatedTask;
        }
        return t;
      }),
    }));
    if (updatedTask) {
      await LifeOSRepository.saveTask(updatedTask);
      get().addToast({
        type: 'info',
        title: 'Task Rescheduled',
        message: `Moved to ${newDate}.`,
      });
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const now = new Date().toISOString();
    let updatedTask: Task | undefined;
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === taskId) {
          const subtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
          );
          updatedTask = { ...t, subtasks, updatedAt: now };
          return updatedTask;
        }
        return t;
      }),
    }));
    if (updatedTask) {
      await LifeOSRepository.saveTask(updatedTask);
    }
  },

  addSubtask: async (taskId, title) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newSubtask: SubTask = { id: uuidv4(), title: title.trim(), isCompleted: false };
    await get().updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
  },

  updateSubtask: async (taskId, subtaskId, updates) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...updates } : st
    );
    await get().updateTask(taskId, { subtasks });
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    await get().updateTask(taskId, { subtasks });
  },

  quickAddTask: async (title, priority = 'medium', dueDate, category = 'General', estimatedDuration, tags = []) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      priority,
      category,
      status: 'todo',
      dueDate,
      estimatedDuration,
      tags,
      isCompleted: false,
      isOverdue: false,
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ tasks: [newTask, ...s.tasks] }));
    await LifeOSRepository.saveTask(newTask);
    get().addToast({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" added to your tasks.`,
    });
    return newTask;
  },

  startTaskFocusSession: (taskId: string) => {
    set({ activeFocusTaskId: taskId, activeView: 'focus' });
  },

  recordTaskFocusDuration: async (taskId: string, minutes: number) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const currentActual = task.actualDuration || 0;
    await get().updateTask(taskId, { actualDuration: currentActual + minutes });
  },

  markOverdueTasks: async () => {
    const todayStr = todayLocal();
    const now = new Date().toISOString();
    const tasksToUpdate: Task[] = [];

    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (!t.isCompleted && t.dueDate && t.dueDate < todayStr && !t.isOverdue) {
          const updated = { ...t, isOverdue: true, updatedAt: now };
          tasksToUpdate.push(updated);
          return updated;
        }
        return t;
      }),
    }));

    for (const t of tasksToUpdate) {
      await LifeOSRepository.saveTask(t);
    }
  },

  // ----------------------------------------------------
  // HABITS (Habits 2.0 Engine)
  // ----------------------------------------------------
  addHabit: async (habitData) => {
    const id = uuidv4();
    const scheduleType = habitData.scheduleType || 'daily';
    const targetDays = habitData.targetDays && habitData.targetDays.length > 0
      ? habitData.targetDays
      : scheduleType === 'weekdays'
      ? (habitData.scheduleDays && habitData.scheduleDays.length > 0 ? habitData.scheduleDays : [1, 2, 3, 4, 5])
      : [0, 1, 2, 3, 4, 5, 6];

    const newHabit: Habit = {
      ...habitData,
      id,
      category: habitData.category || 'Lifestyle',
      color: habitData.color || '#B80C09',
      icon: habitData.icon || '⚡',
      frequency: habitData.frequency || 'daily',
      type: habitData.type || 'boolean',
      scheduleType,
      targetDays,
      scheduleDays: habitData.scheduleDays || (scheduleType === 'weekdays' ? [1, 2, 3, 4, 5] : undefined),
      monthlyDates: habitData.monthlyDates,
      weeklyTargetCount: habitData.weeklyTargetCount,
      monthlyTargetCount: habitData.monthlyTargetCount,
      customIntervalDays: habitData.customIntervalDays,
      targetValue: habitData.targetValue || (habitData.type === 'duration' ? 30 : habitData.type === 'numeric' ? 10 : 1),
      unit: habitData.unit || (habitData.type === 'duration' ? 'mins' : habitData.type === 'numeric' ? 'units' : 'times'),
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      entries: [],
      createdAt: new Date().toISOString(),
    };

    // Update state and persistence
    set((s) => ({ habits: [...s.habits, newHabit] }));
    await LifeOSRepository.saveHabit(newHabit);

    // Link to routine if assigned
    if (newHabit.routineId) {
      set((s) => {
        const nextRoutines = s.habitRoutines.map((r) =>
          r.id === newHabit.routineId && !r.habitIds.includes(id)
            ? { ...r, habitIds: [...r.habitIds, id] }
            : r
        );
        try {
          localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
        } catch {
          // ignore
        }
        return { habitRoutines: nextRoutines };
      });
    }

    // Link to goal if assigned
    if (newHabit.goalId) {
      const goal = get().goals.find((g) => g.id === newHabit.goalId);
      if (goal && (!goal.linkedHabitIds || !goal.linkedHabitIds.includes(id))) {
        await get().updateGoal(newHabit.goalId, {
          linkedHabitIds: [...(goal.linkedHabitIds || []), id],
        });
      }
    }

    get().addToast({
      type: 'success',
      title: 'Habit Established',
      message: `"${newHabit.name}" is now tracking. Let's build consistency! 🚀`,
    });

    return newHabit;
  },

  updateHabit: async (id, updates) => {
    let updated: Habit | undefined;
    const prevHabit = get().habits.find((h) => h.id === id);

    set((s) => ({
      habits: s.habits.map((h) => {
        if (h.id === id) {
          const merged = { ...h, ...updates };
          // Keep targetDays synchronized if schedule changed
          if (updates.scheduleType || updates.scheduleDays) {
            merged.targetDays = merged.scheduleType === 'weekdays'
              ? (merged.scheduleDays && merged.scheduleDays.length > 0 ? merged.scheduleDays : [1, 2, 3, 4, 5])
              : (merged.targetDays && merged.targetDays.length > 0 ? merged.targetDays : [0, 1, 2, 3, 4, 5, 6]);
          }
          const streakInfo = computeHabitStreak(merged, s.habitEntries);
          merged.streak = streakInfo.streak;
          merged.longestStreak = Math.max(merged.longestStreak || 0, streakInfo.longestStreak);
          merged.totalCompletions = streakInfo.totalCompletions;
          updated = merged;
          return merged;
        }
        return h;
      }),
    }));

    if (updated) {
      await LifeOSRepository.saveHabit(updated);

      // Handle routine assignment changes
      if (prevHabit && updates.routineId !== undefined && updates.routineId !== prevHabit.routineId) {
        set((s) => {
          const nextRoutines = s.habitRoutines.map((r) => {
            if (r.id === prevHabit.routineId) {
              return { ...r, habitIds: r.habitIds.filter((hId) => hId !== id) };
            }
            if (r.id === updates.routineId && !r.habitIds.includes(id)) {
              return { ...r, habitIds: [...r.habitIds, id] };
            }
            return r;
          });
          try {
            localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
          } catch {
            // ignore
          }
          return { habitRoutines: nextRoutines };
        });
      }

      // Handle goal assignment changes
      if (prevHabit && updates.goalId !== undefined && updates.goalId !== prevHabit.goalId) {
        if (prevHabit.goalId) {
          const oldGoal = get().goals.find((g) => g.id === prevHabit.goalId);
          if (oldGoal?.linkedHabitIds?.includes(id)) {
            await get().updateGoal(prevHabit.goalId, {
              linkedHabitIds: oldGoal.linkedHabitIds.filter((hId) => hId !== id),
            });
          }
        }
        if (updates.goalId) {
          const newGoal = get().goals.find((g) => g.id === updates.goalId);
          if (newGoal && (!newGoal.linkedHabitIds || !newGoal.linkedHabitIds.includes(id))) {
            await get().updateGoal(updates.goalId, {
              linkedHabitIds: [...(newGoal.linkedHabitIds || []), id],
            });
          }
        }
      }
    }
  },

  deleteHabit: async (id) => {
    const habit = get().habits.find((h) => h.id === id);
    set((s) => {
      const nextRoutines = s.habitRoutines.map((r) => ({
        ...r,
        habitIds: r.habitIds.filter((hId) => hId !== id),
      }));
      try {
        localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
      } catch {
        // ignore
      }
      return {
        habits: s.habits.filter((h) => h.id !== id),
        habitEntries: s.habitEntries.filter((e) => e.habitId !== id),
        habitRoutines: nextRoutines,
      };
    });

    if (habit?.goalId) {
      const goal = get().goals.find((g) => g.id === habit.goalId);
      if (goal?.linkedHabitIds?.includes(id)) {
        await get().updateGoal(habit.goalId, {
          linkedHabitIds: goal.linkedHabitIds.filter((hId) => hId !== id),
        });
      }
    }

    await LifeOSRepository.deleteHabit(id);
    get().addToast({
      type: 'info',
      title: 'Habit Archived',
      message: 'Habit and completion history removed.',
    });
  },

  toggleHabitEntry: async (habitId, date) => {
    const entries = get().habitEntries;
    const existing = entries.find((e) => e.habitId === habitId && e.date === date);
    const habit = get().habits.find((h) => h.id === habitId);
    let nextEntries: HabitEntry[];
    let wasCompleted = false;

    if (existing) {
      if (existing.completed || existing.status === 'completed') {
        // Undo completion
        nextEntries = entries.filter((e) => e.id !== existing.id);
        await LifeOSRepository.deleteHabitEntry(existing.id);
      } else {
        // Was partial or skipped -> complete it
        const updated: HabitEntry = {
          ...existing,
          completed: true,
          status: 'completed',
          value: habit?.targetValue || 1,
          loggedAt: new Date().toISOString(),
        };
        nextEntries = entries.map((e) => (e.id === existing.id ? updated : e));
        await LifeOSRepository.saveHabitEntry(updated);
        wasCompleted = true;
      }
    } else {
      // New completion entry
      const newEntry: HabitEntry = {
        id: `he-${uuidv4()}`,
        habitId,
        date,
        completed: true,
        status: 'completed',
        value: habit?.targetValue || 1,
        targetValue: habit?.targetValue || 1,
        unit: habit?.unit || 'times',
        loggedAt: new Date().toISOString(),
      };
      nextEntries = [...entries, newEntry];
      await LifeOSRepository.saveHabitEntry(newEntry);
      wasCompleted = true;
    }

    if (habit) {
      const streakInfo = computeHabitStreak(habit, nextEntries);
      const updatedHabit: Habit = {
        ...habit,
        streak: streakInfo.streak,
        longestStreak: Math.max(habit.longestStreak || 0, streakInfo.longestStreak),
        totalCompletions: streakInfo.totalCompletions,
        entries: nextEntries.filter((e) => e.habitId === habitId),
      };

      set((s) => ({
        habitEntries: nextEntries,
        habits: s.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
      }));

      await LifeOSRepository.saveHabit(updatedHabit);

      // Recompute linked goal progress if habit-based
      if (habit.goalId) {
        const goal = get().goals.find((g) => g.id === habit.goalId);
        if (goal) {
          const relatedTasks = get().tasks.filter((t) => t.goalId === habit.goalId);
          const progress = computeGoalProgress(goal, relatedTasks, nextEntries);
          await get().updateGoal(habit.goalId, { progress });
        }
      }

      if (wasCompleted) {
        get().addToast({
          type: 'success',
          title: 'Habit Logged',
          message: `${habit.name} recorded! 🔥 ${streakInfo.streak}d streak maintained.`,
        });
      }
    } else {
      set({ habitEntries: nextEntries });
    }
  },

  recordHabitProgress: async (habitId, date, value, notes) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const entries = get().habitEntries;
    const existing = entries.find((e) => e.habitId === habitId && e.date === date);
    const target = habit.targetValue || 1;

    let isCompleted = false;
    let status: 'completed' | 'partial' | 'skipped' = 'partial';

    if (habit.type === 'negative') {
      // For negative avoidance habit: 0 incidents logged = successful adherence
      if (value === 0) {
        isCompleted = true;
        status = 'completed';
      } else {
        isCompleted = false;
        status = 'partial';
      }
    } else {
      if (value >= target) {
        isCompleted = true;
        status = 'completed';
      } else if (value > 0) {
        isCompleted = false;
        status = 'partial';
      } else {
        isCompleted = false;
        status = 'partial';
      }
    }

    let nextEntries: HabitEntry[];
    if (existing) {
      const updated: HabitEntry = {
        ...existing,
        completed: isCompleted,
        status,
        value,
        notes: notes !== undefined ? notes : existing.notes,
        loggedAt: new Date().toISOString(),
      };
      nextEntries = entries.map((e) => (e.id === existing.id ? updated : e));
      await LifeOSRepository.saveHabitEntry(updated);
    } else {
      const newEntry: HabitEntry = {
        id: `he-${uuidv4()}`,
        habitId,
        date,
        completed: isCompleted,
        status,
        value,
        targetValue: target,
        unit: habit.unit || 'units',
        notes,
        loggedAt: new Date().toISOString(),
      };
      nextEntries = [...entries, newEntry];
      await LifeOSRepository.saveHabitEntry(newEntry);
    }

    const streakInfo = computeHabitStreak(habit, nextEntries);
    const updatedHabit: Habit = {
      ...habit,
      streak: streakInfo.streak,
      longestStreak: Math.max(habit.longestStreak || 0, streakInfo.longestStreak),
      totalCompletions: streakInfo.totalCompletions,
      entries: nextEntries.filter((e) => e.habitId === habitId),
    };

    set((s) => ({
      habitEntries: nextEntries,
      habits: s.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
    }));

    await LifeOSRepository.saveHabit(updatedHabit);

    if (habit.goalId) {
      const goal = get().goals.find((g) => g.id === habit.goalId);
      if (goal) {
        const relatedTasks = get().tasks.filter((t) => t.goalId === habit.goalId);
        const progress = computeGoalProgress(goal, relatedTasks, nextEntries);
        await get().updateGoal(habit.goalId, { progress });
      }
    }

    get().addToast({
      type: isCompleted ? 'success' : 'info',
      title: isCompleted ? 'Target Achieved!' : 'Progress Recorded',
      message: `${habit.name}: ${value} / ${target} ${habit.unit || ''} logged.`,
    });
  },

  skipHabitEntry: async (habitId, date, notes) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const entries = get().habitEntries;
    const existing = entries.find((e) => e.habitId === habitId && e.date === date);

    let nextEntries: HabitEntry[];
    if (existing) {
      const updated: HabitEntry = {
        ...existing,
        completed: false,
        status: 'skipped',
        notes: notes || 'Scheduled rest / recovery day',
        loggedAt: new Date().toISOString(),
      };
      nextEntries = entries.map((e) => (e.id === existing.id ? updated : e));
      await LifeOSRepository.saveHabitEntry(updated);
    } else {
      const newEntry: HabitEntry = {
        id: `he-${uuidv4()}`,
        habitId,
        date,
        completed: false,
        status: 'skipped',
        notes: notes || 'Scheduled rest / recovery day',
        loggedAt: new Date().toISOString(),
      };
      nextEntries = [...entries, newEntry];
      await LifeOSRepository.saveHabitEntry(newEntry);
    }

    const streakInfo = computeHabitStreak(habit, nextEntries);
    const updatedHabit: Habit = {
      ...habit,
      streak: streakInfo.streak,
      longestStreak: Math.max(habit.longestStreak || 0, streakInfo.longestStreak),
      totalCompletions: streakInfo.totalCompletions,
      entries: nextEntries.filter((e) => e.habitId === habitId),
    };

    set((s) => ({
      habitEntries: nextEntries,
      habits: s.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
    }));

    await LifeOSRepository.saveHabit(updatedHabit);

    get().addToast({
      type: 'info',
      title: 'Habit Skipped',
      message: `${habit.name} skipped for today. Streak preserved! 🛡️`,
    });
  },

  // ----------------------------------------------------
  // ROUTINES ENGINE
  // ----------------------------------------------------
  addRoutine: async (routineData) => {
    const newRoutine: HabitRoutine = {
      ...routineData,
      id: `routine-${uuidv4()}`,
      order: get().habitRoutines.length,
      createdAt: new Date().toISOString(),
    };
    const nextRoutines = [...get().habitRoutines, newRoutine];
    try {
      localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
    } catch {
      // ignore
    }
    set({ habitRoutines: nextRoutines });
    get().addToast({
      type: 'success',
      title: 'Routine Created',
      message: `"${newRoutine.title}" stack established.`,
    });

    return newRoutine;
  },

  updateRoutine: async (id, updates) => {
    const nextRoutines = get().habitRoutines.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    try {
      localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
    } catch {
      // ignore
    }
    set({ habitRoutines: nextRoutines });
  },

  deleteRoutine: async (id) => {
    const nextRoutines = get().habitRoutines.filter((r) => r.id !== id);
    try {
      localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
    } catch {
      // ignore
    }
    // Remove routineId from any habits
    const habitsToUpdate = get().habits.filter((h) => h.routineId === id);
    set((s) => ({
      habitRoutines: nextRoutines,
      habits: s.habits.map((h) => (h.routineId === id ? { ...h, routineId: undefined } : h)),
    }));
    for (const h of habitsToUpdate) {
      await LifeOSRepository.saveHabit({ ...h, routineId: undefined });
    }
  },

  reorderRoutineHabits: async (routineId, habitIds) => {
    const nextRoutines = get().habitRoutines.map((r) =>
      r.id === routineId ? { ...r, habitIds } : r
    );
    try {
      localStorage.setItem('lifeos_habit_routines', JSON.stringify(nextRoutines));
    } catch {
      // ignore
    }
    set({ habitRoutines: nextRoutines });
  },

  // ----------------------------------------------------
  // FINANCE
  // ----------------------------------------------------
  addTransaction: async (txData) => {
    const newTx: FinanceTransaction = {
      ...txData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ financeTransactions: [newTx, ...s.financeTransactions] }));
    await LifeOSRepository.saveTransaction(newTx);
  },

  deleteTransaction: async (id) => {
    set((s) => ({ financeTransactions: s.financeTransactions.filter((t) => t.id !== id) }));
    await LifeOSRepository.deleteTransaction(id);
  },

  saveBudget: async (bData) => {
    const budget: FinanceBudget = {
      id: bData.id || uuidv4(),
      category: bData.category,
      monthlyLimit: bData.monthlyLimit,
      month: bData.month,
    };
    set((s) => ({
      financeBudgets: [
        ...s.financeBudgets.filter((b) => !(b.category === budget.category && b.month === budget.month)),
        budget,
      ],
    }));
    await LifeOSRepository.saveBudget(budget);
  },

  addSavingsGoal: async (sgData) => {
    const newGoal: SavingsGoal = {
      ...sgData,
      id: uuidv4(),
      isReached: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ savingsGoals: [...s.savingsGoals, newGoal] }));
    await LifeOSRepository.saveSavingsGoal(newGoal);
  },

  depositSavings: async (id, amount) => {
    let updated: SavingsGoal | undefined;
    set((s) => ({
      savingsGoals: s.savingsGoals.map((sg) => {
        if (sg.id === id) {
          const current = sg.currentAmount + amount;
          updated = { ...sg, currentAmount: current, isReached: current >= sg.targetAmount };
          return updated;
        }
        return sg;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveSavingsGoal(updated);
    }
  },

  deleteSavingsGoal: async (id) => {
    set((s) => ({ savingsGoals: s.savingsGoals.filter((sg) => sg.id !== id) }));
    await LifeOSRepository.deleteSavingsGoal(id);
  },

  // ----------------------------------------------------
  // FITNESS
  // ----------------------------------------------------
  addWorkoutSession: async (wsData) => {
    const newSession: WorkoutSession = {
      ...wsData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ workoutSessions: [newSession, ...s.workoutSessions] }));
    await LifeOSRepository.saveWorkoutSession(newSession);
  },

  deleteWorkoutSession: async (id) => {
    set((s) => ({ workoutSessions: s.workoutSessions.filter((ws) => ws.id !== id) }));
    await LifeOSRepository.deleteWorkoutSession(id);
  },

  addExercise: async (exData) => {
    const newEx: ExerciseItem = { ...exData, id: uuidv4() };
    set((s) => ({ exercises: [...s.exercises, newEx] }));
    await LifeOSRepository.saveExercise(newEx);
  },

  addBodyMetric: async (bmData) => {
    const newBm: BodyMetric = { ...bmData, id: uuidv4() };
    set((s) => ({ bodyMetrics: [newBm, ...s.bodyMetrics] }));
    await LifeOSRepository.saveBodyMetric(newBm);
  },

  deleteBodyMetric: async (id) => {
    set((s) => ({ bodyMetrics: s.bodyMetrics.filter((bm) => bm.id !== id) }));
    await LifeOSRepository.deleteBodyMetric(id);
  },

  addFitnessGoal: async (fgData) => {
    const newFg: FitnessGoal = { ...fgData, id: uuidv4(), isAchieved: false };
    set((s) => ({ fitnessGoals: [...s.fitnessGoals, newFg] }));
    await LifeOSRepository.saveFitnessGoal(newFg);
  },

  toggleFitnessGoal: async (id) => {
    let updated: FitnessGoal | undefined;
    set((s) => ({
      fitnessGoals: s.fitnessGoals.map((fg) => {
        if (fg.id === id) {
          updated = { ...fg, isAchieved: !fg.isAchieved };
          return updated;
        }
        return fg;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveFitnessGoal(updated);
    }
  },

  // ----------------------------------------------------
  // ACADEMICS
  // ----------------------------------------------------
  addSemester: async (semData) => {
    const newSem: AcademicSemester = { ...semData, id: uuidv4() };
    set((s) => ({ academicSemesters: [...s.academicSemesters, newSem] }));
    await LifeOSRepository.saveSemester(newSem);
  },

  addSubject: async (subData) => {
    const newSub: AcademicSubject = {
      ...subData,
      id: uuidv4(),
      totalClasses: 0,
      attendedClasses: 0,
    };
    set((s) => ({ academicSubjects: [...s.academicSubjects, newSub] }));
    await LifeOSRepository.saveSubject(newSub);
  },

  updateSubjectAttendance: async (id, attendedDelta, totalDelta) => {
    let updated: AcademicSubject | undefined;
    set((s) => ({
      academicSubjects: s.academicSubjects.map((sub) => {
        if (sub.id === id) {
          const attended = Math.max(0, sub.attendedClasses + attendedDelta);
          const total = Math.max(attended, sub.totalClasses + totalDelta);
          updated = { ...sub, attendedClasses: attended, totalClasses: total };
          return updated;
        }
        return sub;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveSubject(updated);
    }
  },

  deleteSubject: async (id) => {
    set((s) => ({ academicSubjects: s.academicSubjects.filter((sub) => sub.id !== id) }));
    await LifeOSRepository.deleteSubject(id);
  },

  addAssignment: async (asgData) => {
    const newAsg: AcademicAssignment = { ...asgData, id: uuidv4(), isSubmitted: false };
    set((s) => ({ academicAssignments: [...s.academicAssignments, newAsg] }));
    await LifeOSRepository.saveAssignment(newAsg);
  },

  toggleAssignment: async (id) => {
    let updated: AcademicAssignment | undefined;
    const now = new Date().toISOString();
    set((s) => ({
      academicAssignments: s.academicAssignments.map((asg) => {
        if (asg.id === id) {
          const next = !asg.isSubmitted;
          updated = { ...asg, isSubmitted: next, submittedAt: next ? now : undefined };
          return updated;
        }
        return asg;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveAssignment(updated);
    }
  },

  deleteAssignment: async (id) => {
    set((s) => ({ academicAssignments: s.academicAssignments.filter((asg) => asg.id !== id) }));
    await LifeOSRepository.deleteAssignment(id);
  },

  addExam: async (examData) => {
    const newExam: AcademicExam = { ...examData, id: uuidv4() };
    set((s) => ({ academicExams: [...s.academicExams, newExam] }));
    await LifeOSRepository.saveExam(newExam);
  },

  deleteExam: async (id) => {
    set((s) => ({ academicExams: s.academicExams.filter((e) => e.id !== id) }));
    await LifeOSRepository.deleteExam(id);
  },

  addTimetableSlot: async (slotData) => {
    const newSlot: TimetableSlot = { ...slotData, id: uuidv4() };
    set((s) => ({ timetableSlots: [...s.timetableSlots, newSlot] }));
    await LifeOSRepository.saveTimetableSlot(newSlot);
  },

  updateTimetableSlot: async (id, updates) => {
    let updated: TimetableSlot | undefined;
    set((s) => ({
      timetableSlots: s.timetableSlots.map((ts) => {
        if (ts.id === id) {
          updated = { ...ts, ...updates };
          return updated;
        }
        return ts;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveTimetableSlot(updated);
    }
  },

  deleteTimetableSlot: async (id) => {
    set((s) => ({ timetableSlots: s.timetableSlots.filter((ts) => ts.id !== id) }));
    await LifeOSRepository.deleteTimetableSlot(id);
  },

  createWorkspace: async (name) => {
    const newWs: UserWorkspace = {
      id: `workspace-${uuidv4().slice(0, 8)}`,
      name: name.trim() || 'Untitled Workspace',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextWorkspaces = [...get().workspaces, newWs];
    const newSettings = {
      ...get().settings,
      workspaces: nextWorkspaces,
      activeWorkspaceId: newWs.id,
    };
    set({
      workspaces: nextWorkspaces,
      activeWorkspaceId: newWs.id,
      settings: newSettings,
    });
    await LifeOSRepository.saveSettings(newSettings);
    get().addToast({
      type: 'success',
      title: 'Workspace Created',
      message: `Switched to workspace "${newWs.name}".`,
    });
    return newWs;
  },

  switchWorkspace: async (workspaceId) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId);
    if (!ws) return;
    const newSettings = {
      ...get().settings,
      activeWorkspaceId: workspaceId,
    };
    set({
      activeWorkspaceId: workspaceId,
      settings: newSettings,
    });
    await LifeOSRepository.saveSettings(newSettings);
    get().addToast({
      type: 'info',
      title: 'Workspace Switched',
      message: `Active space: ${ws.name}`,
    });
  },

  deleteWorkspace: async (workspaceId) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId);
    if (!ws || ws.isDefault) {
      get().addToast({
        type: 'warning',
        title: 'Action Denied',
        message: 'Default workspace cannot be deleted.',
      });
      return;
    }
    const nextWorkspaces = get().workspaces.filter((w) => w.id !== workspaceId);
    const defaultWs = nextWorkspaces.find((w) => w.isDefault) || nextWorkspaces[0];
    const newSettings = {
      ...get().settings,
      workspaces: nextWorkspaces,
      activeWorkspaceId: defaultWs.id,
    };
    set({
      workspaces: nextWorkspaces,
      activeWorkspaceId: defaultWs.id,
      settings: newSettings,
    });
    await LifeOSRepository.saveSettings(newSettings);
    get().addToast({
      type: 'info',
      title: 'Workspace Deleted',
      message: `Switched back to ${defaultWs.name}.`,
    });
  },

  loadDemoData: async () => {
    await LifeOSRepository.loadDemoData();
    await get().initializeFromDB();
    get().addToast({
      type: 'success',
      title: 'Showcase Data Loaded',
      message: 'Demo records successfully loaded into active workspace.',
    });
  },

  purgeSeedData: async () => {
    await LifeOSRepository.purgeSeedDemoData();
    await get().initializeFromDB();
    get().addToast({
      type: 'info',
      title: 'Clean Slate Restored',
      message: 'All demo and sample records removed.',
    });
  },

  // ----------------------------------------------------
  // CAREER
  // ----------------------------------------------------
  addCareerGoal: async (cgData) => {
    const newCg: CareerGoal = { ...cgData, id: uuidv4() };
    set((s) => ({ careerGoals: [...s.careerGoals, newCg] }));
    await LifeOSRepository.saveCareerGoal(newCg);
  },

  toggleCareerMilestone: async (goalId, milestoneId) => {
    let updated: CareerGoal | undefined;
    set((s) => ({
      careerGoals: s.careerGoals.map((cg) => {
        if (cg.id === goalId) {
          const milestones = cg.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          updated = { ...cg, milestones };
          return updated;
        }
        return cg;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveCareerGoal(updated);
    }
  },

  updateSkillProficiency: async (id, proficiency) => {
    let updated: SkillItem | undefined;
    set((s) => ({
      careerSkills: s.careerSkills.map((sk) => {
        if (sk.id === id) {
          updated = { ...sk, proficiency };
          return updated;
        }
        return sk;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveCareerSkill(updated);
    }
  },

  addCareerSkill: async (skillData) => {
    const newSkill: SkillItem = { ...skillData, id: uuidv4() };
    set((s) => ({ careerSkills: [...s.careerSkills, newSkill] }));
    await LifeOSRepository.saveCareerSkill(newSkill);
  },

  addCareerProject: async (projData) => {
    const newProj: CareerProject = { ...projData, id: uuidv4() };
    set((s) => ({ careerProjects: [newProj, ...s.careerProjects] }));
    await LifeOSRepository.saveCareerProject(newProj);
  },

  deleteCareerProject: async (id) => {
    set((s) => ({ careerProjects: s.careerProjects.filter((cp) => cp.id !== id) }));
    await LifeOSRepository.deleteCareerProject(id);
  },

  addJobApplication: async (appData) => {
    const newApp: JobApplication = { ...appData, id: uuidv4() };
    set((s) => ({ careerApplications: [newApp, ...s.careerApplications] }));
    await LifeOSRepository.saveJobApplication(newApp);
  },

  updateJobStage: async (id, stage) => {
    let updated: JobApplication | undefined;
    set((s) => ({
      careerApplications: s.careerApplications.map((app) => {
        if (app.id === id) {
          updated = { ...app, stage };
          return updated;
        }
        return app;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveJobApplication(updated);
    }
  },

  deleteJobApplication: async (id) => {
    set((s) => ({ careerApplications: s.careerApplications.filter((app) => app.id !== id) }));
    await LifeOSRepository.deleteJobApplication(id);
  },

  // ----------------------------------------------------
  // EVENING REVIEW
  // ----------------------------------------------------
  saveEveningReview: async (reviewData) => {
    const now = new Date().toISOString();
    const review: EveningReview = {
      ...reviewData,
      id: reviewData.id || uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({
      eveningReviews: [review, ...s.eveningReviews.filter((r) => r.id !== review.id)],
    }));
    await LifeOSRepository.saveEveningReview(review);
  },

  // ----------------------------------------------------
  // OBSIDIAN NOTES
  // ----------------------------------------------------
  saveNote: async (noteData) => {
    const now = new Date().toISOString();
    const note: ObsidianNote = {
      ...noteData,
      id: noteData.id || uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({
      obsidianNotes: [note, ...s.obsidianNotes.filter((n) => n.id !== note.id)],
    }));
    await LifeOSRepository.saveNote(note);
  },

  deleteNote: async (id) => {
    set((s) => ({ obsidianNotes: s.obsidianNotes.filter((n) => n.id !== id) }));
    await LifeOSRepository.deleteNote(id);
  },

  // ----------------------------------------------------
  // AI ASSISTANT
  // ----------------------------------------------------
  addAssistantMessage: (msg) => {
    const newMsg: AssistantMessage = {
      ...msg,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ assistantMessages: [...s.assistantMessages, newMsg] }));
  },

  clearAssistantChat: () => {
    set({
      assistantMessages: [
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Chat history cleared. How can I assist you with your LIFE OS today?',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },

  // ----------------------------------------------------
  // SETTINGS & NAVIGATION
  // ----------------------------------------------------
  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await LifeOSRepository.saveSettings(newSettings);
  },

  updateReminderSettings: async (updates) => {
    const newSettings = {
      ...get().settings,
      reminder: { ...get().settings.reminder, ...updates },
    };
    set({ settings: newSettings });
    await LifeOSRepository.saveSettings(newSettings);
  },

  setTheme: async (theme) => {
    const newSettings = { ...get().settings, theme };
    set({ settings: newSettings });
    document.documentElement.setAttribute('data-theme', theme);
    await LifeOSRepository.saveSettings(newSettings);
  },

  setDesignVariant: async (variant) => {
    const newSettings = { ...get().settings, designVariant: variant };
    set({ designVariant: variant, settings: newSettings });
    document.documentElement.setAttribute('data-variant', variant);
    await LifeOSRepository.saveSettings(newSettings);
  },

  setComparisonMode: (mode) => {
    set({ comparisonMode: mode });
  },

  setActiveView: (view) => {
    const currentRecent = get().recentViews || [];
    const updatedRecent = [view, ...currentRecent.filter((v) => v !== view)].slice(0, 6);
    try {
      localStorage.setItem('lifeos_recent_views', JSON.stringify(updatedRecent));
    } catch {}
    set({ activeView: view, recentViews: updatedRecent });
  },

  togglePinView: (viewId) => {
    const current = get().pinnedViews || [];
    const updated = current.includes(viewId)
      ? current.filter((id) => id !== viewId)
      : [...current, viewId];
    try {
      localStorage.setItem('lifeos_pinned_views', JSON.stringify(updated));
    } catch {}
    set({ pinnedViews: updated });
  },

  // 12. Micro-Interactions & Toasts
  toasts: [],
  addToast: (toast) => {
    const id = uuidv4();
    const newToast: ToastItem = { ...toast, id, duration: toast.duration || 3500 };
    set((s) => ({ toasts: [...s.toasts, newToast] }));
  },
  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  // 14. Onboarding & Contextual Guidance Actions
  dismissTip: async (tipId) => {
    const currentDismissed = get().settings?.dismissedTips || [];
    if (!currentDismissed.includes(tipId)) {
      const updated = [...currentDismissed, tipId];
      await get().updateSettings({ dismissedTips: updated });
    }
  },

  resetDismissedTips: async () => {
    await get().updateSettings({ dismissedTips: [] });
    get().addToast({
      type: 'info',
      title: 'Guidance Restored',
      message: 'All contextual guidance tips have been re-enabled.',
    });
  },

  toggleDemoMode: async (enable) => {
    await get().updateSettings({ isDemoMode: enable });
    get().addToast({
      type: enable ? 'info' : 'success',
      title: enable ? 'Demo Mode Active' : 'Real Workspace Active',
      message: enable
        ? 'Exploring with sample scenario data. Real records are untouched.'
        : 'Returned to your primary workspace.',
    });
  },

  completeOnboarding: async (data) => {
    // 1. Update settings
    const updatedSettings: Partial<AppSettings> = {
      userName: data.userName,
      selectedLifeAreas: data.selectedLifeAreas,
      theme: data.theme,
      weekStartDay: data.weekStartDay,
      defaultFocusDuration: data.defaultFocusDuration,
      userAvatar: data.userAvatar,
      userGreeting: data.userGreeting,
      onboardingCompleted: true,
    };
    await get().updateSettings(updatedSettings);

    // 2. Set theme in DOM
    document.documentElement.setAttribute('data-theme', data.theme);

    // 3. Create initial goals if requested
    if (data.initialGoals && data.initialGoals.length > 0) {
      for (const g of data.initialGoals) {
        await get().addGoal({
          title: g.title,
          category: g.category,
          priority: g.priority,
          type: 'short-term',
          description: 'Created during onboarding setup.',
          targetDate: g.targetDate || toLocalDateString(new Date(Date.now() + 30 * 86400000)),
          progress: 0,
          milestones: [
            { id: uuidv4(), title: 'Initial setup & plan', isCompleted: false },
            { id: uuidv4(), title: 'First major milestone', isCompleted: false },
          ],
        });
      }
    }

    // 4. Create initial habits if requested
    if (data.initialHabits && data.initialHabits.length > 0) {
      for (const h of data.initialHabits) {
        await get().addHabit({
          name: h.name,
          category: h.category,
          frequency: (h.frequency === 'weekly' ? 'weekly' : 'daily'),
          targetDays: [0, 1, 2, 3, 4, 5, 6],
          color: '#B80C09',
          icon: 'Check',
        });
      }
    }

    // 5. Clean up draft state
    try {
      localStorage.setItem('lifeos_onboarding_completed', 'true');
      localStorage.removeItem('lifeos_onboarding_draft');
    } catch {}

    set({ isOnboardingOpen: false, activeView: 'dashboard' });
    get().addToast({
      type: 'success',
      title: `Welcome to LIFE OS, ${data.userName}!`,
      message: 'Your personal operating system is configured and ready.',
    });
  },

  resetToFreshSlate: async () => {
    await LifeOSRepository.clearAllData();
    try {
      localStorage.removeItem('lifeos_onboarding_completed');
      localStorage.removeItem('lifeos_onboarding_draft');
    } catch {}
    set({
      goals: [],
      tasks: [],
      habits: [],
      habitEntries: [],
      financeTransactions: [],
      workoutSessions: [],
      academicSubjects: [],
      careerProjects: [],
      careerApplications: [],
      obsidianNotes: [],
      isOnboardingOpen: true,
      activeView: 'dashboard',
    });
    get().addToast({
      type: 'info',
      title: 'Reset to Clean Slate',
      message: 'Database cleared. Onboarding wizard opened.',
    });
  },
}));

export default useStore;
