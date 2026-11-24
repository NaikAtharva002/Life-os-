export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type GoalType = 'short-term' | 'medium-term' | 'long-term';
export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'in_progress'
  | 'completed'
  | 'done'
  | 'archived'
  | 'blocked';

export type TaskRecurrence =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export interface TaskRecurrenceConfig {
  type: TaskRecurrence;
  interval?: number; // e.g. every 2 weeks
  weekdays?: number[]; // [1, 2, 3, 4, 5] (0=Sun..6=Sat)
  endDate?: string; // YYYY-MM-DD
  maxOccurrences?: number;
  currentOccurrence?: number;
}

// ==========================================
// 1. GOALS MANAGEMENT
// ==========================================
export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  type: GoalType;
  category: string;
  targetDate?: string;
  progress: number; // 0-100
  milestones: Milestone[];
  linkedHabitIds?: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  completedAt?: string;
}

// ==========================================
// 2. TASK MANAGEMENT
// ==========================================
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  priority: Priority;
  category: string;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  isCompleted: boolean;
  completedAt?: string;
  isOverdue: boolean;
  recurrence?: TaskRecurrence;
  recurrenceConfig?: TaskRecurrenceConfig;
  parentRecurringTaskId?: string;
  subtasks: SubTask[];
  tags?: string[];
  estimatedDuration?: number; // duration in minutes
  actualDuration?: number; // logged minutes
  dependsOnTaskIds?: string[]; // IDs of blocker tasks
  isArchived?: boolean;
  order?: number;
  goalId?: string;
  academicSubjectId?: string;
  careerProjectId?: string;
  rescheduled?: boolean;
  rescheduledTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. HABIT TRACKER
// ==========================================
export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly';
  targetDays: number[]; // 0=Sun..6=Sat
  color: string;
  icon: string;
  streak: number;
  longestStreak: number;
  createdAt: string;
  entries?: HabitEntry[];
}

// ==========================================
// 4. FINANCE MANAGEMENT
// ==========================================
export type TransactionType = 'expense' | 'income';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Other';
  tags?: string[];
  createdAt: string;
}

export interface FinanceBudget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isReached: boolean;
  createdAt: string;
}

// ==========================================
// 5. GYM & FITNESS
// ==========================================
export type WorkoutSplit = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'Full Body' | 'Cardio' | 'Custom';

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isCompleted: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  splitType: WorkoutSplit;
  title: string;
  durationMinutes: number;
  exercises: LoggedExercise[];
  totalVolumeKg: number;
  notes?: string;
  createdAt: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  targetMuscle: string;
  equipment: string;
}

export interface BodyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  notes?: string;
}

export interface FitnessGoal {
  id: string;
  title: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
  isAchieved: boolean;
}

// ==========================================
// 6. ACADEMICS
// ==========================================
export interface AcademicSemester {
  id: string;
  name: string; // e.g. "Semester 5"
  year: string;
  isCurrent: boolean;
  targetGpa: number;
  achievedGpa?: number;
}

export interface AcademicSubject {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  credits: number;
  professor?: string;
  roomOrLink?: string;
  color: string;
  targetAttendancePercentage: number; // default 75
  totalClasses: number;
  attendedClasses: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
}

export interface AcademicAssignment {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string;
  weightagePercentage?: number;
  isSubmitted: boolean;
  submittedAt?: string;
  marksScored?: number;
  maxMarks?: number;
}

export interface AcademicExam {
  id: string;
  subjectId: string;
  title: string;
  examDate: string;
  syllabusCoveragePercentage: number;
  weightagePercentage: number;
  marksScored?: number;
  maxMarks?: number;
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 1=Mon .. 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;
}

// ==========================================
// 7. CAREER MANAGEMENT
// ==========================================
export interface CareerGoal {
  id: string;
  title: string;
  targetDate: string;
  status: 'active' | 'achieved' | 'paused';
  milestones: { id: string; title: string; completed: boolean }[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'DevOps & Cloud' | 'AI & ML' | 'Architecture' | 'Soft Skills';
  proficiency: number; // 1-5
  targetProficiency: number;
  resources?: string;
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: 'idea' | 'in-progress' | 'completed';
  featured: boolean;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: 'wishlist' | 'applied' | 'oa' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  nextFollowUpDate?: string;
  location: string;
  salaryExpectation?: string;
  notes?: string;
}

export interface CareerDocument {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  type: 'resume' | 'certification' | 'award';
}

// ==========================================
// 8. AI ASSISTANT & CHAT
// ==========================================
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionCard?: {
    type: 'plan_day' | 'prioritize_goals' | 'study_plan' | 'spending_summary' | 'behind_alert';
    data: any;
  };
}

// ==========================================
// 9. END-OF-DAY REVIEW
// ==========================================
export interface EveningReview {
  id: string;
  date: string; // YYYY-MM-DD
  tasksCompleted: string[];
  tasksPending: string[];
  habitsCompleted: string[];
  habitsMissed: string[];
  goalProgress: { goalId: string; progress: number }[];
  reflection: string;
  whatWentWrong?: string;
  whatToImproveTomorrow?: string;
  rating: number; // 1-5
  tomorrowPriorities: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 10. OBSIDIAN INTEGRATION & NOTES
// ==========================================
export interface ObsidianNote {
  id: string;
  title: string;
  folder: string;
  content: string;
  tags: string[];
  linkedGoalId?: string;
  linkedSubjectId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 11. APP SETTINGS
// ==========================================
export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm
  timezone: string;
}

export type DesignVariant = 'agent' | 'taste' | 'impeccable';

export interface AppSettings {
  theme: 'dark' | 'light';
  designVariant?: DesignVariant;
  userName: string;
  currencySymbol: string;
  geminiApiKey?: string;
  reminder: ReminderSettings;
  onboardingCompleted?: boolean;
  selectedLifeAreas?: string[];
  weekStartDay?: 'monday' | 'sunday';
  defaultFocusDuration?: number;
  dismissedTips?: string[];
  isDemoMode?: boolean;
  userAvatar?: string;
  userGreeting?: string;
}

// ==========================================
// 12. NOTIFICATIONS & MICRO-INTERACTIONS
// ==========================================
export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
