import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  Check,
  CheckCircle2,
  Cpu,
  Key,
  Mic,
  MicOff,
  Pin,
  PinOff,
  Play,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import useStore from '../store/useStore';
import {
  askRitIntelligence,
  buildRitContext,
  executeRitProposal,
} from '../lib/ritEngine';
import type { RitActionProposal, RitMemoryCategory } from '../types';
import { LiquidGlassSurface } from '../components/LiquidGlassSurface';

const QUICK_PROMPTS = [
  { label: 'Plan my day', query: 'Plan my day based on my real tasks, habits, and deadlines.' },
  { label: 'What matters right now?', query: 'What should I focus on right now?' },
  { label: 'Summarize my week', query: 'Summarize my week across tasks, workouts, finance, and goals.' },
  { label: 'What am I neglecting?', query: 'What have I been neglecting? Audit overdue tasks, habits, and attendance.' },
  { label: 'Exam & assignment plan', query: 'What academic deadlines are approaching and how should I prepare?' },
  { label: 'Analyze my spending', query: 'Analyze my monthly spending and net cashflow.' },
];

export default function AssistantPage() {
  const store = useStore();
  const {
    settings,
    assistantMessages,
    addAssistantMessage,
    updateAssistantMessage,
    clearAssistantChat,
    ritMemories,
    saveRitMemory,
    togglePinRitMemory,
    deleteRitMemory,
    setActiveView,
    addToast,
  } = store;

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [memoryDraft, setMemoryDraft] = useState('');
  const [memoryCategory, setMemoryCategory] = useState<RitMemoryCategory>('preference');
  const [showMemories, setShowMemories] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speechSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }, []);

  const ritCtx = useMemo(() => buildRitContext(store), [store]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [assistantMessages, isThinking]);

  // Pick up any prompt staged by Liquid Glass Command Palette or Dashboard
  useEffect(() => {
    const pendingPrompt = (() => {
      try {
        const pending = sessionStorage.getItem('lifeos_rit_pending_prompt');
        if (pending) sessionStorage.removeItem('lifeos_rit_pending_prompt');
        return pending;
      } catch {
        return null;
      }
    })();
    if (pendingPrompt) {
      void handleSend(pendingPrompt);
    }
  }, []);

  const handleSend = async (customQuery?: string) => {
    const query = (customQuery ?? input).trim();
    if (!query || isThinking) return;

    addAssistantMessage({ role: 'user', content: query });
    if (!customQuery) setInput('');
    setIsThinking(true);

    try {
      const { message } = await askRitIntelligence(query, store);
      addAssistantMessage(message);
    } catch (err) {
      addAssistantMessage({
        role: 'assistant',
        provider: 'local',
        content:
          err instanceof Error
            ? `RIT encountered an issue: ${err.message}`
            : 'RIT encountered an unexpected error.',
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleProposalAction = async (
    messageId: string,
    proposal: RitActionProposal,
    decision: 'execute' | 'dismiss'
  ) => {
    const msg = assistantMessages.find((m) => m.id === messageId);
    if (!msg || !msg.proposedActions) return;

    if (decision === 'dismiss') {
      updateAssistantMessage(messageId, {
        proposedActions: msg.proposedActions.map((p) =>
          p.id === proposal.id ? { ...p, status: 'dismissed' } : p
        ),
      });
      return;
    }

    const result = await executeRitProposal(proposal, store);
    updateAssistantMessage(messageId, {
      proposedActions: msg.proposedActions.map((p) =>
        p.id === proposal.id
          ? {
              ...p,
              status: result.ok ? 'executed' : 'failed',
              executedAt: new Date().toISOString(),
              errorMessage: result.ok ? undefined : result.message,
            }
          : p
      ),
    });

    addToast({
      type: result.ok ? 'success' : 'error',
      title: result.ok ? 'RIT Action Executed' : 'RIT Action Failed',
      message: result.message,
    });
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = memoryDraft.trim();
    if (!content) return;
    await saveRitMemory({
      content,
      category: memoryCategory,
      source: 'user',
      pinned: true,
    });
    setMemoryDraft('');
    addToast({
      type: 'success',
      title: 'Personal Memory Saved',
      message: 'RIT will use this context in future planning.',
    });
  };

  const toggleVoiceInput = () => {
    if (!speechSupported) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const geminiConfigured = Boolean(settings.geminiApiKey?.trim());

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: 'calc(100vh - 110px)',
      }}
    >
      {/* Header Banner */}
      <LiquidGlassSurface style={{ borderRadius: '16px', padding: '16px 20px' }} frost={5}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  RIT Intelligence
                </h1>
                <span className={`badge ${geminiConfigured ? 'badge-success' : 'badge-silver'}`}>
                  {geminiConfigured ? 'Gemini 2.5 Flash + Local Tools' : 'Local Deterministic Engine'}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Harmony, Structure, and Order. Bring your life into rhythm across all Life OS dimensions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowMemories((v) => !v)}
              className={`btn btn-sm ${showMemories ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Brain size={14} />
              Memory ({ritCtx.memories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className="btn btn-secondary btn-sm"
            >
              <Key size={14} />
              {geminiConfigured ? 'API Key Ready' : 'Connect Gemini Key'}
            </button>
            <button
              type="button"
              onClick={clearAssistantChat}
              className="btn btn-ghost btn-sm"
            >
              <Trash2 size={14} />
              Clear Chat
            </button>
          </div>
        </div>
      </LiquidGlassSurface>

      {/* Real-time Life Context Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '10px',
        }}
      >
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Today & Overdue</div>
          <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ritCtx.todayTasks.length} today / {ritCtx.overdueTasks.length} overdue
          </div>
        </div>
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active Goals</div>
          <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ritCtx.activeGoals.length} active
          </div>
        </div>
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Habits Today</div>
          <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ritCtx.completedHabitsTodayCount}/{ritCtx.habits.length} done
          </div>
        </div>
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Academic Queue</div>
          <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ritCtx.upcomingAssignments.length} tasks / {ritCtx.upcomingExams.length} exams
          </div>
        </div>
        <div className="card" style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lifestyle & Memory</div>
          <div className="font-tabular" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ritCtx.lifestyleItems.length} life / {ritCtx.memories.length} mem
          </div>
        </div>
      </div>

      {/* Collapsible Personal Memory Drawer */}
      {showMemories && (
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                RIT Personal Memory
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Stored preferences, routines, constraints, and study goals injected into every planning response.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label="Close memory panel"
              onClick={() => setShowMemories(false)}
            >
              <X size={15} />
            </button>
          </div>

          <form
            onSubmit={handleAddMemory}
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
          >
            <select
              className="input"
              aria-label="Memory category"
              value={memoryCategory}
              onChange={(e) => setMemoryCategory(e.target.value as RitMemoryCategory)}
              style={{ width: '140px' }}
            >
              <option value="preference">Preference</option>
              <option value="routine">Routine</option>
              <option value="goal">Goal Context</option>
              <option value="constraint">Constraint</option>
              <option value="context">General</option>
            </select>
            <input
              type="text"
              className="input"
              placeholder="e.g., I do deep coding best between 7 AM and 11 AM"
              value={memoryDraft}
              onChange={(e) => setMemoryDraft(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={14} />
              Save Memory
            </button>
          </form>

          {ritMemories.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', padding: '6px 0' }}>
              No personal memories saved yet. Add one above or ask RIT "Remember that ...".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ritMemories.map((mem) => (
                <div
                  key={mem.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span className="badge badge-silver">{mem.category}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {mem.content}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label={mem.pinned ? 'Unpin memory' : 'Pin memory'}
                      onClick={() => togglePinRitMemory(mem.id)}
                    >
                      {mem.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label="Delete memory"
                      onClick={() => deleteRitMemory(mem.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Conversation Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '420px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {assistantMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: 'min(760px, 92%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    padding: '12px 15px',
                    borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isUser ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-default)',
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '6px',
                      fontSize: '11px',
                      opacity: isUser ? 0.9 : 0.8,
                      fontWeight: 600,
                    }}
                  >
                    {isUser ? (
                      <span>You</span>
                    ) : (
                      <>
                        <Cpu size={12} />
                        <span>RIT</span>
                        <span>·</span>
                        <span>{msg.provider === 'gemini' ? 'Gemini 2.5 Flash' : 'Local Intelligence'}</span>
                      </>
                    )}
                  </div>
                  {msg.content}
                </div>

                {/* Executable Action Proposals */}
                {!isUser && msg.proposedActions && msg.proposedActions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.proposedActions.map((proposal) => (
                      <div
                        key={proposal.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-medium)',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {proposal.label}
                          </div>
                          {proposal.description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {proposal.description}
                            </div>
                          )}
                          {proposal.errorMessage && (
                            <div style={{ fontSize: '12px', color: 'var(--status-danger)', marginTop: '2px' }}>
                              {proposal.errorMessage}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {proposal.status === 'executed' ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                              Executed
                            </span>
                          ) : proposal.status === 'dismissed' ? (
                            <span className="badge badge-silver">Dismissed</span>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleProposalAction(msg.id, proposal, 'execute')}
                              >
                                <Play size={12} />
                                {proposal.status === 'failed' ? 'Retry Action' : 'Run Action'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleProposalAction(msg.id, proposal, 'dismiss')}
                              >
                                <Check size={12} />
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              RIT is analyzing your real Life OS data...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Prompt Chips */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'var(--bg-subtle)',
          }}
        >
          {QUICK_PROMPTS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleSend(chip.query)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px' }}
              disabled={isThinking}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            className="input"
            aria-label="Message RIT"
            placeholder='Ask RIT anything or issue an action (e.g., "Add task revise DBMS tomorrow 5pm")...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1 }}
            disabled={isThinking}
          />
          {speechSupported && (
            <button
              type="button"
              className={`btn btn-icon ${isListening ? 'btn-danger' : 'btn-secondary'}`}
              onClick={toggleVoiceInput}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              title={isListening ? 'Listening...' : 'Speak to RIT'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || isThinking}
            aria-label="Send to RIT"
          >
            <Send size={15} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
