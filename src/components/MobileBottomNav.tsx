import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Target,
  Menu,
  Plus
} from 'lucide-react';
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
  const goals = useStore((s) => s.goals);

  const todayStr = todayLocal();
  const overdueCount = tasks.filter((t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr))).length;
  const criticalGoals = goals.filter((g) => !g.isArchived && g.priority === 'critical').length;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'habits', label: 'Habits', icon: Repeat },
    { id: 'goals', label: 'Goals', icon: Target, badge: criticalGoals > 0 ? criticalGoals : undefined },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mobile-bottom-nav-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                {item.badge !== undefined && (
                  <span className="mobile-bottom-nav-badge">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </button>
          );
        })}

        {/* Quick Add Action Button */}
        <button
          onClick={onQuickCreate}
          className="mobile-bottom-nav-quick-add"
          aria-label="Quick Create Task"
          title="Create New Task"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

        {/* More / Full Menu Drawer Trigger */}
        <button
          onClick={onOpenMenu}
          className={`mobile-bottom-nav-item ${
            !['dashboard', 'tasks', 'habits', 'goals'].includes(activeView) ? 'active' : ''
          }`}
          aria-label="More Navigation"
        >
          <div className="mobile-bottom-nav-icon-wrapper">
            <Menu size={20} strokeWidth={1.8} />
          </div>
          <span className="mobile-bottom-nav-label">More</span>
        </button>
      </div>
    </nav>
  );
}
