import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Settings, SlidersHorizontal, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { getSessionNvidiaKey } from '../lib/pwa';
import {
  DEFAULT_NVIDIA_MODEL,
  NVIDIA_MODELS,
  type WorkspaceContextSummary,
} from '../lib/nvidiaModels';
import {
  buildRitMetricsSnapshot,
  buildRitWorkspaceContext,
  detectRitActionIntent,
  generateRitLocalResponse,
  type RitWorkspaceState,
} from '../lib/ritEngine';
import { RitAvatar } from '../components/rit/RitAvatar';
import { LiquidGlassSurface } from '../components/rit/LiquidGlassSurface';
import { RitCommandBar, type RitSuggestionItem } from '../components/rit/RitCommandBar';
import { RitResponseCard } from '../components/rit/RitResponseCard';
import type { RitPendingAction } from '../types';
import '../components/rit/rit-glass.css';

function inferSuggestedViewsForPrompt(query: string): Array<{ viewId: string; label: string }> {
  const q = query.toLowerCase();
  if (q.includes('overdue') || q.includes('task')) {
    return [
      { viewId: 'tasks', label: 'Open Tasks' },
      { viewId: 'dashboard', label: 'Today View' },
    ];
  }
  if (q.includes('goal') || q.includes('milestone')) {
    return [{ viewId: 'goals', label: 'Open Goals' }];
  }
  if (q.includes('consistent') || q.includes('habit') || q.includes('streak')) {
    return [{ viewId: 'habits', label: 'Open Habits' }];
  }
  if (q.includes('spend') || q.includes('finance') || q.includes('budget')) {
    return [{ viewId: 'finance', label: 'Open Finance' }];
  }
  if (q.includes('study') || q.includes('exam') || q.includes('academic')) {
    return [{ viewId: 'academics', label: 'Open Academics' }];
  }
  if (q.includes('gym') || q.includes('workout') || q.includes('fitness')) {
    return [{ viewId: 'fitness', label: 'Open Fitness' }];
  }
  if (q.includes('career') || q.includes('interview') || q.includes('job')) {
    return [{ viewId: 'career', label: 'Open Career' }];
  }
  if (q.includes('productivity') || q.includes('week') || q.includes('overview')) {
    return [
      { viewId: 'analytics', label: 'Open Analytics' },
      { viewId: 'tasks', label: 'Open Tasks' },
    ];
  }
  return [
    { viewId: 'dashboard', label: 'Today View' },
    { viewId: 'focus', label: 'Deep Focus' },
  ];
}

