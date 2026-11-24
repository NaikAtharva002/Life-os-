import React, { useState, useMemo } from 'react';
import {
  Plus,
  Repeat,
  Calendar,
  Check,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Flame,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronRight,
  AlertCircle,
  Hash,
  Timer,
  Trophy,
} from 'lucide-react';
import useStore, {
  isHabitScheduledOnDate,
  computeHabitStreak,
  computeHabitConsistency,
} from '../store/useStore';
import HabitModal from '../components/HabitModal';
import HabitDetailModal from '../components/HabitDetailModal';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';
import type { Habit, HabitRoutine } from '../types';
import { getPhoto } from '../utils/photoAssets';

export default function HabitsPage() {
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const habitRoutines = useStore((s) => s.habitRoutines);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const recordHabitProgress = useStore((s) => s.recordHabitProgress);
  const skipHabitEntry = useStore((s) => s.skipHabitEntry);
  const addRoutine = useStore((s) => s.addRoutine);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'photographic' | 'today' | 'routines' | 'heatmap' | 'table'>('photographic');

  // Quick routine creation modal/inline state
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');

  const todayStr = new Date().toISOString().split('T')[0];

  // Scheduled today habits
  const scheduledTodayHabits = useMemo(() => {
    return habits.filter((h) => isHabitScheduledOnDate(h, todayStr));
  }, [habits, todayStr]);

  const completedTodayCount = useMemo(() => {
    return scheduledTodayHabits.filter((h) => {
      const entry = habitEntries.find((e) => e.habitId === h.id && e.date === todayStr);
      return entry && (entry.completed || entry.status === 'completed');
    }).length;
  }, [scheduledTodayHabits, habitEntries, todayStr]);

  const bestStreak = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, h.longestStreak || h.streak || 0), 0);
  }, [habits]);

  const activeStreaksCount = useMemo(() => {
    return habits.filter((h) => (h.streak || 0) > 0).length;
  }, [habits]);

  const overallTodayRate = scheduledTodayHabits.length > 0
    ? Math.round((completedTodayCount / scheduledTodayHabits.length) * 100)
    : 100;

  // Past 70 days (10 weeks) for weekly consistency heatmap
  const heatmapWeeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    const dow = endDate.getDay();
    const daysUntilSaturday = 6 - dow;
    endDate.setDate(endDate.getDate() + daysUntilSaturday);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 69);

    const weeks: { dateStr: string; date: Date; dayOfWeek: number }[][] = [];
    let currentWeek: { dateStr: string; date: Date; dayOfWeek: number }[] = [];
    const curr = new Date(startDate);

    while (curr <= endDate) {
      const dStr = curr.toISOString().split('T')[0];
      currentWeek.push({
        dateStr: dStr,
        date: new Date(curr),
        dayOfWeek: curr.getDay(),
      });
      if (currentWeek.length === 7 || curr.getTime() === endDate.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }

    return weeks;
  }, []);

  // Compute daily completion count across all habits for global heatmap
  const getDailyCompletionLevel = (dateStr: string) => {
    const scheduled = habits.filter((h) => isHabitScheduledOnDate(h, dateStr));
    if (scheduled.length === 0) return 0;
    const doneCount = scheduled.filter((h) =>
      habitEntries.some((e) => e.habitId === h.id && e.date === dateStr && (e.completed || e.status === 'completed'))
    ).length;
    const ratio = doneCount / scheduled.length;
    if (ratio === 0) return 0;
    if (ratio <= 0.33) return 1;
    if (ratio <= 0.66) return 2;
    return 3;
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return 'rgba(107, 43, 6, 0.4)';
      case 2:
        return 'rgba(184, 12, 9, 0.65)';
      case 3:
        return '#B80C09';
      default:
        return 'var(--bg-secondary)';
    }
  };

  // Photo mapping
  const getHabitImage = (name: string, idx: number) => {
    const n = (name || '').toLowerCase();
    if (n.includes('read') || n.includes('book')) return getPhoto('habit-reading').path;
    if (n.includes('sleep') || n.includes('rest')) return getPhoto('habit-sleep').path;
    if (n.includes('water') || n.includes('hydrat')) return getPhoto('habit-hydration').path;
    if (n.includes('work') || n.includes('code') || n.includes('study')) return getPhoto('habit-deepwork').path;
    if (n.includes('gym') || n.includes('workout') || n.includes('run') || n.includes('pushup')) return getPhoto('gym-weights').path;
    const pool = [
      getPhoto('habit-reading').path,
      getPhoto('habit-deepwork').path,
      getPhoto('habit-sleep').path,
      getPhoto('habit-hydration').path,
    ];
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
    return habits.filter((h) => {
      const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [habits, selectedCategory, searchQuery]);

  const handleCreateRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;
    await addRoutine({
      title: newRoutineTitle.trim(),
      description: 'Custom behavioral habit stack',
      timeOfDay: newRoutineTime,
      habitIds: [],
      order: habitRoutines.length,
    });
    setNewRoutineTitle('');
    setIsCreatingRoutine(false);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. EDITORIAL PHOTOGRAPHIC HERO BANNER */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '220px',
          backgroundImage: `url(${getPhoto('habit-reading').path})`,
          backgroundPosition: 'center 45%',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="editorial-hero-scrim" />

        <div className="editorial-hero-content" style={{ padding: '28px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-light, #ff8c82)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              Habit Architecture 2.0 • Behavioral Systems
            </span>
            <h1
              className="font-editorial"
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              The Architecture of Consistency
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.88)', maxWidth: '540px', lineHeight: 1.4 }}>
              We do not rise to the level of our goals; we fall to the level of our daily systems. Build automaticity through atomic habits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingHabit(undefined);
                setIsModalOpen(true);
              }}
              style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(184, 12, 9, 0.4)' }}
            >
              <Plus size={16} /> Deploy Habit
            </button>
          </div>
        </div>
      </section>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="habits_intro"
        icon={Repeat}
        title="Habit Stacking & Automaticity Threshold"
        description="Schedule-aware streaks only evaluate active days. Group your habits into Morning Ignition or Evening Wind-Down routine stacks to leverage contextual triggers."
        actionText="Deploy New Habit"
        onAction={() => {
          setEditingHabit(undefined);
          setIsModalOpen(true);
        }}
      />

      {/* 2. EXECUTIVE CONSISTENCY STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Habit Protocols
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
            {habits.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {categories.length} Life Categories
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Scheduled Today
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
              {overallTodayRate}%
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
            {completedTodayCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {scheduledTodayHabits.length}</span>
          </div>
          <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--bg-secondary)', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${overallTodayRate}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Streaks
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#B80C09', marginTop: '2px' }} className="tabular">
            🔥 {activeStreaksCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Habits holding consistency
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All-Time Longest Streak
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
            🏆 {bestStreak} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>days</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Peak system record
          </div>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Routine Stacks
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }} className="tabular">
            ⚡ {habitRoutines.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Structured daily flows
          </div>
        </div>
      </div>

      {/* 3. CONTROLS, VIEW MODES & FILTERS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* View Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'photographic', label: 'Photographic', icon: <LayoutGrid size={14} />, title: 'Editorial Card Grid' },
            { id: 'today', label: "Today's Checklist", icon: <CheckCircle2 size={14} />, title: 'Today Execution Protocol' },
            { id: 'routines', label: 'Routine Stacks', icon: <Layers size={14} />, title: 'Behavioral Stacks' },
            { id: 'heatmap', label: '10-Wk Matrix', icon: <TrendingUp size={14} />, title: '70-Day Global Heatmap' },
            { id: 'table', label: 'Data Table', icon: <List size={14} />, title: 'Structured Table' },
          ].map((v) => {
            const isSelected = viewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                title={v.title}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {v.icon}
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search habits..."
              className="input"
              style={{ paddingLeft: '30px', fontSize: '0.8rem', maxWidth: '180px', height: '32px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ fontSize: '0.8rem', height: '32px', padding: '4px 10px' }}
          >
            <option value="all">All Categories ({habits.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({habits.filter((h) => h.category === c).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. VIEW CONTENT MODES */}

      {/* VIEW: TODAY'S EXECUTION CHECKLIST */}
      {viewMode === 'today' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Today's Protocol Checklist ({todayStr})
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {completedTodayCount} of {scheduledTodayHabits.length} habits executed today ({overallTodayRate}%)
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setEditingHabit(undefined);
                setIsModalOpen(true);
              }}
              style={{ fontSize: '0.78rem' }}
            >
              <Plus size={14} /> Add Habit
            </button>
          </div>

          {scheduledTodayHabits.length === 0 ? (
            <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="var(--accent)" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>No Habits Scheduled for Today</h3>
              <p style={{ margin: '4px 0 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                All scheduled habits are resting today. Enjoy the recovery or deploy a daily habit.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingHabit(undefined);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={14} /> Deploy New Habit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scheduledTodayHabits.map((h) => {
                const entry = habitEntries.find((e) => e.habitId === h.id && e.date === todayStr);
                const isCompleted = entry && (entry.completed || entry.status === 'completed');
                const isSkipped = entry && entry.status === 'skipped';
                const isPartial = entry && entry.status === 'partial';

                return (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: isCompleted ? 'rgba(78, 99, 45, 0.08)' : isSkipped ? 'rgba(143, 84, 25, 0.08)' : 'var(--bg-card)',
                      border: isCompleted ? '1px solid rgba(78, 99, 45, 0.3)' : isSkipped ? '1px solid rgba(143, 84, 25, 0.3)' : '1px solid var(--border)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flex: 1 }}
                      onClick={() => setDetailHabitId(h.id)}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: h.color || '#B80C09',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          boxShadow: `0 3px 10px ${h.color || '#B80C09'}30`,
                        }}
                      >
                        {h.icon || '⚡'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {h.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {h.category}
                          </span>
                          {h.streak > 0 && (
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B80C09' }}>
                              🔥 {h.streak}d
                            </span>
                          )}
                        </div>
                        {h.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {h.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {h.type && h.type !== 'boolean' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                            onClick={() => recordHabitProgress(h.id, todayStr, Math.max(1, (entry?.value || 0) + 1))}
                          >
                            +1 {h.unit}
                          </button>
                          {entry?.value !== undefined && (
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {entry.value} / {h.targetValue}
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleHabitEntry(h.id, todayStr)}
                        className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          minWidth: '90px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {isCompleted ? <Check size={14} /> : null}
                        {isCompleted ? 'Completed' : 'Complete'}
                      </button>

                      <button
                        type="button"
                        onClick={() => skipHabitEntry(h.id, todayStr, 'Rest day')}
                        className="btn btn-ghost btn-sm"
                        title="Skip Today (Preserves Streak)"
                        style={{ padding: '6px', color: isSkipped ? '#8F5419' : 'var(--text-muted)' }}
                      >
                        <Shield size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* VIEW: ROUTINE STACKS */}
      {viewMode === 'routines' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Routine Habit Stacks
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Group atomic habits into cohesive morning, afternoon, and evening flows
              </span>
            </div>

            {!isCreatingRoutine && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCreatingRoutine(true)}
                style={{ fontSize: '0.78rem' }}
              >
                <Plus size={14} /> New Routine Stack
              </button>
            )}
          </div>

          {/* New Routine Inline Creator */}
          {isCreatingRoutine && (
            <form onSubmit={handleCreateRoutineSubmit} style={{ padding: '16px 20px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Routine Stack Title (e.g. Pre-Sleep Restorative Routine)"
                className="input"
                style={{ flex: 1, minWidth: '220px' }}
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                autoFocus
              />
              <select
                className="input"
                value={newRoutineTime}
                onChange={(e) => setNewRoutineTime(e.target.value as any)}
                style={{ maxWidth: '140px' }}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm">Create Stack</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCreatingRoutine(false)}>Cancel</button>
            </form>
          )}

          {/* Routine Blocks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {habitRoutines.map((routine) => {
              const routineHabits = habits.filter((h) => h.routineId === routine.id || routine.habitIds.includes(h.id));
              const routineDoneCount = routineHabits.filter((h) =>
                habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && (e.completed || e.status === 'completed'))
              ).length;

              return (
                <div
                  key={routine.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(184, 12, 9, 0.1)',
                          color: 'var(--accent)',
                        }}
                      >
                        {routine.timeOfDay?.toUpperCase() || 'ROUTINE'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                        {routine.title}
                      </h3>
                      {routine.description && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {routine.description}
                        </p>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {routineDoneCount} / {routineHabits.length}
                    </div>
                  </div>

                  {/* Habit List in this routine */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {routineHabits.length === 0 ? (
                      <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No habits assigned yet. Edit any habit to add it to this routine stack.
                      </div>
                    ) : (
                      routineHabits.map((h) => {
                        const isDone = habitEntries.some((e) => e.habitId === h.id && e.date === todayStr && (e.completed || e.status === 'completed'));
                        return (
                          <div
                            key={h.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: isDone ? 'rgba(78, 99, 45, 0.08)' : 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              fontSize: '0.82rem',
                            }}
                          >
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                              onClick={() => setDetailHabitId(h.id)}
                            >
                              <span>{h.icon || '⚡'}</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleHabitEntry(h.id, todayStr)}
                              className={`btn btn-sm ${isDone ? 'btn-primary' : 'btn-ghost'}`}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              {isDone ? '✓ Done' : 'Check'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: 10-WEEK CONSISTENCY HEATMAP */}
      {viewMode === 'heatmap' && (
        <section className="editorial-island" style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                10-Week Systemic Consistency Heatmap (70 Days)
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Adherence density across all active habit protocols
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Low</span>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(107, 43, 6, 0.4)' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(184, 12, 9, 0.65)' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#B80C09' }} />
              <span>High</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {week.map((day) => {
                  const level = getDailyCompletionLevel(day.dateStr);
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div
                      key={day.dateStr}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: getHeatmapColor(level),
                        border: isToday ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                      }}
                      title={`${day.dateStr}: ${level > 0 ? `Level ${level} adherence` : 'No completions'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Per-Habit Breakdown */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Individual Protocol Adherence (Past 30 Days)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {habits.map((h) => {
                const c30 = computeHabitConsistency(h, habitEntries, 30);
                return (
                  <div
                    key={h.id}
                    onClick={() => setDetailHabitId(h.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{h.icon || '⚡'}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: c30.rate >= 80 ? '#4E632D' : 'var(--accent)' }}>
                      {c30.rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* VIEW: PHOTOGRAPHIC CARD GRID (DEFAULT) */}
      {viewMode === 'photographic' && (
        <section>
          {filteredHabits.length === 0 ? (
            <div className="card" style={{ padding: '36px 20px' }}>
              {habits.length === 0 ? (
                <EmptyState
                  illustration="habits"
                  badge="Clean Slate"
                  title="Small disciplines create transformative outcomes."
                  description="Anchor your daily operating system with atomic habits. Build momentum one checkmark at a time."
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
                  description="No habits match your active category filter or search query."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear filters
                    </button>
                  }
                />
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
              {filteredHabits.map((h, idx) => {
                const entry = habitEntries.find((e) => e.habitId === h.id && e.date === todayStr);
                const isDone = entry && (entry.completed || entry.status === 'completed');
                const isSkipped = entry && entry.status === 'skipped';
                const photoUrl = getHabitImage(h.name, idx);
                const isTodayScheduled = isHabitScheduledOnDate(h, todayStr);

                return (
                  <div
                    key={h.id}
                    className="photo-tile"
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: isDone ? '1px solid rgba(184, 12, 9, 0.4)' : '1px solid var(--border)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                    onClick={() => setDetailHabitId(h.id)}
                  >
                    {/* Visual Photographic Header */}
                    <div className="photo-tile-image-wrap" style={{ height: '140px', position: 'relative' }}>
                      <img
                        src={photoUrl}
                        alt={h.name}
                        className="photo-tile-img"
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="photo-tile-scrim" style={{ background: 'linear-gradient(180deg, rgba(20,19,1,0.2) 0%, rgba(20,19,1,0.85) 100%)' }} />

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
                          fontWeight: 700,
                          color: '#fff',
                          background: 'rgba(20, 19, 1, 0.85)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid rgba(184, 12, 9, 0.35)',
                        }}
                      >
                        <Flame size={13} color="#B80C09" fill="#B80C09" />
                        <span className="tabular">{h.streak || 0}d streak</span>
                      </div>

                      {/* Card Actions */}
                      <div
                        style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingHabit(h);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', background: 'rgba(20, 19, 1, 0.8)', color: '#fff' }}
                          title="Edit Habit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete habit "${h.name}"?`)) deleteHabit(h.id);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', background: 'rgba(20, 19, 1, 0.8)', color: 'var(--accent)' }}
                          title="Delete Habit"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Title inside scrim */}
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>{h.icon || '⚡'}</span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                            {h.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {h.category || 'Lifestyle'} • {h.scheduleType ? h.scheduleType.toUpperCase() : 'DAILY'}
                        </span>
                        {h.type && h.type !== 'boolean' && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)' }}>
                            {h.targetValue} {h.unit}
                          </span>
                        )}
                      </div>

                      {h.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {h.description}
                        </p>
                      )}

                      {/* Today Status & Quick Checkoff */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '10px',
                          marginTop: 'auto',
                          borderTop: '1px solid var(--border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDone ? '#4E632D' : isSkipped ? '#8F5419' : isTodayScheduled ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                            {isDone ? '✓ Completed Today' : isSkipped ? '🛡️ Skipped (Preserved)' : isTodayScheduled ? '⏳ Scheduled Today' : 'Rest day'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Longest: {h.longestStreak || h.streak || 0}d
                          </div>
                        </div>

                        <button
                          onClick={() => toggleHabitEntry(h.id, todayStr)}
                          className={`btn btn-sm ${isDone ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {isDone ? <Check size={14} /> : null}
                          {isDone ? 'Done' : 'Check'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* VIEW: STRUCTURED TABLE */}
      {viewMode === 'table' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Habit</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Streak</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Peak Streak</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Today</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHabits.map((h) => {
                const entry = habitEntries.find((e) => e.habitId === h.id && e.date === todayStr);
                const isDone = entry && (entry.completed || entry.status === 'completed');

                return (
                  <tr
                    key={h.id}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => setDetailHabitId(h.id)}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{h.icon || '⚡'}</span>
                        <span>{h.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{h.category}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {h.scheduleType ? h.scheduleType.toUpperCase() : 'DAILY'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="tabular" style={{ color: '#B80C09', fontWeight: 700 }}>🔥 {h.streak || 0}d</span>
                    </td>
                    <td style={{ padding: '12px 16px' }} className="tabular">{h.longestStreak || 0}d</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleHabitEntry(h.id, todayStr)}
                        className={`btn btn-sm ${isDone ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                      >
                        {isDone ? '✓ Done' : 'Log'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingHabit(h);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete habit "${h.name}"?`)) deleteHabit(h.id);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px', color: 'var(--accent)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Habit Protocol Creation/Edit Modal */}
      {isModalOpen && (
        <HabitModal
          habit={editingHabit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHabit(undefined);
          }}
        />
      )}

      {/* Habit Deep Workspace Modal */}
      {detailHabitId && (
        <HabitDetailModal
          habitId={detailHabitId}
          onClose={() => setDetailHabitId(null)}
          onEditHabit={(h) => {
            setDetailHabitId(null);
            setEditingHabit(h);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
