import React, { useState } from 'react';
import { todayLocal } from '../lib/dates';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Target,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type {
  Goal,
  Priority,
  Milestone,
  GoalType,
  LifeArea,
  GoalStatus,
  GoalMeasurementType,
} from '../types';
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

const LIFE_AREAS: { id: LifeArea; label: string; icon: string; desc: string }[] = [
  { id: 'personal', label: 'Personal Growth', icon: '🌱', desc: 'Mindset, habits, personal evolution' },
  { id: 'career', label: 'Career & Work', icon: '💼', desc: 'Professional trajectory, leadership, projects' },
  { id: 'academic', label: 'Academics', icon: '📚', desc: 'Coursework, research, GPA, exams' },
  { id: 'finance', label: 'Wealth & Finance', icon: '🪙', desc: 'Savings, runway, net worth, investments' },
  { id: 'fitness', label: 'Health & Fitness', icon: '⚡', desc: 'Strength, endurance, mobility, recovery' },
  { id: 'learning', label: 'Skills & Learning', icon: '🧠', desc: 'Coding, languages, creative craft' },
  { id: 'relationships', label: 'Relationships', icon: '🤝', desc: 'Family, friends, community' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨', desc: 'Travel, environment, daily rituals' },
  { id: 'custom', label: 'Custom', icon: '🎯', desc: 'Bespoke domain' },
];

const CATEGORY_PRESETS: Record<LifeArea, string[]> = {
  personal: ['Mindset & Meditation', 'Daily Discipline', 'Reading & Reflection', 'Emotional Mastery'],
  career: ['Software Engineering', 'Promotion & Leadership', 'Open Source', 'Portfolio Launch', 'Job Hunt'],
  academic: ['Core Engineering', 'Semester GPA', 'Competitive Exams', 'Research Papers', 'Certifications'],
  finance: ['Emergency Runway', 'Investment Portfolio', 'Debt Clearance', 'Monthly Savings Rate'],
  fitness: ['Hypertrophy & Lifting', '5K/10K Running', 'Body Fat Target', 'Daily Mobility'],
  learning: ['Web Development', 'System Design', 'AI & Machine Learning', 'Foreign Language'],
  relationships: ['Family Time', 'Professional Network', 'Mentorship'],
  lifestyle: ['Workspace Ergonomics', 'Minimalist Wardrobe', 'Morning Routine', 'Digital Detox'],
  custom: ['General Ambition', 'Special Project'],
};

const MEASUREMENT_TYPES: { id: GoalMeasurementType; label: string; icon: string; desc: string }[] = [
  { id: 'numeric', label: 'Numeric Target', icon: '🔢', desc: 'Target value (e.g. ₹50,000, 100 problems, 8.5 CGPA)' },
  { id: 'milestone-based', label: 'Milestone Roadmap', icon: '🗺️', desc: 'Calculated from completed milestone checkpoints' },
  { id: 'completion', label: 'Project Completion', icon: '🎯', desc: 'Deliverable completion tied to tasks' },
  { id: 'habit-based', label: 'Habit Consistency', icon: '🔄', desc: 'Linked to daily habit adherence rates' },
];

const PRIORITIES: { id: Priority; label: string; icon: string; color: string }[] = [
  { id: 'critical', label: 'Critical', icon: '🔥', color: 'var(--priority-critical)' },
  { id: 'high', label: 'High', icon: '⚡', color: 'var(--priority-high)' },
  { id: 'medium', label: 'Medium', icon: '📌', color: 'var(--priority-medium)' },
  { id: 'low', label: 'Low', icon: '🌱', color: 'var(--priority-low)' },
];

const STATUSES: { id: GoalStatus; label: string; badgeClass: string }[] = [
  { id: 'not-started', label: 'Not Started', badgeClass: 'badge-secondary' },
  { id: 'in-progress', label: 'In Progress', badgeClass: 'badge-primary' },
  { id: 'on-track', label: 'On Track', badgeClass: 'badge-success' },
  { id: 'at-risk', label: 'At Risk', badgeClass: 'badge-danger' },
  { id: 'completed', label: 'Completed', badgeClass: 'badge-success' },
  { id: 'paused', label: 'Paused', badgeClass: 'badge-warning' },
  { id: 'abandoned', label: 'Abandoned', badgeClass: 'badge-secondary' },
];

export default function GoalModal({ isOpen = true, goal, editingGoal, onClose }: GoalModalProps) {
  if (!isOpen) return null;

  const targetGoal = goal || editingGoal;
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const habits = useStore((s) => s.habits);

  // Tabs for structured editing
  const [activeTab, setActiveTab] = useState<'basics' | 'targets' | 'planning' | 'notes'>('basics');

  // Form State
  const [title, setTitle] = useState(targetGoal?.title || '');
  const [description, setDescription] = useState(targetGoal?.description || '');
  const [lifeArea, setLifeArea] = useState<LifeArea>(targetGoal?.lifeArea || 'personal');
  const [category, setCategory] = useState(targetGoal?.category || 'Career & Work');
  const [priority, setPriority] = useState<Priority>(targetGoal?.priority || 'medium');
  const [type, setType] = useState<GoalType>(targetGoal?.type || 'short-term');
  const [status, setStatus] = useState<GoalStatus>(targetGoal?.status || 'not-started');
  const [statusOverride, setStatusOverride] = useState<boolean>(targetGoal?.statusOverride || false);

  const [startDate, setStartDate] = useState(targetGoal?.startDate || todayLocal());
  const [targetDate, setTargetDate] = useState(targetGoal?.targetDate || '');

  // Measurement State
  const [measurementType, setMeasurementType] = useState<GoalMeasurementType>(
    targetGoal?.measurementType ||
      (targetGoal?.milestones && targetGoal.milestones.length > 0 ? 'milestone-based' : 'numeric')
  );
  const [targetValue, setTargetValue] = useState<string>(
    targetGoal?.targetValue !== undefined ? String(targetGoal.targetValue) : ''
  );
  const [currentValue, setCurrentValue] = useState<string>(
    targetGoal?.currentValue !== undefined ? String(targetGoal.currentValue) : '0'
  );
  const [unit, setUnit] = useState<string>(targetGoal?.unit || '');
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(targetGoal?.linkedHabitIds || []);

  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>(targetGoal?.milestones || []);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // Planning State
  const [whyItMatters, setWhyItMatters] = useState(targetGoal?.whyItMatters || '');
  const [desiredOutcome, setDesiredOutcome] = useState(targetGoal?.desiredOutcome || '');
  const [nextAction, setNextAction] = useState(targetGoal?.nextAction || '');
  const [obstacles, setObstacles] = useState(targetGoal?.obstacles || '');
  const [notes, setNotes] = useState(targetGoal?.notes || '');
  const [tagsInput, setTagsInput] = useState((targetGoal?.tags || []).join(', '));

  // Visuals State
  const [coverImage, setCoverImage] = useState<string | undefined>(targetGoal?.coverImage);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomUrl, setShowCustomUrl] = useState(false);

  // Handlers
  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newM: Milestone = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || undefined,
      dueDate: newMilestoneDueDate || undefined,
      isCompleted: false,
      order: milestones.length,
    };
    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneDueDate('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleMoveMilestone = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;
    const updated = [...milestones];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMilestones(updated.map((m, idx) => ({ ...m, order: idx })));
  };

  const toggleLinkedHabit = (habitId: string) => {
    if (linkedHabitIds.includes(habitId)) {
      setLinkedHabitIds(linkedHabitIds.filter((id) => id !== habitId));
    } else {
      setLinkedHabitIds([...linkedHabitIds, habitId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTargetVal = targetValue ? parseFloat(targetValue) : undefined;
    const parsedCurrentVal = currentValue ? parseFloat(currentValue) : 0;
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const goalPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      category,
      lifeArea,
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
      status,
      statusOverride,
      measurementType,
      targetValue: parsedTargetVal,
      currentValue: parsedCurrentVal,
      unit: unit.trim() || undefined,
      milestones,
      linkedHabitIds,
      coverImage: coverImage || undefined,
      tags: parsedTags,
      notes: notes.trim() || undefined,
      whyItMatters: whyItMatters.trim() || undefined,
      desiredOutcome: desiredOutcome.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      obstacles: obstacles.trim() || undefined,
    };

    if (targetGoal) {
      await updateGoal(targetGoal.id, goalPayload);
    } else {
      await addGoal(goalPayload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: '680px',
          width: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {targetGoal ? 'Edit Strategic Goal' : 'Establish New Goal'}
              </h2>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Transform ambition into a structured, measurable milestone trajectory.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            padding: '0 16px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`btn btn-sm ${activeTab === 'basics' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <Layers size={13} /> 1. Essentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('targets')}
            className={`btn btn-sm ${activeTab === 'targets' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <Target size={13} /> 2. Targets &amp; Milestones ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className={`btn btn-sm ${activeTab === 'planning' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <Sparkles size={13} /> 3. Strategic Execution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none', padding: '8px 14px' }}
          >
            <FileText size={13} /> 4. Cover &amp; Notes
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>

            {/* TAB 1: ESSENTIALS */}
            {activeTab === 'basics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
                {/* Title */}
                <div>
                  <label className="label" style={{ fontWeight: 600 }}>Goal Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Master Full-Stack Distributed Systems or Save ₹1,00,000"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    required
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label">Core Intent &amp; Desired Outcome</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="What does tangible success look like when this goal is conquered?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Life Area Grid */}
                <div>
                  <label className="label">Life Area Domain</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {LIFE_AREAS.map((area) => {
                      const isSelected = lifeArea === area.id;
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            setLifeArea(area.id);
                            if (CATEGORY_PRESETS[area.id]?.[0]) {
                              setCategory(CATEGORY_PRESETS[area.id][0]);
                            }
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                            background: isSelected ? 'var(--palette-brick-subtle)' : 'var(--bg-secondary)',
                            color: isSelected ? 'var(--palette-brick)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: isSelected ? 600 : 500,
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{area.icon}</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {area.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Preset or Custom */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label">Category Preset</label>
                    <select
                      className="input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {(CATEGORY_PRESETS[lifeArea] || []).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Custom">Custom Category...</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Specific Category / Focus Tag</label>
                    <input
                      type="text"
                      className="input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Distributed Systems"
                    />
                  </div>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="label">Intelligent Strategic Priority</label>
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
                            border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border-default)',
                            background: isSelected ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{p.icon}</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Horizon, Start Date, Target Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="label">Time Horizon</label>
                    <select
                      className="input"
                      value={type}
                      onChange={(e) => setType(e.target.value as GoalType)}
                    >
                      <option value="short-term">Short-Term (&lt; 3 mos)</option>
                      <option value="medium-term">Medium-Term (3-12 mos)</option>
                      <option value="long-term">Long-Term (1+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
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

                {/* Lifecycle Status & Override */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label className="label">Lifecycle Status</label>
                    <select
                      className="input"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as GoalStatus);
                        setStatusOverride(true);
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ paddingTop: '18px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={statusOverride}
                        onChange={(e) => setStatusOverride(e.target.checked)}
                      />
                      Lock Manual Status Override
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TARGETS & MILESTONES */}
            {activeTab === 'targets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-in">
                {/* Measurement Type */}
                <div>
                  <label className="label" style={{ fontWeight: 600 }}>Measurement Methodology</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {MEASUREMENT_TYPES.map((m) => {
                      const isSelected = measurementType === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setMeasurementType(m.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                            background: isSelected ? 'var(--palette-brick-subtle)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ fontSize: '18px', lineHeight: 1 }}>{m.icon}</span>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: isSelected ? 'var(--palette-brick)' : 'var(--text-primary)' }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '2px' }}>
                              {m.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Numeric Target Configuration */}
                {measurementType === 'numeric' && (
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                      Numeric Target Parameters
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="label">Target Value *</label>
                        <input
                          type="number"
                          step="any"
                          className="input"
                          placeholder="e.g. 50000"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          required={measurementType === 'numeric'}
                        />
                      </div>

                      <div>
                        <label className="label">Current Value</label>
                        <input
                          type="number"
                          step="any"
                          className="input"
                          placeholder="e.g. 15000"
                          value={currentValue}
                          onChange={(e) => setCurrentValue(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="label">Unit of Measure</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. ₹, problems, books, CGPA"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Habit-Based Linked Habits */}
                {measurementType === 'habit-based' && (
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                      Connect Recurring Daily Habit Loops
                    </span>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Progress will dynamically synthesize the 30-day consistency rate of linked habits.
                    </p>
                    {habits.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No habits configured yet. Create habits in the Habits tab to link them here.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {habits.map((h) => {
                          const isLinked = linkedHabitIds.includes(h.id);
                          return (
                            <div
                              key={h.id}
                              onClick={() => toggleLinkedHabit(h.id)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: isLinked ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                                background: isLinked ? 'var(--palette-brick-subtle)' : 'var(--bg-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                              }}
                            >
                              <input type="checkbox" checked={isLinked} readOnly />
                              <span style={{ fontWeight: 500 }}>{h.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Milestones Roadmap Builder */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="label" style={{ margin: 0, fontWeight: 600 }}>
                      Actionable Milestones ({milestones.length})
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Sequence checkpoints in chronological order
                    </span>
                  </div>

                  {/* Add Milestone Inline Bar */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 1fr auto',
                      gap: '8px',
                      background: 'var(--bg-secondary)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <input
                      type="text"
                      className="input"
                      placeholder="Milestone title (e.g. Complete System Design Mock Interview)"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMilestone();
                        }
                      }}
                      style={{ fontSize: '12.5px' }}
                    />
                    <input
                      type="date"
                      className="input"
                      value={newMilestoneDueDate}
                      onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                      title="Milestone deadline"
                      style={{ fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddMilestone}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Milestones List */}
                  {milestones.length === 0 ? (
                    <div
                      style={{
                        padding: '18px',
                        textAlign: 'center',
                        background: 'var(--bg-surface)',
                        borderRadius: '8px',
                        border: '1px dashed var(--border-default)',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      No milestones defined yet. Break down this goal into 3–6 concrete milestone stages.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {milestones.map((m, idx) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            fontSize: '12.5px',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: m.isCompleted ? 'var(--status-success)' : 'var(--bg-elevated)',
                                color: m.isCompleted ? '#fff' : 'var(--text-muted)',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span style={{ fontWeight: 500, color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: m.isCompleted ? 'line-through' : 'none' }}>
                              {m.title}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {m.dueDate && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Calendar size={11} /> {m.dueDate}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleMoveMilestone(idx, 'up')}
                              disabled={idx === 0}
                              className="btn btn-ghost"
                              style={{ padding: '2px 4px', opacity: idx === 0 ? 0.3 : 1 }}
                              title="Move Up"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveMilestone(idx, 'down')}
                              disabled={idx === milestones.length - 1}
                              className="btn btn-ghost"
                              style={{ padding: '2px 4px', opacity: idx === milestones.length - 1 ? 0.3 : 1 }}
                              title="Move Down"
                            >
                              <ChevronDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(m.id)}
                              className="btn btn-ghost"
                              style={{ padding: '2px 4px', color: 'var(--status-danger)' }}
                              title="Delete Milestone"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: STRATEGIC EXECUTION */}
            {activeTab === 'planning' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
                {/* Why It Matters */}
                <div>
                  <label className="label" style={{ fontWeight: 600 }}>Why This Goal Matters (Primary Motivation)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Why is conquering this goal essential to your long-term personal or professional evolution?"
                    value={whyItMatters}
                    onChange={(e) => setWhyItMatters(e.target.value)}
                  />
                </div>

                {/* Desired Outcome */}
                <div>
                  <label className="label">Tangible Definition of Done</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="What specific evidence proves this objective has been completed without ambiguity?"
                    value={desiredOutcome}
                    onChange={(e) => setDesiredOutcome(e.target.value)}
                  />
                </div>

                {/* Immediate Next Action */}
                <div>
                  <label className="label" style={{ fontWeight: 600, color: 'var(--palette-brick)' }}>
                    Immediate Next Action Required
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRight size={14} color="var(--palette-brick)" />
                    <input
                      type="text"
                      className="input"
                      placeholder="What is the single next task you must execute this week?"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                    />
                  </div>
                </div>

                {/* Obstacles & Mitigation Strategy */}
                <div>
                  <label className="label">Anticipated Obstacles &amp; Countermeasures</label>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={14} color="var(--status-warning)" style={{ marginTop: '8px', flexShrink: 0 }} />
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="What bottlenecks could stall momentum (e.g. time constraints, cognitive fatigue), and how will you bypass them?"
                      value={obstacles}
                      onChange={(e) => setObstacles(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: COVER & NOTES */}
            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
                {/* Cover Image Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="label" style={{ margin: 0, fontWeight: 600 }}>Cover Visual Asset</label>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(undefined)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-danger)', fontSize: '11px', padding: '2px 6px' }}
                      >
                        Remove Cover
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
                    {COVER_PRESETS.map((preset) => {
                      const isSelected = coverImage === preset.path || coverImage === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setCoverImage(preset.path)}
                          style={{
                            position: 'relative',
                            height: '64px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--palette-brick)' : '1px solid var(--border-default)',
                            boxShadow: isSelected ? '0 2px 8px rgba(184, 12, 9, 0.3)' : 'none',
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
                              background: 'linear-gradient(180deg, transparent 20%, rgba(20, 19, 1, 0.85) 100%)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              padding: '4px 6px',
                            }}
                          >
                            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>{preset.label}</span>
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'var(--palette-brick)',
                                color: '#ffffff',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
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

                  {!showCustomUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomUrl(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--palette-brick)', fontSize: '11.5px', padding: 0 }}
                    >
                      <ImageIcon size={12} /> Custom external image URL...
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
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
                            setShowCustomUrl(false);
                          }
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Tags &amp; Taxonomy</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Comma separated: deep-work, financial-freedom, q1-sprint"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                {/* Personal Notes */}
                <div>
                  <label className="label">Personal Notes &amp; References</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Keep strategic observations, book citations, or execution reflections here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab !== 'basics' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (activeTab === 'notes') setActiveTab('planning');
                    else if (activeTab === 'planning') setActiveTab('targets');
                    else if (activeTab === 'targets') setActiveTab('basics');
                  }}
                >
                  Back
                </button>
              )}
              {activeTab !== 'notes' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (activeTab === 'basics') setActiveTab('targets');
                    else if (activeTab === 'targets') setActiveTab('planning');
                    else if (activeTab === 'planning') setActiveTab('notes');
                  }}
                >
                  Next Step
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 600 }}>
                {targetGoal ? 'Save Changes' : 'Create Strategic Goal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
