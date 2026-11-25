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
  Play,
  Copy,
  Archive,
  ChevronDown,
  ChevronRight,
  Plus,
  Tag,
  Link as LinkIcon,
  Repeat,
  Check,
} from 'lucide-react';
import type { Task, Priority, TaskStatus } from '../types';
import useStore from '../store/useStore';
import { todayLocal, tomorrowLocal } from '../lib/dates';

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  showGoal?: boolean;
}

const PRIORITY_THEME: Record<
  Priority,
  { label: string; color: string; bg: string; icon: string }
> = {
  critical: {
    label: 'Critical',
    color: 'var(--priority-critical)',
    bg: 'var(--palette-brick-subtle)',
    icon: '🔥',
  },
  high: {
    label: 'High',
    color: 'var(--priority-high, #D97706)',
    bg: 'rgba(217, 119, 6, 0.12)',
    icon: '⚡',
  },
  medium: {
    label: 'Medium',
    color: 'var(--priority-medium, #2563EB)',
    bg: 'rgba(37, 99, 235, 0.12)',
    icon: '📌',
  },
  low: {
    label: 'Low',
    color: 'var(--priority-low, #6B7280)',
    bg: 'rgba(107, 114, 128, 0.12)',
    icon: '🌱',
  },
};

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'var(--text-muted)' },
  todo: { label: 'To Do', color: 'var(--text-secondary)' },
  'in-progress': { label: 'In Progress', color: 'var(--accent-primary)' },
  in_progress: { label: 'In Progress', color: 'var(--accent-primary)' },
  completed: { label: 'Completed', color: 'var(--status-success, #22C55E)' },
  done: { label: 'Completed', color: 'var(--status-success, #22C55E)' },
  archived: { label: 'Archived', color: 'var(--text-muted)' },
  blocked: { label: 'Blocked', color: 'var(--danger, #EF4444)' },
};

