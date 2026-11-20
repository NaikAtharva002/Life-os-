import React, { useMemo } from 'react';
import useStore from '../store/useStore';
import {
  BarChart3,
  TrendingUp,
  Target,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const bodyMetrics = useStore((s) => s.bodyMetrics);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const careerApplications = useStore((s) => s.careerApplications);
  const settings = useStore((s) => s.settings);

  const currency = settings.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Productivity Index Calculation (Composite 0-100)
  // Combines: Task completion (35%), Habit consistency (35%), Active Goals velocity (30%)
  const { productivityScore, taskCompletionRate, habitAdherenceRate, goalVelocity } = useMemo(() => {
    // Task completion
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 80;

    // Habit adherence past 14 days
    const past14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(Date.now() - i * 86400000);
      return d.toISOString().split('T')[0];
    });
    const expectedEntries = habits.length * 14;
    const actualEntries = habitEntries.filter((e) => past14Days.includes(e.date) && e.completed).length;
    const habitRate = expectedEntries > 0 ? Math.min(100, Math.round((actualEntries / expectedEntries) * 100)) : 85;

    // Goal velocity
    const activeGoals = goals.filter((g) => !g.isArchived);
    const avgGoalProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((a, g) => a + g.progress, 0) / activeGoals.length) : 60;

    const composite = Math.round(taskRate * 0.35 + habitRate * 0.35 + avgGoalProgress * 0.3);

    return {
      productivityScore: composite,
      taskCompletionRate: taskRate,
      habitAdherenceRate: habitRate,
      goalVelocity: avgGoalProgress,
    };
  }, [tasks, habits, habitEntries, goals]);

  // 2. Financial Metrics
  const { totalInflow, totalOutflow, savingsRate } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    financeTransactions.forEach((t) => {
      if (t.type === 'income') inflow += t.amount;
      else outflow += t.amount;
    });
    const net = inflow - outflow;
    const rate = inflow > 0 ? Math.max(0, Math.round((net / inflow) * 100)) : 0;
    return { totalInflow: inflow, totalOutflow: outflow, savingsRate: rate };
  }, [financeTransactions]);

  // 3. Academic Attendance Safety
  const { attendedCount, totalClassesCount, overallAttendancePct } = useMemo(() => {
    let att = 0;
    let tot = 0;
    academicSubjects.forEach((s) => {
      att += s.attendedClasses;
      tot += s.totalClasses;
    });
    const pct = tot > 0 ? Math.round((att / tot) * 100) : 100;
    return { attendedCount: att, totalClassesCount: tot, overallAttendancePct: pct };
  }, [academicSubjects]);

  // 4. Actionable Insights Synthesis
  const actionableInsights = useMemo(() => {
    const list: { type: 'positive' | 'warning' | 'tip'; title: string; desc: string }[] = [];

    if (productivityScore >= 75) {
      list.push({
        type: 'positive',
        title: 'High Performance Velocity',
        desc: `Your composite productivity score is ${productivityScore}%. Task execution and habit consistency are aligned with your top goals.`,
      });
    }

    if (overallAttendancePct < 75) {
      list.push({
        type: 'warning',
        title: 'Academic Attendance Warning',
        desc: `Overall attendance is at ${overallAttendancePct}%, below the 75% university eligibility requirement. Prioritize scheduled morning lectures this week.`,
      });
    }

    if (savingsRate >= 40) {
      list.push({
        type: 'positive',
        title: 'Strong Capital Accumulation',
        desc: `You are saving ${savingsRate}% of inflow. Continue allocating excess cashflow into your Emergency Reserve and long-term liquidity.`,
      });
    } else {
      list.push({
        type: 'tip',
        title: 'Optimize Variable Spending',
        desc: `Current savings rate is ${savingsRate}%. Review monthly dining and SaaS subscriptions to increase your monthly savings velocity.`,
      });
    }

    const overdueCount = tasks.filter((t) => t.isOverdue).length;
    if (overdueCount > 0) {
      list.push({
        type: 'warning',
        title: `${overdueCount} Overdue Action Items`,
        desc: 'Unfinished tasks accumulate mental friction. Reschedule or resolve these items in your next evening review.',
      });
    }

    return list;
  }, [productivityScore, overallAttendancePct, savingsRate, tasks]);

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Central Intelligence & Analytics
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
          Actionable synthesis across productivity, academics, financial velocity, and physical conditioning.
        </p>
      </div>

      {/* Main Executive Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Productivity Index Score Card */}
        <div
          className="card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.12), rgba(6, 182, 212, 0.08))',
            borderRadius: '16px',
            border: '1px solid rgba(124, 92, 252, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Circular SVG Gauge */}
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="3.5"
                strokeDasharray={`${productivityScore}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c5cfc" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {productivityScore}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                INDEX
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Overall Life OS Index
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Synthesized from tasks ({taskCompletionRate}%), habit adherence ({habitAdherenceRate}%), and goal progress ({goalVelocity}%).
            </div>
          </div>
        </div>

        {/* Quick Domain Matrix */}
        <div
          className="card"
          style={{
            padding: '22px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>FINANCIAL VELOCITY</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
              {savingsRate}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Savings Ratio</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ACADEMIC STATUS</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: overallAttendancePct >= 75 ? 'var(--text-primary)' : 'var(--danger)', marginTop: '2px' }}>
              {overallAttendancePct}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Attendance Health</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TRAINING SESSIONS</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
              {workoutSessions.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed Workouts</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CAREER PIPELINE</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--info)', marginTop: '2px' }}>
              {careerApplications.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active Applications</div>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Insights */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent)" /> Intelligent Data Insights & Recommendations
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {actionableInsights.map((ins, iIdx) => (
            <div
              key={iIdx}
              className="card"
              style={{
                padding: '16px 18px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                borderLeft: `4px solid ${
                  ins.type === 'positive'
                    ? 'var(--success)'
                    : ins.type === 'warning'
                    ? 'var(--warning)'
                    : 'var(--accent)'
                }`,
                borderTop: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {ins.title}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {ins.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Domain Analytics Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Habit Consistency Distribution */}
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>Habit Consistency Rates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {habits.map((h) => {
              const entries = habitEntries.filter((e) => e.habitId === h.id && e.completed).length;
              const pct = Math.min(100, Math.round((entries / 30) * 100));

              return (
                <div key={h.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Streak: {h.streak}d ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: h.color || 'var(--accent)',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Milestone Velocity */}
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>Goal Progress Milestones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.filter((g) => !g.isArchived).map((g) => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{g.progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${g.progress}%`,
                      background: 'linear-gradient(90deg, #7c5cfc, #06b6d4)',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
