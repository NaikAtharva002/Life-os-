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
} from 'lucide-react';
import useStore from '../store/useStore';
import GoalModal from '../components/GoalModal';
import type { Goal, Priority } from '../types';

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

  // Priority Overview Counts (Section 4: Single horizontal summary)
  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.isArchived);
    return {
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

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* 1. Page Heading (Section 4) */}
      <div className="page-heading">
        <div>
          <h1>Goal Management</h1>
          <p>Manage your objectives, milestones and priorities.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingGoal(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* 2. Priority Overview (Section 4: Single horizontal summary) */}
      <div className="summary-strip">
        <span className="metric-item">
          Critical: <strong className="tabular" style={{ color: 'var(--priority-critical)' }}>{stats.critical}</strong>
        </span>
        <span>·</span>
        <span className="metric-item">
          High: <strong className="tabular" style={{ color: 'var(--priority-high)' }}>{stats.high}</strong>
        </span>
        <span>·</span>
        <span className="metric-item">
          Medium: <strong className="tabular" style={{ color: 'var(--priority-medium)' }}>{stats.medium}</strong>
        </span>
        <span>·</span>
        <span className="metric-item">
          Low: <strong className="tabular" style={{ color: 'var(--priority-low)' }}>{stats.low}</strong>
        </span>
        <span>·</span>
        <span className="metric-item">
          Completed: <strong className="tabular" style={{ color: 'var(--status-success)' }}>{stats.completed}</strong>
        </span>
      </div>

      {/* 3. Compact Filtering Toolbar (Section 4) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Priority filter */}
          <select
            className="select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category filter */}
          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort order */}
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="priority">Priority First</option>
            <option value="progress">Progress (High to Low)</option>
            <option value="targetDate">Target Deadline</option>
            <option value="created">Recently Added</option>
          </select>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ padding: '4px 8px 4px 26px', fontSize: '12px', width: '160px' }}
          />
          <Search
            size={12}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* 4. Structured Goals List (Section 4 Default View) */}
      {filteredGoals.length === 0 ? (
        <div
          style={{
            padding: '36px 16px',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-medium)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            background: 'var(--bg-surface)',
          }}
        >
          No matching goals found. Create a new goal to get started.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}></th>
                <th>Goal</th>
                <th style={{ width: '120px' }}>Category</th>
                <th style={{ width: '100px' }}>Priority</th>
                <th style={{ width: '150px' }}>Progress</th>
                <th style={{ width: '110px' }}>Deadline</th>
                <th>Next Milestone</th>
                <th style={{ width: '70px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((g) => {
                const isExpanded = expandedGoalIds.has(g.id);
                const nextMilestone = g.milestones.find((m) => !m.isCompleted);
                const isDelayed = g.targetDate && new Date(g.targetDate) < new Date() && g.progress < 100;

                return (
                  <React.Fragment key={g.id}>
                    <tr
                      onClick={() => toggleExpand(g.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>

                      {/* Goal Title & Description */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {g.title}
                        </div>
                        {g.description && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                            {g.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          {g.category || 'General'}
                        </span>
                      </td>

                      {/* Priority (Small semantic label, not large background) */}
                      <td>
                        <span
                          style={{
                            fontSize: '10.5px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-xs)',
                            background:
                              g.priority === 'critical'
                                ? 'var(--priority-critical-bg)'
                                : g.priority === 'high'
                                ? 'var(--priority-high-bg)'
                                : g.priority === 'medium'
                                ? 'var(--priority-medium-bg)'
                                : 'var(--priority-low-bg)',
                            color:
                              g.priority === 'critical'
                                ? 'var(--priority-critical)'
                                : g.priority === 'high'
                                ? 'var(--priority-high)'
                                : g.priority === 'medium'
                                ? 'var(--priority-medium)'
                                : 'var(--priority-low)',
                          }}
                        >
                          {g.priority}
                        </span>
                      </td>

                      {/* Progress */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', minWidth: '32px' }} className="tabular">
                            {g.progress}%
                          </span>
                          <div className="progress-track" style={{ flex: 1 }}>
                            <div
                              className="progress-thumb"
                              style={{
                                width: `${g.progress}%`,
                                background:
                                  g.progress === 100
                                    ? 'var(--status-success)'
                                    : g.priority === 'critical'
                                    ? 'var(--priority-critical)'
                                    : 'var(--text-primary)',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            color: isDelayed ? 'var(--status-danger)' : 'var(--text-secondary)',
                            fontWeight: isDelayed ? 600 : 400,
                          }}
                          className="tabular"
                        >
                          {g.targetDate || 'Ongoing'}
                        </span>
                      </td>

                      {/* Next Milestone */}
                      <td>
                        {nextMilestone ? (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {nextMilestone.title}
                          </span>
                        ) : g.milestones.length > 0 ? (
                          <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 500 }}>
                            All milestones passed
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleEdit(g, e)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                            title="Edit goal"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(g.id, e)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                            title="Delete goal"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row: Milestones & details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} style={{ background: 'var(--bg-surface)', padding: '12px 16px 14px 44px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Milestones ({g.milestones.filter((m) => m.isCompleted).length}/{g.milestones.length})
                            </div>

                            {g.milestones.length === 0 ? (
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                No milestones added yet. Click edit to add sub-milestones.
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {g.milestones.map((m) => (
                                  <div
                                    key={m.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleMilestone(g.id, m.id);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                                      textDecoration: m.isCompleted ? 'line-through' : 'none',
                                    }}
                                  >
                                    <CheckCircle2
                                      size={13}
                                      color={m.isCompleted ? 'var(--status-success)' : 'var(--text-muted)'}
                                    />
                                    <span>{m.title}</span>
                                    {m.dueDate && (
                                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }} className="tabular">
                                        (due {m.dueDate})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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

      {/* Goal Creation / Edit Modal */}
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          editingGoal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(undefined);
          }}
        />
      )}
    </div>
  );
}
