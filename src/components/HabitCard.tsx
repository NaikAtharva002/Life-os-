import React from 'react';
import { Award, Check, Edit2, Trash2, Flame, Shield } from 'lucide-react';
import type { Habit } from '../types';
import useStore, { isHabitScheduledOnDate } from '../store/useStore';

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDetail?: () => void;
}

export default function HabitCard({ habit, onEdit, onDelete, onOpenDetail }: HabitCardProps) {
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const habitEntries = useStore((s) => s.habitEntries);

  const todayStr = new Date().toISOString().split('T')[0];
  const entries = habit.entries || habitEntries.filter((e) => e.habitId === habit.id);
  const todayEntry = entries.find((e) => e.date === todayStr);
  const isTodayCompleted = todayEntry && (todayEntry.completed || todayEntry.status === 'completed');
  const isTodaySkipped = todayEntry && todayEntry.status === 'skipped';
  const isScheduledToday = isHabitScheduledOnDate(habit, todayStr);

  // Last 7 days dates
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const getDayLetter = (dateStr: string) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()];
  };

  const handleToggleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleHabitEntry(habit.id, todayStr);
  };

  const handleToggleDate = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    toggleHabitEntry(habit.id, dateStr);
  };

  return (
    <div
      onClick={onOpenDetail}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'var(--bg-card)',
        padding: '14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.12s ease',
        cursor: onOpenDetail ? 'pointer' : 'default',
      }}
    >
      {/* Top Header: Name + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{habit.icon || '⚡'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
              {habit.name}
            </div>
            {habit.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                {habit.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="btn btn-ghost btn-sm" style={{ padding: '3px', color: 'var(--text-muted)' }}>
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ padding: '3px', color: 'var(--accent)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Streak Counter Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-xs)',
          fontSize: '11.5px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={13} color="#B80C09" />
          <span style={{ color: 'var(--text-muted)' }}>Streak:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {habit.streak || 0} days
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Record:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }} className="tabular">
            {habit.longestStreak || 0} days
          </span>
        </div>
      </div>

      {/* 7-Day History Mini Strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '5px' }}>
          <span>Past 7 days</span>
          <span>Click to toggle</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {last7Days.map((dStr) => {
            const entry = entries.find((e) => e.date === dStr);
            const isCompleted = entry && (entry.completed || entry.status === 'completed');
            const isSkipped = entry && entry.status === 'skipped';
            const isToday = dStr === todayStr;

            return (
              <button
                key={dStr}
                onClick={(e) => handleToggleDate(e, dStr)}
                style={{
                  padding: '5px 2px',
                  borderRadius: 'var(--radius-xs)',
                  border: isToday ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  background: isCompleted ? 'var(--text-primary)' : isSkipped ? '#8F5419' : 'var(--bg-secondary)',
                  color: isCompleted || isSkipped ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  transition: 'opacity 0.1s ease',
                }}
              >
                <span>{getDayLetter(dStr)}</span>
                <span>{isCompleted ? '✓' : isSkipped ? '🛡️' : '·'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Today Toggle */}
      <button
        onClick={handleToggleToday}
        className={isTodayCompleted ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
        style={{
          width: '100%',
          padding: '6px 10px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {isTodayCompleted ? <Check size={14} /> : null}
        {isTodayCompleted ? 'Completed Today' : isTodaySkipped ? 'Skipped Today (Protected)' : isScheduledToday ? 'Complete Today' : 'Log (Rest Day)'}
      </button>
    </div>
  );
}
