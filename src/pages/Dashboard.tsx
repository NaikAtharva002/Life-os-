import React, { useMemo, useState, useEffect } from 'react';
import {
  Target,
  CheckSquare,
  Repeat,
  AlertTriangle,
  Calendar,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Check,
  Flame,
  Dumbbell,
  DollarSign,
  Sun,
  Moon,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Task, Priority, Goal, Habit } from '../types';
import { getPhoto } from '../utils/photoAssets';
import { Checkbox } from '../components/ui';

export default function Dashboard() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const settings = useStore((s) => s.settings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);

  const todayStr = new Date().toISOString().split('T')[0];

  // Greeting & Time of Day
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Daily Editorial Motivational Quotes
  const quotes = [
    { text: "Discipline is the bridge between goals and accomplishment. Anchor your morning in deep, uninterrupted focus.", author: "Jim Rohn" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
    { text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", author: "John C. Maxwell" },
    { text: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport" }
  ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  // Focus Timer State (Photographic Timer Widget)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSessionType, setTimerSessionType] = useState<'deep' | 'short'>('deep');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const resetTimer = (durationMinutes = 25) => {
    setIsTimerRunning(false);
    setTimerSeconds(durationMinutes * 60);
  };

  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  // 1. Strictly scheduled today
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && t.dueDate === todayStr)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, todayStr]);

  // 2. Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr)))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, todayStr]);

  // 3. Completed today
  const completedTodayCount = useMemo(() => {
    return tasks.filter((t) => t.isCompleted && t.completedAt?.startsWith(todayStr)).length;
  }, [tasks, todayStr]);

  // Habits today
  const habitsToday = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return habits.filter((h) => h.targetDays.includes(dayOfWeek));
  }, [habits]);

  const habitsCompletedTodayCount = useMemo(() => {
    return habitsToday.filter((h) =>
      habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed)
    ).length;
  }, [habitsToday, habitEntries, todayStr]);

  // Daily Progress percentage
  const dailyProgress = useMemo(() => {
    const totalItems = todayTasks.length + completedTodayCount + habitsToday.length;
    if (totalItems === 0) return 100;
    const completedItems = completedTodayCount + habitsCompletedTodayCount;
    return Math.round((completedItems / totalItems) * 100);
  }, [todayTasks, completedTodayCount, habitsToday, habitsCompletedTodayCount]);

  // Priority Goals (Active top 3)
  const priorityGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived)
      .sort((a, b) => (a.priority === 'critical' ? -1 : 1))
      .slice(0, 3);
  }, [goals]);

  // Goal photo mapping helper
  const getGoalPhoto = (category: string, idx: number) => {
    const cat = category.toLowerCase();
    if (cat.includes('career') || cat.includes('tech') || cat.includes('code')) return getPhoto('goal-tech').path;
    if (cat.includes('finance') || cat.includes('wealth')) return getPhoto('goal-finance').path;
    if (cat.includes('fitness') || cat.includes('health')) return getPhoto('goal-fitness').path;
    if (cat.includes('academic') || cat.includes('learn')) return getPhoto('goal-academics').path;
    const fallbacks = [getPhoto('goal-tech').path, getPhoto('goal-finance').path, getPhoto('goal-fitness').path];
    return fallbacks[idx % fallbacks.length];
  };

  // Habit photo mapping helper
  const getHabitPhoto = (name: string, idx: number) => {
    const n = name.toLowerCase();
    if (n.includes('read') || n.includes('book')) return getPhoto('habit-reading').path;
    if (n.includes('sleep') || n.includes('rest')) return getPhoto('habit-sleep').path;
    if (n.includes('water') || n.includes('hydrat')) return getPhoto('habit-hydration').path;
    if (n.includes('work') || n.includes('code') || n.includes('study')) return getPhoto('habit-deepwork').path;
    if (n.includes('gym') || n.includes('workout') || n.includes('run')) return getPhoto('gym-weights').path;
    const fallbacks = [getPhoto('habit-reading').path, getPhoto('habit-deepwork').path, getPhoto('habit-sleep').path, getPhoto('habit-hydration').path];
    return fallbacks[idx % fallbacks.length];
  };

  // Academic attendance safety
  const attendanceAvg = useMemo(() => {
    if (academicSubjects.length === 0) return 85.0;
    const totalClasses = academicSubjects.reduce((acc, s) => acc + s.totalClasses, 0);
    const attended = academicSubjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    return totalClasses > 0 ? (attended / totalClasses) * 100 : 85.0;
  }, [academicSubjects]);

  const academicAlertSubject = useMemo(() => {
    return academicSubjects.find(
      (s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
    );
  }, [academicSubjects]);

  // Cashflow velocity calculation
  const monthlyExpenses = useMemo(() => {
    return financeTransactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(todayStr.slice(0, 7)))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [financeTransactions, todayStr]);

  const handleToggleTask = (task: Task) => {
    if (task.isCompleted) {
      updateTask(task.id, { isCompleted: false, completedAt: undefined });
    } else {
      completeTask(task.id);
    }
  };

  const handleRescheduleOverdue = (taskId: string) => {
    rescheduleTask(taskId, todayStr);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* =========================================================================
          1. LARGE EDITORIAL PHOTOGRAPHIC HERO SECTION (LIFE OS 3.0)
      ========================================================================= */}
      <section
        className="editorial-hero"
        style={{
          backgroundImage: `url(${getPhoto('dashboard-hero').path})`,
        }}
      >
        <div className="editorial-hero-scrim" />

        <div className="editorial-hero-content">
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--palette-brick)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'rgba(20, 19, 1, 0.85)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid var(--palette-brick-border)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {todayFormatted}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }} />
              <span style={{ fontSize: '11px', color: 'var(--palette-silver)', fontWeight: 500 }}>
                Local-First Ecosystem
              </span>
            </div>

            <h1
              className="font-editorial"
              style={{
                fontSize: '38px',
                fontWeight: 500,
                color: 'var(--text-on-accent)',
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {greeting}, {settings.userName}
            </h1>

            <p
              className="font-editorial"
              style={{
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--text-on-accent)',
                lineHeight: 1.6,
                margin: '0 0 16px 0',
                opacity: 0.95,
                maxWidth: '560px',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            >
              "{dailyQuote.text}"
              <span style={{ display: 'block', fontSize: '12px', fontStyle: 'normal', color: 'var(--palette-silver)', marginTop: '4px' }}>
                — {dailyQuote.author}
              </span>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(20, 19, 1, 0.85)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <CheckSquare size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                  <strong className="tabular">{todayTasks.length}</strong> focus action{todayTasks.length !== 1 ? 's' : ''} today
                </span>
              </div>

              {overdueTasks.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(184, 12, 9, 0.18)',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(184, 12, 9, 0.4)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <AlertTriangle size={14} color="var(--status-danger)" />
                  <span style={{ fontSize: '12.5px', color: 'var(--status-danger)' }}>
                    <strong className="tabular">{overdueTasks.length}</strong> overdue pending
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Daily Progress Gauge on Hero */}
          <div
            style={{
              background: 'rgba(20, 19, 1, 0.85)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--shadow-md)',
              minWidth: '220px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Daily Cadence
              </span>
              <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>
                {dailyProgress}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span className="tabular font-editorial" style={{ fontSize: '36px', fontWeight: 600, color: 'var(--text-on-accent)' }}>
                {dailyProgress}%
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>completed</span>
            </div>

            <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${dailyProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--palette-brick), var(--palette-walnut))',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{completedTodayCount}/{todayTasks.length + completedTodayCount}</strong></span>
              <span>Habits: <strong style={{ color: 'var(--text-primary)' }}>{habitsCompletedTodayCount}/{habitsToday.length}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. ASYMMETRIC DUAL ROW: PHOTOGRAPHIC FOCUS TIMER & TODAY'S TRIAGE
      ========================================================================= */}
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1.75fr)', gap: '28px' }}>
        
        {/* Left: Large Photographic Focus Timer */}
        <div
          className="photo-focus-card"
          style={{
            backgroundImage: `url(${getPhoto('dashboard-focus-timer').path})`,
          }}
        >
          <div className="photo-focus-scrim" />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                Deep Focus Sanctuary
              </span>
              <button
                onClick={() => setActiveView('focus')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Enter Fullscreen <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: '20px 0' }}>
            <div
              className={`tabular font-editorial ${isTimerRunning ? 'timer-running-pulse' : ''}`}
              style={{
                fontSize: '56px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-on-accent)',
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
                lineHeight: 1,
                transition: 'all 0.2s ease',
              }}
            >
              {formatTimer(timerSeconds)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--palette-silver)', marginTop: '6px' }}>
              {isTimerRunning ? 'Pines & Alpine Stream · Focus block active' : 'Ready to start deep work cadence'}
            </div>
          </div>

          {/* Timer Controls */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={() => {
                const nextRunning = !isTimerRunning;
                setIsTimerRunning(nextRunning);
                useStore.getState().addToast({
                  type: 'info',
                  title: nextRunning ? 'Focus Session Started' : 'Focus Session Paused',
                  message: nextRunning ? '25 minutes deep work in progress.' : 'Timer paused. Take a breath.',
                });
              }}
              className="btn btn-primary"
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: isTimerRunning ? '0 4px 16px rgba(184, 12, 9, 0.45)' : 'var(--shadow-sm)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              {isTimerRunning ? 'Pause Session' : 'Start Focus (25m)'}
            </button>

            <button
              onClick={() => {
                resetTimer(25);
                useStore.getState().addToast({
                  type: 'info',
                  title: 'Timer Reset',
                  message: 'Focus session reset to 25:00.',
                });
              }}
              className="btn btn-secondary icon-btn-spin"
              style={{
                padding: '8px 12px',
                borderRadius: '30px',
                backdropFilter: 'blur(8px)',
              }}
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Right: Today's Focus Tasks & Overdue Resolution */}
        <div className="editorial-island">
          <div className="editorial-island-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Question 1 · Daily Execution
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                What should I do today?
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Rule of 3: Top focus actions for maximum leverage
              </span>
            </div>
            <button
              onClick={() => setActiveView('tasks')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-primary)' }}
            >
              All Tasks ({todayTasks.length}) <ArrowRight size={13} />
            </button>
          </div>

          {/* Overdue Alert Strip (Answers: What am I falling behind on?) */}
          {overdueTasks.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--palette-brick-subtle)',
                border: '1px solid var(--palette-brick-border)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={16} color="var(--palette-brick)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                    Falling behind: {overdueTasks[0].title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Overdue from {overdueTasks[0].dueDate} · Requires resolution
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRescheduleOverdue(overdueTasks[0].id)}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
              >
                Do Today
              </button>
            </div>
          )}

          {/* Today Tasks List (Top 3) */}
          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              ✓ All tasks for today are complete. Enjoy your evening or explore long-term goals.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todayTasks.slice(0, 3).map((t, idx) => (
                <div
                  key={t.id}
                  className={`editorial-triage-row ${t.isCompleted ? 'completed' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 15px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: t.isCompleted ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-subtle)',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </div>
                    <Checkbox
                      size="sm"
                      checked={t.isCompleted}
                      onChange={() => handleToggleTask(t)}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: t.isCompleted ? 'line-through' : 'none',
                          transition: 'all 0.18s ease-out',
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{t.category || 'General'}</span>
                        {t.dueTime && <span>· 🕒 {t.dueTime}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: t.priority === 'critical' ? 'var(--priority-critical-bg)' : t.priority === 'high' ? 'var(--priority-high-bg)' : 'var(--bg-subtle)',
                      color: t.priority === 'critical' ? 'var(--priority-critical)' : t.priority === 'high' ? 'var(--priority-high)' : 'var(--text-secondary)',
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* =========================================================================
          3. PHOTOGRAPHIC PRIORITY GOAL THUMBNAILS (LIFE OS 3.0)
      ========================================================================= */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                Question 2 · Long-Term Vision
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              What is most important?
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Strategic Horizons: Goal architecture & milestone progress
            </span>
          </div>
          <button
            onClick={() => setActiveView('goals')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            Manage Goals <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {priorityGoals.map((g, idx) => {
            const photoUrl = getGoalPhoto(g.category, idx);
            return (
              <div
                key={g.id}
                className="photo-tile"
                onClick={() => setActiveView('goals')}
              >
                <div className="photo-tile-image-wrap">
                  <img
                    src={photoUrl}
                    alt={g.title}
                    className="photo-tile-img"
                    loading="lazy"
                  />
                  <div className="photo-tile-scrim" />
                  <span
                    className="badge"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(20, 19, 1, 0.85)',
                      color: g.priority === 'critical' ? 'var(--status-danger)' : 'var(--accent-light)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    {g.priority}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '14px',
                      fontSize: '11px',
                      color: 'var(--accent-light)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {g.category}
                  </span>
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {g.title}
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, maxHeight: '36px', overflow: 'hidden' }}>
                    {g.description || 'Dedicated strategic progression.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                    <span className="tabular" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {g.progress}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${g.progress}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. IMAGE-BASED HABIT TRACKER (LIFE OS 3.0)
      ========================================================================= */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Habit Rhythm & Daily Consistency
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Photographic habit tiles with active streak tracking
            </span>
          </div>
          <button
            onClick={() => setActiveView('habits')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            Habit Grid <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {habitsToday.map((h, idx) => {
            const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed);
            const photoUrl = getHabitPhoto(h.name, idx);

            return (
              <div
                key={h.id}
                className="photo-tile"
                style={{
                  borderColor: isDone ? 'var(--palette-brick-border)' : 'var(--border-default)',
                }}
              >
                <div className="photo-tile-image-wrap" style={{ height: '110px' }}>
                  <img
                    src={photoUrl}
                    alt={h.name}
                    className="photo-tile-img"
                    loading="lazy"
                  />
                  <div className="photo-tile-scrim" />
                  
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--status-warning)',
                      background: 'rgba(20, 19, 1, 0.82)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Flame size={12} color="var(--palette-brick)" fill="var(--palette-brick)" />
                    <span className="tabular">{h.streak || 5}d</span> streak
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {h.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {h.category || 'Daily Habit'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleHabitEntry(h.id, todayStr)}
                    className="btn-habit-check"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isDone ? 'none' : '1.5px solid var(--border-default)',
                      background: isDone ? 'var(--palette-brick)' : 'var(--bg-elevated)',
                      color: isDone ? 'var(--text-on-accent)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isDone ? '0 2px 8px rgba(184, 12, 9, 0.35)' : 'none',
                      transform: isDone ? 'scale(1.05)' : 'scale(1)',
                    }}
                    title={isDone ? 'Completed today' : 'Mark completed'}
                    aria-label={`Mark ${h.name} as ${isDone ? 'incomplete' : 'complete'}`}
                  >
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      style={{
                        animation: isDone ? 'checkboxPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                      }}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. OPERATIONAL REMINDERS & CROSS-MODULE RADAR (Non-Card Horizontal Strip)
      ========================================================================= */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        
        {/* Academic Safety Reminders */}
        <div
          className="editorial-island"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveView('academics')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Academic Safety
            </span>
            <GraduationCap size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="tabular" style={{ fontSize: '24px', fontWeight: 700, color: attendanceAvg >= 75 ? 'var(--text-primary)' : 'var(--status-danger)' }}>
              {attendanceAvg.toFixed(1)}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>attendance margin</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            {academicAlertSubject
              ? `⚠️ ${academicAlertSubject.name} attendance alert (<${academicAlertSubject.targetAttendancePercentage}%)`
              : '✓ All enrolled subjects safely above threshold'}
          </p>
        </div>

        {/* Financial Velocity */}
        <div
          className="editorial-island"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveView('finance')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Monthly Cash Velocity
            </span>
            <TrendingUp size={16} color="var(--status-warning)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="tabular" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '1,840.00'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>spent this month</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Runway healthy · 4.8 months liquid reserve buffer
          </p>
        </div>

        {/* Evening Shutdown & Review (Question 5) */}
        <div
          className="editorial-island"
          style={{ cursor: 'pointer', border: '1px solid var(--palette-brick-border)', background: 'var(--palette-brick-subtle)' }}
          onClick={() => setActiveView('review')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--palette-brick)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question 5 · Daily Reflection
            </span>
            <Moon size={16} color="var(--palette-brick)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              What should I improve tomorrow?
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Complete evening shutdown, log gratitude & lock in tomorrow's Rule of 3 →
          </p>
        </div>

      </section>

    </div>
  );
}
