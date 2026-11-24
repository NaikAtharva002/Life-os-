import React, { useState, useMemo } from 'react';
import { Plus, Repeat, Calendar, Check, Edit2, Trash2, LayoutGrid, List, Flame, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import HabitModal from '../components/HabitModal';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';
import type { Habit } from '../types';
import { getPhoto } from '../utils/photoAssets';

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'photographic' | 'table'>('photographic');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => {
    const entries = h.entries || habitEntries.filter((e) => e.habitId === h.id);
    return entries.some((e) => e.date === todayStr && e.completed);
  }).length;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);
  const activeStreaksCount = habits.filter((h) => (h.streak || 0) > 0).length;

  // Past 70 days (10 weeks) for weekly consistency heatmap
  const heatmapWeeks = useMemo(() => {
    const today = new Date();
    const totalDays = 70;
    const days: { dateStr: string; date: Date; dayIndex: number }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      days.push({
        dateStr: str,
        date: d,
        dayIndex: d.getDay(),
      });
    }

    const weeks: { dateStr: string; date: Date; dayIndex: number }[][] = [];
    let currentWeek: { dateStr: string; date: Date; dayIndex: number }[] = [];

    days.forEach((item) => {
      currentWeek.push(item);
      if (item.dayIndex === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return weeks;
  }, []);

  // Compute daily completion count across all habits for heatmap
  const getDailyCompletionLevel = (dateStr: string) => {
    if (habits.length === 0) return 0;
    const doneCount = habits.filter((h) =>
      habitEntries.some((e) => e.habitId === h.id && e.date === dateStr && e.completed)
    ).length;
    const ratio = doneCount / habits.length;
    if (ratio === 0) return 0;
    if (ratio <= 0.33) return 1;
    if (ratio <= 0.66) return 2;
    return 3;
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return 'rgba(107, 43, 6, 0.35)';
      case 2:
        return 'rgba(184, 12, 9, 0.55)';
      case 3:
        return 'var(--palette-brick)';
      default:
        return 'var(--bg-subtle)';
    }
  };

  // Habit photo mapping helper
  const getHabitImage = (name: string, idx: number) => {
    const n = (name || '').toLowerCase();
    if (n.includes('read') || n.includes('book')) return getPhoto('habit-reading').path;
    if (n.includes('sleep') || n.includes('rest')) return getPhoto('habit-sleep').path;
    if (n.includes('water') || n.includes('hydrat')) return getPhoto('habit-hydration').path;
    if (n.includes('work') || n.includes('code') || n.includes('study')) return getPhoto('habit-deepwork').path;
    if (n.includes('gym') || n.includes('workout') || n.includes('run')) return getPhoto('gym-weights').path;
    const pool = [getPhoto('habit-reading').path, getPhoto('habit-deepwork').path, getPhoto('habit-sleep').path, getPhoto('habit-hydration').path];
    return pool[idx % pool.length];
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    habits.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter((h) => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. EDITORIAL PHOTOGRAPHIC HERO BANNER */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '220px',
          backgroundImage: `url(${getPhoto('habit-reading').path})`,
          backgroundPosition: 'center 45%',
        }}
      >
        <div className="editorial-hero-scrim" />

        <div className="editorial-hero-content" style={{ padding: '24px 32px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-light)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              Daily Rituals &amp; Habits
            </span>
            <h1
              className="font-editorial"
              style={{
                fontSize: '32px',
                fontWeight: 500,
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              The Architecture of Consistency
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '520px' }}>
              We don't rise to the level of our goals; we fall to the level of our daily systems.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingHabit(undefined);
              setIsModalOpen(true);
            }}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Plus size={15} /> Add Habit
          </button>
        </div>
      </section>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="habits_intro"
        icon={Repeat}
        title="Daily Habit Loops & Momentum"
        description="Consistency over intensity. Build automatic routines by tracking 7-day completion matrices and streak milestones."
        actionText="Add Habit"
        onAction={() => {
          setEditingHabit(undefined);
          setIsModalOpen(true);
        }}
        style={{ marginBottom: '14px' }}
      />

      {/* 2. STATS & SUMMARY STRIP */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Total Habits: <strong style={{ color: 'var(--text-primary)' }} className="tabular">{totalHabits}</strong>
          </span>
          <span style={{ width: '1px', height: '14px', background: 'var(--border-default)' }} />
          <span style={{ color: 'var(--accent-primary)' }}>
            Completed Today: <strong className="tabular">{completedToday}/{totalHabits}</strong> ({totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 100}%)
          </span>
          <span style={{ width: '1px', height: '14px', background: 'var(--border-default)' }} />
          <span style={{ color: 'var(--status-warning)' }}>
            Best Active Streak: <strong className="tabular">{bestStreak} days</strong>
          </span>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('photographic')}
            className={`btn btn-sm ${viewMode === 'photographic' ? 'btn-primary' : 'btn-secondary'}`}
            title="Photographic Cards"
          >
            <LayoutGrid size={13} /> Photographic
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            title="Data Table"
          >
            <List size={13} /> Table
          </button>
        </div>
      </div>

      {/* 3. 70-DAY NATURAL EMERALD CONSISTENCY HEATMAP */}
      <section className="editorial-island">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
              10-Week Consistency Heatmap
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Daily adherence rhythm across all active habits
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-subtle)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(107, 43, 6, 0.35)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(184, 12, 9, 0.55)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--palette-brick)' }} />
            <span>More</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px' }}>
          {heatmapWeeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {week.map((day) => {
                const level = getDailyCompletionLevel(day.dateStr);
                const isToday = day.dateStr === todayStr;
                return (
                  <div
                    key={day.dateStr}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      background: getHeatmapColor(level),
                      border: isToday ? '1px solid #ffffff' : 'none',
                      cursor: 'pointer',
                    }}
                    title={`${day.dateStr}: ${level > 0 ? `Level ${level}` : 'No completion'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONTENT: PHOTOGRAPHIC HABIT TILES OR TABLE */}
      {filteredHabits.length === 0 ? (
        <div className="card" style={{ padding: '36px 20px' }}>
          {habits.length === 0 ? (
            <EmptyState
              illustration="habits"
              badge="Clean Slate"
              title="Small actions create lasting change."
              description="Anchor your daily routine with small disciplines. Build momentum one checkmark at a time."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingHabit(undefined);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Build your first habit
                </button>
              }
            />
          ) : (
            <EmptyState
              illustration="habits"
              badge="Filtered View"
              title="No matching habits found"
              description="No habits match your active category filter."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedCategory('all')}
                >
                  Clear filter
                </button>
              }
              secondaryAction={
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingHabit(undefined);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Add Habit
                </button>
              }
            />
          )}
        </div>
      ) : viewMode === 'photographic' ? (
        /* PHOTOGRAPHIC HABIT TILES GRID */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredHabits.map((h, idx) => {
            const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed);
            const photoUrl = getHabitImage(h.name, idx);

            return (
              <div
                key={h.id}
                className="photo-tile"
                style={{
                  borderColor: isDone ? 'var(--palette-brick-border)' : 'var(--border-default)',
                }}
              >
                {/* Visual Header */}
                <div className="photo-tile-image-wrap" style={{ height: '140px' }}>
                  <img
                    src={photoUrl}
                    alt={h.name}
                    className="photo-tile-img"
                    loading="lazy"
                  />
                  <div className="photo-tile-scrim" />

                  {/* Streak Flame Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--status-warning)',
                      background: 'rgba(20, 19, 1, 0.85)',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(184, 12, 9, 0.3)',
                    }}
                  >
                    <Flame size={13} color="var(--palette-brick)" fill="var(--palette-brick)" />
                    <span className="tabular">{h.streak || 7}d streak</span>
                  </div>

                  {/* Actions */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => {
                        setEditingHabit(h);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.8)', backdropFilter: 'blur(6px)' }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete habit "${h.name}"?`)) deleteHabit(h.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.8)', color: 'var(--status-danger)', backdropFilter: 'blur(6px)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Habit Body */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                        {h.name}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {h.category || 'Daily Habit'} · {h.frequency === 'weekly' ? 'Weekly' : 'Daily'}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleHabitEntry(h.id, todayStr)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: isDone ? 'none' : '1px solid var(--border-default)',
                        background: isDone ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                        color: isDone ? '#FFFFFF' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={isDone ? 'Completed today' : 'Mark complete'}
                    >
                      <Check size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {h.description && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {h.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Longest streak: <strong style={{ color: 'var(--text-primary)' }} className="tabular">{h.longestStreak || h.streak || 0}d</strong></span>
                    <span style={{ color: isDone ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      {isDone ? '✓ Completed today' : 'Pending today'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Habit</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Streak</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Best Streak</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Today</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHabits.map((h) => {
                const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && e.completed);
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{h.category}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="tabular" style={{ color: 'var(--status-warning)', fontWeight: 600 }}>🔥 {h.streak || 0}d</span>
                    </td>
                    <td style={{ padding: '10px 14px' }} className="tabular">{h.longestStreak || 0}d</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleHabitEntry(h.id, todayStr)}
                        className={`btn btn-sm ${isDone ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '2px 8px' }}
                      >
                        {isDone ? '✓ Done' : 'Log'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingHabit(h);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete habit "${h.name}"?`)) deleteHabit(h.id);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-danger)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
