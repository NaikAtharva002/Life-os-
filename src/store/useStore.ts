import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LifeOSRepository } from '../db/repository';
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
} from '../types';

interface StoreState {
  isLoaded: boolean;
  activeView: string;

  // 1. Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'isArchived'> & { progress?: number; milestones?: Goal['milestones']; type?: Goal['type']; category?: string; coverImage?: string }) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;

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

  // 3. Habits
  habits: Habit[];
  habitEntries: HabitEntry[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak'> & { category?: string; entries?: HabitEntry[] }) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitEntry: (habitId: string, date: string) => Promise<void>;

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
  designVariant: DesignVariant;
  comparisonMode: 'single' | 'split';
  setDesignVariant: (variant: DesignVariant) => Promise<void>;
  setComparisonMode: (mode: 'single' | 'split') => void;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateReminderSettings: (updates: Partial<ReminderSettings>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
  setActiveView: (view: string) => void;
  initializeFromDB: () => Promise<void>;

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

  return next.toISOString().split('T')[0];
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
      content: 'Greetings Atharva! I am Astra, your LIFE OS AI copilot. I analyze your tasks, goals, habits, finances, workouts, and academics in real-time. Ask me to plan your day, audit your spending, or review your priorities.',
      timestamp: new Date().toISOString(),
    },
  ],
  isOnboardingOpen: false,
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),

  settings: {
    theme: 'dark',
    userName: 'Atharva',
    currencySymbol: '$',
    reminder: {
      enabled: true,
      time: '21:30',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    onboardingCompleted: true,
    selectedLifeAreas: ['goals', 'tasks', 'habits', 'finance', 'fitness', 'academics', 'career', 'obsidian'],
    weekStartDay: 'monday',
    defaultFocusDuration: 25,
    dismissedTips: [],
    isDemoMode: false,
  },

  initializeFromDB: async () => {
    try {
      const data = await LifeOSRepository.initialize();

      // Attach habitEntries to habit objects for compatibility with card renders
      const habitsWithEntries = data.habits.map((h) => ({
        ...h,
        entries: data.habitEntries.filter((e) => e.habitId === h.id),
      }));

      const loadedVariant = (data.settings?.designVariant as DesignVariant) || 'agent';

      // Check onboarding status
      const hasCompleted =
        data.settings?.onboardingCompleted ??
        (localStorage.getItem('lifeos_onboarding_completed') === 'true');
      const hasExistingRecords = data.tasks.length > 0 || data.goals.length > 0;
      const isDrafting = localStorage.getItem('lifeos_onboarding_draft') !== null;
      const shouldOpenOnboarding = (!hasCompleted && !hasExistingRecords) || isDrafting;

      set({
        ...data,
        habits: habitsWithEntries,
        designVariant: loadedVariant,
        isLoaded: true,
        isOnboardingOpen: shouldOpenOnboarding,
      });
      document.documentElement.setAttribute('data-variant', loadedVariant);
      get().markOverdueTasks();
    } catch (err) {
      console.error('[LifeOS Store] Failed to initialize from IndexedDB:', err);
      set({ isLoaded: true });
    }
  },

  // ----------------------------------------------------
  // GOALS
  // ----------------------------------------------------
  addGoal: async (goalData) => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      title: goalData.title,
      description: goalData.description || '',
      priority: goalData.priority,
      type: goalData.type || 'short-term',
      category: goalData.category || 'General',
      targetDate: goalData.targetDate,
      id: uuidv4(),
      progress: goalData.progress ?? 0,
      isArchived: false,
      milestones: goalData.milestones || [],
      coverImage: goalData.coverImage,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ goals: [newGoal, ...s.goals] }));
    await LifeOSRepository.saveGoal(newGoal);
  },

  updateGoal: async (id, updates) => {
    const now = new Date().toISOString();
    let updatedGoal: Goal | undefined;
    set((s) => ({
      goals: s.goals.map((g) => {
        if (g.id === id) {
          updatedGoal = { ...g, ...updates, updatedAt: now };
          return updatedGoal;
        }
        return g;
      }),
    }));
    if (updatedGoal) {
      await LifeOSRepository.saveGoal(updatedGoal);
    }
  },

  deleteGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    await LifeOSRepository.deleteGoal(id);
  },

  toggleMilestone: async (goalId, milestoneId) => {
    const now = new Date().toISOString();
    let updatedGoal: Goal | undefined;
    set((s) => ({
      goals: s.goals.map((g) => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        const completedCount = milestones.filter((m) => m.isCompleted).length;
        const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : g.progress;
        updatedGoal = {
          ...g,
          milestones,
          progress,
          updatedAt: now,
        };
        return updatedGoal;
      }),
    }));
    if (updatedGoal) {
      await LifeOSRepository.saveGoal(updatedGoal);
      const isMilestoneCompleted = updatedGoal.milestones.find((m) => m.id === milestoneId)?.isCompleted;
      if (isMilestoneCompleted) {
        get().addToast({
          type: 'success',
          title: 'Milestone Completed!',
          message: `${updatedGoal.title} progress updated to ${updatedGoal.progress}%.`
        });
      }
    }
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
    await LifeOSRepository.saveTask(newTask);
  },

  updateTask: async (id, updates) => {
    const now = new Date().toISOString();
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
      await LifeOSRepository.saveTask(updatedTask);
    }
  },

  deleteTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    await LifeOSRepository.deleteTask(id);
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
    const todayStr = new Date().toISOString().split('T')[0];
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
  // HABITS
  // ----------------------------------------------------
  addHabit: async (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      category: habitData.category || 'General',
      id: uuidv4(),
      streak: 0,
      longestStreak: 0,
      entries: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ habits: [...s.habits, newHabit] }));
    await LifeOSRepository.saveHabit(newHabit);
  },

  updateHabit: async (id, updates) => {
    let updated: Habit | undefined;
    set((s) => ({
      habits: s.habits.map((h) => {
        if (h.id === id) {
          updated = { ...h, ...updates };
          return updated;
        }
        return h;
      }),
    }));
    if (updated) {
      await LifeOSRepository.saveHabit(updated);
    }
  },

  deleteHabit: async (id) => {
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== id),
      habitEntries: s.habitEntries.filter((e) => e.habitId !== id),
    }));
    await LifeOSRepository.deleteHabit(id);
  },

  toggleHabitEntry: async (habitId, date) => {
    const entries = get().habitEntries;
    const existing = entries.find((e) => e.habitId === habitId && e.date === date);
    let nextEntries: HabitEntry[];

    if (existing) {
      if (existing.completed) {
        nextEntries = entries.filter((e) => e.id !== existing.id);
        await LifeOSRepository.deleteHabitEntry(existing.id);
      } else {
        const updated = { ...existing, completed: true };
        nextEntries = entries.map((e) => (e.id === existing.id ? updated : e));
        await LifeOSRepository.saveHabitEntry(updated);
      }
    } else {
      const newEntry: HabitEntry = {
        id: `he-${uuidv4()}`,
        habitId,
        date,
        completed: true,
      };
      nextEntries = [...entries, newEntry];
      await LifeOSRepository.saveHabitEntry(newEntry);
    }

    // Recalculate streak
    const habitEntriesForHabit = nextEntries
      .filter((e) => e.habitId === habitId && e.completed)
      .map((e) => e.date);
    const dateSet = new Set(habitEntriesForHabit);

    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dStr)) {
        streak++;
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const currentHabit = get().habits.find((h) => h.id === habitId);
    const longestStreak = Math.max(currentHabit?.longestStreak || 0, streak);

    set((s) => ({
      habitEntries: nextEntries,
      habits: s.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              streak,
              longestStreak,
              entries: nextEntries.filter((e) => e.habitId === habitId),
            }
          : h
      ),
    }));

    if (currentHabit) {
      await LifeOSRepository.saveHabit({ ...currentHabit, streak, longestStreak });
      const isCompletedNow = nextEntries.some((e) => e.habitId === habitId && e.date === date && e.completed);
      if (isCompletedNow) {
        get().addToast({
          type: 'success',
          title: 'Habit Logged',
          message: `${currentHabit.name} logged! 🔥 ${streak}d streak maintained.`
        });
      }
    }
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

  deleteTimetableSlot: async (id) => {
    set((s) => ({ timetableSlots: s.timetableSlots.filter((ts) => ts.id !== id) }));
    await LifeOSRepository.deleteTimetableSlot(id);
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
          targetDate: g.targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
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
