import React, { useState, useMemo } from 'react';
import { Plus, Repeat, Flame, Award, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
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
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Repeat size={26} color="var(--accent)" /> Habit Architecture & Heatmaps
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Identity-level habit loops with streak tracking, visual heatmaps, and consistency metrics.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingHabit(undefined);
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>COMPLETED TODAY</div>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 2px 0' }}>
            {completedToday} / {totalHabits}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {totalHabits > 0 ? `${Math.round((completedToday / totalHabits) * 100)}% completion` : 'No habits created'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 700 }}>ACTIVE STREAKS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--warning)' }}>
            {currentActiveStreaks}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consecutive routines alive</div>
        </div>

        <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>LONGEST RECORD</div>
          <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 2px 0', color: 'var(--success)' }}>
            {bestStreak} days
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All-time personal record</div>
        </div>
      </div>

      {/* VISUAL HABIT HEATMAP CARD (GitHub Contribution Style) */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Global Habit Consistency Heatmap (Past 60 Days)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-secondary)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124, 92, 252, 0.3)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124, 92, 252, 0.65)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#7c5cfc' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))', gap: '5px', padding: '10px 0' }}>
          {past60Days.map((dStr) => {
            const completedCount = habitEntries.filter((e) => e.date === dStr && e.completed).length;
            const intensity =
              completedCount === 0
                ? 'var(--bg-secondary)'
                : completedCount <= 2
                ? 'rgba(124, 92, 252, 0.3)'
                : completedCount <= 4
                ? 'rgba(124, 92, 252, 0.65)'
                : '#7c5cfc';

            return (
              <div
                key={dStr}
                title={`${dStr}: ${completedCount} habits completed`}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '3px',
                  background: intensity,
                  cursor: 'pointer',
                  border: dStr === todayStr ? '1px solid #fff' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCategory === c ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: selectedCategory === c ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedCategory === c ? '#fff' : 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredHabits.map((h) => (
          <HabitCard
            key={h.id}
            habit={h}
            onEdit={() => handleEdit(h)}
            onDelete={() => handleDelete(h.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <HabitModal
          habit={editingHabit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
