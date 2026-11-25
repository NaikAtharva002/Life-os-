import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  CheckSquare,
  Search,
  ArrowUpDown,
  LayoutList,
  Kanban,
  CalendarDays,
  Filter,
  RotateCcw,
  Clock,
  AlertTriangle,
  Repeat,
  Tag,
  Target,
} from 'lucide-react';
import useStore from '../store/useStore';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import QuickTaskBar from '../components/QuickTaskBar';
import TaskKanbanBoard from '../components/TaskKanbanBoard';
import TaskCalendarView from '../components/TaskCalendarView';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';
import type { Task, Priority, TaskStatus } from '../types';
import { todayLocal } from '../lib/dates';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const goals = useStore((s) => s.goals);

  // View mode: List vs Kanban vs Calendar (persisted to localStorage)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>(() => {
    try {
      return (localStorage.getItem('lifeos_tasks_view_mode') as any) || 'list';
    } catch {
      return 'list';
    }
  });

  const handleSetViewMode = (mode: 'list' | 'kanban' | 'calendar') => {
    setViewMode(mode);
    try {
      localStorage.setItem('lifeos_tasks_view_mode', mode);
    } catch {}
  };

  // Active view tab: My Day, Upcoming, Inbox, Overdue, Completed, All Tasks
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'inbox' | 'overdue' | 'completed' | 'all'>('today');

  // Filters state
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [recurringFilter, setRecurringFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'created' | 'duration' | 'title'>('priority');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [modalInitialValues, setModalInitialValues] = useState<{
    title?: string;
    priority?: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  } | undefined>(undefined);

  const todayStr = todayLocal();

  // Dynamic filter lists
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.tags) t.tags.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [tasks]);

  // Overall counts and stats
  const stats = useMemo(() => {
    const active = tasks.filter((t) => !t.isArchived);
    return {
      today: active.filter((t) => !t.isCompleted && (t.dueDate === todayStr || (!t.dueDate && !t.isOverdue))).length,
      upcoming: active.filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr).length,
      inbox: active.filter((t) => !t.isCompleted && (!t.dueDate || t.status === 'backlog')).length,
      overdue: active.filter((t) => !t.isCompleted && t.isOverdue).length,
      completed: active.filter((t) => t.isCompleted).length,
      completedToday: active.filter((t) => t.isCompleted && t.completedAt?.startsWith(todayStr)).length,
      allActive: active.filter((t) => !t.isCompleted).length,
    };
  }, [tasks, todayStr]);

  // Check if any filter is active
  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      priorityFilter !== 'all' ||
      statusFilter !== 'all' ||
      categoryFilter !== 'all' ||
      goalFilter !== 'all' ||
      tagFilter !== 'all' ||
      durationFilter !== 'all' ||
      recurringFilter !== 'all'
    );
  }, [
    searchQuery,
    priorityFilter,
    statusFilter,
    categoryFilter,
    goalFilter,
    tagFilter,
    durationFilter,
    recurringFilter,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setGoalFilter('all');
    setTagFilter('all');
    setDurationFilter('all');
    setRecurringFilter('all');
  };

  // Filter tasks for List view
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Tab routing
        if (activeTab === 'today') {
          return !t.isCompleted && (t.dueDate === todayStr || (!t.dueDate && !t.isOverdue));
        }
        if (activeTab === 'upcoming') {
          return !t.isCompleted && t.dueDate && t.dueDate > todayStr;
        }
        if (activeTab === 'inbox') {
          return !t.isCompleted && (!t.dueDate || t.status === 'backlog');
        }
        if (activeTab === 'overdue') {
          return !t.isCompleted && t.isOverdue;
        }
        if (activeTab === 'completed') {
          return t.isCompleted;
        }
        if (activeTab === 'all') {
          return !t.isCompleted;
        }
        return true;
      })
      .filter((t) => {
        // Exclude archived unless explicitly filtering status='archived'
        if (statusFilter !== 'archived' && t.isArchived) return false;

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'in_progress') {
            if (t.status !== 'in_progress' && t.status !== 'in-progress') return false;
          } else if (statusFilter === 'completed') {
            if (!t.isCompleted && t.status !== 'completed' && t.status !== 'done') return false;
          } else if (t.status !== statusFilter) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        // Goal filter
        if (goalFilter !== 'all' && t.goalId !== goalFilter) return false;

        // Tag filter
        if (tagFilter !== 'all' && (!t.tags || !t.tags.includes(tagFilter))) return false;

        // Duration filter
        if (durationFilter === 'quick_wins') {
          if (!t.estimatedDuration || t.estimatedDuration > 25) return false;
        } else if (durationFilter === 'deep_work') {
          if (!t.estimatedDuration || t.estimatedDuration < 45) return false;
        }

        // Recurring filter
        if (recurringFilter === 'recurring') {
          if (!t.recurrence || t.recurrence === 'none') return false;
        } else if (recurringFilter === 'one_time') {
          if (t.recurrence && t.recurrence !== 'none') return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchTag = t.tags?.some((tg) => tg.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchNotes && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        if (sortBy === 'date') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'duration') {
          return (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    tasks,
    activeTab,
    priorityFilter,
    statusFilter,
    categoryFilter,
    goalFilter,
    tagFilter,
    durationFilter,
    recurringFilter,
    searchQuery,
    sortBy,
    todayStr,
  ]);

  const handleEdit = (t: Task) => {
    setEditingTask(t);
    setModalInitialValues(undefined);
    setIsModalOpen(true);
  };

  const handleExpandQuickTask = (initial?: {
    title: string;
    priority: Priority;
    dueDate?: string;
    category?: string;
    estimatedDuration?: number;
  }) => {
    setEditingTask(undefined);
    setModalInitialValues(initial);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={26} color="var(--accent-primary)" />
            Task Management & Priorities 2.0
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Multi-view priority execution, subtask checklists, recurring intervals, and focus session orchestration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => handleSetViewMode('list')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: viewMode === 'list' ? 700 : 500,
              }}
            >
              <LayoutList size={14} />
              List
            </button>
            <button
              onClick={() => handleSetViewMode('kanban')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'kanban' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: viewMode === 'kanban' ? 700 : 500,
              }}
            >
              <Kanban size={14} />
              Kanban
            </button>
            <button
              onClick={() => handleSetViewMode('calendar')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'calendar' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: viewMode === 'calendar' ? 700 : 500,
              }}
            >
              <CalendarDays size={14} />
              Calendar
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(undefined);
              setModalInitialValues(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="tasks_intro"
        title="Rule of 3 Focus Triage"
        description="Anchor your morning by pinning your 3 most critical daily objectives. Use Quick Add bar below for 2-second capture or launch a focus timer on any task."
        actionText="Create Priority Task"
        onAction={() => {
          setEditingTask(undefined);
          setModalInitialValues(undefined);
          setIsModalOpen(true);
        }}
        style={{ marginBottom: '14px' }}
      />

      {/* Stats Summary Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '10px 16px',
          background: 'var(--bg-card)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--panel-shadow)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <span
          onClick={() => {
            handleSetViewMode('list');
            setActiveTab('today');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Due Today:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.today}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            handleSetViewMode('list');
            setActiveTab('overdue');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--danger, #EF4444)', fontWeight: 600 }}>Overdue:</span>
          <span style={{ fontWeight: 700, color: 'var(--danger, #EF4444)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.overdue}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            handleSetViewMode('list');
            setActiveTab('upcoming');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.upcoming}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            handleSetViewMode('list');
            setActiveTab('inbox');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Inbox:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.inbox}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            handleSetViewMode('list');
            setActiveTab('completed');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--status-success, #22C55E)', fontWeight: 600 }}>Completed Today:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-success, #22C55E)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.completedToday}
          </span>
        </span>
      </div>

      {/* Quick Task Capture Bar (with chrono-node NLP parsing) */}
      <QuickTaskBar onExpandDetails={handleExpandQuickTask} />

      {/* =========================================================================
          VIEW MODE 1: LIST VIEW
      ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Views Navigation Tabs & Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
              {[
                { id: 'today', label: 'My Day', count: stats.today },
                { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
                { id: 'inbox', label: 'Inbox', count: stats.inbox },
                { id: 'overdue', label: 'Overdue', count: stats.overdue, danger: stats.overdue > 0 },
                { id: 'all', label: 'All Tasks', count: stats.allActive },
                { id: 'completed', label: 'Completed', count: stats.completed },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="btn btn-sm"
                    style={{
                      background: isActive ? 'var(--bg-hover)' : 'transparent',
                      color: isActive
                        ? 'var(--text-primary)'
                        : tab.danger
                        ? 'var(--danger)'
                        : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontVariantNumeric: 'tabular-nums',
                        color: tab.danger ? 'var(--danger)' : 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inline Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{
                  padding: '4px 8px 4px 26px',
                  fontSize: '12px',
                  width: '200px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                }}
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

          {/* Granular Filters & Sorting Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '8px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '11.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Priority Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Goal Filter */}
              {goals.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Goal:</span>
                  <select
                    value={goalFilter}
                    onChange={(e) => setGoalFilter(e.target.value)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      maxWidth: '220px',
                    }}
                  >
                    <option value="all">All Goals</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id} title={g.title}>
                        {g.title.length > 36 ? `${g.title.slice(0, 35)}…` : g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Duration Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} color="var(--text-muted)" />
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Any Duration</option>
                  <option value="quick_wins">Quick Wins (≤25m)</option>
                  <option value="deep_work">Deep Work (≥45m)</option>
                </select>
              </div>

              {/* Clear All Filters button */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <RotateCcw size={11} /> Clear filters
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={12} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="priority">Priority</option>
                <option value="date">Due Date</option>
                <option value="duration">Estimated Time</option>
                <option value="title">Title (A-Z)</option>
                <option value="created">Created</option>
              </select>
            </div>
          </div>

          {/* Task Items List */}
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ padding: '36px 20px' }}>
              {tasks.length === 0 ? (
                <EmptyState
                  illustration="tasks"
                  badge="Clean Slate"
                  title="Your day is open."
                  description="Organize your day with clear priorities. Set due dates, subtasks, and Eisenhower ratings."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        clearAllFilters();
                        setEditingTask(undefined);
                        setModalInitialValues(undefined);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={15} /> Create your first task
                    </button>
                  }
                />
              ) : isFiltered ? (
                <EmptyState
                  illustration="tasks"
                  badge="Filtered Results"
                  title="No matching tasks found"
                  description="No tasks match your active search term or category filters."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={clearAllFilters}
                    >
                      Clear all filters
                    </button>
                  }
                  secondaryAction={
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingTask(undefined);
                        setModalInitialValues(undefined);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={15} /> New Task
                    </button>
                  }
                />
              ) : activeTab === 'today' ? (
                <EmptyState
                  illustration="tasks"
                  badge="Today All Clear"
                  title="All clear for today!"
                  description="No pending tasks are scheduled for today. Enjoy your evening or schedule an item."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingTask(undefined);
                        setModalInitialValues(undefined);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={15} /> Schedule a task
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  illustration="tasks"
                  title="No tasks in this view"
                  description="All tasks in this section are complete or archived."
                  action={
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingTask(undefined);
                        setModalInitialValues(undefined);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={15} /> Add Task
                    </button>
                  }
                />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onEdit={() => handleEdit(t)}
                  onDelete={() => handleDelete(t.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: KANBAN BOARD
      ========================================================================= */}
      {viewMode === 'kanban' && (
        <TaskKanbanBoard
          tasks={tasks}
          onEditTask={handleEdit}
          onAddTaskToStatus={(colStatus) => {
            setEditingTask(undefined);
            setModalInitialValues(undefined);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* =========================================================================
          VIEW MODE 3: CALENDAR VIEW
      ========================================================================= */}
      {viewMode === 'calendar' && (
        <TaskCalendarView
          tasks={tasks}
          onEditTask={handleEdit}
          onAddTaskForDate={(dateStr) => {
            setEditingTask(undefined);
            setModalInitialValues({ dueDate: dateStr });
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        initialValues={modalInitialValues}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
          setModalInitialValues(undefined);
        }}
      />
    </div>
  );
}
