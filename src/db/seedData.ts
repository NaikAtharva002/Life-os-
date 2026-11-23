import { v4 as uuidv4 } from 'uuid';
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
} from '../types';

export function getInitialSeedData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const daysAgo = (d: number) => {
    const dt = new Date(now.getTime() - d * 86400000);
    return dt.toISOString().split('T')[0];
  };

  const daysFromNow = (d: number) => {
    const dt = new Date(now.getTime() + d * 86400000);
    return dt.toISOString().split('T')[0];
  };

  // 1. GOALS
  const goals: Goal[] = [
    {
      id: 'g-1',
      title: 'Launch SaaS Platform v1.0',
      description: 'Ship MVP with Stripe billing, authentication, and onboarding for early beta customers.',
      priority: 'critical',
      type: 'short-term',
      category: 'Career & Work',
      targetDate: daysFromNow(14),
      progress: 65,
      milestones: [
        { id: 'm-1', title: 'Core database schema & secure auth pipeline', isCompleted: true },
        { id: 'm-2', title: 'Interactive user dashboard with telemetry', isCompleted: true },
        { id: 'm-3', title: 'Stripe webhook verification & checkout flow', isCompleted: false, dueDate: daysFromNow(3) },
        { id: 'm-4', title: 'Production deployment & end-to-end smoke testing', isCompleted: false, dueDate: daysFromNow(12) },
      ],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
      isArchived: false,
    },
    {
      id: 'g-2',
      title: 'Score 9.5+ SGPA in Semester 5',
      description: 'Master core subjects (Distributed Systems, ML, Compilers) and submit all assignments with distinction.',
      priority: 'high',
      type: 'short-term',
      category: 'Academics',
      targetDate: daysFromNow(45),
      progress: 55,
      milestones: [
        { id: 'm-5', title: 'Complete Distributed Systems Raft assignment', isCompleted: true },
        { id: 'm-6', title: 'Machine Learning lab portfolio & mini-project', isCompleted: true },
        { id: 'm-7', title: 'Revise 100% syllabus for Mid-Semester Exams', isCompleted: false, dueDate: daysFromNow(15) },
      ],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
      isArchived: false,
    },
    {
      id: 'g-3',
      title: 'Achieve 12% Body Fat & 80kg Lean Mass',
      description: 'Progressive overload on 4-day Upper/Lower split combined with 160g daily protein nutrition.',
      priority: 'high',
      type: 'medium-term',
      category: 'Health & Fitness',
      targetDate: daysFromNow(90),
      progress: 45,
      milestones: [
        { id: 'm-8', title: 'Hit consistent 4x weekly gym sessions for 6 weeks', isCompleted: true },
        { id: 'm-9', title: 'Reach 100kg Bench Press 1RM', isCompleted: false, dueDate: daysFromNow(30) },
        { id: 'm-10', title: 'Cut weight from 78kg to 74kg with maintained strength', isCompleted: false, dueDate: daysFromNow(75) },
      ],
      createdAt: daysAgo(40),
      updatedAt: daysAgo(1),
      isArchived: false,
    },
    {
      id: 'g-4',
      title: 'Build $10,000 Emergency Liquidity Reserve',
      description: 'Maintain 6 months of living expenses in high-yield liquid treasury fund.',
      priority: 'medium',
      type: 'long-term',
      category: 'Wealth & Finance',
      targetDate: daysFromNow(180),
      progress: 68,
      milestones: [
        { id: 'm-11', title: 'Reach $5,000 baseline reserve', isCompleted: true },
        { id: 'm-12', title: 'Automate $600 monthly transfer to high-yield reserve', isCompleted: true },
        { id: 'm-13', title: 'Reach $10,000 full safety cushion', isCompleted: false, dueDate: daysFromNow(180) },
      ],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(5),
      isArchived: false,
    },
  ];

  // 2. TASKS
  const tasks: Task[] = [
    {
      id: 't-1',
      title: 'Stripe Webhook Signature Verification & Idempotency',
      description: 'Implement HMAC SHA-256 signature verification to prevent duplicate event execution.',
      priority: 'critical',
      category: 'Career & Work',
      status: 'in-progress',
      dueDate: todayStr,
      dueTime: '17:00',
      isCompleted: false,
      isOverdue: false,
      recurrence: 'none',
      goalId: 'g-1',
      subtasks: [
        { id: 'st-1', title: 'Verify Stripe-Signature header', isCompleted: true },
        { id: 'st-2', title: 'Persist event IDs in database table', isCompleted: true },
        { id: 'st-3', title: 'Handle customer.subscription.deleted event', isCompleted: false },
      ],
      createdAt: daysAgo(2),
      updatedAt: todayStr,
    },
    {
      id: 't-2',
      title: 'Distributed Systems Raft Consensus Paper Analysis',
      description: 'Review leader election and log replication sections for tomorrow class seminar.',
      priority: 'high',
      category: 'Academics',
      status: 'todo',
      dueDate: todayStr,
      dueTime: '20:00',
      isCompleted: false,
      isOverdue: false,
      goalId: 'g-2',
      academicSubjectId: 'sub-1',
      subtasks: [
        { id: 'st-4', title: 'Diagram RPC term escalation state machine', isCompleted: false },
        { id: 'st-5', title: 'Draft 1-page executive summary', isCompleted: false },
      ],
      createdAt: daysAgo(1),
      updatedAt: todayStr,
    },
    {
      id: 't-3',
      title: 'Upper Body Hypertrophy Session (Bench & Rows)',
      description: 'Focus on 4x8 heavy bench press followed by chest-supported rows and lateral raises.',
      priority: 'high',
      category: 'Health & Fitness',
      status: 'todo',
      dueDate: todayStr,
      dueTime: '18:30',
      isCompleted: false,
      isOverdue: false,
      goalId: 'g-3',
      subtasks: [],
      createdAt: todayStr,
      updatedAt: todayStr,
    },
    {
      id: 't-4',
      title: 'Audit Monthly Recurring SaaS Subscriptions',
      description: 'Cancel unused cloud instances and tools to keep tech spending under $100 budget.',
      priority: 'medium',
      category: 'Wealth & Finance',
      status: 'done',
      dueDate: todayStr,
      isCompleted: true,
      completedAt: `${todayStr}T11:20:00Z`,
      isOverdue: false,
      goalId: 'g-4',
      subtasks: [],
      createdAt: daysAgo(3),
      updatedAt: todayStr,
    },
    {
      id: 't-5',
      title: 'Submit Machine Learning Lab Experiment 3',
      description: 'Convolutional neural network fine-tuning on CIFAR-10 with confusion matrix analysis.',
      priority: 'high',
      category: 'Academics',
      status: 'todo',
      dueDate: daysAgo(1), // Overdue intentionally for testing!
      isCompleted: false,
      isOverdue: true,
      academicSubjectId: 'sub-3',
      subtasks: [],
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      id: 't-6',
      title: 'Review System Design Mock Interview Feedback',
      description: 'Revisit cache invalidation strategies and database sharding techniques.',
      priority: 'medium',
      category: 'Career & Work',
      status: 'todo',
      dueDate: daysFromNow(2),
      isCompleted: false,
      isOverdue: false,
      careerProjectId: 'cp-1',
      subtasks: [],
      createdAt: daysAgo(1),
      updatedAt: todayStr,
    },
  ];

  // 3. HABITS & HABIT ENTRIES
  const habits: Habit[] = [
    {
      id: 'h-1',
      name: 'Deep Work (90m Focused Sprint)',
      description: 'High-cognitive output with zero notifications and ambient focus audio.',
      category: 'Productivity',
      frequency: 'daily',
      targetDays: [1, 2, 3, 4, 5],
      color: '#7c5cfc',
      icon: 'Zap',
      streak: 16,
      longestStreak: 24,
      createdAt: daysAgo(45),
    },
    {
      id: 'h-2',
      name: 'Gym / Resistance Training',
      description: '45-60 min strength and progressive overload session.',
      category: 'Fitness',
      frequency: 'daily',
      targetDays: [1, 2, 4, 5, 6],
      color: '#B80C09',
      icon: 'Dumbbell',
      streak: 9,
      longestStreak: 18,
      createdAt: daysAgo(60),
    },
    {
      id: 'h-3',
      name: 'Read 20 Pages Non-Fiction',
      description: 'Deep reading in systems engineering, finance, or cognitive psychology.',
      category: 'Learning',
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      color: '#f59e0b',
      icon: 'BookOpen',
      streak: 22,
      longestStreak: 35,
      createdAt: daysAgo(50),
    },
    {
      id: 'h-4',
      name: 'Log Daily Expenses',
      description: 'Record every purchase and keep finances organized in real-time.',
      category: 'Finance',
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      color: '#06b6d4',
      icon: 'DollarSign',
      streak: 12,
      longestStreak: 19,
      createdAt: daysAgo(40),
    },
    {
      id: 'h-5',
      name: '8 Hours Quality Sleep',
      description: 'Consistent sleep window: in bed by 23:00, awake at 07:00.',
      category: 'Health',
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      color: '#ec4899',
      icon: 'Moon',
      streak: 6,
      longestStreak: 14,
      createdAt: daysAgo(30),
    },
  ];

  // Generate 45 days of realistic entries for visual heatmap!
  const habitEntries: HabitEntry[] = [];
  for (let i = 0; i < 45; i++) {
    const dStr = daysAgo(i);
    // h-1
    if (i % 7 !== 0 && i % 7 !== 6) {
      habitEntries.push({ id: `he-1-${dStr}`, habitId: 'h-1', date: dStr, completed: i < 16 });
    }
    // h-2
    if ([1, 2, 4, 5, 6].includes(new Date(dStr).getDay())) {
      habitEntries.push({ id: `he-2-${dStr}`, habitId: 'h-2', date: dStr, completed: i < 9 || (i % 3 !== 0) });
    }
    // h-3
    habitEntries.push({ id: `he-3-${dStr}`, habitId: 'h-3', date: dStr, completed: i < 22 || i % 4 !== 0 });
    // h-4
    habitEntries.push({ id: `he-4-${dStr}`, habitId: 'h-4', date: dStr, completed: i < 12 || i % 2 === 0 });
    // h-5
    habitEntries.push({ id: `he-5-${dStr}`, habitId: 'h-5', date: dStr, completed: i < 6 || i % 3 === 0 });
  }

  // 4. FINANCE TRANSACTIONS & BUDGETS
  const currentMonthStr = todayStr.substring(0, 7);
  const financeTransactions: FinanceTransaction[] = [
    {
      id: 'ft-1',
      type: 'income',
      amount: 2400.0,
      category: 'Salary & Freelance',
      date: daysAgo(4),
      description: 'Software Engineering Consulting & Milestone Payout',
      paymentMethod: 'Bank Transfer',
      tags: ['consulting', 'tech'],
      createdAt: daysAgo(4),
    },
    {
      id: 'ft-2',
      type: 'expense',
      amount: 650.0,
      category: 'Housing',
      date: daysAgo(10),
      description: 'Apartment Monthly Rent & Utilities',
      paymentMethod: 'Bank Transfer',
      tags: ['rent', 'fixed'],
      createdAt: daysAgo(10),
    },
    {
      id: 'ft-3',
      type: 'expense',
      amount: 142.5,
      category: 'Groceries',
      date: daysAgo(3),
      description: 'Weekly High-Protein Groceries & Whole Foods',
      paymentMethod: 'Credit Card',
      tags: ['groceries', 'nutrition'],
      createdAt: daysAgo(3),
    },
    {
      id: 'ft-4',
      type: 'expense',
      amount: 48.0,
      category: 'Tech & Tools',
      date: daysAgo(2),
      description: 'Claude Pro & GitHub Copilot Subscriptions',
      paymentMethod: 'Credit Card',
      tags: ['software', 'productivity'],
      createdAt: daysAgo(2),
    },
    {
      id: 'ft-5',
      type: 'expense',
      amount: 32.0,
      category: 'Dining',
      date: todayStr,
      description: 'Healthy Lunch with Colleagues',
      paymentMethod: 'UPI',
      tags: ['social'],
      createdAt: todayStr,
    },
    {
      id: 'ft-6',
      type: 'expense',
      amount: 55.0,
      category: 'Fitness',
      date: daysAgo(12),
      description: 'Gym Membership & Whey Protein Isolate',
      paymentMethod: 'Debit Card',
      tags: ['gym'],
      createdAt: daysAgo(12),
    },
  ];

  const financeBudgets: FinanceBudget[] = [
    { id: 'b-1', category: 'Housing', monthlyLimit: 700.0, month: currentMonthStr },
    { id: 'b-2', category: 'Groceries', monthlyLimit: 300.0, month: currentMonthStr },
    { id: 'b-3', category: 'Tech & Tools', monthlyLimit: 100.0, month: currentMonthStr },
    { id: 'b-4', category: 'Dining', monthlyLimit: 150.0, month: currentMonthStr },
    { id: 'b-5', category: 'Fitness', monthlyLimit: 80.0, month: currentMonthStr },
  ];

  const savingsGoals: SavingsGoal[] = [
    {
      id: 'sg-1',
      title: 'Emergency Liquidity Cushion',
      targetAmount: 10000.0,
      currentAmount: 6800.0,
      targetDate: daysFromNow(180),
      category: 'Safety',
      isReached: false,
      createdAt: daysAgo(60),
    },
    {
      id: 'sg-2',
      title: 'MacBook Pro M4 Max Upgrade',
      targetAmount: 2500.0,
      currentAmount: 1950.0,
      targetDate: daysFromNow(60),
      category: 'Hardware',
      isReached: false,
      createdAt: daysAgo(45),
    },
  ];

  // 5. GYM & FITNESS
  const exercises: ExerciseItem[] = [
    { id: 'ex-1', name: 'Barbell Flat Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', equipment: 'Barbell & Bench' },
    { id: 'ex-2', name: 'Incline Dumbbell Press', category: 'Chest', targetMuscle: 'Clavicular Head', equipment: 'Dumbbells & Incline Bench' },
    { id: 'ex-3', name: 'Barbell Back Squat', category: 'Legs', targetMuscle: 'Quadriceps & Glutes', equipment: 'Squat Rack' },
    { id: 'ex-4', name: 'Romanian Deadlift', category: 'Legs', targetMuscle: 'Hamstrings & Posterior Chain', equipment: 'Barbell' },
    { id: 'ex-5', name: 'Weighted Pull-ups', category: 'Back', targetMuscle: 'Latissimus Dorsi', equipment: 'Pull-up Bar' },
    { id: 'ex-6', name: 'Chest-Supported Row', category: 'Back', targetMuscle: 'Rhomboids & Mid Traps', equipment: 'Dumbbells / Incline Bench' },
    { id: 'ex-7', name: 'Standing Overhead Barbell Press', category: 'Shoulders', targetMuscle: 'Anterior Deltoid', equipment: 'Barbell' },
    { id: 'ex-8', name: 'Cable Lateral Raises', category: 'Shoulders', targetMuscle: 'Lateral Deltoid', equipment: 'Cable Tower' },
  ];

  const workoutSessions: WorkoutSession[] = [
    {
      id: 'ws-1',
      date: daysAgo(1),
      splitType: 'Upper',
      title: 'Upper Body Hypertrophy & Power',
      durationMinutes: 62,
      exercises: [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Barbell Flat Bench Press',
          sets: [
            { setNumber: 1, reps: 8, weightKg: 85, isCompleted: true },
            { setNumber: 2, reps: 8, weightKg: 87.5, isCompleted: true },
            { setNumber: 3, reps: 6, weightKg: 90, isCompleted: true },
          ],
        },
        {
          exerciseId: 'ex-5',
          exerciseName: 'Weighted Pull-ups',
          sets: [
            { setNumber: 1, reps: 6, weightKg: 15, isCompleted: true },
            { setNumber: 2, reps: 6, weightKg: 15, isCompleted: true },
            { setNumber: 3, reps: 5, weightKg: 15, isCompleted: true },
          ],
        },
        {
          exerciseId: 'ex-7',
          exerciseName: 'Standing Overhead Barbell Press',
          sets: [
            { setNumber: 1, reps: 8, weightKg: 52.5, isCompleted: true },
            { setNumber: 2, reps: 8, weightKg: 55, isCompleted: true },
          ],
        },
      ],
      totalVolumeKg: 3415,
      notes: 'Felt strong on bench press. Good bar speed on 90kg set.',
      createdAt: daysAgo(1),
    },
    {
      id: 'ws-2',
      date: daysAgo(3),
      splitType: 'Lower',
      title: 'Lower Body Strength & Quads',
      durationMinutes: 58,
      exercises: [
        {
          exerciseId: 'ex-3',
          exerciseName: 'Barbell Back Squat',
          sets: [
            { setNumber: 1, reps: 6, weightKg: 110, isCompleted: true },
            { setNumber: 2, reps: 6, weightKg: 115, isCompleted: true },
            { setNumber: 3, reps: 5, weightKg: 120, isCompleted: true },
          ],
        },
        {
          exerciseId: 'ex-4',
          exerciseName: 'Romanian Deadlift',
          sets: [
            { setNumber: 1, reps: 8, weightKg: 100, isCompleted: true },
            { setNumber: 2, reps: 8, weightKg: 105, isCompleted: true },
          ],
        },
      ],
      totalVolumeKg: 3590,
      notes: 'Deep squat depth maintained. Controlled eccentric on RDLs.',
      createdAt: daysAgo(3),
    },
  ];

  const bodyMetrics: BodyMetric[] = [
    { id: 'bm-1', date: daysAgo(28), weightKg: 77.8, bodyFatPercentage: 15.2, waistCm: 83.0, chestCm: 104.0, armsCm: 37.5 },
    { id: 'bm-2', date: daysAgo(21), weightKg: 77.1, bodyFatPercentage: 14.8, waistCm: 82.2, chestCm: 104.2, armsCm: 37.5 },
    { id: 'bm-3', date: daysAgo(14), weightKg: 76.4, bodyFatPercentage: 14.3, waistCm: 81.5, chestCm: 104.5, armsCm: 37.8 },
    { id: 'bm-4', date: daysAgo(7), weightKg: 75.8, bodyFatPercentage: 13.9, waistCm: 80.8, chestCm: 104.5, armsCm: 38.0 },
    { id: 'bm-5', date: todayStr, weightKg: 75.3, bodyFatPercentage: 13.5, waistCm: 80.2, chestCm: 105.0, armsCm: 38.2 },
  ];

  const fitnessGoals: FitnessGoal[] = [
    { id: 'fg-1', title: '100kg Bench Press 1RM', metric: 'Bench Press', targetValue: 100, currentValue: 92.5, unit: 'kg', targetDate: daysFromNow(30), isAchieved: false },
    { id: 'fg-2', title: '140kg Barbell Squat', metric: 'Squat', targetValue: 140, currentValue: 125, unit: 'kg', targetDate: daysFromNow(60), isAchieved: false },
    { id: 'fg-3', title: '74kg Lean Weight @ 12% BF', metric: 'Weight', targetValue: 74, currentValue: 75.3, unit: 'kg', targetDate: daysFromNow(45), isAchieved: false },
  ];

  // 6. ACADEMICS
  const academicSemesters: AcademicSemester[] = [
    { id: 'sem-5', name: 'Semester 5 (Fall 2026)', year: '2026-2027', isCurrent: true, targetGpa: 9.5, achievedGpa: 9.2 },
    { id: 'sem-4', name: 'Semester 4 (Spring 2026)', year: '2025-2026', isCurrent: false, targetGpa: 9.0, achievedGpa: 9.15 },
  ];

  const academicSubjects: AcademicSubject[] = [
    {
      id: 'sub-1',
      semesterId: 'sem-5',
      name: 'Distributed Systems',
      code: 'CS401',
      credits: 4,
      professor: 'Dr. Alan Vance',
      roomOrLink: 'Hall 302',
      color: '#B80C09',
      targetAttendancePercentage: 75,
      totalClasses: 26,
      attendedClasses: 23, // 88.5%
    },
    {
      id: 'sub-2',
      semesterId: 'sem-5',
      name: 'Compiler Architecture',
      code: 'CS402',
      credits: 4,
      professor: 'Dr. Sarah Jenkins',
      roomOrLink: 'Lab B',
      color: '#6B2B06',
      targetAttendancePercentage: 75,
      totalClasses: 24,
      attendedClasses: 19, // 79.2%
    },
    {
      id: 'sub-3',
      semesterId: 'sem-5',
      name: 'Deep Learning & Neural Networks',
      code: 'CS403',
      credits: 4,
      professor: 'Dr. Rajesh Kumar',
      roomOrLink: 'Auditorium 1',
      color: '#4E632D',
      targetAttendancePercentage: 75,
      totalClasses: 22,
      attendedClasses: 21, // 95.5%
    },
    {
      id: 'sub-4',
      semesterId: 'sem-5',
      name: 'Cloud Computing & DevOps',
      code: 'CS404',
      credits: 3,
      professor: 'Prof. Miller',
      roomOrLink: 'Online Stream',
      color: '#f59e0b',
      targetAttendancePercentage: 75,
      totalClasses: 20,
      attendedClasses: 14, // 70.0% -> CRITICAL ATTENDANCE WARNING!
    },
  ];

  const academicAssignments: AcademicAssignment[] = [
    {
      id: 'aa-1',
      subjectId: 'sub-1',
      title: 'Raft Consensus Protocol with Leader Election',
      dueDate: daysFromNow(4),
      weightagePercentage: 15,
      isSubmitted: false,
    },
    {
      id: 'aa-2',
      subjectId: 'sub-2',
      title: 'LL(1) Top-Down Parser Construction in TypeScript',
      dueDate: daysAgo(5),
      weightagePercentage: 10,
      isSubmitted: true,
      submittedAt: daysAgo(6),
      marksScored: 19,
      maxMarks: 20,
    },
    {
      id: 'aa-3',
      subjectId: 'sub-3',
      title: 'ResNet-50 Fine-tuning for Multi-Class Image Classification',
      dueDate: daysFromNow(9),
      weightagePercentage: 20,
      isSubmitted: false,
    },
  ];

  const academicExams: AcademicExam[] = [
    {
      id: 'ae-1',
      subjectId: 'sub-1',
      title: 'Distributed Systems Midterm',
      examDate: daysFromNow(18),
      syllabusCoveragePercentage: 75,
      weightagePercentage: 30,
    },
    {
      id: 'ae-2',
      subjectId: 'sub-2',
      title: 'Compiler Construction Midterm',
      examDate: daysFromNow(20),
      syllabusCoveragePercentage: 60,
      weightagePercentage: 30,
    },
    {
      id: 'ae-3',
      subjectId: 'sub-3',
      title: 'Deep Learning Midterm Exam',
      examDate: daysFromNow(23),
      syllabusCoveragePercentage: 85,
      weightagePercentage: 30,
    },
  ];

  const timetableSlots: TimetableSlot[] = [
    { id: 'tt-1', subjectId: 'sub-1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'Hall 302' },
    { id: 'tt-2', subjectId: 'sub-2', dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'Lab B' },
    { id: 'tt-3', subjectId: 'sub-3', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Auditorium 1' },
    { id: 'tt-4', subjectId: 'sub-4', dayOfWeek: 3, startTime: '14:00', endTime: '15:30', room: 'Online' },
    { id: 'tt-5', subjectId: 'sub-1', dayOfWeek: 4, startTime: '09:00', endTime: '10:30', room: 'Hall 302' },
    { id: 'tt-6', subjectId: 'sub-3', dayOfWeek: 5, startTime: '10:00', endTime: '11:30', room: 'Auditorium 1' },
  ];

  // 7. CAREER MANAGEMENT
  const careerGoals: CareerGoal[] = [
    {
      id: 'cg-1',
      title: 'Founding Engineer / High-Scale Systems Architect',
      targetDate: daysFromNow(365),
      status: 'active',
      milestones: [
        { id: 'cgm-1', title: 'Ship 3 high-impact open-source production projects', completed: true },
        { id: 'cgm-2', title: 'Lead end-to-end distributed system with >10k QPS', completed: false },
        { id: 'cgm-3', title: 'Publish technical research articles on engineering blogs', completed: false },
      ],
    },
  ];

  const careerSkills: SkillItem[] = [
    { id: 'cs-1', name: 'TypeScript & React Architecture', category: 'Frontend', proficiency: 5, targetProficiency: 5, resources: 'Advanced design systems, AST transformation, high-perf DOM' },
    { id: 'cs-2', name: 'Distributed Systems & Go / Node', category: 'Backend', proficiency: 4, targetProficiency: 5, resources: 'MIT 6.824, Raft, Paxos, Event-driven architecture' },
    { id: 'cs-3', name: 'PostgreSQL & Database Internals', category: 'Backend', proficiency: 4, targetProficiency: 5, resources: 'Indexing, MVCC, Query planner, WAL, partitioning' },
    { id: 'cs-4', name: 'Kubernetes & Cloud Infrastructure', category: 'DevOps & Cloud', proficiency: 3, targetProficiency: 4, resources: 'Terraform, Docker multi-stage, Helm charts' },
    { id: 'cs-5', name: 'LLM Agents & Multi-Agent Systems', category: 'AI & ML', proficiency: 5, targetProficiency: 5, resources: 'MCP protocols, tool use, memory architectures' },
  ];

  const careerProjects: CareerProject[] = [
    {
      id: 'cp-1',
      title: 'LIFE OS — Personal Operating System',
      description: 'Comprehensive personal command center with local-first IndexedDB, habit heatmaps, fintech dashboard, and AI Copilot.',
      techStack: ['TypeScript', 'React 19', 'Dexie.js', 'Vite', 'Lucide'],
      githubUrl: 'https://github.com/atharva/life-os',
      status: 'in-progress',
      featured: true,
    },
    {
      id: 'cp-2',
      title: 'HyperMesh — Distributed Event Broker',
      description: 'High-throughput append-only log in Go with consensus replication and zero-copy disk streaming.',
      techStack: ['Go', 'gRPC', 'Raft', 'Protobuf'],
      githubUrl: 'https://github.com/atharva/hypermesh',
      status: 'completed',
      featured: true,
    },
  ];

  const careerApplications: JobApplication[] = [
    {
      id: 'ja-1',
      company: 'Linear',
      role: 'Product Engineer (Frontend / Full-Stack)',
      stage: 'interview',
      appliedDate: daysAgo(14),
      nextFollowUpDate: daysFromNow(2),
      location: 'Remote / SF',
      salaryExpectation: '$165,000 + Equity',
      notes: 'Completed technical interview on state synchronization. Next stage: Architecture discussion with CTO.',
    },
    {
      id: 'ja-2',
      company: 'Stripe',
      role: 'Infrastructure & Core Systems Intern',
      stage: 'oa',
      appliedDate: daysAgo(7),
      nextFollowUpDate: daysFromNow(3),
      location: 'Seattle / Remote',
      salaryExpectation: '$68/hr',
      notes: 'Online assessment received. Focus on algorithms and concurrency.',
    },
    {
      id: 'ja-3',
      company: 'Vercel',
      role: 'Developer Experience Engineer',
      stage: 'applied',
      appliedDate: daysAgo(3),
      location: 'Remote',
      salaryExpectation: '$140,000 + Equity',
      notes: 'Submitted portfolio featuring open-source tools.',
    },
  ];

  const careerDocuments: CareerDocument[] = [
    { id: 'cd-1', title: 'Atharva_Resume_2026_v4.pdf', issuer: 'Personal', issueDate: daysAgo(10), type: 'resume' },
    { id: 'cd-2', title: 'AWS Certified Solutions Architect Associate', issuer: 'Amazon Web Services', issueDate: daysAgo(120), type: 'certification' },
  ];

  // 8. EVENING REVIEWS
  const eveningReviews: EveningReview[] = [
    {
      id: 'er-1',
      date: daysAgo(1),
      tasksCompleted: ['t-4'],
      tasksPending: ['t-1', 't-2'],
      habitsCompleted: ['h-1', 'h-2', 'h-3', 'h-4'],
      habitsMissed: ['h-5'],
      goalProgress: [
        { goalId: 'g-1', progress: 65 },
        { goalId: 'g-2', progress: 55 },
      ],
      reflection: 'Had an intense coding sprint on the SaaS backend. Bench press felt explosive. Slept late due to debugging, need to wind down by 22:30 today.',
      whatWentWrong: 'Allowed late-night screen time to compromise sleep schedule.',
      whatToImproveTomorrow: 'Start deep work block at 09:00 sharp without checking email first.',
      rating: 4,
      tomorrowPriorities: [
        'Complete Stripe Webhook signature verification',
        'Analyze Raft Consensus paper for Distributed Systems',
        'Hit Upper Body Hypertrophy session',
      ],
      createdAt: `${daysAgo(1)}T21:45:00Z`,
      updatedAt: `${daysAgo(1)}T21:45:00Z`,
    },
  ];

  // 9. OBSIDIAN NOTES
  const obsidianNotes: ObsidianNote[] = [
    {
      id: 'on-1',
      title: 'Distributed Systems & Raft Consensus Architecture',
      folder: 'Academics/CS401',
      content: `# Distributed Systems & Raft Consensus Architecture

Tags: #distributed-systems #raft #consensus #systems

Related: [[Semester 5 Overview]] | [[LIFE OS Architecture]]

## Core State Machine
The Raft consensus algorithm decomposes state machine replication into three distinct sub-problems:
1. **Leader Election**: When an existing leader fails, a randomized timer initiates an election.
2. **Log Replication**: The leader accepts log entries from clients and broadcasts them via AppendEntries RPCs.
3. **Safety**: State Machine Safety Property ensures if a server applies an entry at index *i*, no other server will ever apply a different entry at *i*.

### Key Observations
- Random election timeouts (150ms-300ms) prevent split votes.
- Heartbeats maintain leadership authority without client traffic.
`,
      tags: ['distributed-systems', 'raft', 'systems', 'academics'],
      linkedSubjectId: 'sub-1',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    {
      id: 'on-2',
      title: 'Personal Operating Principles & High Performance',
      folder: 'Life',
      content: `# Personal Operating Principles & High Performance

Tags: #mindset #habits #productivity #life

Related: [[Launch SaaS Platform v1.0]]

## Rule of 3 Priorities
Never carry more than 3 critical priorities into a single day. Multitasking is the illusion of speed.

## Physical Priming
- 160g protein daily minimum.
- 3L hydration before 18:00.
- Daily sunshine exposure within 30 minutes of waking.
- Evening reflection ritual every night at 21:30.
`,
      tags: ['mindset', 'habits', 'productivity', 'life'],
      linkedGoalId: 'g-1',
      createdAt: daysAgo(15),
      updatedAt: daysAgo(2),
    },
  ];

  const settings: AppSettings = {
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
    settings,
  };
}
