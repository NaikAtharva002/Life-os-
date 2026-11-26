import { db } from './index';
import { getInitialSeedData } from './seedData';
import { parseAndValidateBackup } from '../lib/backupSchema';
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
  CustomGraphNode,
  CustomGraphEdge,
  AppSettings,
} from '../types';

export class LifeOSRepository {
  /**
   * Initializes database and returns active user data. Fresh installs have zero dummy records.
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
    graphNodes: CustomGraphNode[];
    graphEdges: CustomGraphEdge[];
    settings: AppSettings;
  }> {
    const isInitialized = await db.appMeta.get('initialized');

    const defaultSettings: AppSettings = {
      theme: 'dark',
      userName: '',
      currencySymbol: '₹',
      dayStartHour: 4,
      reminder: {
        enabled: false,
        time: '21:30',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
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

    if (!isInitialized) {
      console.log('[LifeOS IndexedDB] Fresh installation detected. Initializing clean personal workspace...');
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
        graphNodes: [],
        graphEdges: [],
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
      graphNodes,
      graphEdges,
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
      db.graphNodes.toArray(),
      db.graphEdges.toArray(),
      db.appMeta.get('settings'),
    ]);

    const active = <T extends { deletedAt?: string | null }>(items: T[]): T[] =>
      items.filter((item) => !item.deletedAt);

    const mergedSettings: AppSettings = savedSettings?.value
      ? {
          ...defaultSettings,
          ...savedSettings.value,
          currencySymbol:
            !savedSettings.value.currencySymbol || savedSettings.value.currencySymbol === '$'
              ? '₹'
              : savedSettings.value.currencySymbol,
        }
      : defaultSettings;

    if (savedSettings?.value?.currencySymbol === '$') {
      await db.appMeta.put({ key: 'settings', value: mergedSettings });
    }

    return {
      goals: active(goals),
      tasks: active(tasks),
      habits: active(habits),
      habitEntries: active(habitEntries),
      financeTransactions: active(financeTransactions),
      financeBudgets: active(financeBudgets),
      savingsGoals: active(savingsGoals),
      exercises: active(exercises),
      workoutSessions: active(workoutSessions),
      bodyMetrics: active(bodyMetrics),
      fitnessGoals: active(fitnessGoals),
      academicSemesters: active(academicSemesters),
      academicSubjects: active(academicSubjects),
      academicAssignments: active(academicAssignments),
      academicExams: active(academicExams),
      timetableSlots: active(timetableSlots),
      careerGoals: active(careerGoals),
      careerSkills: active(careerSkills),
      careerProjects: active(careerProjects),
      careerApplications: active(careerApplications),
      careerDocuments: active(careerDocuments),
      eveningReviews: active(eveningReviews),
      obsidianNotes: active(obsidianNotes),
      graphNodes: active(graphNodes),
      graphEdges: active(graphEdges),
      settings: mergedSettings,
    };
  }

  // --- GOAL ACTIONS ---
  static async saveGoal(goal: Goal) {
    goal.updatedAt = goal.updatedAt || new Date().toISOString();
    await db.goals.put(goal);
  }
  static async deleteGoal(id: string) {
    await db.goals.delete(id);
  }
  static async softDeleteGoal(id: string) {
    const now = new Date().toISOString();
    await db.goals.update(id, { deletedAt: now, updatedAt: now });
  }

  // --- TASK ACTIONS ---
  static async saveTask(task: Task) {
    task.updatedAt = task.updatedAt || new Date().toISOString();
    await db.tasks.put(task);
  }
  static async deleteTask(id: string) {
    await db.tasks.delete(id);
  }
  static async softDeleteTask(id: string) {
    const now = new Date().toISOString();
    await db.tasks.update(id, { deletedAt: now, updatedAt: now });
  }

  // --- HABIT ACTIONS ---
  static async saveHabit(habit: Habit) {
    habit.updatedAt = habit.updatedAt || new Date().toISOString();
    await db.habits.put(habit);
  }
  static async deleteHabit(id: string) {
    await db.habits.delete(id);
    await db.habitEntries.where('habitId').equals(id).delete();
  }
  static async softDeleteHabit(id: string) {
    const now = new Date().toISOString();
    await db.habits.update(id, { deletedAt: now, updatedAt: now });
  }
  static async saveHabitEntry(entry: HabitEntry) {
    entry.updatedAt = entry.updatedAt || new Date().toISOString();
    await db.habitEntries.put(entry);
  }
  static async deleteHabitEntry(id: string) {
    await db.habitEntries.delete(id);
  }

  // --- FINANCE ACTIONS ---
  static async saveTransaction(tx: FinanceTransaction) {
    tx.updatedAt = tx.updatedAt || new Date().toISOString();
    await db.financeTransactions.put(tx);
  }
  static async deleteTransaction(id: string) {
    await db.financeTransactions.delete(id);
  }
  static async softDeleteTransaction(id: string) {
    const now = new Date().toISOString();
    await db.financeTransactions.update(id, { deletedAt: now, updatedAt: now });
  }
  static async saveBudget(b: FinanceBudget) {
    b.updatedAt = b.updatedAt || new Date().toISOString();
    await db.financeBudgets.put(b);
  }
  static async saveSavingsGoal(sg: SavingsGoal) {
    sg.updatedAt = sg.updatedAt || new Date().toISOString();
    await db.savingsGoals.put(sg);
  }
  static async deleteSavingsGoal(id: string) {
    await db.savingsGoals.delete(id);
  }

  // --- FITNESS ACTIONS ---
  static async saveWorkoutSession(ws: WorkoutSession) {
    ws.updatedAt = ws.updatedAt || new Date().toISOString();
    await db.workoutSessions.put(ws);
  }
  static async deleteWorkoutSession(id: string) {
    await db.workoutSessions.delete(id);
  }
  static async saveExercise(ex: ExerciseItem) {
    ex.updatedAt = ex.updatedAt || new Date().toISOString();
    await db.exercises.put(ex);
  }
  static async saveBodyMetric(bm: BodyMetric) {
    bm.updatedAt = bm.updatedAt || new Date().toISOString();
    await db.bodyMetrics.put(bm);
  }
  static async deleteBodyMetric(id: string) {
    await db.bodyMetrics.delete(id);
  }
  static async saveFitnessGoal(fg: FitnessGoal) {
    fg.updatedAt = fg.updatedAt || new Date().toISOString();
    await db.fitnessGoals.put(fg);
  }

  // --- ACADEMIC ACTIONS ---
  static async saveSemester(sem: AcademicSemester) {
    sem.updatedAt = sem.updatedAt || new Date().toISOString();
    await db.academicSemesters.put(sem);
  }
  static async saveSubject(sub: AcademicSubject) {
    sub.updatedAt = sub.updatedAt || new Date().toISOString();
    await db.academicSubjects.put(sub);
  }
  static async deleteSubject(id: string) {
    await db.academicSubjects.delete(id);
  }
  static async saveAssignment(asg: AcademicAssignment) {
    asg.updatedAt = asg.updatedAt || new Date().toISOString();
    await db.academicAssignments.put(asg);
  }
  static async deleteAssignment(id: string) {
    await db.academicAssignments.delete(id);
  }
  static async saveExam(exam: AcademicExam) {
    exam.updatedAt = exam.updatedAt || new Date().toISOString();
    await db.academicExams.put(exam);
  }
  static async deleteExam(id: string) {
    await db.academicExams.delete(id);
  }
  static async saveTimetableSlot(slot: TimetableSlot) {
    slot.updatedAt = slot.updatedAt || new Date().toISOString();
    await db.timetableSlots.put(slot);
  }
  static async deleteTimetableSlot(id: string) {
    await db.timetableSlots.delete(id);
  }

  // --- CAREER ACTIONS ---
  static async saveCareerGoal(cg: CareerGoal) {
    cg.updatedAt = cg.updatedAt || new Date().toISOString();
    await db.careerGoals.put(cg);
  }
  static async saveCareerSkill(skill: SkillItem) {
    skill.updatedAt = skill.updatedAt || new Date().toISOString();
    await db.careerSkills.put(skill);
  }
  static async saveCareerProject(proj: CareerProject) {
    proj.updatedAt = proj.updatedAt || new Date().toISOString();
    await db.careerProjects.put(proj);
  }
  static async deleteCareerProject(id: string) {
    await db.careerProjects.delete(id);
  }
  static async saveJobApplication(app: JobApplication) {
    app.updatedAt = app.updatedAt || new Date().toISOString();
    await db.careerApplications.put(app);
  }
  static async deleteJobApplication(id: string) {
    await db.careerApplications.delete(id);
  }

  // --- EVENING REVIEW ---
  static async saveEveningReview(review: EveningReview) {
    review.updatedAt = review.updatedAt || new Date().toISOString();
    await db.eveningReviews.put(review);
  }

  // --- OBSIDIAN NOTES ---
  static async saveNote(note: ObsidianNote) {
    note.updatedAt = note.updatedAt || new Date().toISOString();
    await db.obsidianNotes.put(note);
  }
  static async deleteNote(id: string) {
    await db.obsidianNotes.delete(id);
  }

  // --- KNOWLEDGE UNIVERSE GRAPH ---
  static async saveGraphNode(node: CustomGraphNode) {
    node.updatedAt = node.updatedAt || new Date().toISOString();
    await db.graphNodes.put(node);
  }
  static async deleteGraphNode(id: string) {
    await db.transaction('rw', [db.graphNodes, db.graphEdges], async () => {
      await db.graphNodes.delete(id);
      const edges = await db.graphEdges.toArray();
      for (const e of edges) {
        if (e.sourceId === id || e.targetId === id) {
          await db.graphEdges.delete(e.id);
        }
      }
    });
  }
  static async saveGraphEdge(edge: CustomGraphEdge) {
    edge.updatedAt = edge.updatedAt || new Date().toISOString();
    await db.graphEdges.put(edge);
  }
  static async deleteGraphEdge(id: string) {
    await db.graphEdges.delete(id);
  }

  // --- SETTINGS ---
  static async saveSettings(settings: AppSettings) {
    await db.appMeta.put({ key: 'settings', value: settings });
  }

  // --- BACKUP & RESTORE ---
  static async exportEntireDatabaseJSON(): Promise<string> {
    const settingsRecord = await db.appMeta.get('settings');
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      appVersion: '3.0.0',
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
      graphNodes: await db.graphNodes.toArray(),
      graphEdges: await db.graphEdges.toArray(),
      settings: settingsRecord?.value ?? settingsRecord,
    };
    return JSON.stringify(data, null, 2);
  }

  static async importEntireDatabaseJSON(jsonStr: string): Promise<boolean> {
    const validation = parseAndValidateBackup(jsonStr);
    if (!validation.success || !validation.data) {
      console.error('[LifeOS Repository] Backup validation failed:', validation.error);
      return false;
    }

    const data = validation.data;
    const now = new Date().toISOString();

    const sanitizeRecords = (arr: any[]) =>
      arr.map((item) => ({
        ...item,
        isDemo: item.isDemo ?? false,
        deletedAt: item.deletedAt ?? null,
        updatedAt: item.updatedAt || item.createdAt || now,
      }));

    try {
      await db.transaction(
        'rw',
        [
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
          db.graphNodes,
          db.graphEdges,
          db.appMeta,
        ],
        async () => {
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
          await db.graphNodes.clear();
          await db.graphEdges.clear();

          if (data.goals.length) await db.goals.bulkAdd(sanitizeRecords(data.goals));
          if (data.tasks.length) await db.tasks.bulkAdd(sanitizeRecords(data.tasks));
          if (data.habits.length) await db.habits.bulkAdd(sanitizeRecords(data.habits));
          if (data.habitEntries.length) await db.habitEntries.bulkAdd(sanitizeRecords(data.habitEntries));
          if (data.financeTransactions.length)
            await db.financeTransactions.bulkAdd(sanitizeRecords(data.financeTransactions));
          if (data.financeBudgets.length) await db.financeBudgets.bulkAdd(sanitizeRecords(data.financeBudgets));
          if (data.savingsGoals.length) await db.savingsGoals.bulkAdd(sanitizeRecords(data.savingsGoals));
          if (data.exercises.length) await db.exercises.bulkAdd(sanitizeRecords(data.exercises));
          if (data.workoutSessions.length) await db.workoutSessions.bulkAdd(sanitizeRecords(data.workoutSessions));
          if (data.bodyMetrics.length) await db.bodyMetrics.bulkAdd(sanitizeRecords(data.bodyMetrics));
          if (data.fitnessGoals.length) await db.fitnessGoals.bulkAdd(sanitizeRecords(data.fitnessGoals));
          if (data.academicSemesters.length)
            await db.academicSemesters.bulkAdd(sanitizeRecords(data.academicSemesters));
          if (data.academicSubjects.length)
            await db.academicSubjects.bulkAdd(sanitizeRecords(data.academicSubjects));
          if (data.academicAssignments.length)
            await db.academicAssignments.bulkAdd(sanitizeRecords(data.academicAssignments));
          if (data.academicExams.length) await db.academicExams.bulkAdd(sanitizeRecords(data.academicExams));
          if (data.timetableSlots.length) await db.timetableSlots.bulkAdd(sanitizeRecords(data.timetableSlots));
          if (data.careerGoals.length) await db.careerGoals.bulkAdd(sanitizeRecords(data.careerGoals));
          if (data.careerSkills.length) await db.careerSkills.bulkAdd(sanitizeRecords(data.careerSkills));
          if (data.careerProjects.length) await db.careerProjects.bulkAdd(sanitizeRecords(data.careerProjects));
          if (data.careerApplications.length)
            await db.careerApplications.bulkAdd(sanitizeRecords(data.careerApplications));
          if (data.careerDocuments.length) await db.careerDocuments.bulkAdd(sanitizeRecords(data.careerDocuments));
          if (data.eveningReviews.length) await db.eveningReviews.bulkAdd(sanitizeRecords(data.eveningReviews));
          if (data.obsidianNotes.length) await db.obsidianNotes.bulkAdd(sanitizeRecords(data.obsidianNotes));
          if (data.graphNodes?.length) await db.graphNodes.bulkAdd(sanitizeRecords(data.graphNodes));
          if (data.graphEdges?.length) await db.graphEdges.bulkAdd(sanitizeRecords(data.graphEdges));

          if (data.settings) {
            await db.appMeta.put({ key: 'settings', value: data.settings });
          }
          await db.appMeta.put({ key: 'initialized', value: true });
        }
      );

      return true;
    } catch (err) {
      console.error('[LifeOS Repository] Import failed:', err);
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    await db.transaction(
      'rw',
      [
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
        db.graphNodes,
        db.graphEdges,
      ],
      async () => {
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
        await db.graphNodes.clear();
        await db.graphEdges.clear();
      }
    );
  }

  /**
   * Purges demo records tagged with isDemo or matching seed fixtures. Preserves genuine user data.
   */
  static async purgeDemoData(): Promise<void> {
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

    await db.transaction(
      'rw',
      [
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
        db.attendanceRecords,
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
        db.graphNodes,
        db.graphEdges,
        db.appMeta,
      ],
      async () => {
        const purgeTable = async (table: any, seedIdSet?: Set<string>) => {
          const items = await table.toArray();
          for (const item of items) {
            if (item.isDemo === true || (seedIdSet && seedIdSet.has(item.id))) {
              await table.delete(item.id);
            }
          }
        };

        await purgeTable(db.goals, seedGoalIds);
        await purgeTable(db.tasks, seedTaskIds);
        await purgeTable(db.habits, seedHabitIds);

        const allEntries = await db.habitEntries.toArray();
        for (const e of allEntries) {
          if (e.isDemo === true || seedHabitIds.has(e.habitId)) {
            await db.habitEntries.delete(e.id);
          }
        }

        await purgeTable(db.financeTransactions, seedTxIds);
        await purgeTable(db.financeBudgets);
        await purgeTable(db.savingsGoals);
        await purgeTable(db.exercises);
        await purgeTable(db.workoutSessions, seedWsIds);
        await purgeTable(db.bodyMetrics);
        await purgeTable(db.fitnessGoals);
        await purgeTable(db.academicSemesters);
        await purgeTable(db.academicSubjects, seedSubIds);
        await purgeTable(db.attendanceRecords);
        await purgeTable(db.academicAssignments, seedAsgIds);
        await purgeTable(db.academicExams, seedExamIds);
        await purgeTable(db.timetableSlots, seedSlotIds);
        await purgeTable(db.careerGoals);
        await purgeTable(db.careerSkills);
        await purgeTable(db.careerProjects, seedProjIds);
        await purgeTable(db.careerApplications, seedAppIds);
        await purgeTable(db.careerDocuments);
        await purgeTable(db.eveningReviews);
        await purgeTable(db.obsidianNotes);
        await purgeTable(db.graphNodes);
        await purgeTable(db.graphEdges);

        const currSettings = (await db.appMeta.get('settings'))?.value || {};
        await db.appMeta.put({
          key: 'settings',
          value: { ...currSettings, isDemoMode: false },
        });
      }
    );
  }

