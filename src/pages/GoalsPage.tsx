import React, { useState, useMemo, useEffect } from 'react';
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
  CheckSquare,
  Sparkles,
  Layers,
  History,
  TrendingUp,
  Clock,
  Circle,
  Pause,
  Play,
  ShieldAlert,
  BarChart3,
  Compass,
} from 'lucide-react';
import useStore from '../store/useStore';
import GoalModal from '../components/GoalModal';
import GoalDetailModal from '../components/GoalDetailModal';
import TaskModal from '../components/TaskModal';
import type { Goal, Priority, GoalStatus, LifeArea, GoalMeasurementType } from '../types';
import { getPhoto } from '../utils/photoAssets';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const LIFE_AREAS: { id: LifeArea; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal Growth', icon: '🌱' },
  { id: 'career', label: 'Career & Work', icon: '💼' },
  { id: 'academic', label: 'Academics', icon: '📚' },
  { id: 'finance', label: 'Wealth & Finance', icon: '🪙' },
  { id: 'fitness', label: 'Health & Fitness', icon: '⚡' },
  { id: 'learning', label: 'Skills & Learning', icon: '🧠' },
  { id: 'relationships', label: 'Relationships', icon: '🤝' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { id: 'custom', label: 'Custom', icon: '🎯' },
];

export default function GoalsPage() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const toggleMilestone = useStore((s) => s.toggleMilestone);
  const setGoalStatus = useStore((s) => s.setGoalStatus);
  const setActiveView = useStore((s) => s.setActiveView);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [detailGoalId, setDetailGoalId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalGoalId, setTaskModalGoalId] = useState<string | undefined>(undefined);

  // View Mode with local storage persistence
  const [viewMode, setViewMode] = useState<'editorial' | 'table' | 'timeline' | 'analytics'>(() => {
    return (localStorage.getItem('lifeos_goals_viewMode') as any) || 'editorial';
  });

  useEffect(() => {
    localStorage.setItem('lifeos_goals_viewMode', viewMode);
  }, [viewMode]);

  // Filters & Sorting State
  const [lifeAreaFilter, setLifeAreaFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [measurementFilter, setMeasurementFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'targetDate' | 'created' | 'updated'>('priority');

  // Table Expanded rows
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Dashboard Executive Statistics
  const dashboardStats = useMemo(() => {
    const nonArchived = goals.filter((g) => !g.isArchived);
    const active = nonArchived.filter((g) => g.progress < 100 && g.status !== 'completed' && g.status !== 'abandoned');
    const completed = nonArchived.filter((g) => g.progress >= 100 || g.status === 'completed');
    const atRisk = nonArchived.filter(
      (g) => g.status === 'at-risk' || (g.targetDate && g.targetDate < today && g.progress < 100)
    );

    const upcoming7Days = nonArchived.filter(
      (g) => g.targetDate && g.targetDate >= today && g.targetDate <= nextWeekStr && g.progress < 100
    );

    const totalMilestones = nonArchived.reduce((sum, g) => sum + g.milestones.length, 0);
    const completedMilestones = nonArchived.reduce(
      (sum, g) => sum + g.milestones.filter((m) => m.isCompleted).length,
      0
    );
    const overdueMilestones = nonArchived.reduce(
      (sum, g) => sum + g.milestones.filter((m) => !m.isCompleted && m.dueDate && m.dueDate < today).length,
      0
    );

    const avgProgress =
      active.length > 0 ? Math.round(active.reduce((acc, g) => acc + g.progress, 0) / active.length) : 0;

    // Progress by life area
    const lifeAreaStats: Record<string, { total: number; progressSum: number }> = {};
    nonArchived.forEach((g) => {
      const area = g.lifeArea || 'personal';
      if (!lifeAreaStats[area]) lifeAreaStats[area] = { total: 0, progressSum: 0 };
      lifeAreaStats[area].total += 1;
      lifeAreaStats[area].progressSum += g.progress;
    });

    return {
      total: nonArchived.length,
      activeCount: active.length,
      completedCount: completed.length,
      atRiskCount: atRisk.length,
      upcoming7DaysCount: upcoming7Days.length,
      avgProgress,
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      milestoneRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      lifeAreaStats,
    };
  }, [goals, today, nextWeekStr]);

  // Filtered and Sorted Goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => !g.isArchived)
      .filter((g) => {
        if (lifeAreaFilter !== 'all' && (g.lifeArea || 'personal') !== lifeAreaFilter) return false;
        if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;

        if (statusFilter === 'active') {
          if (g.progress >= 100 || g.status === 'completed' || g.status === 'abandoned') return false;
        } else if (statusFilter === 'completed') {
          if (g.progress < 100 && g.status !== 'completed') return false;
        } else if (statusFilter === 'at-risk') {
          const isOverdue = g.targetDate && g.targetDate < today && g.progress < 100;
          if (g.status !== 'at-risk' && !isOverdue) return false;
        } else if (statusFilter !== 'all' && g.status !== statusFilter) {
          return false;
        }

        if (measurementFilter !== 'all' && g.measurementType !== measurementFilter) return false;

        if (
          searchQuery &&
          !g.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !g.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !g.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
        if (sortBy === 'updated') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [goals, lifeAreaFilter, priorityFilter, statusFilter, measurementFilter, searchQuery, sortBy, today]);

  const handleEdit = (goal: Goal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this goal, all associated milestones, and unlink tasks?')) {
      deleteGoal(id);
    }
  };

  const handleOpenDetail = (goal: Goal) => {
    setDetailGoalId(goal.id);
  };

  // Cover image fallback
  const getGoalImage = (category: string, idx: number) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('career') || cat.includes('tech') || cat.includes('code')) return getPhoto('goal-tech').path;
    if (cat.includes('finance') || cat.includes('wealth')) return getPhoto('goal-finance').path;
    if (cat.includes('fitness') || cat.includes('health') || cat.includes('gym')) return getPhoto('goal-fitness').path;
    if (cat.includes('academic') || cat.includes('learn') || cat.includes('study')) return getPhoto('goal-academics').path;
    const pool = [
      getPhoto('goal-tech').path,
      getPhoto('goal-finance').path,
      getPhoto('goal-fitness').path,
      getPhoto('goal-academics').path,
    ];
    return pool[idx % pool.length];
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. EDITORIAL PHOTOGRAPHIC HEADER BANNER */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '210px',
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
              Strategic Horizons 2.0
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
              Goal Planning &amp; Execution Engine
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '540px' }}>
              Bridge ambitions with actionable milestones, quantitative targets, and connected daily execution.
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

      {/* 2. EXECUTIVE RADAR & NOTIFICATION BANNER */}
      {(dashboardStats.atRiskCount > 0 || dashboardStats.overdueMilestones > 0) && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-danger-bg)',
            border: '1px solid var(--status-danger-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={18} color="var(--status-danger)" />
            <div style={{ fontSize: '12.5px', color: 'var(--status-danger)' }}>
              <strong>Execution Velocity Radar:</strong>{' '}
              {dashboardStats.atRiskCount > 0 && `${dashboardStats.atRiskCount} goal(s) currently at risk. `}
              {dashboardStats.overdueMilestones > 0 && `${dashboardStats.overdueMilestones} milestone checkpoint(s) past deadline.`}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter('at-risk')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', color: 'var(--status-danger)', borderColor: 'var(--status-danger-border)' }}
          >
            Filter At-Risk Goals
          </button>
        </div>
      )}

      {/* 3. GOAL DASHBOARD OVERVIEW STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Ambitions</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }} className="tabular">
            {dashboardStats.activeCount}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>of {dashboardStats.total} total</span>
        </div>

        <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Milestone Velocity</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--palette-brick)', marginTop: '4px' }} className="tabular">
            {dashboardStats.milestoneRate}%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {dashboardStats.completedMilestones}/{dashboardStats.totalMilestones} checkpoints
          </span>
        </div>

        <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Average Progress</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--status-success)', marginTop: '4px' }} className="tabular">
            {dashboardStats.avgProgress}%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across active horizon</span>
        </div>

        <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Conquered Goals</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--status-success)', marginTop: '4px' }} className="tabular">
            {dashboardStats.completedCount}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>100% achieved</span>
        </div>

        <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Deadlines Next 7d</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: dashboardStats.upcoming7DaysCount > 0 ? 'var(--status-warning)' : 'var(--text-primary)', marginTop: '4px' }} className="tabular">
            {dashboardStats.upcoming7DaysCount}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Immediate attention</span>
        </div>
      </div>

      {/* 4. TOOLBAR & VIEW SWITCHER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Life Area Filter */}
          <select
            className="select"
            value={lifeAreaFilter}
            onChange={(e) => setLifeAreaFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Life Areas</option>
            {LIFE_AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>

          {/* Measurement Filter */}
          <select
            className="select"
            value={measurementFilter}
            onChange={(e) => setMeasurementFilter(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="all">All Measurements</option>
            <option value="numeric">Numeric Metric</option>
            <option value="milestone-based">Milestone Roadmap</option>
            <option value="completion">Completion-Based</option>
            <option value="habit-based">Habit-Linked</option>
          </select>

          {/* Sort By */}
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
          >
            <option value="priority">Priority First</option>
            <option value="progress">Progress Velocity</option>
            <option value="targetDate">Target Deadline</option>
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Added</option>
          </select>
        </div>

        {/* Search & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search goals or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 10px 6px 30px', fontSize: '12px', width: '180px' }}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode('editorial')}
              className={`btn btn-sm ${viewMode === 'editorial' ? 'btn-primary' : 'btn-secondary'}`}
              title="Editorial Card Grid"
            >
              <LayoutGrid size={13} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              title="Structured Data Table"
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
              title="Roadmap Horizon Timeline"
            >
              <Compass size={13} /> Timeline
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`btn btn-sm ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              title="Goal Intelligence Analytics"
            >
              <BarChart3 size={13} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* 5. VIEW CONTENT */}
      {filteredGoals.length === 0 && viewMode !== 'analytics' ? (
        goals.length === 0 ? (
          <EmptyState
            illustration="goals"
            badge="Clean Slate"
            title="Give your ambitions a direction."
            description="Define milestones, track completion progress, and attach daily habits to long-term goals."
            action={
              <button
                onClick={() => {
                  setEditingGoal(undefined);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> Create your first goal
              </button>
            }
          />
        ) : (
          <EmptyState
            illustration="goals"
            badge="Filtered View"
            title="No matching goals found"
            description="No goals match your active filters or search query."
            action={
              <button
                onClick={() => {
                  setLifeAreaFilter('all');
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setMeasurementFilter('all');
                  setSearchQuery('');
                }}
                className="btn btn-primary btn-sm"
              >
                Clear all filters
              </button>
            }
          />
        )
      ) : viewMode === 'editorial' ? (
        /* ------------------ EDITORIAL GRID VIEW ------------------ */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
          {filteredGoals.map((g, idx) => {
            const photoUrl = g.coverImage || getGoalImage(g.category, idx);
            const isCompleted = g.progress === 100 || g.status === 'completed';
            const goalTasks = tasks.filter((t) => t.goalId === g.id && !t.isArchived);
            const completedTasks = goalTasks.filter((t) => t.isCompleted).length;
            const isAtRisk = g.status === 'at-risk' || (g.targetDate && g.targetDate < today && !isCompleted);

            return (
              <div
                key={g.id}
                className="photo-tile"
                onClick={() => handleOpenDetail(g)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderColor: isCompleted
                    ? 'var(--palette-brick-border)'
                    : isAtRisk
                    ? 'var(--status-danger)'
                    : 'var(--border-default)',
                }}
              >
                {/* Visual Header */}
                <div className="photo-tile-image-wrap" style={{ height: '140px' }}>
                  <img
                    src={photoUrl}
                    alt={g.title}
                    className="photo-tile-img"
                    loading="lazy"
                  />
                  <div className="photo-tile-scrim" />

                  {/* Top Tags */}
                  <div style={{ position: 'absolute', top: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(20, 19, 1, 0.85)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {g.lifeArea || 'Personal'}
                      </span>

                      {g.measurementType && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(20, 19, 1, 0.75)',
                            color: 'var(--accent-light)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {g.measurementType === 'numeric'
                            ? 'Numeric'
                            : g.measurementType === 'habit-based'
                            ? 'Habit Loop'
                            : 'Roadmap'}
                        </span>
                      )}
                    </div>

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

                  {/* Actions in Cover Header */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleEdit(g, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.85)', color: '#FFFFFF', backdropFilter: 'blur(6px)' }}
                      title="Edit Goal"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(g.id, e)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px', background: 'rgba(20, 19, 1, 0.85)', color: 'var(--status-danger)', backdropFilter: 'blur(6px)' }}
                      title="Delete Goal"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                        {g.title}
                      </h3>
                      {g.status && (
                        <span
                          className={`badge ${
                            g.status === 'at-risk'
                              ? 'badge-danger'
                              : g.status === 'on-track' || isCompleted
                              ? 'badge-success'
                              : g.status === 'paused'
                              ? 'badge-warning'
                              : 'badge-secondary'
                          }`}
                          style={{ fontSize: '10px', textTransform: 'capitalize' }}
                        >
                          {g.status}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {g.description || 'Continuous milestone progression.'}
                    </p>
                  </div>

                  {/* Progress Bar & Status */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {g.measurementType === 'numeric' && g.targetValue
                          ? `${g.currentValue || 0} / ${g.targetValue} ${g.unit || ''}`
                          : 'Progress'}
                      </span>
                      <span className="tabular" style={{ fontWeight: 700, color: isCompleted ? 'var(--status-success)' : 'var(--palette-brick)' }}>
                        {g.progress}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${g.progress}%`,
                          height: '100%',
                          background: isCompleted ? 'var(--status-success)' : 'var(--palette-brick)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestone Roadmaps Preview (Clickable) */}
                  {g.milestones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Checkpoints ({g.milestones.filter((m) => m.isCompleted).length}/{g.milestones.length})
                      </span>
                      {g.milestones.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMilestone(g.id, m.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: m.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '3px',
                              border: m.isCompleted ? 'none' : '1px solid var(--border-default)',
                              background: m.isCompleted ? 'var(--palette-brick)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {m.isCompleted && <Check size={9} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                      {g.milestones.length > 3 && (
                        <span style={{ fontSize: '10.5px', color: 'var(--palette-brick)' }}>
                          +{g.milestones.length - 3} more checkpoints...
                        </span>
                      )}
                    </div>
                  )}

                  {/* Connected Tasks & Target Deadline Footer */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckSquare size={11} color="var(--palette-brick)" />
                        Tasks: {completedTasks}/{goalTasks.length}
                      </span>
                      {g.targetDate && (
                        <span style={{ color: isAtRisk ? 'var(--status-danger)' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={11} /> {g.targetDate}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(g);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--palette-brick)' }}
                    >
                      Roadmap <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* ------------------ TABLE VIEW ------------------ */
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ width: '32px', padding: '10px 14px' }}></th>
                <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Goal</th>
                <th style={{ width: '120px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Life Area</th>
                <th style={{ width: '100px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority</th>
                <th style={{ width: '110px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ width: '140px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Progress</th>
                <th style={{ width: '100px', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Deadline</th>
                <th style={{ width: '100px', textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
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
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        <span style={{ textTransform: 'capitalize' }}>{g.lifeArea || 'Personal'}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
                          {g.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                          {g.status || 'not-started'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--palette-brick)' }} />
                          </div>
                          <span className="tabular">{g.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }} className="tabular">
                        {g.targetDate || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(g);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 4px', color: 'var(--palette-brick)' }}
                          title="View Roadmap Details"
                        >
                          <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={(e) => handleEdit(g, e)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 4px' }}
                          title="Edit Goal"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(g.id, e)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 4px', color: 'var(--status-danger)' }}
                          title="Delete Goal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        <td colSpan={8} style={{ padding: '12px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Roadmap Checkpoints ({g.milestones.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(g)}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', color: 'var(--palette-brick)' }}
                              >
                                Open Full Strategy Roadmap →
                              </button>
                            </div>
                            {g.milestones.length === 0 ? (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No checkpoints recorded. Open details to build milestones.
                              </span>
                            ) : (
                              g.milestones.map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => toggleMilestone(g.id, m.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  <CheckCircle2 size={13} color={m.isCompleted ? 'var(--palette-brick)' : 'var(--text-muted)'} />
                                  <span style={{ textDecoration: m.isCompleted ? 'line-through' : 'none', color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                    {m.title}
                                  </span>
                                  {m.dueDate && (
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                      {m.dueDate}
                                    </span>
                                  )}
                                </div>
                              ))
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
      ) : viewMode === 'timeline' ? (
        /* ------------------ CROSS-GOAL TIMELINE VIEW ------------------ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
          <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Master Temporal Horizon Roadmap
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Chronological alignment of all active goals and upcoming milestone checkpoints.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredGoals.map((g) => (
              <div
                key={g.id}
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🎯</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{g.title}</strong>
                    <span className="badge" style={{ fontSize: '10px', background: 'var(--bg-elevated)', color: 'var(--accent-light)' }}>
                      {g.lifeArea || 'Personal'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="tabular" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--palette-brick)' }}>
                      {g.progress}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(g)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      Inspect Plan
                    </button>
                  </div>
                </div>

                {/* Milestone Roadmap Nodes */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '6px',
                  }}
                >
                  <div
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'var(--palette-brick)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Start: {g.startDate || g.createdAt.split('T')[0]}
                  </div>

                  {g.milestones.map((m, idx) => {
                    const isOverdue = !m.isCompleted && m.dueDate && m.dueDate < today;
                    return (
                      <React.Fragment key={m.id}>
                        <span style={{ color: 'var(--border-default)' }}>→</span>
                        <div
                          onClick={() => toggleMilestone(g.id, m.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: m.isCompleted
                              ? 'var(--status-success-bg)'
                              : isOverdue
                              ? 'var(--status-danger-bg)'
                              : 'var(--bg-elevated)',
                            border: m.isCompleted
                              ? '1px solid var(--status-success-border)'
                              : isOverdue
                              ? '1px solid var(--status-danger-border)'
                              : '1px solid var(--border-default)',
                            color: m.isCompleted
                              ? 'var(--status-success)'
                              : isOverdue
                              ? 'var(--status-danger)'
                              : 'var(--text-primary)',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.isCompleted ? '✓' : idx + 1}. {m.title}
                          {m.dueDate && <span style={{ opacity: 0.7, fontSize: '10px' }}>({m.dueDate})</span>}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  <span style={{ color: 'var(--border-default)' }}>→</span>
                  <div
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'var(--palette-walnut)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Goal Target: {g.targetDate || 'Continuous'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ------------------ ANALYTICS & INSIGHTS VIEW ------------------ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-in">
          {/* Executive Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active vs Completed</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }} className="tabular">
                {dashboardStats.activeCount} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {dashboardStats.completedCount}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {dashboardStats.total > 0 ? Math.round((dashboardStats.completedCount / dashboardStats.total) * 100) : 0}% cumulative completion rate
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Milestone Checkpoint Ratio</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--palette-brick)', marginTop: '4px' }} className="tabular">
                {dashboardStats.milestoneRate}%
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {dashboardStats.completedMilestones} of {dashboardStats.totalMilestones} checkpoints achieved
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>At-Risk Ambitions</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: dashboardStats.atRiskCount > 0 ? 'var(--status-danger)' : 'var(--status-success)', marginTop: '4px' }} className="tabular">
                {dashboardStats.atRiskCount}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {dashboardStats.atRiskCount > 0 ? 'Requires immediate scope adjustment' : 'All milestones on schedule'}
              </p>
            </div>
          </div>

          {/* Life Area Breakdown Matrix */}
          <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Horizon Velocity by Life Area
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {LIFE_AREAS.map((area) => {
                const stat = dashboardStats.lifeAreaStats[area.id];
                if (!stat || stat.total === 0) return null;
                const avgPct = Math.round(stat.progressSum / stat.total);

                return (
                  <div key={area.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{area.icon}</span> {area.label} ({stat.total} goal{stat.total > 1 ? 's' : ''})
                      </span>
                      <span className="tabular" style={{ fontWeight: 700, color: 'var(--palette-brick)' }}>
                        {avgPct}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${avgPct}%`,
                          height: '100%',
                          background: 'var(--palette-brick)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goal Creation / Edit Modal */}
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

      {/* Comprehensive Goal Detail Modal */}
      {detailGoalId && (
        <GoalDetailModal
          isOpen={Boolean(detailGoalId)}
          goalId={detailGoalId}
          onClose={() => setDetailGoalId(null)}
          onEditGoal={(g) => {
            setDetailGoalId(null);
            setEditingGoal(g);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Task Creation Modal linked to Goal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        defaultGoalId={taskModalGoalId}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskModalGoalId(undefined);
        }}
      />
    </div>
  );
}
