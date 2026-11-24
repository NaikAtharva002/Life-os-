import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import type { Goal, Priority } from '../types';
import useStore from '../store/useStore';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal?: Goal) => void;
  onDelete?: (id?: string) => void;
  onOpenDetails?: (goal: Goal) => void;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  critical: {
    label: 'Critical',
    color: 'var(--priority-critical)',
    bg: 'var(--priority-critical-bg)',
  },
  high: {
    label: 'High',
    color: 'var(--priority-high)',
    bg: 'var(--priority-high-bg)',
  },
  medium: {
    label: 'Medium',
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
  },
  low: {
    label: 'Low',
    color: 'var(--priority-low)',
    bg: 'var(--priority-low-bg)',
  },
};

export default function GoalCard({ goal, onEdit, onDelete, onOpenDetails }: GoalCardProps) {
  const updateGoal = useStore((s) => s.updateGoal);
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  const priorityCfg = PRIORITY_CONFIG[goal.priority] || PRIORITY_CONFIG.medium;

  const handlePriorityChange = (newPriority: Priority) => {
    updateGoal(goal.id, { priority: newPriority });
    setIsChangingPriority(false);
  };

  const handleToggleMilestone = (mId: string) => {
    const updated = goal.milestones.map((m) =>
      m.id === mId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    const completedCount = updated.filter((m) => m.isCompleted).length;
    const progress =
      updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : goal.progress;

    updateGoal(goal.id, { milestones: updated, progress });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: newMilestoneTitle.trim(),
      isCompleted: false,
    };
    const updated = [...goal.milestones, newM];
    const completedCount = updated.filter((m) => m.isCompleted).length;
    const progress = Math.round((completedCount / updated.length) * 100);

    updateGoal(goal.id, { milestones: updated, progress });
    setNewMilestoneTitle('');
  };

  const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
  const isDelayed =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date() &&
    goal.progress < 100;

  return (
    <div
      style={{
        padding: '12px 14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        transition: 'border-color 0.12s ease',
      }}
    >
      {/* Top row: Priority Pill + Category + Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Priority Quick-Changer Pill (Restrained, no emoji) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsChangingPriority(!isChangingPriority)}
              style={{
                background: priorityCfg.bg,
                color: priorityCfg.color,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '10.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
              title="Click to change priority"
            >
              <span>{priorityCfg.label}</span>
              <span style={{ fontSize: '8px', opacity: 0.7 }}>▾</span>
            </button>

            {isChangingPriority && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  zIndex: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '100px',
                }}
              >
                {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: PRIORITY_CONFIG[p].color,
                      fontWeight: goal.priority === p ? 600 : 400,
                    }}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {goal.category && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-primary)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
              }}
            >
              {goal.category}
            </span>
          )}

          {isDelayed && (
            <span
              style={{
                fontSize: '10.5px',
                color: 'var(--danger)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <AlertCircle size={11} /> Delayed
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(goal)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px', color: 'var(--palette-brick)' }}
              title="Inspect roadmap & details"
            >
              <TrendingUp size={12} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px', color: 'var(--text-muted)' }}
              title="Edit goal"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px', color: 'var(--text-muted)' }}
              title="Delete goal"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Goal Title */}
      <div>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {goal.title}
        </div>
        {goal.description && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {goal.description}
          </div>
        )}
      </div>

      {/* Progress Track (Hairline, solid) */}
      <div style={{ marginTop: '2px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}
        >
          <span className="tabular">{goal.progress}% complete</span>
          {goal.targetDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }} className="tabular">
              <Calendar size={11} /> {goal.targetDate}
            </span>
          )}
        </div>

        <div className="progress-track">
          <div
            className="progress-thumb"
            style={{
              width: `${goal.progress}%`,
              background:
                goal.progress === 100
                  ? 'var(--success)'
                  : goal.priority === 'critical'
                  ? 'var(--priority-critical)'
                  : 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Milestones toggle & list */}
      {goal.milestones.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0', fontSize: '11px', color: 'var(--text-muted)' }}
          >
            {showMilestones ? 'Hide milestones' : `Show milestones (${completedMilestones}/${goal.milestones.length})`}
          </button>

          {showMilestones && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', paddingLeft: '4px' }}>
              {goal.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: m.isCompleted ? 'line-through' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2
                    size={13}
                    color={m.isCompleted ? 'var(--success)' : 'var(--text-muted)'}
                  />
                  <span>{m.title}</span>
                </div>
              ))}

              <form onSubmit={handleAddMilestone} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Add milestone..."
                  className="input"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  style={{ padding: '3px 6px', fontSize: '11px' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px' }}>
                  <Plus size={11} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
