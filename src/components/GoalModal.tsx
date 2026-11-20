import React, { useState } from 'react';
import { X, Plus, Trash2, Flag } from 'lucide-react';
import type { Goal, Priority, Milestone, GoalType } from '../types';
import useStore from '../store/useStore';

interface GoalModalProps {
  isOpen?: boolean;
  goal?: Goal;
  editingGoal?: Goal;
  onClose: () => void;
}

const CATEGORY_PRESETS = [
  'Career & Work',
  'Health & Fitness',
  'Personal Growth',
  'Wealth & Finance',
  'Academics',
  'Relationships',
  'Creativity & Skills',
  'Mindset & Peace',
];

const PRIORITIES: { id: Priority; label: string; icon: string; color: string; desc: string }[] = [
  {
    id: 'critical',
    label: 'Critical',
    icon: '🔥',
    color: 'var(--priority-critical)',
    desc: 'Top priority. Life-changing or time-sensitive',
  },
  {
    id: 'high',
    label: 'High',
    icon: '⚡',
    color: 'var(--priority-high)',
    desc: 'Very important. Consistent focus needed',
  },
  {
    id: 'medium',
    label: 'Medium',
    icon: '📌',
    color: 'var(--priority-medium)',
    desc: 'Meaningful milestone or ongoing objective',
  },
  {
    id: 'low',
    label: 'Low',
    icon: '🌱',
    color: 'var(--priority-low)',
    desc: 'Nice to have. Explore when time permits',
  },
];

export default function GoalModal({ isOpen = true, goal, editingGoal, onClose }: GoalModalProps) {
  if (!isOpen) return null;

  const targetGoal = goal || editingGoal;
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);

  const [title, setTitle] = useState(targetGoal?.title || '');
  const [description, setDescription] = useState(targetGoal?.description || '');
  const [priority, setPriority] = useState<Priority>(targetGoal?.priority || 'medium');
  const [type, setType] = useState<GoalType>(targetGoal?.type || 'short-term');
  const [category, setCategory] = useState(targetGoal?.category || 'Career & Work');
  const [targetDate, setTargetDate] = useState(targetGoal?.targetDate || '');
  const [progress, setProgress] = useState(targetGoal?.progress || 0);

  const [milestones, setMilestones] = useState<Milestone[]>(targetGoal?.milestones || []);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: newMilestoneText.trim(),
        isCompleted: false,
      },
    ]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (targetGoal) {
      updateGoal(targetGoal.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        type,
        category,
        targetDate: targetDate || undefined,
        progress,
        milestones,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim(),
        priority,
        type,
        category,
        targetDate: targetDate || undefined,
        progress,
        milestones,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{targetGoal ? 'Edit Goal' : 'New Goal'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title */}
            <div>
              <label className="label">Goal Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Launch SaaS Platform v1.0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description / Desired Outcome</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Why does this goal matter? What does success look like?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Time Horizon (Type) & Target Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="label">Time Horizon</label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value as GoalType)}
                >
                  <option value="short-term">Short-Term (&lt; 3 months)</option>
                  <option value="medium-term">Medium-Term (3-12 months)</option>
                  <option value="long-term">Long-Term (1+ years)</option>
                </select>
              </div>

              <div>
                <label className="label">Target Deadline</label>
                <input
                  type="date"
                  className="input"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="label">Intelligent Priority Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border)',
                        background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{p.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <label className="label">Actionable Milestones ({milestones.length})</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add a milestone to track incremental progress..."
                  value={newMilestoneText}
                  onChange={(e) => setNewMilestoneText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMilestone();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddMilestone}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {milestones.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ textDecoration: m.isCompleted ? 'line-through' : 'none', opacity: m.isCompleted ? 0.6 : 1 }}>
                        {m.title}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '4px', color: 'var(--text-muted)' }}
                        onClick={() => handleRemoveMilestone(m.id)}
                      >
                        <Trash2 size={14} />
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
              {targetGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
