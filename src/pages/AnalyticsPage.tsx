import React, { useMemo } from 'react';
import useStore from '../store/useStore';
import { todayLocal, toLocalDateString } from '../lib/dates';
import { Download } from 'lucide-react';

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function AnalyticsPage() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const careerApplications = useStore((s) => s.careerApplications);
  const settings = useStore((s) => s.settings);

  const currency = settings.currencySymbol || '₹';
  const todayStr = todayLocal();

  // 1. Productivity Index Calculation (Composite 0-100; 0 when no records exist)
  const { productivityScore, taskCompletionRate, habitAdherenceRate, goalVelocity } = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const past14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(Date.now() - i * 86400000);
      return toLocalDateString(d);
    });
    const expectedEntries = habits.length * 14;
    const actualEntries = habitEntries.filter((e) => past14Days.includes(e.date) && e.completed).length;
    const habitRate = expectedEntries > 0 ? Math.min(100, Math.round((actualEntries / expectedEntries) * 100)) : 0;

    const activeGoals = goals.filter((g) => !g.isArchived);
    const avgGoalProgress =
      activeGoals.length > 0
        ? Math.round(activeGoals.reduce((a, g) => a + g.progress, 0) / activeGoals.length)
        : 0;

    const activePillars = [
      tasks.length > 0 ? taskRate : null,
      habits.length > 0 ? habitRate : null,
      activeGoals.length > 0 ? avgGoalProgress : null,
    ].filter((v): v is number => v !== null);

    const composite =
      activePillars.length > 0
        ? Math.round(activePillars.reduce((sum, v) => sum + v, 0) / activePillars.length)
        : 0;

    return {
      productivityScore: composite,
      taskCompletionRate: taskRate,
      habitAdherenceRate: habitRate,
      goalVelocity: avgGoalProgress,
    };
  }, [tasks, habits, habitEntries, goals]);

  // 2. Financial Metrics
  const { totalInflow, totalOutflow, savingsRate, hasFinanceData } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    financeTransactions.forEach((t) => {
      if (t.type === 'income') inflow += t.amount;
      else outflow += t.amount;
    });
    const net = inflow - outflow;
    const rate = inflow > 0 ? Math.max(0, Math.round((net / inflow) * 100)) : 0;
    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      savingsRate: rate,
      hasFinanceData: financeTransactions.length > 0,
    };
  }, [financeTransactions]);

  // 3. Academic Attendance Safety
  const { attendedCount, totalClassesCount, overallAttendancePct } = useMemo(() => {
    let att = 0;
    let tot = 0;
    academicSubjects.forEach((s) => {
      att += s.attendedClasses;
      tot += s.totalClasses;
    });
    const pct = tot > 0 ? Math.round((att / tot) * 100) : 0;
    return { attendedCount: att, totalClassesCount: tot, overallAttendancePct: pct };
  }, [academicSubjects]);

  // 4. Actionable Insights Synthesis
  const actionableInsights = useMemo(() => {
    const list: { type: 'positive' | 'warning' | 'tip'; title: string; desc: string }[] = [];

    if (tasks.length === 0 && habits.length === 0 && goals.length === 0 && !hasFinanceData) {
      list.push({
        type: 'tip',
        title: 'Fresh Analytics Canvas',
        desc: 'Log your first tasks, habits, goals, or financial transactions to generate personalized cross-domain velocity metrics.',
      });
      return list;
    }

    if (productivityScore >= 75) {
      list.push({
        type: 'positive',
        title: 'High Performance Velocity',
        desc: `Your composite productivity score is ${productivityScore}%. Task execution and habit consistency are aligned with your top goals.`,
      });
    }

    if (totalClassesCount > 0 && overallAttendancePct < 75) {
      list.push({
        type: 'warning',
        title: 'Academic Attendance Warning',
        desc: `Overall attendance is at ${overallAttendancePct}% (${attendedCount}/${totalClassesCount} classes), below the 75% eligibility requirement. Prioritize scheduled lectures this week.`,
      });
    }

    if (hasFinanceData && totalInflow > 0) {
      if (savingsRate >= 40) {
        list.push({
          type: 'positive',
          title: 'Strong Capital Accumulation',
          desc: `You are saving ${savingsRate}% of ${currency}${totalInflow.toLocaleString('en-IN')} inflow. Continue allocating excess cashflow toward liquidity goals.`,
        });
      } else {
        list.push({
          type: 'tip',
          title: 'Optimize Variable Spending',
          desc: `Current savings rate is ${savingsRate}% (${currency}${totalOutflow.toLocaleString('en-IN')} spent). Review variable spending categories to raise monthly savings velocity.`,
        });
      }
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
  }, [
    tasks,
    habits.length,
    goals.length,
    hasFinanceData,
    productivityScore,
    totalClassesCount,
    overallAttendancePct,
    attendedCount,
    totalInflow,
    totalOutflow,
    savingsRate,
    currency,
  ]);

  const handleExportMetricsCsv = () => {
    const header = ['Date', 'Type', 'Category', `Amount (${currency})`, 'Payment Method', 'Description'];
    const rows = financeTransactions.map((t) => [
      t.date,
      t.type,
      t.category,
      t.amount,
      t.paymentMethod,
      t.description,
    ]);
    const summaryRows = [
      [],
      ['Summary Metric', 'Value'],
      ['Export Date', todayStr],
      ['Operational Index', `${productivityScore}%`],
      ['Tasks Completion', `${taskCompletionRate}%`],
      ['Habit Consistency (14d)', `${habitAdherenceRate}%`],
      ['Goal Velocity', `${goalVelocity}%`],
      ['Savings Ratio', `${savingsRate}%`],
      ['Attendance', totalClassesCount > 0 ? `${overallAttendancePct}%` : 'No classes logged'],
    ];
    const csv = [header, ...rows, ...summaryRows]
      .map((line) => line.map(escapeCsvCell).join(','))
      .join('\n');
    downloadBlob(csv, `life-os-analytics-${todayStr}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportReportJson = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      localDate: todayStr,
      currency,
      metrics: {
        productivityScore,
        taskCompletionRate,
        habitAdherenceRate,
        goalVelocity,
        savingsRate,
        totalInflow,
        totalOutflow,
        attendance: { attendedCount, totalClassesCount, overallAttendancePct },
        workoutSessionsCount: workoutSessions.length,
        careerApplicationsCount: careerApplications.length,
      },
      insights: actionableInsights,
    };
    downloadBlob(JSON.stringify(report, null, 2), `life-os-report-${todayStr}.json`, 'application/json');
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Central Intelligence & Analytics
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Actionable synthesis across productivity, academics, financial velocity, and physical conditioning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleExportMetricsCsv} className="btn btn-secondary btn-sm">
            <Download size={13} />
            Export CSV
          </button>
          <button type="button" onClick={handleExportReportJson} className="btn btn-secondary btn-sm">
            <Download size={13} />
            Export JSON Report
          </button>
        </div>
      </div>

      {/* Executive Summary Strip */}
      <div className="summary-strip">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Life OS Index:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-success)' }} className="tabular">
            {productivityScore}% composite
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tasks Rate:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {taskCompletionRate}%
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Habit Consistency:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {habitAdherenceRate}%
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Savings Velocity:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-success)' }} className="tabular">
            {savingsRate}%
          </span>
        </span>
      </div>

      {/* Main Executive Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Productivity Index Score Card */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            borderRadius: '10px',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--panel-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {/* Circular SVG Gauge (Solid, high contrast) */}
          <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-default)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="3"
                strokeDasharray={`${productivityScore}, 100`}
                strokeLinecap="round"
              />
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
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }} className="tabular">
                {productivityScore}
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                INDEX
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
              Life OS Operational Index
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              Synthesized from tasks ({taskCompletionRate}%), habit adherence ({habitAdherenceRate}%), and goal trajectory ({goalVelocity}%).
            </div>
          </div>
        </div>

        {/* Quick Domain Matrix */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: 'var(--bg-surface)',
            borderRadius: '10px',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--panel-shadow)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div>
            <div className="section-eyebrow" style={{ marginBottom: '2px' }}>FINANCIAL VELOCITY</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--status-success)', marginTop: '2px' }} className="tabular">
              {savingsRate}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Savings Ratio</div>
          </div>

          <div>
            <div className="section-eyebrow" style={{ marginBottom: '2px' }}>ACADEMIC STATUS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: totalClassesCount === 0 || overallAttendancePct >= 75 ? 'var(--text-primary)' : 'var(--status-danger)', marginTop: '2px' }} className="tabular">
              {totalClassesCount > 0 ? `${overallAttendancePct}%` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {totalClassesCount > 0 ? 'Attendance Rate' : 'No classes logged'}
            </div>
          </div>

          <div>
            <div className="section-eyebrow" style={{ marginBottom: '2px' }}>TRAINING LOAD</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
              {workoutSessions.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Completed Sessions</div>
          </div>

          <div>
            <div className="section-eyebrow" style={{ marginBottom: '2px' }}>CAREER PIPELINE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
              {careerApplications.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Pipelines</div>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Insights */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="section-eyebrow">INTELLIGENT INSIGHTS & INTERVENTIONS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {actionableInsights.map((ins, iIdx) => (
            <div
              key={iIdx}
              className="card"
              style={{
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                borderRadius: '8px',
                borderLeft: `3px solid ${
                  ins.type === 'positive'
                    ? 'var(--status-success)'
                    : ins.type === 'warning'
                    ? 'var(--status-warning)'
                    : 'var(--accent)'
                }`,
                borderTop: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                boxShadow: 'var(--panel-shadow)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                {ins.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {ins.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Domain Analytics Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Habit Consistency Distribution */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
          <div style={{ marginBottom: '14px' }}>
            <span className="section-eyebrow">HABIT ADHERENCE RATES</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {habits.length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '12px 0' }}>
                No habits tracked yet. Add daily rituals inside Habits to visualize 30-day adherence.
              </div>
            ) : habits.map((h) => {
              const entries = habitEntries.filter((e) => e.habitId === h.id && e.completed).length;
              const pct = Math.min(100, Math.round((entries / 30) * 100));

              return (
                <div key={h.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</span>
                    <span style={{ color: 'var(--text-muted)' }} className="tabular">Streak: {h.streak}d ({pct}%)</span>
                  </div>
                  <div className="progress-hairline">
                    <div
                      className="progress-hairline-fill"
                      style={{
                        width: `${pct}%`,
                        background: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Milestone Velocity */}
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
          <div style={{ marginBottom: '14px' }}>
            <span className="section-eyebrow">GOAL MILESTONE TRAJECTORY</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.filter((g) => !g.isArchived).length === 0 ? (
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '12px 0' }}>
                No active goals yet. Create a goal to track milestone progress here.
              </div>
            ) : goals.filter((g) => !g.isArchived).map((g) => (
              <div key={g.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">{g.progress}%</span>
                </div>
                <div className="progress-hairline" style={{ marginTop: '4px' }}>
                  <div
                    className="progress-hairline-fill"
                    style={{
                      width: `${g.progress}%`,
                      background: 'var(--status-success)',
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
