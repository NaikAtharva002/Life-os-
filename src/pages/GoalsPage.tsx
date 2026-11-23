import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Target,
  LayoutGrid,
  List,
  Check,
  Flag,
  ArrowRight,
} from 'lucide-react';
import useStore from '../store/useStore';
import GoalModal from '../components/GoalModal';
import type { Goal, Priority } from '../types';
import { getPhoto } from '../utils/photoAssets';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function GoalsPage() {
  const goals = useStore((s) => s.goals);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const updateGoal = useStore((s) => s.updateGoal);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  // Filters & State
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'targetDate' | 'created'>('priority');
  const [viewMode, setViewMode] = useState<'editorial' | 'table'>('editorial');

  // Expanded rows state for viewing milestones inline
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    goals.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [goals]);

  // Priority Overview Counts
  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.isArchived);
    return {
      total: active.length,
      critical: active.filter((g) => g.priority === 'critical' && g.progress < 100).length,
      high: active.filter((g) => g.priority === 'high' && g.progress < 100).length,
      medium: active.filter((g) => g.priority === 'medium' && g.progress < 100).length,
      low: active.filter((g) => g.priority === 'low' && g.progress < 100).length,
      completed: active.filter((g) => g.progress === 100).length,
    };
  }, [goals]);

  // Filtered and sorted goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived)
      .filter((g) => {
        if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
        if (statusFilter === 'active' && g.progress === 100) return false;
        if (statusFilter === 'completed' && g.progress < 100) return false;
        if (
          searchQuery &&
          !g.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !g.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        if (sortBy === 'progress') {
          return b.progress - a.progress;
        }
        if (sortBy === 'targetDate') {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return a.targetDate.localeCompare(b.targetDate);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [goals, priorityFilter, categoryFilter, statusFilter, searchQuery, sortBy]);

  const handleEdit = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this goal and its milestone records?')) {
      deleteGoal(id);
    }
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
    const progress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : goal.progress;

    updateGoal(goalId, { milestones: updatedMilestones, progress });
  };

  // Photographic image mapping per goal
  const getGoalImage = (category: string, idx: number) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('career') || cat.includes('tech') || cat.includes('code')) return getPhoto('goal-tech').path;
    if (cat.includes('finance') || cat.includes('wealth')) return getPhoto('goal-finance').path;
    if (cat.includes('fitness') || cat.includes('health') || cat.includes('gym')) return getPhoto('goal-fitness').path;
    if (cat.includes('academic') || cat.includes('learn') || cat.includes('study')) return getPhoto('goal-academics').path;
    const pool = [getPhoto('goal-tech').path, getPhoto('goal-finance').path, getPhoto('goal-fitness').path, getPhoto('goal-academics').path];
    return pool[idx % pool.length];
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. EDITORIAL PHOTOGRAPHIC HEADER BANNER */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '220px',
          backgroundImage: `url(${getPhoto('dashboard-workspace').path})`,
          backgroundPosition: 'center 40%',
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
              Strategic Horizons
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
              Long-Term Objectives &amp; Milestones
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', maxWidth: '520px' }}>
              Bridge the gap between ambition and reality with tangible milestone architecture.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingGoal(undefined);
              setIsModalOpen(true);
            }}
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <Plus size={15} /> Create Goal
          </button>
        </div>
      </section>

      {/* 2. SUMMARY STRIP & VIEW SWITCHER */}
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
            Active: <strong style={{ color: 'var(--text-primary)' }} className="tabular">{stats.total}</strong>
          </span>
          <span style={{ width: '1px', height: '14px', background: 'var(--border-default)' }} />
          <span style={{ color: 'var(--priority-critical)' }}>
            Critical: <strong className="tabular">{stats.critical}</strong>
          </span>
          <span style={{ color: 'var(--priority-high)' }}>
            High: <strong className="tabular">{stats.high}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Medium/Low: <strong className="tabular">{stats.medium + stats.low}</strong>
          </span>
          <span style={{ color: 'var(--status-success)' }}>
            Completed: <strong className="tabular">{stats.completed}</strong>
          </span>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('editorial')}
            className={`btn btn-sm ${viewMode === 'editorial' ? 'btn-primary' : 'btn-secondary'}`}
            title="Photographic Editorial Grid"
          >
            <LayoutGrid size={13} /> Editorial
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            title="Structured Data Table"
          >
            <List size={13} /> Table
          </button>
        </div>
      </div>

      {/* 3. TOOLBAR CONTROLS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="priority">Priority First</option>
            <option value="progress">Progress %</option>
            <option value="targetDate">Target Deadline</option>
            <option value="created">Recently Added</option>
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 10px 6px 30px', fontSize: '12.5px', width: '200px' }}
          />
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* 4. CONTENT VIEW: EDITORIAL PHOTOGRAPHIC GRID OR TABLE */}
      {filteredGoals.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13.5px',
            background: 'var(--bg-surface)',
          }}
        >
          No matching goals found. Create a new goal to begin your milestone tracking.
        </div>
      ) : viewMode === 'editorial' ? (
        /* EDITORIAL PHOTOGRAPHIC CARDS GRID */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredGoals.map((g, idx) => {
            const photoUrl = getGoalImage(g.category, idx);
            const isCompleted = g.progress === 100;

            return (
              <div
                key={g.id}
                className="photo-tile"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'default',
                  borderColor: isCompleted ? 'var(--palette-brick-border)' : 'var(--border-default)',
                }}
              >
                {/* Visual Header */}
                <div className="photo-tile-image-wrap" style={{ height: '150px' }}>
                  <img
                    src={photoUrl}
                    alt={g.title}
                    className="photo-tile-img"
                    loading="lazy"
                  />
                  <div className="photo-tile-scrim" />

                  {/* Priority & Category tags */}
                  <div style={{ position: 'absolute', top: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(20, 19, 1, 0.85)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {g.category || 'General'}
                    </span>

                    <span
                      className="badge"
                      style={{
                        background: g.priority === 'critical' ? 'var(--status-danger)' : g.priority === 'high' ? 'var(--status-warning)' : 'var(--bg-surface)',
                        color: g.priority === 'critical' || g.priority === 'high' ? '#ffffff' : 'var(--text-secondary)',
                      }}
                    >
                      {g.priority}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleEdit(g, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.85)', backdropFilter: 'blur(6px)', color: '#FFFFFF', borderColor: 'var(--border-default)' }}
                      title="Edit Goal"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(g.id, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.85)', color: '#f87171', backdropFilter: 'blur(6px)', borderColor: 'var(--border-default)' }}
                      title="Delete Goal"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {g.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {g.description || 'Continuous milestone progression.'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                      <span className="tabular" style={{ fontWeight: 700, color: isCompleted ? 'var(--status-success)' : 'var(--accent-primary)' }}>
                        {g.progress}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${g.progress}%`,
                          height: '100%',
                          background: isCompleted ? 'var(--status-success)' : 'var(--accent-primary)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestones list */}
                  {g.milestones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        Milestones ({g.milestones.filter((m) => m.isCompleted).length}/{g.milestones.length})
                      </span>
                      {g.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(g.id, m.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: m.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '3px',
                              border: m.isCompleted ? 'none' : '1px solid var(--border-default)',
                              background: m.isCompleted ? 'var(--accent-primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {m.isCompleted && <Check size={10} color="#04120a" strokeWidth={3} />}
                          </div>
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deadline footer */}
                  {g.targetDate && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Target deadline: <span className="tabular">{g.targetDate}</span>
                    </div>
                  )}
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
                <th style={{ width: '32px', padding: '10px 14px' }}></th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Goal</th>
                <th style={{ width: '120px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                <th style={{ width: '100px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority</th>
                <th style={{ width: '150px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Progress</th>
                <th style={{ width: '110px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Deadline</th>
                <th style={{ width: '80px', textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((g) => {
                const isExpanded = expandedGoalIds.has(g.id);
                return (
                  <React.Fragment key={g.id}>
                    <tr
                      onClick={() => toggleExpand(g.id)}
                      style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</div>
                        {g.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.description}</div>}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{g.category}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
                          {g.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--accent-primary)' }} />
                          </div>
                          <span className="tabular">{g.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }} className="tabular">{g.targetDate || '—'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button onClick={(e) => handleEdit(g, e)} className="btn btn-ghost btn-sm" style={{ padding: '2px 4px' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={(e) => handleDelete(g.id, e)} className="btn btn-ghost btn-sm" style={{ padding: '2px 4px', color: '#f87171' }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && g.milestones.length > 0 && (
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        <td colSpan={7} style={{ padding: '12px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {g.milestones.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => handleToggleMilestone(g.id, m.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                <CheckCircle2 size={13} color={m.isCompleted ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                <span style={{ textDecoration: m.isCompleted ? 'line-through' : 'none', color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                  {m.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          goal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(undefined);
          }}
        />
      )}
    </div>
  );
}
