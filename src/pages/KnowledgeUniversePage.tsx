import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Settings2,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Link2,
  ScanSearch,
  Orbit,
  Sparkles,
  FileText,
  Target,
  CheckSquare,
  Compass,
} from 'lucide-react';
import useStore, { DEFAULT_GRAPH_PREFERENCES } from '../store/useStore';
import {
  buildKnowledgeUniverseGraph,
  filterAndProjectUniverse,
  UNIVERSE_CATEGORIES,
  type UniverseNode,
} from '../lib/knowledgeGraph';
import type {
  CustomGraphNode,
  GraphPreferences,
  UniverseCategory,
  UniverseGraphMode,
} from '../types';
import {
  UniverseCanvas,
  type UniverseCanvasHandle,
} from '../components/universe/UniverseCanvas';
import { UniverseNodeInspector } from '../components/universe/UniverseNodeInspector';
import {
  ConnectNodesModal,
  CustomNodeModal,
} from '../components/universe/UniverseModals';
import { ErrorBoundary } from '../components/ErrorBoundary';

const GRAPH_MODES: Array<{ id: UniverseGraphMode; label: string }> = [
  { id: 'full', label: 'Full Universe' },
  { id: 'personal', label: 'Personal' },
  { id: 'academic', label: 'Academic' },
  { id: 'career', label: 'Career' },
  { id: 'project', label: 'Project' },
  { id: 'goal', label: 'Goal' },
  { id: 'knowledge', label: 'Knowledge' },
];

