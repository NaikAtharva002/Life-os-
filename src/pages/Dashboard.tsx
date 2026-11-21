import React, { useMemo } from 'react';
import {
  Target,
  CheckSquare,
  Repeat,
  Moon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  GraduationCap,
  Dumbbell,
  DollarSign,
  Circle,
  Award,
  ArrowRight,
  Flame,
  Check,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Task, Priority } from '../types';

export default function Dashboard() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const settings = useStore((s) => s.settings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const toggleMilestone = useStore((s) => s.toggleMilestone);

  const todayStr = new Date().toISOString().split('T')[0];

  // Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Strict Data Distinction (Section 3 rule: Distinguish overdue tasks from tasks scheduled today)
  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  // 1. Strictly tasks scheduled for TODAY (not overdue past items)
  const todayScheduledTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && t.dueDate === todayStr)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, todayStr]);

  // 2. Overdue tasks (due date was strictly before today)
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr)))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, todayStr]);

  // 3. Upcoming tasks (due date is strictly after today)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 3);
  }, [tasks, todayStr]);

  // 4. Completed tasks today
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
    const totalItems = todayScheduledTasks.length + completedTodayCount + habitsToday.length;
    if (totalItems === 0) return 100;
    const completedItems = completedTodayCount + habitsCompletedTodayCount;
    return Math.round((completedItems / totalItems) * 100);
  }, [todayScheduledTasks, completedTodayCount, habitsToday, habitsCompletedTodayCount]);

  // Priority Goals (Critical & High)
  const priorityGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived && (g.priority === 'critical' || g.priority === 'high'))
      .sort((a, b) => (a.priority === 'critical' ? -1 : 1))
      .slice(0, 3);
  }, [goals]);

  // Academic alert (<75% target)
  const academicAlertSubject = useMemo(() => {
    return academicSubjects.find(
      (s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
    );
  }, [academicSubjects]);

  // Latest evening review status
  const latestReview = useMemo(() => {
    return eveningReviews.find((r) => r.date === todayStr) || null;
  }, [eveningReviews, todayStr]);

  // Last 7 days dates for habit mini-dots
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  }, []);

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
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* =========================================================================
          1. EXECUTIVE COMMAND HEADER & DAILY PULSE
      ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {todayFormatted}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-default)' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--status-success)', fontWeight: 500 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)' }} />
              Local-First Ready
            </span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            {greeting}, {settings.userName}
          </h1>
          <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
            {todayScheduledTasks.length} focus action{todayScheduledTasks.length !== 1 ? 's' : ''} scheduled today
            {overdueTasks.length > 0 ? ` · ${overdueTasks.length} overdue requires attention` : ''}
            {habitsToday.length > 0 ? ` · ${habitsCompletedTodayCount}/${habitsToday.length} habits completed` : ''}
          </p>
        </div>

        {/* Executive Pulse Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            boxShadow: 'var(--panel-shadow)',
            padding: '8px 14px',
            flexWrap: 'wrap',
          }}
        >
          {/* Daily Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Daily Focus
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
                {dailyProgress}%
              </span>
            </div>
            <div style={{ width: '48px', height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${dailyProgress}%`,
                  height: '100%',
                  background: dailyProgress === 100 ? 'var(--status-success)' : 'var(--accent-primary)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />

          {/* Quick Counter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span
              onClick={() => setActiveView('tasks')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Scheduled Tasks"
            >
              <CheckSquare size={13} color="var(--accent-primary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular">
                {todayScheduledTasks.length}
              </span>
            </span>

            {overdueTasks.length > 0 && (
              <span
                onClick={() => setActiveView('tasks')}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--status-danger-bg)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-small)',
                  color: 'var(--status-danger)',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
                title="Overdue Tasks"
              >
                <AlertTriangle size={11} />
                <span className="tabular">{overdueTasks.length} overdue</span>
              </span>
            )}

            <span
              onClick={() => setActiveView('habits')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Habits Today"
            >
              <Repeat size={13} color="var(--status-success)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular">
                {habitsCompletedTodayCount}/{habitsToday.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TWO-COLUMN HIGH-EFFICIENCY WORKSPACE
      ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'flex-start',
        }}
      >
        
        {/* =========================================================================
            LEFT COLUMN: DAILY EXECUTION
            1. Overdue Callout (if any)
            2. Today's Priority Tasks (Linear Issue Layout)
            3. Upcoming Horizon
            4. Daily Habits Matrix
            5. End-of-Day Review Card
        ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Overdue Attention Callout */}
          {overdueTasks.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-medium)',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: 'var(--panel-shadow)',
                fontSize: '12.5px',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--status-danger-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={13} color="var(--status-danger)" />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {overdueTasks[0]?.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--status-danger)' }}>
                    Overdue since {overdueTasks[0]?.dueDate} · Requires immediate action
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => handleRescheduleOverdue(overdueTasks[0]?.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  title="Reschedule to today"
                >
                  Do Today
                </button>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                >
                  View All ({overdueTasks.length}) →
                </button>
              </div>
            </div>
          )}

          {/* 1. Today's Priority Tasks (Linear Issue Layout) */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--panel-shadow)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={15} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Today's Tasks
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                  className="tabular"
                >
                  {todayScheduledTasks.length}
                </span>
              </div>

              <button
                onClick={() => setActiveView('tasks')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}
              >
                View all tasks →
              </button>
            </div>

            {todayScheduledTasks.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  borderRadius: 'var(--radius-small)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border-default)',
                }}
              >
                {overdueTasks.length > 0
                  ? 'All scheduled tasks for today completed! Focus on clearing overdue items above.'
                  : 'All clear for today. Add a new task from the top toolbar or relax.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {todayScheduledTasks.map((t) => {
                  const completedSubs = t.subtasks?.filter((s) => s.isCompleted).length || 0;
                  const totalSubs = t.subtasks?.length || 0;

                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-small)',
                        gap: '10px',
                        transition: 'border-color 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                    >
                      {/* Checkbox + Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <button
                          onClick={() => handleToggleTask(t)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '1.5px solid var(--border-focus)',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.1s ease',
                          }}
                          title="Mark complete"
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'transparent' }} />
                        </button>

                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {t.title}
                          </span>
                        </div>
                      </div>

                      {/* Chips & Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {t.category && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--text-muted)',
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-default)',
                              padding: '1px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {t.category}
                          </span>
                        )}

                        {t.dueTime && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            className="tabular"
                          >
                            <Clock size={11} color="var(--text-muted)" /> {t.dueTime}
                          </span>
                        )}

                        {totalSubs > 0 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            className="tabular"
                          >
                            <Check size={10} /> {completedSubs}/{totalSubs}
                          </span>
                        )}

                        {/* Priority Pip */}
                        <span
                          style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background:
                              t.priority === 'critical'
                                ? 'var(--priority-critical-bg)'
                                : t.priority === 'high'
                                ? 'var(--priority-high-bg)'
                                : 'var(--bg-elevated)',
                            color:
                              t.priority === 'critical'
                                ? 'var(--priority-critical)'
                                : t.priority === 'high'
                                ? 'var(--priority-high)'
                                : 'var(--text-secondary)',
                            border: `1px solid ${
                              t.priority === 'critical'
                                ? 'rgba(239,68,68,0.2)'
                                : t.priority === 'high'
                                ? 'rgba(249,115,22,0.2)'
                                : 'var(--border-default)'
                            }`,
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background:
                                t.priority === 'critical'
                                  ? 'var(--priority-critical)'
                                  : t.priority === 'high'
                                  ? 'var(--priority-high)'
                                  : 'var(--priority-medium)',
                            }}
                          />
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Upcoming Horizon (Next 3 Days) */}
          {upcomingTasks.length > 0 && (
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-medium)',
                boxShadow: 'var(--panel-shadow)',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="section-eyebrow" style={{ margin: 0 }}>
                  Upcoming This Week
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                  {upcomingTasks.length} ahead
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-small)',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                      {t.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Daily Habits Matrix (Rituals Tracker) */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--panel-shadow)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={15} color="var(--status-success)" />
                <h2 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Daily Habits
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                  className="tabular"
                >
                  {habitsCompletedTodayCount}/{habitsToday.length}
                </span>
              </div>

              <button
                onClick={() => setActiveView('habits')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}
              >
                Manage habits →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
              {habitsToday.map((h) => {
                const entries = h.entries || habitEntries.filter((e) => e.habitId === h.id);
                const isCompleted = entries.some((e) => e.date === todayStr && e.completed);

                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabitEntry(h.id, todayStr)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-small)',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          background: isCompleted ? 'var(--status-success)' : 'transparent',
                          border: isCompleted ? 'none' : '1.5px solid var(--border-focus)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.1s ease',
                        }}
                      >
                        {isCompleted && <Check size={12} color="#ffffff" strokeWidth={2.5} />}
                      </div>

                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 500,
                            color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            display: 'block',
                          }}
                        >
                          {h.name}
                        </span>
                      </div>
                    </div>

                    {/* Streak & Mini-Dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: (h.streak || 0) > 0 ? 'var(--status-warning)' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                        className="tabular"
                      >
                        <Flame size={11} /> {h.streak}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. End-of-Day Review Card */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--panel-shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Moon size={15} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  End-of-Day Evening Review
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {latestReview
                    ? `Completed for today (Rated ${latestReview.rating}/5 stars)`
                    : 'Pending shutdown · Reflect, log insights, and set tomorrow’s top 3'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('review')}
              className={latestReview ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
              style={{ fontSize: '11.5px' }}
            >
              {latestReview ? 'View Review' : 'Start Review'}
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: STRATEGIC COMPASS & CONTEXT
            1. Priority Goals (Milestones Progress)
            2. Important Reminders (Attendance, Fitness, Finance)
        ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. Priority Goals with Interactive Milestones */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--panel-shadow)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={15} color="var(--priority-critical)" />
                <h2 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Priority Goals
                </h2>
              </div>
              <button
                onClick={() => setActiveView('goals')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}
              >
                All goals →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {priorityGoals.map((g) => {
                const nextMilestone = g.milestones.find((m) => !m.isCompleted);

                return (
                  <div
                    key={g.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-small)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'border-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                  >
                    {/* Header: Title + Priority Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {g.title}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {g.category}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '3px',
                          background: g.priority === 'critical' ? 'var(--priority-critical-bg)' : 'var(--priority-high-bg)',
                          color: g.priority === 'critical' ? 'var(--priority-critical)' : 'var(--priority-high)',
                          border: `1px solid ${g.priority === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)'}`,
                          flexShrink: 0,
                        }}
                      >
                        {g.priority}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        <span className="tabular" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {g.progress}% complete
                        </span>
                        <span className="tabular">{g.targetDate || 'Ongoing'}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${g.progress}%`,
                            background: g.priority === 'critical' ? 'var(--priority-critical)' : 'var(--accent-primary)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Interactive Next Milestone */}
                    {nextMilestone && (
                      <div
                        onClick={() => toggleMilestone(g.id, nextMilestone.id)}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px',
                          padding: '4px 6px',
                          background: 'var(--bg-elevated)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        title="Click to check milestone"
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            border: '1px solid var(--border-focus)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {nextMilestone.isCompleted && <Check size={8} />}
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>Next:</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {nextMilestone.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Operational Reminders & Context */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-medium)',
              boxShadow: 'var(--panel-shadow)',
              padding: '14px 16px',
            }}
          >
            <div className="section-eyebrow" style={{ marginBottom: '10px' }}>
              Operational Context & Reminders
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Academic Attendance Reminder */}
              {academicAlertSubject ? (
                <div
                  onClick={() => setActiveView('academics')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--status-warning-bg)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={15} color="var(--status-warning)" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--status-warning)' }}>
                        {academicAlertSubject.code} Attendance Warning
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Attendance below {academicAlertSubject.targetAttendancePercentage}% target · Attend next 2 classes
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--status-warning)" />
                </div>
              ) : (
                <div
                  onClick={() => setActiveView('academics')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      Academics: {academicAssignments.filter((a) => !a.isSubmitted).length} assignments pending submission
                    </span>
                  </div>
                  <ChevronRight size={13} color="var(--text-muted)" />
                </div>
              )}

              {/* Fitness Reminder */}
              <div
                onClick={() => setActiveView('fitness')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dumbbell size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    Fitness: {workoutSessions[0]?.splitType || 'Schedule Workout'}
                  </span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" />
              </div>

              {/* Finance Reminder */}
              <div
                onClick={() => setActiveView('finance')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    Finance: {financeTransactions.length} recorded transactions
                  </span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BOTTOM: VELOCITY & ACCOUNTABILITY CADENCE
      ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '6px',
        }}
      >
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            boxShadow: 'var(--panel-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Zap size={13} color="var(--accent-primary)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Execution Velocity
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {completedTodayCount} / {todayScheduledTasks.length + completedTodayCount} tasks
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Completed today vs planned focus
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            boxShadow: 'var(--panel-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Repeat size={13} color="var(--status-success)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Habit Consistency
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {habitsToday.length > 0 ? Math.round((habitsCompletedTodayCount / habitsToday.length) * 100) : 100}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Daily execution rate across routines
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            boxShadow: 'var(--panel-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Target size={13} color="var(--priority-critical)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Milestone Trajectory
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.isCompleted).length, 0)} completed
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Strategic checkpoints reached
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-small)',
            boxShadow: 'var(--panel-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={13} color="var(--status-info)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Accountability Log
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {eveningReviews.length} reflections
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Stored locally in IndexedDB vault
          </div>
        </div>
      </div>
    </div>
  );
}
