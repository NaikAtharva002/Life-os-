import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Flame,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  Flag,
} from 'lucide-react';
import type { Goal, Priority } from '../types';
import useStore from '../store/useStore';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal?: Goal) => void;
  onDelete?: (id?: string) => void;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; icon: string }
> = {
  critical: {
    label: 'Critical',
    color: 'var(--priority-critical)',
    bg: 'var(--priority-critical-bg)',
    icon: '🔥',
  },
  high: {
    label: 'High',
    color: 'var(--priority-high)',
    bg: 'var(--priority-high-bg)',
    icon: '⚡',
  },
  medium: {
    label: 'Medium',
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
    icon: '📌',
  },
  low: {
    label: 'Low',
    color: 'var(--priority-low)',
    bg: 'var(--priority-low-bg)',
    icon: '🌱',
  },
};

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
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

  const handleProgressChange = (newProgress: number) => {
    updateGoal(goal.id, { progress: Math.min(100, Math.max(0, newProgress)) });
  };

  // Due date check
  const isOverdue =
    goal.targetDate &&
    new Date(goal.targetDate) < new Date(new Date().toISOString().split('T')[0]) &&
    goal.progress < 100;

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${priorityCfg.color}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow:
          goal.priority === 'critical'
            ? '0 4px 16px rgba(239, 68, 68, 0.08)'
            : '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top row: Priority Badge + Category + Action Menu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Priority Quick-Changer Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsChangingPriority(!isChangingPriority)}
              className="priority-badge"
              style={{
                background: priorityCfg.bg,
                color: priorityCfg.color,
                border: `1px solid ${priorityCfg.color}40`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'transform 0.1s ease',
              }}
              title="Click to change priority anytime"
            >
              <span>{priorityCfg.icon}</span>
              <span>{priorityCfg.label}</span>
              <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
            </button>

            {/* Quick Priority Dropdown */}
            {isChangingPriority && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '120px',
                }}
              >
                {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      color: PRIORITY_CONFIG[p].color,
                      fontWeight: goal.priority === p ? 700 : 500,
                      background:
                        goal.priority === p ? PRIORITY_CONFIG[p].bg : 'transparent',
                    }}
                  >
                    <span>{PRIORITY_CONFIG[p].icon}</span>
                    <span style={{ textTransform: 'capitalize' }}>{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Tag */}
          {goal.category && (
            <span
              className="tag"
              style={{
                fontSize: '11px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '3px 8px',
                borderRadius: '12px',
              }}
            >
              {goal.category}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(goal)}
              title="Edit Goal"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(goal.id)}
              title="Delete Goal"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Goal Title & Description */}
      <div>
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          {goal.title}
        </h3>
        {goal.description && (
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {goal.description}
          </p>
        )}
      </div>

      {/* Target Date */}
      {goal.targetDate && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
            fontWeight: isOverdue ? 600 : 400,
          }}
        >
          <Calendar size={13} />
          <span>Target: {goal.targetDate}</span>
          {isOverdue && (
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              OVERDUE
            </span>
          )}
        </div>
      )}

      {/* Progress Bar & Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Progress</span>
          <span
            style={{
              fontWeight: 700,
              color: goal.progress === 100 ? 'var(--success)' : 'var(--accent)',
            }}
          >
            {goal.progress}%
          </span>
        </div>

        <div className="progress-bar" style={{ height: '7px', background: 'var(--bg-hover)' }}>
          <div
            className="progress-fill"
            style={{
              width: `${goal.progress}%`,
              background:
                goal.progress === 100
                  ? 'var(--success)'
                  : goal.priority === 'critical'
                  ? 'var(--priority-critical)'
                  : 'var(--accent)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Quick Slider Adjustment */}
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={goal.progress}
          onChange={(e) => handleProgressChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            accentColor: 'var(--accent)',
            cursor: 'pointer',
            opacity: 0.6,
          }}
          title="Drag to update progress"
        />
      </div>

      {/* Milestones toggle */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--text-secondary)' }}
          >
            {goal.milestones.length > 0 ? (
              <span>
                {goal.milestones.filter((m) => m.isCompleted).length} /{' '}
                {goal.milestones.length} Milestones{' '}
                {showMilestones ? '▲' : '▼'}
              </span>
            ) : (
              <span>+ Add Milestones</span>
            )}
          </button>
        </div>

        {showMilestones && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {goal.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: m.isCompleted ? 'line-through' : 'none',
                  padding: '3px 0',
                }}
              >
                {m.isCompleted ? (
                  <CheckCircle2 size={14} color="var(--success)" />
                ) : (
                  <Circle size={14} color="var(--border-light)" />
                )}
                <span>{m.title}</span>
              </div>
            ))}

            <form
              onSubmit={handleAddMilestone}
              style={{ display: 'flex', gap: '6px', marginTop: '4px' }}
            >
              <input
                type="text"
                placeholder="New milestone..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                className="input"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <Plus size={12} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
