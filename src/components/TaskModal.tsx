import React, { useState } from 'react';
import {
  X,
  Flag,
  Target,
  Plus,
  Trash2,
  Repeat,
  Tag,
  Clock,
  Layers,
  FileText,
  Copy,
  Archive,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Task, Priority, TaskStatus, TaskRecurrence, SubTask, TaskRecurrenceConfig } from '../types';
import useStore from '../store/useStore';

interface TaskModalProps {
  isOpen?: boolean;
  task?: Task;
  editingTask?: Task;
  defaultPriority?: Priority;
  defaultDate?: string;
  defaultCategory?: string;
  defaultGoalId?: string;
  defaultEstimatedDuration?: number;
  initialValues?: {
    title?: string;
    priority?: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  };
  onClose: () => void;
}

const PRIORITIES: { id: Priority; label: string; icon: string; color: string; desc: string }[] = [
  { id: 'critical', label: 'Critical', icon: '🔥', color: 'var(--priority-critical, #B80C09)', desc: 'Must ship today' },
  { id: 'high', label: 'High', icon: '⚡', color: 'var(--priority-high, #D97706)', desc: 'Key milestone' },
  { id: 'medium', label: 'Medium', icon: '📌', color: 'var(--priority-medium, #2563EB)', desc: 'Standard task' },
  { id: 'low', label: 'Low', icon: '🌱', color: 'var(--priority-low, #6B7280)', desc: 'Nice to have' },
];

const STATUS_OPTIONS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-muted)' },
  { id: 'todo', label: 'To Do', color: 'var(--text-secondary)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--palette-brick, #B80C09)' },
  { id: 'completed', label: 'Completed', color: 'var(--status-success, #22C55E)' },
  { id: 'archived', label: 'Archived', color: 'var(--text-muted)' },
];

const DURATION_PRESETS = [
  { label: '15m', value: 15 },
  { label: '25m (Pomodoro)', value: 25 },
  { label: '45m', value: 45 },
  { label: '60m (1 Hour)', value: 60 },
  { label: '90m (Deep Work)', value: 90 },
  { label: '120m (2 Hours)', value: 120 },
];

