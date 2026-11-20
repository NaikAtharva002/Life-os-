import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  Target,
  Flame,
  Zap,
  CheckCircle,
  Archive,
} from 'lucide-react';
import useStore from '../store/useStore';
import GoalCard from '../components/GoalCard';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'targetDate' | 'created'>('priority');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    goals.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [goals]);

  // Counts by priority
  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.isArchived);
    return {
      total: active.length,
      critical: active.filter((g) => g.priority === 'critical').length,
      high: active.filter((g) => g.priority === 'high').length,
      medium: active.filter((g) => g.priority === 'medium').length,
      low: active.filter((g) => g.priority === 'low').length,
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
  }, [goals, priorityFilter, categoryFilter, searchQuery, sortBy]);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={26} color="var(--accent)" />
            Goal Priority Management
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Set, track, and dynamically re-prioritize your life's most meaningful objectives.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingGoal(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Priority Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          className="card card-sm"
          style={{
            borderLeft: '4px solid var(--priority-critical)',
            cursor: 'pointer',
            background: priorityFilter === 'critical' ? 'var(--bg-hover)' : 'var(--bg-card)',
          }}
          onClick={() => setPriorityFilter(priorityFilter === 'critical' ? 'all' : 'critical')}
        >
          <div style={{ fontSize: '11px', color: 'var(--priority-critical)', fontWeight: 700 }}>
            🔥 CRITICAL
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.critical}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Highest Focus</div>
        </div>

        <div
          className="card card-sm"
          style={{
            borderLeft: '4px solid var(--priority-high)',
            cursor: 'pointer',
            background: priorityFilter === 'high' ? 'var(--bg-hover)' : 'var(--bg-card)',
          }}
          onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
        >
          <div style={{ fontSize: '11px', color: 'var(--priority-high)', fontWeight: 700 }}>
            ⚡ HIGH
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.high}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Major Impact</div>
        </div>

        <div
          className="card card-sm"
          style={{
            borderLeft: '4px solid var(--priority-medium)',
            cursor: 'pointer',
            background: priorityFilter === 'medium' ? 'var(--bg-hover)' : 'var(--bg-card)',
          }}
          onClick={() => setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium')}
        >
          <div style={{ fontSize: '11px', color: 'var(--priority-medium)', fontWeight: 700 }}>
            📌 MEDIUM
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.medium}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ongoing Progress</div>
        </div>

        <div
          className="card card-sm"
          style={{
            borderLeft: '4px solid var(--priority-low)',
            cursor: 'pointer',
            background: priorityFilter === 'low' ? 'var(--bg-hover)' : 'var(--bg-card)',
          }}
          onClick={() => setPriorityFilter(priorityFilter === 'low' ? 'all' : 'low')}
        >
          <div style={{ fontSize: '11px', color: 'var(--priority-low)', fontWeight: 700 }}>
            🌱 LOW
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.low}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>When Free</div>
        </div>

        <div className="card card-sm" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>
            ✅ COMPLETED
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.completed}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Achieved</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card card-sm"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Priority Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Priority:
          </span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className="btn btn-sm"
              style={{
                borderRadius: '16px',
                fontSize: '11px',
                padding: '4px 10px',
                fontWeight: 600,
                textTransform: 'capitalize',
                background:
                  priorityFilter === p ? 'var(--accent)' : 'var(--bg-secondary)',
                color: priorityFilter === p ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {p === 'critical' ? '🔥 Critical' : p === 'high' ? '⚡ High' : p === 'medium' ? '📌 Medium' : p === 'low' ? '🌱 Low' : 'All'}
            </button>
          ))}
        </div>

        {/* Category & Search & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {categories.length > 0 && (
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="priority">Sort: Priority</option>
              <option value="progress">Sort: Progress</option>
              <option value="targetDate">Sort: Target Date</option>
              <option value="created">Sort: Created Date</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ padding: '6px 10px 6px 28px', fontSize: '12px', width: '160px' }}
            />
            <Search
              size={13}
              style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {filteredGoals.length === 0 ? (
        <div className="card empty-state" style={{ padding: '48px 24px' }}>
          <Target size={44} style={{ opacity: 0.3, marginBottom: '12px', margin: '0 auto' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>No Goals Found</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            {goals.length === 0
              ? 'Start by defining a Critical or High priority goal to give your days clarity and purpose.'
              : 'Try clearing your active filters to see all goals.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setPriorityFilter('all');
              setCategoryFilter('all');
              setSearchQuery('');
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add First Goal
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={() => handleEdit(g)}
              onDelete={() => handleDelete(g.id)}
            />
          ))}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal
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
