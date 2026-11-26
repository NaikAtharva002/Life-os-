import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, Search, HelpCircle } from 'lucide-react';
import useStore from './store/useStore';
import { pathToViewMeta, viewIdToPath } from './lib/routes';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalCommandPalette from './components/GlobalCommandPalette';
import QuickActionModal from './components/QuickActionModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import OnboardingModal from './components/OnboardingModal';
import DatabaseRecoveryScreen from './components/DatabaseRecoveryScreen';
import ThemeToggle from './components/ThemeToggle';
import TaskModal from './components/TaskModal';
import GoalModal from './components/GoalModal';
import HabitModal from './components/HabitModal';
import ClassModal from './components/ClassModal';
import { Skeleton, ToastContainer } from './components/ui';
import { scheduleEveningReminder, showNotification } from './utils/notifications';

// Primary daily loop views loaded eagerly for zero-flash navigation
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import GoalsPage from './pages/GoalsPage';
import HabitsPage from './pages/HabitsPage';
import AcademicsPage from './pages/AcademicsPage';
import SettingsPage from './pages/SettingsPage';

// Secondary & specialized views lazy-loaded via React Router v7 code splitting
const FinancePage = React.lazy(() => import('./pages/FinancePage'));
const FitnessPage = React.lazy(() => import('./pages/FitnessPage'));
const CareerPage = React.lazy(() => import('./pages/CareerPage'));
const ObsidianPage = React.lazy(() => import('./pages/ObsidianPage'));
const EveningReviewPage = React.lazy(() => import('./pages/EveningReviewPage'));
const ReviewHistoryPage = React.lazy(() => import('./pages/ReviewHistoryPage'));
const FocusModePage = React.lazy(() => import('./pages/FocusModePage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const KnowledgeUniversePage = React.lazy(() => import('./pages/KnowledgeUniversePage'));
const AssistantPage = React.lazy(() => import('./pages/AssistantPage'));
const DesignSystemPage = React.lazy(() => import('./pages/DesignSystemPage'));

function PageSkeletonFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
      <Skeleton height="72px" borderRadius="12px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Skeleton height="110px" borderRadius="12px" />
        <Skeleton height="110px" borderRadius="12px" />
        <Skeleton height="110px" borderRadius="12px" />
      </div>
      <Skeleton height="260px" borderRadius="16px" />
    </div>
  );
}