export default function KnowledgeUniversePage() {
  const goals = useStore((s) => s.goals);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitRoutines = useStore((s) => s.habitRoutines);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const financeBudgets = useStore((s) => s.financeBudgets);
  const savingsGoals = useStore((s) => s.savingsGoals);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const exercises = useStore((s) => s.exercises);
  const fitnessGoals = useStore((s) => s.fitnessGoals);
  const academicSemesters = useStore((s) => s.academicSemesters);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const academicExams = useStore((s) => s.academicExams);
  const timetableSlots = useStore((s) => s.timetableSlots);
  const careerGoals = useStore((s) => s.careerGoals);
  const careerSkills = useStore((s) => s.careerSkills);
  const careerProjects = useStore((s) => s.careerProjects);
  const careerApplications = useStore((s) => s.careerApplications);
  const careerDocuments = useStore((s) => s.careerDocuments);
  const eveningReviews = useStore((s) => s.eveningReviews);
  const obsidianNotes = useStore((s) => s.obsidianNotes);
  const graphNodes = useStore((s) => s.graphNodes);
  const graphEdges = useStore((s) => s.graphEdges);
  const settings = useStore((s) => s.settings);

  const setActiveView = useStore((s) => s.setActiveView);
  const saveGraphNode = useStore((s) => s.saveGraphNode);
  const deleteGraphNode = useStore((s) => s.deleteGraphNode);
  const addGraphEdge = useStore((s) => s.addGraphEdge);
  const deleteGraphEdge = useStore((s) => s.deleteGraphEdge);
  const updateGraphPreferences = useStore((s) => s.updateGraphPreferences);
  const resetGraphPreferences = useStore((s) => s.resetGraphPreferences);
  const addToast = useStore((s) => s.addToast);

  const canvasRef = useRef<UniverseCanvasHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const prefs: GraphPreferences = useMemo(
    () => ({ ...DEFAULT_GRAPH_PREFERENCES, ...settings.graphPreferences }),
    [settings.graphPreferences]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<UniverseNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [connectedOnly, setConnectedOnly] = useState(false);
  const [connectionScope, setConnectionScope] = useState<'all' | 'direct'>('all');
  const [focusGoalId, setFocusGoalId] = useState<string>(goals[0]?.id || '');
  const [focusProjectId, setFocusProjectId] = useState<string>(careerProjects[0]?.id || '');

  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [editingCustomNode, setEditingCustomNode] = useState<CustomGraphNode | null>(null);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  const rawGraph = useMemo(
    () =>
      buildKnowledgeUniverseGraph({
        goals,
        tasks,
        habits,
        habitRoutines,
        financeTransactions,
        financeBudgets,
        savingsGoals,
        workoutSessions,
        exercises,
        fitnessGoals,
        academicSemesters,
        academicSubjects,
        academicAssignments,
        academicExams,
        timetableSlots,
        careerGoals,
        careerSkills,
        careerProjects,
        careerApplications,
        careerDocuments,
        eveningReviews,
        obsidianNotes,
        graphNodes,
        graphEdges,
        settings,
      }),
    [
      goals,
      tasks,
      habits,
      habitRoutines,
      financeTransactions,
      financeBudgets,
      savingsGoals,
      workoutSessions,
      exercises,
      fitnessGoals,
      academicSemesters,
      academicSubjects,
      academicAssignments,
      academicExams,
      timetableSlots,
      careerGoals,
      careerSkills,
      careerProjects,
      careerApplications,
      careerDocuments,
      eveningReviews,
      obsidianNotes,
      graphNodes,
      graphEdges,
      settings,
    ]
  );

  const effectiveGoalId =
    focusGoalId && goals.some((g) => g.id === focusGoalId) ? focusGoalId : goals[0]?.id || '';
  const effectiveProjectId =
    focusProjectId && careerProjects.some((p) => p.id === focusProjectId)
      ? focusProjectId
      : careerProjects[0]?.id || '';

  const handleSelectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const handleHoverNode = useCallback((node: UniverseNode | null) => {
    setHoveredNode((prev) => (prev?.id === node?.id ? prev : node));
  }, []);

  const projectedGraph = useMemo(
    () =>
      filterAndProjectUniverse(rawGraph, {
        mode: prefs.activeMode,
        focusGoalId: effectiveGoalId,
        focusProjectId: effectiveProjectId,
        hiddenCategories: prefs.hiddenCategories,
        searchQuery,
        statusFilter,
        hideCompleted: !prefs.showCompleted,
        hideArchived: !prefs.showArchived,
        connectedOnly,
        selectedNodeId,
        connectionScope,
      }),
    [
      rawGraph,
      prefs.activeMode,
      effectiveGoalId,
      effectiveProjectId,
      prefs.hiddenCategories,
      searchQuery,
      statusFilter,
      prefs.showCompleted,
      prefs.showArchived,
      connectedOnly,
      selectedNodeId,
      connectionScope,
    ]
  );

  const selectedNode = useMemo(
    () => projectedGraph.nodes.find((n) => n.id === selectedNodeId) || null,
    [projectedGraph.nodes, selectedNodeId]
  );

  const handleOpenModule = useCallback(
    (node: UniverseNode) => {
      if (node.route) {
        const viewId =
          node.route === '/'
            ? 'dashboard'
            : node.route === '/notes'
            ? 'obsidian'
            : node.route.replace(/^\//, '');
        setActiveView(viewId);
      }
    },
    [setActiveView]
  );

  const toggleCategoryVisibility = (cat: UniverseCategory) => {
    const current = new Set(prefs.hiddenCategories || []);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    updateGraphPreferences({ hiddenCategories: Array.from(current) });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        return;
      } catch {
        // Fallback to expanded viewport layout
      }
    } else if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      } catch {}
    }
    setIsFullscreen((v) => !v);
  };

  return (
    <div
      ref={containerRef}
      className={`knowledge-universe-shell${isFullscreen ? ' is-fullscreen' : ''}`}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 260 : undefined,
        width: '100%',
        flex: isFullscreen ? undefined : 1,
        minHeight: isFullscreen ? undefined : 0,
        height: isFullscreen ? '100dvh' : undefined,
        background: 'var(--bg-main)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Interactive d3-force Canvas */}
      <ErrorBoundary
        compact
        title="Knowledge Universe Canvas Recovery"
        resetKey={`${prefs.activeMode}:${projectedGraph.nodes.length}`}
        onNavigateHome={() => setActiveView('dashboard')}
      >
        <UniverseCanvas
          ref={canvasRef}
          nodes={projectedGraph.nodes}
          edges={projectedGraph.edges}
          theme={settings.theme}
          preferences={prefs}
          selectedNodeId={selectedNodeId}
          searchQuery={searchQuery}
          onSelectNode={handleSelectNode}
          onOpenRecord={handleOpenModule}
          onHoverNode={handleHoverNode}
        />
      </ErrorBoundary>

      {/* TOP FLOATING STUDIO HUD */}
      <div className="universe-top-hud">
        <div className="universe-hud-row">
          <div className="universe-brand-pill">
            <Orbit size={15} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              Knowledge Universe
            </span>
            <span
              className="font-tabular"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                paddingLeft: '6px',
                borderLeft: '1px solid var(--border-default)',
              }}
            >
              {projectedGraph.stats.totalNodes} nodes · {projectedGraph.stats.totalEdges} links
            </span>
          </div>

          {/* Search Input */}
          <div className="universe-search-wrap">
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes, tags, domains..."
              aria-label="Search Knowledge Universe nodes"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn btn-ghost"
                style={{ padding: '0 4px', fontSize: '11px', height: '20px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Primary Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setEditingCustomNode(null);
                setIsAddNodeOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={13} />
              Add Node
            </button>

            <button
              type="button"
              onClick={() => {
                setConnectSourceId(selectedNodeId);
                setIsConnectOpen(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Link2 size={13} />
              Connect
            </button>

            <button
              type="button"
              onClick={() => {
                setShowFilters((v) => !v);
                setShowSettings(false);
              }}
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              aria-label="Toggle graph filters"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSettings((v) => !v);
                setShowFilters(false);
              }}
              className={`btn btn-sm ${showSettings ? 'btn-primary' : 'btn-secondary'}`}
              aria-label="Toggle graph settings"
            >
              <Settings2 size={13} />
              Settings
            </button>
          </div>
        </div>

        {/* Mode Switcher Strip */}
        <div className="universe-modes-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
            {GRAPH_MODES.map((m) => {
              const active = prefs.activeMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateGraphPreferences({ activeMode: m.id })}
                  className={`tab-pill${active ? ' active' : ''}`}
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {prefs.activeMode === 'goal' && goals.length > 0 && (
            <select
              className="select"
              value={effectiveGoalId}
              onChange={(e) => setFocusGoalId(e.target.value)}
              aria-label="Select goal for Goal Map"
              style={{ width: 'auto', maxWidth: '220px', padding: '4px 8px', fontSize: '11.5px' }}
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}

          {prefs.activeMode === 'project' && careerProjects.length > 0 && (
            <select
              className="select"
              value={effectiveProjectId}
              onChange={(e) => setFocusProjectId(e.target.value)}
              aria-label="Select project for Project Map"
              style={{ width: 'auto', maxWidth: '220px', padding: '4px 8px', fontSize: '11.5px' }}
            >
              {careerProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* FILTER POPOVER PANEL */}
      {showFilters && (
        <div className="universe-popover" role="region" aria-label="Graph Filters">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="section-eyebrow">Filter Universe</span>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Close
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label className="label">Record Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="overdue">Overdue Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!prefs.showCompleted}
                onChange={(e) => updateGraphPreferences({ showCompleted: !e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Hide completed items
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!prefs.showArchived}
                onChange={(e) => updateGraphPreferences({ showArchived: !e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Hide archived records
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={connectedOnly}
                onChange={(e) => setConnectedOnly(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Show connected nodes only
            </label>
            {selectedNode && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={connectionScope === 'direct'}
                  onChange={(e) => setConnectionScope(e.target.checked ? 'direct' : 'all')}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Show direct connections only ({selectedNode.title})
              </label>
            )}
          </div>

          <span className="section-eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
            Categories
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {UNIVERSE_CATEGORIES.map((cat) => {
              const hidden = prefs.hiddenCategories.includes(cat.id);
              const color = settings.theme === 'dark' ? cat.color : cat.lightColor;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoryVisibility(cat.id)}
                  className="btn btn-sm"
                  style={{
                    fontSize: '11px',
                    padding: '4px 9px',
                    background: hidden ? 'transparent' : `${color}1A`,
                    color: hidden ? 'var(--text-muted)' : 'var(--text-primary)',
                    border: `1px solid ${hidden ? 'var(--border-default)' : `${color}60`}`,
                    opacity: hidden ? 0.55 : 1,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: color,
                    }}
                  />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAPH SETTINGS POPOVER */}
      {showSettings && (
        <div className="universe-popover" role="region" aria-label="Graph Settings">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="section-eyebrow">Physics & Visual Settings</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                <span>Node Size</span>
                <span className="font-tabular">{prefs.nodeSizeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.1}
                value={prefs.nodeSizeScale}
                onChange={(e) => updateGraphPreferences({ nodeSizeScale: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                <span>Link Distance</span>
                <span className="font-tabular">{prefs.linkDistance}px</span>
              </div>
              <input
                type="range"
                min={45}
                max={180}
                step={5}
                value={prefs.linkDistance}
                onChange={(e) => updateGraphPreferences({ linkDistance: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                <span>Repulsion Force</span>
                <span className="font-tabular">{prefs.repulsionStrength}</span>
              </div>
              <input
                type="range"
                min={80}
                max={500}
                step={20}
                value={prefs.repulsionStrength}
                onChange={(e) => updateGraphPreferences({ repulsionStrength: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <label className="label">Label Visibility</label>
              <select
                className="select"
                value={prefs.labelVisibility}
                onChange={(e) =>
                  updateGraphPreferences({
                    labelVisibility: e.target.value as GraphPreferences['labelVisibility'],
                  })
                }
              >
                <option value="auto">Auto (Hubs, Primary & Zoom)</option>
                <option value="always">Always Show All</option>
                <option value="hover">Hover & Selected Only</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.animationsEnabled}
                onChange={(e) => updateGraphPreferences({ animationsEnabled: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Physics & Reveal Animations
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={(e) => updateGraphPreferences({ reducedMotion: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Reduced Motion Mode
            </label>

            <button
              type="button"
              onClick={() => {
                resetGraphPreferences();
                setStatusFilter('all');
                setConnectedOnly(false);
                setConnectionScope('all');
              }}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={12} />
              Reset Preferences
            </button>
          </div>
        </div>
      )}

      {/* SELECTED NODE INFORMATION PANEL */}
      {selectedNode && (
        <UniverseNodeInspector
          node={selectedNode}
          allNodes={projectedGraph.nodes}
          edges={projectedGraph.edges}
          connectionScope={connectionScope}
          onToggleConnectionScope={() =>
            setConnectionScope((prev) => (prev === 'direct' ? 'all' : 'direct'))
          }
          onClose={() => {
            setSelectedNodeId(null);
            setConnectionScope('all');
          }}
          onSelectNeighbor={(id) => setSelectedNodeId(id)}
          onOpenModule={handleOpenModule}
          onEditCustomNode={(node) => {
            const match = graphNodes.find((cn) => cn.id === node.id) || null;
            if (match) {
              setEditingCustomNode(match);
              setIsAddNodeOpen(true);
            }
          }}
          onDeleteCustomNode={async (nodeId) => {
            await deleteGraphNode(nodeId);
            setSelectedNodeId(null);
            addToast({
              type: 'info',
              title: 'Node Removed',
              message: 'Custom node and its links were removed.',
            });
          }}
          onOpenConnectModal={(sourceId) => {
            setConnectSourceId(sourceId);
            setIsConnectOpen(true);
          }}
          onDeleteEdge={async (edgeId) => {
            await deleteGraphEdge(edgeId);
            addToast({
              type: 'info',
              title: 'Connection Removed',
              message: 'Custom relationship deleted.',
            });
          }}
        />
      )}

      {/* EMPTY STATE OVERLAY WHEN NEW USER HAS NO RECORDS */}
      {!projectedGraph.hasAnyUserData && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '24px 20px 82px',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: '480px',
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', marginBottom: '10px' }}>
              <Sparkles size={18} />
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your universe starts here.
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Add your first goal, note, project, or idea to start connecting your world.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setActiveView('goals')} className="btn btn-primary btn-sm">
                <Target size={13} /> Create first goal
              </button>
              <button type="button" onClick={() => setActiveView('obsidian')} className="btn btn-secondary btn-sm">
                <FileText size={13} /> Add first note
              </button>
              <button type="button" onClick={() => setActiveView('tasks')} className="btn btn-secondary btn-sm">
                <CheckSquare size={13} /> Add first task
              </button>
              <button type="button" onClick={() => setActiveView('dashboard')} className="btn btn-ghost btn-sm">
                <Compass size={13} /> Explore LIFE OS modules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOVER MINI READOUT + CATEGORY LEGEND (BOTTOM LEFT) */}
      <div className="universe-bottom-legend">
        {hoveredNode ? (
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {hoveredNode.title}
            {hoveredNode.subtitle ? ` — ${hoveredNode.subtitle}` : ''}
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', overflow: 'hidden' }}>
            {projectedGraph.availableCategories.slice(0, 5).map((catId) => {
              const meta = UNIVERSE_CATEGORIES.find((c) => c.id === catId);
              if (!meta) return null;
              const col = settings.theme === 'dark' ? meta.color : meta.lightColor;
              return (
                <span key={catId} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col }} />
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* CAMERA & ZOOM HUD (BOTTOM RIGHT) */}
      <div className="universe-camera-hud" role="toolbar" aria-label="Graph Camera Controls">
        <button type="button" onClick={() => canvasRef.current?.zoomIn()} className="btn btn-ghost btn-icon" aria-label="Zoom in" title="Zoom in">
          <ZoomIn size={15} />
        </button>
        <button type="button" onClick={() => canvasRef.current?.zoomOut()} className="btn btn-ghost btn-icon" aria-label="Zoom out" title="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button type="button" onClick={() => canvasRef.current?.centerOnMe()} className="btn btn-ghost btn-icon" aria-label="Center on Me" title="Center on Me">
          <LocateFixed size={15} />
        </button>
        <button type="button" onClick={() => canvasRef.current?.fitToScreen()} className="btn btn-ghost btn-icon" aria-label="Fit to screen" title="Fit to screen">
          <ScanSearch size={15} />
        </button>
        <button type="button" onClick={() => canvasRef.current?.resetLayout()} className="btn btn-ghost btn-icon" aria-label="Reset view and layout" title="Reset view">
          <RotateCcw size={15} />
        </button>
        <button type="button" onClick={toggleFullscreen} className="btn btn-ghost btn-icon" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} title="Fullscreen">
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* MODALS: ADD/EDIT NODE + CONNECT NODES */}
      <CustomNodeModal
        isOpen={isAddNodeOpen}
        editingNode={editingCustomNode}
        availableNodes={rawGraph.nodes}
        onClose={() => {
          setIsAddNodeOpen(false);
          setEditingCustomNode(null);
        }}
        onSave={async (payload) => {
          const saved = await saveGraphNode(payload);
          setSelectedNodeId(saved.id);
          addToast({
            type: 'success',
            title: payload.id ? 'Node Updated' : 'Node Added to Universe',
            message: saved.title,
          });
        }}
      />

      <ConnectNodesModal
        isOpen={isConnectOpen}
        initialSourceId={connectSourceId}
        availableNodes={rawGraph.nodes}
        onClose={() => {
          setIsConnectOpen(false);
          setConnectSourceId(null);
        }}
        onConnect={async (payload) => {
          await addGraphEdge(payload);
          addToast({
            type: 'success',
            title: 'Relationship Created',
            message: 'Nodes linked in Knowledge Universe.',
          });
        }}
      />
    </div>
  );
}
