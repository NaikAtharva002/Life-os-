import type {
  AcademicAssignment,
  AcademicExam,
  AcademicSemester,
  AcademicSubject,
  AppSettings,
  CareerDocument,
  CareerGoal,
  CareerProject,
  CustomGraphEdge,
  CustomGraphNode,
  EveningReview,
  ExerciseItem,
  FinanceBudget,
  FinanceTransaction,
  FitnessGoal,
  Goal,
  Habit,
  HabitRoutine,
  JobApplication,
  ObsidianNote,
  SavingsGoal,
  SkillItem,
  Task,
  TimetableSlot,
  UniverseCategory,
  UniverseGraphMode,
  UniverseRelationType,
  WorkoutSession,
} from '../types';
import { formatCurrencyINR } from './dates';

export type UniverseNodeTier = 'core' | 'category' | 'primary' | 'record' | 'supporting';

export interface UniverseNode {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: UniverseCategory;
  kind: string;
  tier: UniverseNodeTier;
  baseRadius: number;
  status?: string;
  progress?: number;
  isCompleted?: boolean;
  isArchived?: boolean;
  isOverdue?: boolean;
  isCustom?: boolean;
  entityType?: string;
  entityId?: string;
  route?: string;
  tags?: string[];
  createdAt?: string;
  meta?: Record<string, string | number | boolean | undefined>;
}

export interface UniverseEdge {
  id: string;
  source: string;
  target: string;
  relationType: UniverseRelationType;
  label: string;
  isCustom?: boolean;
  directional?: boolean;
}

export interface UniverseCategoryMeta {
  id: UniverseCategory;
  label: string;
  color: string;
  lightColor: string;
  description: string;
}

export const UNIVERSE_CATEGORIES: UniverseCategoryMeta[] = [
  {
    id: 'personal',
    label: 'Personal',
    color: '#6366F1',
    lightColor: '#4F46E5',
    description: 'Central workspace, reviews, interests & personal topics',
  },
  {
    id: 'goals',
    label: 'Goals',
    color: '#B80C09',
    lightColor: '#B80C09',
    description: 'Long-term goals, milestones & linked execution tasks',
  },
  {
    id: 'academics',
    label: 'Academics',
    color: '#38BDF8',
    lightColor: '#0284C7',
    description: 'Semesters, subjects, classes, assignments & exams',
  },
  {
    id: 'career',
    label: 'Career',
    color: '#F59E0B',
    lightColor: '#D97706',
    description: 'Career goals, projects, certifications & applications',
  },
  {
    id: 'habits-fitness',
    label: 'Habits & Fitness',
    color: '#10B981',
    lightColor: '#059669',
    description: 'Daily habits, routines, workouts, exercises & body goals',
  },
  {
    id: 'business',
    label: 'Business',
    color: '#C27832',
    lightColor: '#6B2B06',
    description: 'Brands, business ideas, products & marketing initiatives',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    color: '#94A3B8',
    lightColor: '#52525B',
    description: 'Notes, concepts, research & wikilinked thoughts',
  },
  {
    id: 'technology',
    label: 'Technology',
    color: '#14B8A6',
    lightColor: '#0D9488',
    description: 'Skills, programming languages, frameworks & AI tools',
  },
  {
    id: 'finance',
    label: 'Finance',
    color: '#84CC16',
    lightColor: '#4D7C0F',
    description: 'Savings goals, monthly budgets & spending categories',
  },
];

export const UNIVERSE_CATEGORY_MAP: Record<UniverseCategory, UniverseCategoryMeta> =
  UNIVERSE_CATEGORIES.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<UniverseCategory, UniverseCategoryMeta>
  );

export const RELATION_LABELS: Record<UniverseRelationType, string> = {
  belongs_to: 'Belongs to',
  related_to: 'Related to',
  part_of: 'Part of',
  depends_on: 'Depends on',
  created_from: 'Created from',
  supports_goal: 'Supports goal',
  uses_skill: 'Uses skill',
  references: 'References',
};

export interface UniverseSourceData {
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  habitRoutines: HabitRoutine[];
  financeTransactions: FinanceTransaction[];
  financeBudgets: FinanceBudget[];
  savingsGoals: SavingsGoal[];
  workoutSessions: WorkoutSession[];
  exercises: ExerciseItem[];
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
}

export interface UniverseFilterOptions {
  mode: UniverseGraphMode;
  focusGoalId?: string;
  focusProjectId?: string;
  hiddenCategories?: UniverseCategory[];
  searchQuery?: string;
  statusFilter?: 'all' | 'active' | 'completed' | 'overdue';
  hideCompleted?: boolean;
  hideArchived?: boolean;
  connectedOnly?: boolean;
  selectedNodeId?: string | null;
  connectionScope?: 'all' | 'direct';
}

export interface UniverseGraphResult {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  hasAnyUserData: boolean;
  availableCategories: UniverseCategory[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    customNodes: number;
    customEdges: number;
  };
}

const WEEKDAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function inferDomainCategory(text: string): UniverseCategory {
  const s = text.toLowerCase();
  if (/(business|startup|brand|marketing|saas|product|client|revenue|launch)/.test(s)) {
    return 'business';
  }
  if (/(react|typescript|javascript|python|java|rust|ai|ml|code|software|cloud|api|tech)/.test(s)) {
    return 'technology';
  }
  if (/(academ|exam|study|class|course|semester|university|assignment|lecture|lab)/.test(s)) {
    return 'academics';
  }
  if (/(career|job|interview|resume|portfolio|certif|intern)/.test(s)) {
    return 'career';
  }
  if (/(fitness|gym|workout|health|run|protein|sleep|habit|meditation)/.test(s)) {
    return 'habits-fitness';
  }
  if (/(finance|budget|money|invest|tax|saving|expense|bank)/.test(s)) {
    return 'finance';
  }
  if (/(note|book|research|concept|learn|knowledge|reading)/.test(s)) {
    return 'knowledge';
  }
  return 'personal';
}

function formatMoney(amount: number, currencySymbol?: string): string {
  if (!currencySymbol || currencySymbol === '₹') {
    return formatCurrencyINR(amount);
  }
  return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
}

function extractWikiLinks(content: string): string[] {
  const matches: string[] = [];
  const regex = /\[\[([^[\]|]+)(?:\|[^[\]]*)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    const clean = m[1]?.trim();
    if (clean) matches.push(clean);
  }
  return matches;
}

/**
 * Builds the full live Knowledge Universe graph directly from existing LIFE OS
 * state without duplicating entities or inventing fictional records.
 */
export function buildKnowledgeUniverseGraph(data: UniverseSourceData): {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  hasAnyUserData: boolean;
} {
  const nodesMap = new Map<string, UniverseNode>();
  const edgesMap = new Map<string, UniverseEdge>();
  const titleIndex = new Map<string, string>();
  const currency = data.settings?.currencySymbol || '₹';

  const addNode = (node: UniverseNode) => {
    nodesMap.set(node.id, node);
    const key = node.title.trim().toLowerCase();
    if (key && !titleIndex.has(key)) {
      titleIndex.set(key, node.id);
    }
  };

  const addEdge = (
    source: string,
    target: string,
    relationType: UniverseRelationType,
    opts?: { id?: string; isCustom?: boolean; label?: string; directional?: boolean }
  ) => {
    if (!source || !target || source === target) return;
    const id = opts?.id || `${source}->${target}:${relationType}`;
    if (edgesMap.has(id)) return;
    edgesMap.set(id, {
      id,
      source,
      target,
      relationType,
      label: opts?.label || RELATION_LABELS[relationType],
      isCustom: opts?.isCustom,
      directional: opts?.directional ?? relationType === 'depends_on',
    });
  };

  // Central User Node ("Me")
  const displayName = data.settings?.userName?.trim();
  addNode({
    id: 'me',
    title: displayName ? `${displayName} (Me)` : 'Me',
    subtitle: 'Central Personal Hub',
    description:
      data.settings?.userGreeting ||
      'Your unified LIFE OS center connecting goals, learning, career, habits, health, notes, and custom ideas.',
    category: 'personal',
    kind: 'me',
    tier: 'core',
    baseRadius: 22,
    status: 'active',
    route: '/',
  });

  // Track which category hubs are actually needed (zero fictional hubs)
  const ensureHub = (category: UniverseCategory): string => {
    const hubId = `cat:${category}`;
    if (!nodesMap.has(hubId)) {
      const meta = UNIVERSE_CATEGORY_MAP[category];
      addNode({
        id: hubId,
        title: meta.label,
        subtitle: 'Domain Hub',
        description: meta.description,
        category,
        kind: 'category-hub',
        tier: 'category',
        baseRadius: 14,
        status: 'active',
      });
      addEdge(hubId, 'me', 'belongs_to');
    }
    return hubId;
  };

  // 1. GOALS & MILESTONES
  for (const g of data.goals) {
    if (g.deletedAt) continue;
    const goalCategory: UniverseCategory =
      g.lifeArea === 'academic'
        ? 'academics'
        : g.lifeArea === 'career'
        ? 'career'
        : g.lifeArea === 'finance'
        ? 'finance'
        : g.lifeArea === 'fitness'
        ? 'habits-fitness'
        : /business|brand|marketing|product|saas/i.test(`${g.category} ${g.title}`)
        ? 'business'
        : 'goals';
    const isCompleted = g.status === 'completed' || g.progress >= 100;
    const goalNodeId = `goal:${g.id}`;

    addNode({
      id: goalNodeId,
      title: g.title,
      subtitle: `${g.category || 'Goal'} · ${g.progress}%`,
      description: g.description || g.desiredOutcome || g.whyItMatters,
      category: goalCategory === 'goals' ? 'goals' : goalCategory,
      kind: 'goal',
      tier: 'primary',
      baseRadius: 11,
      status: g.status || (isCompleted ? 'completed' : 'in-progress'),
      progress: g.progress,
      isCompleted,
      isArchived: g.isArchived,
      entityType: 'goal',
      entityId: g.id,
      route: '/goals',
      tags: g.tags,
      createdAt: g.createdAt,
      meta: {
        priority: g.priority,
        targetDate: g.targetDate,
        measurement: g.measurementType,
      },
    });
    const hub = ensureHub(goalCategory === 'goals' ? 'goals' : goalCategory);
    addEdge(goalNodeId, hub, 'belongs_to');

    for (const m of g.milestones || []) {
      const msId = `milestone:${g.id}:${m.id}`;
      addNode({
        id: msId,
        title: m.title,
        subtitle: `Milestone · ${g.title}`,
        description: m.description,
        category: goalCategory === 'goals' ? 'goals' : goalCategory,
        kind: 'milestone',
        tier: 'supporting',
        baseRadius: 5.5,
        status: m.isCompleted ? 'completed' : 'active',
        isCompleted: m.isCompleted,
        isArchived: g.isArchived,
        entityType: 'goal',
        entityId: g.id,
        route: '/goals',
        meta: { dueDate: m.dueDate },
      });
      addEdge(msId, goalNodeId, 'part_of');
    }
  }

  // 2. ACADEMICS
  for (const sem of data.academicSemesters) {
    if (sem.deletedAt) continue;
    const semId = `semester:${sem.id}`;
    const hub = ensureHub('academics');
    addNode({
      id: semId,
      title: sem.name,
      subtitle: `Semester · ${sem.year}`,
      description: `Target GPA ${sem.targetGpa}${sem.achievedGpa ? ` · Achieved ${sem.achievedGpa}` : ''}`,
      category: 'academics',
      kind: 'semester',
      tier: 'primary',
      baseRadius: 10,
      status: sem.isCurrent ? 'current' : 'completed',
      isCompleted: !sem.isCurrent,
      entityType: 'academicSemester',
      entityId: sem.id,
      route: '/academics',
      createdAt: sem.createdAt,
    });
    addEdge(semId, hub, 'belongs_to');
  }

  for (const sub of data.academicSubjects) {
    if (sub.deletedAt) continue;
    const subId = `subject:${sub.id}`;
    const pct =
      sub.totalClasses > 0 ? Math.round((sub.attendedClasses / sub.totalClasses) * 100) : 100;
    addNode({
      id: subId,
      title: sub.name,
      subtitle: `${sub.code} · ${pct}% attendance`,
      description: sub.professor
        ? `${sub.professor} · ${sub.credits} credits`
        : `${sub.credits} credits`,
      category: 'academics',
      kind: 'subject',
      tier: 'primary',
      baseRadius: 10,
      status: pct < sub.targetAttendancePercentage ? 'at-risk' : 'on-track',
      progress: pct,
      entityType: 'academicSubject',
      entityId: sub.id,
      route: '/academics',
      createdAt: sub.createdAt,
    });
    if (sub.semesterId && nodesMap.has(`semester:${sub.semesterId}`)) {
      addEdge(subId, `semester:${sub.semesterId}`, 'part_of');
    } else {
      addEdge(subId, ensureHub('academics'), 'belongs_to');
    }
  }

  for (const asg of data.academicAssignments) {
    if (asg.deletedAt) continue;
    const asgId = `assignment:${asg.id}`;
    addNode({
      id: asgId,
      title: asg.title,
      subtitle: `Assignment · Due ${asg.dueDate}`,
      category: 'academics',
      kind: 'assignment',
      tier: 'supporting',
      baseRadius: 6,
      status: asg.isSubmitted ? 'completed' : 'pending',
      isCompleted: asg.isSubmitted,
      entityType: 'academicAssignment',
      entityId: asg.id,
      route: '/academics',
      createdAt: asg.createdAt,
    });
    if (asg.subjectId && nodesMap.has(`subject:${asg.subjectId}`)) {
      addEdge(asgId, `subject:${asg.subjectId}`, 'belongs_to');
    } else {
      addEdge(asgId, ensureHub('academics'), 'belongs_to');
    }
  }

  for (const exam of data.academicExams) {
    if (exam.deletedAt) continue;
    const examId = `exam:${exam.id}`;
    addNode({
      id: examId,
      title: exam.title,
      subtitle: `Exam · ${exam.examDate}`,
      description: `Syllabus coverage ${exam.syllabusCoveragePercentage}% · Weight ${exam.weightagePercentage}%`,
      category: 'academics',
      kind: 'exam',
      tier: 'record',
      baseRadius: 7,
      status: exam.marksScored !== undefined ? 'completed' : 'upcoming',
      progress: exam.syllabusCoveragePercentage,
      isCompleted: exam.marksScored !== undefined,
      entityType: 'academicExam',
      entityId: exam.id,
      route: '/academics',
      createdAt: exam.createdAt,
    });
    if (exam.subjectId && nodesMap.has(`subject:${exam.subjectId}`)) {
      addEdge(examId, `subject:${exam.subjectId}`, 'belongs_to');
    } else {
      addEdge(examId, ensureHub('academics'), 'belongs_to');
    }
  }

  for (const slot of data.timetableSlots) {
    if (slot.deletedAt) continue;
    const slotId = `slot:${slot.id}`;
    const day = WEEKDAY_NAMES[slot.dayOfWeek] || 'Day';
    const label = slot.courseCode || slot.subjectName || 'Class Session';
    addNode({
      id: slotId,
      title: `${label} (${day} ${slot.startTime})`,
      subtitle: `Class · ${slot.room}`,
      category: 'academics',
      kind: 'class-slot',
      tier: 'supporting',
      baseRadius: 5,
      status: 'scheduled',
      entityType: 'timetableSlot',
      entityId: slot.id,
      route: '/academics',
      createdAt: slot.createdAt,
    });
    if (slot.subjectId && nodesMap.has(`subject:${slot.subjectId}`)) {
      addEdge(slotId, `subject:${slot.subjectId}`, 'part_of');
    } else {
      addEdge(slotId, ensureHub('academics'), 'belongs_to');
    }
  }

  // 3. CAREER & TECHNOLOGY
  for (const cg of data.careerGoals) {
    if (cg.deletedAt) continue;
    const cgId = `cgoal:${cg.id}`;
    const hub = ensureHub('career');
    addNode({
      id: cgId,
      title: cg.title,
      subtitle: `Career Goal · Target ${cg.targetDate}`,
      category: 'career',
      kind: 'career-goal',
      tier: 'primary',
      baseRadius: 10,
      status: cg.status,
      isCompleted: cg.status === 'achieved',
      entityType: 'careerGoal',
      entityId: cg.id,
      route: '/career',
      createdAt: cg.createdAt,
    });
    addEdge(cgId, hub, 'belongs_to');
  }

  const skillByName = new Map<string, string>();
  for (const sk of data.careerSkills) {
    if (sk.deletedAt) continue;
    const skId = `skill:${sk.id}`;
    const isTech = sk.category !== 'Soft Skills';
    const cat: UniverseCategory = isTech ? 'technology' : 'career';
    const hub = ensureHub(cat);
    addNode({
      id: skId,
      title: sk.name,
      subtitle: `${sk.category} · Lv ${sk.proficiency}/${sk.targetProficiency}`,
      description: sk.resources,
      category: cat,
      kind: isTech ? 'framework' : 'skill',
      tier: 'record',
      baseRadius: 7.5,
      progress: Math.min(100, Math.round((sk.proficiency / Math.max(1, sk.targetProficiency)) * 100)),
      status: sk.proficiency >= sk.targetProficiency ? 'mastered' : 'developing',
      entityType: 'careerSkill',
      entityId: sk.id,
      route: '/career',
      createdAt: sk.createdAt,
    });
    addEdge(skId, hub, 'belongs_to');
    skillByName.set(sk.name.trim().toLowerCase(), skId);
  }

  for (const cp of data.careerProjects) {
    if (cp.deletedAt) continue;
    const cpId = `project:${cp.id}`;
    const projCat: UniverseCategory = /brand|marketing|business|saas|ecommerce|store/i.test(
      `${cp.title} ${cp.description}`
    )
      ? 'business'
      : 'career';
    const hub = ensureHub(projCat);
    addNode({
      id: cpId,
      title: cp.title,
      subtitle: `Project · ${cp.status}`,
      description: cp.description,
      category: projCat,
      kind: 'project',
      tier: 'primary',
      baseRadius: 10.5,
      status: cp.status,
      isCompleted: cp.status === 'completed',
      entityType: 'careerProject',
      entityId: cp.id,
      route: '/career',
      tags: cp.techStack,
      createdAt: cp.createdAt,
    });
    addEdge(cpId, hub, 'belongs_to');

    for (const tech of cp.techStack || []) {
      const matchedSkillId = skillByName.get(tech.trim().toLowerCase());
      if (matchedSkillId) {
        addEdge(cpId, matchedSkillId, 'uses_skill');
      }
    }
  }

  for (const app of data.careerApplications) {
    if (app.deletedAt) continue;
    const appId = `job:${app.id}`;
    const hub = ensureHub('career');
    addNode({
      id: appId,
      title: `${app.company} — ${app.role}`,
      subtitle: `Application · ${app.stage.toUpperCase()}`,
      description: app.notes,
      category: 'career',
      kind: 'job-application',
      tier: 'record',
      baseRadius: 7,
      status: app.stage,
      isCompleted: app.stage === 'offer',
      entityType: 'jobApplication',
      entityId: app.id,
      route: '/career',
      createdAt: app.createdAt,
    });
    addEdge(appId, hub, 'belongs_to');
  }

  for (const doc of data.careerDocuments) {
    if (doc.deletedAt) continue;
    const docId = `doc:${doc.id}`;
    const hub = ensureHub('career');
    addNode({
      id: docId,
      title: doc.title,
      subtitle: `${doc.type} · ${doc.issuer}`,
      category: 'career',
      kind: doc.type,
      tier: 'supporting',
      baseRadius: 6,
      status: 'verified',
      entityType: 'careerDocument',
      entityId: doc.id,
      route: '/career',
      createdAt: doc.createdAt,
    });
    addEdge(docId, hub, 'belongs_to');
  }

  // 4. HABITS, ROUTINES & FITNESS
  for (const rt of data.habitRoutines) {
    const rtId = `routine:${rt.id}`;
    const hub = ensureHub('habits-fitness');
    addNode({
      id: rtId,
      title: rt.title,
      subtitle: `Routine · ${rt.timeOfDay || 'daily'}`,
      description: rt.description,
      category: 'habits-fitness',
      kind: 'routine',
      tier: 'primary',
      baseRadius: 9.5,
      status: 'active',
      entityType: 'habitRoutine',
      entityId: rt.id,
      route: '/habits',
      createdAt: rt.createdAt,
    });
    addEdge(rtId, hub, 'belongs_to');
  }

  for (const h of data.habits) {
    if (h.deletedAt) continue;
    const hId = `habit:${h.id}`;
    addNode({
      id: hId,
      title: h.name,
      subtitle: `Habit · ${h.streak || 0}d streak`,
      description: h.description || h.notes,
      category: 'habits-fitness',
      kind: 'habit',
      tier: 'record',
      baseRadius: 8,
      status: h.isArchived ? 'archived' : 'active',
      isArchived: h.isArchived,
      entityType: 'habit',
      entityId: h.id,
      route: '/habits',
      createdAt: h.createdAt,
    });

    if (h.routineId && nodesMap.has(`routine:${h.routineId}`)) {
      addEdge(hId, `routine:${h.routineId}`, 'part_of');
    } else {
      addEdge(hId, ensureHub('habits-fitness'), 'belongs_to');
    }

    if (h.goalId && nodesMap.has(`goal:${h.goalId}`)) {
      addEdge(hId, `goal:${h.goalId}`, 'supports_goal');
    }
  }

  // Also capture goal.linkedHabitIds edges
  for (const g of data.goals) {
    if (g.deletedAt || !g.linkedHabitIds?.length) continue;
    const gNodeId = `goal:${g.id}`;
    for (const hId of g.linkedHabitIds) {
      if (nodesMap.has(`habit:${hId}`)) {
        addEdge(`habit:${hId}`, gNodeId, 'supports_goal');
      }
    }
  }

  for (const fg of data.fitnessGoals) {
    if (fg.deletedAt) continue;
    const fgId = `fitgoal:${fg.id}`;
    const hub = ensureHub('habits-fitness');
    addNode({
      id: fgId,
      title: fg.title,
      subtitle: `Fitness Goal · ${fg.currentValue}/${fg.targetValue} ${fg.unit}`,
      category: 'habits-fitness',
      kind: 'fitness-goal',
      tier: 'record',
      baseRadius: 8,
      status: fg.isAchieved ? 'completed' : 'active',
      isCompleted: fg.isAchieved,
      progress: Math.min(100, Math.round((fg.currentValue / Math.max(1, fg.targetValue)) * 100)),
      entityType: 'fitnessGoal',
      entityId: fg.id,
      route: '/fitness',
      createdAt: fg.createdAt,
    });
    addEdge(fgId, hub, 'belongs_to');
  }

  const exerciseById = new Map<string, ExerciseItem>();
  for (const ex of data.exercises) {
    if (!ex.deletedAt) exerciseById.set(ex.id, ex);
  }

  for (const ws of data.workoutSessions) {
    if (ws.deletedAt) continue;
    const wsId = `workout:${ws.id}`;
    const hub = ensureHub('habits-fitness');
    addNode({
      id: wsId,
      title: ws.title,
      subtitle: `${ws.splitType} · ${ws.durationMinutes}m · ${ws.date}`,
      description: ws.notes,
      category: 'habits-fitness',
      kind: 'workout',
      tier: 'record',
      baseRadius: 7.5,
      status: 'completed',
      isCompleted: false, // Keep workout sessions visible as fitness history
      entityType: 'workoutSession',
      entityId: ws.id,
      route: '/fitness',
      createdAt: ws.createdAt,
    });
    addEdge(wsId, hub, 'belongs_to');

    for (const logged of ws.exercises || []) {
      const exObj = exerciseById.get(logged.exerciseId);
      const exId = `exercise:${logged.exerciseId}`;
      if (!nodesMap.has(exId)) {
        addNode({
          id: exId,
          title: exObj?.name || logged.exerciseName,
          subtitle: exObj ? `${exObj.category} · ${exObj.targetMuscle}` : 'Exercise',
          category: 'habits-fitness',
          kind: 'exercise',
          tier: 'supporting',
          baseRadius: 5.5,
          status: 'active',
          entityType: 'exercise',
          entityId: logged.exerciseId,
          route: '/fitness',
        });
      }
      addEdge(exId, wsId, 'part_of');
    }
  }

  // 5. TASKS & DEPENDENCIES
  for (const t of data.tasks) {
    if (t.deletedAt) continue;
    const tId = `task:${t.id}`;
    const isTaskCompleted = t.isCompleted || t.status === 'completed' || t.status === 'done';
    const isTaskArchived = t.isArchived || t.status === 'archived';

    let taskCategory: UniverseCategory = inferDomainCategory(`${t.category} ${t.title}`);
    if (t.academicSubjectId && nodesMap.has(`subject:${t.academicSubjectId}`)) {
      taskCategory = 'academics';
    } else if (t.careerProjectId && nodesMap.has(`project:${t.careerProjectId}`)) {
      const projNode = nodesMap.get(`project:${t.careerProjectId}`);
      taskCategory = projNode?.category || 'career';
    } else if (t.goalId && nodesMap.has(`goal:${t.goalId}`)) {
      const goalNode = nodesMap.get(`goal:${t.goalId}`);
      taskCategory = goalNode?.category || 'goals';
    }

    addNode({
      id: tId,
      title: t.title,
      subtitle: `Task · ${t.priority.toUpperCase()}${t.dueDate ? ` · ${t.dueDate}` : ''}`,
      description: t.description || t.notes,
      category: taskCategory,
      kind: 'task',
      tier: 'record',
      baseRadius: 7,
      status: isTaskCompleted
        ? 'completed'
        : isTaskArchived
        ? 'archived'
        : t.isOverdue
        ? 'overdue'
        : t.status || 'todo',
      isCompleted: isTaskCompleted,
      isArchived: isTaskArchived,
      isOverdue: t.isOverdue && !isTaskCompleted,
      entityType: 'task',
      entityId: t.id,
      route: '/tasks',
      tags: t.tags,
      createdAt: t.createdAt,
    });

    let connected = false;
    if (t.goalId && t.milestoneId && nodesMap.has(`milestone:${t.goalId}:${t.milestoneId}`)) {
      addEdge(tId, `milestone:${t.goalId}:${t.milestoneId}`, 'part_of');
      connected = true;
    }
    if (t.goalId && nodesMap.has(`goal:${t.goalId}`)) {
      addEdge(tId, `goal:${t.goalId}`, 'supports_goal');
      connected = true;
    }
    if (t.academicSubjectId && nodesMap.has(`subject:${t.academicSubjectId}`)) {
      addEdge(tId, `subject:${t.academicSubjectId}`, 'belongs_to');
      connected = true;
    }
    if (t.careerProjectId && nodesMap.has(`project:${t.careerProjectId}`)) {
      addEdge(tId, `project:${t.careerProjectId}`, 'part_of');
      connected = true;
    }
    if (!connected) {
      addEdge(tId, ensureHub(taskCategory), 'belongs_to');
    }
  }

  // Task -> Task dependency arrows
  for (const t of data.tasks) {
    if (t.deletedAt || !t.dependsOnTaskIds?.length) continue;
    const tId = `task:${t.id}`;
    if (!nodesMap.has(tId)) continue;
    for (const blockerId of t.dependsOnTaskIds) {
      const blockerNodeId = `task:${blockerId}`;
      if (nodesMap.has(blockerNodeId)) {
        addEdge(tId, blockerNodeId, 'depends_on', { directional: true });
      }
    }
  }

  // 6. FINANCE (Budgets, Savings Goals & Spending Categories in INR)
  for (const sg of data.savingsGoals) {
    if (sg.deletedAt) continue;
    const sgId = `savings:${sg.id}`;
    const hub = ensureHub('finance');
    const pct = Math.min(100, Math.round((sg.currentAmount / Math.max(1, sg.targetAmount)) * 100));
    addNode({
      id: sgId,
      title: sg.title,
      subtitle: `Savings · ${formatMoney(sg.currentAmount, currency)} / ${formatMoney(sg.targetAmount, currency)}`,
      category: 'finance',
      kind: 'savings-goal',
      tier: 'record',
      baseRadius: 8.5,
      progress: pct,
      status: sg.isReached ? 'completed' : 'active',
      isCompleted: sg.isReached,
      entityType: 'savingsGoal',
      entityId: sg.id,
      route: '/finance',
      createdAt: sg.createdAt,
    });
    addEdge(sgId, hub, 'belongs_to');
  }

  const budgetCatSet = new Set<string>();
  for (const b of data.financeBudgets) {
    if (b.deletedAt) continue;
    const bId = `budget:${b.id}`;
    const hub = ensureHub('finance');
    budgetCatSet.add(b.category.toLowerCase());
    addNode({
      id: bId,
      title: `${b.category} Budget`,
      subtitle: `Limit ${formatMoney(b.monthlyLimit, currency)} (${b.month})`,
      category: 'finance',
      kind: 'budget',
      tier: 'record',
      baseRadius: 7.5,
      status: 'active',
      entityType: 'financeBudget',
      entityId: b.id,
      route: '/finance',
      createdAt: b.createdAt,
    });
    addEdge(bId, hub, 'belongs_to');
  }

  const expenseTotalsByCat = new Map<string, number>();
  for (const tx of data.financeTransactions) {
    if (tx.deletedAt) continue;
    if (tx.type === 'expense') {
      expenseTotalsByCat.set(tx.category, (expenseTotalsByCat.get(tx.category) || 0) + tx.amount);
    }
  }
  for (const [catName, total] of expenseTotalsByCat.entries()) {
    if (budgetCatSet.has(catName.toLowerCase())) continue;
    const catId = `fin-cat:${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const hub = ensureHub('finance');
    addNode({
      id: catId,
      title: `${catName} Spend`,
      subtitle: `${formatMoney(total, currency)} logged`,
      category: 'finance',
      kind: 'finance-category',
      tier: 'supporting',
      baseRadius: 6,
      status: 'active',
      route: '/finance',
    });
    addEdge(catId, hub, 'belongs_to');
  }

  // 7. PERSONAL REVIEWS
  for (const rev of data.eveningReviews) {
    if (rev.deletedAt) continue;
    const revId = `review:${rev.id}`;
    const hub = ensureHub('personal');
    addNode({
      id: revId,
      title: `Review ${rev.date}`,
      subtitle: `Rating ${rev.rating}/5 · ${rev.tasksCompleted?.length || 0} done`,
      description: rev.reflection,
      category: 'personal',
      kind: 'evening-review',
      tier: 'supporting',
      baseRadius: 5.5,
      status: 'completed',
      isCompleted: false, // Personal journal entry remains visible
      entityType: 'eveningReview',
      entityId: rev.id,
      route: '/history',
      createdAt: rev.createdAt,
    });
    addEdge(revId, hub, 'belongs_to');
  }

  // 8. OBSIDIAN NOTES & WIKILINKS
  for (const note of data.obsidianNotes) {
    if (note.deletedAt) continue;
    const noteId = `note:${note.id}`;
    const noteCat: UniverseCategory =
      /business|brand|startup/i.test(`${note.folder} ${note.tags?.join(' ')}`)
        ? 'business'
        : /tech|code|ai|react/i.test(`${note.folder} ${note.tags?.join(' ')}`)
        ? 'technology'
        : 'knowledge';
    const hub = ensureHub(noteCat);

    addNode({
      id: noteId,
      title: note.title,
      subtitle: `Note · ${note.folder || 'Vault'}`,
      description: note.content.slice(0, 220),
      category: noteCat,
      kind: 'note',
      tier: 'record',
      baseRadius: 8.5,
      status: 'active',
      entityType: 'obsidianNote',
      entityId: note.id,
      route: '/notes',
      tags: note.tags,
      createdAt: note.createdAt,
    });
    addEdge(noteId, hub, 'belongs_to');

    if (note.linkedGoalId && nodesMap.has(`goal:${note.linkedGoalId}`)) {
      addEdge(noteId, `goal:${note.linkedGoalId}`, 'related_to');
    }
    if (note.linkedSubjectId && nodesMap.has(`subject:${note.linkedSubjectId}`)) {
      addEdge(noteId, `subject:${note.linkedSubjectId}`, 'references');
    }
  }

  // Second pass for [[Wikilink]] note references across all registered titles
  for (const note of data.obsidianNotes) {
    if (note.deletedAt) continue;
    const noteId = `note:${note.id}`;
    if (!nodesMap.has(noteId)) continue;
    const wikiTargets = extractWikiLinks(note.content);
    for (const rawTarget of wikiTargets) {
      const targetId = titleIndex.get(rawTarget.trim().toLowerCase());
      if (targetId && targetId !== noteId) {
        addEdge(noteId, targetId, 'references');
      }
    }
  }

  // 9. USER CUSTOM KNOWLEDGE UNIVERSE NODES
  for (const cn of data.graphNodes) {
    if (cn.deletedAt) continue;
    const hub = ensureHub(cn.category);
    addNode({
      id: cn.id,
      title: cn.title,
      subtitle: `Custom · ${cn.kind.replace(/-/g, ' ')}`,
      description: cn.description,
      category: cn.category,
      kind: cn.kind,
      tier: 'record',
      baseRadius: 8.5,
      status: cn.status || 'active',
      isCustom: true,
      entityType: 'customGraphNode',
      entityId: cn.id,
      tags: cn.tags,
      createdAt: cn.createdAt,
    });
    addEdge(cn.id, hub, 'belongs_to');
  }

  // 10. USER CUSTOM RELATIONSHIPS (Only if both endpoints remain active)
  for (const ce of data.graphEdges) {
    if (ce.deletedAt) continue;
    if (nodesMap.has(ce.sourceId) && nodesMap.has(ce.targetId)) {
      addEdge(ce.sourceId, ce.targetId, ce.relationType, {
        id: ce.id,
        isCustom: true,
        label: ce.label || RELATION_LABELS[ce.relationType],
        directional: ce.relationType === 'depends_on',
      });
    }
  }

  const allNodes = Array.from(nodesMap.values());
  const allEdges = Array.from(edgesMap.values());
  const hasAnyUserData = allNodes.some((n) => n.id !== 'me');

  return {
    nodes: allNodes,
    edges: allEdges,
    hasAnyUserData,
  };
}

/**
 * Applies Graph Mode, Category Filters, Status Filters, Search, and Direct-Connection scope
 * directly over the live assembled graph without copying underlying records.
 */
export function filterAndProjectUniverse(
  raw: { nodes: UniverseNode[]; edges: UniverseEdge[]; hasAnyUserData: boolean },
  options: UniverseFilterOptions
): UniverseGraphResult {
  const hiddenSet = new Set(options.hiddenCategories || []);
  const nodeById = new Map(raw.nodes.map((n) => [n.id, n]));
  const availableCategories = Array.from(
    new Set(
      raw.nodes
        .filter((n) => n.id !== 'me' && n.kind !== 'category-hub')
        .map((n) => n.category)
    )
  );

  // Determine mode-level allowed IDs
  let modeAllowedIds: Set<string> | null = null;
  if (options.mode === 'personal') {
    modeAllowedIds = new Set(
      raw.nodes
        .filter((n) =>
          ['personal', 'goals', 'habits-fitness'].includes(n.category)
        )
        .map((n) => n.id)
    );
  } else if (options.mode === 'academic') {
    const academicIds = new Set(
      raw.nodes.filter((n) => n.category === 'academics' && n.id !== 'me').map((n) => n.id)
    );
    // Include tasks/notes directly wired to academics (never traverse through 'me')
    for (const e of raw.edges) {
      if (e.source === 'me' || e.target === 'me') continue;
      if (academicIds.has(e.target) && !e.source.startsWith('cat:')) academicIds.add(e.source);
      if (academicIds.has(e.source) && !e.target.startsWith('cat:')) academicIds.add(e.target);
    }
    academicIds.add('me');
    modeAllowedIds = academicIds;
  } else if (options.mode === 'career') {
    const careerIds = new Set(
      raw.nodes
        .filter((n) => ['career', 'technology'].includes(n.category) && n.id !== 'me')
        .map((n) => n.id)
    );
    for (const e of raw.edges) {
      if (e.source === 'me' || e.target === 'me') continue;
      if (careerIds.has(e.target) && !e.source.startsWith('cat:')) careerIds.add(e.source);
      if (careerIds.has(e.source) && !e.target.startsWith('cat:')) careerIds.add(e.target);
    }
    careerIds.add('me');
    modeAllowedIds = careerIds;
  } else if (options.mode === 'knowledge') {
    const knowIds = new Set(
      raw.nodes
        .filter((n) => ['knowledge', 'technology'].includes(n.category) && n.id !== 'me')
        .map((n) => n.id)
    );
    for (const e of raw.edges) {
      if (e.source === 'me' || e.target === 'me') continue;
      if (knowIds.has(e.source) && !e.target.startsWith('cat:')) knowIds.add(e.target);
      if (knowIds.has(e.target) && !e.source.startsWith('cat:')) knowIds.add(e.source);
    }
    knowIds.add('me');
    modeAllowedIds = knowIds;
  } else if (options.mode === 'goal' && options.focusGoalId) {
    const anchor = `goal:${options.focusGoalId}`;
    const ego = new Set<string>(['me', anchor]);
    const collectNeighbors = (seedId: string) => {
      for (const e of raw.edges) {
        if (e.source === seedId && !e.target.startsWith('cat:')) ego.add(e.target);
        if (e.target === seedId && !e.source.startsWith('cat:')) ego.add(e.source);
      }
    };
    collectNeighbors(anchor);
    Array.from(ego).forEach((id) => {
      if (id !== 'me') collectNeighbors(id);
    });
    modeAllowedIds = ego;
  } else if (options.mode === 'project' && options.focusProjectId) {
    const anchor = `project:${options.focusProjectId}`;
    const ego = new Set<string>(['me', anchor]);
    for (const e of raw.edges) {
      if (e.source === anchor && !e.target.startsWith('cat:')) ego.add(e.target);
      if (e.target === anchor && !e.source.startsWith('cat:')) ego.add(e.source);
    }
    modeAllowedIds = ego;
  }

  const query = (options.searchQuery || '').trim().toLowerCase();

  let visibleNodes = raw.nodes.filter((node) => {
    if (node.id === 'me') return true;
    if (modeAllowedIds && !modeAllowedIds.has(node.id)) return false;
    if (hiddenSet.has(node.category)) return false;
    if (options.hideCompleted && node.isCompleted) return false;
    if (options.hideArchived && node.isArchived) return false;

    if (options.statusFilter && options.statusFilter !== 'all' && node.kind !== 'category-hub') {
      if (options.statusFilter === 'completed' && !node.isCompleted) return false;
      if (options.statusFilter === 'active' && (node.isCompleted || node.isArchived)) return false;
      if (options.statusFilter === 'overdue' && !node.isOverdue) return false;
    }

    if (query && node.kind !== 'category-hub') {
      const hay = `${node.title} ${node.category} ${node.kind} ${node.tags?.join(' ') || ''}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }

    return true;
  });

  // Remove category hubs that ended up with 0 visible children after filtering
  const prelimIds = new Set(visibleNodes.map((n) => n.id));
  const prelimEdges = raw.edges.filter((e) => prelimIds.has(e.source) && prelimIds.has(e.target));

  visibleNodes = visibleNodes.filter((n) => {
    if (n.kind !== 'category-hub') return true;
    return prelimEdges.some(
      (e) => (e.target === n.id && e.source !== 'me') || (e.source === n.id && e.target !== 'me')
    );
  });

  // Optional direct-only scope around selected node
  if (
    options.connectionScope === 'direct' &&
    options.selectedNodeId &&
    visibleNodes.some((n) => n.id === options.selectedNodeId)
  ) {
    const directIds = new Set<string>([options.selectedNodeId]);
    for (const e of prelimEdges) {
      if (e.source === options.selectedNodeId) directIds.add(e.target);
      if (e.target === options.selectedNodeId) directIds.add(e.source);
    }
    visibleNodes = visibleNodes.filter((n) => directIds.has(n.id));
  }

  const finalIds = new Set(visibleNodes.map((n) => n.id));
  let finalEdges = prelimEdges.filter((e) => finalIds.has(e.source) && finalIds.has(e.target));

  // Optional connected-only filter (excludes nodes connected only to 'me' or nothing except 'me')
  if (options.connectedOnly) {
    const degreeCount = new Map<string, number>();
    for (const e of finalEdges) {
      degreeCount.set(e.source, (degreeCount.get(e.source) || 0) + 1);
      degreeCount.set(e.target, (degreeCount.get(e.target) || 0) + 1);
    }
    visibleNodes = visibleNodes.filter(
      (n) => n.id === 'me' || (degreeCount.get(n.id) || 0) >= 1
    );
    const keepIds = new Set(visibleNodes.map((n) => n.id));
    finalEdges = finalEdges.filter((e) => keepIds.has(e.source) && keepIds.has(e.target));
  }

  // Ensure focused project/goal connects smoothly to Me if its category hub was filtered out
  if ((options.mode === 'goal' || options.mode === 'project') && finalIds.size > 1) {
    const anchorId =
      options.mode === 'goal' && options.focusGoalId
        ? `goal:${options.focusGoalId}`
        : options.mode === 'project' && options.focusProjectId
        ? `project:${options.focusProjectId}`
        : '';
    if (anchorId && finalIds.has(anchorId) && finalIds.has('me')) {
      const hasMeLink = finalEdges.some(
        (e) => (e.source === anchorId && e.target === 'me') || (e.source === 'me' && e.target === anchorId)
      );
      if (!hasMeLink) {
        finalEdges.push({
          id: `${anchorId}->me:belongs_to`,
          source: anchorId,
          target: 'me',
          relationType: 'belongs_to',
          label: 'Belongs to',
        });
      }
    }
  }

  // Re-attach nodes referenced cleanly
  const validNodeSet = new Set(visibleNodes.map((n) => n.id));
  const cleanEdges = finalEdges.filter((e) => validNodeSet.has(e.source) && validNodeSet.has(e.target));

  void nodeById;
  return {
    nodes: visibleNodes,
    edges: cleanEdges,
    hasAnyUserData: raw.hasAnyUserData,
    availableCategories,
    stats: {
      totalNodes: visibleNodes.length,
      totalEdges: cleanEdges.length,
      customNodes: visibleNodes.filter((n) => n.isCustom).length,
      customEdges: cleanEdges.filter((e) => e.isCustom).length,
    },
  };
}
