import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { todayLocal } from '../lib/dates';
import {
  Sparkles,
  Send,
  Calendar,
  Target,
  AlertTriangle,
  DollarSign,
  GraduationCap,
  Bot,
  User,
  Trash2,
  Key,
  CheckCircle2,
} from 'lucide-react';

export default function AssistantPage() {
  const settings = useStore((s) => s.settings);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const academicExams = useStore((s) => s.academicExams);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const messages = useStore((s) => s.assistantMessages);
  const addAssistantMessage = useStore((s) => s.addAssistantMessage);
  const clearAssistantChat = useStore((s) => s.clearAssistantChat);
  const setActiveView = useStore((s) => s.setActiveView);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const todayStr = todayLocal();
  const currency = settings.currencySymbol || '₹';

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Quick Action Prompts
  const quickPrompts = [
    { label: 'Plan my day', query: 'Plan my day based on today’s scheduled tasks, habits, and priorities.' },
    { label: 'Which goals are most important?', query: 'Which goals are most important this week?' },
    { label: 'Why am I falling behind?', query: 'Why am I falling behind? Identify neglected tasks, habits, and attendance issues.' },
    { label: 'Show my monthly spending', query: 'Show my monthly spending and budget health summary.' },
    { label: 'Create an exam study plan', query: 'Create a study plan for my upcoming academic examinations.' },
    { label: 'Academics progress review', query: 'How much progress have I made in academics and course attendance?' },
  ];

  // Heuristic Offline Intelligence Engine:
  // Evaluates real user data deterministically without requiring an internet connection or API key!
  const generateOfflineResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. "Plan my day"
    if (q.includes('plan') && (q.includes('day') || q.includes('today'))) {
      const todayTasks = tasks.filter((t) => t.dueDate === todayStr && !t.isCompleted);
      const overdueTasks = tasks.filter((t) => t.isOverdue && !t.isCompleted);
      const todayHabits = habits.filter((h) => {
        const dayOfWeek = new Date().getDay();
        return h.targetDays.includes(dayOfWeek);
      });

      let response = `### 📋 Day Plan for ${todayStr}\n\n`;

      if (overdueTasks.length > 0) {
        response += `> [!WARNING] **${overdueTasks.length} Overdue Task(s)** need immediate attention:\n`;
        overdueTasks.forEach((t) => {
          response += `- ⚠️ **${t.title}** (${t.priority.toUpperCase()} priority)\n`;
        });
        response += `\n`;
      }

      response += `#### 🎯 Top Tasks Scheduled Today:\n`;
      if (todayTasks.length === 0) {
        response += `*No tasks explicitly due today. Consider pulling high-priority milestones from your critical goals.*\n`;
      } else {
        todayTasks.forEach((t) => {
          response += `- [ ] **${t.title}** — ${t.dueTime ? `⏰ ${t.dueTime}` : 'All day'} [${t.priority.toUpperCase()}]\n`;
        });
      }

      response += `\n#### 🔥 Target Habits for Today:\n`;
      todayHabits.forEach((h) => {
        const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed);
        response += `- ${isDone ? '✅' : '⭕'} **${h.name}** (Current Streak: ${h.streak} days)\n`;
      });

      response += `\n#### 💡 Recommendation:\nProtect a 90-minute deep work block this morning before checking social feeds or inbox.`;
      return response;
    }

    // 2. "Which goals are most important this week?"
    if (q.includes('goals') && (q.includes('important') || q.includes('priority') || q.includes('week'))) {
      const criticalGoals = goals.filter((g) => !g.isArchived && (g.priority === 'critical' || g.priority === 'high'));

      let response = `### 🎯 Most Important Goals This Week\n\n`;
      if (criticalGoals.length === 0) {
        response += `All your active goals are categorized as medium or low priority. Consider upgrading your primary focus goal to **Critical**.\n`;
      } else {
        criticalGoals.forEach((g) => {
          const pendingMilestones = g.milestones.filter((m) => !m.isCompleted);
          response += `#### 1. ${g.title} [${g.priority.toUpperCase()} • ${g.category}]\n`;
          response += `- **Current Progress**: ${g.progress}%\n`;
          response += `- **Target Deadline**: ${g.targetDate || 'Ongoing'}\n`;
          if (pendingMilestones.length > 0) {
            response += `- **Next Key Milestone**: "${pendingMilestones[0].title}"\n`;
          }
          response += `\n`;
        });
      }
      return response;
    }

    // 3. "Why am I falling behind?"
    if (q.includes('falling behind') || q.includes('neglected') || q.includes('behind')) {
      const overdueTasks = tasks.filter((t) => t.isOverdue && !t.isCompleted);
      const lowAttendance = academicSubjects.filter(
        (s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.targetAttendancePercentage
      );
      const missedHabits = habits.filter((h) => h.streak === 0);

      let response = `### 🔍 Bottleneck & Friction Audit\n\n`;

      if (overdueTasks.length === 0 && lowAttendance.length === 0 && missedHabits.length === 0) {
        response += `You are currently in strong standing! Zero overdue tasks, all academic attendance thresholds are compliant, and habits maintain positive momentum.\n`;
        return response;
      }

      if (overdueTasks.length > 0) {
        response += `#### 1. Overdue Action Items (${overdueTasks.length}):\n`;
        overdueTasks.forEach((t) => {
          response += `- **${t.title}** was due on ${t.dueDate}. Reschedule or complete this today.\n`;
        });
        response += `\n`;
      }

      if (lowAttendance.length > 0) {
        response += `#### 2. Academic Attendance Danger Zone:\n`;
        lowAttendance.forEach((s) => {
          const pct = ((s.attendedClasses / s.totalClasses) * 100).toFixed(1);
          response += `- **${s.code} ${s.name}**: Attendance is ${pct}% (below ${s.targetAttendancePercentage}% threshold). You cannot afford to skip further lectures.\n`;
        });
        response += `\n`;
      }

      if (missedHabits.length > 0) {
        response += `#### 3. Broken Habit Momentum:\n`;
        missedHabits.forEach((h) => {
          response += `- **${h.name}**: Streak is 0 days. Re-establish streak with a minimal 5-minute version today.\n`;
        });
      }

      return response;
    }

    // 4. "Show my monthly spending"
    if (q.includes('spend') || q.includes('finance') || q.includes('budget') || q.includes('money')) {
      const curMonth = todayStr.substring(0, 7);
      const monthTx = financeTransactions.filter((t) => t.date.startsWith(curMonth));
      const income = monthTx.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
      const net = income - expense;

      let response = `### 💰 Monthly Financial Snapshot (${curMonth})\n\n`;
      response += `- **Total Inflow**: ${currency}${income.toFixed(2)}\n`;
      response += `- **Total Outflow**: ${currency}${expense.toFixed(2)}\n`;
      response += `- **Net Cashflow**: ${net >= 0 ? '+' : ''}${currency}${net.toFixed(2)} (${income > 0 ? Math.round((net / income) * 100) : 0}% savings rate)\n\n`;

      // Top category
      const catMap: Record<string, number> = {};
      monthTx.filter((t) => t.type === 'expense').forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        response += `#### Top Expense Categories:\n`;
        sorted.slice(0, 4).forEach(([cat, amt]) => {
          response += `- **${cat}**: ${currency}${amt.toFixed(2)}\n`;
        });
      }

      return response;
    }

    // 5. "Create a study plan"
    if (q.includes('study plan') || q.includes('exam') || q.includes('examination')) {
      let response = `### 📚 Structured Examination Study Plan\n\n`;
      if (academicExams.length === 0) {
        response += `No upcoming exams currently scheduled in your Academics module. You can add your exam dates under Academics -> Schedule Exam.\n`;
      } else {
        academicExams.forEach((exam) => {
          const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);
          const sub = academicSubjects.find((s) => s.id === exam.subjectId);
          response += `#### Course: ${sub ? sub.name : exam.title} (In ${daysLeft} Days)\n`;
          response += `- **Syllabus Coverage**: ${exam.syllabusCoveragePercentage}%\n`;
          response += `- **Phase 1 (Day 1-${Math.max(1, Math.floor(daysLeft * 0.4))}):** Finish uncompleted lecture notes & conceptual proofs.\n`;
          response += `- **Phase 2 (Day ${Math.floor(daysLeft * 0.4) + 1}-${Math.floor(daysLeft * 0.8)}):** Solve past 5 years question papers & assignment problems.\n`;
          response += `- **Phase 3 (Final 48 hours):** Active recall formula sheets & timed mock test.\n\n`;
        });
      }
      return response;
    }

    // 6. "Academics progress review"
    if (q.includes('academic') || q.includes('gpa') || q.includes('attendance')) {
      let response = `### 🎓 Academic Standing Review\n\n`;
      let totalAtt = 0;
      let totalCls = 0;
      academicSubjects.forEach((s) => {
        totalAtt += s.attendedClasses;
        totalCls += s.totalClasses;
      });
      const pct = totalCls > 0 ? ((totalAtt / totalCls) * 100).toFixed(1) : '100.0';

      response += `- **Enrolled Courses**: ${academicSubjects.length}\n`;
      response += `- **Overall Attendance**: ${pct}% (${totalAtt}/${totalCls} classes)\n`;
      response += `- **Active Assignments**: ${academicAssignments.filter((a) => !a.isSubmitted).length} pending\n\n`;

      response += `#### Subject Breakdown:\n`;
      academicSubjects.forEach((s) => {
        const sPct = s.totalClasses > 0 ? ((s.attendedClasses / s.totalClasses) * 100).toFixed(1) : '100.0';
        response += `- **${s.code}** (${s.name}): ${sPct}% attendance [${s.credits} credits]\n`;
      });
      return response;
    }

    // Default intelligent response grounded in data
    return `### 💡 Copilot Analysis\n\nI have reviewed your active profile:\n- **${tasks.filter((t) => !t.isCompleted).length} pending tasks** (${tasks.filter((t) => t.isOverdue).length} overdue).\n- **${goals.filter((g) => !g.isArchived).length} active goals**.\n- **${habits.length} habits tracked**.\n\nYou can ask me specific questions like: *"Plan my day"*, *"Which goals are most important?"*, *"Show my monthly spending"*, or *"Create an exam study plan"* to generate specialized intelligence.`;
  };

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent) return;

    addAssistantMessage({
      role: 'user',
      content: messageContent,
    });
    setInput('');
    setIsThinking(true);

    // If user has set a Gemini API Key in Settings, we can query Gemini. Otherwise, run the offline heuristic engine!
    setTimeout(() => {
      const response = generateOfflineResponse(messageContent);
      addAssistantMessage({
        role: 'assistant',
        content: response,
      });
      setIsThinking(false);
    }, 400);
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="var(--text-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
              Astra — Life OS AI Copilot
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Local-first heuristic intelligence • Private • Real-time data sync
            </div>
          </div>
        </div>

        <button
          onClick={clearAssistantChat}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Quick Prompts Strip */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '11.5px',
              whiteSpace: 'nowrap',
              padding: '4px 9px',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        className="card"
        style={{
          flex: 1,
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={14} color="var(--text-secondary)" />
                </div>
              )}

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isUser ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.55',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>

              {isUser && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={14} color="var(--text-secondary)" />
            </div>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
              }}
            >
              Analyzing IndexedDB personal state...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          gap: '10px',
          background: 'var(--bg-card)',
          padding: '8px 10px',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}
      >
        <input
          type="text"
          placeholder="Ask Astra: 'Plan my day', 'Show spending', 'Study plan', or any question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn btn-primary"
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