export default function App() {
  const initError = useStore((s) => s.initError);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const settings = useStore((s) => s.settings);
  const markOverdueTasks = useStore((s) => s.markOverdueTasks);
  const initializeFromDB = useStore((s) => s.initializeFromDB);

  const location = useLocation();
  const navigate = useNavigate();
  const lastSyncedPathRef = useRef<string>(location.pathname);

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
    } catch {
      // ignore
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [quickGoalModalOpen, setQuickGoalModalOpen] = useState(false);
  const [quickHabitModalOpen, setQuickHabitModalOpen] = useState(false);
  const [quickClassModalOpen, setQuickClassModalOpen] = useState(false);

  // 1. Initialize IndexedDB database on startup
  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  // 2. Apply Dark ("Obsidian Studio") / Light ("Paper & Ink") theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }, [settings.theme]);

  // 3. Synchronize URL -> Store activeView (deep links & browser Back/Forward)
  useEffect(() => {
    if (location.pathname !== lastSyncedPathRef.current) {
      lastSyncedPathRef.current = location.pathname;
      const meta = pathToViewMeta(location.pathname);
      if (meta.id !== activeView) {
        setActiveView(meta.id);
      }
    }
  }, [location.pathname, activeView, setActiveView]);

  // 4. Synchronize Store activeView -> URL
  useEffect(() => {
    const targetPath = viewIdToPath(activeView);
    if (targetPath !== location.pathname) {
      lastSyncedPathRef.current = targetPath;
      navigate(targetPath);
    }
  }, [activeView, location.pathname, navigate]);

  // Ensure initial deep link route is respected on first mount
  useEffect(() => {
    const meta = pathToViewMeta(location.pathname);
    if (meta.id !== 'dashboard' && activeView === 'dashboard') {
      setActiveView(meta.id);
    }
  }, []);

  // 5. Hourly overdue check
  useEffect(() => {
    markOverdueTasks();
    const interval = setInterval(markOverdueTasks, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [markOverdueTasks]);

  // 6. Evening review notification scheduler
  useEffect(() => {
    if (!settings.reminder?.enabled || !settings.reminder?.time) return;

    const cleanup = scheduleEveningReminder(settings.reminder.time, () => {
      showNotification(
        'Evening Review Time',
        'Reflect on your wins and plan tomorrow’s top 3 actions.',
        () => setActiveView('review')
      );
    });

    return cleanup;
  }, [settings.reminder?.enabled, settings.reminder?.time, setActiveView]);

  // 7. Global Keyboard Shortcuts
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

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuickActionModalOpen(false);
        setShortcutsHelpOpen(false);
        setQuickTaskModalOpen(false);
        setQuickGoalModalOpen(false);
        setQuickHabitModalOpen(false);
        setQuickClassModalOpen(false);
        return;
      }

      if ((e.altKey && e.key.toLowerCase() === 'n') || (e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setQuickActionModalOpen((prev) => !prev);
        return;
      }

      if (isInputActive) return;

      if (e.key === '/') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
        return;
      }

      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickTaskModalOpen(true);
        return;
      }

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
          u: 'universe',
          r: 'review',
          s: 'settings',
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

  if (initError) {
    return (
      <>
        <DatabaseRecoveryScreen />
        <ToastContainer />
      </>
    );
  }

  const currentMeta = pathToViewMeta(location.pathname);
  const isFullCanvas = currentMeta.id === 'universe';

  return (
    <div className="app">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleSetSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenShortcutsHelp={() => setShortcutsHelpOpen(true)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isFullCanvas ? 'main-content-full' : ''}`}>
        {settings.isDemoMode && (
          <div className="demo-mode-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-warning">DEMO MODE</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Previewing sample scenario data. Your personal data stays isolated.
              </span>
            </div>
            <button
              type="button"
              onClick={() => useStore.getState().toggleDemoMode(false)}
              className="btn btn-secondary btn-sm"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Single Unified Topbar */}
        <header className="global-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <button
              type="button"
              className="btn btn-ghost btn-icon mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.015em',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentMeta.title}
              </span>
              <span
                className="desktop-only"
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  borderLeft: '1px solid var(--border-default)',
                  paddingLeft: '8px',
                }}
              >
                {currentMeta.section}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="toolbar-search-btn"
              aria-label="Search and command palette"
            >
              <Search size={13} style={{ flexShrink: 0 }} />
              <span className="toolbar-search-text">Jump or search...</span>
              <kbd className="desktop-only toolbar-search-kbd">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => setQuickActionModalOpen(true)}
              className="btn btn-primary btn-sm"
              title="Quick Create (Alt+N)"
            >
              <Plus size={14} />
              <span className="desktop-only">Quick Add</span>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setShortcutsHelpOpen(true)}
              className="btn btn-ghost btn-icon desktop-only"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </header>

        <div className={`workspace-content ${isFullCanvas ? 'workspace-content-full' : ''}`}>
          <Suspense fallback={<PageSkeletonFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/today" element={<Navigate to="/" replace />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/fitness" element={<FitnessPage />} />
              <Route path="/career" element={<CareerPage />} />
              <Route path="/notes" element={<ObsidianPage />} />
              <Route path="/focus" element={<FocusModePage />} />
              <Route path="/review" element={<EveningReviewPage />} />
              <Route path="/history" element={<ReviewHistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/universe" element={<KnowledgeUniversePage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/design-system" element={<DesignSystemPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>

        <MobileBottomNav
          onOpenMenu={() => setMobileMenuOpen(true)}
          onQuickCreate={() => setQuickActionModalOpen(true)}
        />
      </main>

      {quickTaskModalOpen && (
        <TaskModal onClose={() => setQuickTaskModalOpen(false)} />
      )}

      {quickGoalModalOpen && (
        <GoalModal
          isOpen={quickGoalModalOpen}
          onClose={() => setQuickGoalModalOpen(false)}
        />
      )}

      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenQuickTask={() => setQuickTaskModalOpen(true)}
        onOpenQuickGoal={() => setQuickGoalModalOpen(true)}
      />

      <QuickActionModal
        isOpen={quickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        onOpenNewTask={() => setQuickTaskModalOpen(true)}
        onOpenNewGoal={() => setQuickGoalModalOpen(true)}
        onOpenNewHabit={() => setQuickHabitModalOpen(true)}
        onOpenNewClass={() => setQuickClassModalOpen(true)}
      />

      {quickHabitModalOpen && (
        <HabitModal onClose={() => setQuickHabitModalOpen(false)} />
      )}

      {quickClassModalOpen && (
        <ClassModal
          isOpen={quickClassModalOpen}
          onClose={() => setQuickClassModalOpen(false)}
        />
      )}

      <KeyboardShortcutsModal
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />

      <OnboardingModal />
      <ToastContainer />
    </div>
  );
}
