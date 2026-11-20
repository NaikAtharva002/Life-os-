import React, { useState, useMemo } from 'react';
import {
  Target,
  CheckSquare,
  Repeat,
  Moon,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  GraduationCap,
  Dumbbell,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import GoalCard from '../components/GoalCard';
import TaskItem from '../components/TaskItem';
import GoalModal from '../components/GoalModal';
import TaskModal from '../components/TaskModal';
import type { Goal, Task, Priority } from '../types';

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

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const todayStr = new Date().toISOString().split('T')[0];

  // Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Daily Motivation Quotes (Editorial & restrained)
  const quotes = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
    { text: "Focus is a muscle. The more you protect your deep work, the rarer your output becomes.", author: "Cal Newport" },
    { text: "Action precedes motivation. Do the smallest unit of work first.", author: "James Clear" },
  ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  // Critical & High Priority Goals
  const priorityGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived && (g.priority === 'critical' || g.priority === 'high'))
      .sort((a, b) => (a.priority === 'critical' ? -1 : 1))
      .slice(0, 3);
  }, [goals]);

  // Tasks due today or general
  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted && (t.dueDate === todayStr || (!t.dueDate && !t.isOverdue)))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, todayStr]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr)));
  }, [tasks, todayStr]);

  // Completed tasks count today
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

  // Daily Progress Indicator (0-100%)
  const dailyProgress = useMemo(() => {
    const taskDenominator = todayTasks.length + completedTodayCount;
    const taskScore = taskDenominator > 0 ? (completedTodayCount / taskDenominator) * 50 : 50;
    const habitScore = habitsToday.length > 0 ? (habitsCompletedTodayCount / habitsToday.length) * 50 : 50;
    return Math.round(taskScore + habitScore);
  }, [todayTasks, completedTodayCount, habitsToday, habitsCompletedTodayCount]);

  // Latest evening review
  const latestReview = useMemo(() => {
    return eveningReviews.length > 0
      ? [...eveningReviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;
  }, [eveningReviews]);

  // Academic alert
  const academicAlertSubject = useMemo(() => {
    return academicSubjects.find(
      (s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
    );
  }, [academicSubjects]);

  return (
    <div className="page-container animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. EDITORIAL HEADER & ACTION BAR (NO purple gradients) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            <span>{todayFormatted}</span>
            <span>•</span>
            <span className="tabular">{todayTasks.length} tasks scheduled</span>
            <span>•</span>
            <span className="tabular">{habitsToday.length - habitsCompletedTodayCount} habits pending</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {greeting}, {settings.userName}
          </h1>
        </div>

        {/* Clean, high-contrast actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setEditingTask(undefined);
              setIsTaskModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Task
          </button>
          <button
            onClick={() => {
              setEditingGoal(undefined);
              setIsGoalModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Goal
          </button>
          <button
            onClick={() => setActiveView('assistant')}
            className="btn btn-primary btn-sm"
          >
            <Sparkles size={14} /> Astra Copilot
          </button>
        </div>
      </div>

      {/* 2. THE 5 VITAL QUESTIONS — STRUCTURED BRIEFING (Solid surfaces, tabular, restrained) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {/* Q1: What should I do today? */}
        <div
          onClick={() => setActiveView('tasks')}
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            1. What to do today?
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }} className="tabular">
            {todayTasks.length} Key Tasks
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {todayTasks[0] ? todayTasks[0].title : 'All items cleared'}
          </div>
        </div>

        {/* Q2: What is most important? */}
        <div
          onClick={() => setActiveView('goals')}
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--priority-critical)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            2. What is most important?
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {priorityGoals[0]?.title ? priorityGoals[0].title : 'Set Critical Goal'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="tabular">
            {priorityGoals[0] ? `${priorityGoals[0].progress}% • Due ${priorityGoals[0].targetDate || 'Ongoing'}` : 'High impact focus'}
          </div>
        </div>

        {/* Q3: What am I falling behind on? */}
        <div
          onClick={() => (overdueTasks.length > 0 ? setActiveView('tasks') : academicAlertSubject ? setActiveView('academics') : null)}
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: overdueTasks.length > 0 || academicAlertSubject ? 'var(--danger)' : 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            3. Falling behind on?
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }} className="tabular">
            {overdueTasks.length > 0
              ? `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`
              : academicAlertSubject
              ? `${academicAlertSubject.code} Attendance`
              : 'Zero Bottlenecks'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {overdueTasks.length > 0
              ? 'Needs rescheduling'
              : academicAlertSubject
              ? 'Below 75% threshold'
              : 'On schedule'}
          </div>
        </div>

        {/* Q4: How much progress made? */}
        <div
          onClick={() => setActiveView('analytics')}
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            4. Progress Made?
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }} className="tabular">
            {completedTodayCount} Completed Today
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="tabular">
            Daily Execution: {dailyProgress}%
          </div>
        </div>

        {/* Q5: What should I improve tomorrow? */}
        <div
          onClick={() => setActiveView('review')}
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
        >
          <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            5. Improve Tomorrow?
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {latestReview?.whatToImproveTomorrow || latestReview?.tomorrowPriorities?.[0] || 'Evening Reflection'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {latestReview?.rating ? `Yesterday: ${latestReview.rating}/5 stars` : 'Review at day close'}
          </div>
        </div>
      </div>

      {/* 3. ASYMMETRIC 2-COLUMN WORKFLOW GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: ACTIVE TASKS & HABITS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Items List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="var(--text-primary)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Today's Tasks</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">({todayTasks.length})</span>
              </div>
              <button
                onClick={() => {
                  setEditingTask(undefined);
                  setIsTaskModalOpen(true);
                }}
                className="btn btn-ghost btn-sm"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {/* Overdue alert banner if present */}
            {overdueTasks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: 'var(--danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} />
                  <span><strong>{overdueTasks.length} overdue task(s)</strong> need rescheduling.</span>
                </div>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)', padding: '2px 6px', fontSize: '11px' }}
                >
                  Manage
                </button>
              </div>
            )}

            {todayTasks.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                All scheduled tasks completed for today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {todayTasks.slice(0, 6).map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onEdit={() => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {todayTasks.length > 6 && (
              <button
                onClick={() => setActiveView('tasks')}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
              >
                View all {todayTasks.length} tasks →
              </button>
            )}
          </div>

          {/* Daily Habit Rituals Checklist */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={16} color="var(--text-primary)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Daily Habits</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                  ({habitsCompletedTodayCount}/{habitsToday.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('habits')}
                className="btn btn-ghost btn-sm"
              >
                Heatmap →
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
                      borderRadius: 'var(--radius-sm)',
                      background: isCompleted ? 'var(--bg-hover)' : 'transparent',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCompleted) e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCompleted) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2
                        size={16}
                        color={isCompleted ? 'var(--success)' : 'var(--text-muted)'}
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
          </div>
        </div>

        {/* RIGHT COLUMN: PRIORITY GOALS & DOMAIN PULSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* High Impact Goals */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color="var(--priority-critical)" />
                <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Priority Goals</h2>
              </div>
              <button
                onClick={() => {
                  setEditingGoal(undefined);
                  setIsGoalModalOpen(true);
                }}
                className="btn btn-ghost btn-sm"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {priorityGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={() => {
                    setEditingGoal(g);
                    setIsGoalModalOpen(true);
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveView('goals')}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
            >
              All {goals.length} Goals →
            </button>
          </div>

          {/* Life Domains Status (Tabular, clean) */}
          <div className="card">
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Domain Health
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Academics */}
              <div
                onClick={() => setActiveView('academics')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={15} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Academics</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="tabular">
                  {academicAssignments.filter((a) => !a.isSubmitted).length} assignments due
                </div>
              </div>

              {/* Fitness */}
              <div
                onClick={() => setActiveView('fitness')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dumbbell size={15} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Fitness</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="tabular">
                  {workoutSessions[0]?.splitType || 'Schedule Session'}
                </div>
              </div>

              {/* Finances */}
              <div
                onClick={() => setActiveView('finance')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={15} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>Finances</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="tabular">
                  {financeTransactions.length} entries recorded
                </div>
              </div>
            </div>
          </div>

          {/* Evening Review Shutdown Prompt (Solid, quiet) */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Moon size={16} color="var(--text-secondary)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Evening Shutdown</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Reflect & set tomorrow's top 3
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('review')}
              className="btn btn-secondary btn-sm"
            >
              Review
            </button>
          </div>
        </div>
      </div>

      {/* 4. EDITORIAL QUOTE (Discreet, grounded) */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}
      >
        <span style={{ fontStyle: 'italic' }}>"{dailyQuote.text}"</span>
        <span>— {dailyQuote.author}</span>
      </div>

      {/* MODALS */}
      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          editingGoal={editingGoal}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}