export default function AssistantPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const addToast = useStore((s) => s.addToast);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const financeBudgets = useStore((s) => s.financeBudgets);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const fitnessGoals = useStore((s) => s.fitnessGoals);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const academicExams = useStore((s) => s.academicExams);
  const timetableSlots = useStore((s) => s.timetableSlots);
  const careerProjects = useStore((s) => s.careerProjects);
  const careerApplications = useStore((s) => s.careerApplications);
  const careerSkills = useStore((s) => s.careerSkills);
  const eveningReviews = useStore((s) => s.eveningReviews);

  const messages = useStore((s) => s.assistantMessages);
  const addAssistantMessage = useStore((s) => s.addAssistantMessage);
  const updateAssistantMessage = useStore((s) => s.updateAssistantMessage);
  const clearAssistantChat = useStore((s) => s.clearAssistantChat);
  const setActiveView = useStore((s) => s.setActiveView);

  const addTask = useStore((s) => s.addTask);
  const completeTask = useStore((s) => s.completeTask);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const addGoal = useStore((s) => s.addGoal);
  const addTransaction = useStore((s) => s.addTransaction);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasNvidiaKey, setHasNvidiaKey] = useState(false);
  const [engineBadge, setEngineBadge] = useState('Local Rhythm Engine');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);

  const currency = settings.currencySymbol || '₹';
  const theme: 'dark' | 'light' = settings.theme === 'light' ? 'light' : 'dark';
  const activeModel = settings.nvidiaModel || DEFAULT_NVIDIA_MODEL;
  const userInitial = settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (menuAnchorRef.current && !menuAnchorRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const hasSessionKey = getSessionNvidiaKey().trim().length >= 16;
    fetch('/api/ai/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const configured = Boolean(data?.serverKeyConfigured) || hasSessionKey;
        const modelLabel =
          NVIDIA_MODELS.find((m) => m.id === activeModel)?.label || activeModel;
        setHasNvidiaKey(configured);
        setEngineBadge(configured ? `NVIDIA NIM · ${modelLabel}` : 'Local Rhythm Engine');
      })
      .catch(() => {
        if (!active) return;
        const modelLabel =
          NVIDIA_MODELS.find((m) => m.id === activeModel)?.label || activeModel;
        setHasNvidiaKey(hasSessionKey);
        setEngineBadge(hasSessionKey ? `NVIDIA NIM · ${modelLabel}` : 'Local Rhythm Engine');
      });
    return () => {
      active = false;
    };
  }, [activeModel]);

  const ritState: RitWorkspaceState = useMemo(
    () => ({
      userName: settings.userName || 'Student',
      currency,
      tasks,
      goals,
      habits,
      habitEntries,
      financeTransactions,
      financeBudgets,
      workoutSessions,
      fitnessGoals,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      careerProjects,
      careerApplications,
      careerSkills,
      eveningReviews,
    }),
    [
      settings.userName,
      currency,
      tasks,
      goals,
      habits,
      habitEntries,
      financeTransactions,
      financeBudgets,
      workoutSessions,
      fitnessGoals,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      careerProjects,
      careerApplications,
      careerSkills,
      eveningReviews,
    ]
  );

  const metrics = useMemo(() => buildRitMetricsSnapshot(ritState), [ritState]);
  const workspaceContext: WorkspaceContextSummary = useMemo(
    () => buildRitWorkspaceContext(ritState, metrics),
    [ritState, metrics]
  );

  const suggestions: RitSuggestionItem[] = useMemo(
    () => [
      {
        id: 'plan-day',
        label: 'Plan my day.',
        query: 'Plan my day.',
        meta: `${metrics.todayTasks.length} scheduled`,
      },
      {
        id: 'overdue',
        label: 'What tasks are overdue?',
        query: 'What tasks are overdue?',
        meta: metrics.overdueTasks.length > 0 ? `${metrics.overdueTasks.length} overdue` : 'All clear',
      },
      {
        id: 'add-dsa',
        label: 'Add a task to study DSA at 6 PM.',
        query: 'Add a task to study DSA at 6 PM.',
        meta: 'Action preview',
      },
      {
        id: 'prioritize',
        label: 'What should I prioritize today?',
        query: 'What should I prioritize today?',
        meta: 'Focus rank',
      },
      {
        id: 'week',
        label: 'Summarize my week.',
        query: 'Summarize my week.',
        meta: `${metrics.completedThisWeekCount} done`,
      },
      {
        id: 'goals',
        label: 'Show my upcoming goals.',
        query: 'Show my upcoming goals.',
        meta: `${goals.filter((g) => !g.isArchived).length} active`,
      },
      {
        id: 'consistency',
        label: 'How consistent have I been this month?',
        query: 'How consistent have I been this month?',
        meta: `${metrics.monthlyConsistencyPct}%`,
      },
      {
        id: 'productivity',
        label: 'Give me an overview of my productivity.',
        query: 'Give me an overview of my productivity.',
        meta: `${metrics.productivityScore}% index`,
      },
    ],
    [metrics, goals]
  );

  const handleConfirmAction = async (messageId: string, action: RitPendingAction) => {
    updateAssistantMessage(messageId, {
      pendingAction: { ...action, status: 'executing', errorMessage: undefined },
    });

    try {
      if (action.type === 'create_task') {
        await addTask({
          title: action.title,
          priority: action.priority,
          category: action.category,
          status: 'todo',
          subtasks: [],
          dueDate: action.dueDate,
          dueTime: action.dueTime,
        });
        addToast({
          type: 'success',
          title: 'Task Added via RIT',
          message: `${action.title}${action.dueTime ? ` (${action.dueTime})` : ''} saved.`,
        });
      } else if (action.type === 'complete_task') {
        await completeTask(action.taskId);
        addToast({
          type: 'success',
          title: 'Task Completed',
          message: `"${action.taskTitle}" marked done.`,
        });
      } else if (action.type === 'toggle_habit') {
        await toggleHabitEntry(action.habitId, action.date);
        addToast({
          type: 'success',
          title: 'Habit Logged',
          message: `Updated "${action.habitName}" for ${action.date}.`,
        });
      } else if (action.type === 'create_goal') {
        await addGoal({
          title: action.title,
          priority: action.priority,
          category: action.category,
          targetDate: action.targetDate,
        });
        addToast({
          type: 'success',
          title: 'Goal Established',
          message: `"${action.title}" added to Goals.`,
        });
      } else if (action.type === 'create_transaction') {
        await addTransaction({
          type: action.txType,
          amount: action.amount,
          description: action.description,
          category: action.category,
          date: action.date,
          paymentMethod: 'UPI',
        });
        addToast({
          type: 'success',
          title: 'Finance Recorded',
          message: `${currency}${action.amount.toFixed(2)} saved under ${action.category}.`,
        });
      }

      updateAssistantMessage(messageId, {
        pendingAction: { ...action, status: 'confirmed' },
      });
    } catch {
      updateAssistantMessage(messageId, {
        pendingAction: {
          ...action,
          status: 'error',
          errorMessage: 'Failed to save to local workspace database.',
        },
      });
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not complete the Life OS update. Try again.',
      });
    }
  };

  const handleCancelAction = (messageId: string, action: RitPendingAction) => {
    updateAssistantMessage(messageId, {
      pendingAction: { ...action, status: 'cancelled' },
    });
  };

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend ?? input).trim();
    if (!messageContent || isThinking) return;

    const historyForApi = messages
      .slice(-8)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.slice(0, 4000),
      }));

    addAssistantMessage({
      role: 'user',
      content: messageContent,
    });
    setInput('');
    setIsThinking(true);

    // Check explicit confirmation-gated command intents first
    const actionReply = detectRitActionIntent(messageContent, ritState);
    if (actionReply) {
      addAssistantMessage({
        role: 'assistant',
        content: actionReply.content,
        source: 'local',
        suggestedViews: actionReply.suggestedViews,
        pendingAction: actionReply.pendingAction,
      });
      setIsThinking(false);
      return;
    }

    const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
    const sessionKey = getSessionNvidiaKey();
    let apiNotice: string | undefined;

    if (isOnline && hasNvidiaKey) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (sessionKey) {
          headers['x-nvidia-session-key'] = sessionKey;
        }
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: [...historyForApi, { role: 'user', content: messageContent }],
            model: activeModel,
            workspaceContext,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply?: string; model?: string };
          if (data?.reply) {
            addAssistantMessage({
              role: 'assistant',
              content: data.reply,
              source: 'nvidia-nim',
              modelUsed: data.model || activeModel,
              suggestedViews: inferSuggestedViewsForPrompt(messageContent),
            });
            setIsThinking(false);
            return;
          }
          apiNotice = 'NVIDIA NIM returned an empty response — answered using live local workspace intelligence.';
        } else {
          apiNotice = `NVIDIA NIM returned HTTP ${res.status} — answered using live local workspace intelligence.`;
        }
      } catch {
        apiNotice = 'Could not reach NVIDIA NIM — answered using live local workspace intelligence.';
      }
    }

    const fallbackReply = generateRitLocalResponse(messageContent, ritState);
    addAssistantMessage({
      role: 'assistant',
      content: fallbackReply.content,
      source: 'local',
      notice: apiNotice,
      retryPrompt: apiNotice ? messageContent : undefined,
      suggestedViews: fallbackReply.suggestedViews,
      pendingAction: fallbackReply.pendingAction,
    });
    setIsThinking(false);
  };

  const handleSelectModel = async (modelId: string) => {
    setMenuOpen(false);
    await updateSettings({ nvidiaModel: modelId });
    const label = NVIDIA_MODELS.find((m) => m.id === modelId)?.label || modelId;
    addToast({
      type: 'success',
      title: 'RIT Model Updated',
      message: `Switched active engine to ${label}.`,
    });
  };

  const isFreshConversation = messages.length <= 1;

  return (
    <div className="rit-snapshot-stage">
      {/* Subtle Cosmic & Grid Atmospheric Layer for Real Liquid Glass Refraction */}
      <div className="rit-ambient-backdrop" aria-hidden="true">
        <div className="rit-orb rit-orb-primary" />
        <div className="rit-orb rit-orb-cyan" />
        <div className="rit-orb rit-orb-core" />
        <div className="rit-grid-sheen" />
      </div>

      {/* Floating Header Bar (Liquid Glass) */}
      <header className="rit-header-wrap">
        <LiquidGlassSurface variant="panel" theme={theme} className="rit-header-card">
          <div className="rit-header-inner">
            <div className="rit-identity-cluster">
              <RitAvatar size={38} shape="squircle" thinking={isThinking} />
              <div>
                <div className="rit-brand-title-row">
                  <h1 className="rit-brand-name">RIT</h1>
                  <span className="rit-meaning-pill">Harmony, Structure and Order</span>
                </div>
                <div className="rit-tagline-row">
                  <span>&ldquo;Bring your life into rhythm.&rdquo;</span>
                  <span aria-hidden="true">·</span>
                  <span className="rit-status-chip">
                    <span className={`rit-status-dot ${hasNvidiaKey ? 'is-live' : ''}`} />
                    <span>{engineBadge}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rit-header-controls" ref={menuAnchorRef}>
              <button
                type="button"
                className="rit-glass-btn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <SlidersHorizontal size={12} />
                <span>{hasNvidiaKey ? 'Model' : 'Engine'}</span>
              </button>

              <button
                type="button"
                className="rit-glass-btn rit-glass-btn-danger"
                onClick={() => setConfirmClearOpen(true)}
                aria-label="Clear RIT conversation"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>

              {menuOpen && (
                <div className="rit-menu-popover" role="menu" aria-label="RIT Engine Options">
                  <LiquidGlassSurface variant="menu" theme={theme} className="rit-menu-card">
                    <div className="rit-menu-body">
                      <div className="rit-menu-heading">NVIDIA NIM Model</div>
                      {NVIDIA_MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={activeModel === m.id}
                          className={`rit-menu-option ${activeModel === m.id ? 'is-active' : ''}`}
                          onClick={() => handleSelectModel(m.id)}
                        >
                          <div className="rit-menu-option-title">
                            <span>{m.label}</span>
                            {activeModel === m.id && <Check size={12} />}
                          </div>
                          <span className="rit-menu-option-desc">{m.description}</span>
                        </button>
                      ))}
                      <div className="rit-menu-divider" />
                      <button
                        type="button"
                        role="menuitem"
                        className="rit-menu-option"
                        onClick={() => {
                          setMenuOpen(false);
                          setActiveView('settings');
                        }}
                      >
                        <div className="rit-menu-option-title">
                          <span>Open AI Settings</span>
                          <Settings size={12} />
                        </div>
                        <span className="rit-menu-option-desc">
                          {hasNvidiaKey ? 'Manage session key & preferences' : 'Configure NVIDIA API key'}
                        </span>
                      </button>
                    </div>
                  </LiquidGlassSurface>
                </div>
              )}
            </div>
          </div>
        </LiquidGlassSurface>
      </header>

      {/* Scrollable Chat Canvas */}
      <div className="rit-chat-viewport">
        {isFreshConversation && (
          <section className="rit-hero-overview" aria-label="RIT Productivity Overview">
            <RitAvatar size={56} shape="squircle" thinking={isThinking} />
            <h2 className="rit-hero-title">Bring your life into rhythm.</h2>
            <p className="rit-hero-sub">
              Calm clarity across your tasks, goals, habits, academics, fitness, career, and finances.
            </p>
            <div className="rit-pulse-pills">
              <span className="rit-pulse-pill">{metrics.pendingTasks.length} pending tasks</span>
              {metrics.overdueTasks.length > 0 && (
                <span className="rit-pulse-pill">{metrics.overdueTasks.length} overdue</span>
              )}
              <span className="rit-pulse-pill">
                {metrics.habitsDoneToday}/{metrics.habitsToday.length} habits today
              </span>
              <span className="rit-pulse-pill">{metrics.productivityScore}% productivity</span>
            </div>
            <div className="rit-quick-chips">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="rit-quick-chip"
                  onClick={() => handleSend(s.query)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {messages.map((m) => (
          <RitResponseCard
            key={m.id}
            message={m}
            userInitial={userInitial}
            currency={currency}
            onNavigateView={setActiveView}
            onConfirmAction={handleConfirmAction}
            onCancelAction={handleCancelAction}
            onRetryPrompt={(prompt) => handleSend(prompt)}
          />
        ))}

        {isThinking && (
          <div className="rit-msg-row rit-msg-assistant" role="status" aria-live="polite">
            <div className="rit-msg-avatar">
              <RitAvatar size={30} shape="circle" thinking />
            </div>
            <div className="rit-response-panel rit-thinking-panel">
              <span>RIT is bringing your workspace into rhythm</span>
              <span className="rit-thinking-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Floating Liquid Glass Command / Search Bar */}
      <RitCommandBar
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        isThinking={isThinking}
        suggestions={suggestions}
        theme={theme}
        inputRef={inputRef}
        onVoiceError={(msg) =>
          addToast({
            type: 'warning',
            title: 'Voice Input',
            message: msg,
          })
        }
      />

      {/* Liquid Glass Clear Confirmation Modal */}
      {confirmClearOpen && (
        <div
          className="rit-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rit-clear-title"
          onClick={() => setConfirmClearOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(400px, 100%)' }}>
            <LiquidGlassSurface variant="panel" theme={theme} enableShader={false} className="rit-modal-card">
              <div className="rit-modal-content">
                <h3 id="rit-clear-title" style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  Reset RIT conversation?
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This clears the current chat stream cleanly. Your Tasks, Goals, Habits, and all Life OS data remain untouched.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="rit-cancel-btn"
                    onClick={() => setConfirmClearOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rit-confirm-btn"
                    onClick={() => {
                      clearAssistantChat();
                      setConfirmClearOpen(false);
                    }}
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            </LiquidGlassSurface>
          </div>
        </div>
      )}
    </div>
  );
}
