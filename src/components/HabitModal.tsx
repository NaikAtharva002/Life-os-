import React, { useState, useMemo } from 'react';
import { todayLocal } from '../lib/dates';
import {
  X,
  Sparkles,
  Calendar,
  Target,
  Shield,
  Hash,
  Timer,
  Repeat,
  Layers,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import type { Habit, HabitType, HabitScheduleType } from '../types';
import useStore from '../store/useStore';

interface HabitModalProps {
  habit?: Habit;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  'Productivity',
  'Fitness',
  'Health',
  'Learning',
  'Academics',
  'Career',
  'Finance',
  'Mindfulness',
  'Lifestyle',
  'Personal',
];

const EMOJI_OPTIONS = [
  '⚡', '🏃', '🧘', '💧', '📚', '💪', '🍎', '😴',
  '🎯', '🧠', '✍️', '🎵', '🚴', '💻', '🌿', '☕',
  '🎨', '🛡️', '🥗', '🚶', '🔋', '📖', '🏊', '🍳'
];

const COLOR_OPTIONS = [
  '#6366F1', // Electric Indigo
  '#3B82F6', // Cobalt Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber Momentum
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

const TRACKING_TYPES: { id: HabitType; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'boolean', label: 'Checkoff', desc: 'Simple completed / missed toggle', icon: <CheckCircle2 size={16} /> },
  { id: 'numeric', label: 'Numeric', desc: 'Count with target & unit (e.g. 20 pages)', icon: <Hash size={16} /> },
  { id: 'duration', label: 'Duration', desc: 'Minutes spent in focus (e.g. 30 mins)', icon: <Timer size={16} /> },
  { id: 'frequency', label: 'Repetitions', desc: 'Repetitions per day (e.g. 3 walks)', icon: <Repeat size={16} /> },
  { id: 'negative', label: 'Avoidance', desc: 'Non-shame tracking (0 is a victory)', icon: <Shield size={16} /> },
];

const SCHEDULE_TYPES: { id: HabitScheduleType; label: string; desc: string }[] = [
  { id: 'daily', label: 'Daily', desc: 'Scheduled all 7 days' },
  { id: 'weekdays', label: 'Weekdays', desc: 'Specific chosen days' },
  { id: 'weekly_target', label: 'Weekly Target', desc: 'X times per week' },
  { id: 'monthly_dates', label: 'Monthly Dates', desc: 'Specific days of month' },
  { id: 'custom_interval', label: 'Interval', desc: 'Every X days' },
];

export default function HabitModal({ habit, onClose }: HabitModalProps) {
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const habitRoutines = useStore((s) => s.habitRoutines);
  const allGoals = useStore((s) => s.goals);
  const goals = useMemo(() => allGoals.filter((g) => !g.isArchived), [allGoals]);

  const [activeTab, setActiveTab] = useState<'basics' | 'tracking' | 'schedule' | 'integration'>('basics');

  // Basics
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [category, setCategory] = useState(habit?.category || 'Productivity');
  const [icon, setIcon] = useState(habit?.icon || '⚡');
  const [color, setColor] = useState(habit?.color || '#6366F1');
  const [routineId, setRoutineId] = useState(habit?.routineId || '');

  // Tracking
  const [type, setType] = useState<HabitType>(habit?.type || 'boolean');
  const [targetValue, setTargetValue] = useState<number>(habit?.targetValue || (habit?.type === 'duration' ? 30 : habit?.type === 'numeric' ? 10 : 1));
  const [unit, setUnit] = useState<string>(habit?.unit || (habit?.type === 'duration' ? 'mins' : habit?.type === 'numeric' ? 'pages' : 'times'));

  // Schedule
  const [scheduleType, setScheduleType] = useState<HabitScheduleType>(habit?.scheduleType || (habit?.frequency === 'weekly' ? 'weekly_target' : 'daily'));
  const [scheduleDays, setScheduleDays] = useState<number[]>(habit?.scheduleDays || (habit?.targetDays?.length ? habit.targetDays : [1, 2, 3, 4, 5]));
  const [targetDays, setTargetDays] = useState<number[]>(habit?.targetDays || [0, 1, 2, 3, 4, 5, 6]);
  const [weeklyTargetCount, setWeeklyTargetCount] = useState<number>(habit?.weeklyTargetCount || 3);
  const [monthlyDates, setMonthlyDates] = useState<string>(habit?.monthlyDates ? habit.monthlyDates.join(', ') : '1, 15');
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(habit?.customIntervalDays || 2);
  const [startDate, setStartDate] = useState(habit?.startDate || todayLocal());
  const [endDate, setEndDate] = useState(habit?.endDate || '');

  // Integration & Reminders
  const [goalId, setGoalId] = useState(habit?.goalId || '');
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '08:00');
  const [notes, setNotes] = useState(habit?.notes || '');

  const toggleScheduleDay = (dayIndex: number) => {
    if (scheduleDays.includes(dayIndex)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter((d) => d !== dayIndex).sort());
      }
    } else {
      setScheduleDays([...scheduleDays, dayIndex].sort());
    }
  };

  const setWeekdayPreset = (preset: 'all' | 'workdays' | 'weekends') => {
    if (preset === 'all') setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
    else if (preset === 'workdays') setScheduleDays([1, 2, 3, 4, 5]);
    else if (preset === 'weekends') setScheduleDays([0, 6]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse monthly dates
    const parsedMonthlyDates = monthlyDates
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 31);

    // Synchronize targetDays for backward-compatibility with dashboard
    let computedTargetDays: number[];
    if (scheduleType === 'weekdays') {
      computedTargetDays = scheduleDays;
    } else {
      computedTargetDays = [0, 1, 2, 3, 4, 5, 6];
    }

    const habitPayload: Partial<Habit> = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      icon,
      color,
      type,
      targetValue: type === 'boolean' ? 1 : Number(targetValue) || 1,
      unit: type === 'boolean' ? 'times' : unit.trim() || 'units',
      scheduleType,
      scheduleDays: scheduleType === 'weekdays' ? scheduleDays : undefined,
      targetDays: computedTargetDays,
      weeklyTargetCount: scheduleType === 'weekly_target' ? Number(weeklyTargetCount) || 3 : undefined,
      monthlyDates: scheduleType === 'monthly_dates' ? parsedMonthlyDates : undefined,
      customIntervalDays: scheduleType === 'custom_interval' ? Number(customIntervalDays) || 2 : undefined,
      frequency: scheduleType === 'weekly_target' ? 'weekly' : 'daily',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      goalId: goalId || undefined,
      routineId: routineId || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      notes: notes.trim() || undefined,
    };

    if (habit) {
      updateHabit(habit.id, habitPayload);
    } else {
      addHabit(habitPayload as any);
    }
    onClose();
  };

  const daysLabels = [
    { idx: 0, label: 'Sun' },
    { idx: 1, label: 'Mon' },
    { idx: 2, label: 'Tue' },
    { idx: 3, label: 'Wed' },
    { idx: 4, label: 'Thu' },
    { idx: 5, label: 'Fri' },
    { idx: 6, label: 'Sat' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: '620px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(9, 9, 11, 0.35)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: `0 4px 14px ${color}40`,
              }}
            >
              {icon}
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {habit ? 'Refine Habit Protocol' : 'Architect New Habit'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Habit Tracking 2.0 • Atomic identity and behavioral consistency
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0 16px',
            gap: '8px',
          }}
        >
          {[
            { id: 'basics', label: 'Identity & Cue', icon: <Sparkles size={14} /> },
            { id: 'tracking', label: 'Tracking & Targets', icon: <Target size={14} /> },
            { id: 'schedule', label: 'Schedule & Rhythms', icon: <Calendar size={14} /> },
            { id: 'integration', label: 'Goal & Routine', icon: <Layers size={14} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            className="modal-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* TAB 1: BASICS */}
            {activeTab === 'basics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Habit Name <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Read 20 Pages Non-Fiction, 100 Pushups, Deep Hydration"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    required
                    style={{ fontSize: '0.95rem', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Behavioral Cue / Implementation Intention
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 'After morning pour-over, sit in reading chair with Kindle'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Habit stacking formula: <em>After [CURRENT HABIT], I will [NEW HABIT].</em>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Category</label>
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

                  <div>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Routine Stack</label>
                    <select
                      className="input"
                      value={routineId}
                      onChange={(e) => setRoutineId(e.target.value)}
                    >
                      <option value="">None (Standalone)</option>
                      {habitRoutines.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.timeOfDay === 'morning' ? '🌅 ' : r.timeOfDay === 'afternoon' ? '☀️ ' : '🌙 '}
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Emoji Emblem</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setIcon(e)}
                        style={{
                          fontSize: '18px',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          border: icon === e ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: icon === e ? 'var(--bg-secondary)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Accent Brand Palette</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: c,
                          border: color === c ? '3px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                          outline: color === c ? `2px solid ${c}` : 'none',
                          boxShadow: color === c ? `0 2px 8px ${c}60` : 'none',
                          transition: 'transform 0.1s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TRACKING & TARGETS */}
            {activeTab === 'tracking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Tracking Modality</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {TRACKING_TYPES.map((t) => {
                      const isSelected = type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setType(t.id);
                            if (t.id === 'duration' && unit === 'pages') setUnit('mins');
                            if (t.id === 'numeric' && unit === 'mins') setUnit('units');
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '12px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isSelected ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {t.icon}
                            {t.label}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                            {t.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Target Inputs */}
                {type === 'boolean' && (
                  <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} color="var(--accent)" />
                      Binary Completion Mode
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Quick 1-click checkoff from dashboard, mobile view, or checklist cards. Ideal for habits like "Morning Meditation" or "Take Vitamins".
                    </p>
                  </div>
                )}

                {(type === 'numeric' || type === 'duration' || type === 'frequency') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div>
                      <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {type === 'duration' ? 'Target Minutes' : type === 'frequency' ? 'Daily Repetitions' : 'Target Value'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input"
                        value={targetValue}
                        onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      />
                    </div>

                    <div>
                      <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Measurement Unit</label>
                      <input
                        type="text"
                        className="input"
                        placeholder={type === 'duration' ? 'mins' : type === 'frequency' ? 'times' : 'pages, ml, reps'}
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Allows incremental progress logging throughout the day (e.g. logging 10 of 20 pages updates adherence).
                      </span>
                    </div>
                  </div>
                )}

                {type === 'negative' && (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(78, 99, 45, 0.08)', border: '1px solid rgba(78, 99, 45, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontWeight: 600, fontSize: '0.88rem' }}>
                      <Shield size={18} />
                      Non-Judgmental Avoidance Protocol
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      Designed for negative habit reduction (e.g. "Zero Sugar", "No Nicotine", "Limit Social Media").
                      Logging <strong>0 incidents</strong> counts as a full 100% adherence victory. Any setback is captured with empathetic recovery notes without shaming.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SCHEDULE & RHYTHMS */}
            {activeTab === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Schedule Frequency</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                    {SCHEDULE_TYPES.map((st) => {
                      const isSelected = scheduleType === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setScheduleType(st.id)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          }}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weekdays picker */}
                {scheduleType === 'weekdays' && (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label className="label" style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Selected Active Days</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '2px 8px' }} onClick={() => setWeekdayPreset('workdays')}>
                          Mon-Fri
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '2px 8px' }} onClick={() => setWeekdayPreset('weekends')}>
                          Weekends
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '2px 8px' }} onClick={() => setWeekdayPreset('all')}>
                          All
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {daysLabels.map((d) => {
                        const isSelected = scheduleDays.includes(d.idx);
                        return (
                          <button
                            key={d.idx}
                            type="button"
                            onClick={() => toggleScheduleDay(d.idx)}
                            style={{
                              flex: 1,
                              padding: '8px 0',
                              fontSize: '12px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--accent)' : 'var(--bg-card)',
                              color: isSelected ? '#fff' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                            }}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                      Streaks only count scheduled days! Non-scheduled days never break your streak.
                    </span>
                  </div>
                )}

                {/* Weekly target count */}
                {scheduleType === 'weekly_target' && (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Times Per Week Target</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        className="input"
                        style={{ maxWidth: '120px' }}
                        value={weeklyTargetCount}
                        onChange={(e) => setWeeklyTargetCount(Math.min(7, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>completions / week</span>
                    </div>
                  </div>
                )}

                {/* Monthly dates */}
                {scheduleType === 'monthly_dates' && (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Days of the Month (Comma-separated)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 1, 15, 30"
                      value={monthlyDates}
                      onChange={(e) => setMonthlyDates(e.target.value)}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Ideal for recurring monthly rituals, reviews, or financial budgeting audits.
                    </span>
                  </div>
                )}

                {/* Custom interval */}
                {scheduleType === 'custom_interval' && (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Repeat Frequency</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every</span>
                      <input
                        type="number"
                        min="2"
                        className="input"
                        style={{ maxWidth: '100px' }}
                        value={customIntervalDays}
                        onChange={(e) => setCustomIntervalDays(Math.max(2, parseInt(e.target.value, 10) || 2))}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>days</span>
                    </div>
                  </div>
                )}

                {/* Timeline dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>End Date (Optional)</label>
                    <input
                      type="date"
                      className="input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INTEGRATION & ROUTINE */}
            {activeTab === 'integration' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Linked Goal */}
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Connect to Goal</label>
                  <select
                    className="input"
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                  >
                    <option value="">No Direct Goal Link</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.category ? `[${g.category}] ` : ''}{g.title} ({g.progress}% done)
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    When linked to a habit-based goal, completions automatically update 30-day goal adherence!
                  </span>
                </div>

                {/* Daily Reminder */}
                <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={18} color="var(--accent)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Daily Reminder Notification</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger cue notification at designated time</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                  {reminderEnabled && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="time"
                        className="input"
                        style={{ maxWidth: '140px' }}
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Daily trigger time</span>
                    </div>
                  )}
                </div>

                {/* Additional Strategy Notes */}
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Implementation Notes & Strategy</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. Keep workout gear by bed. Friction reduction: kindle placed on pillow before leaving for work."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {activeTab === 'basics' ? '1' : activeTab === 'tracking' ? '2' : activeTab === 'schedule' ? '3' : '4'} of 4
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                {habit ? 'Save Habit Protocol' : 'Deploy Habit Protocol'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
