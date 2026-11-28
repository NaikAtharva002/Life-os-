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
  Sparkles,
  Search,
  Heart,
} from 'lucide-react';
import useStore from '../store/useStore';
import { todayLocal, formatCurrencyINR } from '../lib/dates';
import type { Task, Priority } from '../types';
import { Checkbox, EmptyState } from '../components/ui';
import QuickTaskBar from '../components/QuickTaskBar';
import TaskModal from '../components/TaskModal';
import { LiquidGlassSurface } from '../components/LiquidGlassSurface';
import { buildDashboardViewModel } from '../lib/dashboardSelectors';

export default function Dashboard() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const academicExams = useStore((s) => s.academicExams);
  const timetableSlots = useStore((s) => s.timetableSlots);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const lifestyleItems = useStore((s) => s.lifestyleItems);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const startTaskFocusSession = useStore((s) => s.startTaskFocusSession);
  const addToast = useStore((s) => s.addToast);

  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const [ritPrompt, setRitPrompt] = useState('');
  const [taskModalInit, setTaskModalInit] = useState<{
    title?: string;
    priority?: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  } | null>(null);

  const todayStr = todayLocal(settings.dayStartHour);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Focus Timer State
  const [timerDurationMins, setTimerDurationMins] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      addToast({
        type: 'success',
        title: 'Focus Block Complete',
        message: `${timerDurationMins}m deep work session finished.`,
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, timerDurationMins, addToast]);

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

  const {
    todayTasks,
    overdueTasks,
    completedTodayCount,
    habitsToday,
    habitsCompletedTodayCount,
    dailyProgress,
    priorityGoals,
    attendanceAvg,
    todayClasses,
    academicAlertSubject,
    monthlyExpenses,
    workoutSessions: visibleWorkouts,
    hasReviewedToday,
    upcomingEvents,
    lifestyleItems: visibleLifestyleItems,
    isBrandNewUser,
  } = useMemo(
    () =>
      buildDashboardViewModel({
        isDemoMode: Boolean(settings.isDemoMode),
        todayStr,
        tasks,
        goals,
        habits,
        habitEntries,
        financeTransactions,
        academicSubjects,
        academicAssignments,
        academicExams,
        timetableSlots,
        workoutSessions,
        eveningReviews,
        lifestyleItems,
      }),
    [
      settings.isDemoMode,
      todayStr,
      tasks,
      goals,
      habits,
      habitEntries,
      financeTransactions,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      workoutSessions,
      eveningReviews,
      lifestyleItems,
    ]
  );

  const launchRitPrompt = (promptText: string) => {
    const clean = promptText.trim() || 'Plan my day and bring my life into rhythm.';
    try {
      sessionStorage.setItem('lifeos_rit_pending_prompt', clean);
    } catch {
      // Ignore storage error.
    }
    setActiveView('assistant');
  };

  const openLiquidGlassSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
    );
  };

  const widgets = {
    focusTimer: true,
    todayTasks: true,
    goals: true,
    habits: true,
    academics: true,
    finance: true,
    fitness: true,
    ...settings.dashboardWidgets,
  };
  const hasLeftColumn = widgets.todayTasks !== false || widgets.habits !== false;

  const handleToggleTask = (task: Task) => {
    if (task.isCompleted) {
      updateTask(task.id, { isCompleted: false, completedAt: undefined });
    } else {
      completeTask(task.id);
    }
  };

  const currencyDisplay =
    !settings.currencySymbol || settings.currencySymbol === '₹'
      ? formatCurrencyINR(monthlyExpenses)
      : `${settings.currencySymbol}${monthlyExpenses.toLocaleString()}`;

  // Circle stroke calculation for clean vector Focus Ring
  const ringRadius = 56;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset =
    ringCircumference - (timerProgressPct / 100) * ringCircumference;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. CLEAN TODAY COMMAND HEADER */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-brick font-tabular">{todayFormatted}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} scheduled
              {habitsToday.length > 0 ? ` · ${habitsToday.length - habitsCompletedTodayCount} habits open` : ''}
            </span>
          </div>
          <h1
            className="text-display"
            style={{ color: 'var(--text-primary)', margin: 0 }}
          >
            {settings.userName?.trim() ? `${greeting}, ${settings.userName.trim()}` : `${greeting}`}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ width: '72px' }} className="progress-track">
              <div className="progress-fill" style={{ width: `${dailyProgress}%` }} />
            </div>
            <span className="font-tabular" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {dailyProgress}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowWidgetCustomizer(true)}
            className="btn btn-secondary btn-sm"
            aria-label="Customize dashboard widgets"
          >
            <Sliders size={13} /> Customize
          </button>
        </div>
      </section>

      {/* 2. NATURAL LANGUAGE QUICK CAPTURE + RIT LIQUID GLASS BAR */}
      <QuickTaskBar
        compact
        onExpandDetails={(vals) => setTaskModalInit(vals || {})}
      />

      <LiquidGlassSurface style={{ borderRadius: '14px', padding: '14px 16px' }} frost={5}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px', minWidth: 0 }}>
            <Sparkles size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                launchRitPrompt(ritPrompt);
              }}
              style={{ display: 'flex', gap: '8px', flex: 1, minWidth: 0 }}
            >
              <input
                type="text"
                className="input"
                aria-label="Ask RIT from dashboard"
                placeholder="Ask RIT: Plan my day, audit deadlines, add a trip or goal..."
                value={ritPrompt}
                onChange={(e) => setRitPrompt(e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                Ask RIT
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => launchRitPrompt('What should I focus on right now?')}
            >
              Focus Brief
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={openLiquidGlassSearch}
            >
              <Search size={13} />
              Universal Search
            </button>
          </div>
        </div>
      </LiquidGlassSurface>

      {isBrandNewUser && (
        <section className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span className="section-eyebrow">New Workspace Quickstart</span>
            <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', margin: '2px 0 4px' }}>
              Set up your real Life OS in under a minute
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Every number below reflects your own data. Start with one priority task, a personal goal, a daily habit, or an experience you are planning.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setTaskModalInit({ dueDate: todayStr, priority: 'high' })}
            >
              <Plus size={14} /> Add First Task
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveView('goals')}>
              <Plus size={14} /> Set First Goal
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveView('habits')}>
              <Plus size={14} /> Start First Habit
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveView('lifestyle')}>
              <Heart size={14} /> Plan Lifestyle & Trips
            </button>
          </div>
        </section>
      )}

      {/* 3. FOUR-TILE KPI BENTO STRIP */}
      <section className="today-kpi-grid">
        <button
          type="button"
          onClick={() => setActiveView('tasks')}
          className="editorial-stat-card card-interactive"
          style={{ textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-label" style={{ color: 'var(--text-muted)' }}>Today Tasks</span>
            <CheckSquare size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="font-tabular" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {todayTasks.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              open · {completedTodayCount} done
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
            <span className="text-label" style={{ color: 'var(--text-muted)' }}>Habits Today</span>
            <Repeat size={15} color="var(--status-success)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="font-tabular" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {habitsCompletedTodayCount}/{habitsToday.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              completed
            </span>
          </div>
        </button>

        {widgets.academics !== false && (
          <button
            type="button"
            onClick={() => setActiveView('academics')}
            className="editorial-stat-card card-interactive"
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-label" style={{ color: 'var(--text-muted)' }}>Academics</span>
              <GraduationCap
                size={15}
                color={academicAlertSubject ? 'var(--status-danger)' : 'var(--status-info)'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                className="font-tabular"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color:
                    attendanceAvg !== null && attendanceAvg < 75
                      ? 'var(--status-danger)'
                      : 'var(--text-primary)',
                }}
              >
                {todayClasses.length > 0
                  ? `${todayClasses.length}`
                  : attendanceAvg !== null
                  ? `${attendanceAvg.toFixed(0)}%`
                  : '—'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {todayClasses.length > 0
                  ? `class${todayClasses.length !== 1 ? 'es' : ''} today`
                  : attendanceAvg !== null
                  ? 'attendance'
                  : 'no courses yet'}
              </span>
            </div>
          </button>
        )}

        {widgets.finance !== false && (
          <button
            type="button"
            onClick={() => setActiveView('finance')}
            className="editorial-stat-card card-interactive"
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-label" style={{ color: 'var(--text-muted)' }}>Month Spend</span>
              <Wallet size={15} color="var(--accent-secondary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="font-tabular" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currencyDisplay}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                logged
              </span>
            </div>
          </button>
        )}
      </section>

      {/* 4. EXECUTION GRID: TASKS + HABITS (LEFT) | FOCUS + SCHEDULE + REVIEW (RIGHT) */}
      <section className={`today-execution-grid${!hasLeftColumn ? ' single-col' : ''}`}>
        {/* LEFT COLUMN */}
        {hasLeftColumn && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Today's Action Queue */}
          {widgets.todayTasks !== false && (
            <div className="editorial-island">
              <div className="editorial-island-header">
                <div>
                  <span className="section-eyebrow">Priority Queue</span>
                  <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    Today’s Execution
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('tasks')}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-light)' }}
                >
                  Open Tasks <ArrowRight size={13} />
                </button>
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
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', minWidth: 0 }}>
                    <AlertTriangle size={15} color="var(--status-danger)" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--status-danger)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {overdueTasks.length} overdue: {overdueTasks[0].title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Due {overdueTasks[0].dueDate}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => rescheduleTask(overdueTasks[0].id, todayStr)}
                    className="btn btn-sm btn-secondary"
                    style={{ flexShrink: 0 }}
                  >
                    Move to Today
                  </button>
                </div>
              )}

              {todayTasks.length === 0 ? (
                <EmptyState
                  illustration="tasks"
                  badge="Clear Slate"
                  title="Nothing overdue or queued for today."
                  description="Use the quick capture bar above or jump into Tasks to plan your next sprint."
                  action={
                    <button
                      type="button"
                      onClick={() => setTaskModalInit({ dueDate: todayStr })}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} /> Add Task for Today
                    </button>
                  }
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayTasks.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      className="editorial-triage-row"
                      style={{ opacity: t.isCompleted ? 0.55 : 1 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <Checkbox
                          size="sm"
                          checked={t.isCompleted}
                          onChange={() => handleToggleTask(t)}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: t.isCompleted ? 'line-through' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span>{t.category || 'General'}</span>
                            {t.dueTime && <span className="font-tabular">· {t.dueTime}</span>}
                            {t.estimatedDuration && (
                              <span className="font-tabular" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                · <Clock size={10} /> {t.estimatedDuration}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {!t.isCompleted && (
                          <button
                            type="button"
                            onClick={() => startTaskFocusSession(t.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent-light)', padding: '4px 8px' }}
                            title="Focus on this task"
                          >
                            <Play size={11} fill="currentColor" /> Focus
                          </button>
                        )}
                        <span
                          className={`badge ${
                            t.priority === 'critical'
                              ? 'badge-danger'
                              : t.priority === 'high'
                              ? 'badge-warning'
                              : 'badge-silver'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Habit Rhythm Checklist (Zero noisy stock images) */}
          {widgets.habits !== false && (
            <div className="editorial-island">
              <div className="editorial-island-header">
                <div>
                  <span className="section-eyebrow">Daily Rituals</span>
                  <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    Habits Today
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('habits')}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-light)' }}
                >
                  All Habits <ArrowRight size={13} />
                </button>
              </div>

              {habitsToday.length === 0 ? (
                <EmptyState
                  illustration="habits"
                  badge="Rituals"
                  title="No habits scheduled today."
                  description="Anchor consistent daily routines like deep study, workouts, or reading."
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveView('habits')}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} /> Add Habit
                    </button>
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
                    const isDone = habitEntries.some(
                      (e) => e.habitId === h.id && e.date === todayStr && e.completed
                    );

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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-secondary)', fontWeight: 600 }} className="font-tabular">
                              <Flame size={11} /> {h.streak || 0}d
                            </span>
                            <span>· {h.category || 'Daily'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleHabitEntry(h.id, todayStr)}
                          className="btn-habit-check"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: isDone ? 'none' : '1.5px solid var(--border-light)',
                            background: isDone ? 'var(--accent-primary)' : 'var(--bg-surface)',
                            color: isDone ? '#FFFFFF' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          aria-label={`Mark ${h.name} as ${isDone ? 'incomplete' : 'complete'}`}
                        >
                          <Check size={15} strokeWidth={2.5} />
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
          {/* Clean Vector Deep Focus Card */}
          {widgets.focusTimer !== false && (
            <div className={`focus-timer-card ${isTimerRunning ? 'active' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="section-eyebrow">Focus Sprint</span>
                <button
                  type="button"
                  onClick={() => setActiveView('focus')}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 6px', fontSize: '11.5px' }}
                >
                  Fullscreen <ArrowRight size={12} />
                </button>
              </div>

              {/* Duration selector */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
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

              {/* Vector SVG Timer Ring */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 18px' }}>
                <div style={{ position: 'relative', width: '136px', height: '136px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="136" height="136" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
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
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isTimerRunning ? 'In Focus' : 'Ready'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((r) => !r)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button
                  type="button"
                  onClick={() => selectTimerMode(timerDurationMins)}
                  className="btn btn-secondary btn-icon icon-btn-spin"
                  title="Reset Timer"
                  aria-label="Reset Timer"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Today's Class Schedule */}
          {widgets.academics !== false && (
            <div className="editorial-island">
              <div className="editorial-island-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={15} color="var(--status-info)" />
                  <h3 className="text-heading-sub" style={{ color: 'var(--text-primary)' }}>
                    Today’s Timetable
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('academics')}
                  className="btn btn-ghost btn-sm"
                >
                  Timetable <ArrowRight size={12} />
                </button>
              </div>

              {todayClasses.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                  {academicSubjects.length === 0
                    ? 'Add your semester courses and weekly timetable inside Academics.'
                    : 'No classes scheduled for today.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayClasses.map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {slot.subjectName || slot.courseCode || 'Class'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Room {slot.room || 'TBA'}
                        </div>
                      </div>
                      <span className="badge badge-silver font-tabular">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fitness & Evening Review Dual Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {widgets.fitness !== false && (
              <button
                type="button"
                onClick={() => setActiveView('fitness')}
                className="card card-interactive"
                style={{ textAlign: 'left', padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Dumbbell size={16} color="var(--status-success)" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Fitness Log
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        {visibleWorkouts.length > 0
                          ? `Latest: ${visibleWorkouts[visibleWorkouts.length - 1]?.title || 'Workout'}`
                          : 'No workout sessions logged yet'}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-silver font-tabular">{visibleWorkouts.length}</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Moon size={16} color={hasReviewedToday ? 'var(--status-success)' : 'var(--accent-light)'} />
                  <div>
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
                <ArrowRight size={14} color="var(--text-secondary)" />
              </div>
            </button>

            <div className="editorial-island">
              <div className="editorial-island-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={15} color="var(--accent-primary)" />
                  <h3 className="text-heading-sub" style={{ color: 'var(--text-primary)' }}>
                    Upcoming 7 Days & Lifestyle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('lifestyle')}
                  className="btn btn-ghost btn-sm"
                >
                  Lifestyle <ArrowRight size={12} />
                </button>
              </div>
              {upcomingEvents.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  No upcoming deadlines or lifestyle events in the next 7 days. {visibleLifestyleItems.length > 0 ? `${visibleLifestyleItems.length} lifestyle record(s) saved.` : 'Add trips, hobbies, or milestones anytime.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {upcomingEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setActiveView(ev.viewId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {ev.meta}
                        </div>
                      </div>
                      <span className="badge badge-silver font-tabular">{ev.date}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE STRATEGIC GOALS */}
      {widgets.goals !== false && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span className="section-eyebrow">Horizons</span>
              <h2 className="text-heading-section" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                Active Goals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('goals')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-light)' }}
            >
              Manage Goals <ArrowRight size={13} />
            </button>
          </div>

          {priorityGoals.length === 0 ? (
            <EmptyState
              illustration="goals"
              badge="Long-Term Clarity"
              title="Set your next milestone."
              description="Define measurable semester, fitness, or career goals and link your daily tasks."
              action={
                <button
                  type="button"
                  onClick={() => setActiveView('goals')}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Create Goal
                </button>
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {priorityGoals.map((g) => {
                const completedMilestones = g.milestones.filter((m) => m.isCompleted).length;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveView('goals')}
                    className="card card-interactive"
                    style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-silver">{g.category || 'Personal'}</span>
                      <span
                        className={`badge ${
                          g.priority === 'critical'
                            ? 'badge-danger'
                            : g.priority === 'high'
                            ? 'badge-warning'
                            : 'badge-brick'
                        }`}
                      >
                        {g.priority}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                        {g.title}
                      </h3>
                      {g.description && (
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {completedMilestones}/{g.milestones.length} milestones
                        </span>
                        <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--accent-light)' }}>
                          {g.progress}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* WIDGET CUSTOMIZER MODAL */}
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
                <Sliders size={16} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Customize Today View
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWidgetCustomizer(false)}
                className="btn btn-ghost btn-icon"
                aria-label="Close"
              >
                <X size={16} />
              </button>
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
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
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
                className="btn btn-ghost btn-sm"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={() => setShowWidgetCustomizer(false)}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {taskModalInit && (
        <TaskModal
          initialValues={taskModalInit}
          onClose={() => setTaskModalInit(null)}
        />
      )}
    </div>
  );
}
