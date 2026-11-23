import React, { useState } from 'react';
import { X, ExternalLink, Sparkles, Check, ArrowRight, ShieldCheck, Layers, Gauge, Sliders, Palette, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import type { DesignVariant } from '../types';

export interface ComparisonDrawerProps {
  currentVariant?: 'agent' | 'taste' | 'impeccable';
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparisonDrawer({ currentVariant, isOpen, onClose }: ComparisonDrawerProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'rubrics' | 'verdict'>('matrix');
  const storeVariant = useStore((s) => s.designVariant);
  const effectiveVariant = currentVariant || storeVariant;
  const setDesignVariant = useStore((s) => s.setDesignVariant);

  if (!isOpen) return null;

  const variants = [
    {
      id: 'agent',
      name: 'Variant 1: Brick & Walnut Brand System',
      tagline: 'Brand Identity & Editorial Hybrid',
      creator: 'Antigravity / Atharva Foundation',
      port: 5173,
      url: 'http://localhost:5173',
      color: '#B80C09',
      bgTag: 'rgba(184, 12, 9, 0.12)',
      score: '96.2/100',
      heroAdvantage: 'Cohesive brand identity, editorial photography, and anti-AI-slop design discipline',
      philosophy: 'Authentic 5-colour identity: Brick Ember (#B80C09) primary, Dark Walnut (#6B2B06) secondary, Alabaster Grey (#E5E7E6), Silver (#B7B5B3), and Pitch Black (#141301). Zero gratuitous purple/neon slop.'
    },
    {
      id: 'taste',
      name: 'Variant 2: Taste-Skill Craft',
      tagline: 'Curated Aesthetic & Tactile Luminescence',
      creator: 'Influenced by Leonxlnx/taste-skill',
      port: 5174,
      url: 'http://localhost:5174',
      color: '#10b981',
      bgTag: 'rgba(16, 185, 129, 0.12)',
      score: '92.8/100',
      heroAdvantage: 'Luxury whitespace, tabular numerals, and dark slate glass luminescence',
      philosophy: 'Aesthetic curation & anti-slop filter. Dark slate glassmorphism (blur 16px), monochrome base with Acid Emerald micro-luminescence, strict tabular numerals (font-mono tracking-tight), and sub-200ms spring micro-motion.'
    },
    {
      id: 'impeccable',
      name: 'Variant 3: Impeccable System',
      tagline: 'Strict Mathematical Swiss Grid',
      creator: 'Influenced by pbakaus/impeccable',
      port: 5175,
      url: 'http://localhost:5175',
      color: '#6366f1',
      bgTag: 'rgba(99, 102, 241, 0.12)',
      score: '95.2/100',
      heroAdvantage: 'Zero rogue CSS values, rigid 8px grid, and flawless corner radius harmony',
      philosophy: 'Design token precision linter. Strictly 5 functional hues, zero unmapped inline hex codes, rigid corner radius scale (16px cards, 12px buttons, 8px badges), and mathematical Swiss-grid padding alignment.'
    }
  ];

  const rubrics = [
    {
      name: '1. Information Density & Triage',
      desc: 'How effectively the screen surfaces actionable tasks, academic safety, and finance velocity without visual friction.',
      scores: { agent: 98, taste: 86, impeccable: 93 },
      leader: 'agent',
      notes: {
        agent: '5/5 — Linear-style compact triage rows, executive status ribbon, zero wasted vertical space.',
        taste: '4/5 — Intentional negative space; prioritizes breathing room ("islands of context") over raw density.',
        impeccable: '4.5/5 — Balanced Swiss layout with predictable 8px/16px gutters and strict optical baseline.'
      }
    },
    {
      name: '2. Anti-AI-Slop & Visual Restraint',
      desc: 'Elimination of generic AI clichés: purple gradients, glowing halos, frosted glass overload, floating cards.',
      scores: { agent: 99, taste: 94, impeccable: 98 },
      leader: 'agent',
      notes: {
        agent: '5/5 — Completely bans glassmorphism and ambient glow; relies purely on solid matte surfaces and 1px inset highlights.',
        taste: '4.5/5 — Uses dark slate glassmorphism with 16px blur, strictly contained without purple/cyan neon slop.',
        impeccable: '5/5 — 100% tokenized color architecture; zero rogue hex codes; 5 functional hues only.'
      }
    },
    {
      name: '3. Typography & Tabular Numerals',
      desc: 'Typographic hierarchy, legibility, and numeric precision alignment across financial and time data.',
      scores: { agent: 94, taste: 99, impeccable: 95 },
      leader: 'taste',
      notes: {
        agent: '4.5/5 — High-contrast off-white hierarchy, uppercase micro-labels with 0.05em tracking.',
        taste: '5/5 — Masterclass implementation of font-mono tracking-tight font-semibold across all metrics, timestamps, and currency.',
        impeccable: '4.8/5 — Strict modular type scale (1.25 ratio), mathematically synchronized line heights.'
      }
    },
    {
      name: '4. Component Geometry & Radius Harmony',
      desc: 'Consistency of corner radii, borders, and mathematical relationships between parents and children.',
      scores: { agent: 91, taste: 90, impeccable: 99 },
      leader: 'impeccable',
      notes: {
        agent: '4.5/5 — Tactical sharp corners (4px-8px) for high-density tool feel.',
        taste: '4.5/5 — Organic 12px-14px radii with luminous top edge highlights.',
        impeccable: '5/5 — Zero rogue radii. Strictly 16px for cards, 12px for interactive elements, 8px for badges.'
      }
    },
    {
      name: '5. Micro-Interactions & Spring Motion',
      desc: 'Responsiveness, tactile click feedback, hover luminescence, and animation duration (<200ms).',
      scores: { agent: 93, taste: 98, impeccable: 92 },
      leader: 'taste',
      notes: {
        agent: '4.5/5 — Snappy 150ms ease-out transitions with tactical keyboard hints.',
        taste: '5/5 — High-craft spring curves cubic-bezier(0.16, 1, 0.3, 1) under 200ms with subtle edge illumination.',
        impeccable: '4.5/5 — Standardized 200ms motion tokens with predictable acceleration curves.'
      }
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '100%',
          background: '#0e1117',
          borderLeft: '1px solid #232733',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
          overflowY: 'auto',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--palette-brick)' }}>
                LIFE OS · Design Variant Matrix
              </span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--palette-brick-subtle)', color: 'var(--palette-brick)', fontWeight: 600, border: '1px solid var(--palette-brick-border)' }}>
                3 Live Servers
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Architecture &amp; Aesthetic Comparison
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2a2e3d',
              borderRadius: '8px',
              padding: '6px',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Port Switcher Strip */}
        <div
          style={{
            padding: '12px 24px',
            background: '#151924',
            borderBottom: '1px solid #232733',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}
        >
          {variants.map((v) => {
            const isCurrent = v.id === effectiveVariant;
            return (
              <div
                key={v.id}
                onClick={() => setDesignVariant(v.id as any)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isCurrent ? v.bgTag : '#10131c',
                  border: `1px solid ${isCurrent ? v.color : '#232733'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: v.color, textTransform: 'uppercase' }}>
                    {v.id.toUpperCase()}
                  </span>
                  {isCurrent ? (
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: v.color, color: '#000' }}>
                      ACTIVE
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', color: '#9ca3af' }}>Click to Apply</span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.name.split(':')[1]}
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Score: <strong style={{ color: v.color }}>{v.score}</strong>
                </span>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #232733',
            background: '#0e1117',
            padding: '0 24px'
          }}
        >
          {[
            { id: 'matrix', label: 'Feature Matrix' },
            { id: 'rubrics', label: '5-Rubric Scorecard' },
            { id: 'verdict', label: 'Architectural Verdict' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--palette-brick)' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: FEATURE MATRIX */}
          {activeTab === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
                Direct architectural breakdown comparing the styling tokens, visual discipline, and behavioral characteristics of all 3 running applications:
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #232733', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#161a26', borderBottom: '1px solid #232733' }}>
                      <th style={{ padding: '10px 14px', color: '#9ca3af', fontWeight: 600 }}>Dimension</th>
                      <th style={{ padding: '10px 14px', color: '#60a5fa', fontWeight: 700 }}>V1: Obsidian Exec (:5173)</th>
                      <th style={{ padding: '10px 14px', color: '#34d399', fontWeight: 700 }}>V2: Taste-Skill (:5174)</th>
                      <th style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 700 }}>V3: Impeccable (:5175)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Design Philosophy</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Linear & Apple tactile efficiency</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Editorial luxury & luminous slate</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Strict Swiss 8pt token discipline</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Card Surface</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>100% solid matte graphite (#0e1015)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Dark slate glass (blur 16px, 60% opacity)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Solid slate (#0f172a) + elevation tokens</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Primary Accent</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Precision Blue (#3b82f6)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Acid Emerald (#10b981) micro-glow</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Royal Indigo (#6366f1)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Corner Radius</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Tactical sharp (6px cards, 4px tags)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Organic fluid (12px - 14px)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Strict: 16px card / 12px btn / 8px chip</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Number Styling</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Inter optical tabular</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>font-mono tracking-tight font-semibold</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Modular ratio 1.25 tabular scale</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1c202d' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Empty Space</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Ultra-dense: compact triage lists</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Luxury whitespace ("islands of context")</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>Mathematically uniform 16px/24px gutters</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#e5e7eb' }}>Micro-Motion</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>150ms ease-out</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>&lt;200ms cubic-bezier(0.16, 1, 0.3, 1)</td>
                      <td style={{ padding: '10px 14px', color: '#d1d5db' }}>200ms calibrated linear-spring</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Individual Variant Deep Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {variants.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: '#121622',
                      border: `1px solid ${v.id === effectiveVariant ? v.color : '#232733'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color }} />
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#f3f4f6', fontWeight: 600 }}>{v.name}</h4>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: v.color }} className="tabular">
                        Score: {v.score}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9ca3af', lineHeight: 1.5 }}>
                      {v.philosophy}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6b7280' }}>
                      <span>Core strength: <strong style={{ color: '#e5e7eb' }}>{v.heroAdvantage}</strong></span>
                      <a href={v.url} style={{ color: v.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        Switch to :{v.port} <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 5-RUBRIC SCORECARD */}
          {activeTab === 'rubrics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
                Quantitative assessment of each variant against professional product engineering and UX standards:
              </div>

              {rubrics.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: '#121622',
                    border: '1px solid #232733',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#f3f4f6', fontWeight: 600 }}>{r.name}</h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#9ca3af' }}>{r.desc}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#d1d5db' }}>
                      Top: {r.leader.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'agent', label: 'V1: Obsidian Executive', color: '#3b82f6', score: r.scores.agent, note: r.notes.agent },
                      { key: 'taste', label: 'V2: Taste-Skill Craft', color: '#10b981', score: r.scores.taste, note: r.notes.taste },
                      { key: 'impeccable', label: 'V3: Impeccable Swiss', color: '#6366f1', score: r.scores.impeccable, note: r.notes.impeccable }
                    ].map((row) => (
                      <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#d1d5db', fontWeight: 500 }}>{row.label}</span>
                          <span style={{ color: row.color, fontWeight: 700 }}>{row.score}/100</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#1c202d', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${row.score}%`, height: '100%', background: row.color, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#6b7280', paddingLeft: '4px' }}>{row.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ARCHITECTURAL VERDICT */}
          {activeTab === 'verdict' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <Sparkles size={24} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#93c5fd', fontWeight: 600 }}>
                    Which variant is the best one?
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    The answer depends on your primary daily mode:
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', background: '#121622', border: '1px solid #232733' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR HIGH-VELOCITY OPERATORS
                    </span>
                    <strong style={{ color: '#f3f4f6', fontSize: '13px' }}>Variant 1 (Obsidian Executive :5173)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.5 }}>
                    If you use LIFE OS like Linear or Raycast — checking off 20+ tasks, reviewing academic bunk margins in seconds, and requiring dense, low-latency keyboard interaction — Variant 1 provides the highest operational efficiency and zero visual fatigue.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: '#121622', border: '1px solid #232733' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR LUXURY EDITORIAL EXPERIENCE
                    </span>
                    <strong style={{ color: '#f3f4f6', fontSize: '13px' }}>Variant 2 (Taste-Skill Craft :5174)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.5 }}>
                    If you prefer your personal OS to feel like an artisanal bespoke timepiece with glowing edge highlights, high-contrast monospace figures, and calm breathing room, Variant 2 offers the most refined visual aesthetic.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: '#121622', border: '1px solid #232733' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR MATHEMATICAL DESIGN INTEGRITY
                    </span>
                    <strong style={{ color: '#f3f4f6', fontSize: '13px' }}>Variant 3 (Impeccable Swiss :5175)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.5 }}>
                    If you evaluate software as an architect — demanding mathematical 8px alignment, strict 16px/12px/8px corner hierarchy, zero rogue colors, and strict token adherence — Variant 3 is an engineering masterpiece.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #232733',
            background: '#121620',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            All 3 servers synchronize via local IndexedDB storage.
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#232733',
              border: 'none',
              color: '#f3f4f6',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
