import { db } from './index';
import { getInitialSeedData } from './seedData';
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
  AttendanceRecord,
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
} from '../types';

export class LifeOSRepository {
  /**
   * Initializes database and seeds sample data if fresh.
   */
  static async initialize(): Promise<{
    goals: Goal[];
    tasks: Task[];
    habits: Habit[];
    habitEntries: HabitEntry[];
    financeTransactions: FinanceTransaction[];
    financeBudgets: FinanceBudget[];
    savingsGoals: SavingsGoal[];
    exercises: ExerciseItem[];
    workoutSessions: WorkoutSession[];
    bodyMetrics: BodyMetric[];
    fitnessGoals: FitnessGoal[];
    academicSemesters: AcademicSemester[];
    academicSubjects: AcademicSubject[];
    academicAssignments: AcademicAssignment[];
    academicExams: AcademicExam[];
    timetableSlots: TimetableSlot[];
    careerGoals: CareerGoal[];
    careerSkills: SkillItem[];
    careerProjects: CareerProject[];
    careerApplications: JobApplication[];
    careerDocuments: CareerDocument[];
    eveningReviews: EveningReview[];
    obsidianNotes: ObsidianNote[];
    settings: AppSettings;
  }> {
    const isInitialized = await db.appMeta.get('initialized');

    if (!isInitialized) {
      console.log('[LifeOS IndexedDB] Fresh installation detected. Initializing clean personal workspace...');
      const defaultSettings: AppSettings = {
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
      };

      await db.appMeta.put({ key: 'initialized', value: true });
      await db.appMeta.put({ key: 'settings', value: defaultSettings });

      return {
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
        settings: defaultSettings,
      };
    }

    // Load existing data from IndexedDB
    const [
      goals,
      tasks,
      habits,
      habitEntries,
      financeTransactions,
      financeBudgets,
      savingsGoals,
      exercises,
      workoutSessions,
      bodyMetrics,
      fitnessGoals,
      academicSemesters,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      careerGoals,
      careerSkills,
      careerProjects,
      careerApplications,
      careerDocuments,
      eveningReviews,
      obsidianNotes,
      savedSettings,
    ] = await Promise.all([
      db.goals.toArray(),
      db.tasks.toArray(),
      db.habits.toArray(),
      db.habitEntries.toArray(),
      db.financeTransactions.toArray(),
      db.financeBudgets.toArray(),
      db.savingsGoals.toArray(),
      db.exercises.toArray(),
      db.workoutSessions.toArray(),
      db.bodyMetrics.toArray(),
      db.fitnessGoals.toArray(),
      db.academicSemesters.toArray(),
      db.academicSubjects.toArray(),
      db.academicAssignments.toArray(),
      db.academicExams.toArray(),
      db.timetableSlots.toArray(),
      db.careerGoals.toArray(),
      db.careerSkills.toArray(),
      db.careerProjects.toArray(),
      db.careerApplications.toArray(),
      db.careerDocuments.toArray(),
      db.eveningReviews.toArray(),
      db.obsidianNotes.toArray(),
      db.appMeta.get('settings'),
    ]);

    const defaultSettings: AppSettings = {
      theme: 'dark',
      userName: '',
      currencySymbol: '$',
      reminder: {
        enabled: false,
        time: '21:30',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
      onboardingCompleted: false,
      weekStartDay: 'monday',
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
    };

    return {
      goals,
      tasks,
      habits,
      habitEntries,
      financeTransactions,
      financeBudgets,
      savingsGoals,
      exercises,
      workoutSessions,
      bodyMetrics,
      fitnessGoals,
      academicSemesters,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      careerGoals,
      careerSkills,
      careerProjects,
      careerApplications,
      careerDocuments,
      eveningReviews,
      obsidianNotes,
      settings: savedSettings?.value || defaultSettings,
    };
  }

  // --- GOAL ACTIONS ---
  static async saveGoal(goal: Goal) {
    await db.goals.put(goal);
  }
  static async deleteGoal(id: string) {
    await db.goals.delete(id);
  }

  // --- TASK ACTIONS ---
  static async saveTask(task: Task) {
    await db.tasks.put(task);
  }
  static async deleteTask(id: string) {
    await db.tasks.delete(id);
  }

  // --- HABIT ACTIONS ---
  static async saveHabit(habit: Habit) {
    await db.habits.put(habit);
  }
  static async deleteHabit(id: string) {
    await db.habits.delete(id);
    await db.habitEntries.where('habitId').equals(id).delete();
  }
  static async saveHabitEntry(entry: HabitEntry) {
    await db.habitEntries.put(entry);
  }
  static async deleteHabitEntry(id: string) {
    await db.habitEntries.delete(id);
  }

  // --- FINANCE ACTIONS ---
  static async saveTransaction(tx: FinanceTransaction) {
    await db.financeTransactions.put(tx);
  }
  static async deleteTransaction(id: string) {
    await db.financeTransactions.delete(id);
  }
  static async saveBudget(b: FinanceBudget) {
    await db.financeBudgets.put(b);
  }
  static async saveSavingsGoal(sg: SavingsGoal) {
    await db.savingsGoals.put(sg);
  }
  static async deleteSavingsGoal(id: string) {
    await db.savingsGoals.delete(id);
  }

  // --- FITNESS ACTIONS ---
  static async saveWorkoutSession(ws: WorkoutSession) {
    await db.workoutSessions.put(ws);
  }
  static async deleteWorkoutSession(id: string) {
    await db.workoutSessions.delete(id);
  }
  static async saveExercise(ex: ExerciseItem) {
    await db.exercises.put(ex);
  }
  static async saveBodyMetric(bm: BodyMetric) {
    await db.bodyMetrics.put(bm);
  }
  static async deleteBodyMetric(id: string) {
    await db.bodyMetrics.delete(id);
  }
  static async saveFitnessGoal(fg: FitnessGoal) {
    await db.fitnessGoals.put(fg);
  }

  // --- ACADEMIC ACTIONS ---
  static async saveSemester(sem: AcademicSemester) {
    await db.academicSemesters.put(sem);
  }
  static async saveSubject(sub: AcademicSubject) {
    await db.academicSubjects.put(sub);
  }
  static async deleteSubject(id: string) {
    await db.academicSubjects.delete(id);
  }
  static async saveAssignment(asg: AcademicAssignment) {
    await db.academicAssignments.put(asg);
  }
  static async deleteAssignment(id: string) {
    await db.academicAssignments.delete(id);
  }
  static async saveExam(exam: AcademicExam) {
    await db.academicExams.put(exam);
  }
  static async deleteExam(id: string) {
    await db.academicExams.delete(id);
  }
  static async saveTimetableSlot(slot: TimetableSlot) {
    await db.timetableSlots.put(slot);
  }
  static async deleteTimetableSlot(id: string) {
    await db.timetableSlots.delete(id);
  }

  // --- CAREER ACTIONS ---
  static async saveCareerGoal(cg: CareerGoal) {
    await db.careerGoals.put(cg);
  }
  static async saveCareerSkill(skill: SkillItem) {
    await db.careerSkills.put(skill);
  }
  static async saveCareerProject(proj: CareerProject) {
    await db.careerProjects.put(proj);
  }
  static async deleteCareerProject(id: string) {
    await db.careerProjects.delete(id);
  }
  static async saveJobApplication(app: JobApplication) {
    await db.careerApplications.put(app);
  }
  static async deleteJobApplication(id: string) {
    await db.careerApplications.delete(id);
  }

  // --- EVENING REVIEW ---
  static async saveEveningReview(review: EveningReview) {
    await db.eveningReviews.put(review);
  }

  // --- OBSIDIAN NOTES ---
  static async saveNote(note: ObsidianNote) {
    await db.obsidianNotes.put(note);
  }
  static async deleteNote(id: string) {
    await db.obsidianNotes.delete(id);
  }

  // --- SETTINGS ---
  static async saveSettings(settings: AppSettings) {
    await db.appMeta.put({ key: 'settings', value: settings });
  }

  // --- BACKUP & RESTORE ---
  static async exportEntireDatabaseJSON(): Promise<string> {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      goals: await db.goals.toArray(),
      tasks: await db.tasks.toArray(),
      habits: await db.habits.toArray(),
      habitEntries: await db.habitEntries.toArray(),
      financeTransactions: await db.financeTransactions.toArray(),
      financeBudgets: await db.financeBudgets.toArray(),
      savingsGoals: await db.savingsGoals.toArray(),
      exercises: await db.exercises.toArray(),
      workoutSessions: await db.workoutSessions.toArray(),
      bodyMetrics: await db.bodyMetrics.toArray(),
      fitnessGoals: await db.fitnessGoals.toArray(),
      academicSemesters: await db.academicSemesters.toArray(),
      academicSubjects: await db.academicSubjects.toArray(),
      academicAssignments: await db.academicAssignments.toArray(),
      academicExams: await db.academicExams.toArray(),
      timetableSlots: await db.timetableSlots.toArray(),
      careerGoals: await db.careerGoals.toArray(),
      careerSkills: await db.careerSkills.toArray(),
      careerProjects: await db.careerProjects.toArray(),
      careerApplications: await db.careerApplications.toArray(),
      careerDocuments: await db.careerDocuments.toArray(),
      eveningReviews: await db.eveningReviews.toArray(),
      obsidianNotes: await db.obsidianNotes.toArray(),
      settings: (await db.appMeta.get('settings'))?.value,
    };
    return JSON.stringify(data, null, 2);
  }

