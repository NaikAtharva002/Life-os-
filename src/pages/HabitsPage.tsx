import React, { useState, useMemo } from 'react';
import { Plus, Repeat, Calendar } from 'lucide-react';
import useStore from '../store/useStore';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import type { Habit } from '../types';

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const deleteHabit = useStore((s) => s.deleteHabit);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed)
  ).length;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const currentActiveStreaks = habits.filter((h) => h.streak > 0).length;

  // Past 60 days for Visual Habit Heatmap
  const past60Days = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(Date.now() - (59 - i) * 86400000);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const categories = ['all', ...Array.from(new Set(habits.map((h) => h.category || 'General')))];

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory !== 'all' && (h.category || 'General') !== selectedCategory) return false;
    return true;
  });

  const handleEdit = (h: Habit) => {
    setEditingHabit(h);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this habit and its historical entries?')) {
      deleteHabit(id);
    }
  };

  return (
    <div className="page-container animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Repeat size={18} color="var(--text-primary)" />
            <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
              Habit Architecture & Heatmaps
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Daily consistency routines, streak velocity, and 60-day visual execution heatmap.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditingHabit(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={14} /> New Habit
        </button>
      </div>

      {/* KPI Row (Structured, tabular, solid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>COMPLETED TODAY</div>
          <div style={{ fontSize: '18px', fontWeight: 600, margin: '2px 0' }} className="tabular">
            {completedToday} / {totalHabits}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }} className="tabular">
            {totalHabits > 0 ? `${Math.round((completedToday / totalHabits) * 100)}% execution` : 'No habits created'}
          </div>
        </div>

        <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTIVE STREAKS</div>
          <div style={{ fontSize: '18px', fontWeight: 600, margin: '2px 0' }} className="tabular">
            {currentActiveStreaks}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Consecutive routines alive</div>
        </div>

        <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>LONGEST RECORD</div>
          <div style={{ fontSize: '18px', fontWeight: 600, margin: '2px 0' }} className="tabular">
            {bestStreak} days
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>All-time personal record</div>
        </div>
      </div>

      {/* VISUAL HABIT HEATMAP (Clean GitHub Emerald / Monochrome Style — NO purple) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="var(--text-primary)" />
            <h2 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0 }}>Global Habit Consistency Heatmap (Past 60 Days)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'rgba(16, 185, 129, 0.25)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'rgba(16, 185, 129, 0.55)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'var(--success)' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))', gap: '4px' }}>
          {past60Days.map((dStr) => {
            const countOnDay = habitEntries.filter((e) => e.date === dStr && e.completed).length;
            const intensity =
              totalHabits === 0
                ? 0
                : countOnDay === 0
                ? 0
                : countOnDay / totalHabits;

            const bg =
              intensity === 0
                ? 'var(--bg-secondary)'
                : intensity < 0.35
                ? 'rgba(16, 185, 129, 0.25)'
                : intensity < 0.7
                ? 'rgba(16, 185, 129, 0.55)'
                : 'var(--success)';

            return (
              <div
                key={dStr}
                title={`${dStr}: ${countOnDay} habits completed`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '2px',
                  background: bg,
                  border: intensity === 0 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                padding: '3px 8px',
                fontWeight: selectedCategory === cat ? 600 : 400,
                background: selectedCategory === cat ? 'var(--text-primary)' : 'var(--bg-card)',
                color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
          No habits recorded in this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredHabits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onEdit={() => handleEdit(h)}
              onDelete={() => handleDelete(h.id)}
            />
          ))}
        </div>
      )}

      {/* Habit Modal */}
      {isModalOpen && (
        <HabitModal
          habit={editingHabit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHabit(undefined);
          }}
        />
      )}
    </div>
  );
}
