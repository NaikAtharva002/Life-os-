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
      .slice(0, 4);
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

  const handleToggleTask = (task: Task) => {
    if (task.isCompleted) {
      updateTask(task.id, { isCompleted: false, completedAt: undefined });
    } else {
      completeTask(task.id);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* 1. TOP: COMPACT DAILY OVERVIEW (Section 3: Date, Greeting, Daily completion, Upcoming responsibilities) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>
            {todayFormatted}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {greeting}, {settings.userName}
          </h1>
        </div>

        {/* Compact summary metrics strip — No oversized cards */}
        <div className="summary-strip">
          <span className="metric-item">
            Scheduled today: <strong className="tabular">{todayScheduledTasks.length}</strong>
          </span>
          <span>·</span>
          <span className="metric-item">
            Overdue: <strong className="tabular" style={{ color: overdueTasks.length > 0 ? 'var(--status-danger)' : 'var(--text-primary)' }}>{overdueTasks.length}</strong>
          </span>
          <span>·</span>
          <span className="metric-item">
            Habits: <strong className="tabular">{habitsCompletedTodayCount}/{habitsToday.length}</strong>
          </span>
          <span>·</span>
          <span className="metric-item">
            Daily execution: <strong className="tabular">{dailyProgress}%</strong>
          </span>
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKSPACE (Section 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: 'var(--space-6)',
          alignItems: 'flex-start',
        }}
      >
        
        {/* =========================================================================
            LEFT COLUMN: DAILY EXECUTION
            1. Today's priority tasks
            2. Upcoming tasks
            3. Daily habit checklist
            4. End-of-day review status
        ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* 1. Today's Priority Tasks */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="var(--text-primary)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Today's Tasks</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="tabular">
                  ({todayScheduledTasks.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('tasks')}
                className="btn btn-ghost btn-sm"
              >
                View all tasks →
              </button>
            </div>

            {/* Overdue Alert banner if distinct overdue items exist */}
            {overdueTasks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--status-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  marginBottom: 'var(--space-3)',
                  fontSize: '12px',
                  color: 'var(--status-danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} />
                  <span>
                    <strong>{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</strong> from previous days require rescheduling.
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--status-danger)', padding: '2px 6px', fontSize: '11px' }}
                >
                  Resolve
                </button>
              </div>
            )}

            {todayScheduledTasks.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  border: '1px dashed var(--border-default)',
                  borderRadius: 'var(--radius-medium)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12.5px',
                  background: 'var(--bg-surface)',
                }}
              >
                No tasks scheduled for today. {overdueTasks.length > 0 ? 'Focus on resolving overdue items above.' : 'All clear for deep work.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {todayScheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderLeft: `3px solid ${
                        t.priority === 'critical'
                          ? 'var(--priority-critical)'
                          : t.priority === 'high'
                          ? 'var(--priority-high)'
                          : t.priority === 'medium'
                          ? 'var(--priority-medium)'
                          : 'var(--priority-low)'
                      }`,
                      borderRadius: 'var(--radius-small)',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => handleToggleTask(t)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Mark complete"
                      >
                        <Circle size={15} color="var(--border-focus)" />
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t.dueTime && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }} className="tabular">
                          <Clock size={10} /> {t.dueTime}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          background:
                            t.priority === 'critical'
                              ? 'var(--priority-critical-bg)'
                              : t.priority === 'high'
                              ? 'var(--priority-high-bg)'
                              : 'var(--bg-surface)',
                          color:
                            t.priority === 'critical'
                              ? 'var(--priority-critical)'
                              : t.priority === 'high'
                              ? 'var(--priority-high)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Upcoming This Week
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
                      padding: '7px 10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-small)',
                      fontSize: '12.5px',
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
            </section>
          )}

          {/* 3. Daily Habit Checklist */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={16} color="var(--text-primary)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Daily Habits</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="tabular">
                  ({habitsCompletedTodayCount}/{habitsToday.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('habits')}
                className="btn btn-ghost btn-sm"
              >
                Manage habits →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {habitsToday.map((h) => {
                const isCompleted = habitEntries.some(
                  (e) => e.habitId === h.id && e.date === todayStr && e.completed
                );

                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabitEntry(h.id, todayStr)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-small)',
                      background: isCompleted ? 'var(--bg-hover)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2
                        size={15}
                        color={isCompleted ? 'var(--status-success)' : 'var(--text-muted)'}
                        strokeWidth={isCompleted ? 2.2 : 1.5}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {h.name}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                      {h.streak}d streak
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. End-of-Day Review Status */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-medium)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Moon size={16} color="var(--text-secondary)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>End-of-Day Review</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {latestReview
                    ? `Completed for today (Rated ${latestReview.rating}/5 stars)`
                    : 'Pending shutdown · Reflect and set tomorrow’s top 3'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('review')}
              className={latestReview ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            >
              {latestReview ? 'View Review' : 'Start Review'}
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: LONG-TERM DIRECTION
            1. Priority goals
            2. Goal progress
            3. Upcoming milestones
            4. Important reminders (academic alert, bottleneck)
        ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* 1 & 2. Priority Goals with Progress */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color="var(--priority-critical)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Priority Goals</h2>
              </div>
              <button
                onClick={() => setActiveView('goals')}
                className="btn btn-ghost btn-sm"
              >
                All goals →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {priorityGoals.map((g) => {
                const nextMilestone = g.milestones.find((m) => !m.isCompleted);

                return (
                  <div
                    key={g.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-small)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {g.title}
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          background: g.priority === 'critical' ? 'var(--priority-critical-bg)' : 'var(--priority-high-bg)',
                          color: g.priority === 'critical' ? 'var(--priority-critical)' : 'var(--priority-high)',
                        }}
                      >
                        {g.priority}
                      </span>
                    </div>

                    {/* Progress track */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        <span className="tabular">{g.progress}% complete</span>
                        <span className="tabular">{g.targetDate || 'Ongoing'}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-thumb"
                          style={{
                            width: `${g.progress}%`,
                            background: g.priority === 'critical' ? 'var(--priority-critical)' : 'var(--text-primary)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Next Milestone */}
                    {nextMilestone && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Next:</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {nextMilestone.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3 & 4. Important Reminders & Bottlenecks */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-2)' }}>
              Important Reminders
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Academic Attendance Reminder */}
              {academicAlertSubject ? (
                <div
                  onClick={() => setActiveView('academics')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-small)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--status-warning)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={15} color="var(--status-warning)" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {academicAlertSubject.code} Attendance Warning
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Attendance below {academicAlertSubject.targetAttendancePercentage}% target
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
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
                    <span style={{ fontSize: '12.5px' }}>Academics: {academicAssignments.filter((a) => !a.isSubmitted).length} assignments due</span>
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
                  <span style={{ fontSize: '12.5px' }}>
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
                  <span style={{ fontSize: '12.5px' }}>
                    Finance: {financeTransactions.length} recorded entries
                  </span>
                </div>
                <ChevronRight size={13} color="var(--text-muted)" />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3. BOTTOM: WEEKLY OVERVIEW (Section 3: Compact weekly productivity summary) */}
      <div
        style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: 'var(--space-4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Weekly Discipline</div>
          <span>Active streaks across {habits.filter((h) => h.streak > 0).length} of {habits.length} habits.</span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Objectives Velocity</div>
          <span>{goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.isCompleted).length, 0)} milestones passed across active goals.</span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Accountability Check</div>
          <span>{eveningReviews.length} total evening reflections stored in local vault.</span>
        </div>
      </div>
    </div>
  );
}
