import React from 'react';
import { ExternalLink, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';

export interface VariantHeaderBannerProps {
  currentVariant: 'agent' | 'taste' | 'impeccable';
  onOpenMatrix: () => void;
}

export default function VariantHeaderBanner({ currentVariant, onOpenMatrix }: VariantHeaderBannerProps) {
  const activePort = typeof window !== 'undefined' && window.location.port ? window.location.port : '5173';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'rgba(2, 6, 23, 0.90)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '11.5px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      {/* Current Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.02em'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          PORT :{activePort}
        </span>
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>LIFE OS — Taste-Skill Edition (Merged Primary)</span>
        <span style={{ color: '#64748b', fontSize: '11px' }}>(Leonxlnx/taste-skill)</span>
      </div>

      {/* Switcher & Comparison Triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#64748b', fontSize: '11px' }}>Explore standalone ports:</span>

        <a
          href="http://localhost:5174"
          style={{
            textDecoration: 'none',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
          :5174 Taste-Skill
          <ExternalLink size={10} color="#64748b" />
        </a>

        <a
          href="http://localhost:5175"
          style={{
            textDecoration: 'none',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1' }} />
          :5175 Impeccable Swiss
          <ExternalLink size={10} color="#64748b" />
        </a>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 2px' }} />

        <button
          onClick={onOpenMatrix}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={12} color="#10b981" />
          <span>Compare All 3 Matrix</span>
        </button>
      </div>
    </div>
  );
}
