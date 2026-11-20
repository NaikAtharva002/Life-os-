import React, { useState } from 'react';
import { X, Flag, Target, Plus, Trash2, Repeat, Link as LinkIcon } from 'lucide-react';
import type { Task, Priority, TaskRecurrence, SubTask } from '../types';
import useStore from '../store/useStore';

interface TaskModalProps {
  isOpen?: boolean;
  task?: Task;
  editingTask?: Task;
  defaultPriority?: Priority;
  defaultDate?: string;
  onClose: () => void;
}

const PRIORITIES: { id: Priority; label: string; icon: string; color: string }[] = [
  { id: 'critical', label: 'Critical', icon: '🔥', color: 'var(--priority-critical)' },
  { id: 'high', label: 'High', icon: '⚡', color: 'var(--priority-high)' },
  { id: 'medium', label: 'Medium', icon: '📌', color: 'var(--priority-medium)' },
  { id: 'low', label: 'Low', icon: '🌱', color: 'var(--priority-low)' },
];

export default function TaskModal({
  isOpen = true,
  task,
  editingTask,
  defaultPriority = 'medium',
  defaultDate,
  onClose,
}: TaskModalProps) {
  if (!isOpen) return null;

  const targetTask = task || editingTask;
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const goals = useStore((s) => s.goals);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const careerProjects = useStore((s) => s.careerProjects);

  const [title, setTitle] = useState(targetTask?.title || '');
  const [description, setDescription] = useState(targetTask?.description || '');
  const [priority, setPriority] = useState<Priority>(targetTask?.priority || defaultPriority);
  const [category, setCategory] = useState(targetTask?.category || 'General');
  const [goalId, setGoalId] = useState(targetTask?.goalId || '');
  const [academicSubjectId, setAcademicSubjectId] = useState(targetTask?.academicSubjectId || '');
  const [careerProjectId, setCareerProjectId] = useState(targetTask?.careerProjectId || '');
  const [dueDate, setDueDate] = useState(targetTask?.dueDate || defaultDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState(targetTask?.dueTime || '');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(targetTask?.recurrence || 'none');

  const [subtasks, setSubtasks] = useState<SubTask[]>(targetTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (targetTask) {
      updateTask(targetTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        goalId: goalId || undefined,
        academicSubjectId: academicSubjectId || undefined,
        careerProjectId: careerProjectId || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        recurrence,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        status: 'todo',
        goalId: goalId || undefined,
        academicSubjectId: academicSubjectId || undefined,
        careerProjectId: careerProjectId || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        recurrence,
        subtasks,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{targetTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Title */}
            <div>
              <label className="label">Task Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Raft Consensus Implementation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Notes / Details</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Key links, checklist, or subtask context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="label">Priority Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border)',
                        background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                      }}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date, Time & Recurrence */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Due Time</label>
                <input
                  type="time"
                  className="input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Repeat</label>
                <select
                  className="input"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Multi-Domain Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label">Connected Goal</label>
                <select
                  className="input"
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
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
                <label className="label">Academic Course</label>
                <select
                  className="input"
                  value={academicSubjectId}
                  onChange={(e) => setAcademicSubjectId(e.target.value)}
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

            {/* Subtasks */}
            <div>
              <label className="label">Subtasks Checklist ({subtasks.length})</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSubtask}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        fontSize: '12.5px',
                      }}
                    >
                      <span>{st.title}</span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '3px', color: 'var(--text-muted)' }}
                        onClick={() => handleRemoveSubtask(st.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {targetTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
