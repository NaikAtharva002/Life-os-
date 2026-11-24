import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Global Navigation & Search',
      shortcuts: [
        { key: '⌘K / Ctrl+K', description: 'Open Global Search & Command Palette' },
        { key: '/', description: 'Focus search bar (when outside inputs)' },
        { key: '?', description: 'Show this keyboard shortcuts guide' },
        { key: 'Esc', description: 'Close any modal, drawer, or palette' },
        { key: 'T', description: 'Toggle Light / Dark mode in Command Palette' },
      ],
    },
    {
      title: 'Module Quick Jumps (Press G then Key)',
      shortcuts: [
        { key: 'G D', description: 'Jump to Dashboard' },
        { key: 'G T', description: 'Jump to Tasks' },
        { key: 'G G', description: 'Jump to Goals' },
        { key: 'G H', description: 'Jump to Habits' },
        { key: 'G F', description: 'Jump to Finances' },
        { key: 'G W', description: 'Jump to Gym & Fitness' },
        { key: 'G A', description: 'Jump to Academics' },
        { key: 'G C', description: 'Jump to Career & Work' },
        { key: 'G N', description: 'Jump to Obsidian Notes' },
        { key: 'G R', description: 'Jump to Evening Review' },
        { key: 'G S', description: 'Jump to Settings' },
        { key: 'G P', description: 'Jump to 3-Way Showdown Showcase' },
      ],
    },
    {
      title: 'Quick Actions',
      shortcuts: [
        { key: 'N', description: 'Quick New Task modal' },
        { key: 'Enter', description: 'Execute selected command or save' },
        { key: '↑ / ↓', description: 'Navigate search results and lists' },
      ],
    },
  ];

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 2100,
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
            <Keyboard size={18} color="var(--palette-brick)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Keyboard Shortcuts Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
            aria-label="Close shortcuts modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--palette-brick)',
                  marginBottom: '10px',
                }}
              >
                {group.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  border: '1px solid var(--border-default)',
                }}
              >
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 0',
                      borderBottom: sIdx === group.shortcuts.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{sc.description}</span>
                    <kbd
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
