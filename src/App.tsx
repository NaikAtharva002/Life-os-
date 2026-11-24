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
import DesignSystemPage from './pages/DesignSystemPage';
import ProductShowcasePage from './pages/ProductShowcasePage';
import TaskModal from './components/TaskModal';
import GoalModal from './components/GoalModal';
import HabitModal from './components/HabitModal';
import ClassModal from './components/ClassModal';
import { scheduleEveningReminder, showNotification } from './utils/notifications';
import { Menu, Plus, Search, Sparkles, Terminal, Zap, HelpCircle } from 'lucide-react';
import { aiEngine, type AIEngineStatus } from './services/aiEngineClient';
import VariantHeaderBanner from './components/VariantHeaderBanner';
import ComparisonDrawer from './components/ComparisonDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalCommandPalette from './components/GlobalCommandPalette';
import QuickActionModal from './components/QuickActionModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import BreadcrumbNav from './components/BreadcrumbNav';
import OnboardingModal from './components/OnboardingModal';
import { ToastContainer } from './components/ui';

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

  // Persistent sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lifeos_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    try {
      localStorage.setItem('lifeos_sidebar_collapsed', String(collapsed));
    } catch {}
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command palette & quick creation modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [quickGoalModalOpen, setQuickGoalModalOpen] = useState(false);
  const [quickHabitModalOpen, setQuickHabitModalOpen] = useState(false);
  const [quickClassModalOpen, setQuickClassModalOpen] = useState(false);
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

  // 5. Global Keyboard Shortcuts (Cmd+K, /, ?, N, Escape, G+Key)
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      // 1. Command Palette: Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 2. Escape: Close open modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuickActionModalOpen(false);
        setShortcutsHelpOpen(false);
        setQuickTaskModalOpen(false);
        setQuickGoalModalOpen(false);
        setQuickHabitModalOpen(false);
        setQuickClassModalOpen(false);
        setComparisonMatrixOpen(false);
        return;
      }

      // Universal Quick Create shortcut: Alt+N or Shift+A
      if ((e.altKey && e.key.toLowerCase() === 'n') || (e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setQuickActionModalOpen((prev) => !prev);
        return;
      }

      // Don't intercept single key shortcuts if user is typing in form fields
      if (isInputActive) return;

      // 3. Slash /: Focus Search / Command Palette
      if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // 4. Question Mark ?: Open Keyboard Shortcuts Guide
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
        return;
      }

      // 5. N: Quick Task
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickTaskModalOpen(true);
        return;
      }

      // 6. Two-key chord (G then key for navigation)
      const now = Date.now();
      if (e.key.toLowerCase() === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        lastKey = '';
        const jumpMap: Record<string, string> = {
          d: 'dashboard',
          t: 'tasks',
          g: 'goals',
          h: 'habits',
          f: 'finance',
          w: 'fitness',
          a: 'academics',
          c: 'career',
          n: 'obsidian',
          r: 'review',
          s: 'settings',
          p: 'showcase',
        };
        const targetView = jumpMap[e.key.toLowerCase()];
        if (targetView) {
          e.preventDefault();
          setActiveView(targetView);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

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
      case 'design-system':
        return <DesignSystemPage />;
      case 'showcase':
        return <ProductShowcasePage onOpenMatrix={() => setComparisonMatrixOpen(true)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* Sidebar Navigation (Section 2.A) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleSetSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenShortcutsHelp={() => setShortcutsHelpOpen(true)}
      />

      {/* Main Workspace Area (Section 2.B & 2.C) */}
      <main className="main-content">
        {/* Variant Comparison & Direct Port Switcher Strip */}
        <VariantHeaderBanner
          currentVariant="agent"
          onOpenMatrix={() => setComparisonMatrixOpen(true)}
        />

        {/* Optional Demo Mode Status Banner */}
        {settings.isDemoMode && (
          <div
            style={{
              background: 'var(--palette-walnut-subtle, rgba(107, 43, 6, 0.2))',
              borderBottom: '1px solid var(--palette-walnut)',
              color: 'var(--text-primary)',
              padding: '6px 20px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 99,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--palette-brick)' }}>DEMO MODE:</span>
              <span>Exploring with sample scenario records. Your real workspace is untouched.</span>
            </div>
            <button
              onClick={() => useStore.getState().toggleDemoMode(false)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              Exit Demo Mode
            </button>
          </div>
        )}

        {/* Global Top Toolbar (Single consistent toolbar across all pages) */}
        <header className="global-toolbar">
          {/* Left: Mobile menu toggle + Search Command Palette trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <button
              className="btn btn-ghost btn-sm mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="toolbar-search-btn"
              aria-label="Search and command palette"
            >
              <Search size={13} style={{ flexShrink: 0 }} />
              <span className="toolbar-search-text">Search records, actions, or jump...</span>
              <kbd className="desktop-only toolbar-search-kbd">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Architecture Engine Status + Quick Actions + Help + AI Assistant */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Ambient Multi-Engine Badge */}
            <div
              className="desktop-only"
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

            {/* Universal Quick Create Launcher Button */}
            <button
              onClick={() => setQuickActionModalOpen(true)}
              className="btn btn-primary btn-sm"
              title="Universal Quick Create (Alt+N)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontWeight: 600,
              }}
            >
              <Plus size={14} />
              <span>Create</span>
            </button>

            <button
              onClick={() => setQuickTaskModalOpen(true)}
              className="btn btn-secondary btn-sm desktop-only"
              title="Create new task (N)"
            >
              <Plus size={13} /> New Task
            </button>
            <button
              onClick={() => setQuickGoalModalOpen(true)}
              className="btn btn-secondary btn-sm desktop-only"
              title="Create new goal"
            >
              <Plus size={13} /> New Goal
            </button>

            {/* Keyboard Shortcuts Help Button */}
            <button
              onClick={() => setShortcutsHelpOpen(true)}
              className="btn btn-ghost btn-sm desktop-only"
              style={{ padding: '6px', color: 'var(--text-muted)' }}
              title="Keyboard Shortcuts Guide (?)"
              aria-label="Keyboard Shortcuts Guide"
            >
              <HelpCircle size={15} />
            </button>

            <button
              onClick={() => setActiveView('assistant')}
              className="btn btn-primary btn-sm"
              title="Open Astra AI Assistant"
            >
              <Sparkles size={13} /> <span className="desktop-only">AI Assistant</span>
            </button>
          </div>
        </header>

        {/* BREADCRUMB CONTEXTUAL NAVIGATION STRIP */}
        <BreadcrumbNav />

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

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <MobileBottomNav
          onOpenMenu={() => setMobileMenuOpen(true)}
          onQuickCreate={() => setQuickActionModalOpen(true)}
        />
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

      {/* GLOBAL COMMAND PALETTE 2.0 (⌘K / Ctrl+K / /) */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenQuickTask={() => setQuickTaskModalOpen(true)}
        onOpenQuickGoal={() => setQuickGoalModalOpen(true)}
      />

      {/* QUICK ACTION LAUNCHER MODAL */}
      <QuickActionModal
        isOpen={quickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        onOpenNewTask={() => setQuickTaskModalOpen(true)}
        onOpenNewGoal={() => setQuickGoalModalOpen(true)}
        onOpenNewHabit={() => setQuickHabitModalOpen(true)}
        onOpenNewClass={() => setQuickClassModalOpen(true)}
      />

      {quickHabitModalOpen && (
        <HabitModal
          onClose={() => setQuickHabitModalOpen(false)}
        />
      )}

      {quickClassModalOpen && (
        <ClassModal
          isOpen={quickClassModalOpen}
          onClose={() => setQuickClassModalOpen(false)}
        />
      )}

      {/* KEYBOARD SHORTCUTS GUIDE MODAL (?) */}
      <KeyboardShortcutsModal
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />

      {/* INTERACTIVE COMPARISON MATRIX DRAWER */}
      <ComparisonDrawer
        currentVariant={designVariant}
        isOpen={comparisonMatrixOpen}
        onClose={() => setComparisonMatrixOpen(false)}
      />

      {/* FIRST-TIME GUIDED ONBOARDING WIZARD 2.0 */}
      <OnboardingModal />

      {/* GLOBAL TOAST NOTIFICATION PORTAL */}
      <ToastContainer />
    </div>
  );
}