  static async importEntireDatabaseJSON(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;

      await db.transaction('rw', [
        db.goals,
        db.tasks,
        db.habits,
        db.habitEntries,
        db.financeTransactions,
        db.financeBudgets,
        db.savingsGoals,
        db.exercises,
        db.workoutSessions,
        db.bodyMetrics,
        db.fitnessGoals,
        db.academicSemesters,
        db.academicSubjects,
        db.academicAssignments,
        db.academicExams,
        db.timetableSlots,
        db.careerGoals,
        db.careerSkills,
        db.careerProjects,
        db.careerApplications,
        db.careerDocuments,
        db.eveningReviews,
        db.obsidianNotes,
        db.appMeta,
      ], async () => {
        await db.goals.clear();
        await db.tasks.clear();
        await db.habits.clear();
        await db.habitEntries.clear();
        await db.financeTransactions.clear();
        await db.financeBudgets.clear();
        await db.savingsGoals.clear();
        await db.exercises.clear();
        await db.workoutSessions.clear();
        await db.bodyMetrics.clear();
        await db.fitnessGoals.clear();
        await db.academicSemesters.clear();
        await db.academicSubjects.clear();
        await db.academicAssignments.clear();
        await db.academicExams.clear();
        await db.timetableSlots.clear();
        await db.careerGoals.clear();
        await db.careerSkills.clear();
        await db.careerProjects.clear();
        await db.careerApplications.clear();
        await db.careerDocuments.clear();
        await db.eveningReviews.clear();
        await db.obsidianNotes.clear();

        if (Array.isArray(data.goals)) await db.goals.bulkAdd(data.goals);
        if (Array.isArray(data.tasks)) await db.tasks.bulkAdd(data.tasks);
        if (Array.isArray(data.habits)) await db.habits.bulkAdd(data.habits);
        if (Array.isArray(data.habitEntries)) await db.habitEntries.bulkAdd(data.habitEntries);
        if (Array.isArray(data.financeTransactions)) await db.financeTransactions.bulkAdd(data.financeTransactions);
        if (Array.isArray(data.financeBudgets)) await db.financeBudgets.bulkAdd(data.financeBudgets);
        if (Array.isArray(data.savingsGoals)) await db.savingsGoals.bulkAdd(data.savingsGoals);
        if (Array.isArray(data.exercises)) await db.exercises.bulkAdd(data.exercises);
        if (Array.isArray(data.workoutSessions)) await db.workoutSessions.bulkAdd(data.workoutSessions);
        if (Array.isArray(data.bodyMetrics)) await db.bodyMetrics.bulkAdd(data.bodyMetrics);
        if (Array.isArray(data.fitnessGoals)) await db.fitnessGoals.bulkAdd(data.fitnessGoals);
        if (Array.isArray(data.academicSemesters)) await db.academicSemesters.bulkAdd(data.academicSemesters);
        if (Array.isArray(data.academicSubjects)) await db.academicSubjects.bulkAdd(data.academicSubjects);
        if (Array.isArray(data.academicAssignments)) await db.academicAssignments.bulkAdd(data.academicAssignments);
        if (Array.isArray(data.academicExams)) await db.academicExams.bulkAdd(data.academicExams);
        if (Array.isArray(data.timetableSlots)) await db.timetableSlots.bulkAdd(data.timetableSlots);
        if (Array.isArray(data.careerGoals)) await db.careerGoals.bulkAdd(data.careerGoals);
        if (Array.isArray(data.careerSkills)) await db.careerSkills.bulkAdd(data.careerSkills);
        if (Array.isArray(data.careerProjects)) await db.careerProjects.bulkAdd(data.careerProjects);
        if (Array.isArray(data.careerApplications)) await db.careerApplications.bulkAdd(data.careerApplications);
        if (Array.isArray(data.careerDocuments)) await db.careerDocuments.bulkAdd(data.careerDocuments);
        if (Array.isArray(data.eveningReviews)) await db.eveningReviews.bulkAdd(data.eveningReviews);
        if (Array.isArray(data.obsidianNotes)) await db.obsidianNotes.bulkAdd(data.obsidianNotes);
        if (data.settings) await db.appMeta.put({ key: 'settings', value: data.settings });
        await db.appMeta.put({ key: 'initialized', value: true });
      });

      return true;
    } catch (err) {
      console.error('[LifeOS Repository] Import failed:', err);
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    await db.transaction('rw', [
      db.goals,
      db.tasks,
      db.habits,
      db.habitEntries,
      db.financeTransactions,
      db.financeBudgets,
      db.savingsGoals,
      db.exercises,
      db.workoutSessions,
      db.bodyMetrics,
      db.fitnessGoals,
      db.academicSemesters,
      db.academicSubjects,
      db.academicAssignments,
      db.academicExams,
      db.timetableSlots,
      db.careerGoals,
      db.careerSkills,
      db.careerProjects,
      db.careerApplications,
      db.careerDocuments,
      db.eveningReviews,
      db.obsidianNotes,
    ], async () => {
      await db.goals.clear();
      await db.tasks.clear();
      await db.habits.clear();
      await db.habitEntries.clear();
      await db.financeTransactions.clear();
      await db.financeBudgets.clear();
      await db.savingsGoals.clear();
      await db.exercises.clear();
      await db.workoutSessions.clear();
      await db.bodyMetrics.clear();
      await db.fitnessGoals.clear();
      await db.academicSemesters.clear();
      await db.academicSubjects.clear();
      await db.academicAssignments.clear();
      await db.academicExams.clear();
      await db.timetableSlots.clear();
      await db.careerGoals.clear();
      await db.careerSkills.clear();
      await db.careerProjects.clear();
      await db.careerApplications.clear();
      await db.careerDocuments.clear();
      await db.eveningReviews.clear();
      await db.obsidianNotes.clear();
    });
  }

