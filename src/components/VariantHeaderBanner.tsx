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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      {/* Brand Identity & Variant Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
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
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          3-Way Design Showdown
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'none', md: 'inline' } as any}>
          Brick Ember · Dark Walnut · Alabaster
        </span>
      </div>

      {/* 3-Variant Live Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-elevated)',
          padding: '3px',
          borderRadius: '20px',
          border: '1px solid var(--border-default)',
          gap: '3px'
        }}
      >
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '11.5px',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--palette-brick)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 2px 6px rgba(184, 12, 9, 0.28)' : 'none'
              }}
              title={`Switch to ${v.name} (${v.tag})`}
            >
              <span>{v.icon}</span>
              <span>{v.name}</span>
              <span
                style={{
                  fontSize: '9.5px',
                  opacity: isActive ? 0.9 : 0.6,
                  fontWeight: 400
                }}
              >
                · {v.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Comparison Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
