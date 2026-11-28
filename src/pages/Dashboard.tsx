import React, { useMemo, useState, useEffect } from 'react';
import {
  CheckSquare,
  Repeat,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Check,
  Flame,
  Dumbbell,
  Wallet,
  Moon,
  Plus,
  Sliders,
  X,
  Calendar,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import useStore, { isHabitScheduledOnDate } from '../store/useStore';
import {
  PRIORITY_ORDER,
  buildUpcomingEvents,
  computeDashboardAcademicSummary,
  computeDashboardFinanceSummary,
  filterUserRecords,
  formatDashboardCurrency,
  formatShortEventDate,
  getEffectiveTodayContext,
  getGoalProgressLabel,
  getLatestWorkoutSession,
  resolveDashboardWidgets,
} from '../lib/dashboardSelectors';
import type { Goal, Priority, Task } from '../types';
import { Badge, Button, Checkbox, EmptyState, HabitIcon, ProgressBar } from '../components/ui';
import QuickTaskBar from '../components/QuickTaskBar';
import TaskModal from '../components/TaskModal';
import GoalModal from '../components/GoalModal';
import HabitModal from '../components/HabitModal';
import ClassModal from '../components/ClassModal';

type TaskModalState = {
  task?: Task;
  initialValues?: {
    title?: string;
    priority?: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  };
} | null;

export default function Dashboard() {
  const rawGoals = useStore((s) => s.goals);
  const rawTasks = useStore((s) => s.tasks);
  const rawHabits = useStore((s) => s.habits);
  const rawHabitEntries = useStore((s) => s.habitEntries);
  const rawFinanceTransactions = useStore((s) => s.financeTransactions);
  const rawFinanceBudgets = useStore((s) => s.financeBudgets);
  const rawAcademicSubjects = useStore((s) => s.academicSubjects);
  const rawAcademicAssignments = useStore((s) => s.academicAssignments);
  const rawAcademicExams = useStore((s) => s.academicExams);
  const rawTimetableSlots = useStore((s) => s.timetableSlots);
  const rawCareerApplications = useStore((s) => s.careerApplications);
  const rawWorkoutSessions = useStore((s) => s.workoutSessions);
  const rawEveningReviews = useStore((s) => s.eveningReviews);
  const settings = useStore((s) => s.settings);

  const updateSettings = useStore((s) => s.updateSettings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const completeTask = useStore((s) => s.completeTask);
  const reopenTask = useStore((s) => s.reopenTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const startTaskFocusSession = useStore((s) => s.startTaskFocusSession);
  const recordTaskFocusDuration = useStore((s) => s.recordTaskFocusDuration);
  const addToast = useStore((s) => s.addToast);

  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [taskModalState, setTaskModalState] = useState<TaskModalState>(null);
  const [goalModalState, setGoalModalState] = useState<{ open: boolean; goal?: Goal }>({ open: false });
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const isDemoMode = Boolean(settings.isDemoMode);

  // Filter out soft-deleted and unrequested demo records so only real user data renders
  const goals = useMemo(() => filterUserRecords(rawGoals, isDemoMode), [rawGoals, isDemoMode]);
  const tasks = useMemo(() => filterUserRecords(rawTasks, isDemoMode), [rawTasks, isDemoMode]);
  const habits = useMemo(
    () => filterUserRecords(rawHabits, isDemoMode).filter((h) => !h.isArchived),
    [rawHabits, isDemoMode]
  );
  const habitEntries = useMemo(
    () => filterUserRecords(rawHabitEntries, isDemoMode),
    [rawHabitEntries, isDemoMode]
  );
  const financeTransactions = useMemo(
    () => filterUserRecords(rawFinanceTransactions, isDemoMode),
    [rawFinanceTransactions, isDemoMode]
  );
  const financeBudgets = useMemo(
    () => filterUserRecords(rawFinanceBudgets, isDemoMode),
    [rawFinanceBudgets, isDemoMode]
  );
  const academicSubjects = useMemo(
    () => filterUserRecords(rawAcademicSubjects, isDemoMode),
    [rawAcademicSubjects, isDemoMode]
  );
  const academicAssignments = useMemo(
    () => filterUserRecords(rawAcademicAssignments, isDemoMode),
    [rawAcademicAssignments, isDemoMode]
  );
  const academicExams = useMemo(
    () => filterUserRecords(rawAcademicExams, isDemoMode),
    [rawAcademicExams, isDemoMode]
  );
  const timetableSlots = useMemo(
    () => filterUserRecords(rawTimetableSlots, isDemoMode),
    [rawTimetableSlots, isDemoMode]
  );
  const careerApplications = useMemo(
    () => filterUserRecords(rawCareerApplications, isDemoMode),
    [rawCareerApplications, isDemoMode]
  );
  const workoutSessions = useMemo(
    () => filterUserRecords(rawWorkoutSessions, isDemoMode),
    [rawWorkoutSessions, isDemoMode]
  );
  const eveningReviews = useMemo(
    () => filterUserRecords(rawEveningReviews, isDemoMode),
    [rawEveningReviews, isDemoMode]
  );

  const { todayStr, currentMonthStr, currentDayOfWeek, todayFormatted, sevenDaysLaterStr } =
    useMemo(() => getEffectiveTodayContext(settings.dayStartHour ?? 4), [settings.dayStartHour]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  // Focus Timer State initialized from user preference
  const preferredFocusMins =
    typeof settings.defaultFocusDuration === 'number' && settings.defaultFocusDuration > 0
      ? settings.defaultFocusDuration
      : 25;
  const [timerDurationMins, setTimerDurationMins] = useState(preferredFocusMins);
  const [timerSeconds, setTimerSeconds] = useState(preferredFocusMins * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState('');

  useEffect(() => {
    if (!isTimerRunning) {
      setTimerDurationMins(preferredFocusMins);
      setTimerSeconds(preferredFocusMins * 60);
    }
  }, [preferredFocusMins]);

  useEffect(() => {
    const anyModalOpen =
      showWidgetCustomizer ||
      Boolean(taskModalState) ||
      goalModalState.open ||
      showHabitModal ||
      showClassModal;
    if (!anyModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWidgetCustomizer(false);
        setTaskModalState(null);
        setGoalModalState({ open: false });
        setShowHabitModal(false);
        setShowClassModal(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showWidgetCustomizer, taskModalState, goalModalState.open, showHabitModal, showClassModal]);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.isCompleted && !t.isArchived && t.dueDate === todayStr)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [tasks, todayStr]
  );

  const overdueTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            !t.isCompleted &&
            !t.isArchived &&
            (t.isOverdue || (t.dueDate && t.dueDate < todayStr))
        )
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [tasks, todayStr]
  );

  const openFocusCandidates = useMemo(
    () => [...overdueTasks, ...todayTasks],
    [overdueTasks, todayTasks]
  );

  useEffect(() => {
    if (selectedFocusTaskId && !openFocusCandidates.some((t) => t.id === selectedFocusTaskId)) {
      setSelectedFocusTaskId('');
    }
  }, [openFocusCandidates, selectedFocusTaskId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (selectedFocusTaskId) {
        recordTaskFocusDuration(selectedFocusTaskId, timerDurationMins);
      }
      addToast({
        type: 'success',
        title: 'Focus Block Complete',
        message: selectedFocusTaskId
          ? `Logged ${timerDurationMins}m deep work to your task.`
          : `${timerDurationMins}m deep work session finished.`,
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isTimerRunning,
    timerSeconds,
    timerDurationMins,
    selectedFocusTaskId,
    recordTaskFocusDuration,
    addToast,
  ]);

  const selectTimerMode = (mins: number) => {
    setIsTimerRunning(false);
    setTimerDurationMins(mins);
    setTimerSeconds(mins * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timerProgressPct =
    timerDurationMins > 0
      ? Math.round(((timerDurationMins * 60 - timerSeconds) / (timerDurationMins * 60)) * 100)
      : 0;

  const completedTodayCount = useMemo(
    () =>
      tasks.filter(
        (t) => !t.isArchived && t.isCompleted && t.completedAt?.startsWith(todayStr)
      ).length,
    [tasks, todayStr]
  );

  const habitsToday = useMemo(
    () => habits.filter((h) => isHabitScheduledOnDate(h, todayStr)),
    [habits, todayStr]
  );

  const habitsCompletedTodayCount = useMemo(
    () =>
      habitsToday.filter((h) =>
        habitEntries.some(
          (e) => e.habitId === h.id && e.date === todayStr && (e.completed || e.status === 'completed')
        )
      ).length,
    [habitsToday, habitEntries, todayStr]
  );

  const dailyProgress = useMemo(() => {
    const totalItems = todayTasks.length + completedTodayCount + habitsToday.length;
    if (totalItems === 0) return 0;
    const completedItems = completedTodayCount + habitsCompletedTodayCount;
    return Math.round((completedItems / totalItems) * 100);
  }, [todayTasks.length, completedTodayCount, habitsToday.length, habitsCompletedTodayCount]);

  const priorityGoals = useMemo(
    () =>
      goals
        .filter((g) => !g.isArchived && g.status !== 'completed')
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        .slice(0, 3),
    [goals]
  );

  const academicSummary = useMemo(
    () =>
      computeDashboardAcademicSummary(
        academicSubjects,
        academicAssignments,
        academicExams,
        timetableSlots,
        currentDayOfWeek,
        todayStr,
        sevenDaysLaterStr
      ),
    [
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      currentDayOfWeek,
      todayStr,
      sevenDaysLaterStr,
    ]
  );

  const financeSummary = useMemo(
    () =>
      computeDashboardFinanceSummary(
        financeTransactions,
        financeBudgets,
        currentMonthStr
      ),
    [financeTransactions, financeBudgets, currentMonthStr]
  );

  const upcomingEvents = useMemo(
    () =>
      buildUpcomingEvents({
        tasks,
        academicAssignments,
        academicExams,
        academicSubjects,
        careerApplications,
        goals,
        todayStr,
        sevenDaysLaterStr,
      }),
    [
      tasks,
      academicAssignments,
      academicExams,
      academicSubjects,
      careerApplications,
      goals,
      todayStr,
      sevenDaysLaterStr,
    ]
  );

  const latestWorkout = useMemo(
    () => getLatestWorkoutSession(workoutSessions),
    [workoutSessions]
  );

  const hasReviewedToday = useMemo(
    () => eveningReviews.some((r) => r.date === todayStr),
    [eveningReviews, todayStr]
  );

  const widgets = useMemo(() => resolveDashboardWidgets(settings), [settings]);
  const hasLeftColumn = widgets.todayTasks || widgets.habits;

  const isWorkspaceEmpty =
    tasks.filter((t) => !t.isArchived).length === 0 &&
    goals.filter((g) => !g.isArchived).length === 0 &&
    habits.length === 0 &&
    timetableSlots.length === 0 &&
    academicAssignments.length === 0 &&
    academicExams.length === 0 &&
    financeTransactions.length === 0;

  const handleToggleTask = (task: Task) => {
    if (task.isCompleted) {
      reopenTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const expenseDisplay = formatDashboardCurrency(
    financeSummary.monthlyExpenses,
    settings.currencySymbol
  );

  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset =
    ringCircumference - (timerProgressPct / 100) * ringCircumference;

  const headerStatusParts: string[] = [];
  if (todayTasks.length > 0) {
    headerStatusParts.push(`${todayTasks.length} due today`);
  }
  if (overdueTasks.length > 0) {
    headerStatusParts.push(`${overdueTasks.length} overdue`);
  }
  const openHabitsCount = habitsToday.length - habitsCompletedTodayCount;
  if (habitsToday.length > 0) {
    headerStatusParts.push(`${openHabitsCount} habit${openHabitsCount !== 1 ? 's' : ''} open`);
  }
  if (academicSummary.todayClasses.length > 0) {
    headerStatusParts.push(
      `${academicSummary.todayClasses.length} class${academicSummary.todayClasses.length !== 1 ? 'es' : ''}`
    );
  }
  const headerSubtitle =
    headerStatusParts.length > 0
      ? headerStatusParts.join(' · ')
      : isWorkspaceEmpty
      ? 'Clean workspace ready for your first items'
      : 'All queued items for today are clear';

  const visibleOverdueTasks = showAllOverdue ? overdueTasks : overdueTasks.slice(0, 1);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Command Header */}
      <section
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '4px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="brick" className="font-tabular">{todayFormatted}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {headerSubtitle}
            </span>
          </div>
          <h1
            className="text-display"
            style={{ color: 'var(--text-primary)', margin: 0 }}
          >
            {settings.userName?.trim() ? `${greeting}, ${settings.userName.trim()}` : greeting}
          </h1>
          {settings.userGreeting?.trim() && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {settings.userGreeting.trim()}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Daily Cadence
            </span>
            <div style={{ width: '72px' }}>
              <ProgressBar value={dailyProgress} size="md" variant="brick" />
            </div>
            <span className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {dailyProgress}%
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowWidgetCustomizer(true)}
            aria-label="Customize dashboard widgets"
            icon={<Sliders size={13} aria-hidden="true" />}
          >
            Customize
          </Button>
        </div>
      </section>

      {/* New-user orientation banner with direct creation actions */}
      {isWorkspaceEmpty && (
        <section
          aria-label="First steps in LIFE OS"
          className="editorial-island"
          style={{
            borderColor: 'var(--accent-border)',
            background: 'var(--bg-surface)',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px' }}>
              <span className="section-eyebrow">Your Workspace</span>
              <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', margin: '4px 0 4px' }}>
                Start with one task, goal, habit, or class
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Nothing is pre-filled with sample profiles. Add your own items below or configure your name and life areas in Settings.
              </p>
            </div>
            {!settings.userName?.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('settings')}
              >
                Set your name in Settings
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setTaskModalState({ initialValues: { dueDate: todayStr } })}
              icon={<CheckSquare size={14} aria-hidden="true" />}
            >
              Add First Task
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setGoalModalState({ open: true })}
              icon={<Target size={14} aria-hidden="true" />}
            >
              Create First Goal
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowHabitModal(true)}
              icon={<Repeat size={14} aria-hidden="true" />}
            >
              Start First Habit
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowClassModal(true)}
              icon={<Calendar size={14} aria-hidden="true" />}
            >
              Add Class or Event
            </Button>
          </div>
        </section>
      )}

      {/* 2. Natural Language Quick Capture Bar */}
      <QuickTaskBar
        compact
        onExpandDetails={(vals) => setTaskModalState({ initialValues: vals || {} })}
      />

      {/* 3. KPI Summary Strip */}
      <section className="today-kpi-grid" aria-label="Today summary metrics">
        <button
          type="button"
          onClick={() => setActiveView('tasks')}
          className="editorial-stat-card card-interactive"
          style={{ textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Today Tasks</span>
            <CheckSquare size={15} color="var(--accent-primary)" aria-hidden="true" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
            <span className="font-tabular" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {todayTasks.length}
            </span>
            <span style={{ fontSize: '12px', color: overdueTasks.length > 0 ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
              {overdueTasks.length > 0
                ? `open · ${overdueTasks.length} overdue`
                : `open · ${completedTodayCount} done`}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('habits')}
          className="editorial-stat-card card-interactive"
          style={{ textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Habits Today</span>
            <Repeat size={15} color="var(--status-success)" aria-hidden="true" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
            <span className="font-tabular" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {habitsToday.length > 0 ? `${habitsCompletedTodayCount}/${habitsToday.length}` : '0'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {habitsToday.length > 0
                ? 'completed'
                : habits.length > 0
                ? 'rest day today'
                : 'no rituals yet'}
            </span>
          </div>
        </button>

        {widgets.academics && (
          <button
            type="button"
            onClick={() => setActiveView('academics')}
            className="editorial-stat-card card-interactive"
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Academics</span>
              <GraduationCap
                size={15}
                color={
                  academicSummary.atRiskSubject || academicSummary.overdueAssignmentsCount > 0
                    ? 'var(--status-danger)'
                    : 'var(--status-info)'
                }
                aria-hidden="true"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
              <span
                className="font-tabular"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color:
                    (academicSummary.attendanceAvg !== null && academicSummary.attendanceAvg < 75) ||
                    academicSummary.overdueAssignmentsCount > 0
                      ? 'var(--status-danger)'
                      : 'var(--text-primary)',
                }}
              >
                {academicSummary.todayClasses.length > 0
                  ? `${academicSummary.todayClasses.length}`
                  : academicSummary.pendingAssignmentsCount + academicSummary.upcomingExamsCount > 0
                  ? `${academicSummary.pendingAssignmentsCount + academicSummary.upcomingExamsCount}`
                  : academicSummary.attendanceAvg !== null
                  ? `${academicSummary.attendanceAvg.toFixed(0)}%`
                  : '0'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {academicSummary.todayClasses.length > 0
                  ? `class${academicSummary.todayClasses.length !== 1 ? 'es' : ''} today`
                  : academicSummary.pendingAssignmentsCount + academicSummary.upcomingExamsCount > 0
                  ? 'open academic items'
                  : academicSummary.attendanceAvg !== null
                  ? 'attendance'
                  : academicSubjects.length > 0
                  ? 'classes logged'
                  : 'no courses yet'}
              </span>
            </div>
          </button>
        )}

        {widgets.finance && (
          <button
            type="button"
            onClick={() => setActiveView('finance')}
            className="editorial-stat-card card-interactive"
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-label" style={{ color: 'var(--text-secondary)' }}>Month Spend</span>
              <Wallet size={15} color="var(--accent-secondary)" aria-hidden="true" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
              <span className="font-tabular" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {expenseDisplay}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {financeSummary.budgetUtilizationPct !== null
                  ? `${financeSummary.budgetUtilizationPct}% of budget`
                  : financeSummary.monthlyIncome > 0
                  ? `${formatDashboardCurrency(financeSummary.monthlyIncome, settings.currencySymbol)} in`
                  : financeSummary.monthTransactionCount === 0
                  ? 'no entries this month'
                  : 'logged'}
              </span>
            </div>
          </button>
        )}
      </section>

      {/* 4. Execution Grid: Tasks + Habits (Left) | Focus + Schedule + Upcoming + Review (Right) */}
      <section className={`today-execution-grid${!hasLeftColumn ? ' single-col' : ''}`}>
        {hasLeftColumn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Today's Action Queue */}
            {widgets.todayTasks && (
              <div className="editorial-island">
                <div className="editorial-island-header" style={{ flexWrap: 'wrap' }}>
                  <div>
                    <span className="section-eyebrow">Priority Queue</span>
                    <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                      Today’s Execution
                    </h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setTaskModalState({ initialValues: { dueDate: todayStr } })}
                      icon={<Plus size={13} aria-hidden="true" />}
                    >
                      Task
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView('tasks')}
                      style={{ color: 'var(--accent-light)' }}
                      icon={<ArrowRight size={13} aria-hidden="true" />}
                      iconPosition="right"
                    >
                      Open Tasks
                    </Button>
                  </div>
                </div>

                {overdueTasks.length > 0 && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-danger-bg)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      marginBottom: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={15} color="var(--status-danger)" aria-hidden="true" />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--status-danger)' }}>
                          {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {overdueTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowAllOverdue((prev) => !prev)}
                          aria-expanded={showAllOverdue}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--text-primary)', padding: '2px 8px', fontSize: '11.5px' }}
                        >
                          {showAllOverdue ? 'Show less' : `Show all (${overdueTasks.length})`}
                          {showAllOverdue ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
                        </button>
                      )}
                    </div>

                    {visibleOverdueTasks.map((ot) => (
                      <div
                        key={ot.id}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px 12px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setTaskModalState({ task: ot })}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            textAlign: 'left',
                            cursor: 'pointer',
                            flex: '1 1 180px',
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ot.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Due {ot.dueDate || 'earlier'}
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => rescheduleTask(ot.id, todayStr)}
                          style={{ flexShrink: 0 }}
                        >
                          Move to Today
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {todayTasks.length === 0 ? (
                  overdueTasks.length > 0 ? (
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border-default)',
                        background: 'var(--bg-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        No new tasks queued for today. Review your overdue items above or add one now.
                      </span>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setTaskModalState({ initialValues: { dueDate: todayStr } })}
                        icon={<Plus size={14} aria-hidden="true" />}
                      >
                        Add Task for Today
                      </Button>
                    </div>
                  ) : (
                    <EmptyState
                      illustration="tasks"
                      badge="Clear Slate"
                      title="No tasks scheduled for today."
                      description="Use the quick capture bar above or create a task with a deadline and subtasks."
                      action={
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setTaskModalState({ initialValues: { dueDate: todayStr } })}
                          icon={<Plus size={14} aria-hidden="true" />}
                        >
                          Add Task for Today
                        </Button>
                      }
                    />
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {todayTasks.slice(0, 6).map((t) => {
                      const doneSubtasks = t.subtasks?.filter((st) => st.isCompleted).length || 0;
                      const totalSubtasks = t.subtasks?.length || 0;
                      return (
                        <div
                          key={t.id}
                          className="editorial-triage-row"
                          style={{ opacity: t.isCompleted ? 0.55 : 1, cursor: 'default' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                            <Checkbox
                              size="sm"
                              checked={t.isCompleted}
                              onChange={() => handleToggleTask(t)}
                            />
                            <button
                              type="button"
                              onClick={() => setTaskModalState({ task: t })}
                              style={{
                                minWidth: 0,
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                              aria-label={`Edit task ${t.title}`}
                            >
                              <div
                                style={{
                                  fontSize: '13.5px',
                                  fontWeight: 600,
                                  color: t.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                                  textDecoration: t.isCompleted ? 'line-through' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {t.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '11.5px',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '8px',
                                  marginTop: '2px',
                                }}
                              >
                                <span>{t.category || 'General'}</span>
                                {t.dueTime && <span className="font-tabular">· {t.dueTime}</span>}
                                {t.estimatedDuration && (
                                  <span className="font-tabular" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    · <Clock size={10} aria-hidden="true" /> {t.estimatedDuration}m
                                  </span>
                                )}
                                {totalSubtasks > 0 && (
                                  <span className="font-tabular">
                                    · {doneSubtasks}/{totalSubtasks} steps
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {!t.isCompleted && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startTaskFocusSession(t.id)}
                                style={{ color: 'var(--accent-light)', padding: '4px 8px' }}
                                title="Focus on this task"
                                icon={<Play size={11} fill="currentColor" aria-hidden="true" />}
                              >
                                Focus
                              </Button>
                            )}
                            <Badge
                              variant={
                                t.priority === 'critical'
                                  ? 'danger'
                                  : t.priority === 'high'
                                  ? 'warning'
                                  : 'silver'
                              }
                            >
                              {t.priority}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}

                    {todayTasks.length > 6 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveView('tasks')}
                        style={{ alignSelf: 'flex-start', color: 'var(--accent-light)' }}
                        icon={<ArrowRight size={13} aria-hidden="true" />}
                        iconPosition="right"
                      >
                        View {todayTasks.length - 6} more scheduled today
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Habit Rhythm Checklist */}
            {widgets.habits && (
              <div className="editorial-island">
                <div className="editorial-island-header" style={{ flexWrap: 'wrap' }}>
                  <div>
                    <span className="section-eyebrow">Daily Rituals</span>
                    <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                      Habits Today
                    </h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHabitModal(true)}
                      icon={<Plus size={13} aria-hidden="true" />}
                    >
                      Habit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView('habits')}
                      style={{ color: 'var(--accent-light)' }}
                      icon={<ArrowRight size={13} aria-hidden="true" />}
                      iconPosition="right"
                    >
                      All Habits
                    </Button>
                  </div>
                </div>

                {habitsToday.length === 0 ? (
                  <EmptyState
                    illustration="habits"
                    badge="Rituals"
                    title={habits.length === 0 ? 'No habits added yet.' : 'No habits scheduled for today.'}
                    description={
                      habits.length === 0
                        ? 'Create your first daily or weekly ritual to track streaks and consistency.'
                        : `You have ${habits.length} active habit${habits.length !== 1 ? 's' : ''} scheduled on other days.`
                    }
                    action={
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setShowHabitModal(true)}
                        icon={<Plus size={14} aria-hidden="true" />}
                      >
                        Add Habit
                      </Button>
                    }
                  />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {habitsToday.map((h) => {
                      const entry = habitEntries.find(
                        (e) => e.habitId === h.id && e.date === todayStr
                      );
                      const isDone = Boolean(
                        entry && (entry.completed || entry.status === 'completed')
                      );
                      const hasQuantifiedTarget =
                        (h.type === 'numeric' || h.type === 'duration' || h.type === 'frequency') &&
                        typeof h.targetValue === 'number' &&
                        h.targetValue > 1;

                      return (
                        <div
                          key={h.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: isDone ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                            border: `1px solid ${isDone ? 'var(--accent-border)' : 'var(--border-default)'}`,
                            transition: 'all var(--spring-fast)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span
                              style={{
                                color: isDone ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                display: 'inline-flex',
                                flexShrink: 0,
                              }}
                              aria-hidden="true"
                            >
                              <HabitIcon icon={h.icon} size={16} />
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {h.name}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  marginTop: '3px',
                                  fontSize: '11px',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    color: 'var(--accent-secondary)',
                                    fontWeight: 600,
                                  }}
                                  className="font-tabular"
                                >
                                  <Flame size={11} aria-hidden="true" /> {h.streak || 0}d
                                </span>
                                {hasQuantifiedTarget ? (
                                  <span className="font-tabular">
                                    · {entry?.value ?? (isDone ? h.targetValue : 0)}/{h.targetValue}{' '}
                                    {h.unit || ''}
                                  </span>
                                ) : (
                                  <span>· {h.category || 'Daily'}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleHabitEntry(h.id, todayStr)}
                            className="btn-habit-check"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: isDone ? 'none' : '1.5px solid var(--border-light)',
                              background: isDone ? 'var(--accent-primary)' : 'var(--bg-surface)',
                              color: isDone ? '#FFFFFF' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                            aria-pressed={isDone}
                            aria-label={`Mark ${h.name} as ${isDone ? 'incomplete' : 'complete'}`}
                          >
                            <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Focus Sprint Card */}
          {widgets.focusTimer && (
            <div className={`focus-timer-card ${isTimerRunning ? 'active' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="section-eyebrow">Focus Sprint</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    selectedFocusTaskId
                      ? startTaskFocusSession(selectedFocusTaskId)
                      : setActiveView('focus')
                  }
                  style={{ padding: '2px 6px', fontSize: '11.5px' }}
                  icon={<ArrowRight size={12} aria-hidden="true" />}
                  iconPosition="right"
                >
                  Fullscreen
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {[
                  { label: '25m Deep', mins: 25 },
                  { label: '45m Flow', mins: 45 },
                  { label: '5m Break', mins: 5 },
                ].map((opt) => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => selectTimerMode(opt.mins)}
                    className={`tab-pill ${timerDurationMins === opt.mins ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '5px 8px' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {openFocusCandidates.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label htmlFor="dashboard-focus-task" className="form-label" style={{ display: 'block', marginBottom: '4px' }}>
                    Focus target (optional)
                  </label>
                  <select
                    id="dashboard-focus-task"
                    value={selectedFocusTaskId}
                    onChange={(e) => setSelectedFocusTaskId(e.target.value)}
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  >
                    <option value="">General deep work session</option>
                    {openFocusCandidates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 18px' }}>
                <div style={{ position: 'relative', width: '136px', height: '136px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="136" height="136" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }} aria-hidden="true">
                    <circle
                      cx="68"
                      cy="68"
                      r={ringRadius}
                      fill="none"
                      stroke="var(--border-default)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="68"
                      cy="68"
                      r={ringRadius}
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringDashOffset}
                      style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                    />
                  </svg>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div
                      className="font-tabular"
                      style={{
                        fontSize: '30px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {formatTimer(timerSeconds)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {isTimerRunning ? 'In Focus' : 'Ready'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsTimerRunning((r) => !r)}
                  style={{ flex: 1 }}
                  icon={
                    isTimerRunning ? (
                      <Pause size={14} aria-hidden="true" />
                    ) : (
                      <Play size={14} fill="currentColor" aria-hidden="true" />
                    )
                  }
                >
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => selectTimerMode(timerDurationMins)}
                  className="btn-icon icon-btn-spin"
                  title="Reset Timer"
                  aria-label="Reset Timer"
                  icon={<RotateCcw size={15} aria-hidden="true" />}
                />
              </div>
            </div>
          )}

          {/* Today's Class Schedule & Academic Status */}
          {widgets.academics && (
            <div className="editorial-island">
              <div className="editorial-island-header" style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={15} color="var(--status-info)" aria-hidden="true" />
                  <h3 className="text-heading-sub" style={{ color: 'var(--text-primary)' }}>
                    Today’s Timetable
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowClassModal(true)}
                    icon={<Plus size={12} aria-hidden="true" />}
                  >
                    Class
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView('academics')}
                    icon={<ArrowRight size={12} aria-hidden="true" />}
                    iconPosition="right"
                  >
                    Academics
                  </Button>
                </div>
              </div>

              {(academicSummary.atRiskSubject ||
                academicSummary.overdueAssignmentsCount > 0 ||
                academicSummary.pendingAssignmentsCount > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {academicSummary.atRiskSubject && (
                    <Badge variant="danger">
                      Low attendance: {academicSummary.atRiskSubject.code || academicSummary.atRiskSubject.name}
                    </Badge>
                  )}
                  {academicSummary.overdueAssignmentsCount > 0 && (
                    <Badge variant="danger">
                      {academicSummary.overdueAssignmentsCount} overdue assignment{academicSummary.overdueAssignmentsCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {academicSummary.pendingAssignmentsCount > 0 && academicSummary.overdueAssignmentsCount === 0 && (
                    <Badge variant="silver">
                      {academicSummary.pendingAssignmentsCount} open assignment{academicSummary.pendingAssignmentsCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}

              {academicSummary.todayClasses.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                    {academicSubjects.length === 0 && timetableSlots.length === 0
                      ? 'Add your weekly classes or semester courses to see today’s schedule.'
                      : 'No classes scheduled for today.'}
                  </p>
                  {timetableSlots.length === 0 && (
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowClassModal(true)}
                        icon={<Plus size={13} aria-hidden="true" />}
                      >
                        Add Class Slot
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {academicSummary.todayClasses.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {slot.subjectName || slot.courseCode || 'Class'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Room {slot.room || 'TBA'}
                        </div>
                      </div>
                      <Badge variant="silver" className="font-tabular">
                        {slot.startTime} - {slot.endTime}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events & Deadlines (Next 7 Days) */}
          <div className="editorial-island">
            <div className="editorial-island-header" style={{ flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="var(--accent-primary)" aria-hidden="true" />
                <h3 className="text-heading-sub" style={{ color: 'var(--text-primary)' }}>
                  Upcoming (7 Days)
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTaskModalState({ initialValues: {} })}
                icon={<Plus size={12} aria-hidden="true" />}
              >
                Schedule
              </Button>
            </div>

            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                No upcoming tasks, assignments, exams, career follow-ups, or goal deadlines in the next 7 days.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingEvents.slice(0, 5).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setActiveView(ev.targetView)}
                    className="editorial-triage-row"
                    style={{ textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {ev.badgeLabel} · {ev.subtitle}
                      </div>
                    </div>
                    <Badge variant={ev.isToday ? 'warning' : 'silver'} className="font-tabular">
                      {formatShortEventDate(ev.date, todayStr)}
                    </Badge>
                  </button>
                ))}
                {upcomingEvents.length > 5 && (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    +{upcomingEvents.length - 5} more upcoming item{upcomingEvents.length - 5 !== 1 ? 's' : ''} across modules
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Fitness & Evening Review Dual Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {widgets.fitness && (
              <button
                type="button"
                onClick={() => setActiveView('fitness')}
                className="card card-interactive"
                style={{ textAlign: 'left', padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <Dumbbell size={16} color="var(--status-success)" aria-hidden="true" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Fitness Log
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {latestWorkout
                          ? `${latestWorkout.title || latestWorkout.splitType} · ${formatShortEventDate(latestWorkout.date, todayStr)}`
                          : 'No workout sessions logged yet'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="silver" className="font-tabular">{workoutSessions.length}</Badge>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('review')}
              className="card card-interactive"
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderColor: hasReviewedToday ? 'rgba(16, 185, 129, 0.3)' : 'var(--accent-border)',
                background: hasReviewedToday ? 'var(--status-success-bg)' : 'var(--accent-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Moon size={16} color={hasReviewedToday ? 'var(--status-success)' : 'var(--accent-light)'} aria-hidden="true" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {hasReviewedToday ? 'Evening Shutdown Logged' : 'Evening Review'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {hasReviewedToday
                        ? 'Reflection saved for today.'
                        : 'Reflect on wins & set tomorrow’s top 3 priorities.'}
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-secondary)" aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Active Strategic Goals */}
      {widgets.goals && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <span className="section-eyebrow">Horizons</span>
              <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                Active Goals
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setGoalModalState({ open: true })}
                icon={<Plus size={13} aria-hidden="true" />}
              >
                Goal
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('goals')}
                style={{ color: 'var(--accent-light)' }}
                icon={<ArrowRight size={13} aria-hidden="true" />}
                iconPosition="right"
              >
                Manage Goals
              </Button>
            </div>
          </div>

          {priorityGoals.length === 0 ? (
            <EmptyState
              illustration="goals"
              badge="Long-Term Clarity"
              title="Set your next milestone."
              description="Define measurable semester, fitness, or career goals and link your daily tasks."
              action={
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setGoalModalState({ open: true })}
                  icon={<Plus size={14} aria-hidden="true" />}
                >
                  Create Goal
                </Button>
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {priorityGoals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoalModalState({ open: true, goal: g })}
                  className="card card-interactive"
                  style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant="silver">{g.category || 'Personal'}</Badge>
                    <Badge
                      variant={
                        g.priority === 'critical'
                          ? 'danger'
                          : g.priority === 'high'
                          ? 'warning'
                          : 'brick'
                      }
                    >
                      {g.priority}
                    </Badge>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {g.title}
                    </h3>
                    {g.description && (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {g.description}
                      </p>
                    )}
                  </div>

                  <ProgressBar
                    value={g.progress}
                    label={getGoalProgressLabel(g)}
                    showPercentage
                    variant="brick"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Widget Customizer Modal */}
      {showWidgetCustomizer && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Customize Dashboard Widgets"
          onClick={() => setShowWidgetCustomizer(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--accent-primary)" aria-hidden="true" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Customize Today View
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowWidgetCustomizer(false)}
                className="btn-icon"
                aria-label="Close"
                icon={<X size={16} aria-hidden="true" />}
              />
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'focusTimer', label: 'Focus Sprint Timer', desc: 'Interactive 25m / 45m / Break timer ring' },
                { key: 'todayTasks', label: 'Today Action Queue', desc: 'Prioritized tasks and overdue rescue' },
                { key: 'habits', label: 'Daily Habits', desc: 'Rituals scheduled for today with streak badges' },
                { key: 'goals', label: 'Active Goals', desc: 'Milestone progress cards' },
                { key: 'academics', label: 'Academics & Timetable', desc: 'Today’s classes and attendance radar' },
                { key: 'finance', label: 'Monthly Spend', desc: 'Current month expenditure metric' },
                { key: 'fitness', label: 'Fitness Summary', desc: 'Workout log summary' },
              ].map((item) => {
                const isChecked = (widgets as Record<string, boolean>)[item.key] !== false;
                return (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        updateSettings({
                          dashboardWidgets: {
                            ...widgets,
                            [item.key]: e.target.checked,
                          },
                        });
                      }}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateSettings({
                    dashboardWidgets: {
                      focusTimer: true,
                      todayTasks: true,
                      habits: true,
                      goals: true,
                      academics: true,
                      finance: true,
                      fitness: true,
                    },
                  });
                }}
              >
                Reset to defaults
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowWidgetCustomizer(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {taskModalState && (
        <TaskModal
          task={taskModalState.task}
          initialValues={taskModalState.initialValues}
          onClose={() => setTaskModalState(null)}
        />
      )}

      {goalModalState.open && (
        <GoalModal
          isOpen={goalModalState.open}
          goal={goalModalState.goal}
          onClose={() => setGoalModalState({ open: false })}
        />
      )}

      {showHabitModal && (
        <HabitModal onClose={() => setShowHabitModal(false)} />
      )}

      {showClassModal && (
        <ClassModal
          isOpen={showClassModal}
          defaultDay={currentDayOfWeek}
          onClose={() => setShowClassModal(false)}
        />
      )}
    </div>
  );
}
