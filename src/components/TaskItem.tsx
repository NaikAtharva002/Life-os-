import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
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

export default function TaskItem({ task, onEdit, onDelete, showGoal = true }: TaskItemProps) {
  const completeTask = useStore((s) => s.completeTask);
  const updateTask = useStore((s) => s.updateTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const goals = useStore((s) => s.goals);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate || '');

  const priorityCfg = PRIORITY_THEME[task.priority] || PRIORITY_THEME.medium;
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null;

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      updateTask(task.id, { isCompleted: false, completedAt: undefined });
    } else {
      completeTask(task.id);
    }
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '9px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${priorityCfg.color}`,
        background: task.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
        opacity: task.isCompleted ? 0.6 : 1,
        transition: 'all 0.1s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Checkbox + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
          <button
            onClick={handleToggleComplete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '1px 0 0 0',
              color: task.isCompleted ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            {task.isCompleted ? (
              <CheckCircle2 size={16} color="var(--success)" />
            ) : (
              <Circle size={16} color="var(--border-focus)" />
            )}
          </button>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                lineHeight: 1.35,
              }}
            >
              {task.title}
            </div>

            {task.description && !task.isCompleted && (
              <div
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  marginTop: '2px',
                  lineHeight: 1.3,
                }}
              >
                {task.description}
              </div>
            )}

            {/* Meta row: Due Date + Overdue + Goal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '4px',
                fontSize: '11px',
              }}
            >
              {task.dueDate && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: task.isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                    fontWeight: task.isOverdue ? 600 : 400,
                  }}
                  className="tabular"
                >
                  <Calendar size={11} />
                  {task.dueDate}
                  {task.dueTime && (
                    <>
                      <Clock size={10} style={{ marginLeft: '1px' }} />
                      {task.dueTime}
                    </>
                  )}
                </span>
              )}

              {task.isOverdue && !task.isCompleted && (
                <span
                  style={{
                    color: 'var(--danger)',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <AlertTriangle size={10} /> Overdue
                </span>
              )}

              {showGoal && linkedGoal && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Target size={10} /> {linkedGoal.title.substring(0, 18)}
                </span>
              )}

              {task.category && (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-primary)',
                    padding: '0 4px',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {task.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={() => setIsRescheduling(!isRescheduling)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '3px', color: 'var(--text-muted)' }}
            title="Reschedule task"
          >
            <Clock size={12} />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px', color: 'var(--text-muted)' }}
              title="Edit task"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '3px', color: 'var(--text-muted)' }}
              title="Delete task"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Reschedule inline row */}
      {isRescheduling && (
        <form
          onSubmit={handleRescheduleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            paddingTop: '6px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <input
            type="date"
            className="input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
            Move
          </button>
          <button
            type="button"
            onClick={() => setIsRescheduling(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 6px', fontSize: '11px' }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
