import React from 'react';
import { BarChart3, Columns, Sparkles, Layers, Sliders, Check } from 'lucide-react';
import useStore from '../store/useStore';
import type { DesignVariant } from '../types';

export interface VariantHeaderBannerProps {
  currentVariant?: DesignVariant;
  onOpenMatrix: () => void;
}

export default function VariantHeaderBanner({ onOpenMatrix }: VariantHeaderBannerProps) {
  const designVariant = useStore((s) => s.designVariant);
  const setDesignVariant = useStore((s) => s.setDesignVariant);
  const comparisonMode = useStore((s) => s.comparisonMode);
  const setComparisonMode = useStore((s) => s.setComparisonMode);
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);

  const variants: { id: DesignVariant; name: string; tag: string; icon: string }[] = [
    {
      id: 'agent',
      name: '1. Antigravity',
      tag: 'Strategic Editorial',
      icon: '🏛️'
    },
    {
      id: 'taste',
      name: '2. Taste-Skill',
      tag: 'Tactile Craft',
      icon: '✨'
    },
    {
      id: 'impeccable',
      name: '3. Impeccable',
      tag: 'Token Precision',
      icon: '📐'
    }
  ];

  return (
    <div className="variant-header-banner">
      {/* Brand Identity & Variant Tag */}
      <div className="variant-brand-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'var(--palette-brick-subtle)',
            color: 'var(--palette-brick)',
            fontWeight: 700,
            fontSize: '10.5px',
            letterSpacing: '0.04em',
            border: '1px solid var(--palette-brick-border)'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--palette-brick)' }} />
          LIFE OS
        </span>
        <button
          onClick={() => setActiveView('showcase')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 600,
            color: activeView === 'showcase' ? 'var(--palette-brick)' : 'var(--text-primary)',
            fontSize: '11.5px',
            textDecoration: activeView === 'showcase' ? 'underline' : 'none',
          }}
          title="Open High-Converting 3-Way Showdown Showcase Page"
        >
          3-Way Showdown Showcase
        </button>
      </div>

      {/* 3-Variant Live Switcher Bar */}
      <div className="variant-switcher-bar">
        {variants.map((v) => {
          const isActive = designVariant === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setDesignVariant(v.id);
                if (comparisonMode === 'split') {
                  setComparisonMode('single');
                }
              }}
              className={`variant-pill-btn ${isActive ? 'active' : ''}`}
              title={`Switch to ${v.name} (${v.tag})`}
            >
              <span>{v.icon}</span>
              <span>{v.name}</span>
            </button>
          );
        })}
      </div>

      {/* Comparison Actions */}
      <div className="variant-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Split View Toggle */}
        <button
          onClick={() => setComparisonMode(comparisonMode === 'split' ? 'single' : 'split')}
          style={{
            padding: '4px 12px',
            borderRadius: '14px',
            background: comparisonMode === 'split' ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
            border: `1px solid ${comparisonMode === 'split' ? 'var(--palette-brick-border)' : 'var(--border-default)'}`,
            color: comparisonMode === 'split' ? 'var(--palette-brick)' : 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Toggle side-by-side comparison"
        >
          <Columns size={13} />
          <span>{comparisonMode === 'split' ? 'Exit Split View' : 'Split Compare'}</span>
        </button>

        {/* Design Matrix Modal Button */}
        <button
          onClick={onOpenMatrix}
          style={{
            padding: '4px 12px',
            borderRadius: '14px',
            background: 'var(--palette-walnut-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={13} color="var(--palette-brick)" />
          <span>Scorecard Matrix</span>
        </button>
      </div>
    </div>
  );
}
