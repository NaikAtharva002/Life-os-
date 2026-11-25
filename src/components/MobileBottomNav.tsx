import React from 'react';
import { Sun, CheckSquare, Repeat, Target, Menu, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import { todayLocal } from '../lib/dates';

export interface MobileBottomNavProps {
  onOpenMenu: () => void;
  onQuickCreate: () => void;
}

export default function MobileBottomNav({ onOpenMenu, onQuickCreate }: MobileBottomNavProps) {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const tasks = useStore((s) => s.tasks);

  const todayStr = todayLocal();
  const overdueCount = tasks.filter(
    (t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr))
  ).length;

  const isMoreActive = !['dashboard', 'tasks', 'habits', 'goals'].includes(activeView);

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`mobile-bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          aria-label="Today"
          aria-current={activeView === 'dashboard' ? 'page' : undefined}
        >
          <div className="mobile-bottom-nav-icon-wrapper">
            <Sun size={19} strokeWidth={activeView === 'dashboard' ? 2.2 : 1.8} />
          </div>
          <span className="mobile-bottom-nav-label">Today</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('tasks')}
          className={`mobile-bottom-nav-item ${activeView === 'tasks' ? 'active' : ''}`}
          aria-label="Tasks"
          aria-current={activeView === 'tasks' ? 'page' : undefined}
        >
          <div className="mobile-bottom-nav-icon-wrapper">
            <CheckSquare size={19} strokeWidth={activeView === 'tasks' ? 2.2 : 1.8} />
            {overdueCount > 0 && (
              <span className="mobile-bottom-nav-badge">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </div>
          <span className="mobile-bottom-nav-label">Tasks</span>
        </button>

        <button
          type="button"
          onClick={onQuickCreate}
          className="mobile-bottom-nav-quick-add"
          aria-label="Quick Add"
          title="Quick Add"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => setActiveView('habits')}
          className={`mobile-bottom-nav-item ${activeView === 'habits' ? 'active' : ''}`}
          aria-label="Habits"
          aria-current={activeView === 'habits' ? 'page' : undefined}
        >
          <div className="mobile-bottom-nav-icon-wrapper">
            <Repeat size={19} strokeWidth={activeView === 'habits' ? 2.2 : 1.8} />
          </div>
          <span className="mobile-bottom-nav-label">Habits</span>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className={`mobile-bottom-nav-item ${isMoreActive ? 'active' : ''}`}
          aria-label="Student Hub and More"
        >
          <div className="mobile-bottom-nav-icon-wrapper">
            {isMoreActive ? <Target size={19} strokeWidth={2.2} /> : <Menu size={19} strokeWidth={1.8} />}
          </div>
          <span className="mobile-bottom-nav-label">Hub</span>
        </button>
      </div>
    </nav>
  );
}
