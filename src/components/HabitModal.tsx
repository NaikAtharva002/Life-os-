import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Habit } from '../types';
import useStore from '../store/useStore';

interface HabitModalProps {
  habit?: Habit;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  'Productivity',
  'Fitness',
  'Learning',
  'Health',
  'Finance',
  'Mindfulness',
  'General',
];

const EMOJI_OPTIONS = ['🏃', '🧘', '💧', '📚', '💪', '🍎', '😴', '🎯', '🧠', '✍️', '🎵', '🚴', '💻', '🌿', '☕', '🎨'];

const COLOR_OPTIONS = [
  '#7c5cfc', // Purple / Accent
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

export default function HabitModal({ habit, onClose }: HabitModalProps) {
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);

  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [category, setCategory] = useState(habit?.category || 'Productivity');
  const [icon, setIcon] = useState(habit?.icon || '⚡');
  const [color, setColor] = useState(habit?.color || '#7c5cfc');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [targetDays, setTargetDays] = useState<number[]>(habit?.targetDays || [0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (habit) {
      updateHabit(habit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        icon,
        color,
        frequency,
        targetDays,
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        icon,
        color,
        frequency,
        targetDays,
      });
    }
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    if (targetDays.includes(dayIndex)) {
      if (targetDays.length > 1) {
        setTargetDays(targetDays.filter((d) => d !== dayIndex));
      }
    } else {
      setTargetDays([...targetDays, dayIndex].sort());
    }
  };

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Name */}
            <div>
              <label className="label">Habit Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Read 20 Pages Non-Fiction"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Cue / Motivation (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. After morning coffee, sit at desk with kindle"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Icon picker */}
            <div>
              <label className="label">Visual Emoji Symbol</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    style={{
                      fontSize: '18px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: icon === e ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: icon === e ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="label">Color Accent</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '3px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                      outline: color === c ? `2px solid ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Target days */}
            <div>
              <label className="label">Active Days</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {daysLabels.map((lbl, idx) => {
                  const isSelected = targetDays.includes(idx);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
