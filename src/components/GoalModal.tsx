import React, { useState } from 'react';
import { X, Plus, Trash2, Flag, Image as ImageIcon } from 'lucide-react';
import type { Goal, Priority, Milestone, GoalType } from '../types';
import useStore from '../store/useStore';

interface GoalModalProps {
  isOpen?: boolean;
  goal?: Goal;
  editingGoal?: Goal;
  onClose: () => void;
}

const COVER_PRESETS = [
  { id: 'goal-tech', label: 'Tech & Career', path: '/images/goals/goal-tech.jpg' },
  { id: 'goal-finance', label: 'Wealth & Finance', path: '/images/goals/goal-finance.jpg' },
  { id: 'goal-fitness', label: 'Endurance & Trail', path: '/images/goals/goal-fitness.jpg' },
  { id: 'goal-academics', label: 'Library & Academics', path: '/images/goals/goal-academics.jpg' },
  { id: 'dashboard-nature', label: 'Deep Nature Focus', path: '/images/dashboard/dashboard-nature.jpg' },
  { id: 'dashboard-workspace', label: 'Minimal Workspace', path: '/images/dashboard/dashboard-workspace.jpg' },
];

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
  const [coverImage, setCoverImage] = useState<string | undefined>(targetGoal?.coverImage);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState<boolean>(false);

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
        coverImage: coverImage || undefined,
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
        coverImage: coverImage || undefined,
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

            {/* Customizable Cover Image */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="label" style={{ margin: 0 }}>Cover Image</label>
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(undefined)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--status-danger)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <X size={12} /> Remove Cover
                  </button>
                )}
              </div>

              {/* Cover Image Presets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {COVER_PRESETS.map((preset) => {
                  const isSelected = coverImage === preset.path || coverImage === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setCoverImage(preset.path)}
                      style={{
                        position: 'relative',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                        boxShadow: isSelected ? '0 2px 8px rgba(184, 12, 9, 0.3)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, transparent 20%, rgba(20, 19, 1, 0.8) 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: '3px 5px',
                        }}
                      >
                        <span style={{ fontSize: '9.5px', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'var(--palette-brick)',
                            color: '#ffffff',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom Image URL Toggle & Input */}
              {!showCustomUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--palette-brick)',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    padding: '2px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                >
                  <ImageIcon size={12} /> Custom image URL...
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{ fontSize: '12px', padding: '5px 8px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      if (customUrl.trim()) {
                        setCoverImage(customUrl.trim());
                        setCustomUrl('');
                        setShowCustomUrlInput(false);
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
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
