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
import TaskModal from './components/TaskModal';
import GoalModal from './components/GoalModal';
import { scheduleEveningReminder, showNotification } from './utils/notifications';
import { Menu, Moon, Command, Plus, Search, Sparkles } from 'lucide-react';

export default function App() {
  const isLoaded = useStore((s) => s.isLoaded);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const settings = useStore((s) => s.settings);
  const markOverdueTasks = useStore((s) => s.markOverdueTasks);
  const initializeFromDB = useStore((s) => s.initializeFromDB);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command palette & quick creation state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [quickGoalModalOpen, setQuickGoalModalOpen] = useState(false);

  // 1. Initialize IndexedDB database on startup
  useEffect(() => {
    initializeFromDB();
  }, [initializeFromDB]);

  // 2. Set dark/light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

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
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main
        className="main-content"
        style={{
          marginLeft: sidebarCollapsed ? '70px' : '260px',
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        {/* Top Header / Command Palette Trigger */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 28px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Mobile Menu Toggle & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-ghost btn-icon mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none' }}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 14px',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <Search size={14} />
              <span>Search or type command...</span>
              <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                ⌘K
              </kbd>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setQuickTaskModalOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Task
            </button>
            <button
              onClick={() => setQuickGoalModalOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Goal
            </button>
            <button
              onClick={() => setActiveView('assistant')}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} /> Astra AI
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div style={{ flex: 1, width: '100%' }}>
          {renderActiveView()}
        </div>
      </main>

      {/* QUICK COMMAND PALETTE MODAL (CMD+K) */}
      {commandPaletteOpen && (
        <div className="modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '500px', padding: '16px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                autoFocus
                placeholder="Where to? (Dashboard, Finance, Fitness, Academics, Career...)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
              <kbd style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ESC to close</kbd>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { label: '📊 Command Dashboard', view: 'dashboard' },
                { label: '🎯 Goals & Objectives', view: 'goals' },
                { label: '✅ Tasks & Kanban Board', view: 'tasks' },
                { label: '🔥 Habit Tracker & Heatmap', view: 'habits' },
                { label: '💰 Personal Finances & Budgets', view: 'finance' },
                { label: '🏋️ Gym & Fitness Conditioning', view: 'fitness' },
                { label: '🎓 Academics & Courses', view: 'academics' },
                { label: '💼 Career & Projects', view: 'career' },
                { label: '📈 Analytics & Intelligence', view: 'analytics' },
                { label: '🤖 Astra AI Personal Assistant', view: 'assistant' },
                { label: '📝 Obsidian Markdown Vault', view: 'obsidian' },
                { label: '🌙 Evening Review Wizard', view: 'review' },
                { label: '⚙️ Settings & IndexedDB Backup', view: 'settings' },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    setActiveView(item.view);
                    setCommandPaletteOpen(false);
                  }}
                  className="btn btn-ghost"
                  style={{
                    justifyContent: 'flex-start',
                    padding: '8px 12px',
                    fontSize: '13.5px',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICK TASK MODAL */}
      {quickTaskModalOpen && (
        <TaskModal
          isOpen={quickTaskModalOpen}
          onClose={() => setQuickTaskModalOpen(false)}
        />
      )}

      {/* QUICK GOAL MODAL */}
      {quickGoalModalOpen && (
        <GoalModal
          isOpen={quickGoalModalOpen}
          onClose={() => setQuickGoalModalOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
