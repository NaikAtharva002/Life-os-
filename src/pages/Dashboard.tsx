import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Target,
  CheckSquare,
  Repeat,
  Moon,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Quote,
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
  const financeBudgets = useStore((s) => s.financeBudgets);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const careerApplications = useStore((s) => s.careerApplications);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const settings = useStore((s) => s.settings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const todayStr = new Date().toISOString().split('T')[0];
  const currency = settings.currencySymbol || '$';

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

  // Daily Motivation Quotes
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
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HERO COMMAND BANNER & PROGRESS RING */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.14) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(124, 92, 252, 0.25)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={14} /> {todayFormatted}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 6px 0', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {greeting}, {settings.userName}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', lineHeight: '1.5' }}>
            You have <strong style={{ color: 'var(--text-primary)' }}>{todayTasks.length} tasks scheduled</strong> today and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{habitsToday.length - habitsCompletedTodayCount} habits</strong> pending completion.
          </p>
        </div>

        {/* Daily Progress Circular Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '12px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '56px', height: '56px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border)"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="4"
                strokeDasharray={`${dailyProgress}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>
              {dailyProgress}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Progress</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {completedTodayCount} tasks • {habitsCompletedTodayCount}/{habitsToday.length} habits
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 5 VITAL QUESTIONS EXECUTIVE DASHBOARD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Q1: What should I do today? */}
        <div
          onClick={() => setActiveView('tasks')}
          className="card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
            1. What to do today?
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {todayTasks.length} Key Tasks
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {todayTasks[0] ? `Top: "${todayTasks[0].title.substring(0, 28)}..."` : 'Clear for deep work'}
          </div>
        </div>

        {/* Q2: What is most important? */}
        <div
          onClick={() => setActiveView('goals')}
          className="card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--priority-critical)', textTransform: 'uppercase', marginBottom: '6px' }}>
            2. What is most important?
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {priorityGoals[0]?.title ? priorityGoals[0].title.substring(0, 22) + '...' : 'Set Critical Goal'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {priorityGoals[0] ? `${priorityGoals[0].progress}% complete • Due ${priorityGoals[0].targetDate}` : 'Prioritize high impact'}
          </div>
        </div>

        {/* Q3: What am I falling behind on? */}
        <div
          onClick={() => (overdueTasks.length > 0 ? setActiveView('tasks') : academicAlertSubject ? setActiveView('academics') : null)}
          className="card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: overdueTasks.length > 0 || academicAlertSubject ? '1px solid var(--danger)' : '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: overdueTasks.length > 0 || academicAlertSubject ? 'var(--danger)' : 'var(--success)', textTransform: 'uppercase', marginBottom: '6px' }}>
            3. Falling behind on?
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {overdueTasks.length > 0
              ? `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`
              : academicAlertSubject
              ? `${academicAlertSubject.code} Attendance`
              : 'Zero Bottlenecks'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {overdueTasks.length > 0
              ? `Resolve or reschedule today`
              : academicAlertSubject
              ? `Attendance < 75% threshold`
              : 'All systems on track'}
          </div>
        </div>

        {/* Q4: How much progress made? */}
        <div
          onClick={() => setActiveView('analytics')}
          className="card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--info)', textTransform: 'uppercase', marginBottom: '6px' }}>
            4. Progress Made?
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {completedTodayCount} Completed Today
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.isCompleted).length, 0)} total milestones passed
          </div>
        </div>

        {/* Q5: What should I improve tomorrow? */}
        <div
          onClick={() => setActiveView('review')}
          className="card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '6px' }}>
            5. Improve tomorrow?
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {latestReview?.whatToImproveTomorrow || latestReview?.tomorrowPriorities?.[0] || 'Schedule evening reflection'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {latestReview?.rating ? `Yesterday rated: ${latestReview.rating}/5 stars` : 'Perform evening review at 21:30'}
          </div>
        </div>
      </div>

      {/* 3. MOTIVATION & AI COPILOT INSIGHT BANNER */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(124, 92, 252, 0.12)', color: 'var(--accent)' }}>
            <Quote size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: 500 }}>
              "{dailyQuote.text}"
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              — {dailyQuote.author}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveView('assistant')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
        >
          <Sparkles size={14} color="var(--accent)" /> Ask Astra Copilot
        </button>
      </div>

      {/* 4. TODAY'S HABIT QUICK-CHECKER STRIP */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="var(--warning)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Today's Habit Rituals ({habitsCompletedTodayCount}/{habitsToday.length})
            </span>
          </div>
          <button
            onClick={() => setActiveView('habits')}
            className="btn btn-ghost"
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View Heatmap <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
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
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                  border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={18} color={isCompleted ? 'var(--success)' : 'var(--text-muted)'} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                    {h.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Streak: {h.streak} days
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MAIN SPLIT: TASKS TO DO (LEFT) + GOALS & DOMAIN CARDS (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Today's Action Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            className="card"
            style={{
              padding: '20px',
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--accent)" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Action Items ({todayTasks.length})</h2>
              </div>
              <button
                onClick={() => {
                  setEditingTask(undefined);
                  setIsTaskModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                + New Task
              </button>
            </div>

            {/* Overdue Alert banner if any */}
            {overdueTasks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '12px',
                  fontSize: '12.5px',
                  color: 'var(--danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} />
                  <span><strong>{overdueTasks.length} overdue task(s)</strong> require rescheduling.</span>
                </div>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="btn btn-ghost"
                  style={{ fontSize: '11px', color: 'var(--danger)', padding: '2px 6px' }}
                >
                  Manage
                </button>
              </div>
            )}

            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                All scheduled tasks completed for today. Great job!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayTasks.slice(0, 5).map((t) => (
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

            {todayTasks.length > 5 && (
              <button
                onClick={() => setActiveView('tasks')}
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: '12px', fontSize: '12.5px', color: 'var(--accent)' }}
              >
                View all {todayTasks.length} tasks in Tasks view
              </button>
            )}
          </div>

          {/* Quick Domain Pulse Cards (Finance, Academics, Fitness) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            
            {/* Academics Pulse */}
            <div
              onClick={() => setActiveView('academics')}
              className="card"
              style={{
                padding: '16px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--info)' }}>Academics</span>
                <GraduationCap size={16} color="var(--info)" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {academicAssignments.filter((a) => !a.isSubmitted).length} Assignments
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Next: {academicAssignments.find((a) => !a.isSubmitted)?.title.substring(0, 20) || 'None pending'}
              </div>
            </div>

            {/* Fitness Pulse */}
            <div
              onClick={() => setActiveView('fitness')}
              className="card"
              style={{
                padding: '16px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Fitness</span>
                <Dumbbell size={16} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {workoutSessions[0]?.splitType ? `${workoutSessions[0].splitType} Split` : 'Schedule Split'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Last: {workoutSessions[0]?.date || 'None logged'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High Priority Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            className="card"
            style={{
              padding: '20px',
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="var(--priority-critical)" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>High Impact Goals</h2>
              </div>
              <button
                onClick={() => {
                  setEditingGoal(undefined);
                  setIsGoalModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                + New Goal
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: '12px', fontSize: '12.5px', color: 'var(--accent)' }}
            >
              Manage all {goals.length} Goals
            </button>
          </div>

          {/* Evening Review Reminder Banner */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.1), rgba(20, 20, 28, 0.7))',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(124, 92, 252, 0.15)', color: 'var(--accent)' }}>
                <Moon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Evening Review Ritual
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Reflect on today's wins and set tomorrow's top 3 priorities.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('review')}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Start Review
            </button>
          </div>
        </div>
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
