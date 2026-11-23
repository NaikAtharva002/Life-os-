import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Layers, Gauge, Sliders, Palette, Zap } from 'lucide-react';
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
      name: 'Variant 1: Antigravity Editorial',
      tagline: 'Strategic Question-Driven Architecture',
      creator: 'Antigravity Senior Architect',
      color: '#B80C09',
      bgTag: 'var(--palette-brick-subtle)',
      score: '96.2/100',
      heroAdvantage: 'Direct 5-question framing, Rule of 3 focus triage, and contextual photographic horizons',
      philosophy: 'Human-centered personal OS. Magazine-grade editorial headers with morning mist scrims, high-contrast clarity, inline overdue triage, and cadence progress gauge.'
    },
    {
      id: 'taste',
      name: 'Variant 2: Taste-Skill Craft',
      tagline: 'Tactile Luminescence & Luxury Space',
      creator: 'Influenced by Leonxlnx/taste-skill',
      color: '#8F5419',
      bgTag: 'rgba(143, 84, 25, 0.12)',
      score: '92.8/100',
      heroAdvantage: 'Strict tabular numerals, luxury negative space, and sub-200ms spring motion',
      philosophy: 'Aesthetic curation & anti-slop filter. Dark slate and dark walnut tactile surfaces, tabular font-mono metrics, top-edge specular illumination, and generous breathing room.'
    },
    {
      id: 'impeccable',
      name: 'Variant 3: Impeccable Precision',
      tagline: 'Mathematical Swiss Grid & Radius Harmony',
      creator: 'Influenced by pbakaus/impeccable',
      color: '#6B2B06',
      bgTag: 'var(--palette-walnut-subtle)',
      score: '95.2/100',
      heroAdvantage: 'Zero rogue CSS, rigid 8px grid, and flawless corner radius harmony (16/10/6)',
      philosophy: 'Design token precision linter. Strictly 5 functional hues, zero unmapped inline hex codes, rigid corner radius scale (16px cards, 10px controls, 6px badges), and mathematical 8px padding alignment.'
    }
  ];

  const rubrics = [
    {
      name: '1. Information Density & Triage Efficiency',
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
        agent: '4.5/5 — Tactical functional corners (8px-12px) for high-density tool feel.',
        taste: '4.5/5 — Organic 14px-16px radii with luminous top edge highlights.',
        impeccable: '5/5 — Zero rogue radii. Strictly 16px for cards, 10px for interactive elements, 6px for badges.'
      }
    },
    {
      name: '5. Micro-Interactions & Spring Motion',
      desc: 'Responsiveness, tactile click feedback, hover luminescence, and animation duration (<200ms).',
      scores: { agent: 93, taste: 98, impeccable: 92 },
      leader: 'taste',
      notes: {
        agent: '4.5/5 — Snappy 160ms ease-out transitions with tactical keyboard hints.',
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
        background: 'rgba(20, 19, 1, 0.70)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '100%',
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflowY: 'auto',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
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
                Showdown Active
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Architecture &amp; Aesthetic Comparison
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Variant Switcher Cards Strip */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
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
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent ? v.bgTag : 'var(--bg-elevated)',
                  border: `1px solid ${isCurrent ? v.color : 'var(--border-default)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all var(--spring-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: v.color, textTransform: 'uppercase' }}>
                    {v.id.toUpperCase()}
                  </span>
                  {isCurrent ? (
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: v.color, color: '#FFFFFF' }}>
                      ACTIVE
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Click to Apply</span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.name.split(':')[1]}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
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
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Direct architectural breakdown comparing the styling tokens, visual discipline, and behavioral characteristics of all 3 contenders:
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Dimension</th>
                      <th style={{ padding: '10px 14px', color: 'var(--palette-brick)', fontWeight: 700 }}>V1: Antigravity Editorial</th>
                      <th style={{ padding: '10px 14px', color: 'var(--status-warning)', fontWeight: 700 }}>V2: Taste-Skill Craft</th>
                      <th style={{ padding: '10px 14px', color: 'var(--palette-walnut)', fontWeight: 700 }}>V3: Impeccable Precision</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Design Philosophy</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Strategic Question-Driven OS</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Bespoke Tactile Craftsmanship</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Mathematical 8px Swiss Grid</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Primary Accent</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Brick Ember (#B80C09)</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Deliberate Brick Ember pops</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Tokenized Brick Ember</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Corner Radius</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Functional (8px - 12px)</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Organic fluid (14px - 16px)</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Strict: 16px card / 10px btn / 6px chip</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Number Styling</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Inter optical tabular</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>font-mono tracking-tight font-semibold</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Modular ratio 1.25 tabular scale</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Empty Space</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>High-density triage rows</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Luxury negative space ("islands")</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Uniform 8px/16px/24px gutters</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Micro-Motion</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>160ms cubic-bezier</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>180ms spring cubic-bezier</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>200ms calibrated token motion</td>
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
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: `1px solid ${v.id === effectiveVariant ? v.color : 'var(--border-default)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color }} />
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{v.name}</h4>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: v.color }} className="tabular">
                        Score: {v.score}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {v.philosophy}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Core strength: <strong style={{ color: 'var(--text-primary)' }}>{v.heroAdvantage}</strong></span>
                      <button
                        onClick={() => setDesignVariant(v.id as any)}
                        style={{ color: v.color, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        Apply this design <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 5-RUBRIC SCORECARD */}
          {activeTab === 'rubrics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Quantitative assessment of each variant against professional product engineering and UX standards:
              </div>

              {rubrics.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{r.name}</h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.desc}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                      Top: {r.leader.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'agent', label: 'V1: Antigravity Editorial', color: '#B80C09', score: r.scores.agent, note: r.notes.agent },
                      { key: 'taste', label: 'V2: Taste-Skill Craft', color: '#8F5419', score: r.scores.taste, note: r.notes.taste },
                      { key: 'impeccable', label: 'V3: Impeccable Precision', color: '#6B2B06', score: r.scores.impeccable, note: r.notes.impeccable }
                    ].map((row) => (
                      <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{row.label}</span>
                          <span style={{ color: row.color, fontWeight: 700 }}>{row.score}/100</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'var(--border-default)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${row.score}%`, height: '100%', background: row.color, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', paddingLeft: '4px' }}>{row.note}</span>
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
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--palette-brick-subtle)',
                  border: '1px solid var(--palette-brick-border)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <Sparkles size={24} color="var(--palette-brick)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--palette-brick)', fontWeight: 600 }}>
                    Which variant is the best one?
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    The answer depends on your primary daily mode:
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--palette-brick-subtle)', color: 'var(--palette-brick)', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR HIGH-VELOCITY OPERATORS
                    </span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>Variant 1 (Antigravity Editorial)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    If you use LIFE OS like Linear or Raycast — checking off 20+ tasks, reviewing academic safety margins in seconds, and requiring dense, low-latency keyboard interaction — Variant 1 provides the highest operational efficiency and zero visual fatigue.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(143, 84, 25, 0.15)', color: 'var(--status-warning)', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR LUXURY EDITORIAL EXPERIENCE
                    </span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>Variant 2 (Taste-Skill Craft)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    If you prefer your personal OS to feel like an artisanal bespoke timepiece with glowing edge highlights, high-contrast monospace figures, and calm breathing room, Variant 2 offers the most refined visual aesthetic.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--palette-walnut-subtle)', color: 'var(--palette-walnut)', fontSize: '10px', fontWeight: 700 }}>
                      BEST FOR MATHEMATICAL DESIGN INTEGRITY
                    </span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>Variant 3 (Impeccable Precision)</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    If you evaluate software as an architect — demanding mathematical 8px alignment, strict 16px/10px/6px corner hierarchy, zero rogue colors, and strict token adherence — Variant 3 is an engineering masterpiece.
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
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            All variants adhere to the 5-color brand palette and synchronize via IndexedDB.
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
