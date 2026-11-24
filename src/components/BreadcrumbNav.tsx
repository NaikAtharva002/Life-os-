import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import useStore from '../store/useStore';

export default function BreadcrumbNav() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const recentViews = useStore((s) => s.recentViews) || [];

  const viewMetadata: Record<string, { section: string; label: string }> = {
    dashboard: { section: 'Overview', label: 'Daily Command Center' },
    showcase: { section: 'Overview', label: 'Product Showcase (3-Way Showdown)' },
    focus: { section: 'Overview', label: 'Focus Mode / My Day' },
    history: { section: 'Overview', label: 'Review Archive' },
    goals: { section: 'Personal Management', label: 'Goals & Milestones' },
    tasks: { section: 'Personal Management', label: 'Tasks & Schedule' },
    habits: { section: 'Personal Management', label: 'Habits & Rituals' },
    obsidian: { section: 'Personal Management', label: 'Obsidian Notes' },
    finance: { section: 'Life Areas', label: 'Financial Velocity' },
    fitness: { section: 'Life Areas', label: 'Gym & Fitness' },
    academics: { section: 'Life Areas', label: 'Academics & Attendance' },
    career: { section: 'Life Areas', label: 'Career & Projects' },
    analytics: { section: 'Intelligence', label: 'Analytics & Trends' },
    review: { section: 'Intelligence', label: 'Evening Reflection' },
    assistant: { section: 'Intelligence', label: 'Astra AI Copilot' },
    settings: { section: 'System', label: 'Preferences & Storage' },
    'design-system': { section: 'System', label: 'Design System 2.0' },
  };

  const current = viewMetadata[activeView] || { section: 'Navigation', label: activeView };

  // Back destination (most recent view that is not current)
  const previousView = recentViews.find((v) => v !== activeView);

  return (
    <div
      className="breadcrumb-nav-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: '11.5px',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setActiveView('dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeView === 'dashboard' ? 'var(--palette-brick)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            fontWeight: 500,
          }}
          title="Return to Home Dashboard"
        >
          <Home size={12} />
          <span>Home</span>
        </button>

        <ChevronRight size={11} color="var(--border-default)" />

        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          {current.section}
        </span>

        <ChevronRight size={11} color="var(--border-default)" />

        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {current.label}
        </span>
      </div>

      {previousView && activeView !== 'dashboard' && (
        <button
          onClick={() => setActiveView(previousView)}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
          }}
          title={`Return to previous page (${previousView})`}
        >
          <ArrowLeft size={11} />
          <span>Back</span>
        </button>
      )}
    </div>
  );
}
