import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  Flag,
  Tag,
  Maximize2,
  Folder,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Priority } from '../types';
import { todayLocal, tomorrowLocal } from '../lib/dates';

interface QuickTaskBarProps {
  onExpandDetails: (initialValues?: { title: string; priority: Priority; dueDate?: string; category?: string; estimatedDuration?: number }) => void;
  defaultCategory?: string;
  defaultGoalId?: string;
}

const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'critical', label: 'Critical', color: 'var(--priority-critical, #B80C09)' },
  { id: 'high', label: 'High', color: 'var(--priority-high, #D97706)' },
  { id: 'medium', label: 'Medium', color: 'var(--priority-medium, #2563EB)' },
  { id: 'low', label: 'Low', color: 'var(--priority-low, #6B7280)' },
];

const DURATIONS = [
  { label: '15m', value: 15 },
  { label: '25m (Pomodoro)', value: 25 },
  { label: '45m', value: 45 },
  { label: '60m', value: 60 },
  { label: '90m (Deep Work)', value: 90 },
];

export default function QuickTaskBar({ onExpandDetails, defaultCategory, defaultGoalId }: QuickTaskBarProps) {
  const quickAddTask = useStore((s) => s.quickAddTask);
  const addTask = useStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<string>(defaultCategory || 'General');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const todayStr = todayLocal();
  const tomorrowStr = tomorrowLocal();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (defaultGoalId) {
      await addTask({
        title: title.trim(),
        priority,
        category,
        dueDate: dueDate || undefined,
        estimatedDuration,
        tags,
        goalId: defaultGoalId,
        status: 'todo',
        subtasks: [],
        isCompleted: false,
        isOverdue: false,
      });
    } else {
      await quickAddTask(
        title.trim(),
        priority,
        dueDate || undefined,
        category,
        estimatedDuration,
        tags
      );
    }

    // Reset fields
    setTitle('');
    setTags([]);
    setDueDate('');
    setEstimatedDuration(undefined);
    setShowOptions(false);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--panel-shadow)',
        padding: '12px 16px',
        marginBottom: '18px',
        transition: 'all 0.15s ease',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--palette-brick, #B80C09)', display: 'flex', alignItems: 'center' }}>
            <Plus size={18} />
          </span>

          <input
            type="text"
            placeholder="Quick task capture... Press Enter to create (e.g. Finish research paper, Pay rent)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value && !showOptions) setShowOptions(true);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              fontWeight: 500,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() =>
                onExpandDetails({
                  title: title.trim(),
                  priority,
                  dueDate: dueDate || undefined,
                  category,
                  estimatedDuration,
                })
              }
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
              }}
              title="Open full detailed task modal"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Detailed Form</span>
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="btn btn-primary btn-sm"
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Quick Attribute Chips Bar */}
        {(showOptions || title) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-default)',
              fontSize: '11.5px',
            }}
          >
            {/* Priority Selector Chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flag size={12} color="var(--text-muted)" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Shortcut Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} color="var(--text-muted)" />
              <button
                type="button"
                onClick={() => setDueDate(dueDate === todayStr ? '' : todayStr)}
                style={{
                  background: dueDate === todayStr ? 'var(--palette-brick-subtle)' : 'var(--bg-secondary)',
                  color: dueDate === todayStr ? 'var(--palette-brick)' : 'var(--text-secondary)',
                  border: `1px solid ${dueDate === todayStr ? 'var(--palette-brick-border)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: dueDate === todayStr ? 600 : 500,
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(dueDate === tomorrowStr ? '' : tomorrowStr)}
                style={{
                  background: dueDate === tomorrowStr ? 'var(--palette-brick-subtle)' : 'var(--bg-secondary)',
                  color: dueDate === tomorrowStr ? 'var(--palette-brick)' : 'var(--text-secondary)',
                  border: `1px solid ${dueDate === tomorrowStr ? 'var(--palette-brick-border)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: dueDate === tomorrowStr ? 600 : 500,
                }}
              >
                Tomorrow
              </button>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  width: '110px',
                }}
              />
            </div>

            {/* Estimated Duration Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} color="var(--text-muted)" />
              <select
                value={estimatedDuration || ''}
                onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '11px',
                }}
              >
                <option value="">No Duration</option>
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={12} color="var(--text-muted)" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '11px',
                }}
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

            {/* Tag Quick Chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="#tag + Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  width: '90px',
                }}
              />
            </div>

            {/* Selected Tags list */}
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10.5px',
                  color: 'var(--text-secondary)',
                }}
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
