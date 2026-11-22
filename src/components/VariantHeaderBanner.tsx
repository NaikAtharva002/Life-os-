import React from 'react';
import { ExternalLink, BarChart3, Sparkles } from 'lucide-react';

export interface VariantHeaderBannerProps {
  currentVariant: 'agent' | 'taste' | 'impeccable';
  onOpenMatrix: () => void;
}

export default function VariantHeaderBanner({ currentVariant, onOpenMatrix }: VariantHeaderBannerProps) {
  const meta = {
    agent: {
      name: 'Variant 1: Obsidian Executive',
      badge: 'Antigravity Original',
      port: 5173,
      color: '#3b82f6',
      alt1: { name: 'Taste-Skill', port: 5174, color: '#10b981' },
      alt2: { name: 'Impeccable', port: 5175, color: '#6366f1' }
    },
    taste: {
      name: 'Variant 2: Taste-Skill Craft',
      badge: 'Leonxlnx/taste-skill',
      port: 5174,
      color: '#10b981',
      alt1: { name: 'Obsidian Exec', port: 5173, color: '#3b82f6' },
      alt2: { name: 'Impeccable', port: 5175, color: '#6366f1' }
    },
    impeccable: {
      name: 'Variant 3: Impeccable Swiss',
      badge: 'pbakaus/impeccable',
      port: 5175,
      color: '#6366f1',
      alt1: { name: 'Obsidian Exec', port: 5173, color: '#3b82f6' },
      alt2: { name: 'Taste-Skill', port: 5174, color: '#10b981' }
    }
  }[currentVariant];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'rgba(10, 12, 16, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '11.5px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
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
            background: `${meta.color}22`,
            color: meta.color,
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.02em'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
          PORT :{meta.port}
        </span>
        <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{meta.name}</span>
        <span style={{ color: '#6b7280', fontSize: '11px' }}>({meta.badge})</span>
      </div>

      {/* Switcher & Comparison Triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#6b7280', fontSize: '11px' }}>Switch server:</span>
        
        <a
          href={`http://localhost:${meta.alt1.port}`}
          style={{
            textDecoration: 'none',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#161922',
            border: '1px solid #282c3c',
            color: '#d1d5db',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.alt1.color }} />
          :{meta.alt1.port} {meta.alt1.name}
          <ExternalLink size={10} color="#9ca3af" />
        </a>

        <a
          href={`http://localhost:${meta.alt2.port}`}
          style={{
            textDecoration: 'none',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#161922',
            border: '1px solid #282c3c',
            color: '#d1d5db',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.alt2.color }} />
          :{meta.alt2.port} {meta.alt2.name}
          <ExternalLink size={10} color="#9ca3af" />
        </a>

        <div style={{ width: '1px', height: '14px', background: '#282c3c', margin: '0 2px' }} />

        <button
          onClick={onOpenMatrix}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f3f4f6',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={12} color="#60a5fa" />
          <span>Compare All 3 Matrix</span>
        </button>
      </div>
    </div>
  );
}
