import React, { useState, useMemo } from 'react';
import { todayLocal, toLocalDateString } from '../lib/dates';
import {
  X,
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Calendar as CalendarIcon,
  Edit3,
  Trash2,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Layers,
  Target,
} from 'lucide-react';
import type { Habit, HabitEntry } from '../types';
import useStore, {
  isHabitScheduledOnDate,
  computeHabitStreak,
  computeHabitConsistency,
} from '../store/useStore';
import { HabitIcon } from './ui';

interface HabitDetailModalProps {
  habitId: string;
  onClose: () => void;
  onEditHabit: (habit: Habit) => void;
}

export default function HabitDetailModal({
  habitId,
  onClose,
  onEditHabit,
}: HabitDetailModalProps) {
  const habit = useStore((s) => s.habits.find((h) => h.id === habitId));
  const habitEntries = useStore((s) => s.habitEntries);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const recordHabitProgress = useStore((s) => s.recordHabitProgress);
  const skipHabitEntry = useStore((s) => s.skipHabitEntry);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const habitRoutines = useStore((s) => s.habitRoutines);
  const goals = useStore((s) => s.goals);

  const [activeTab, setActiveTab] = useState<'log' | 'calendar' | 'analytics' | 'protocol'>('log');
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal());
  const [logValue, setLogValue] = useState<number>(habit?.targetValue || 1);
  const [logNote, setLogNote] = useState<string>('');
  const [skipReason, setSkipReason] = useState<string>('');
  const [showSkipInput, setShowSkipInput] = useState<boolean>(false);

  // Month navigation state for Calendar Tab
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  if (!habit) return null;

  const entriesForHabit = useMemo(() => {
    return habitEntries.filter((e) => e.habitId === habitId);
  }, [habitEntries, habitId]);

  const entryMap = useMemo(() => {
    const map = new Map<string, HabitEntry>();
    entriesForHabit.forEach((e) => map.set(e.date, e));
    return map;
  }, [entriesForHabit]);

  const streakInfo = useMemo(() => {
    return computeHabitStreak(habit, entriesForHabit);
  }, [habit, entriesForHabit]);

  const consistency7d = useMemo(() => {
    return computeHabitConsistency(habit, entriesForHabit, 7);
  }, [habit, entriesForHabit]);

  const consistency30d = useMemo(() => {
    return computeHabitConsistency(habit, entriesForHabit, 30);
  }, [habit, entriesForHabit]);

  const consistency90d = useMemo(() => {
    return computeHabitConsistency(habit, entriesForHabit, 90);
  }, [habit, entriesForHabit]);

  const selectedDateEntry = entryMap.get(selectedDate);
  const isSelectedScheduled = isHabitScheduledOnDate(habit, selectedDate);
  const routine = habit.routineId ? habitRoutines.find((r) => r.id === habit.routineId) : undefined;
  const linkedGoal = habit.goalId ? goals.find((g) => g.id === habit.goalId) : undefined;

  const handleQuickToggleSelected = async () => {
    await toggleHabitEntry(habit.id, selectedDate);
  };

  const handleRecordProgress = async () => {
    await recordHabitProgress(habit.id, selectedDate, logValue, logNote.trim() || undefined);
    setLogNote('');
  };

  const handleSkip = async () => {
    await skipHabitEntry(habit.id, selectedDate, skipReason.trim() || undefined);
    setShowSkipInput(false);
    setSkipReason('');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove the habit "${habit.name}"?`)) {
      await deleteHabit(habit.id);
      onClose();
    }
  };

  // 70-day Matrix Data (10 weeks)
  const heatmapWeeks = useMemo(() => {
    const weeks: { dateStr: string; entry?: HabitEntry; isScheduled: boolean; dayOfWeek: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on upcoming Saturday or today
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    endDate.setDate(endDate.getDate() + daysUntilSaturday);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 69); // 70 days total

    let currentWeek: { dateStr: string; entry?: HabitEntry; isScheduled: boolean; dayOfWeek: number }[] = [];
    const curr = new Date(startDate);

    while (curr <= endDate) {
      const dStr = toLocalDateString(curr);
      const dow = curr.getDay();
      currentWeek.push({
        dateStr: dStr,
        entry: entryMap.get(dStr),
        isScheduled: isHabitScheduledOnDate(habit, dStr),
        dayOfWeek: dow,
      });

      if (currentWeek.length === 7 || curr.getTime() === endDate.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }

    return weeks;
  }, [habit, entryMap]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; entry?: HabitEntry; isScheduled: boolean }[] = [];

    // Prepend padding days from prev month
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      const dStr = toLocalDateString(prevDate);
      days.push({
        dateStr: dStr,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
        entry: entryMap.get(dStr),
        isScheduled: isHabitScheduledOnDate(habit, dStr),
      });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const curDate = new Date(year, month, d);
      const dStr = toLocalDateString(curDate);
      days.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        entry: entryMap.get(dStr),
        isScheduled: isHabitScheduledOnDate(habit, dStr),
      });
    }

    // Postpend days to complete the week grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let j = 1; j <= remaining; j++) {
        const nextDate = new Date(year, month + 1, j);
        const dStr = toLocalDateString(nextDate);
        days.push({
          dateStr: dStr,
          dayNum: j,
          isCurrentMonth: false,
          entry: entryMap.get(dStr),
          isScheduled: isHabitScheduledOnDate(habit, dStr),
        });
      }
    }

    return days;
  }, [calendarMonth, habit, entryMap]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '92vh',
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
        {/* Top Header */}
        <div
          className="modal-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: habit.color || '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: `0 6px 18px ${habit.color || '#6366F1'}40`,
                flexShrink: 0,
              }}
            >
              <HabitIcon icon={habit.icon} size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 className="modal-title" style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {habit.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {habit.category || 'Lifestyle'}
                </span>
                {habit.type && habit.type !== 'boolean' && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                    }}
                  >
                    {habit.type.toUpperCase()} • {habit.targetValue} {habit.unit}
                  </span>
                )}
              </div>
              {habit.description && (
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title="Edit Habit Protocol"
              onClick={() => onEditHabit(habit)}
              style={{ borderRadius: '8px' }}
            >
              <Edit3 size={17} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title="Delete Habit"
              onClick={handleDelete}
              style={{ borderRadius: '8px', color: 'var(--accent)' }}
            >
              <Trash2 size={17} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              style={{ borderRadius: '50%', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Executive Metric Cards Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            padding: '12px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Flame size={13} color="var(--accent-secondary)" />
              Current Streak
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {streakInfo.streak} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>days</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Trophy size={13} color="var(--accent-primary)" />
              Longest Streak
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {streakInfo.longestStreak} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>days</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <TrendingUp size={13} color="var(--status-success)" />
              30-Day Rate
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {consistency30d.rate}% <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>({consistency30d.completedCount}/{consistency30d.scheduledCount})</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <CheckCircle2 size={13} color="var(--accent)" />
              Lifetime Logs
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {streakInfo.totalCompletions} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>times</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            padding: '0 24px',
            backgroundColor: 'var(--bg-card)',
            gap: '12px',
          }}
        >
          {[
            { id: 'log', label: 'Daily Log & Notes', icon: <FileText size={14} /> },
            { id: 'calendar', label: 'Interactive Calendar', icon: <CalendarIcon size={14} /> },
            { id: 'analytics', label: '70-Day Heatmap & Trends', icon: <TrendingUp size={14} /> },
            { id: 'protocol', label: 'Protocol & Routine', icon: <Layers size={14} /> },
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
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
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

        {/* Tab Content Area */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: DAILY LOG & NOTES */}
          {activeTab === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Date Selector Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarIcon size={16} color="var(--accent)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Logging Date:
                  </span>
                  <input
                    type="date"
                    className="input"
                    style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => setSelectedDate(todayLocal())}
                  >
                    Today
                  </button>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isSelectedScheduled ? 'var(--status-success-bg)' : 'var(--bg-card)',
                      color: isSelectedScheduled ? '#4E632D' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {isSelectedScheduled ? 'Scheduled Day' : 'Unscheduled Day'}
                  </span>
                </div>
              </div>

              {/* Status Box for Selected Date */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: selectedDateEntry?.completed
                    ? 'rgba(78, 99, 45, 0.08)'
                    : selectedDateEntry?.status === 'skipped'
                    ? 'rgba(143, 84, 25, 0.08)'
                    : 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: selectedDateEntry?.completed
                          ? '#4E632D'
                          : selectedDateEntry?.status === 'skipped'
                          ? '#8F5419'
                          : 'var(--border)',
                        color: '#fff',
                      }}
                    >
                      {selectedDateEntry?.completed ? <Check size={18} /> : selectedDateEntry?.status === 'skipped' ? <Shield size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedDateEntry?.completed
                          ? 'Completed Protocol'
                          : selectedDateEntry?.status === 'skipped'
                          ? 'Rest / Skipped Day (Streak Protected)'
                          : selectedDateEntry?.status === 'partial'
                          ? `Partial Progress (${selectedDateEntry.value} / ${habit.targetValue || 1} ${habit.unit || ''})`
                          : 'Not Completed Yet'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {selectedDateEntry?.loggedAt
                          ? `Logged at ${new Date(selectedDateEntry.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Ready for action'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    type="button"
                    onClick={handleQuickToggleSelected}
                    className={`btn ${selectedDateEntry?.completed ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {selectedDateEntry?.completed ? 'Undo Completion' : 'Mark as Completed'}
                  </button>
                </div>

                {selectedDateEntry?.notes && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-card)', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)' }}>
                    <strong>Note:</strong> {selectedDateEntry.notes}
                  </div>
                )}
              </div>

              {/* Incremental / Numeric Value Logger */}
              {habit.type && habit.type !== 'boolean' && (
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Log Quantitative Metric ({habit.type.toUpperCase()})
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Target: {habit.targetValue} {habit.unit}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      onClick={() => setLogValue((v) => Math.max(0, v - (habit.type === 'duration' ? 5 : 1)))}
                    >
                      <Minus size={16} />
                    </button>

                    <input
                      type="number"
                      min="0"
                      className="input"
                      style={{ maxWidth: '120px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
                      value={logValue}
                      onChange={(e) => setLogValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />

                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {habit.unit || 'units'}
                    </span>

                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      onClick={() => setLogValue((v) => v + (habit.type === 'duration' ? 5 : 1))}
                    >
                      <Plus size={16} />
                    </button>

                    {/* Quick increment chips */}
                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => setLogValue(habit.targetValue || 1)}
                      >
                        Target ({habit.targetValue})
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => setLogValue((v) => v + 5)}
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => setLogValue((v) => v + 10)}
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="input"
                      placeholder="Add an optional reflection or context note..."
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleRecordProgress}
                      style={{ fontSize: '0.82rem' }}
                    >
                      Record {logValue} {habit.unit}
                    </button>
                  </div>
                </div>
              )}

              {/* Skip Habit / Preserve Streak Section */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <Shield size={16} color="#8F5419" />
                    <span>Need a rest or recovery day? Skip without breaking streak.</span>
                  </div>
                  {!showSkipInput && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', color: 'var(--status-warning)', fontWeight: 600 }}
                      onClick={() => setShowSkipInput(true)}
                    >
                      Skip Habit
                    </button>
                  )}
                </div>

                {showSkipInput && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Reason (e.g. Travel, Sick day, Recovery rest)"
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.78rem' }} onClick={handleSkip}>
                      Confirm Skip
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => setShowSkipInput(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CALENDAR */}
          {activeTab === 'calendar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Month Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    onClick={() => setCalendarMonth(new Date())}
                  >
                    Current Month
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day of Week Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {calendarDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isCompleted = d.entry?.completed || d.entry?.status === 'completed';
                  const isSkipped = d.entry?.status === 'skipped';
                  const isPartial = d.entry?.status === 'partial';

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setActiveTab('log');
                      }}
                      style={{
                        height: '64px',
                        padding: '6px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: isCompleted
                          ? 'var(--status-success-bg)'
                          : isSkipped
                          ? 'var(--status-warning-bg)'
                          : isPartial
                          ? 'var(--accent-subtle)'
                          : d.isCurrentMonth
                          ? 'var(--bg-card)'
                          : 'var(--bg-secondary)',
                        opacity: d.isCurrentMonth ? 1 : 0.45,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {d.dayNum}
                        </span>
                        {d.isScheduled && (
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
                        )}
                      </div>

                      <div style={{ width: '100%', textAlign: 'center' }}>
                        {isCompleted && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--status-success)', fontWeight: 700 }}>
                            ✓ {d.entry?.value ? `${d.entry.value}` : 'Done'}
                          </span>
                        )}
                        {isSkipped && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--status-warning)', fontWeight: 600 }}>
                            🛡️ Skip
                          </span>
                        )}
                        {isPartial && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600 }}>
                            {d.entry?.value} / {habit.targetValue}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.35)' }} />
                  Completed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.35)' }} />
                  Skipped (Preserved)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
                  Scheduled Day
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 70-DAY HEATMAP & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Heatmap Section */}
              <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      70-Day Consistency Heatmap (10 Weeks)
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Visual density matrix tracking execution rhythm
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {heatmapWeeks.length * 7} Days Tracked
                  </span>
                </div>

                {/* Heatmap Grid */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {week.map((day) => {
                        const isCompleted = day.entry?.completed || day.entry?.status === 'completed';
                        const isSkipped = day.entry?.status === 'skipped';
                        const isToday = day.dateStr === todayLocal();

                        let cellBg = 'var(--bg-card)';
                        if (isCompleted) cellBg = habit.color || '#6366F1';
                        else if (isSkipped) cellBg = 'var(--status-warning)';
                        else if (!day.isScheduled) cellBg = 'var(--bg-subtle)';

                        return (
                          <div
                            key={day.dateStr}
                            title={`${day.dateStr}: ${isCompleted ? 'Completed' : isSkipped ? 'Skipped' : day.isScheduled ? 'Missed' : 'Unscheduled'}`}
                            onClick={() => {
                              setSelectedDate(day.dateStr);
                              setActiveTab('log');
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              backgroundColor: cellBg,
                              border: isToday ? '2px solid #fff' : '1px solid rgba(0,0,0,0.06)',
                              cursor: 'pointer',
                              opacity: isCompleted ? 1 : isSkipped ? 0.75 : day.isScheduled ? 0.35 : 0.15,
                              transition: 'transform 0.1s ease',
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Consistency Rolling Windows */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>7-Day Horizon</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {consistency7d.rate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {consistency7d.completedCount} of {consistency7d.scheduledCount} target days
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>30-Day Adherence</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {consistency30d.rate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {consistency30d.completedCount} of {consistency30d.scheduledCount} target days
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>90-Day Mastery</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {consistency90d.rate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {consistency90d.completedCount} of {consistency90d.scheduledCount} target days
                  </div>
                </div>
              </div>

              {/* Automaticity Milestones */}
              <div style={{ padding: '16px 20px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Behavioral Automaticity Milestones
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
                  <div style={{ padding: '8px', borderRadius: '6px', background: streakInfo.streak >= 7 ? 'var(--status-success-bg)' : 'var(--bg-card)' }}>
                    <div style={{ fontWeight: 700, color: streakInfo.streak >= 7 ? '#4E632D' : 'var(--text-secondary)' }}>
                      7-Day Momentum {streakInfo.streak >= 7 ? '✓' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Initial friction overcome</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: streakInfo.streak >= 21 ? 'var(--status-success-bg)' : 'var(--bg-card)' }}>
                    <div style={{ fontWeight: 700, color: streakInfo.streak >= 21 ? '#4E632D' : 'var(--text-secondary)' }}>
                      21-Day Habituation {streakInfo.streak >= 21 ? '✓' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Neural pathway formation</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '6px', background: streakInfo.streak >= 66 ? 'var(--status-success-bg)' : 'var(--bg-card)' }}>
                    <div style={{ fontWeight: 700, color: streakInfo.streak >= 66 ? '#4E632D' : 'var(--text-secondary)' }}>
                      66-Day Identity Lock {streakInfo.streak >= 66 ? '✓' : ''}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automatic default identity</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROTOCOL & ROUTINE */}
          {activeTab === 'protocol' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '18px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Protocol Specifications
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Schedule Type:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {habit.scheduleType ? habit.scheduleType.toUpperCase() : 'DAILY'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tracking Modality:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {habit.type ? habit.type.toUpperCase() : 'BOOLEAN'} ({habit.targetValue || 1} {habit.unit || 'times'})
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Routine Stack:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {routine ? `${(routine.timeOfDay || 'anytime').toUpperCase()} • ${routine.title}` : 'Standalone (Unstacked)'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Connected Goal:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {linkedGoal ? linkedGoal.title : 'None (Atomic standalone)'}
                    </div>
                  </div>

                  {habit.startDate && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Protocol Established:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {habit.startDate}
                      </div>
                    </div>
                  )}

                  {habit.reminderEnabled && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Daily Notification Cue:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        🔔 Active at {habit.reminderTime || '08:00'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {habit.notes && (
                <div style={{ padding: '16px 20px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Implementation Strategy
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {habit.notes}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onEditHabit(habit)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={15} />
                  Edit Full Habit Protocol
                </button>
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
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Selected Date: <strong>{selectedDate}</strong> ({isSelectedScheduled ? 'Scheduled' : 'Rest day'})
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