  /**
   * Purges known fake demo records so users have a clean slate while preserving genuinely created records.
   */
  static async purgeSeedDemoData(): Promise<void> {
    const seed = getInitialSeedData();
    const seedGoalIds = new Set(seed.goals.map((g) => g.id));
    const seedTaskIds = new Set(seed.tasks.map((t) => t.id));
    const seedHabitIds = new Set(seed.habits.map((h) => h.id));
    const seedTxIds = new Set(seed.financeTransactions.map((tx) => tx.id));
    const seedSubIds = new Set(seed.academicSubjects.map((s) => s.id));
    const seedSlotIds = new Set(seed.timetableSlots.map((ts) => ts.id));
    const seedAsgIds = new Set(seed.academicAssignments.map((a) => a.id));
    const seedExamIds = new Set(seed.academicExams.map((e) => e.id));
    const seedProjIds = new Set(seed.careerProjects.map((p) => p.id));
    const seedAppIds = new Set(seed.careerApplications.map((a) => a.id));
    const seedWsIds = new Set(seed.workoutSessions.map((w) => w.id));

    await db.transaction('rw', [
      db.goals, db.tasks, db.habits, db.habitEntries,
      db.financeTransactions, db.academicSubjects,
      db.timetableSlots, db.academicAssignments, db.academicExams,
      db.careerProjects, db.careerApplications, db.workoutSessions,
    ], async () => {
      const allGoals = await db.goals.toArray();
      for (const g of allGoals) {
        if (seedGoalIds.has(g.id)) await db.goals.delete(g.id);
      }
      const allTasks = await db.tasks.toArray();
      for (const t of allTasks) {
        if (seedTaskIds.has(t.id)) await db.tasks.delete(t.id);
      }
      const allHabits = await db.habits.toArray();
      for (const h of allHabits) {
        if (seedHabitIds.has(h.id)) {
          await db.habits.delete(h.id);
          await db.habitEntries.where('habitId').equals(h.id).delete();
        }
      }
      const allTxs = await db.financeTransactions.toArray();
      for (const tx of allTxs) {
        if (seedTxIds.has(tx.id)) await db.financeTransactions.delete(tx.id);
      }
      const allSubs = await db.academicSubjects.toArray();
      for (const s of allSubs) {
        if (seedSubIds.has(s.id)) await db.academicSubjects.delete(s.id);
      }
      const allSlots = await db.timetableSlots.toArray();
      for (const sl of allSlots) {
        if (seedSlotIds.has(sl.id)) await db.timetableSlots.delete(sl.id);
      }
      const allAsgs = await db.academicAssignments.toArray();
      for (const a of allAsgs) {
        if (seedAsgIds.has(a.id)) await db.academicAssignments.delete(a.id);
      }
      const allExams = await db.academicExams.toArray();
      for (const e of allExams) {
        if (seedExamIds.has(e.id)) await db.academicExams.delete(e.id);
      }
      const allProjs = await db.careerProjects.toArray();
      for (const p of allProjs) {
        if (seedProjIds.has(p.id)) await db.careerProjects.delete(p.id);
      }
      const allApps = await db.careerApplications.toArray();
      for (const a of allApps) {
        if (seedAppIds.has(a.id)) await db.careerApplications.delete(a.id);
      }
      const allWs = await db.workoutSessions.toArray();
      for (const w of allWs) {
        if (seedWsIds.has(w.id)) await db.workoutSessions.delete(w.id);
      }
    });
  }

