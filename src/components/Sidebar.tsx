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
  highlight?: boolean;
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
      title: 'LIFE DOMAINS',
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
      title: 'INTELLIGENCE & VAULT',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'assistant', label: 'AI Copilot', icon: Sparkles, highlight: true },
        { id: 'obsidian', label: 'Obsidian Notes', icon: FileText },
      ],
    },
    {
      title: 'REFLECTION',
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
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? '70px' : '260px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '18px 0' : '18px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            onClick={() => handleNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c5cfc, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(124, 92, 252, 0.3)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Ω</span>
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  LIFE OS
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Command Center
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-ghost"
              style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-secondary)' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button
              onClick={() => setCollapsed(false)}
              className="btn btn-ghost"
              style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-secondary)' }}
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Nav Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 6px' : '12px 10px' }}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '14px' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    padding: '4px 10px 6px 10px',
                  }}
                >
                  {section.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                        padding: collapsed ? '10px 0' : '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? 'var(--bg-hover)'
                          : item.highlight
                          ? 'rgba(124, 92, 252, 0.08)'
                          : 'transparent',
                        color: isActive
                          ? 'var(--accent)'
                          : item.highlight
                          ? 'var(--accent)'
                          : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = item.highlight
                            ? 'rgba(124, 92, 252, 0.08)'
                            : 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} color={isActive ? 'var(--accent)' : 'currentColor'} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.warning && (
                            <span title="Attendance alert">
                              <AlertCircle size={14} color="var(--warning)" />
                            </span>
                          )}
                          {item.badge !== undefined && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                background: item.badgeColor || 'var(--accent)',
                                color: '#fff',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                minWidth: '18px',
                                textAlign: 'center',
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

        {/* User Profile & Theme Footer */}
        <div
          style={{
            padding: collapsed ? '12px 6px' : '14px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            background: 'var(--bg-secondary)',
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--border)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                {settings.userName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {settings.userName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                  Local-first
                </div>
              </div>
            </div>
          ) : null}

          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
