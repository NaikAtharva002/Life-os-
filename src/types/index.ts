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
// 0. BASE ENTITY
// ==========================================
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

// ==========================================
// 1. GOALS MANAGEMENT
// ==========================================
export type LifeArea =
  | 'personal'
  | 'academic'
  | 'career'
  | 'finance'
  | 'fitness'
  | 'relationships'
  | 'learning'
  | 'lifestyle'
  | 'custom';

export type GoalStatus =
  | 'not-started'
  | 'in-progress'
  | 'on-track'
  | 'at-risk'
  | 'completed'
  | 'paused'
  | 'abandoned';

export type GoalMeasurementType =
  | 'numeric'
  | 'completion'
  | 'habit-based'
  | 'milestone-based';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  order?: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
}

export interface GoalActivityEvent {
  id: string;
  goalId: string;
  type:
    | 'created'
    | 'target_changed'
    | 'progress_updated'
    | 'milestone_completed'
    | 'milestone_added'
    | 'task_linked'
    | 'deadline_changed'
    | 'status_changed'
    | 'paused'
    | 'resumed'
    | 'completed'
    | 'archived';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  type: GoalType;
  category: string;
  lifeArea?: LifeArea;
  startDate?: string;
  targetDate?: string;
  status?: GoalStatus;
  statusOverride?: boolean;
  measurementType?: GoalMeasurementType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  progress: number; // 0-100
  progressCalculationMode?: 'automatic' | 'manual';
  manualProgress?: number;
  milestones: Milestone[];
  linkedHabitIds?: string[];
  coverImage?: string;
  tags?: string[];
  notes?: string;
  whyItMatters?: string;
  desiredOutcome?: string;
  nextAction?: string;
  obstacles?: string;
  activityHistory?: GoalActivityEvent[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  completedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  milestoneId?: string;
  academicSubjectId?: string;
  careerProjectId?: string;
  rescheduled?: boolean;
  rescheduledTo?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

// ==========================================
// 3. HABIT TRACKER
// ==========================================
export type HabitType =
  | 'boolean'
  | 'numeric'
  | 'duration'
  | 'frequency'
  | 'negative';

export type HabitScheduleType =
  | 'daily'
  | 'weekdays'
  | 'monthly_dates'
  | 'weekly_target'
  | 'monthly_target'
  | 'custom_interval';

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  status?: 'completed' | 'skipped' | 'partial';
  value?: number;
  targetValue?: number;
  unit?: string;
  note?: string;
  notes?: string;
  loggedAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface HabitRoutine {
  id: string;
  title: string;
  description?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  habitIds: string[];
  order?: number;
  createdAt?: string;
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
  coverImage?: string;
  type?: HabitType;
  scheduleType?: HabitScheduleType;
  scheduleDays?: number[]; // [1, 3, 5]
  monthlyDates?: number[]; // [1, 15]
  weeklyTargetCount?: number; // e.g. 3 times a week
  monthlyTargetCount?: number; // e.g. 10 times a month
  customIntervalDays?: number; // e.g. every 2 days
  startDate?: string;
  endDate?: string;
  targetValue?: number;
  unit?: string;
  reminderTime?: string; // HH:mm
  reminderEnabled?: boolean;
  goalId?: string;
  routineId?: string;
  streak: number;
  longestStreak: number;
  totalCompletions?: number;
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface FinanceBudget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  targetMuscle: string;
  equipment: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface TimetableSlot {
  id: string;
  workspaceId?: string;
  subjectId: string;
  subjectName?: string;
  courseCode?: string;
  professor?: string;
  dayOfWeek: number; // 1=Mon .. 7=Sun
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;
  color?: string;
  recurring?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'DevOps & Cloud' | 'AI & ML' | 'Architecture' | 'Soft Skills';
  proficiency: number; // 1-5
  targetProficiency: number;
  resources?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
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
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface CareerDocument {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  type: 'resume' | 'certification' | 'award';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

// ==========================================
// 8. AI ASSISTANT & CHAT
// ==========================================
export type RitActionStatus = 'pending' | 'executing' | 'confirmed' | 'cancelled' | 'error';

export type RitPendingAction =
  | {
      id: string;
      type: 'create_task';
      title: string;
      dueDate?: string;
      dueTime?: string;
      priority: Priority;
      category: string;
      status: RitActionStatus;
      errorMessage?: string;
    }
  | {
      id: string;
      type: 'complete_task';
      taskId: string;
      taskTitle: string;
      status: RitActionStatus;
      errorMessage?: string;
    }
  | {
      id: string;
      type: 'toggle_habit';
      habitId: string;
      habitName: string;
      date: string;
      status: RitActionStatus;
      errorMessage?: string;
    }
  | {
      id: string;
      type: 'create_goal';
      title: string;
      priority: Priority;
      category: string;
      targetDate?: string;
      status: RitActionStatus;
      errorMessage?: string;
    }
  | {
      id: string;
      type: 'create_transaction';
      txType: TransactionType;
      amount: number;
      description: string;
      category: string;
      date: string;
      status: RitActionStatus;
      errorMessage?: string;
    };

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  source?: 'nvidia-nim' | 'local';
  modelUsed?: string;
  notice?: string;
  retryPrompt?: string;
  suggestedViews?: Array<{ viewId: string; label: string }>;
  pendingAction?: RitPendingAction;
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
  deletedAt?: string | null;
  isDemo?: boolean;
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
  deletedAt?: string | null;
  isDemo?: boolean;
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

export interface UserWorkspace {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  designVariant?: DesignVariant;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userGreeting?: string;
  currencySymbol: string;
  dayStartHour?: number;
  geminiApiKey?: string;
  nvidiaModel?: string;
  reminder: ReminderSettings;
  onboardingCompleted?: boolean;
  selectedLifeAreas?: string[];
  weekStartDay?: 'monday' | 'sunday';
  defaultFocusDuration?: number;
  dismissedTips?: string[];
  isDemoMode?: boolean;
  activeWorkspaceId?: string;
  workspaces?: UserWorkspace[];
  graphPreferences?: GraphPreferences;
  dashboardWidgets?: {
    focusTimer?: boolean;
    todayTasks?: boolean;
    priorities?: boolean;
    tasks?: boolean;
    habits?: boolean;
    schedule?: boolean;
    goals?: boolean;
    finance?: boolean;
    fitness?: boolean;
    academics?: boolean;
  };
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

// ==========================================
// 13. KNOWLEDGE UNIVERSE 2.0
// ==========================================
export type UniverseCategory =
  | 'personal'
  | 'goals'
  | 'academics'
  | 'career'
  | 'habits-fitness'
  | 'business'
  | 'knowledge'
  | 'technology'
  | 'finance';

export type UniverseRelationType =
  | 'belongs_to'
  | 'related_to'
  | 'part_of'
  | 'depends_on'
  | 'created_from'
  | 'supports_goal'
  | 'uses_skill'
  | 'references';

export type UniverseGraphMode =
  | 'full'
  | 'personal'
  | 'academic'
  | 'career'
  | 'project'
  | 'goal'
  | 'knowledge';

export type CustomGraphNodeKind =
  | 'note'
  | 'personal-topic'
  | 'interest'
  | 'concept'
  | 'research'
  | 'learning-resource'
  | 'brand'
  | 'business-idea'
  | 'marketing-project'
  | 'product'
  | 'tool'
  | 'language'
  | 'framework'
  | 'ai-experiment'
  | 'institution'
  | 'custom';

export interface CustomGraphNode {
  id: string;
  title: string;
  description?: string;
  category: UniverseCategory;
  kind: CustomGraphNodeKind;
  tags?: string[];
  relatedNodeIds?: string[];
  status?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface CustomGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: UniverseRelationType;
  label?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDemo?: boolean;
}

export interface GraphPreferences {
  nodeSizeScale: number;
  linkDistance: number;
  repulsionStrength: number;
  labelVisibility: 'auto' | 'always' | 'hover';
  hiddenCategories: UniverseCategory[];
  showCompleted: boolean;
  showArchived: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  activeMode: UniverseGraphMode;
}
