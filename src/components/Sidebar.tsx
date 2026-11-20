import React from 'react';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  BarChart3,
  Sparkles,
  FileText,
  Moon,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import useStore from '../store/useStore';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: string;
  warning?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const settings = useStore((s) => s.settings);

  // Counts for badges
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter((t) => !t.isCompleted && (t.isOverdue || (t.dueDate && t.dueDate < todayStr))).length;
  const criticalGoalsCount = goals.filter((g) => !g.isArchived && g.priority === 'critical').length;

  // Attendance danger check (<75%)
  const attendanceWarning = academicSubjects.some(
    (sub) => sub.totalClasses > 0 && (sub.attendedClasses / sub.totalClasses) * 100 < sub.targetAttendancePercentage
  );

  const navSections: NavSection[] = [
    {
      title: 'CORE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'goals',
          label: 'Goals',
          icon: Target,
          badge: criticalGoalsCount > 0 ? criticalGoalsCount : undefined,
          badgeColor: 'var(--priority-critical)',
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: CheckSquare,
          badge: overdueCount > 0 ? overdueCount : undefined,
          badgeColor: 'var(--danger)',
        },
        { id: 'habits', label: 'Habits', icon: Repeat },
      ],
    },
    {
      title: 'DOMAINS',
      items: [
        { id: 'finance', label: 'Finances', icon: DollarSign },
        { id: 'fitness', label: 'Gym & Fitness', icon: Dumbbell },
        {
          id: 'academics',
          label: 'Academics',
          icon: GraduationCap,
          warning: attendanceWarning,
        },
        { id: 'career', label: 'Career & Work', icon: Briefcase },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'assistant', label: 'AI Copilot', icon: Sparkles },
        { id: 'obsidian', label: 'Obsidian Notes', icon: FileText },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'review', label: 'Evening Review', icon: Moon },
        { id: 'history', label: 'Review Archive', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavigate = (viewId: string) => {
    setActiveView(viewId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? '64px' : '240px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          transition: 'width 0.15s ease',
        }}
      >
        {/* Brand Header — Editorial Monochrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '16px 0' : '16px 14px',
            borderBottom: '1px solid var(--border)',
            height: '56px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={() => handleNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              cursor: 'pointer',
            }}
          >
            {/* Crisp minimalist mark */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}
            >
              Ω
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  LIFE OS
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                  Workspace
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-ghost"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {/* Expand toggle when collapsed */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setCollapsed(false)}
              className="btn btn-ghost"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              title="Expand sidebar"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Nav Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '10px 4px' : '12px 8px' }}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '14px' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    padding: '2px 8px 6px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        width: '100%',
                        padding: collapsed ? '8px 0' : '7px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease, color 0.1s ease',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={16} strokeWidth={isActive ? 2 : 1.6} color={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.warning && (
                            <span title="Attendance alert">
                              <AlertCircle size={13} color="var(--warning)" />
                            </span>
                          )}
                          {item.badge !== undefined && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-xs)',
                                background: item.badgeColor || 'var(--bg-active)',
                                color: '#ffffff',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Profile */}
        <div
          style={{
            padding: collapsed ? '10px 0' : '10px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '8px',
            background: 'var(--bg-secondary)',
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {settings.userName}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {!collapsed && <ThemeToggle />}
        </div>
      </aside>
    </>
  );
}