export default function TaskModal({
  isOpen = true,
  task,
  editingTask,
  defaultPriority = 'medium',
  defaultDate,
  defaultCategory,
  defaultGoalId,
  defaultEstimatedDuration,
  initialValues,
  onClose,
}: TaskModalProps) {
  if (!isOpen) return null;

  const targetTask = task || editingTask;
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const duplicateTask = useStore((s) => s.duplicateTask);
  const archiveTask = useStore((s) => s.archiveTask);
  const unarchiveTask = useStore((s) => s.unarchiveTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const careerProjects = useStore((s) => s.careerProjects);

  // Form states
  const [title, setTitle] = useState(targetTask?.title || initialValues?.title || '');
  const [description, setDescription] = useState(targetTask?.description || '');
  const [notes, setNotes] = useState(targetTask?.notes || '');
  const [priority, setPriority] = useState<Priority>(
    targetTask?.priority || initialValues?.priority || defaultPriority
  );
  const [status, setStatus] = useState<TaskStatus>(targetTask?.status || 'todo');
  const [category, setCategory] = useState(
    targetTask?.category || initialValues?.category || defaultCategory || 'General'
  );
  const [dueDate, setDueDate] = useState(
    targetTask?.dueDate || initialValues?.dueDate || defaultDate || ''
  );
  const [dueTime, setDueTime] = useState(targetTask?.dueTime || '');
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(
    targetTask?.estimatedDuration ?? initialValues?.estimatedDuration ?? defaultEstimatedDuration
  );
  const [goalId, setGoalId] = useState(targetTask?.goalId || defaultGoalId || '');
  const [academicSubjectId, setAcademicSubjectId] = useState(targetTask?.academicSubjectId || '');
  const [careerProjectId, setCareerProjectId] = useState(targetTask?.careerProjectId || '');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(
    (targetTask?.recurrence as TaskRecurrence) || 'none'
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(
    targetTask?.recurrenceConfig?.interval || 1
  );

  // Tags state
  const [tags, setTags] = useState<string[]>(targetTask?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Subtasks state
  const [subtasks, setSubtasks] = useState<SubTask[]>(targetTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // Dependencies state
  const [dependsOnTaskIds, setDependsOnTaskIds] = useState<string[]>(
    targetTask?.dependsOnTaskIds || []
  );

  // Candidate dependencies: other tasks (excluding self)
  const candidateDependencies = tasks.filter(
    (t) => (!targetTask || t.id !== targetTask.id) && !t.isArchived
  );

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, isCompleted: !st.isCompleted } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSaveSubtaskEdit = (id: string) => {
    if (!editingSubtaskTitle.trim()) {
      handleRemoveSubtask(id);
    } else {
      setSubtasks(
        subtasks.map((st) =>
          st.id === id ? { ...st, title: editingSubtaskTitle.trim() } : st
        )
      );
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const toggleDependency = (depId: string) => {
    // Avoid self and circular dependencies
    if (dependsOnTaskIds.includes(depId)) {
      setDependsOnTaskIds(dependsOnTaskIds.filter((x) => x !== depId));
    } else {
      // Check for direct circular dependency (if depId depends on current task)
      const depTask = tasks.find((t) => t.id === depId);
      if (targetTask && depTask?.dependsOnTaskIds?.includes(targetTask.id)) {
        alert('Cannot add dependency: this would create a circular dependency loop.');
        return;
      }
      setDependsOnTaskIds([...dependsOnTaskIds, depId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recurrenceConfig: TaskRecurrenceConfig | undefined =
      recurrence !== 'none'
        ? {
            type: recurrence,
            interval: recurrenceInterval > 0 ? recurrenceInterval : 1,
            currentOccurrence: targetTask?.recurrenceConfig?.currentOccurrence || 1,
          }
        : undefined;

    const isCompleted = status === 'completed';

    if (targetTask) {
      await updateTask(targetTask.id, {
        title: title.trim(),
        description,
        notes,
        priority,
        status,
        category,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedDuration,
        goalId: goalId || undefined,
        academicSubjectId: academicSubjectId || undefined,
        careerProjectId: careerProjectId || undefined,
        recurrence,
        recurrenceConfig,
        subtasks,
        tags,
        dependsOnTaskIds,
        isCompleted,
        completedAt: isCompleted ? (targetTask.completedAt || new Date().toISOString()) : undefined,
      });
    } else {
      await addTask({
        title: title.trim(),
        description,
        notes,
        priority,
        category,
        status,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedDuration,
        goalId: goalId || undefined,
        academicSubjectId: academicSubjectId || undefined,
        careerProjectId: careerProjectId || undefined,
        recurrence,
        recurrenceConfig,
        subtasks,
        tags,
        dependsOnTaskIds,
        isCompleted,
        isOverdue: false,
      });
    }

    onClose();
  };

  const handleDuplicate = async () => {
    if (targetTask) {
      await duplicateTask(targetTask.id);
      onClose();
    }
  };

  const handleArchive = async () => {
    if (targetTask) {
      if (targetTask.isArchived) {
        await unarchiveTask(targetTask.id);
      } else {
        await archiveTask(targetTask.id);
      }
      onClose();
    }
  };

  const handleDelete = async () => {
    if (targetTask && window.confirm(`Permanently delete task "${targetTask.title}"?`)) {
      await deleteTask(targetTask.id);
      onClose();
    }
  };

  const completedSubtasksCount = subtasks.filter((st) => st.isCompleted).length;
  const subtasksPercent =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '14px',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: PRIORITIES.find((p) => p.id === priority)?.color || 'var(--palette-brick)',
              }}
            />
            <h2 className="modal-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {targetTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            {targetTask?.isArchived && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                Archived
              </span>
            )}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Title */}
            <div>
              <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Task Title *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Raft Consensus Protocol Implementation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
                style={{ fontSize: '14px', padding: '9px 12px' }}
              />
            </div>

            {/* Status & Priority Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Status */}
              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Lifecycle Status
                </label>
                <select
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  style={{ fontSize: '12.5px', padding: '8px 10px' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Life Dimension / Category
                </label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ fontSize: '12.5px', padding: '8px 10px' }}
                >
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Projects">Projects</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Academics">Academics</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            {/* Priority Selector (Visual Grid) */}
            <div>
              <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Priority Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border-default)',
                        background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date, Time, Duration & Recurrence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Due Time
                </label>
                <input
                  type="time"
                  className="input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Estimated Time
                </label>
                <select
                  className="input"
                  value={estimatedDuration || ''}
                  onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                >
                  <option value="">No estimate</option>
                  {DURATION_PRESETS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Recurrence
                </label>
                <select
                  className="input"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Interval</option>
                </select>
              </div>
            </div>

            {/* Custom Recurrence Interval Subrow */}
            {recurrence === 'custom' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                }}
              >
                <span>Repeat every</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: '60px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
                <span>days</span>
              </div>
            )}

            {/* Multi-Domain Links: Connected Goal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Connected Goal
                </label>
                <select
                  className="input"
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                >
                  <option value="">No Goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Academic Course
                </label>
                <select
                  className="input"
                  value={academicSubjectId}
                  onChange={(e) => setAcademicSubjectId(e.target.value)}
                  style={{ fontSize: '12px', padding: '7px 8px' }}
                >
                  <option value="">No Course</option>
                  {academicSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Tags ({tags.length})
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Type tag and press Enter (e.g. backend, deepwork)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  style={{ fontSize: '12.5px', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus size={14} /> Add Tag
                </button>
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Tag size={10} />
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 0,
                          fontSize: '13px',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Subtasks Checklist */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>
                  Subtasks Checklist ({completedSubtasksCount}/{subtasks.length})
                </label>
                {subtasks.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                    {subtasksPercent}% done
                  </span>
                )}
              </div>

              {/* Subtasks progress bar */}
              {subtasks.length > 0 && (
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${subtasksPercent}%`,
                      height: '100%',
                      background: 'var(--palette-brick)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add a step (e.g. Finalize API schema, Write unit tests)..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ fontSize: '12.5px', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    padding: '4px 0',
                  }}
                >
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={st.isCompleted}
                          onChange={() => handleToggleSubtask(st.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--palette-brick)' }}
                        />
                        {editingSubtaskId === st.id ? (
                          <input
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSubtaskEdit(st.id);
                              if (e.key === 'Escape') setEditingSubtaskId(null);
                            }}
                            onBlur={() => handleSaveSubtaskEdit(st.id)}
                            autoFocus
                            style={{
                              flex: 1,
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                            }}
                          />
                        ) : (
                          <span
                            onDoubleClick={() => {
                              setEditingSubtaskId(st.id);
                              setEditingSubtaskTitle(st.title);
                            }}
                            style={{
                              color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: st.isCompleted ? 'line-through' : 'none',
                              cursor: 'text',
                            }}
                          >
                            {st.title}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                        onClick={() => handleRemoveSubtask(st.id)}
                        title="Delete subtask"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Dependencies */}
            {candidateDependencies.length > 0 && (
              <div>
                <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Task Dependencies (Blocked By)
                </label>
                <div
                  style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    background: 'var(--bg-elevated)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {candidateDependencies.map((cand) => {
                    const isSelected = dependsOnTaskIds.includes(cand.id);
                    return (
                      <div
                        key={cand.id}
                        onClick={() => toggleDependency(cand.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--palette-brick-subtle)' : 'transparent',
                          border: isSelected ? '1px solid var(--palette-brick-border)' : '1px solid transparent',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDependency(cand.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer', accentColor: 'var(--palette-brick)' }}
                        />
                        <span style={{ fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)' }}>
                          {cand.title}
                        </span>
                        {cand.isCompleted && (
                          <span style={{ fontSize: '10px', color: 'var(--status-success)', marginLeft: 'auto' }}>
                            ✓ Done
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes / Description */}
            <div>
              <label className="label" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Notes & Context
              </label>
              <textarea
                className="input"
                rows={2}
                placeholder="Reference links, architectural constraints, meeting takeaways..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ fontSize: '12.5px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '14px 22px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
            }}
          >
            {targetTask ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="btn btn-secondary btn-sm"
                  title="Duplicate task"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                >
                  <Copy size={13} /> Duplicate
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="btn btn-secondary btn-sm"
                  title={targetTask.isArchived ? 'Restore task' : 'Archive task'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                >
                  <Archive size={13} /> {targetTask.isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger btn-sm"
                  title="Delete task"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="btn btn-primary btn-sm"
                style={{ padding: '7px 18px', fontWeight: 600 }}
              >
                {targetTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
