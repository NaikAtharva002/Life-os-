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
      color: 'var(--accent-primary, #E32620)',
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
      color: '#6B2B06',
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
      color: '#E5AD4B',
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
      color: '#3B82F6',
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
      color: 'var(--status-danger, #E45B52)',
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
      color: 'var(--status-success, #79B879)',
      shortcut: 'W',
      onClick: () => {
        setActiveView('fitness');
        onClose();
      },
    },
    {
      id: 'note',
      title: 'Draft Obsidian Note',
      desc: 'Create a new markdown note in your knowledge vault with [[wiki-links]]',
      icon: FileText,
      color: '#8B5CF6',
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
      desc: 'Launch Pomodoro sanctuary with soothing ambient photography',
      icon: Compass,
      color: 'var(--accent-primary, #E32620)',
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
      style={{
        zIndex: 2050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card, #241C15)',
          borderRadius: '16px',
          border: '1px solid var(--border-default, #49382A)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-default, #49382A)',
            background: 'var(--bg-elevated, #302419)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-primary, #E32620)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #F5F1E9)' }}>
                Universal Quick Create
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted, #756B61)' }}>
                Quickly add any core entity to your workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-muted, #756B61)' }}
            aria-label="Close launcher"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Grid List */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '65vh', overflowY: 'auto' }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.onClick}
                className="task-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default, #49382A)',
                  background: 'var(--bg-elevated, #302419)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'var(--bg-main, #100E0A)',
                      border: '1px solid var(--border-default, #49382A)',
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
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary, #F5F1E9)' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #756B61)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {action.desc}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <kbd
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-main, #100E0A)',
                      border: '1px solid var(--border-default, #49382A)',
                      color: 'var(--text-muted, #756B61)',
                      fontWeight: 700,
                    }}
                  >
                    {action.shortcut}
                  </kbd>
                  <ArrowRight size={14} color="var(--text-muted, #756B61)" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-default, #49382A)',
            background: 'var(--bg-elevated, #302419)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-muted, #756B61)',
          }}
        >
          <span>Tip: Press <strong>Alt+N</strong> from anywhere</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
