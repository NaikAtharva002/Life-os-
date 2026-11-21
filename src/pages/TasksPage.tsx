import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckSquare,
  Calendar as CalendarIcon,
  Search,
  ArrowUpDown,
  CheckCircle,
  LayoutList,
  Kanban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Check,
  MoreVertical,
  Layers,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import { aiEngine } from '../services/aiEngineClient';
import type { Task, Priority, TaskStatus } from '../types';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'var(--text-secondary)' },
  { id: 'in-progress', title: 'In Progress', color: 'var(--accent)' },
  { id: 'blocked', title: 'Blocked', color: 'var(--danger)' },
  { id: 'done', title: 'Completed', color: 'var(--success)' },
];

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const updateTask = useStore((s) => s.updateTask);
  const completeTask = useStore((s) => s.completeTask);

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'all' | 'completed'>('today');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'created'>('priority');

  const [nlpInput, setNlpInput] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      today: tasks.filter((t) => !t.isCompleted && t.dueDate === todayStr).length,
      overdue: tasks.filter((t) => !t.isCompleted && t.isOverdue).length,
      critical: tasks.filter((t) => !t.isCompleted && t.priority === 'critical').length,
      high: tasks.filter((t) => !t.isCompleted && t.priority === 'high').length,
      completedToday: tasks.filter((t) => t.isCompleted && t.completedAt?.startsWith(todayStr)).length,
    };
  }, [tasks, todayStr]);

  // Filter tasks for List view
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (activeTab === 'today') {
          return !t.isCompleted && (t.dueDate === todayStr || (!t.dueDate && !t.isOverdue));
        }
        if (activeTab === 'upcoming') {
          return !t.isCompleted && t.dueDate && t.dueDate > todayStr;
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
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (
          searchQuery &&
          !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, activeTab, priorityFilter, searchQuery, sortBy, todayStr]);

  const handleEdit = (t: Task) => {
    setEditingTask(t);
    setIsModalOpen(true);
  };

  const handleNLPTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;

    setNlpLoading(true);
    const parsed = await aiEngine.parseTaskNLP(nlpInput);

    if (parsed) {
      await addTask({
        title: parsed.title,
        dueDate: parsed.due_date || (parsed.is_scheduled_today ? todayStr : undefined),
        dueTime: parsed.due_time || undefined,
        priority: parsed.priority,
        category: parsed.category || 'General',
        status: 'todo',
        subtasks: [],
      });
    } else {
      await addTask({
        title: nlpInput.trim(),
        priority: 'medium',
        category: 'General',
        dueDate: todayStr,
        status: 'todo',
        subtasks: [],
      });
    }

    setNlpInput('');
    setNlpLoading(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this task?')) {
      deleteTask(id);
    }
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        dateStr: dStr,
        tasks: tasks.filter((t) => t.dueDate === dStr),
      });
    }
    return days;
  }, [currentDate, tasks]);

  const monthYearLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={26} color="var(--accent)" />
            Task Management & Priorities
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Focus on what matters most with priority-driven daily task execution and multi-view planning.
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
              onClick={() => setViewMode('list')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
              }}
            >
              <LayoutList size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'kanban' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
              }}
            >
              <Kanban size={14} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className="btn btn-sm"
              style={{
                background: viewMode === 'calendar' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
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
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Compact Summary Strip */}
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
        <span
          onClick={() => {
            setViewMode('list');
            setActiveTab('today');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Due Today:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.today}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            setViewMode('list');
            setActiveTab('overdue');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Overdue:</span>
          <span style={{ fontWeight: 700, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.overdue}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            setViewMode('list');
            setActiveTab('upcoming');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {tasks.filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr).length}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span
          onClick={() => {
            setViewMode('list');
            setActiveTab('completed');
          }}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <span style={{ color: 'var(--success)', fontWeight: 600 }}>Completed Today:</span>
          <span style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
            {stats.completedToday}
          </span>
        </span>

        <span style={{ color: 'var(--border)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Active:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {tasks.filter((t) => !t.isCompleted).length}
          </span>
        </span>
      </div>

      {/* Natural Language Task Input (Python NLP Engine Bridge) */}
      <form
        onSubmit={handleNLPTaskSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface)',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
        <Sparkles size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Natural Language Quick Add: e.g. 'Submit DevOps lab on Friday at 5pm #academics !critical'"
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '12.5px',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={!nlpInput.trim() || nlpLoading}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '11px', height: '26px', padding: '0 10px' }}
        >
          {nlpLoading ? 'Parsing...' : '+ Add with AI'}
        </button>
      </form>

      {/* =========================================================================
          VIEW MODE 1: LIST VIEW
      ========================================================================= */}
      {viewMode === 'list' && (
        <>
          {/* Single Compact Navigation Row */}
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
                { id: 'today', label: 'Today', count: stats.today },
                { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr).length },
                { id: 'overdue', label: 'Overdue', count: stats.overdue, danger: stats.overdue > 0 },
                { id: 'all', label: 'All Active', count: tasks.filter((t) => !t.isCompleted).length },
                { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.isCompleted).length },
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
                      fontWeight: isActive ? 600 : 500,
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
                  width: '180px',
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

          {/* Inline Filter Controls Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '6px 10px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Priority Filter (semantic text pills, no emojis) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Priority:
              </span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => {
                const isSelected = priorityFilter === p;
                const dotColor =
                  p === 'critical'
                    ? 'var(--priority-critical)'
                    : p === 'high'
                    ? 'var(--priority-high)'
                    : p === 'medium'
                    ? 'var(--priority-medium)'
                    : p === 'low'
                    ? 'var(--priority-low)'
                    : 'transparent';

                return (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      fontWeight: isSelected ? 600 : 500,
                      textTransform: 'capitalize',
                      background: isSelected ? 'var(--bg-card)' : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {p !== 'all' && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: dotColor,
                        }}
                      />
                    )}
                    {p === 'all' ? 'All' : p}
                  </button>
                );
              })}
            </div>

            {/* Category & Sort controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Category Filter */}
              {categories.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                  <select
                    className="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ width: 'auto', padding: '3px 8px', fontSize: '11px', height: '26px' }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={12} color="var(--text-muted)" />
                <select
                  className="select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ width: 'auto', padding: '3px 8px', fontSize: '11px', height: '26px' }}
                >
                  <option value="priority">Priority</option>
                  <option value="date">Due Date</option>
                  <option value="created">Created</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="card empty-state" style={{ padding: '40px 20px' }}>
              <CheckCircle size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>No Tasks in this view</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                {activeTab === 'today'
                  ? 'All clear for today! Add a task or relax.'
                  : 'No matching tasks found. Create a new task to get started.'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setPriorityFilter('all');
                  setSearchQuery('');
                  setIsModalOpen(true);
                }}
              >
                <Plus size={15} /> Add Task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        </>
      )}

      {/* =========================================================================
          VIEW MODE 2: KANBAN BOARD
      ========================================================================= */}
      {viewMode === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            alignItems: 'flex-start',
          }}
        >
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => {
              if (col.id === 'done') return t.isCompleted || t.status === 'done';
              return !t.isCompleted && t.status === col.id;
            });

            return (
              <div
                key={col.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '80vh',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: col.color,
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{col.title}</h3>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'var(--bg-card)',
                        padding: '2px 7px',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '3px 6px' }}
                    onClick={() => {
                      setEditingTask(undefined);
                      setIsModalOpen(true);
                    }}
                    title="Add task to this column"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Column Cards */}
                <div
                  style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    overflowY: 'auto',
                  }}
                >
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 10px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                      }}
                    >
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const completedSubs = t.subtasks?.filter((s) => s.isCompleted).length || 0;
                      const totalSubs = t.subtasks?.length || 0;

                      return (
                        <div
                          key={t.id}
                          className="card"
                          style={{
                            padding: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleEdit(t)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background:
                                  t.priority === 'critical'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : t.priority === 'high'
                                    ? 'rgba(249, 115, 22, 0.15)'
                                    : t.priority === 'medium'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  t.priority === 'critical'
                                    ? 'var(--priority-critical)'
                                    : t.priority === 'high'
                                    ? 'var(--priority-high)'
                                    : t.priority === 'medium'
                                    ? 'var(--priority-medium)'
                                    : 'var(--priority-low)',
                              }}
                            >
                              {t.priority}
                            </span>

                            {t.category && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {t.category}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: t.isCompleted ? 'line-through' : 'none',
                              lineHeight: '1.4',
                            }}
                          >
                            {t.title}
                          </div>

                          {t.description && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {t.description}
                            </p>
                          )}

                          {/* Footer with subtasks & due date */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              marginTop: '4px',
                              paddingTop: '6px',
                              borderTop: '1px solid var(--border)',
                            }}
                          >
                            {t.dueDate ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: t.isOverdue ? 'var(--danger)' : 'var(--text-secondary)',
                                  fontWeight: t.isOverdue ? 700 : 500,
                                }}
                              >
                                {t.isOverdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                                {t.dueDate === todayStr ? 'Today' : t.dueDate}
                              </div>
                            ) : (
                              <span />
                            )}

                            {totalSubs > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={11} />
                                {completedSubs}/{totalSubs}
                              </div>
                            )}

                            {/* Move Column dropdown */}
                            <select
                              className="select"
                              value={t.isCompleted ? 'done' : t.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={async (e) => {
                                const newStatus = e.target.value as TaskStatus;
                                if (newStatus === 'done') {
                                  await completeTask(t.id);
                                } else {
                                  await updateTask(t.id, {
                                    status: newStatus,
                                    isCompleted: false,
                                    completedAt: undefined,
                                  });
                                }
                              }}
                              style={{
                                fontSize: '10px',
                                padding: '2px 4px',
                                height: 'auto',
                                width: 'auto',
                                borderRadius: '4px',
                              }}
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="blocked">Blocked</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: CALENDAR VIEW
      ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="card" style={{ padding: '20px' }}>
          {/* Calendar Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarIcon size={20} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{monthYearLabel}</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                }
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                }
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}
          >
            {calendarDays.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`pad-${idx}`}
                    style={{
                      minHeight: '90px',
                      background: 'var(--bg-secondary)',
                      opacity: 0.25,
                      borderRadius: '8px',
                    }}
                  />
                );
              }

              const isToday = item.dateStr === todayStr;

              return (
                <div
                  key={item.dateStr}
                  style={{
                    minHeight: '100px',
                    background: isToday ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isToday ? 800 : 600,
                        color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isToday ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      }}
                    >
                      {item.dayNum}
                    </span>

                    {item.tasks.length > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {item.tasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks on this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
                    {item.tasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleEdit(t)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: t.isCompleted ? 'var(--bg-card)' : 'var(--bg-card)',
                          borderLeft: `3px solid ${
                            t.priority === 'critical'
                              ? 'var(--priority-critical)'
                              : t.priority === 'high'
                              ? 'var(--priority-high)'
                              : t.priority === 'medium'
                              ? 'var(--priority-medium)'
                              : 'var(--priority-low)'
                          }`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          color: t.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: t.isCompleted ? 'line-through' : 'none',
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}

                    {item.tasks.length > 3 && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--accent)',
                          fontWeight: 600,
                          paddingLeft: '4px',
                        }}
                      >
                        +{item.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          defaultPriority="high"
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
}
