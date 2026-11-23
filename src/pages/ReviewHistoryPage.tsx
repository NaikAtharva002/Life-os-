import React, { useState } from 'react';
import {
  History,
  Calendar,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { EveningReview } from '../types';

export default function ReviewHistoryPage() {
  const eveningReviews = useStore((s) => s.eveningReviews);
  const setActiveView = useStore((s) => s.setActiveView);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort reviews: newest first
  const sortedReviews = [...eveningReviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Consistency metrics
  const totalReviews = sortedReviews.length;
  const avgRating =
    totalReviews > 0
      ? (sortedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  // Calculate consistency streak
  let reviewStreak = 0;
  if (sortedReviews.length > 0) {
    const dates = new Set(sortedReviews.map((r) => r.date));
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dates.has(dStr)) {
        reviewStreak++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={26} color="var(--accent)" />
            Evening Review History & Consistency
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Revisit past reflections, celebrate discipline streaks, and track personal evolution.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setActiveView('review')}>
          Start Today's Review
        </button>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        <div className="card card-sm" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
            TOTAL REVIEWS LOGGED
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{totalReviews}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days documented</div>
        </div>

        <div className="card card-sm" style={{ borderLeft: '4px solid var(--palette-brick)' }}>
          <div style={{ fontSize: '11px', color: 'var(--palette-brick)', fontWeight: 700 }}>
            CURRENT REVIEW STREAK
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--palette-brick)' }}>
            {reviewStreak} {reviewStreak === 1 ? 'day' : 'days'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Consecutive nights</div>
        </div>

        <div className="card card-sm" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 700 }}>
            AVERAGE DAY RATING
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {avgRating} <Star size={18} fill="var(--warning)" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Out of 5.0 stars</div>
        </div>
      </div>

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <div className="card empty-state" style={{ padding: '48px 24px' }}>
          <BookOpen size={44} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>No Reviews Completed Yet</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Complete your first evening review tonight to start building your self-reflection journal.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveView('review')}>
            Begin Evening Review
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedReviews.map((rev) => {
            const isExpanded = expandedId === rev.id;
            return (
              <div
                key={rev.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${
                    rev.rating >= 4
                      ? 'var(--success)'
                      : rev.rating >= 3
                      ? 'var(--warning)'
                      : 'var(--danger)'
                  }`,
                }}
                onClick={() => setExpandedId(isExpanded ? null : rev.id)}
              >
                {/* Header row: Date + Rating + Summary pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} color="var(--accent)" />
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatDate(rev.date)}
                    </span>
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          color={s <= rev.rating ? 'var(--warning)' : 'var(--border-light)'}
                          fill={s <= rev.rating ? 'var(--warning)' : 'transparent'}
                        />
                      ))}
                    </div>

                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {isExpanded ? '▲ Collapse' : '▼ View Details'}
                    </span>
                  </div>
                </div>

                {/* Short reflection summary preview */}
                {rev.reflection && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'none' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    "{rev.reflection}"
                  </p>
                )}

                {/* Tomorrow's Priorities Preview */}
                {rev.tomorrowPriorities && rev.tomorrowPriorities.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: 'var(--bg-secondary)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      TOP PRIORITIES SET:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {rev.tomorrowPriorities.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '12.5px',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{idx + 1}.</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: '10px',
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div>
                      <strong>Tasks:</strong> {rev.tasksCompleted.length} completed,{' '}
                      {rev.tasksPending.length} pending
                    </div>
                    <div>
                      <strong>Habits:</strong> {rev.habitsCompleted.length} done,{' '}
                      {rev.habitsMissed.length} missed
                    </div>
                    <div>
                      <strong>Goal Updates:</strong> {rev.goalProgress.length} recorded
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