  /**
   * Alias for backward compatibility with existing views.
   */
  static async purgeSeedDemoData(): Promise<void> {
    await this.purgeDemoData();
  }

  /**
   * Loads sample showcase demo records when explicitly requested, tagging them as isDemo: true.
   */
  static async loadDemoData(): Promise<void> {
    const seed = getInitialSeedData();
    const now = new Date().toISOString();

    const tagDemo = (arr: any[]) =>
      arr.map((item) => ({
        ...item,
        isDemo: true,
        deletedAt: null,
        updatedAt: item.updatedAt || now,
      }));

    await db.transaction(
      'rw',
      [
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
        db.graphNodes,
        db.graphEdges,
        db.appMeta,
      ],
      async () => {
        await db.goals.bulkPut(tagDemo(seed.goals));
        await db.tasks.bulkPut(tagDemo(seed.tasks));
        await db.habits.bulkPut(tagDemo(seed.habits));
        await db.habitEntries.bulkPut(tagDemo(seed.habitEntries));
        await db.financeTransactions.bulkPut(tagDemo(seed.financeTransactions));
        await db.financeBudgets.bulkPut(tagDemo(seed.financeBudgets));
        await db.savingsGoals.bulkPut(tagDemo(seed.savingsGoals));
        await db.exercises.bulkPut(tagDemo(seed.exercises));
        await db.workoutSessions.bulkPut(tagDemo(seed.workoutSessions));
        await db.bodyMetrics.bulkPut(tagDemo(seed.bodyMetrics));
        await db.fitnessGoals.bulkPut(tagDemo(seed.fitnessGoals));
        await db.academicSemesters.bulkPut(tagDemo(seed.academicSemesters));
        await db.academicSubjects.bulkPut(tagDemo(seed.academicSubjects));
        await db.academicAssignments.bulkPut(tagDemo(seed.academicAssignments));
        await db.academicExams.bulkPut(tagDemo(seed.academicExams));
        await db.timetableSlots.bulkPut(tagDemo(seed.timetableSlots));
        await db.careerGoals.bulkPut(tagDemo(seed.careerGoals));
        await db.careerSkills.bulkPut(tagDemo(seed.careerSkills));
        await db.careerProjects.bulkPut(tagDemo(seed.careerProjects));
        await db.careerApplications.bulkPut(tagDemo(seed.careerApplications));
        await db.careerDocuments.bulkPut(tagDemo(seed.careerDocuments));
        await db.eveningReviews.bulkPut(tagDemo(seed.eveningReviews));
        await db.obsidianNotes.bulkPut(tagDemo(seed.obsidianNotes));

        const currSettings = (await db.appMeta.get('settings'))?.value || {};
        await db.appMeta.put({
          key: 'settings',
          value: { ...currSettings, isDemoMode: true },
        });
      }
    );
  }

  static async resetDatabaseToFactory() {
    await db.delete();
    window.location.reload();
  }
}
