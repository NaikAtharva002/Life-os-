import React, { useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  CheckSquare,
  Target,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  FileText,
  Compass,
  Moon,
  History,
  Settings,
  Plus,
  Sun,
  BarChart3,
  Download,
  Palette,
  Orbit,
  Sparkles,
  Heart,
  X,
} from 'lucide-react';
import useStore from '../store/useStore';
import { LifeOSRepository } from '../db/repository';
import { todayLocal } from '../lib/dates';
import { LiquidGlassSurface } from './LiquidGlassSurface';

export interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickTask: () => void;
  onOpenQuickGoal: () => void;
}

export default function GlobalCommandPalette({
  isOpen,
  onClose,
  onOpenQuickTask,
  onOpenQuickGoal,
}: GlobalCommandPaletteProps) {
  const [search, setSearch] = useState('');

  const setActiveView = useStore((s) => s.setActiveView);
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const habits = useStore((s) => s.habits);
  const notes = useStore((s) => s.obsidianNotes);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const academicAssignments = useStore((s) => s.academicAssignments);
  const careerProjects = useStore((s) => s.careerProjects);
  const lifestyleItems = useStore((s) => s.lifestyleItems);
  const addToast = useStore((s) => s.addToast);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const isDemoMode = Boolean(settings.isDemoMode);
  const visible = <T extends { isDemo?: boolean; deletedAt?: string | null }>(list: T[]) =>
    list.filter((item) => !item.deletedAt && (isDemoMode || item.isDemo !== true));

  const activeTasks = useMemo(
    () => visible(tasks).filter((t) => !t.isCompleted).slice(0, 12),
    [tasks, isDemoMode]
  );
  const activeGoals = useMemo(
    () => visible(goals).filter((g) => !g.isArchived).slice(0, 8),
    [goals, isDemoMode]
  );
  const activeHabits = useMemo(() => visible(habits).slice(0, 8), [habits, isDemoMode]);
  const visibleSubjects = useMemo(
    () => visible(academicSubjects).slice(0, 8),
    [academicSubjects, isDemoMode]
  );
  const visibleAssignments = useMemo(
    () => visible(academicAssignments).filter((a) => !a.isSubmitted).slice(0, 6),
    [academicAssignments, isDemoMode]
  );
  const visibleProjects = useMemo(
    () => visible(careerProjects).slice(0, 6),
    [careerProjects, isDemoMode]
  );
  const visibleNotes = useMemo(() => visible(notes).slice(0, 6), [notes, isDemoMode]);
  const visibleLifestyle = useMemo(
    () => visible(lifestyleItems).slice(0, 6),
    [lifestyleItems, isDemoMode]
  );

  if (!isOpen) return null;

  const jumpTo = (viewId: string) => {
    setActiveView(viewId);
    onClose();
  };

  const askRitWithQuery = (prompt: string) => {
    const clean = prompt.trim();
    if (clean) {
      try {
        sessionStorage.setItem('lifeos_rit_pending_prompt', clean);
      } catch {
        // Ignore storage restriction.
      }
    }
    setActiveView('assistant');
    onClose();
  };

  const handleExportBackup = async () => {
    onClose();
    const jsonStr = await LifeOSRepository.exportEntireDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeOS-Backup-${todayLocal()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Backup Exported', message: 'Local JSON snapshot downloaded.' });
  };

  const navRoutes = [
    { id: 'dashboard', label: 'Today Command Center', shortcut: 'G D', icon: Sun },
    { id: 'assistant', label: 'RIT Intelligence Workspace', shortcut: 'RIT', icon: Sparkles },
    { id: 'tasks', label: 'Tasks & Schedule', shortcut: 'G T', icon: CheckSquare },
    { id: 'goals', label: 'Goals & Milestones', shortcut: 'G G', icon: Target },
    { id: 'habits', label: 'Habits & Streaks', shortcut: 'G H', icon: Repeat },
    { id: 'academics', label: 'Academics & Attendance', shortcut: 'G A', icon: GraduationCap },
    { id: 'finance', label: 'Finance & INR Cashflow', shortcut: 'G F', icon: DollarSign },
    { id: 'fitness', label: 'Fitness & Conditioning', shortcut: 'G W', icon: Dumbbell },
    { id: 'career', label: 'Career & Projects', shortcut: 'G C', icon: Briefcase },
    { id: 'lifestyle', label: 'Lifestyle & Experiences', shortcut: 'Life', icon: Heart },
    { id: 'obsidian', label: 'Knowledge Notes', shortcut: 'G N', icon: FileText },
    { id: 'universe', label: 'Knowledge Universe', shortcut: 'G U', icon: Orbit },
    { id: 'focus', label: 'Deep Focus Timer', icon: Compass },
    { id: 'review', label: 'Evening Review', shortcut: 'G R', icon: Moon },
    { id: 'history', label: 'Review Archive', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Backups', shortcut: 'G S', icon: Settings },
    { id: 'design-system', label: 'Design System Tokens', icon: Palette },
  ];

  const ritSuggestedPrompt = search.trim() || 'Plan my day and prioritize what matters right now';

  return (
    <div
      className="cmdk-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '660px', padding: '0 12px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <LiquidGlassSurface
          style={{ borderRadius: '18px', overflow: 'hidden' }}
          frost={8}
          refraction={0.012}
        >
          <Command label="Global Command Menu" loop>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 14px',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <Search size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              <Command.Input
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder="Search any dimension, create an item, or ask RIT..."
                style={{ borderBottom: 'none', padding: '14px 8px', flex: 1 }}
              />
              <button
                type="button"
                onClick={() => askRitWithQuery(ritSuggestedPrompt)}
                className="btn btn-secondary btn-sm"
                style={{ flexShrink: 0, fontSize: '11.5px', gap: '5px' }}
                title="Send query to RIT"
              >
                <Sparkles size={13} />
                Ask RIT
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-icon"
                aria-label="Close command palette"
              >
                <X size={15} />
              </button>
            </div>

            <Command.List>
              <Command.Empty>
                <div style={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    No direct local record matched "{search}".
                  </span>
                  {search.trim() && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => askRitWithQuery(search)}
                    >
                      <Sparkles size={13} />
                      Ask RIT: "{search.trim()}"
                    </button>
                  )}
                </div>
              </Command.Empty>

              {search.trim() && (
                <Command.Group heading="RIT Intelligence">
                  <Command.Item
                    value={`ask rit ${search}`}
                    onSelect={() => askRitWithQuery(search)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={15} color="var(--accent-primary)" />
                      <span>Ask RIT: "{search.trim()}"</span>
                    </div>
                    <kbd className="toolbar-search-kbd">RIT</kbd>
                  </Command.Item>
                </Command.Group>
              )}

              <Command.Group heading="Quick Actions">
                <Command.Item
                  value="action ask rit open intelligence"
                  onSelect={() => askRitWithQuery('Plan my day and bring my life into rhythm')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={15} color="var(--accent-primary)" />
                    <span>Open RIT Intelligence (Plan My Day)</span>
                  </div>
                  <kbd className="toolbar-search-kbd">RIT</kbd>
                </Command.Item>

                <Command.Item
                  value="action create new task add"
                  onSelect={() => {
                    onClose();
                    onOpenQuickTask();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={15} color="var(--accent-primary)" />
                    <span>Create New Task</span>
                  </div>
                  <kbd className="toolbar-search-kbd">N</kbd>
                </Command.Item>

                <Command.Item
                  value="action create new goal objective milestone"
                  onSelect={() => {
                    onClose();
                    onOpenQuickGoal();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target size={15} color="var(--accent-primary)" />
                    <span>Create New Goal</span>
                  </div>
                  <kbd className="toolbar-search-kbd">Goal</kbd>
                </Command.Item>

                <Command.Item
                  value="action switch toggle theme obsidian dark paper light mode"
                  onSelect={() => {
                    const next = settings.theme === 'dark' ? 'light' : 'dark';
                    setTheme(next);
                    addToast({
                      type: 'info',
                      title: next === 'dark' ? 'Obsidian Studio Activated' : 'Paper & Ink Studio Activated',
                    });
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {settings.theme === 'dark' ? <Sun size={15} color="var(--accent-secondary)" /> : <Moon size={15} color="var(--accent-primary)" />}
                    <span>Switch to {settings.theme === 'dark' ? 'Paper Light Theme' : 'Obsidian Dark Theme'}</span>
                  </div>
                  <kbd className="toolbar-search-kbd">Theme</kbd>
                </Command.Item>

                <Command.Item
                  value="action export backup json download database"
                  onSelect={handleExportBackup}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Download size={15} color="var(--status-success)" />
                    <span>Export Local JSON Backup</span>
                  </div>
                  <kbd className="toolbar-search-kbd">JSON</kbd>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Navigation">
                {navRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <Command.Item
                      key={route.id}
                      value={`nav ${route.label} ${route.id}`}
                      onSelect={() => jumpTo(route.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={15} color="var(--text-secondary)" />
                        <span>{route.label}</span>
                      </div>
                      {route.shortcut && <kbd className="toolbar-search-kbd">{route.shortcut}</kbd>}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              {activeTasks.length > 0 && (
                <Command.Group heading="Open Tasks">
                  {activeTasks.map((t) => (
                    <Command.Item
                      key={t.id}
                      value={`task ${t.title} ${t.category || ''}`}
                      onSelect={() => jumpTo('tasks')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <CheckSquare size={14} color="var(--accent-primary)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </span>
                      </div>
                      <span className="badge badge-silver font-tabular" style={{ fontSize: '10px' }}>
                        {t.dueDate || t.priority}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {activeGoals.length > 0 && (
                <Command.Group heading="Active Goals">
                  {activeGoals.map((g) => (
                    <Command.Item
                      key={g.id}
                      value={`goal ${g.title} ${g.category || ''}`}
                      onSelect={() => jumpTo('goals')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <Target size={14} color="var(--accent-secondary)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.title}
                        </span>
                      </div>
                      <span className="badge badge-brick font-tabular" style={{ fontSize: '10px' }}>
                        {g.progress}%
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {activeHabits.length > 0 && (
                <Command.Group heading="Habits">
                  {activeHabits.map((h) => (
                    <Command.Item
                      key={h.id}
                      value={`habit ${h.name} ${h.category || ''}`}
                      onSelect={() => jumpTo('habits')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Repeat size={14} color="var(--status-success)" />
                        <span>{h.name}</span>
                      </div>
                      <span className="badge badge-silver font-tabular" style={{ fontSize: '10px' }}>
                        {h.streak || 0}d streak
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {visibleSubjects.length > 0 && (
                <Command.Group heading="Subjects">
                  {visibleSubjects.map((sub) => (
                    <Command.Item
                      key={sub.id}
                      value={`subject ${sub.name} ${sub.code}`}
                      onSelect={() => jumpTo('academics')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GraduationCap size={14} color="var(--status-info)" />
                        <span>{sub.code} : {sub.name}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {visibleAssignments.length > 0 && (
                <Command.Group heading="Assignments">
                  {visibleAssignments.map((asg) => (
                    <Command.Item
                      key={asg.id}
                      value={`assignment ${asg.title} ${asg.dueDate}`}
                      onSelect={() => jumpTo('academics')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GraduationCap size={14} color="var(--accent-secondary)" />
                        <span>{asg.title}</span>
                      </div>
                      <span className="badge badge-silver font-tabular" style={{ fontSize: '10px' }}>
                        Due {asg.dueDate}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {visibleProjects.length > 0 && (
                <Command.Group heading="Career Projects">
                  {visibleProjects.map((proj) => (
                    <Command.Item
                      key={proj.id}
                      value={`career project ${proj.title} ${proj.status}`}
                      onSelect={() => jumpTo('career')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Briefcase size={14} color="var(--accent-primary)" />
                        <span>{proj.title}</span>
                      </div>
                      <span className="badge badge-silver" style={{ fontSize: '10px' }}>
                        {proj.status}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {visibleLifestyle.length > 0 && (
                <Command.Group heading="Lifestyle & Experiences">
                  {visibleLifestyle.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`lifestyle ${item.title} ${item.category}`}
                      onSelect={() => jumpTo('lifestyle')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Heart size={14} color="var(--accent-secondary)" />
                        <span>{item.title}</span>
                      </div>
                      <span className="badge badge-silver" style={{ fontSize: '10px' }}>
                        {item.category}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {visibleNotes.length > 0 && (
                <Command.Group heading="Notes">
                  {visibleNotes.map((n) => (
                    <Command.Item
                      key={n.id}
                      value={`note ${n.title} ${n.folder}`}
                      onSelect={() => jumpTo('obsidian')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={14} color="var(--text-secondary)" />
                        <span>{n.title}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span><kbd className="toolbar-search-kbd">↑↓</kbd> navigate</span>
                <span><kbd className="toolbar-search-kbd">↵</kbd> select</span>
                <span><kbd className="toolbar-search-kbd">Esc</kbd> close</span>
              </div>
              <span>LIFE OS Liquid Glass Search</span>
            </div>
          </Command>
        </LiquidGlassSurface>
      </div>
    </div>
  );
}
