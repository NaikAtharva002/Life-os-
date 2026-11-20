import React, { useState, useMemo } from 'react';
import { Plus, Repeat, Calendar, Check, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import useStore from '../store/useStore';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import type { Habit } from '../types';

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => {
    const entries = h.entries || habitEntries.filter((e) => e.habitId === h.id);
    return entries.some((e) => e.date === todayStr && e.completed);
  }).length;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);
  const activeStreaksCount = habits.filter((h) => (h.streak || 0) > 0).length;

  // Last 7 days dates for mini-trackers
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const str = d.toISOString().split('T')[0];
      const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      return {
        dateStr: str,
        dayName: days[d.getDay()],
        isToday: str === todayStr,
      };
    });
  }, [todayStr]);

  // Past 70 days (10 weeks) for weekly structured heatmap
  const heatmapWeeks = useMemo(() => {
    // Generate dates aligned to weeks (Sun to Sat or Mon to Sun)
    // 10 weeks = 70 days ending on today's week end
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun
    const totalDays = 70;
    const days: { dateStr: string; date: Date; month: string; dayIndex: number }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      days.push({
        dateStr: str,
        date: d,
        month: d.toLocaleString('default', { month: 'short' }),
        dayIndex: d.getDay(),
      });
    }

    // Group into 7 rows (one per day of week 0-6: Sun-Sat)
    // or group into columns of weeks
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];

    days.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === days.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return { weeks, days };
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
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Repeat size={18} color="var(--accent)" />
            <h1 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
              Habits & Daily Consistency
            </h1>
          </div>
          <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
            Build consistency through daily routines and longitudinal tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                padding: '4px 8px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Table View"
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'cards' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                padding: '4px 8px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={13} /> Cards
            </button>
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
      </div>

      {/* Compact Overview Line (replaces bulky cards) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Completed today:</span>
          <span style={{ fontWeight: 700, color: completedToday === totalHabits && totalHabits > 0 ? 'var(--success)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {completedToday}/{totalHabits}
          </span>
          {totalHabits > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontVariantNumeric: 'tabular-nums' }}>
              ({Math.round((completedToday / totalHabits) * 100)}%)
            </span>
          )}
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active habits:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {totalHabits}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active streaks:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {activeStreaksCount}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Current best streak:</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {bestStreak}d
          </span>
        </span>
      </div>

      {/* Labeled Consistency Heatmap */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          padding: '12px 14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Consistency Heatmap (Past 70 Days)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'rgba(16, 185, 129, 0.25)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'rgba(16, 185, 129, 0.55)' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '1px', background: 'var(--success)' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap with Weekday and Month labels */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {/* Weekday labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              fontSize: '9px',
              color: 'var(--text-muted)',
              lineHeight: '12px',
              paddingRight: '2px',
            }}
          >
            <span style={{ height: '12px' }}>Sun</span>
            <span style={{ height: '12px' }}>Mon</span>
            <span style={{ height: '12px' }}>Tue</span>
            <span style={{ height: '12px' }}>Wed</span>
            <span style={{ height: '12px' }}>Thu</span>
            <span style={{ height: '12px' }}>Fri</span>
            <span style={{ height: '12px' }}>Sat</span>
          </div>

          {/* Weeks Columns */}
          <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
            {heatmapWeeks.weeks.map((week, wIdx) => {
              const firstDay = week[0];
              const showMonth = wIdx === 0 || (firstDay && firstDay.date.getDate() <= 7);

              return (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: '12px' }}>
                  {week.map((item) => {
                    const countOnDay = habitEntries.filter((e) => e.date === item.dateStr && e.completed).length;
                    const intensity =
                      totalHabits === 0 ? 0 : countOnDay === 0 ? 0 : countOnDay / totalHabits;

                    const bg =
                      intensity === 0
                        ? 'var(--bg-secondary)'
                        : intensity < 0.35
                        ? 'rgba(16, 185, 129, 0.25)'
                        : intensity < 0.7
                        ? 'rgba(16, 185, 129, 0.55)'
                        : 'var(--success)';

                    const isToday = item.dateStr === todayStr;

                    return (
                      <div
                        key={item.dateStr}
                        title={`${item.dateStr}: ${countOnDay}/${totalHabits} completed`}
                        style={{
                          height: '12px',
                          borderRadius: '2px',
                          background: bg,
                          border: isToday
                            ? '1px solid var(--accent)'
                            : intensity === 0
                            ? '1px solid var(--border)'
                            : 'none',
                          cursor: 'pointer',
                          transition: 'opacity 0.1s ease',
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  padding: '2px 8px',
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? 'var(--bg-hover)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                  textTransform: 'capitalize',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 1: STRUCTURED HABIT TABLE (Primary View)
      ========================================================================= */}
      {viewMode === 'table' && (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {filteredHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No habits found. Create a new habit to start tracking.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Habit</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'center' }}>Streak</th>
                    <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'center' }}>Best</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Last 7 Days</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Today</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHabits.map((habit) => {
                    const entries = habit.entries || habitEntries.filter((e) => e.habitId === habit.id);
                    const isTodayCompleted = entries.some((e) => e.date === todayStr && e.completed);

                    return (
                      <tr
                        key={habit.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.1s ease',
                        }}
                      >
                        {/* Habit Title & Desc */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                            {habit.name}
                          </div>
                          {habit.description && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {habit.description}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td style={{ padding: '10px 10px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {habit.category || 'General'}
                          </span>
                        </td>

                        {/* Current Streak */}
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 700,
                              color: (habit.streak || 0) > 0 ? 'var(--accent)' : 'var(--text-muted)',
                            }}
                          >
                            {habit.streak || 0}d
                          </span>
                        </td>

                        {/* Best Streak */}
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {habit.longestStreak || 0}d
                          </span>
                        </td>

                        {/* Last 7 Days Mini-Dots */}
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            {last7Days.map((day) => {
                              const done = entries.some((e) => e.date === day.dateStr && e.completed);
                              return (
                                <button
                                  key={day.dateStr}
                                  onClick={() => toggleHabitEntry(habit.id, day.dateStr)}
                                  title={`${day.dateStr} (${day.dayName}): ${done ? 'Completed' : 'Missed'} (click to toggle)`}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '3px',
                                    border: done ? 'none' : '1px solid var(--border)',
                                    background: done ? 'var(--success)' : 'var(--bg-secondary)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.1s ease',
                                  }}
                                >
                                  {done && <Check size={10} color="#fff" />}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Today Quick Toggle */}
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleHabitEntry(habit.id, todayStr)}
                            className="btn btn-sm"
                            style={{
                              background: isTodayCompleted ? 'var(--success)' : 'var(--bg-secondary)',
                              color: isTodayCompleted ? '#ffffff' : 'var(--text-secondary)',
                              border: isTodayCompleted ? '1px solid var(--success)' : '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={12} />
                            <span>{isTodayCompleted ? 'Done' : 'Check'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(habit)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 6px', color: 'var(--text-muted)' }}
                              title="Edit habit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(habit.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 6px', color: 'var(--danger)' }}
                              title="Delete habit"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: CARD GRID VIEW
      ========================================================================= */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
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
