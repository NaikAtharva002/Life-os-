import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles,
  Compass,
  Moon,
  History,
  Settings,
  Plus,
  ArrowRight,
  Sun,
  LayoutDashboard,
  Tag,
  Calendar,
  X,
  Keyboard,
} from 'lucide-react';
import useStore from '../store/useStore';

export interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickTask: () => void;
  onOpenQuickGoal: () => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Navigation' | 'Tasks' | 'Goals' | 'Notes' | 'Finance' | 'Academics';
  title: string;
  subtitle?: string;
  icon: any;
  shortcut?: string;
  onSelect: () => void;
}

export default function GlobalCommandPalette({
  isOpen,
  onClose,
  onOpenQuickTask,
  onOpenQuickGoal,
}: GlobalCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const setActiveView = useStore((s) => s.setActiveView);
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const habits = useStore((s) => s.habits);
  const notes = useStore((s) => s.obsidianNotes);
  const financeTransactions = useStore((s) => s.financeTransactions);
  const academicSubjects = useStore((s) => s.academicSubjects);
  const addToast = useStore((s) => s.addToast);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Base navigation and action items
  const baseItems: CommandItem[] = useMemo(() => [
    // Quick Actions
    {
      id: 'action-task',
      category: 'Actions',
      title: 'Create New Task',
      subtitle: 'Add a priority task with deadline and subtasks',
      icon: Plus,
      shortcut: 'N',
      onSelect: () => {
        onClose();
        onOpenQuickTask();
      },
    },
    {
      id: 'action-goal',
      category: 'Actions',
      title: 'Create New Goal',
      subtitle: 'Establish a quarterly or annual life objective',
      icon: Target,
      shortcut: 'G G',
      onSelect: () => {
        onClose();
        onOpenQuickGoal();
      },
    },
    {
      id: 'action-focus',
      category: 'Actions',
      title: 'Start Deep Focus Session',
      subtitle: 'Open the 25-minute Pomodoro timer with atmospheric horizons',
      icon: Compass,
      shortcut: 'G F',
      onSelect: () => {
        setActiveView('focus');
        onClose();
      },
    },
    {
      id: 'action-theme',
      category: 'Actions',
      title: `Switch to ${settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`,
      subtitle: 'Toggle application theme canvas',
      icon: settings.theme === 'dark' ? Sun : Moon,
      shortcut: 'T',
      onSelect: () => {
        setTheme(settings.theme === 'dark' ? 'light' : 'dark');
        addToast({
          type: 'info',
          title: `Theme changed to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        });
        onClose();
      },
    },

    // Navigation Items
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Go to Dashboard',
      subtitle: 'Daily Command Center & Triage',
      icon: LayoutDashboard,
      shortcut: 'G D',
      onSelect: () => {
        setActiveView('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-showcase',
      category: 'Navigation',
      title: 'Go to 3-Way Showdown Showcase',
      subtitle: 'Compare Antigravity vs Taste-Skill vs Impeccable live editions',
      icon: Sparkles,
      shortcut: 'G S',
      onSelect: () => {
        setActiveView('showcase');
        onClose();
      },
    },
    {
      id: 'nav-tasks',
      category: 'Navigation',
      title: 'Go to Tasks',
      subtitle: 'Manage all priorities, kanban board & calendar schedule',
      icon: CheckSquare,
      shortcut: 'G T',
      onSelect: () => {
        setActiveView('tasks');
        onClose();
      },
    },
    {
      id: 'nav-goals',
      category: 'Navigation',
      title: 'Go to Goals',
      subtitle: 'Track milestones, cover images, and category velocity',
      icon: Target,
      shortcut: 'G G',
      onSelect: () => {
        setActiveView('goals');
        onClose();
      },
    },
    {
      id: 'nav-habits',
      category: 'Navigation',
      title: 'Go to Habits',
      subtitle: 'Daily rituals, streaks, and 70-day consistency heatmap',
      icon: Repeat,
      shortcut: 'G H',
      onSelect: () => {
        setActiveView('habits');
        onClose();
      },
    },
    {
      id: 'nav-finance',
      category: 'Navigation',
      title: 'Go to Finances',
      subtitle: 'Monthly cash velocity, budgets, transactions and savings targets',
      icon: DollarSign,
      shortcut: 'G F',
      onSelect: () => {
        setActiveView('finance');
        onClose();
      },
    },
    {
      id: 'nav-fitness',
      category: 'Navigation',
      title: 'Go to Gym & Fitness',
      subtitle: 'Workout volume, splits, PR milestones and body composition',
      icon: Dumbbell,
      shortcut: 'G W',
      onSelect: () => {
        setActiveView('fitness');
        onClose();
      },
    },
    {
      id: 'nav-academics',
      category: 'Navigation',
      title: 'Go to Academics',
      subtitle: 'Course attendance safety thresholds, assignments and exams',
      icon: GraduationCap,
      shortcut: 'G A',
      onSelect: () => {
        setActiveView('academics');
        onClose();
      },
    },
    {
      id: 'nav-career',
      category: 'Navigation',
      title: 'Go to Career & Work',
      subtitle: 'Application pipeline, technical skills index and portfolio',
      icon: Briefcase,
      shortcut: 'G C',
      onSelect: () => {
        setActiveView('career');
        onClose();
      },
    },
    {
      id: 'nav-obsidian',
      category: 'Navigation',
      title: 'Go to Obsidian Notes',
      subtitle: 'Markdown vault, tags, and bidirectional [[wiki-links]]',
      icon: FileText,
      shortcut: 'G N',
      onSelect: () => {
        setActiveView('obsidian');
        onClose();
      },
    },
    {
      id: 'nav-review',
      category: 'Navigation',
      title: 'Start Evening Review',
      subtitle: 'Reflect on wins, log gratitude, and lock tomorrow priorities',
      icon: Moon,
      shortcut: 'G R',
      onSelect: () => {
        setActiveView('review');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Open Settings',
      subtitle: 'Configure account, backup data, and notification times',
      icon: Settings,
      shortcut: 'G S',
      onSelect: () => {
        setActiveView('settings');
        onClose();
      },
    },
  ], [settings.theme, onOpenQuickTask, onOpenQuickGoal, setActiveView, setTheme, addToast, onClose]);

  // Live Local Search Across Real Data
  const searchResults: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseItems;

    const results: CommandItem[] = [];

    // Filter base commands
    baseItems.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      ) {
        results.push(item);
      }
    });

    // Real-Time Search in Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))) {
        results.push({
          id: `task-${t.id}`,
          category: 'Tasks',
          title: t.title,
          subtitle: `Priority: ${t.priority.toUpperCase()} · Due: ${t.dueDate || 'Someday'}`,
          icon: CheckSquare,
          onSelect: () => {
            setActiveView('tasks');
            onClose();
          },
        });
      }
    });

    // Real-Time Search in Goals
    goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)) {
        results.push({
          id: `goal-${g.id}`,
          category: 'Goals',
          title: g.title,
          subtitle: `Category: ${g.category} · Target: ${g.targetDate || 'Ongoing'}`,
          icon: Target,
          onSelect: () => {
            setActiveView('goals');
            onClose();
          },
        });
      }
    });

    // Real-Time Search in Obsidian Notes
    notes.forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        n.folder.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      ) {
        results.push({
          id: `note-${n.id}`,
          category: 'Notes',
          title: n.title,
          subtitle: `Folder: ${n.folder} · ${n.tags.length > 0 ? n.tags.join(', ') : 'No tags'}`,
          icon: FileText,
          onSelect: () => {
            setActiveView('obsidian');
            onClose();
          },
        });
      }
    });

    // Real-Time Search in Finance Transactions
    financeTransactions.forEach((tx) => {
      if (
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `tx-${tx.id}`,
          category: 'Finance',
          title: tx.description,
          subtitle: `${tx.type.toUpperCase()}: ₹${tx.amount.toFixed(2)} · ${tx.category} · ${tx.date}`,
          icon: DollarSign,
          onSelect: () => {
            setActiveView('finance');
            onClose();
          },
        });
      }
    });

    // Real-Time Search in Academic Subjects
    academicSubjects.forEach((sub) => {
      if (
        sub.name.toLowerCase().includes(q) ||
        sub.code.toLowerCase().includes(q)
      ) {
        results.push({
          id: `sub-${sub.id}`,
          category: 'Academics',
          title: `${sub.code}: ${sub.name}`,
          subtitle: `${sub.attendedClasses}/${sub.totalClasses} classes · Target: ${sub.targetAttendancePercentage}%`,
          icon: GraduationCap,
          onSelect: () => {
            setActiveView('academics');
            onClose();
          },
        });
      }
    });

    return results;
  }, [query, baseItems, tasks, goals, notes, financeTransactions, academicSubjects, setActiveView, onClose]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (searchResults.length || 1)) % (searchResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'min(12vh, 100px)',
        background: 'rgba(20, 19, 1, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
          }}
        >
          <Search size={18} color="var(--palette-brick)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search records, tasks, goals, notes, or type command..."
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14.5px',
              fontWeight: 500,
              outline: 'none',
              width: '100%',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="btn btn-ghost"
              style={{ padding: '3px', color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            padding: '8px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No records matching "{query}"
              </div>
              <div style={{ fontSize: '12px' }}>
                Try searching for task titles, goal categories, transactions, or note content.
              </div>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-active={isSelected}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--palette-brick-subtle)' : 'transparent',
                    border: isSelected ? '1px solid var(--palette-brick-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? 'var(--palette-brick)' : 'var(--bg-elevated)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <Icon size={14} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '13px',
                            color: isSelected ? 'var(--palette-brick)' : 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                    {item.shortcut && (
                      <kbd
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-default)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight size={13} style={{ opacity: isSelected ? 1 : 0.2, color: 'var(--palette-brick)' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 18px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Privacy: Local-First IndexedDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
