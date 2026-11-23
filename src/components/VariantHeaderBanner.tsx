import React from 'react';
import { ExternalLink, BarChart3, Sparkles, Compass, Target, Dumbbell } from 'lucide-react';
import useStore from '../store/useStore';

export interface VariantHeaderBannerProps {
  currentVariant?: 'agent' | 'taste' | 'impeccable';
  onOpenMatrix: () => void;
}

export default function VariantHeaderBanner({ currentVariant = 'agent', onOpenMatrix }: VariantHeaderBannerProps) {
  const setActiveView = useStore((s) => s.setActiveView);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '10px'
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'var(--palette-brick-subtle)',
            color: 'var(--palette-brick)',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.04em',
            border: '1px solid var(--palette-brick-border)'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--palette-brick)' }} />
          LIFE OS
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Personal Operating System</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Brick Ember · Dark Walnut · Alabaster</span>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveView('focus')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '3px 10px',
            borderRadius: '14px',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-elevated)',
            borderColor: 'var(--palette-brick-border)',
            color: 'var(--accent-primary)'
          }}
        >
          <Compass size={12} /> Focus Sanctuary
        </button>

        <button
          onClick={() => setActiveView('goals')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '3px 10px',
            borderRadius: '14px',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-elevated)'
          }}
        >
          <Target size={12} /> Strategic Goals
        </button>

        <button
          onClick={() => setActiveView('fitness')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '3px 10px',
            borderRadius: '14px',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-elevated)'
          }}
        >
          <Dumbbell size={12} /> Gym
        </button>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-default)', margin: '0 4px' }} />

        <button
          onClick={onOpenMatrix}
          style={{
            padding: '3px 10px',
            borderRadius: '14px',
            background: 'var(--palette-walnut-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={12} color="var(--accent-primary)" />
          <span>Design Matrix</span>
        </button>
      </div>
    </div>
  );
}
