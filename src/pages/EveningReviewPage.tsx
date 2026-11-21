import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Repeat,
  Target,
  Star,
  Calendar,
  Save,
  Check,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Priority, EveningReview, Task } from '../types';

export default function EveningReviewPage() {
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitEntries = useStore((s) => s.habitEntries);
  const goals = useStore((s) => s.goals);
  const completeTask = useStore((s) => s.completeTask);
  const rescheduleTask = useStore((s) => s.rescheduleTask);
  const toggleHabitEntry = useStore((s) => s.toggleHabitEntry);
  const updateGoal = useStore((s) => s.updateGoal);
  const saveEveningReview = useStore((s) => s.saveEveningReview);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const setActiveView = useStore((s) => s.setActiveView);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Check if review already exists for selected date
  const existingReview = eveningReviews.find((r) => r.date === selectedDate);

  // Reflection & Form state
  const [reflection, setReflection] = useState(existingReview?.reflection || '');
  const [rating, setRating] = useState(existingReview?.rating || 4);
  const [tomorrowPriorities, setTomorrowPriorities] = useState<string[]>(
    existingReview?.tomorrowPriorities || ['', '', '']
  );
  const [isSaved, setIsSaved] = useState(false);
  const [rescheduleDateInputs, setRescheduleDateInputs] = useState<Record<string, string>>({});

  // When selectedDate changes, load existing or reset
  useEffect(() => {
    const rev = eveningReviews.find((r) => r.date === selectedDate);
    if (rev) {
      setReflection(rev.reflection);
      setRating(rev.rating);
      setTomorrowPriorities(
        rev.tomorrowPriorities.length >= 3
          ? rev.tomorrowPriorities
          : [...rev.tomorrowPriorities, '', ''].slice(0, 3)
      );
    } else {
      setReflection('');
      setRating(4);
      setTomorrowPriorities(['', '', '']);
    }
    setIsSaved(false);
  }, [selectedDate, eveningReviews]);

  // Tasks calculations for the date
  const completedTasksToday = tasks.filter(
    (t) => t.isCompleted && (t.completedAt?.startsWith(selectedDate) || t.dueDate === selectedDate)
  );

  const pendingAndOverdueTasks = tasks.filter(
    (t) => !t.isCompleted && (t.dueDate === selectedDate || t.isOverdue || !t.dueDate)
  );

  // Habits calculations for the date
  const completedHabits = habits.filter((h) =>
    habitEntries.some((e) => e.habitId === h.id && e.date === selectedDate && e.completed)
  );
  const missedHabits = habits.filter(
    (h) => !habitEntries.some((e) => e.habitId === h.id && e.date === selectedDate && e.completed)
  );

  // Critical & High priority goals
  const importantGoals = goals
    .filter((g) => !g.isArchived && (g.priority === 'critical' || g.priority === 'high'))
    .slice(0, 4);

  // Productivity Score Calculation (0-100)
  const taskRatio =
    completedTasksToday.length + pendingAndOverdueTasks.length > 0
      ? completedTasksToday.length / (completedTasksToday.length + pendingAndOverdueTasks.length)
      : 1;
  const habitRatio = habits.length > 0 ? completedHabits.length / habits.length : 1;
  const productivityScore = Math.round(taskRatio * 50 + habitRatio * 50);

  const handlePriorityInput = (index: number, value: string) => {
    const updated = [...tomorrowPriorities];
    updated[index] = value;
    setTomorrowPriorities(updated);
  };

  const handleReschedule = (taskId: string) => {
    const targetDate = rescheduleDateInputs[taskId];
    if (targetDate) {
      rescheduleTask(taskId, targetDate);
      setRescheduleDateInputs((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
    }
  };

  const handleGoalProgressSlider = (goalId: string, progress: number) => {
    updateGoal(goalId, { progress });
  };

  const handleSaveReview = () => {
    saveEveningReview({
      date: selectedDate,
      tasksCompleted: completedTasksToday.map((t) => t.id),
      tasksPending: pendingAndOverdueTasks.map((t) => t.id),
      habitsCompleted: completedHabits.map((h) => h.id),
      habitsMissed: missedHabits.map((h) => h.id),
      goalProgress: importantGoals.map((g) => ({ goalId: g.id, progress: g.progress })),
      reflection: reflection.trim(),
      rating,
      tomorrowPriorities: tomorrowPriorities.map((p) => p.trim()).filter(Boolean),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header (Editorial & Solid) */}
      <div
        className="card"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
          padding: '18px 22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <Moon size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.015em' }}>
              End-of-Day Evening Review
            </h1>
            <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Close today with intentionality. Celebrate progress, clear loose ends, and set tomorrow's focus.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="var(--text-secondary)" />
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12.5px', fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Confirmation Banner if Saved */}
      {isSaved && (
        <div
          className="card"
          style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            <CheckCircle2 size={20} />
            Evening Review saved locally! Consistency logged.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveView('history')}
            style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
          >
            View in History →
          </button>
        </div>
      )}

      {/* Executive Reflection Strip */}
      <div className="summary-strip">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Productivity:</span>
          <span style={{ fontWeight: 700, color: productivityScore >= 70 ? 'var(--status-success)' : 'var(--status-warning)' }} className="tabular">
            {productivityScore}% composite
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Tasks Completed:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {completedTasksToday.length} / {completedTasksToday.length + pendingAndOverdueTasks.length} tasks
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Habit Adherence:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {completedHabits.length} / {habits.length} habits
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Day Rating:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {rating} / 5 stars
          </span>
        </span>
      </div>

      {/* SECTION 2: Tasks Review (Completed vs Pending/Overdue) */}
      <div className="grid-2">
        {/* Completed Tasks Today */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--success)',
              }}
            >
              <CheckCircle2 size={18} />
              Tasks Completed Today ({completedTasksToday.length})
            </h3>
          </div>

          {completedTasksToday.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              No tasks marked completed today.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedTasksToday.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                  }}
                >
                  <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                    {t.title}
                  </span>
                  <span
                    className="priority-badge"
                    style={{
                      fontSize: '10px',
                      background: `var(--priority-${t.priority}-bg)`,
                      color: `var(--priority-${t.priority})`,
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending & Overdue Tasks (With Mark Complete & Reschedule actions) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--warning)',
              }}
            >
              <Clock size={18} />
              Pending & Overdue Tasks ({pendingAndOverdueTasks.length})
            </h3>
          </div>

          {pendingAndOverdueTasks.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--success)', margin: 0 }}>
              🎉 Zero pending tasks! Your plate is completely clear.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingAndOverdueTasks.map((t) => {
                const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '10px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid var(--priority-${t.priority})`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.title}
                      </span>
                      <span
                        className="priority-badge"
                        style={{
                          fontSize: '10px',
                          background: `var(--priority-${t.priority}-bg)`,
                          color: `var(--priority-${t.priority})`,
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>

                    {/* Action buttons: Mark completed OR Reschedule */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => completeTask(t.id)}
                        style={{ fontSize: '11px', color: 'var(--success)', padding: '3px 8px' }}
                      >
                        <Check size={12} /> Mark Complete
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => rescheduleTask(t.id, tomorrowStr)}
                        style={{ fontSize: '11px', color: 'var(--accent)', padding: '3px 8px' }}
                        title="Move to Tomorrow"
                      >
                        → Move to Tomorrow
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="date"
                          value={rescheduleDateInputs[t.id] || ''}
                          onChange={(e) =>
                            setRescheduleDateInputs({ ...rescheduleDateInputs, [t.id]: e.target.value })
                          }
                          className="input"
                          style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
                        />
                        {rescheduleDateInputs[t.id] && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReschedule(t.id)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Habits Review (Completed vs Missed) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Repeat size={18} color="var(--accent)" />
          Habit Performance Today
        </h3>

        {habits.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            No habits added yet. Go to Habits tab to build your daily routines.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {habits.map((h) => {
              const isCompleted = habitEntries.some((e) => e.habitId === h.id && e.date === selectedDate && e.completed);
              return (
                <div
                  key={h.id}
                  onClick={() => toggleHabitEntry(h.id, selectedDate)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCompleted ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-secondary)',
                    border: isCompleted ? '1px solid var(--success)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to toggle completion"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: isCompleted ? 'var(--status-success)' : 'transparent',
                        border: isCompleted ? 'none' : '1.5px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted && <Check size={12} color="#ffffff" strokeWidth={2.5} />}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 500,
                          color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {h.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
                        🔥 {h.streak}d streak
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--success)' : 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : '·'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: Progress on Important Goals */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Target size={18} color="var(--accent)" />
            Progress on Critical & High Priority Goals
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Update sliders to log progress made today
          </span>
        </div>

        {importantGoals.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No Critical or High priority goals active. Set high-impact goals in the Goals tab!
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '14px',
            }}
          >
            {importantGoals.map((g) => (
              <div
                key={g.id}
                style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid var(--priority-${g.priority})`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {g.title}
                  </span>
                  <span
                    className="priority-badge"
                    style={{
                      fontSize: '10px',
                      background: `var(--priority-${g.priority}-bg)`,
                      color: `var(--priority-${g.priority})`,
                    }}
                  >
                    {g.priority}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Progress</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{g.progress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={g.progress}
                  onChange={(e) => handleGoalProgressSlider(g.id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: Notes & Reflections ("How was my day?") + Star Rating */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={18} color="var(--accent)" />
            Daily Reflection — "How was my day?"
          </h3>

          {/* Star rating (1-5) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Day Rating:
            </span>
            <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: s <= rating ? 'var(--warning)' : 'var(--border-light)',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <Star size={22} fill={s <= rating ? 'var(--warning)' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          className="textarea"
          rows={4}
          placeholder="What went well today? What drained my energy? What did I learn? Any breakthrough insights?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          style={{ fontSize: '14px', lineHeight: 1.5 }}
        />
      </div>

      {/* SECTION 6: Tomorrow's Top Three Priorities */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={18} color="var(--accent)" />
            Tomorrow's Top 3 Priorities
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Decide the 3 non-negotiables that will make tomorrow a resounding victory.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2].map((idx) => {
            const colors = ['var(--priority-critical)', 'var(--priority-high)', 'var(--priority-medium)'];
            const labels = ['Priority 1 (Critical)', 'Priority 2 (High)', 'Priority 3 (Medium)'];
            return (
              <div key={idx} className="tomorrow-priority-item">
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: colors[idx],
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder={`What is your ${labels[idx]}?`}
                  value={tomorrowPriorities[idx] || ''}
                  onChange={(e) => handlePriorityInput(idx, e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: Save & Finish Review Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 0',
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => setActiveView('history')}
        >
          View Past Reviews History
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSaveReview}
          style={{
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: 700,
            gap: '10px',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}
        >
          <Save size={18} />
          Complete & Save Daily Review
        </button>
      </div>
    </div>
  );
}