export default function TaskItem({ task, onEdit, onDelete, showGoal = true }: TaskItemProps) {
  const completeTask = useStore((s) => s.completeTask);
  const reopenTask = useStore((s) => s.reopenTask);
  const updateTask = useStore((s) => s.updateTask);
  const duplicateTask = useStore((s) => s.duplicateTask);
  const archiveTask = useStore((s) => s.archiveTask);
  const unarchiveTask = useStore((s) => s.unarchiveTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const setTaskStatus = useStore((s) => s.setTaskStatus);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const addSubtask = useStore((s) => s.addSubtask);
  const deleteSubtask = useStore((s) => s.deleteSubtask);
  const startTaskFocusSession = useStore((s) => s.startTaskFocusSession);
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);

  // Local UI state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate || '');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [inlineTitle, setInlineTitle] = useState(task.title);

  const priorityCfg = PRIORITY_THEME[task.priority] || PRIORITY_THEME.medium;
  const statusCfg = STATUS_LABELS[task.status] || STATUS_LABELS.todo;
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null;

  // Check blockers
  const blockers = (task.dependsOnTaskIds || [])
    .map((depId) => tasks.find((t) => t.id === depId))
    .filter(Boolean) as Task[];
  const activeBlockers = blockers.filter((b) => !b.isCompleted);
  const isBlocked = activeBlockers.length > 0;

  // Check if this task blocks other tasks
  const blockedTasksCount = tasks.filter(
    (t) => !t.isCompleted && t.dependsOnTaskIds?.includes(task.id)
  ).length;

  const todayStr = todayLocal();
  const tomorrowStr = tomorrowLocal();

  const isDueToday = task.dueDate === todayStr;
  const isDueTomorrow = task.dueDate === tomorrowStr;

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      reopenTask(task.id);
    } else {
      if (isBlocked) {
        const blockerNames = activeBlockers.map((b) => `• ${b.title}`).join('\n');
        if (
          !window.confirm(
            `⚠️ This task has ${activeBlockers.length} unmet dependencies:\n${blockerNames}\n\nMark completed anyway?`
          )
        ) {
          return;
        }
      }
      completeTask(task.id);
    }
  };

  const handleInlineTitleSave = () => {
    if (inlineTitle.trim() && inlineTitle.trim() !== task.title) {
      updateTask(task.id, { title: inlineTitle.trim() });
    } else {
      setInlineTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleQuickReschedule = (targetDate: string) => {
    rescheduleTask(task.id, targetDate);
    setIsRescheduling(false);
  };

  const handleAddInlineSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    addSubtask(task.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.isCompleted).length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        border: '1px solid var(--border-default)',
        borderLeft: `4px solid ${priorityCfg.color}`,
        background: task.isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
        boxShadow: 'var(--panel-shadow)',
        opacity: task.isCompleted ? 0.65 : 1,
        transition: 'all 0.12s ease',
        overflow: 'hidden',
      }}
    >
      {/* Main Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '11px 14px',
        }}
      >
        {/* Left: Complete checkbox + Title + Meta */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0 0 0',
              color: task.isCompleted ? 'var(--status-success, #22C55E)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={task.isCompleted ? 'Reopen task' : isBlocked ? 'Blocked by other tasks' : 'Mark completed'}
          >
            {task.isCompleted ? (
              <CheckCircle2 size={18} color="var(--status-success, #22C55E)" />
            ) : (
              <Circle size={18} color={isBlocked ? 'var(--danger, #EF4444)' : 'var(--border-focus)'} />
            )}
          </button>

          {/* Title & Metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title / Inline edit */}
            {isEditingTitle ? (
              <input
                type="text"
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onBlur={handleInlineTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInlineTitleSave();
                  if (e.key === 'Escape') {
                    setInlineTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-focus)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              />
            ) : (
              <div
                onDoubleClick={() => setIsEditingTitle(true)}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.isCompleted ? 'line-through' : 'none',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  cursor: 'text',
                }}
                title="Double-click to edit title"
              >
                {task.title}
              </div>
            )}

            {/* Description or notes preview */}
            {(task.description || task.notes) && !task.isCompleted && (
              <div
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  marginTop: '2px',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.description || task.notes}
              </div>
            )}

            {/* Badges & Meta Chips */}
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
              {/* Status Selector Dropdown */}
              <select
                value={task.status || (task.isCompleted ? 'completed' : 'todo')}
                onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  background: 'var(--bg-secondary)',
                  color: statusCfg.color,
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  padding: '1px 4px',
                  cursor: 'pointer',
                }}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* Priority Badge */}
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  background: priorityCfg.bg,
                  color: priorityCfg.color,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>{priorityCfg.icon}</span>
                <span>{priorityCfg.label}</span>
              </span>

              {/* Due Date Indicator */}
              {task.dueDate && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: task.isOverdue && !task.isCompleted ? 'var(--danger, #EF4444)' : 'var(--text-muted)',
                    fontWeight: task.isOverdue || isDueToday ? 600 : 400,
                  }}
                  className="tabular"
                >
                  <Calendar size={11} />
                  <span>
                    {isDueToday ? 'Today' : isDueTomorrow ? 'Tomorrow' : task.dueDate}
                  </span>
                  {task.dueTime && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '2px' }}>
                      <Clock size={10} />
                      {task.dueTime}
                    </span>
                  )}
                </span>
              )}

              {/* Overdue Alert */}
              {task.isOverdue && !task.isCompleted && (
                <span
                  style={{
                    color: 'var(--danger, #EF4444)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <AlertTriangle size={11} /> Overdue
                </span>
              )}

              {/* Estimated Duration */}
              {task.estimatedDuration && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Clock size={10} />
                  {task.estimatedDuration}m
                </span>
              )}

              {/* Recurring Badge */}
              {task.recurrence && task.recurrence !== 'none' && (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--accent-primary)',
                    background: 'var(--palette-brick-subtle)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontWeight: 600,
                  }}
                  title={`Repeats ${task.recurrence}`}
                >
                  <Repeat size={10} />
                  {task.recurrence}
                </span>
              )}

              {/* Subtasks Count Pill */}
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '10.5px',
                    color: completedSubtasks === subtasks.length ? 'var(--status-success, #22C55E)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                  title="Toggle subtask checklist"
                >
                  {showSubtasks ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  <span>
                    {completedSubtasks}/{subtasks.length} subtasks
                  </span>
                </button>
              )}

              {/* Dependency Warning */}
              {isBlocked && !task.isCompleted && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--danger, #EF4444)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontWeight: 600,
                  }}
                  title={`Blocked by: ${activeBlockers.map((b) => b.title).join(', ')}`}
                >
                  <AlertTriangle size={10} />
                  Blocked ({activeBlockers.length})
                </span>
              )}

              {/* Blocking Count */}
              {blockedTasksCount > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                  title={`Blocks ${blockedTasksCount} task(s)`}
                >
                  <LinkIcon size={10} />
                  Blocks {blockedTasksCount}
                </span>
              )}

              {/* Connected Goal */}
              {showGoal && linkedGoal && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: 'var(--bg-secondary)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <Target size={10} color="var(--palette-brick)" />
                  {linkedGoal.title.substring(0, 18)}
                </span>
              )}

              {/* Tags */}
              {task.tags &&
                task.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)',
                      padding: '1px 5px',
                      borderRadius: '8px',
                    }}
                  >
                    #{t}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {/* Focus Button */}
          {!task.isCompleted && (
            <button
              onClick={() => startTaskFocusSession(task.id)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                borderColor: 'var(--palette-brick-border)',
              }}
              title="Start focused work sprint with LIFE OS timer"
            >
              <Play size={10} fill="currentColor" />
              <span>Focus</span>
            </button>
          )}

          {/* Quick Reschedule */}
          <button
            onClick={() => setIsRescheduling(!isRescheduling)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
            title="Reschedule task"
          >
            <Clock size={13} />
          </button>

          {/* Edit */}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
              title="Edit full task details"
            >
              <Edit2 size={13} />
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={() => duplicateTask(task.id)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
            title="Duplicate task"
          >
            <Copy size={13} />
          </button>

          {/* Archive / Unarchive */}
          <button
            onClick={() => (task.isArchived ? unarchiveTask(task.id) : archiveTask(task.id))}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
            title={task.isArchived ? 'Unarchive task' : 'Archive task'}
          >
            <Archive size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (window.confirm(`Delete task "${task.title}"?`)) {
                if (onDelete) onDelete(task.id);
                else deleteTask(task.id);
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Reschedule Inline Tray */}
      {isRescheduling && (
        <div
          style={{
            padding: '8px 14px',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            fontSize: '11.5px',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Move to:</span>
          <button
            type="button"
            onClick={() => handleQuickReschedule(todayStr)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleQuickReschedule(tomorrowStr)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            Tomorrow
          </button>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              borderRadius: '4px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => newDate && handleQuickReschedule(newDate)}
            className="btn btn-primary btn-sm"
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setIsRescheduling(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 6px', fontSize: '11px' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Interactive Subtasks Tray */}
      {showSubtasks && (
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {subtasks.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                fontSize: '12px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={st.isCompleted}
                  onChange={() => toggleSubtask(task.id, st.id)}
                  style={{ accentColor: 'var(--palette-brick)' }}
                />
                <span
                  style={{
                    color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: st.isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {st.title}
                </span>
              </label>
              <button
                type="button"
                onClick={() => deleteSubtask(task.id, st.id)}
                className="btn btn-ghost"
                style={{ padding: '2px', color: 'var(--text-muted)' }}
                title="Delete subtask"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {/* Add Subtask Inline Input */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <input
              type="text"
              placeholder="Add step... (Enter)"
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInlineSubtask();
                }
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '11.5px',
                borderRadius: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={handleAddInlineSubtask}
              disabled={!newSubtaskInput.trim()}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
