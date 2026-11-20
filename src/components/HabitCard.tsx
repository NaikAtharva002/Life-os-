import React from 'react';
import { Award, Check, Edit2, Trash2 } from 'lucide-react';
import type { Habit } from '../types';
import useStore from '../store/useStore';

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const habitEntries = useStore((s) => s.habitEntries);

  const todayStr = new Date().toISOString().split('T')[0];
  const entries = habit.entries || habitEntries.filter((e) => e.habitId === habit.id);
  const isTodayCompleted = entries.some((e) => e.date === todayStr && e.completed);

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

  const handleToggleToday = () => {
    toggleHabitEntry(habit.id, todayStr);
  };

  const handleToggleDate = (dateStr: string) => {
    toggleHabitEntry(habit.id, dateStr);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'var(--bg-card)',
        padding: '14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.12s ease',
      }}
    >
      {/* Top Header: Name + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={onEdit} className="btn btn-ghost btn-sm" style={{ padding: '3px', color: 'var(--text-muted)' }}>
            <Edit2 size={12} />
          </button>
          <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ padding: '3px', color: 'var(--text-muted)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Streak Counter Strip (Tabular, clean) */}
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
          <span style={{ color: 'var(--text-muted)' }}>Current:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular">
            {habit.streak} days
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Record:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }} className="tabular">
            {habit.longestStreak} days
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
            const isCompleted = entries.some((e) => e.date === dStr && e.completed);
            const isToday = dStr === todayStr;

            return (
              <button
                key={dStr}
                onClick={() => handleToggleDate(dStr)}
                style={{
                  padding: '5px 2px',
                  borderRadius: 'var(--radius-xs)',
                  border: isToday ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  background: isCompleted ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: isCompleted ? 'var(--bg-primary)' : 'var(--text-secondary)',
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
                <span>{isCompleted ? '✓' : '·'}</span>
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
        }}
      >
        <Check size={14} />
        {isTodayCompleted ? 'Completed Today' : 'Mark Done Today'}
      </button>
    </div>
  );
}
