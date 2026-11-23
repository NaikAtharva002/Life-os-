import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GoalsPage from './pages/GoalsPage';
import TasksPage from './pages/TasksPage';
import HabitsPage from './pages/HabitsPage';
import FinancePage from './pages/FinancePage';
import FitnessPage from './pages/FitnessPage';
import AcademicsPage from './pages/AcademicsPage';
import CareerPage from './pages/CareerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssistantPage from './pages/AssistantPage';
import ObsidianPage from './pages/ObsidianPage';
import EveningReviewPage from './pages/EveningReviewPage';
import ReviewHistoryPage from './pages/ReviewHistoryPage';
import SettingsPage from './pages/SettingsPage';
import FocusModePage from './pages/FocusModePage';
import TaskModal from './components/TaskModal';
import GoalModal from './components/GoalModal';
import { scheduleEveningReminder, showNotification } from './utils/notifications';
import { Menu, Plus, Search, Sparkles, Terminal } from 'lucide-react';
import { aiEngine, type AIEngineStatus } from './services/aiEngineClient';
import VariantHeaderBanner from './components/VariantHeaderBanner';
import ComparisonDrawer from './components/ComparisonDrawer';

export default function App() {
  const isLoaded = useStore((s) => s.isLoaded);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const settings = useStore((s) => s.settings);
  const markOverdueTasks = useStore((s) => s.markOverdueTasks);
  const initializeFromDB = useStore((s) => s.initializeFromDB);
  const designVariant = useStore((s) => s.designVariant);
  const setDesignVariant = useStore((s) => s.setDesignVariant);
  const comparisonMode = useStore((s) => s.comparisonMode);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command palette & quick creation modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [quickGoalModalOpen, setQuickGoalModalOpen] = useState(false);
  const [comparisonMatrixOpen, setComparisonMatrixOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState<AIEngineStatus>({ isAvailable: false });

  // 1. Initialize IndexedDB database on startup
  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  // Check Python AI Engine status
  useEffect(() => {
    const check = async () => {
      const s = await aiEngine.checkHealth();
      setEngineStatus(s);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Set dark/light theme & design variant
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-variant', designVariant);
  }, [designVariant]);

  // 3. Hourly overdue task check
  useEffect(() => {
    markOverdueTasks();
    const interval = setInterval(markOverdueTasks, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [markOverdueTasks]);

  // 4. Evening review notification scheduler
  useEffect(() => {
    if (!settings.reminder?.enabled || !settings.reminder?.time) return;

    const cleanup = scheduleEveningReminder(settings.reminder.time, () => {
      showNotification(
        '🌙 LIFE OS: Evening Review Time',
        'Time to complete your evening review, celebrate today’s wins, and set tomorrow’s top 3 priorities.',
        () => {
          setActiveView('review');
        }
      );
    });

    return cleanup;
  }, [settings.reminder?.enabled, settings.reminder?.time, setActiveView]);

  // 5. Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'goals':
        return <GoalsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'habits':
        return <HabitsPage />;
      case 'finance':
        return <FinancePage />;
      case 'fitness':
        return <FitnessPage />;
      case 'academics':
        return <AcademicsPage />;
      case 'career':
        return <CareerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'focus':
        return <FocusModePage />;
      case 'obsidian':
        return <ObsidianPage />;
      case 'review':
        return <EveningReviewPage />;
      case 'history':
        return <ReviewHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* Sidebar Navigation (Section 2.A) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Area (Section 2.B & 2.C) */}
      <main className="main-content">
        {/* Variant Comparison & Direct Port Switcher Strip */}
        <VariantHeaderBanner
          currentVariant="agent"
          onOpenMatrix={() => setComparisonMatrixOpen(true)}
        />

        {/* Global Top Toolbar (Single consistent toolbar across all pages) */}
        <header className="global-toolbar">
          {/* Left: Mobile menu toggle + Search Command Palette trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-ghost btn-sm mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none' }}
              aria-label="Open navigation menu"
            >
              <Menu size={16} />
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-small)',
                padding: '4px 10px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '220px',
                transition: 'border-color 0.12s ease',
              }}
              aria-label="Search and command palette"
            >
              <Search size={13} />
              <span style={{ flex: 1, textAlign: 'left' }}>Search or type command...</span>
              <kbd
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Architecture Engine Status + New Task, New Goal, AI Assistant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Ambient Multi-Engine Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}
              title={
                engineStatus.isAvailable
                  ? `Python AI Engine v${engineStatus.version} active on port 8000 (FastAPI + SQLite)`
                  : 'Running in Local-First IndexedDB Mode (Python Engine Offline)'
              }
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: engineStatus.isAvailable ? 'var(--status-success)' : 'var(--text-muted)',
                }}
              />
              <span style={{ fontWeight: 500 }}>
                {engineStatus.isAvailable ? 'Python Engine' : 'Local Heuristic'}
              </span>
            </div>

            <button
              onClick={() => setQuickTaskModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Create new task"
            >
              <Plus size={13} /> New Task
            </button>
            <button
              onClick={() => setQuickGoalModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Create new goal"
            >
              <Plus size={13} /> New Goal
            </button>
            <button
              onClick={() => setActiveView('assistant')}
              className="btn btn-primary btn-sm"
              title="Open Astra AI Assistant"
            >
              <Sparkles size={13} /> AI Assistant
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        {comparisonMode === 'split' ? (
          <div className="showdown-split-container">
            {/* Column 1: Antigravity Strategic */}
            <div className="showdown-column" data-variant="agent">
              <div className="showdown-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>🏛️</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      1. Antigravity Editorial
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Strategic · Question-Driven Architecture
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDesignVariant('agent')}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '10.5px', padding: '3px 8px' }}
                >
                  {designVariant === 'agent' ? '✓ Active' : 'Select'}
                </button>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', padding: '12px' }}>
                {renderActiveView()}
              </div>
            </div>

            {/* Column 2: Taste-Skill Craft */}
            <div className="showdown-column" data-variant="taste">
              <div className="showdown-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>✨</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      2. Taste-Skill Craft
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Tactile Luminescence · Luxury Space
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDesignVariant('taste')}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '10.5px', padding: '3px 8px' }}
                >
                  {designVariant === 'taste' ? '✓ Active' : 'Select'}
                </button>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', padding: '12px' }}>
                {renderActiveView()}
              </div>
            </div>

            {/* Column 3: Impeccable Precision */}
            <div className="showdown-column" data-variant="impeccable">
              <div className="showdown-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>📐</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      3. Impeccable Precision
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Rigid 8px Swiss Grid · Radius Harmony
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDesignVariant('impeccable')}
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '10.5px', padding: '3px 8px' }}
                >
                  {designVariant === 'impeccable' ? '✓ Active' : 'Select'}
                </button>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', padding: '12px' }}>
                {renderActiveView()}
              </div>
            </div>
          </div>
        ) : (
          <div className="workspace-content" data-variant={designVariant}>
            {renderActiveView()}
          </div>
        )}
      </main>

      {/* GLOBAL MODALS */}
      {quickTaskModalOpen && (
        <TaskModal
          onClose={() => setQuickTaskModalOpen(false)}
        />
      )}

      {quickGoalModalOpen && (
        <GoalModal
          isOpen={quickGoalModalOpen}
          onClose={() => setQuickGoalModalOpen(false)}
        />
      )}

      {/* COMMAND PALETTE (⌘K / Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '480px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                autoFocus
                placeholder="Search views, modules, or actions..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCommandPaletteOpen(false);
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESC</span>
            </div>

            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '300px', overflowY: 'auto' }}>
              {[
                { id: 'dashboard', label: 'Go to Dashboard', shortcut: 'G D' },
                { id: 'tasks', label: 'Go to Task Management', shortcut: 'G T' },
                { id: 'goals', label: 'Go to Goal Management', shortcut: 'G G' },
                { id: 'habits', label: 'Go to Habit Tracker', shortcut: 'G H' },
                { id: 'finance', label: 'Go to Finance Command', shortcut: 'G F' },
                { id: 'academics', label: 'Go to Academics & Attendance', shortcut: 'G A' },
                { id: 'fitness', label: 'Go to Gym & Fitness', shortcut: 'G W' },
                { id: 'career', label: 'Go to Career Roadmap', shortcut: 'G C' },
                { id: 'assistant', label: 'Ask Astra AI Copilot', shortcut: 'G I' },
                { id: 'review', label: 'Start Evening Review', shortcut: 'G R' },
                { id: 'settings', label: 'Open Settings', shortcut: 'G S' },
              ].map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    setActiveView(cmd.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="btn btn-ghost"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-small)',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span>{cmd.label}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {cmd.shortcut}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE COMPARISON MATRIX DRAWER */}
      <ComparisonDrawer
        currentVariant={designVariant}
        isOpen={comparisonMatrixOpen}
        onClose={() => setComparisonMatrixOpen(false)}
      />
    </div>
  );
}
