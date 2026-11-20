import React from 'react';
import { Flame, Award, Check, Edit2, Trash2 } from 'lucide-react';
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
      className="card"
      style={{
        borderLeft: `4px solid ${habit.color || 'var(--accent)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '16px',
        borderRadius: '12px',
        borderTop: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Top Header: Icon + Name + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: `${habit.color}22`,
              color: habit.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            {habit.icon || '⚡'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              {habit.name}
            </div>
            {habit.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {habit.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onEdit} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Streak Counter Strip */}
      <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color="var(--warning)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {habit.streak} days
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={16} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {habit.longestStreak} days
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>best</span>
        </div>
      </div>

      {/* 7-Day History Mini Strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
          <span>LAST 7 DAYS</span>
          <span>Click day to toggle</span>
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
                  padding: '6px 2px',
                  borderRadius: '6px',
                  border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isCompleted ? (habit.color || 'var(--accent)') : 'var(--bg-secondary)',
                  color: isCompleted ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 700,
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
        className={isTodayCompleted ? 'btn btn-secondary' : 'btn btn-primary'}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px',
        }}
      >
        <Check size={16} />
        {isTodayCompleted ? 'Completed Today' : 'Mark Done Today'}
      </button>
    </div>
  );
}
