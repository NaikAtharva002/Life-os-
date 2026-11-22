import React, { useMemo } from 'react';
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
  Compass,
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
  const settings = useStore((s) => s.settings);
  const setActiveView = useStore((s) => s.setActiveView);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);

  const todayStr = new Date().toISOString().split('T')[0];

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

  const dailyProgress = useMemo(() => {
    const totalItems = todayTasks.length + completedTodayCount + habitsToday.length;
    if (totalItems === 0) return 100;
    const completedItems = completedTodayCount + habitsCompletedTodayCount;
    return Math.round((completedItems / totalItems) * 100);
  }, [todayTasks, completedTodayCount, habitsToday, habitsCompletedTodayCount]);

  // Academic attendance safety
  const attendanceAvg = useMemo(() => {
    if (academicSubjects.length === 0) return 85.0;
    const totalClasses = academicSubjects.reduce((acc, s) => acc + s.totalClasses, 0);
    const attended = academicSubjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    return totalClasses > 0 ? (attended / totalClasses) * 100 : 85.0;
  }, [academicSubjects]);

  // Priority goals
  const activeGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived)
      .slice(0, 3);
  }, [goals]);

  // Last 7 days
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

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* =========================================================================
          HEROIC HORIZON (Taste-Skill Luxury Whitespace & Restraint)
      ========================================================================= */}
      <div
        className="glass-island glass-island-luminous"
        style={{
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              {todayFormatted}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              Active Cadence
            </span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              margin: '0 0 6px 0',
              lineHeight: 1.2
            }}
          >
            {greeting}, {settings.userName}
          </h1>

          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
            You have <span className="tabular" style={{ color: '#f8fafc', fontWeight: 600 }}>{todayTasks.length}</span> focus tasks scheduled today.
            {overdueTasks.length > 0 && (
              <> <span style={{ color: '#f43f5e' }}>· {overdueTasks.length} overdue</span> requiring resolution.</>
            )}
            {' '}Habits are currently at <span className="tabular" style={{ color: '#10b981', fontWeight: 600 }}>{habitsCompletedTodayCount}/{habitsToday.length}</span> completed.
          </p>
        </div>

        {/* Hero Progress Gauge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(2, 6, 23, 0.4)',
            padding: '16px 22px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Execution Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="tabular" style={{ fontSize: '28px', color: '#10b981', fontWeight: 700 }}>
                {dailyProgress}
              </span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>%</span>
            </div>
          </div>

          <div style={{ width: '64px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${dailyProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ISLAND OF METRICS (Strict Tabular Numerals: font-mono tracking-tight)
      ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1 */}
        <div className="glass-island" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Action Velocity
            </span>
            <CheckSquare size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular" style={{ fontSize: '26px', color: '#f8fafc' }}>
              {completedTodayCount}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              / <span className="tabular">{todayTasks.length + completedTodayCount}</span> done
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
            {overdueTasks.length === 0 ? '✓ Zero backlog debt' : `${overdueTasks.length} pending review`}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-island" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Habit Integrity
            </span>
            <Repeat size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular" style={{ fontSize: '26px', color: '#10b981' }}>
              {habitsToday.length > 0 ? Math.round((habitsCompletedTodayCount / habitsToday.length) * 100) : 100}%
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              active rate
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
            <span className="tabular">{habitsCompletedTodayCount}</span> of <span className="tabular">{habitsToday.length}</span> completed today
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-island" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic Safety
            </span>
            <GraduationCap size={16} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular" style={{ fontSize: '26px', color: attendanceAvg >= 75 ? '#38bdf8' : '#f43f5e' }}>
              {attendanceAvg.toFixed(1)}%
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              vs 75% bar
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
            {attendanceAvg >= 75 ? '✓ Safe bunk buffer' : '⚠️ Attendance alert'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-island" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cash Velocity
            </span>
            <TrendingUp size={16} color="#fbbf24" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular" style={{ fontSize: '26px', color: '#f8fafc' }}>
              $3,850.00
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              / mo
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
            <span className="tabular">4.8</span> months runway buffer
          </div>
        </div>

      </div>

      {/* =========================================================================
          ISLAND 2: FOCUS TASK CADENCE & ACTION FLOW
      ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '28px' }}>
        
        {/* Left Island: Daily Priority Tasks */}
        <div className="glass-island" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                Today's Priority Triage
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Tactile micro-action list with sub-200ms spring feedback
              </span>
            </div>
            <button
              onClick={() => setActiveView('tasks')}
              className="btn btn-ghost btn-sm"
              style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              All Tasks <ArrowRight size={13} />
            </button>
          </div>

          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              All actions completed for today. Enjoy the luxury of clear focus.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Overdue alert rows */}
              {overdueTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    transition: 'all var(--spring-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => handleToggleTask(t)}
                      style={{ cursor: 'pointer', accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#fecdd3' }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> Overdue from <span className="tabular">{t.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(244, 63, 94, 0.2)',
                      color: '#fb7185',
                      textTransform: 'uppercase'
                    }}
                  >
                    Critical
                  </span>
                </div>
              ))}

              {/* Today's Tasks */}
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all var(--spring-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => handleToggleTask(t)}
                      style={{ cursor: 'pointer', accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc' }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t.category || 'General'}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: t.priority === 'high' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      color: t.priority === 'high' ? '#fb923c' : '#94a3b8',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Island: Habit Cadence & Streaks */}
        <div className="glass-island" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                Habit Cadence
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                7-day streak constellation
              </span>
            </div>
            <button
              onClick={() => setActiveView('habits')}
              className="btn btn-ghost btn-sm"
              style={{ color: '#10b981' }}
            >
              Habits <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {habitsToday.slice(0, 4).map((h) => {
              const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed);
              return (
                <div
                  key={h.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(2, 6, 23, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc' }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔥 <span className="tabular">{h.streak || 7}d</span> streak
                    </div>
                  </div>

                  <button
                    onClick={() => toggleHabitEntry(h.id, todayStr)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: isDone ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isDone ? '#10b981' : 'transparent',
                      color: isDone ? '#020617' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isDone ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all var(--spring-fast)'
                    }}
                  >
                    ✓
                  </button>
                </div>
              );
            })}
          </div>

          {/* Strategic Goals Teaser */}
          <div
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>Strategic Horizon</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                <span className="tabular">{goals.filter((g) => !g.isArchived).length}</span> active high-leverage goals
              </div>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Review Goals
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
