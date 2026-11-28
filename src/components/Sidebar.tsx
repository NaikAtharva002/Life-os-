import React, { useMemo, useState } from 'react';
import {
  Sun,
  Target,
  CheckSquare,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  BarChart3,
  FileText,
  Moon,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  X,
  HelpCircle,
  Palette,
  Monitor,
  Orbit,
  Sparkles,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import useStore from '../store/useStore';
import { todayLocal } from '../lib/dates';
import { BrandMark } from './BrandMark';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenShortcutsHelp?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  warning?: boolean;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenShortcutsHelp,
}: SidebarProps) {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);

  const [hubExpanded, setHubExpanded] = useState(true);
  const [cadenceExpanded, setCadenceExpanded] = useState(true);

  const todayStr = todayLocal();
  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr))
      ).length,
    [tasks, todayStr]
  );

  const todayTasksCount = useMemo(
    () => tasks.filter((t) => !t.isCompleted && t.dueDate === todayStr).length,
    [tasks, todayStr]
  );

  const criticalGoalsCount = useMemo(
    () => goals.filter((g) => !g.isArchived && g.priority === 'critical' && g.progress < 100).length,
    [goals]
  );

  const attendanceWarning = useMemo(
    () =>
      academicSubjects.some(
        (sub) =>
          sub.totalClasses > 0 &&
          (sub.attendedClasses / sub.totalClasses) * 100 < sub.targetAttendancePercentage
      ),
    [academicSubjects]
  );

  const primaryLoop: NavItem[] = [
    { id: 'dashboard', label: 'Today', icon: Sun, badge: todayTasksCount > 0 ? todayTasksCount : undefined },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: overdueCount > 0 ? overdueCount : undefined, warning: overdueCount > 0 },
    { id: 'goals', label: 'Goals', icon: Target, badge: criticalGoalsCount > 0 ? criticalGoalsCount : undefined },
    { id: 'habits', label: 'Habits', icon: Repeat },
  ];

  const studentHub: NavItem[] = [
    { id: 'academics', label: 'Academics', icon: GraduationCap, warning: attendanceWarning },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
    { id: 'obsidian', label: 'Notes', icon: FileText },
  ];

  const cadenceItems: NavItem[] = [
    { id: 'assistant', label: 'RIT Agent', icon: Sparkles },
    { id: 'universe', label: 'Knowledge Universe', icon: Orbit },
    { id: 'focus', label: 'Deep Focus', icon: Compass },
    { id: 'review', label: 'Evening Review', icon: Moon },
    { id: 'history', label: 'Review Archive', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavigate = (viewId: string) => {
    setActiveView(viewId);
    setMobileOpen(false);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item.id)}
        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span
                className="font-tabular"
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: item.warning ? 'var(--status-danger-bg)' : 'var(--bg-hover)',
                  color: item.warning ? 'var(--status-danger)' : 'var(--text-secondary)',
                }}
              >
                {item.badge}
              </span>
            )}
            {item.warning && item.badge === undefined && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--status-danger)',
                  flexShrink: 0,
                }}
                title="Attention needed (<75% attendance)"
              />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 140 }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Primary Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <BrandMark size={28} />
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    LIFE OS
                  </span>
                  <span className="badge badge-brick font-tabular" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                    3.0
                  </span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                  YOUR LIFE. ONE OS.
                </span>
              </div>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="btn btn-ghost btn-icon mobile-only"
              aria-label="Close navigation menu"
            >
              <X size={16} />
            </button>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="btn btn-ghost btn-icon desktop-only"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="sidebar-section-label">Daily Loop</div>}
          {primaryLoop.map(renderNavItem)}

          {!collapsed ? (
            <button
              type="button"
              onClick={() => setHubExpanded((p) => !p)}
              className="sidebar-section-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span>Student Hub</span>
              <ChevronDown
                size={12}
                style={{
                  transform: hubExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 160ms ease',
                }}
              />
            </button>
          ) : (
            <div style={{ height: '8px' }} />
          )}
          {(collapsed || hubExpanded) && studentHub.map(renderNavItem)}

          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCadenceExpanded((p) => !p)}
              className="sidebar-section-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span>Cadence</span>
              <ChevronDown
                size={12}
                style={{
                  transform: cadenceExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 160ms ease',
                }}
              />
            </button>
          ) : (
            <div style={{ height: '8px' }} />
          )}
          {(collapsed || cadenceExpanded) && cadenceItems.map(renderNavItem)}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="sidebar-nav-item desktop-only"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {!collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: settings.theme === 'dark' ? 'var(--bg-elevated)' : 'transparent',
                  color: settings.theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: settings.theme === 'dark' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <Moon size={12} /> Obsidian
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: settings.theme === 'light' ? 'var(--bg-surface)' : 'transparent',
                  color: settings.theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: settings.theme === 'light' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <Sun size={12} /> Paper
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {renderNavItem({ id: 'settings', label: 'Settings', icon: Settings })}
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleNavigate('design-system')}
                  className={`sidebar-nav-item ${activeView === 'design-system' ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)' }}
                >
                  <Palette size={14} />
                  <span>Design System</span>
                </button>
                {onOpenShortcutsHelp && (
                  <button
                    type="button"
                    onClick={onOpenShortcutsHelp}
                    className="btn btn-ghost btn-icon"
                    title="Keyboard shortcuts (?)"
                    aria-label="Keyboard shortcuts"
                  >
                    <HelpCircle size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {!collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              <Monitor size={12} />
              <span>Local-First · IndexedDB</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
