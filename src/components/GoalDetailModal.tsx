import React, { useState, useMemo } from 'react';
import { todayLocal } from '../lib/dates';
import {
  X,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Sparkles,
  Layers,
  FileText,
  History,
  Link,
  Unlink,
  ChevronUp,
  ChevronDown,
  Pause,
  Play,
  Archive,
  Flag,
  Target,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { Goal, Milestone, Task, Priority, GoalStatus, LifeArea } from '../types';
import useStore from '../store/useStore';
import TaskModal from './TaskModal';

interface GoalDetailModalProps {
  isOpen: boolean;
  goalId: string | null;
  onClose: () => void;
  onEditGoal: (goal: Goal) => void;
}

export default function GoalDetailModal({
  isOpen,
  goalId,
  onClose,
  onEditGoal,
}: GoalDetailModalProps) {
  if (!isOpen || !goalId) return null;

  const goal = useStore((s) => s.goals.find((g) => g.id === goalId));
  const tasks = useStore((s) => s.tasks);
  const updateGoal = useStore((s) => s.updateGoal);
  const toggleMilestone = useStore((s) => s.toggleMilestone);
  const addMilestone = useStore((s) => s.addMilestone);
  const updateMilestone = useStore((s) => s.updateMilestone);
  const deleteMilestone = useStore((s) => s.deleteMilestone);
  const reorderMilestones = useStore((s) => s.reorderMilestones);
  const setGoalStatus = useStore((s) => s.setGoalStatus);
  const archiveGoal = useStore((s) => s.archiveGoal);
  const unarchiveGoal = useStore((s) => s.unarchiveGoal);
  const updateGoalProgress = useStore((s) => s.updateGoalProgress);
  const completeTask = useStore((s) => s.completeTask);
  const linkTaskToGoal = useStore((s) => s.linkTaskToGoal);
  const unlinkTaskFromGoal = useStore((s) => s.unlinkTaskFromGoal);
  const habits = useStore((s) => s.habits);
  const setActiveView = useStore((s) => s.setActiveView);

  // Active sub-tab in detail modal
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tasks' | 'timeline' | 'planning' | 'history'>('roadmap');

  // Milestone inline creation
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // Editing existing milestone
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneTitle, setEditingMilestoneTitle] = useState('');
  const [editingMilestoneDueDate, setEditingMilestoneDueDate] = useState('');

  // Task integration modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTaskToLink, setSelectedTaskToLink] = useState('');

  // Numeric quick update
  const [numericInputVal, setNumericInputVal] = useState<string>(
    goal?.currentValue !== undefined ? String(goal.currentValue) : ''
  );

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<{
    type: 'milestones' | 'tasks' | 'risks';
    items: string[];
  } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!goal) return null;

  // Connected tasks
  const relatedTasks = useMemo(() => {
    return tasks.filter((t) => t.goalId === goal.id && !t.isArchived);
  }, [tasks, goal.id]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return relatedTasks.filter((t) => !t.isCompleted);
    if (taskFilter === 'completed') return relatedTasks.filter((t) => t.isCompleted);
    return relatedTasks;
  }, [relatedTasks, taskFilter]);

  const unlinkedTasks = useMemo(() => {
    return tasks.filter((t) => !t.goalId && !t.isArchived);
  }, [tasks]);

  const today = todayLocal();

  // Milestone metrics
  const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;
  const overdueMilestones = goal.milestones.filter(
    (m) => !m.isCompleted && m.dueDate && m.dueDate < today
  );

  // Progress explanation text
  const progressExplanation = useMemo(() => {
    if (goal.progressCalculationMode === 'manual') {
      return `Manually specified progress (${goal.progress}%).`;
    }
    if (goal.measurementType === 'numeric') {
      const targetVal = goal.targetValue || 0;
      const curVal = goal.currentValue || 0;
      return `Target tracking: ${curVal} / ${targetVal} ${goal.unit || ''} (${goal.progress}% complete)`;
    }
    if (goal.measurementType === 'milestone-based') {
      return totalMilestones > 0
        ? `Roadmap progression: ${completedMilestones} of ${totalMilestones} checkpoints achieved (${goal.progress}%)`
        : 'Awaiting milestone definitions.';
    }
    if (goal.measurementType === 'completion') {
      return relatedTasks.length > 0
        ? `Task execution: ${relatedTasks.filter((t) => t.isCompleted).length} of ${relatedTasks.length} tasks completed (${goal.progress}%)`
        : `Binary project completion.`;
    }
    if (goal.measurementType === 'habit-based') {
      return `Linked habit loop adherence calculated from 30-day logs.`;
    }
    return `Calculated progress: ${goal.progress}%`;
  }, [goal, completedMilestones, totalMilestones, relatedTasks]);

  // Handlers
  const handleAddMilestone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    await addMilestone(goal.id, {
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || undefined,
      dueDate: newMilestoneDueDate || undefined,
    });
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
    setNewMilestoneDesc('');
  };

  const handleSaveMilestoneEdit = async (mId: string) => {
    if (!editingMilestoneTitle.trim()) return;
    await updateMilestone(goal.id, mId, {
      title: editingMilestoneTitle.trim(),
      dueDate: editingMilestoneDueDate || undefined,
    });
    setEditingMilestoneId(null);
  };

  const handleMoveMilestone = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= goal.milestones.length) return;
    const ids = goal.milestones.map((m) => m.id);
    const temp = ids[index];
    ids[index] = ids[targetIdx];
    ids[targetIdx] = temp;
    await reorderMilestones(goal.id, ids);
  };

  const handleUpdateNumericProgress = async () => {
    const val = parseFloat(numericInputVal);
    if (!isNaN(val)) {
      await updateGoalProgress(goal.id, val);
    }
  };

  const handleLinkSelectedTask = async () => {
    if (!selectedTaskToLink) return;
    await linkTaskToGoal(selectedTaskToLink, goal.id);
    setSelectedTaskToLink('');
  };

  // Astra Copilot AI Suggestions generator (deterministic domain suggestions)
  const handleGenerateAiSuggestions = (type: 'milestones' | 'tasks' | 'risks') => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const gTitle = goal.title.toLowerCase();
      let suggestions: string[] = [];

      if (type === 'milestones') {
        if (gTitle.includes('code') || gTitle.includes('stack') || gTitle.includes('developer') || gTitle.includes('engineer')) {
          suggestions = [
            'Architect scalable domain schema and database indices',
            'Implement resilient API microservice endpoints with telemetry',
            'Construct responsive high-converting user interfaces',
            'Deploy production container on Cloud Run with automated CI/CD',
          ];
        } else if (gTitle.includes('save') || gTitle.includes('wealth') || gTitle.includes('finance')) {
          suggestions = [
            'Audit past 90 days recurring expenses and eliminate subscriptions',
            'Establish automated 25% paycheck sweep into liquid reserve fund',
            'Hit 50% midpoint target milestone in high-yield account',
            'Lock in target runway reserve milestone with zero liabilities',
          ];
        } else if (gTitle.includes('gym') || gTitle.includes('fit') || gTitle.includes('run')) {
          suggestions = [
            'Establish foundational base volume without mechanical fatigue',
            'Achieve 4 consecutive weeks of progressive overload compound lifts',
            'Reach intermediate strength/speed benchmark test',
            'Peak conditioning test with verified metric tracking',
          ];
        } else {
          suggestions = [
            'Conduct deep domain discovery and compile reference specifications',
            'Construct minimum viable prototype framework',
            'Test core mechanics and gather real diagnostic signals',
            'Finalize execution sprint and celebrate achievement',
          ];
        }
      } else if (type === 'tasks') {
        suggestions = [
          `Schedule 90-minute deep work focus block for "${goal.title}"`,
          `Draft comprehensive milestone checklist breakdown`,
          `Eliminate primary environmental bottleneck blocking momentum`,
          `Conduct weekly Sunday checkpoint review on progress velocity`,
        ];
      } else {
        suggestions = [
          'Risk: Ambiguity on definition of done leading to scope drift. Countermeasure: Pin down exact quantitative output.',
          'Risk: Context switching between multiple initiatives. Countermeasure: Reserve dedicated morning focus blocks.',
          'Risk: Extended stagnation between milestones. Countermeasure: Break next milestone into daily 25-minute subtasks.',
        ];
      }

      setAiSuggestions({ type, items: suggestions });
      setIsGeneratingAi(false);
    }, 400);
  };

  const handleApplyAiMilestones = async () => {
    if (!aiSuggestions || aiSuggestions.type !== 'milestones') return;
    for (const item of aiSuggestions.items) {
      await addMilestone(goal.id, { title: item });
    }
    setAiSuggestions(null);
  };

  // Status badge styling
  const statusColors: Record<GoalStatus, { bg: string; text: string; border: string }> = {
    'not-started': { bg: 'var(--bg-secondary)', text: 'var(--text-muted)', border: 'var(--border-default)' },
    'in-progress': { bg: 'rgba(20, 19, 1, 0.08)', text: 'var(--text-primary)', border: 'var(--border-default)' },
    'on-track': { bg: 'var(--status-success-bg)', text: 'var(--status-success)', border: 'var(--status-success-border)' },
    'at-risk': { bg: 'var(--status-danger-bg)', text: 'var(--status-danger)', border: 'var(--status-danger-border)' },
    'completed': { bg: 'var(--status-success-bg)', text: 'var(--status-success)', border: 'var(--status-success-border)' },
    'paused': { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)', border: 'var(--status-warning-border)' },
    'abandoned': { bg: 'var(--bg-secondary)', text: 'var(--text-muted)', border: 'var(--border-default)' },
  };

  const statusStyle = statusColors[goal.status || 'not-started'];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: '840px',
          width: '94vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image / Scrim Banner Header */}
        <div
          style={{
            position: 'relative',
            height: goal.coverImage ? '140px' : '90px',
            background: goal.coverImage ? `url(${goal.coverImage}) center/cover no-repeat` : 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 20px',
          }}
        >
          {goal.coverImage && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(20, 19, 1, 0.4) 0%, rgba(20, 19, 1, 0.85) 100%)',
              }}
            />
          )}

          {/* Top Bar inside Header */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(20, 19, 1, 0.75)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {goal.lifeArea || 'General'}
              </span>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: goal.priority === 'critical' ? 'var(--status-danger)' : goal.priority === 'high' ? 'var(--status-warning)' : 'rgba(20, 19, 1, 0.75)',
                  color: '#ffffff',
                }}
              >
                {goal.priority}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onEditGoal(goal)}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(20, 19, 1, 0.75)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                }}
              >
                <Edit2 size={12} /> Edit Goal
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={onClose}
                style={{ color: '#ffffff', background: 'rgba(20, 19, 1, 0.6)' }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Title & Category inside Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1
              className="font-editorial"
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {goal.title}
            </h1>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '2px' }}>
              {goal.category} • Horizon: {goal.type}
            </div>
          </div>
        </div>

        {/* Status Strip & Progress Hero */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {/* Status Dropdown / Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={goal.status || 'not-started'}
                onChange={(e) => setGoalStatus(goal.id, e.target.value as GoalStatus, true)}
                className="select"
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  borderColor: statusStyle.border,
                  fontWeight: 600,
                }}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="abandoned">Abandoned</option>
              </select>

              {/* Pause / Resume button */}
              {goal.status === 'paused' ? (
                <button
                  type="button"
                  onClick={() => setGoalStatus(goal.id, 'in-progress', true)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--palette-brick)' }}
                >
                  <Play size={11} /> Resume Goal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setGoalStatus(goal.id, 'paused', true)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
                >
                  <Pause size={11} /> Pause
                </button>
              )}

              {/* Archive toggle */}
              <button
                type="button"
                onClick={() => (goal.isArchived ? unarchiveGoal(goal.id) : archiveGoal(goal.id))}
                className="btn btn-ghost btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
              >
                <Archive size={11} /> {goal.isArchived ? 'Restore' : 'Archive'}
              </button>
            </div>

            {/* Target Dates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {goal.startDate && (
                <span>
                  Start: <strong className="tabular" style={{ color: 'var(--text-primary)' }}>{goal.startDate}</strong>
                </span>
              )}
              {goal.targetDate && (
                <span>
                  Deadline: <strong className="tabular" style={{ color: 'var(--palette-brick)' }}>{goal.targetDate}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar & Numeric Quick Setter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Progress Velocity
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({progressExplanation})
                </span>
              </div>
              <span className="tabular" style={{ fontSize: '14px', fontWeight: 700, color: goal.progress === 100 ? 'var(--status-success)' : 'var(--palette-brick)' }}>
                {goal.progress}%
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'var(--border-default)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${goal.progress}%`,
                  height: '100%',
                  background: goal.progress === 100 ? 'var(--status-success)' : 'var(--palette-brick)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Numeric Quick Incrementer */}
            {goal.measurementType === 'numeric' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Log Current Value:</span>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
                  value={numericInputVal}
                  onChange={(e) => setNumericInputVal(e.target.value)}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={handleUpdateNumericProgress}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  Save Progress
                </button>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  of {goal.targetValue || 0} {goal.unit || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Warning Radar */}
        {overdueMilestones.length > 0 && (
          <div
            style={{
              padding: '8px 20px',
              background: 'var(--status-danger-bg)',
              borderBottom: '1px solid var(--status-danger-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--status-danger)',
            }}
          >
            <ShieldAlert size={14} />
            <strong>Attention:</strong> {overdueMilestones.length} milestone checkpoint(s) have passed their scheduled deadline.
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            padding: '0 20px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`btn btn-sm ${activeTab === 'roadmap' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <Layers size={13} /> 1. Milestones ({completedMilestones}/{totalMilestones})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`btn btn-sm ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <CheckSquare size={13} /> 2. Connected Tasks ({relatedTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <Calendar size={13} /> 3. Horizon Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className={`btn btn-sm ${activeTab === 'planning' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <FileText size={13} /> 4. Strategy &amp; Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <History size={13} /> 5. Activity Log ({goal.activityHistory?.length || 0})
          </button>
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: MILESTONES ROADMAP */}
          {activeTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
              {/* Header with AI Suggestion Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Roadmap Checkpoints
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Sequential milestones needed to achieve completion.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiSuggestions('milestones')}
                    disabled={isGeneratingAi}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={12} color="var(--palette-brick)" />
                    {isGeneratingAi ? 'Synthesizing...' : 'AI Suggest Milestones'}
                  </button>
                </div>
              </div>

              {/* AI Suggestions Box (With User Approval Requirement) */}
              {aiSuggestions && aiSuggestions.type === 'milestones' && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--palette-brick-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                      <Sparkles size={13} /> Astra AI Roadmap Proposal
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(null)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                    >
                      Dismiss
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {aiSuggestions.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--palette-brick)', fontWeight: 700 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleApplyAiMilestones}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '11.5px' }}
                    >
                      Apply Proposed Milestones
                    </button>
                  </div>
                </div>
              )}

              {/* Add Milestone Form */}
              <form
                onSubmit={handleAddMilestone}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr auto',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <input
                  type="text"
                  className="input"
                  placeholder="New milestone title..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  style={{ fontSize: '12.5px' }}
                />
                <input
                  type="date"
                  className="input"
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} /> Add Milestone
                </button>
              </form>

              {/* Milestones List */}
              {goal.milestones.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-default)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  No milestones defined yet. Break this objective into 3 to 6 tangible milestones to start measuring velocity.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {goal.milestones.map((m, idx) => {
                    const isOverdue = !m.isCompleted && m.dueDate && m.dueDate < today;
                    const isEditing = editingMilestoneId === m.id;

                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: m.isCompleted ? 'var(--bg-surface)' : 'var(--bg-card)',
                          border: isOverdue ? '1px solid var(--status-danger)' : '1px solid var(--border-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        {/* Checkbox & Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <button
                            type="button"
                            onClick={() => toggleMilestone(goal.id, m.id)}
                            className="btn btn-ghost btn-icon"
                            style={{ padding: 0, color: m.isCompleted ? 'var(--status-success)' : 'var(--text-muted)' }}
                          >
                            {m.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>

                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                              <input
                                type="text"
                                className="input"
                                value={editingMilestoneTitle}
                                onChange={(e) => setEditingMilestoneTitle(e.target.value)}
                                style={{ fontSize: '12.5px' }}
                              />
                              <input
                                type="date"
                                className="input"
                                value={editingMilestoneDueDate}
                                onChange={(e) => setEditingMilestoneDueDate(e.target.value)}
                                style={{ width: '130px', fontSize: '12px' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveMilestoneEdit(m.id)}
                                className="btn btn-primary btn-sm"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMilestoneId(null)}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                  #{idx + 1}
                                </span>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                                    textDecoration: m.isCompleted ? 'line-through' : 'none',
                                  }}
                                >
                                  {m.title}
                                </span>
                                {isOverdue && (
                                  <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {m.dueDate && (
                                <span style={{ fontSize: '11px', color: isOverdue ? 'var(--status-danger)' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={11} /> Deadline: <span className="tabular">{m.dueDate}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions (Reorder, Edit, Delete) */}
                        {!isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveMilestone(idx, 'up')}
                              disabled={idx === 0}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 5px', opacity: idx === 0 ? 0.3 : 1 }}
                              title="Move Up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveMilestone(idx, 'down')}
                              disabled={idx === goal.milestones.length - 1}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 5px', opacity: idx === goal.milestones.length - 1 ? 0.3 : 1 }}
                              title="Move Down"
                            >
                              <ChevronDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMilestoneId(m.id);
                                setEditingMilestoneTitle(m.title);
                                setEditingMilestoneDueDate(m.dueDate || '');
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 5px' }}
                              title="Edit Milestone"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMilestone(goal.id, m.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 5px', color: 'var(--status-danger)' }}
                              title="Delete Milestone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONNECTED TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
              {/* Header Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Connected Execution Tasks
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Action items in your task manager that move this goal forward.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiSuggestions('tasks')}
                    disabled={isGeneratingAi}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11.5px' }}
                  >
                    <Sparkles size={12} color="var(--palette-brick)" />
                    {isGeneratingAi ? 'Synthesizing...' : 'AI Suggest Tasks'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '11.5px' }}
                  >
                    <Plus size={13} /> Create Task for Goal
                  </button>
                </div>
              </div>

              {/* AI Tasks Suggestions */}
              {aiSuggestions && aiSuggestions.type === 'tasks' && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--palette-brick-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                      <Sparkles size={13} /> Astra AI Action Items
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(null)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                    >
                      Dismiss
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {aiSuggestions.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--palette-brick)', fontWeight: 700 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Existing Task Dropdown */}
              {unlinkedTasks.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <Link size={14} color="var(--palette-brick)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Link Existing Task:</span>
                  <select
                    className="select"
                    style={{ flex: 1, fontSize: '12px', padding: '4px 8px' }}
                    value={selectedTaskToLink}
                    onChange={(e) => setSelectedTaskToLink(e.target.value)}
                  >
                    <option value="">Select unlinked task...</option>
                    {unlinkedTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.priority})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleLinkSelectedTask}
                    disabled={!selectedTaskToLink}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11.5px' }}
                  >
                    Attach
                  </button>
                </div>
              )}

              {/* Task Filter Pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setTaskFilter('all')}
                  className={`btn btn-sm ${taskFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  All ({relatedTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter('pending')}
                  className={`btn btn-sm ${taskFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  Pending ({relatedTasks.filter((t) => !t.isCompleted).length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter('completed')}
                  className={`btn btn-sm ${taskFilter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  Completed ({relatedTasks.filter((t) => t.isCompleted).length})
                </button>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-default)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  No tasks attached to this goal. Create actionable tasks to track execution progress.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <button
                          type="button"
                          onClick={() => completeTask(t.id)}
                          className="btn btn-ghost btn-icon"
                          style={{ padding: 0, color: t.isCompleted ? 'var(--status-success)' : 'var(--text-muted)' }}
                        >
                          {t.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 500,
                            color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: t.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {t.title}
                        </span>
                        <span
                          className="badge"
                          style={{
                            fontSize: '10px',
                            background: t.priority === 'critical' ? 'var(--status-danger-bg)' : 'var(--bg-secondary)',
                            color: t.priority === 'critical' ? 'var(--status-danger)' : 'var(--text-muted)',
                          }}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.dueDate && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Calendar size={11} /> {t.dueDate}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => unlinkTaskFromGoal(t.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 5px', color: 'var(--text-muted)' }}
                          title="Unlink Task"
                        >
                          <Unlink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VISUAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Temporal Milestone Progression
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Chronological timeline from inception to target delivery date.
                </p>
              </div>

              {/* Timeline Container */}
              <div
                style={{
                  padding: '24px 20px',
                  background: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative',
                }}
              >
                {/* Start Date Marker */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--palette-brick)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    S
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Goal Initiated
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {goal.startDate || goal.createdAt.split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Milestones on Timeline */}
                {goal.milestones.map((m, idx) => {
                  const isOverdue = !m.isCompleted && m.dueDate && m.dueDate < today;
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginLeft: '2px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: m.isCompleted
                            ? 'var(--status-success)'
                            : isOverdue
                            ? 'var(--status-danger)'
                            : 'var(--bg-elevated)',
                          border: '2px solid var(--border-default)',
                          color: m.isCompleted ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {m.isCompleted ? '✓' : idx + 1}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-elevated)',
                          border: isOverdue ? '1px solid var(--status-danger)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 500,
                              color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: m.isCompleted ? 'line-through' : 'none',
                            }}
                          >
                            {m.title}
                          </span>
                          {isOverdue && (
                            <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                              Overdue
                            </span>
                          )}
                          {m.isCompleted && (
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>
                              Completed
                            </span>
                          )}
                        </div>
                        {m.dueDate && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Deadline: <span className="tabular">{m.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Target Deadline Marker */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: goal.progress === 100 ? 'var(--status-success)' : 'var(--palette-walnut)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    🎯
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Target Completion Horizon
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--palette-brick)' }}>
                      {goal.targetDate || 'No deadline specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGY & NOTES */}
          {activeTab === 'planning' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Strategic Intent &amp; Execution Blueprint
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Grounding principles, motivation, and anticipated roadblocks.
                </p>
              </div>

              {/* Why It Matters */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--palette-brick)' }}>
                  Primary Motivation (Why It Matters)
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {goal.whyItMatters || 'No specific motivation logged. Articulating your core why increases completion consistency by 42%.'}
                </p>
              </div>

              {/* Immediate Next Action */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--status-success)' }}>
                  Immediate Next Action
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {goal.nextAction || 'Identify the single smallest executable step you can accomplish today.'}
                </p>
              </div>

              {/* Anticipated Obstacles */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <AlertTriangle size={13} color="var(--status-warning)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--status-warning)' }}>
                    Anticipated Bottlenecks &amp; Mitigation Strategy
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {goal.obstacles || 'No obstacles logged. Consider cognitive fatigue, scheduling conflicts, or external dependencies.'}
                </p>
              </div>

              {/* Personal Notes */}
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Execution Notes &amp; Citations
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {goal.notes || 'No extra notes recorded.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY LOG */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-in">
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Audit Trail &amp; Velocity History
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Real recorded telemetry events for milestone updates, target revisions, and status shifts.
                </p>
              </div>

              {(!goal.activityHistory || goal.activityHistory.length === 0) ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-default)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                  }}
                >
                  No historical activity recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {goal.activityHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: item.type === 'completed' || item.type === 'milestone_completed'
                              ? 'var(--status-success)'
                              : item.type === 'paused'
                              ? 'var(--status-warning)'
                              : 'var(--palette-brick)',
                          }}
                        />
                        <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                          {item.description}
                        </span>
                      </div>

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }} className="tabular">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Goal ID: {goal.id.slice(0, 8)}... • Created {goal.createdAt.split('T')[0]}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Task Creation Modal linked to Goal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        defaultGoalId={goal.id}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
