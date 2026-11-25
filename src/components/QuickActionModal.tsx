import React, { useEffect } from 'react';
import {
  X,
  Zap,
  CheckSquare,
  Target,
  Repeat,
  DollarSign,
  Dumbbell,
  FileText,
  Compass,
  ArrowRight,
  GraduationCap,
  Calendar,
  Plus,
} from 'lucide-react';
import useStore from '../store/useStore';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTask: () => void;
  onOpenNewGoal: () => void;
  onOpenNewHabit?: () => void;
  onOpenNewClass?: () => void;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  onOpenNewTask,
  onOpenNewGoal,
  onOpenNewHabit,
  onOpenNewClass,
}: QuickActionModalProps) {
  const setActiveView = useStore((s) => s.setActiveView);
  const saveNote = useStore((s) => s.saveNote);
  const addToast = useStore((s) => s.addToast);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'task',
      title: 'New Priority Task',
      desc: 'Add a scheduled task with priority rating, category, and subtasks',
      icon: CheckSquare,
      color: 'var(--accent-primary)',
      shortcut: 'T',
      onClick: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'goal',
      title: 'New Vision Goal',
      desc: 'Set quarterly milestones, custom targets, and category objectives',
      icon: Target,
      color: 'var(--accent-secondary)',
      shortcut: 'G',
      onClick: () => {
        onClose();
        onOpenNewGoal();
      },
    },
    {
      id: 'habit',
      title: 'New Habit Ritual',
      desc: 'Anchor daily disciplines, weekly frequencies, and build active streaks',
      icon: Repeat,
      color: 'var(--status-success)',
      shortcut: 'H',
      onClick: () => {
        onClose();
        if (onOpenNewHabit) {
          onOpenNewHabit();
        } else {
          setActiveView('habits');
        }
      },
    },
    {
      id: 'class',
      title: 'Add Class / Lecture',
      desc: 'Schedule weekly lectures, timings, classrooms, and course instructor',
      icon: Calendar,
      color: 'var(--status-info)',
      shortcut: 'C',
      onClick: () => {
        onClose();
        if (onOpenNewClass) {
          onOpenNewClass();
        } else {
          setActiveView('academics');
        }
      },
    },
    {
      id: 'expense',
      title: 'Log Financial Expense',
      desc: 'Record cash outflow, budget allocations, and track spending velocity',
      icon: DollarSign,
      color: 'var(--status-danger)',
      shortcut: 'E',
      onClick: () => {
        setActiveView('finance');
        onClose();
      },
    },
    {
      id: 'workout',
      title: 'Log Workout Session',
      desc: 'Record strength split, sets, reps, weight volume, and athletic notes',
      icon: Dumbbell,
      color: 'var(--status-success)',
      shortcut: 'W',
      onClick: () => {
        setActiveView('fitness');
        onClose();
      },
    },
    {
      id: 'note',
      title: 'Draft Knowledge Note',
      desc: 'Create a markdown note in your vault with wiki-links',
      icon: FileText,
      color: 'var(--accent-light)',
      shortcut: 'N',
      onClick: () => {
        saveNote({
          title: `Untitled Note ${new Date().toLocaleDateString()}`,
          folder: 'Daily Notes',
          content: '# New Note\n\nCaptured thoughts and ideas...',
          tags: ['inbox', 'quick-capture'],
        });
        addToast({
          type: 'success',
          title: 'Note Created in Vault',
          message: 'Saved to Daily Notes folder.',
        });
        setActiveView('obsidian');
        onClose();
      },
    },
    {
      id: 'focus',
      title: 'Start 25m Focus Session',
      desc: 'Launch deep work Pomodoro sprint timer',
      icon: Compass,
      color: 'var(--accent-primary)',
      shortcut: 'F',
      onClick: () => {
        setActiveView('focus');
        onClose();
      },
    },
  ];

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 2050 }}
      onClick={onClose}
    >
      <div
        className="modal"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Quick Create
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Add a record to any area of LIFE OS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close launcher"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '65vh', overflowY: 'auto' }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.onClick}
                className="editorial-triage-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {action.desc}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <kbd className="toolbar-search-kbd">{action.shortcut}</kbd>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Tip: Press <strong>Alt+N</strong> from anywhere</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
