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
      console.log('[LifeOS IndexedDB] Fresh installation detected. Seeding database...');
      const seed = getInitialSeedData();

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
        await db.goals.bulkAdd(seed.goals);
        await db.tasks.bulkAdd(seed.tasks);
        await db.habits.bulkAdd(seed.habits);
        await db.habitEntries.bulkAdd(seed.habitEntries);
        await db.financeTransactions.bulkAdd(seed.financeTransactions);
        await db.financeBudgets.bulkAdd(seed.financeBudgets);
        await db.savingsGoals.bulkAdd(seed.savingsGoals);
        await db.exercises.bulkAdd(seed.exercises);
        await db.workoutSessions.bulkAdd(seed.workoutSessions);
        await db.bodyMetrics.bulkAdd(seed.bodyMetrics);
        await db.fitnessGoals.bulkAdd(seed.fitnessGoals);
        await db.academicSemesters.bulkAdd(seed.academicSemesters);
        await db.academicSubjects.bulkAdd(seed.academicSubjects);
        await db.academicAssignments.bulkAdd(seed.academicAssignments);
        await db.academicExams.bulkAdd(seed.academicExams);
        await db.timetableSlots.bulkAdd(seed.timetableSlots);
        await db.careerGoals.bulkAdd(seed.careerGoals);
        await db.careerSkills.bulkAdd(seed.careerSkills);
        await db.careerProjects.bulkAdd(seed.careerProjects);
        await db.careerApplications.bulkAdd(seed.careerApplications);
        await db.careerDocuments.bulkAdd(seed.careerDocuments);
        await db.eveningReviews.bulkAdd(seed.eveningReviews);
        await db.obsidianNotes.bulkAdd(seed.obsidianNotes);
        await db.appMeta.put({ key: 'initialized', value: true });
        await db.appMeta.put({ key: 'settings', value: seed.settings });
      });

      return seed;
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
      userName: 'Atharva',
      currencySymbol: '$',
      reminder: {
        enabled: true,
        time: '21:30',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
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

  static async resetDatabaseToFactory() {
    await db.delete();
    window.location.reload();
  }
}
