import React from 'react';
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
} from 'lucide-react';
import useStore from '../store/useStore';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTask: () => void;
  onOpenNewGoal: () => void;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  onOpenNewTask,
  onOpenNewGoal,
}: QuickActionModalProps) {
  const setActiveView = useStore((s) => s.setActiveView);
  const saveNote = useStore((s) => s.saveNote);
  const addToast = useStore((s) => s.addToast);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'task',
      title: 'New Priority Task',
      desc: 'Add a scheduled task with priority rating, category, and subtasks',
      icon: CheckSquare,
      color: 'var(--palette-brick)',
      onClick: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'goal',
      title: 'New Vision Goal',
      desc: 'Set quarterly milestones, custom cover images, and category objectives',
      icon: Target,
      color: 'var(--palette-walnut)',
      onClick: () => {
        onClose();
        onOpenNewGoal();
      },
    },
    {
      id: 'habit',
      title: 'Add Habit Ritual',
      desc: 'Anchor small disciplines, weekly targets, and build active streaks',
      icon: Repeat,
      color: '#8F5419',
      onClick: () => {
        setActiveView('habits');
        onClose();
      },
    },
    {
      id: 'expense',
      title: 'Log Financial Expense',
      desc: 'Record cash outflow, budget allocations, and track velocity',
      icon: DollarSign,
      color: '#B80C09',
      onClick: () => {
        setActiveView('finance');
        onClose();
      },
    },
    {
      id: 'workout',
      title: 'Log Workout Session',
      desc: 'Record strength split, sets, reps, weight volume and athletic notes',
      icon: Dumbbell,
      color: '#4E632D',
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
      color: '#6B2B06',
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
      color: 'var(--palette-brick)',
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
        background: 'rgba(20, 19, 1, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
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
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--palette-brick)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quick Action Launcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
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
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
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
                <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span>Press ⌘K or / to search anytime</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
