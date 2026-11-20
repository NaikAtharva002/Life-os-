import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  Flag,
  ArrowRight,
  Target,
} from 'lucide-react';
import type { Task, Priority } from '../types';
import useStore from '../store/useStore';

interface TaskItemProps {
  task: Task;
  onEdit?: (task?: Task) => void;
  onDelete?: (id?: string) => void;
  showGoal?: boolean;
}

const PRIORITY_THEME: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string }
> = {
  critical: {
    label: 'Critical',
    color: 'var(--priority-critical)',
    bg: 'var(--priority-critical-bg)',
    dot: '#ef4444',
  },
  high: {
    label: 'High',
    color: 'var(--priority-high)',
    bg: 'var(--priority-high-bg)',
    dot: '#f97316',
  },
  medium: {
    label: 'Medium',
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
    dot: '#f59e0b',
  },
  low: {
    label: 'Low',
    color: 'var(--priority-low)',
    bg: 'var(--priority-low-bg)',
    dot: '#22c55e',
  },
};

export default function TaskItem({ task, onEdit, onDelete, showGoal = true }: TaskItemProps) {
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const goals = useStore((s) => s.goals);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate || '');
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  const priorityCfg = PRIORITY_THEME[task.priority] || PRIORITY_THEME.medium;
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null;

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      updateTask(task.id, { isCompleted: false, completedAt: undefined });
    } else {
      completeTask(task.id);
    }
  };

  const handlePrioritySelect = (p: Priority) => {
    updateTask(task.id, { priority: p });
    setIsChangingPriority(false);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate) {
      rescheduleTask(task.id, newDate);
      setIsRescheduling(false);
    }
  };

  return (
    <div
      className="card card-sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderLeft: `4px solid ${priorityCfg.color}`,
        background: task.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
        opacity: task.isCompleted ? 0.65 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        {/* Left side: Checkbox + Title + Meta */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
          <button
            onClick={handleToggleComplete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0 0 0',
              color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            {task.isCompleted ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <Circle size={18} color={priorityCfg.color} />
            )}
          </button>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                lineHeight: 1.4,
              }}
            >
              {task.title}
            </div>

            {task.description && !task.isCompleted && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginTop: '2px',
                  lineHeight: 1.3,
                }}
              >
                {task.description}
              </div>
            )}

            {/* Badges row: Date + Goal + Overdue */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '6px',
                fontSize: '11px',
              }}
            >
              {/* Due Date & Time */}
              {task.dueDate && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: task.isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                    fontWeight: task.isOverdue ? 700 : 400,
                  }}
                >
                  <Calendar size={12} />
                  {task.dueDate}
                  {task.dueTime && (
                    <>
                      <Clock size={11} style={{ marginLeft: '2px' }} />
                      {task.dueTime}
                    </>
                  )}
                </span>
              )}

              {/* Overdue alert */}
              {task.isOverdue && !task.isCompleted && (
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: 'var(--danger)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <AlertTriangle size={10} /> OVERDUE
                </span>
              )}

              {/* Rescheduled badge */}
              {task.rescheduled && (
                <span
                  style={{
                    color: 'var(--warning)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Rescheduled
                </span>
              )}

              {/* Linked Goal */}
              {showGoal && linkedGoal && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <Target size={11} color="var(--accent)" />
                  {linkedGoal.title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Priority pill (interactive) + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Priority Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsChangingPriority(!isChangingPriority)}
              className="priority-badge"
              style={{
                background: priorityCfg.bg,
                color: priorityCfg.color,
                border: `1px solid ${priorityCfg.color}30`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title="Click to change task priority"
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: priorityCfg.color,
                }}
              />
              <span>{priorityCfg.label}</span>
            </button>

            {isChangingPriority && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
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
                    onClick={() => handlePrioritySelect(p)}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '4px 8px',
                      fontSize: '11px',
                      color: PRIORITY_THEME[p].color,
                      fontWeight: task.priority === p ? 700 : 500,
                      background:
                        task.priority === p ? PRIORITY_THEME[p].bg : 'transparent',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Reschedule button */}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setIsRescheduling(!isRescheduling)}
            title="Reschedule task"
          >
            <Calendar size={14} />
          </button>

          {/* Edit / Delete */}
          {onEdit && (
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)} title="Edit Task">
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(task.id)}
              title="Delete Task"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Reschedule inline drawer */}
      {isRescheduling && (
        <form
          onSubmit={handleRescheduleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            marginTop: '4px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Reschedule to:
          </span>
          <input
            type="date"
            className="input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Save
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsRescheduling(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
