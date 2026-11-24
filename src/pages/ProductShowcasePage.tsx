import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Circle,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  FileText,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Star,
  Users,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Eye,
  CheckSquare,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { DesignVariant } from '../types';

interface ProductShowcasePageProps {
  onOpenMatrix?: () => void;
}

export default function ProductShowcasePage({ onOpenMatrix }: ProductShowcasePageProps) {
  const designVariant = useStore((s) => s.designVariant) as DesignVariant;
  const setDesignVariant = useStore((s) => s.setDesignVariant);
  const setActiveView = useStore((s) => s.setActiveView);
  const addToast = useStore((s) => s.addToast);

  // Interactive Live Demo State
  const [demoTasks, setDemoTasks] = useState([
    { id: '1', title: 'Synthesize Q3 Life OS Capital & Career Runway', done: true, priority: 'critical', time: '09:00 AM' },
    { id: '2', title: 'Complete 45-Minute Compound Hypertrophy Protocol', done: false, priority: 'high', time: '11:30 AM' },
    { id: '3', title: 'Review Academic Milestone & Attendance Ledger', done: false, priority: 'medium', time: '03:00 PM' },
  ]);

  const [demoHabits, setDemoHabits] = useState([
    { id: 'h1', name: 'Morning Sunlight & Hydration', streak: 14, days: [true, true, true, true, true, true, true] },
    { id: 'h2', name: '90-Minute Uninterrupted Deep Work', streak: 9, days: [true, true, true, false, true, true, true] },
    { id: 'h3', name: 'Obsidian Daily Reflection & Wiki-Link', streak: 21, days: [true, true, true, true, true, true, true] },
  ]);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [netWorthMultiplier, setNetWorthMultiplier] = useState(1);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          addToast({
            type: 'info',
            title: nextDone ? 'Task Completed' : 'Task Reopened',
            message: `${t.title} updated in real time.`,
          });
          return { ...t, done: nextDone };
        }
        return t;
      })
    );
  };

  const toggleHabitDay = (habitId: string, dayIndex: number) => {
    setDemoHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextDays = [...h.days];
          nextDays[dayIndex] = !nextDays[dayIndex];
          return { ...h, days: nextDays };
        }
        return h;
      })
    );
  };

  // Aesthetic Variant Profiles
  const variantMeta = {
    agent: {
      name: 'Antigravity Editorial Edition',
      subtitle: 'Strategic Question-Driven Architecture',
      tagline: 'Magazine-grade typography, contextual photographic horizon, and linear high-density triage rows.',
      accent: 'var(--palette-brick)',
      secondary: 'var(--palette-walnut)',
      fontFamily: 'Georgia, "Playfair Display", serif',
      badgeStyle: {
        background: 'var(--palette-brick-subtle)',
        border: '1px solid var(--palette-brick-border)',
        color: 'var(--palette-brick)',
      },
      cardStyle: {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
      },
    },
    taste: {
      name: 'Taste-Skill Craft Edition',
      subtitle: 'Tactile Luminescence & Anti-Slop Curation',
      tagline: 'Zero purple gradients. Dark slate glassmorphism, 1px specular top highlight, luxury whitespace, and tabular numerals.',
      accent: '#B80C09',
      secondary: '#6B2B06',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      badgeStyle: {
        background: 'rgba(184, 12, 9, 0.12)',
        border: '1px solid rgba(184, 12, 9, 0.3)',
        color: '#B80C09',
      },
      cardStyle: {
        background: 'rgba(20, 19, 24, 0.72)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.35)',
        borderRadius: '16px',
      },
    },
    impeccable: {
      name: 'Impeccable Precision Edition',
      subtitle: 'Mathematical Swiss Grid & Token Harmony',
      tagline: 'Zero rogue CSS. Rigid 8px modular spacing, strict 5-token palette, and verified 16/10/6 corner radius hierarchy.',
      accent: '#B80C09',
      secondary: '#6B2B06',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      badgeStyle: {
        background: 'var(--palette-brick-subtle)',
        border: '1px solid var(--palette-brick-border)',
        color: 'var(--palette-brick)',
        borderRadius: '6px',
      },
      cardStyle: {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '24px',
      },
    },
  }[designVariant] || {
    name: 'Antigravity Editorial Edition',
    subtitle: 'Strategic Architecture',
    tagline: 'High-density design',
    accent: 'var(--palette-brick)',
    secondary: 'var(--palette-walnut)',
    fontFamily: 'inherit',
    badgeStyle: {},
    cardStyle: {},
  };

  return (
    <div
      className={`product-showcase-container variant-${designVariant}`}
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      {/* ========================================================
          1. SHOWCASE HEADER & 3-WAY COMPARISON NAV
      ======================================================== */}
      <section
        style={{
          padding: '20px 0 30px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: designVariant === 'impeccable' ? '6px' : '16px',
                background: 'var(--palette-brick-subtle)',
                color: 'var(--palette-brick)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.05em',
                border: '1px solid var(--palette-brick-border)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--palette-brick)' }} />
              3-WAY DESIGN SHOWDOWN
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Head-to-Head Comparative Architecture
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {variantMeta.name}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            {variantMeta.tagline}
          </p>
        </div>

        {/* Live Variant Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: designVariant === 'impeccable' ? '10px' : '20px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              gap: '4px',
            }}
          >
            {(['agent', 'taste', 'impeccable'] as DesignVariant[]).map((vKey) => {
              const isActive = designVariant === vKey;
              const labels = {
                agent: '1. Antigravity',
                taste: '2. Taste-Skill',
                impeccable: '3. Impeccable',
              };
              return (
                <button
                  key={vKey}
                  onClick={() => setDesignVariant(vKey)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: designVariant === 'impeccable' ? '6px' : '16px',
                    fontSize: '11.5px',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--palette-brick)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labels[vKey]}
                </button>
              );
            })}
          </div>

          {onOpenMatrix && (
            <button
              onClick={onOpenMatrix}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: designVariant === 'impeccable' ? '10px' : '20px',
                padding: '7px 14px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={13} color="var(--palette-brick)" />
              <span>Audit Rubrics</span>
            </button>
          )}
        </div>
      </section>

      {/* ========================================================
          2. HERO SECTION
      ======================================================== */}
      <section
        style={{
          padding: '64px 0 48px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: designVariant === 'impeccable' ? '6px' : '20px',
              marginBottom: '24px',
              ...variantMeta.badgeStyle,
            }}
          >
            <Sparkles size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>
              {designVariant === 'agent' && 'SOVEREIGN LOCAL-FIRST ARCHITECTURE'}
              {designVariant === 'taste' && 'ZERO AI SLOP · TACTILE CRAFTSMANSHIP'}
              {designVariant === 'impeccable' && 'STRICT 8PT TOKENS · 5 FUNCTIONAL HUES'}
            </span>
          </div>

          {/* Dynamic Headline Based on Active Philosophy */}
          <h1
            style={{
              fontFamily: variantMeta.fontFamily,
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: designVariant === 'taste' ? '-0.025em' : designVariant === 'impeccable' ? '-0.015em' : 'normal',
              margin: '0 0 20px',
              color: 'var(--text-primary)',
            }}
          >
            {designVariant === 'agent' && (
              <>
                The Sovereign Personal Operating System for <span style={{ color: 'var(--palette-brick)' }}>Clarity & Mastery</span>.
              </>
            )}
            {designVariant === 'taste' && (
              <>
                Crafted for Relentless Focus. <span style={{ color: '#B80C09' }}>Zero Compromise.</span>
              </>
            )}
            {designVariant === 'impeccable' && (
              <>
                Mathematical Precision. <span style={{ color: 'var(--palette-brick)' }}>Zero Rogue Values.</span>
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 32px',
            }}
          >
            {designVariant === 'agent' &&
              'Unify your daily priorities, financial velocity, fitness protocols, academic safety, and intellectual Obsidian vault into a calm, human-centered daily command center.'}
            {designVariant === 'taste' &&
              'An antidote to generic AI SaaS templates. Engineered with dark slate glassmorphism, tabular numerals, generous negative space, and instant tactile feedback.'}
            {designVariant === 'impeccable' &&
              'Every spacing increment adheres to an 8px modular grid. Every color maps to 5 disciplined brand tokens. Every card, button, and badge honors a verified radius hierarchy.'}
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' }}>
            <button
              onClick={() => setActiveView('dashboard')}
              className="btn btn-primary"
              style={{
                borderRadius: designVariant === 'impeccable' ? '10px' : '24px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(184, 12, 9, 0.3)',
              }}
            >
              <span>Launch Command Center</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('live-demo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-secondary"
              style={{
                borderRadius: designVariant === 'impeccable' ? '10px' : '24px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Try Interactive Demo
            </button>
          </div>

          {/* Social Proof Counters Banner */}
          <div
            style={{
              marginTop: '44px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              padding: '18px 24px',
              background: 'var(--bg-elevated)',
              borderRadius: designVariant === 'impeccable' ? '12px' : '16px',
              border: '1px solid var(--border-default)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--palette-brick)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                  letterSpacing: '-0.03em',
                }}
              >
                100%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Local-First Client Privacy
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                  letterSpacing: '-0.03em',
                }}
              >
                12 Modules
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Unified Life Operating System
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--status-success)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                  letterSpacing: '-0.03em',
                }}
              >
                0.00ms
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                IndexedDB Storage Latency
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                  letterSpacing: '-0.03em',
                }}
              >
                0 Rogue Values
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Design Token Discipline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. FEATURE BENTO GRID
      ======================================================== */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--palette-brick)',
            }}
          >
            Comprehensive Architecture
          </span>
          <h2
            style={{
              fontFamily: variantMeta.fontFamily,
              fontSize: '28px',
              fontWeight: 800,
              margin: '6px 0 10px',
            }}
          >
            The 6 Pillars of Personal Sovereignty
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Built as one synchronized nervous system rather than disconnected productivity silos.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: designVariant === 'impeccable' ? '24px' : '20px',
          }}
        >
          {/* Bento Card 1: Focus & Tasks */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-brick-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-brick)',
                }}
              >
                <CheckSquare size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                RULE OF 3 TRIAGE
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Daily Priority & Eisenhower Matrix
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              Combats cognitive overload with a strict 3-priority horizon, inline overdue triage, subtask checklists, and zero friction completion.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Pending Critical Tasks:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--palette-brick)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                3 of 3 Active
              </span>
            </div>
          </div>

          {/* Bento Card 2: Financial Velocity */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-walnut-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-walnut)',
                }}
              >
                <DollarSign size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                TABULAR LEDGER
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Net Worth & Cash Runway
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              Automated financial velocity tracking. Categorized cash flow, recurring expense radar, and runway projection formatted with tabular monospaced alignment.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Runway:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--status-success)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                18.4 Months (Safe)
              </span>
            </div>
          </div>

          {/* Bento Card 3: Obsidian Vault */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-brick-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-brick)',
                }}
              >
                <FileText size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                BI-DIRECTIONAL GRAPH
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Obsidian Markdown Knowledge Vault
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              Native Markdown editing with [[wiki-links]] parsing, tag taxonomies, and cross-linking to goals and academic subjects directly in your browser.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Vault Connections:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                24 Nodes · 48 Links
              </span>
            </div>
          </div>

          {/* Bento Card 4: Habits & Neuroplasticity */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-walnut-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-walnut)',
                }}
              >
                <Repeat size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                RITUAL LOOPS
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Habit Streaks & Behavioral Architect
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              7-day visual momentum matrix, automatic streak protection, and frictionless daily checkoffs designed to build durable morning and evening rituals.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Active Streak Best:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--palette-brick)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                21 Days Consecutive
              </span>
            </div>
          </div>

          {/* Bento Card 5: Academics & Attendance Radar */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-brick-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-brick)',
                }}
              >
                <GraduationCap size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                SAFETY BUFFER
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Academic Safety & Exam Milestones
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              Attendance warning algorithm calculating safe cuts and must-attend thresholds alongside credit requirements and syllabus milestones.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Current Average:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--status-success)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                84.2% (Safe Threshold)
              </span>
            </div>
          </div>

          {/* Bento Card 6: Astra AI Copilot */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                  background: 'var(--palette-walnut-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--palette-walnut)',
                }}
              >
                <Bot size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                LOCAL HEURISTICS
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Local-First AI & Offline Intelligence
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: '0 0 16px' }}>
              Dual-mode copilot. Operates entirely offline with client-side heuristic engines or connects to local Python FastAPI for deep contextual synthesis.
            </p>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: designVariant === 'impeccable' ? '8px' : '10px',
                fontSize: '12px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Architecture Mode:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--palette-brick)',
                  fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                }}
              >
                Local Dexie + Optional FastAPI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. INTERACTIVE LIVE COMPONENT DEMO
      ======================================================== */}
      <section
        id="live-demo-section"
        style={{
          padding: '48px 0',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          margin: '24px 0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--palette-brick)',
            }}
          >
            Live Component Sandbox
          </span>
          <h2
            style={{
              fontFamily: variantMeta.fontFamily,
              fontSize: '28px',
              fontWeight: 800,
              margin: '6px 0 10px',
            }}
          >
            Experience the Components Live
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Interact with real priority tasks, habit streak triggers, and the Pomodoro sanctuary right here on this page.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Interactive Demo Column 1: Live Priority Tasks */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--palette-brick)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Priority Task Triage</h4>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--palette-brick-subtle)',
                  color: 'var(--palette-brick)',
                  fontWeight: 600,
                }}
              >
                Click to Complete
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demoTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: designVariant === 'impeccable' ? '10px' : '12px',
                    background: task.done ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: task.done ? 0.6 : 1,
                  }}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: task.done ? 'var(--palette-brick)' : 'var(--text-muted)',
                    }}
                  >
                    {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {task.time} · Priority: {task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Demo Column 2: 7-Day Habit Matrix */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={18} color="var(--palette-walnut)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>7-Day Habit Cadence</h4>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--palette-walnut-subtle)',
                  color: 'var(--palette-walnut)',
                  fontWeight: 600,
                }}
              >
                7-Day Matrix
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {demoHabits.map((habit) => (
                <div key={habit.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{habit.name}</span>
                    <span
                      style={{
                        color: 'var(--palette-brick)',
                        fontWeight: 700,
                        fontFamily: designVariant === 'taste' ? 'ui-monospace, monospace' : 'inherit',
                      }}
                    >
                      🔥 {habit.streak}d streak
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {habit.days.map((checked, dayIdx) => (
                      <button
                        key={dayIdx}
                        onClick={() => toggleHabitDay(habit.id, dayIdx)}
                        style={{
                          height: '28px',
                          borderRadius: designVariant === 'impeccable' ? '6px' : '8px',
                          border: `1px solid ${checked ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                          background: checked ? 'var(--palette-brick)' : 'var(--bg-elevated)',
                          color: checked ? '#FFFFFF' : 'var(--text-muted)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {checked ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Demo Column 3: Live Focus Sanctuary Pomodoro */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={18} color="var(--palette-brick)" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Focus Sanctuary Timer</h4>
            </div>

            <div
              style={{
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontFamily: 'ui-monospace, monospace',
                margin: '12px 0 16px',
                color: timerRunning ? 'var(--palette-brick)' : 'var(--text-primary)',
              }}
            >
              {formatTimer(timerSeconds)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setTimerRunning((prev) => !prev)}
                className="btn btn-primary btn-sm"
                style={{
                  borderRadius: designVariant === 'impeccable' ? '8px' : '20px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{timerRunning ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  borderRadius: designVariant === 'impeccable' ? '8px' : '20px',
                  padding: '8px 14px',
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
              25m Work Sprint · 5m Rest Interval · Ambient Audio Ready
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SOCIAL PROOF & TESTIMONIALS (WALL OF LOVE)
      ======================================================== */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--palette-brick)',
            }}
          >
            Verified Feedback
          </span>
          <h2
            style={{
              fontFamily: variantMeta.fontFamily,
              fontSize: '28px',
              fontWeight: 800,
              margin: '6px 0 10px',
            }}
          >
            Trusted by Builders & Researchers
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Hear from power users who replaced fragmented SaaS tools with LIFE OS.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Testimonial 1 */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#D97706" />
              ))}
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              "The local-first architecture is liberating. No subscription anxiety, no cloud outage fears, and zero tracking. Having my Obsidian vault cross-linked directly with tasks and finance in one browser tab is unmatched."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--palette-brick)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                AK
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Arjun K.</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Staff Systems Engineer</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#D97706" />
              ))}
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              "The Academic Safety radar literally saved my semester attendance buffer. Most student apps are either childish or overly rigid. LIFE OS feels like professional enterprise tooling for personal life."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--palette-walnut)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                SM
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Sarah M.</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Computer Science & ML Student</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div style={{ ...variantMeta.cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D97706', marginBottom: '12px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#D97706" />
              ))}
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              "The 3-Way Design Showdown switcher is an engineering masterclass. Switching between Antigravity Editorial, Taste-Skill, and Impeccable while keeping all my IndexedDB data intact proved the elegance of the system."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#141301',
                  color: '#FFFFFF',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                DL
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>David L.</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Product Designer & Founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. TRANSPARENT PRICING & ARCHITECTURE TIERS
      ======================================================== */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--palette-brick)',
            }}
          >
            Open & Sovereign
          </span>
          <h2
            style={{
              fontFamily: variantMeta.fontFamily,
              fontSize: '28px',
              fontWeight: 800,
              margin: '6px 0 10px',
            }}
          >
            Transparent Architecture Tiers
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            No subscriptions. 100% Free & Open Source for personal use.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          {/* Tier 1: Local-First Sovereign */}
          <div style={{ ...variantMeta.cardStyle, padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
              Sovereign Edition
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Full Client-Side Experience
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>
              $0{' '}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                Free Forever
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>100% Offline IndexedDB (Dexie.js)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>All 12 Personal Modules Included</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>Zero Telemetry or Data Surveillance</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>Instant JSON Vault Backup & Export</span>
              </li>
            </ul>
            <button
              onClick={() => setActiveView('dashboard')}
              className="btn btn-secondary"
              style={{ width: '100%', borderRadius: designVariant === 'impeccable' ? '8px' : '20px' }}
            >
              Get Started Now
            </button>
          </div>

          {/* Tier 2: AI Engine Pro (Featured) */}
          <div
            style={{
              ...variantMeta.cardStyle,
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid var(--palette-brick)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                padding: '3px 12px',
                borderRadius: '12px',
                background: 'var(--palette-brick)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              RECOMMENDED
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
              Co-Pilot Pro Edition
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Local Python AI Engine + Copilot
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', color: 'var(--palette-brick)' }}>
              $0{' '}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                Bring Your Own Key
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>Everything in Sovereign Edition</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>Local FastAPI Python Engine (Port 8000)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>Astra AI Copilot & Evening Review LLM</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="var(--status-success)" />
                <span>3-Way Design Showdown Runtime Switcher</span>
              </li>
            </ul>
            <button
              onClick={() => setActiveView('dashboard')}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: designVariant === 'impeccable' ? '8px' : '20px' }}
            >
              Launch Complete System
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FOOTER
      ======================================================== */}
      <footer
        style={{
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            LIFE OS 3.0
          </span>
          <span>·</span>
          <span>Personal Operating System</span>
          <span>·</span>
          <span style={{ color: 'var(--palette-brick)' }}>feature/atharva-foundation</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="https://github.com/NaikAtharva002/Life-os-"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Code2 size={14} />
            <span>GitHub Repository</span>
          </a>
          <button
            onClick={() => setActiveView('design-system')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 0,
              fontSize: '12px',
            }}
          >
            Design Tokens
          </button>
          {onOpenMatrix && (
            <button
              onClick={onOpenMatrix}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--palette-brick)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Showdown Rubrics
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
