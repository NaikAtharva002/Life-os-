import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layers,
  Square,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  Code2,
  Sliders,
  Sparkles,
  Gauge,
  Eye,
  Check
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  Toggle,
  ProgressBar,
  Modal,
  EmptyState,
  Checkbox,
  Skeleton,
} from '../components/ui';
import useStore from '../store/useStore';

export default function DesignSystemPage() {
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const setActiveView = useStore((s) => s.setActiveView);
  const designVariant = useStore((s) => s.designVariant);
  const setDesignVariant = useStore((s) => s.setDesignVariant);
  const addToast = useStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'patterns'>('tokens');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [toggleState, setToggleState] = useState(true);
  const [checkbox1, setCheckbox1] = useState(true);
  const [checkbox2, setCheckbox2] = useState(false);
  const [sliderVal, setSliderVal] = useState(65);
  const [textInputValue, setTextInputValue] = useState('Standard input field');
  const [errorInputValue, setErrorInputValue] = useState('Invalid value');
  const [progressVal, setProgressVal] = useState(68);

  const brandColors = [
    { name: 'Brick Ember', hex: '#B80C09', role: 'Primary action, key emphasis, active indicators', token: '--palette-brick' },
    { name: 'Dark Walnut', hex: '#6B2B06', role: 'Secondary accent, dark elevated cards, borders', token: '--palette-walnut' },
    { name: 'Alabaster Grey', hex: '#E5E7E6', role: 'Light mode canvas, dark text contrast', token: '--palette-alabaster' },
    { name: 'Silver', hex: '#B7B5B3', role: 'Secondary text, borders, dividers, subtle chrome', token: '--palette-silver' },
    { name: 'Pitch Black', hex: '#141301', role: 'Dark mode canvas, light text contrast', token: '--palette-pitch' },
  ];

  const semanticStatuses = [
    { name: 'Success (Olive/Sage)', token: '--status-success', bgToken: '--status-success-bg', hex: '#4E632D' },
    { name: 'Warning (Amber)', token: '--status-warning', bgToken: '--status-warning-bg', hex: '#8F5419' },
    { name: 'Danger (Brick Ember)', token: '--status-danger', bgToken: '--status-danger-bg', hex: '#B80C09' },
    { name: 'Info (Walnut)', token: '--status-info', bgToken: '--status-info-bg', hex: '#6B2B06' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--palette-brick-subtle)',
                color: 'var(--palette-brick)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: '1px solid var(--palette-brick-border)'
              }}
            >
              Developer Diagnostics
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Internal Component Gallery</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            LIFE OS Design System 2.0
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Single source of truth for design tokens, typography scale, spacing grids, and standardized UI components.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
          >
            Toggle {settings.theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>

      {/* 3-Variant Live Showdown Banner inside Design System Gallery */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--palette-brick)" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Design Language:{' '}
              <span style={{ color: 'var(--palette-brick)', fontWeight: 700 }}>
                {designVariant === 'agent'
                  ? '1. Antigravity Editorial'
                  : designVariant === 'taste'
                  ? '2. Taste-Skill Craft'
                  : '3. Impeccable Precision'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Switching morphs all buttons, cards, typography, radii, and micro-interactions in real-time.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: 'var(--bg-elevated)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-default)'
          }}
        >
          {[
            { id: 'agent', label: '1. Antigravity', icon: '🏛️' },
            { id: 'taste', label: '2. Taste-Skill', icon: '✨' },
            { id: 'impeccable', label: '3. Impeccable', icon: '📐' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setDesignVariant(v.id as any)}
              className="btn btn-sm"
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: designVariant === v.id ? 'var(--palette-brick)' : 'transparent',
                color: designVariant === v.id ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: designVariant === v.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <span>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
        <button
          className={`tab-pill ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          <Palette size={14} /> Design Tokens
        </button>
        <button
          className={`tab-pill ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          <Square size={14} /> Core Component Kit
        </button>
        <button
          className={`tab-pill ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <Layers size={14} /> Patterns & Layouts
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DESIGN TOKENS
          ========================================================================= */}
      {activeTab === 'tokens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 1. Brand Palette Foundation */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                1. Official 5-Color Brand Identity
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Rigid 5-color foundation governing all surfaces, typography, actions, and chrome.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {brandColors.map((c) => (
                <div
                  key={c.name}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      height: '80px',
                      background: c.hex,
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '10px 14px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF'
                      }}
                    >
                      {c.hex}
                    </span>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {c.name}
                    </div>
                    <code style={{ fontSize: '11px', color: 'var(--palette-brick)', display: 'block', marginBottom: '6px' }}>
                      var({c.token})
                    </code>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {c.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Semantic Status Colors */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                2. Semantic Status Tokens
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Harmonized status palette adhering to WCAG AAA contrast in both themes.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {semanticStatuses.map((s) => (
                <div
                  key={s.name}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: `var(${s.bgToken})`,
                    border: `1px solid var(${s.token})`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: `var(${s.token})` }}>
                    {s.name}
                  </span>
                  <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    var({s.token})
                  </code>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Typography Scale */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                3. Typography Scale &amp; Tabular Numerals
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Interlocking type scale with JetBrains Mono tabular figures for financial &amp; analytical precision.
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div>
                <span className="text-display">Display 32px / Newsreader Serif &amp; Plus Jakarta</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-display (32px)</code>
              </div>
              <div>
                <span className="text-heading-page">Page Heading 24px Bold</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-heading-page (24px)</code>
              </div>
              <div>
                <span className="text-heading-section">Section Heading 18px Bold</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-heading-section (18px)</code>
              </div>
              <div>
                <span className="text-heading-sub">Subheading 15px SemiBold</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-heading-sub (15px)</code>
              </div>
              <div>
                <span className="text-body-lg">Body Large 14px Regular</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-body-lg (14px)</code>
              </div>
              <div>
                <span className="text-body">Body Standard 13px Regular</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-body (13px)</code>
              </div>
              <div>
                <span className="text-body-sm">Body Small 12px Regular</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-body-sm (12px)</code>
              </div>
              <div>
                <span className="text-caption">Caption 11px Medium</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-caption (11px)</code>
              </div>
              <div>
                <span className="text-label">UPPERCASE LABEL 10px BOLD</span>
                <code style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>--text-label (10px)</code>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }} className="tabular">
                  $14,890.50 · 25:00 · 84.6% · 1,420 kg
                </div>
                <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  .font-tabular / .tabular — JetBrains Mono with tnum and cv05 features enabled
                </code>
              </div>
            </div>
          </section>

          {/* 4. Radius Hierarchy */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                4. Corner Radius Scale
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Disciplined radius hierarchy eliminating rogue corner styling.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { name: '--radius-xs', val: '4px', desc: 'Micro tags & scrollbars' },
                { name: '--radius-sm', val: '8px', desc: 'Buttons, inputs, rows' },
                { name: '--radius-md', val: '12px', desc: 'Cards & stat blocks' },
                { name: '--radius-lg', val: '16px', desc: 'Master islands & modals' },
                { name: '--radius-xl', val: '24px', desc: 'Hero containers' },
                { name: '--radius-pill', val: '9999px', desc: 'Pill tabs & avatars' }
              ].map((r) => (
                <div
                  key={r.name}
                  style={{
                    padding: '16px',
                    borderRadius: `var(${r.name})`,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--palette-brick)', margin: '4px 0' }}>{r.val}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* =========================================================================
          TAB 2: CORE COMPONENT KIT
          ========================================================================= */}
      {activeTab === 'components' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Buttons */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Buttons &amp; Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="tertiary">Tertiary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Destructive Action</Button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <Button variant="primary" size="sm">Small (sm)</Button>
                <Button variant="primary" size="md">Medium (md)</Button>
                <Button variant="primary" size="lg">Large (lg)</Button>
                <Button variant="secondary" icon={<Plus size={14} />}>With Left Icon</Button>
                <Button variant="secondary" icon={<ArrowRight size={14} />} iconPosition="right">With Right Icon</Button>
                <Button variant="primary" loading>Loading State</Button>
                <Button variant="secondary" disabled>Disabled State</Button>
              </div>
            </div>
          </Card>

          {/* Badges */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Badges &amp; Status Indicators</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <Badge variant="brick">Brick Badge</Badge>
              <Badge variant="walnut">Walnut Badge</Badge>
              <Badge variant="silver">Silver Badge</Badge>
              <Badge variant="success" dot>Success Active</Badge>
              <Badge variant="warning" dot>Warning Pending</Badge>
              <Badge variant="danger" dot>Danger Critical</Badge>
              <Badge variant="brick" size="md">Medium Badge</Badge>
            </div>
          </Card>

          {/* Form Controls */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Inputs &amp; Form Controls</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <Input
                label="Standard Text Input"
                placeholder="Enter some text..."
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                helperText="Helper description text below the input"
              />

              <Input
                label="Search Input with Icon"
                placeholder="Search resources..."
                leftIcon={<Search size={14} />}
              />

              <Input
                label="Input with Error State"
                value={errorInputValue}
                onChange={(e) => setErrorInputValue(e.target.value)}
                error="Field requirement validation error"
              />

              <Select
                label="Select Dropdown"
                options={[
                  { value: 'opt1', label: 'Option 1 · High Priority' },
                  { value: 'opt2', label: 'Option 2 · Medium Priority' },
                  { value: 'opt3', label: 'Option 3 · Low Priority' },
                ]}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <Toggle
                  label="Email Notifications"
                  description="Receive daily review summaries at 9:30 PM"
                  checked={toggleState}
                  onChange={setToggleState}
                />
              </div>
            </div>
          </Card>

          {/* Progress Bars */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Progress Indicators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ProgressBar value={progressVal} label="Brick Ember Progress" showPercentage variant="brick" />
              <ProgressBar value={84} label="Success Progress" showPercentage variant="success" />
              <ProgressBar value={42} label="Warning Progress" showPercentage variant="warning" />
              <ProgressBar value={92} label="Dark Walnut Progress" showPercentage variant="walnut" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" onClick={() => setProgressVal(Math.max(0, progressVal - 10))}>-10%</Button>
                <Button size="sm" onClick={() => setProgressVal(Math.min(100, progressVal + 10))}>+10%</Button>
              </div>
            </div>
          </Card>

          {/* Interactive Checkboxes & Range Sliders */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Checkboxes &amp; Sliders</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ANIMATED CHECKBOXES</div>
                <Checkbox
                  label="Completed Task Checkbox"
                  description="With smooth checkmark draw and strikethrough"
                  checked={checkbox1}
                  onChange={setCheckbox1}
                />
                <Checkbox
                  label="Pending Task Checkbox"
                  description="Click to toggle with tactile spring feedback"
                  checked={checkbox2}
                  onChange={setCheckbox2}
                />
                <Checkbox
                  label="Disabled Checkbox Option"
                  checked={false}
                  disabled
                  onChange={() => {}}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>SLIDERS &amp; VALUE SELECTORS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Focus Intensity</span>
                  <span style={{ fontWeight: 700, color: 'var(--palette-brick)' }} className="tabular">{sliderVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Hardware-accelerated CSS slider thumb with brand focus ring and hover elevation.
                </span>
              </div>
            </div>
          </Card>

          {/* Toast Notification Micro-Interactions */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Toast Notifications &amp; Feedback</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
              Non-intrusive floating feedback toasts with auto-countdown, pause-on-hover, and smooth spring entry/exit.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Button
                variant="primary"
                onClick={() => addToast({ type: 'success', title: 'Task Completed', message: 'Priority task marked done and synced to database.' })}
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast({ type: 'info', title: 'Pomodoro Sanctuary', message: '25-minute deep focus block initiated.' })}
              >
                Trigger Info Toast
              </Button>
              <Button
                variant="tertiary"
                onClick={() => addToast({ type: 'warning', title: 'Attendance Alert', message: 'Calculus attendance is below 75% target threshold.' })}
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="danger"
                onClick={() => addToast({ type: 'error', title: 'Sync Error', message: 'Could not connect to external calendar.' })}
              >
                Trigger Error Toast
              </Button>
            </div>
          </Card>

          {/* Loading Skeletons */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Loading Skeletons</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
              Content place-holders with wave shimmer animation preventing abrupt layout shifts during data fetches.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="44px" height="44px" borderRadius="50%" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <Skeleton width="60%" height="16px" />
                  <Skeleton width="40%" height="12px" />
                </div>
              </div>
              <Skeleton width="100%" height="18px" />
              <Skeleton width="85%" height="18px" />
            </div>
          </Card>

          {/* Modals & Dialogs */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Overlays &amp; Modals</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
              Accessible dialog windows with backdrop blur, escape listener, and consistent header/footer slots.
            </p>
            <Button variant="primary" onClick={() => setTestModalOpen(true)}>
              Launch Test Modal Dialog
            </Button>

            <Modal
              isOpen={testModalOpen}
              onClose={() => setTestModalOpen(false)}
              title="Standardized Modal Dialog"
              subtitle="Demonstrating consistent typography, spacing, and button placement"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setTestModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setTestModalOpen(false)}>Save Changes</Button>
                </>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  This modal utilizes centralized modal tokens: <code style={{ color: 'var(--palette-brick)' }}>var(--bg-elevated)</code>, <code style={{ color: 'var(--palette-brick)' }}>var(--radius-lg)</code>, and <code style={{ color: 'var(--palette-brick)' }}>var(--shadow-xl)</code>.
                </p>
                <Input label="Modal Item Title" placeholder="e.g. Finish Sprint Review" />
              </div>
            </Modal>
          </Card>

          {/* Empty States */}
          <Card variant="island">
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Empty States</h3>
            <EmptyState
              icon={<Sparkles size={22} />}
              title="No Tasks Scheduled for Today"
              description="Your daily queue is clear. Use the quick add input or plan ahead for upcoming milestones."
              action={<Button variant="primary" size="sm" icon={<Plus size={13} />}>Create First Task</Button>}
            />
          </Card>

        </div>
      )}

      {/* =========================================================================
          TAB 3: PATTERNS & LAYOUTS
          ========================================================================= */}
      {activeTab === 'patterns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Card Elevation Hierarchy */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Surfaces &amp; Card Hierarchy
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Four standardized surface layers establishing depth without gratuitous blur or neon slop.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <Card variant="default">
                <span className="badge badge-silver" style={{ marginBottom: '8px' }}>Standard Surface</span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>Base Surface Card</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Default container for content sections on top of canvas.
                </p>
              </Card>

              <Card variant="elevated">
                <span className="badge badge-brick" style={{ marginBottom: '8px' }}>Elevated Surface</span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>Elevated Surface Card</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Elevated layer for actionable triage rows and key summaries.
                </p>
              </Card>

              <Card variant="interactive">
                <span className="badge badge-walnut" style={{ marginBottom: '8px' }}>Interactive</span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>Clickable Card</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Hover elevation and border accent for navigable items.
                </p>
              </Card>

              <Card variant="default" selected>
                <span className="badge badge-brick" style={{ marginBottom: '8px' }}>Selected</span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>Active Selected Card</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Clear Brick Ember active border and focus highlight.
                </p>
              </Card>
            </div>
          </section>

          {/* Standardized Table Pattern */}
          <section>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Standardized Data Table Pattern
              </h2>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Clean optical baseline, uppercase captions, and right-aligned tabular numbers.
              </span>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Metric / Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Velocity</th>
                    <th style={{ textAlign: 'right' }}>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Distributed Systems (CS 401)</td>
                    <td>Academics</td>
                    <td><Badge variant="success" dot>Safe (82.4%)</Badge></td>
                    <td style={{ textAlign: 'right' }} className="tabular">3.4 hrs/wk</td>
                    <td style={{ textAlign: 'right' }} className="tabular">100%</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Stripe Webhook Verification</td>
                    <td>Career &amp; Work</td>
                    <td><Badge variant="brick" dot>Critical</Badge></td>
                    <td style={{ textAlign: 'right' }} className="tabular">Due Today</td>
                    <td style={{ textAlign: 'right' }} className="tabular">65%</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Monthly Runway Buffer</td>
                    <td>Finance</td>
                    <td><Badge variant="walnut">Healthy</Badge></td>
                    <td style={{ textAlign: 'right' }} className="tabular">+$2,450.00</td>
                    <td style={{ textAlign: 'right' }} className="tabular">4.8 mos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
