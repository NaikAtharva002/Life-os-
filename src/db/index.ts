import Dexie, { type Table } from 'dexie';
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
} from '../types';

export class LifeOSDatabase extends Dexie {
  goals!: Table<Goal, string>;
  tasks!: Table<Task, string>;
  habits!: Table<Habit, string>;
  habitEntries!: Table<HabitEntry, string>;
  financeTransactions!: Table<FinanceTransaction, string>;
  financeBudgets!: Table<FinanceBudget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  exercises!: Table<ExerciseItem, string>;
  bodyMetrics!: Table<BodyMetric, string>;
  fitnessGoals!: Table<FitnessGoal, string>;
  academicSemesters!: Table<AcademicSemester, string>;
  academicSubjects!: Table<AcademicSubject, string>;
  attendanceRecords!: Table<AttendanceRecord, string>;
  academicAssignments!: Table<AcademicAssignment, string>;
  academicExams!: Table<AcademicExam, string>;
  timetableSlots!: Table<TimetableSlot, string>;
  careerGoals!: Table<CareerGoal, string>;
  careerSkills!: Table<SkillItem, string>;
  careerProjects!: Table<CareerProject, string>;
  careerApplications!: Table<JobApplication, string>;
  careerDocuments!: Table<CareerDocument, string>;
  eveningReviews!: Table<EveningReview, string>;
  obsidianNotes!: Table<ObsidianNote, string>;
  appMeta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('LifeOS_IndexedDB');

    this.version(1).stores({
      goals: 'id, priority, type, category, targetDate, isArchived',
      tasks: 'id, priority, category, status, dueDate, isCompleted, isOverdue, goalId, academicSubjectId, careerProjectId',
      habits: 'id, category, frequency',
      habitEntries: 'id, habitId, date, [habitId+date]',
      financeTransactions: 'id, type, category, date, paymentMethod',
      financeBudgets: 'id, category, month',
      savingsGoals: 'id, isReached, targetDate',
      workoutSessions: 'id, date, splitType',
      exercises: 'id, category, name',
      bodyMetrics: 'id, date',
      fitnessGoals: 'id, isAchieved',
      academicSemesters: 'id, isCurrent, year',
      academicSubjects: 'id, semesterId, code',
      attendanceRecords: 'id, subjectId, date, [subjectId+date]',
      academicAssignments: 'id, subjectId, dueDate, isSubmitted',
      academicExams: 'id, subjectId, examDate',
      timetableSlots: 'id, subjectId, dayOfWeek',
      careerGoals: 'id, status',
      careerSkills: 'id, category, proficiency',
      careerProjects: 'id, status, featured',
      careerApplications: 'id, stage, company',
      careerDocuments: 'id, type',
      eveningReviews: 'id, date',
      obsidianNotes: 'id, folder, title, updatedAt',
      appMeta: 'key',
    });
  }
}

export const db = new LifeOSDatabase();