  /**
   * Loads sample showcase demo records when explicitly requested.
   */
  static async loadDemoData(): Promise<void> {
    const seed = getInitialSeedData();
    await db.transaction('rw', [
      db.goals, db.tasks, db.habits, db.habitEntries,
      db.financeTransactions, db.financeBudgets, db.savingsGoals,
      db.exercises, db.workoutSessions, db.bodyMetrics, db.fitnessGoals,
      db.academicSemesters, db.academicSubjects, db.academicAssignments,
      db.academicExams, db.timetableSlots, db.careerGoals, db.careerSkills,
      db.careerProjects, db.careerApplications, db.careerDocuments,
      db.eveningReviews, db.obsidianNotes,
    ], async () => {
      await db.goals.bulkPut(seed.goals);
      await db.tasks.bulkPut(seed.tasks);
      await db.habits.bulkPut(seed.habits);
      await db.habitEntries.bulkPut(seed.habitEntries);
      await db.financeTransactions.bulkPut(seed.financeTransactions);
      await db.financeBudgets.bulkPut(seed.financeBudgets);
      await db.savingsGoals.bulkPut(seed.savingsGoals);
      await db.exercises.bulkPut(seed.exercises);
      await db.workoutSessions.bulkPut(seed.workoutSessions);
      await db.bodyMetrics.bulkPut(seed.bodyMetrics);
      await db.fitnessGoals.bulkPut(seed.fitnessGoals);
      await db.academicSemesters.bulkPut(seed.academicSemesters);
      await db.academicSubjects.bulkPut(seed.academicSubjects);
      await db.academicAssignments.bulkPut(seed.academicAssignments);
      await db.academicExams.bulkPut(seed.academicExams);
      await db.timetableSlots.bulkPut(seed.timetableSlots);
      await db.careerGoals.bulkPut(seed.careerGoals);
      await db.careerSkills.bulkPut(seed.careerSkills);
      await db.careerProjects.bulkPut(seed.careerProjects);
      await db.careerApplications.bulkPut(seed.careerApplications);
      await db.careerDocuments.bulkPut(seed.careerDocuments);
      await db.eveningReviews.bulkPut(seed.eveningReviews);
      await db.obsidianNotes.bulkPut(seed.obsidianNotes);
    });
  }

  static async resetDatabaseToFactory() {
    await db.delete();
    window.location.reload();
  }
}
