import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  CheckSquare,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  FileText,
  Sun,
  Moon,
  Clock,
  Calendar,
  Shield,
  Zap,
  Plus,
  Trash2,
  Heart,
  BookOpen,
  Award,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { Priority } from '../types';

interface InitialGoalDraft {
  title: string;
  category: string;
  priority: Priority;
  targetDate?: string;
}

interface InitialHabitDraft {
  name: string;
  category: string;
  frequency: string;
}

interface OnboardingDraftState {
  step: number;
  userName: string;
  userGreeting: string;
  userAvatar: string;
  selectedLifeAreas: string[];
  initialGoals: InitialGoalDraft[];
  initialHabits: InitialHabitDraft[];
  theme: 'dark' | 'light';
  weekStartDay: 'monday' | 'sunday';
  defaultFocusDuration: number;
  currencySymbol: string;
  reminderEnabled: boolean;
  reminderTime: string;
}

const STORAGE_KEY = 'lifeos_onboarding_draft';

const AVATAR_OPTIONS = [
  { id: 'brick', label: 'Ember Crimson', bg: '#B80C09', fg: '#FFFFFF' },
  { id: 'walnut', label: 'Dark Walnut', bg: '#6B2B06', fg: '#FFFFFF' },
  { id: 'slate', label: 'Pitch Slate', bg: '#141301', fg: '#E5E7E6' },
  { id: 'forest', label: 'Nordic Forest', bg: '#1B382B', fg: '#A3E635' },
  { id: 'ocean', label: 'Deep Ocean', bg: '#0F2942', fg: '#38BDF8' },
  { id: 'minimal', label: 'Monochrome', bg: '#262626', fg: '#FFFFFF' },
];

const LIFE_AREAS = [
  { id: 'goals', label: 'Goals & Milestones', icon: Target, desc: 'Long-term horizon planning and milestone tracking' },
  { id: 'tasks', label: 'Tasks & Eisenhower', icon: CheckSquare, desc: 'Daily priority execution, subtasks, and schedule' },
  { id: 'habits', label: 'Habits & Rituals', icon: Repeat, desc: '7-day momentum matrix and streak formation' },
  { id: 'finance', label: 'Financial Velocity', icon: DollarSign, desc: 'Income, expense radar, and runway projections' },
  { id: 'fitness', label: 'Gym & Fitness', icon: Dumbbell, desc: 'Strength workouts, sets, reps, and body metrics' },
  { id: 'academics', label: 'Academics & Attendance', icon: GraduationCap, desc: 'Coursework, exams, and attendance safety buffer' },
  { id: 'career', label: 'Career & Portfolio', icon: Briefcase, desc: 'Application pipelines, projects, and skills' },
  { id: 'obsidian', label: 'Obsidian Notes Vault', icon: FileText, desc: 'Markdown knowledge vault with [[wiki-links]]' },
];

const GOAL_TEMPLATES = [
  { title: 'Complete 45m strength training 4x/week', category: 'Fitness', priority: 'high' as Priority },
  { title: 'Master Rust & High-Performance Systems', category: 'Career', priority: 'high' as Priority },
  { title: 'Save $10,000 Emergency Cash Buffer', category: 'Finance', priority: 'critical' as Priority },
  { title: 'Maintain 85%+ Academic Attendance', category: 'Academics', priority: 'critical' as Priority },
  { title: 'Ship Personal SaaS MVP Beta', category: 'Projects', priority: 'high' as Priority },
];

const HABIT_TEMPLATES = [
  { name: 'Morning sunlight & hydration (15m)', category: 'Health', frequency: 'Daily' },
  { name: '90-minute uninterrupted deep work', category: 'Focus', frequency: 'Weekdays' },
  { name: 'Read 20 pages of non-fiction', category: 'Learning', frequency: 'Daily' },
  { name: 'Evening reflection & tomorrow review', category: 'Mindset', frequency: 'Daily' },
  { name: 'Strength or mobility session (45m)', category: 'Fitness', frequency: 'Weekdays' },
];

export default function OnboardingModal() {
  const isOpen = useStore((s) => s.isOnboardingOpen);
  const setIsOpen = useStore((s) => s.setIsOnboardingOpen);
  const settings = useStore((s) => s.settings);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const addToast = useStore((s) => s.addToast);

  // Draft state initialized from localStorage if available
  const [draft, setDraft] = useState<OnboardingDraftState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return {
      step: 0, // 0 = Welcome screen, 1-6 = Wizard steps
      userName: settings.userName || 'Atharva',
      userGreeting: 'time-aware',
      userAvatar: 'brick',
      selectedLifeAreas: settings.selectedLifeAreas || [
        'goals',
        'tasks',
        'habits',
        'finance',
        'fitness',
        'academics',
        'career',
        'obsidian',
      ],
      initialGoals: [],
      initialHabits: [],
      theme: settings.theme || 'dark',
      weekStartDay: settings.weekStartDay || 'monday',
      defaultFocusDuration: settings.defaultFocusDuration || 25,
      currencySymbol: settings.currencySymbol || '$',
      reminderEnabled: settings.reminder?.enabled ?? true,
      reminderTime: settings.reminder?.time || '21:30',
    };
  });

  // Local form inputs for adding goals and habits
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Personal');
  const [newGoalPriority, setNewGoalPriority] = useState<Priority>('high');

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Daily');

  // Auto-save draft changes to localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {}
    }
  }, [draft, isOpen]);

  // Sync draft whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setDraft(JSON.parse(saved));
        } else {
          setDraft({
            step: 0,
            userName: settings.userName || 'Atharva',
            userGreeting: 'time-aware',
            userAvatar: 'brick',
            selectedLifeAreas: settings.selectedLifeAreas || [
              'goals',
              'tasks',
              'habits',
              'finance',
              'fitness',
              'academics',
              'career',
              'obsidian',
            ],
            initialGoals: [],
            initialHabits: [],
            theme: settings.theme || 'dark',
            weekStartDay: settings.weekStartDay || 'monday',
            defaultFocusDuration: settings.defaultFocusDuration || 25,
            currencySymbol: settings.currencySymbol || '$',
            reminderEnabled: settings.reminder?.enabled ?? true,
            reminderTime: settings.reminder?.time || '21:30',
          });
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateDraft = (updates: Partial<OnboardingDraftState>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (draft.step < 6) {
      updateDraft({ step: draft.step + 1 });
    }
  };

  const handleBack = () => {
    if (draft.step > 0) {
      updateDraft({ step: draft.step - 1 });
    }
  };

  const handleSkipToDashboard = () => {
    // Quick exit: completes onboarding with current settings without forcing wizard
    completeOnboarding({
      userName: draft.userName || 'Atharva',
      selectedLifeAreas: draft.selectedLifeAreas,
      theme: draft.theme,
      weekStartDay: draft.weekStartDay,
      defaultFocusDuration: draft.defaultFocusDuration,
      userAvatar: draft.userAvatar,
      userGreeting: draft.userGreeting,
      initialGoals: draft.initialGoals,
      initialHabits: draft.initialHabits,
    });
  };

  const handleFinish = async () => {
    await completeOnboarding({
      userName: draft.userName.trim() || 'Atharva',
      selectedLifeAreas: draft.selectedLifeAreas,
      theme: draft.theme,
      weekStartDay: draft.weekStartDay,
      defaultFocusDuration: draft.defaultFocusDuration,
      userAvatar: draft.userAvatar,
      userGreeting: draft.userGreeting,
      initialGoals: draft.initialGoals,
      initialHabits: draft.initialHabits,
    });
  };

  const toggleLifeArea = (id: string) => {
    const current = draft.selectedLifeAreas;
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    updateDraft({ selectedLifeAreas: next });
  };

  const addGoalFromTemplate = (tmpl: { title: string; category: string; priority: Priority }) => {
    if (draft.initialGoals.some((g) => g.title === tmpl.title)) {
      addToast({ type: 'info', title: 'Goal already added', message: tmpl.title });
      return;
    }
    updateDraft({
      initialGoals: [...draft.initialGoals, { ...tmpl }],
    });
  };

  const handleCreateCustomGoal = () => {
    if (!newGoalTitle.trim()) return;
    updateDraft({
      initialGoals: [
        ...draft.initialGoals,
        {
          title: newGoalTitle.trim(),
          category: newGoalCategory,
          priority: newGoalPriority,
        },
      ],
    });
    setNewGoalTitle('');
  };

  const removeGoal = (idx: number) => {
    updateDraft({
      initialGoals: draft.initialGoals.filter((_, i) => i !== idx),
    });
  };

  const addHabitFromTemplate = (tmpl: { name: string; category: string; frequency: string }) => {
    if (draft.initialHabits.some((h) => h.name === tmpl.name)) {
      addToast({ type: 'info', title: 'Habit already added', message: tmpl.name });
      return;
    }
    updateDraft({
      initialHabits: [...draft.initialHabits, { ...tmpl }],
    });
  };

  const handleCreateCustomHabit = () => {
    if (!newHabitName.trim()) return;
    updateDraft({
      initialHabits: [
        ...draft.initialHabits,
        {
          name: newHabitName.trim(),
          category: newHabitCategory,
          frequency: 'Daily',
        },
      ],
    });
    setNewHabitName('');
  };

  const removeHabit = (idx: number) => {
    updateDraft({
      initialHabits: draft.initialHabits.filter((_, i) => i !== idx),
    });
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(20, 19, 1, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        // Prevent accidental closing by clicking outside during wizard
        e.stopPropagation();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: draft.step === 0 ? '580px' : '720px',
          maxHeight: '90vh',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ========================================================
            HEADER: PROGRESS & CLOSE
        ======================================================== */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                fontSize: '11px',
                letterSpacing: '0.04em',
                border: '1px solid var(--palette-brick-border)',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--palette-brick)' }} />
              LIFE OS 3.0
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {draft.step === 0 ? 'First-Time Setup' : `Onboarding — Step ${draft.step} of 6`}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
            title="Close setup (you can resume anytime)"
            aria-label="Close onboarding modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Bar (Shown during Steps 1-6) */}
        {draft.step > 0 && (
          <div style={{ width: '100%', background: 'var(--bg-elevated)', height: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(draft.step / 6) * 100}%`,
                background: 'var(--palette-brick)',
                transition: 'width 0.25s ease-out',
              }}
            />
          </div>
        )}

        {/* ========================================================
            MODAL CONTENT AREA (SCROLLABLE)
        ======================================================== */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {/* ----------------------------------------------------
              STEP 0: WELCOME & OVERVIEW
          ---------------------------------------------------- */}
          {draft.step === 0 && (
            <div style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--palette-brick-subtle)',
                  color: 'var(--palette-brick)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid var(--palette-brick-border)',
                }}
              >
                <Sparkles size={28} />
              </div>

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: '0 0 10px',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to LIFE OS
              </h2>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                }}
              >
                Your sovereign command center. LIFE OS unites daily priorities, long-term goals, financial velocity, health protocols, and your intellectual knowledge vault in one fast, local-first workspace.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  textAlign: 'left',
                  margin: '0 0 32px',
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Shield size={16} color="var(--palette-brick)" />
                  <span>100% Local-First & Private</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Zap size={16} color="var(--palette-brick)" />
                  <span>0ms IndexedDB Latency</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <Target size={16} color="var(--palette-brick)" />
                  <span>Rule of 3 Focus Triage</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <FileText size={16} color="var(--palette-brick)" />
                  <span>Obsidian [[Wiki-Links]] Vault</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px', margin: '0 auto' }}>
                <button
                  onClick={() => updateDraft({ step: 1 })}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '10px',
                  }}
                >
                  <span>Begin Guided Setup (3 Min)</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleSkipToDashboard}
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    borderRadius: '10px',
                  }}
                >
                  Explore Dashboard Directly
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 1: PERSONAL INTRODUCTION
          ---------------------------------------------------- */}
          {draft.step === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Step 1 of 6
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                  Personal Identity & Greeting
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  How should LIFE OS address you across your morning briefs and daily reviews?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Preferred Display Name *
                  </label>
                  <input
                    type="text"
                    value={draft.userName}
                    onChange={(e) => updateDraft({ userName: e.target.value })}
                    placeholder="Enter your name (e.g. Atharva)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>
                    Choose Avatar Emblem
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = draft.userAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => updateDraft({ userAvatar: av.id })}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                            border: `2px solid ${isSelected ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: av.bg,
                              color: av.fg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            {(draft.userName.trim() || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {av.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Greeting Style
                  </label>
                  <select
                    value={draft.userGreeting}
                    onChange={(e) => updateDraft({ userGreeting: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="time-aware">Dynamic Time-Aware (Good morning, Good afternoon)</option>
                    <option value="direct">Direct & Focused ("Welcome back, {draft.userName}")</option>
                    <option value="stoic">Stoic & Minimal ("Command Center Active")</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 2: CHOOSE LIFE AREAS
          ---------------------------------------------------- */}
          {draft.step === 2 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Step 2 of 6
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                  Choose Your Core Life Areas
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Select the domains you want prioritized in your sidebar and daily dashboard. All modules remain accessible anytime.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {LIFE_AREAS.map((area) => {
                  const isSelected = draft.selectedLifeAreas.includes(area.id);
                  const Icon = area.icon;
                  return (
                    <div
                      key={area.id}
                      onClick={() => toggleLifeArea(area.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                        border: `1px solid ${isSelected ? 'var(--palette-brick-border)' : 'var(--border-default)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? 'var(--palette-brick)' : 'var(--bg-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {area.label}
                          </span>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: `1.5px solid ${isSelected ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                              background: isSelected ? 'var(--palette-brick)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontSize: '11px',
                            }}
                          >
                            {isSelected && <Check size={12} />}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {area.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {draft.selectedLifeAreas.length} of {LIFE_AREAS.length} areas active
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      selectedLifeAreas:
                        draft.selectedLifeAreas.length === LIFE_AREAS.length
                          ? ['goals', 'tasks']
                          : LIFE_AREAS.map((a) => a.id),
                    })
                  }
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  {draft.selectedLifeAreas.length === LIFE_AREAS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 3: SET INITIAL GOALS (OPTIONAL)
          ---------------------------------------------------- */}
          {draft.step === 3 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Step 3 of 6 · Optional
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                  Define Your Initial Ambitions
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Give your quarter direction. Select an example goal or define your own. (You can skip this step).
                </p>
              </div>

              {/* Quick Template Chips */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Tap to Add an Example Goal:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {GOAL_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addGoalFromTemplate(tmpl)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '14px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        fontSize: '11.5px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={11} color="var(--palette-brick)" />
                      <span>{tmpl.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Goal Form */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <input
                  type="text"
                  placeholder="Or write custom goal (e.g. Run 10km in under 50m)..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCustomGoal();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateCustomGoal}
                  disabled={!newGoalTitle.trim()}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              {/* Added Goals List */}
              {draft.initialGoals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {draft.initialGoals.map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={15} color="var(--palette-brick)" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{g.title}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: 'var(--palette-brick-subtle)',
                            color: 'var(--palette-brick)',
                            fontWeight: 600,
                          }}
                        >
                          {g.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGoal(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Remove goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No initial goals added yet. You can pick an example above or skip to the next step.
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 4: BUILD A SIMPLE ROUTINE (OPTIONAL)
          ---------------------------------------------------- */}
          {draft.step === 4 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Step 4 of 6 · Optional
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                  Anchor Your Daily Rituals
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Small actions create lasting change. Choose 1 or 2 high-leverage habits to track.
                </p>
              </div>

              {/* Template Chips */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Tap to Add an Example Habit:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {HABIT_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addHabitFromTemplate(tmpl)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '14px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        fontSize: '11.5px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Plus size={11} color="var(--palette-walnut)" />
                      <span>{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Habit Input */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <input
                  type="text"
                  placeholder="Or define custom habit (e.g. 10m morning meditation)..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCustomHabit();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateCustomHabit}
                  disabled={!newHabitName.trim()}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              {/* Added Habits List */}
              {draft.initialHabits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {draft.initialHabits.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Repeat size={15} color="var(--palette-walnut)" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{h.name}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: 'var(--palette-walnut-subtle)',
                            color: 'var(--palette-walnut)',
                            fontWeight: 600,
                          }}
                        >
                          {h.category} · {h.frequency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHabit(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Remove habit"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No habits added yet. Select a template above or click continue to proceed.
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 5: CONFIGURE PREFERENCES
          ---------------------------------------------------- */}
          {draft.step === 5 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--palette-brick)' }}>
                  Step 5 of 6
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                  Preferences & Environment
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Fine-tune your workspace canvas, weekly calendar start, and focus defaults.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Theme Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px' }}>
                    Visual Canvas Theme
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => updateDraft({ theme: 'dark' })}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: '#141301',
                        border: `2px solid ${draft.theme === 'dark' ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                        color: '#E5E7E6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Moon size={18} color="var(--palette-brick)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>Pitch Black (Dark)</div>
                        <div style={{ fontSize: '11px', color: '#B7B5B3' }}>High contrast focus</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateDraft({ theme: 'light' })}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: '#E5E7E6',
                        border: `2px solid ${draft.theme === 'light' ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                        color: '#141301',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <Sun size={18} color="#B80C09" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>Alabaster Grey (Light)</div>
                        <div style={{ fontSize: '11px', color: '#6B2B06' }}>Warm editorial canvas</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Week Starting Day */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Week Calendar Start Day
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => updateDraft({ weekStartDay: 'monday' })}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: draft.weekStartDay === 'monday' ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${draft.weekStartDay === 'monday' ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                        color: 'var(--text-primary)',
                        fontSize: '12.5px',
                        fontWeight: draft.weekStartDay === 'monday' ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      Monday (ISO Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft({ weekStartDay: 'sunday' })}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: draft.weekStartDay === 'sunday' ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${draft.weekStartDay === 'sunday' ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                        color: 'var(--text-primary)',
                        fontSize: '12.5px',
                        fontWeight: draft.weekStartDay === 'sunday' ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      Sunday
                    </button>
                  </div>
                </div>

                {/* Focus Duration */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Default Focus Sanctuary Duration
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[25, 45, 50].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateDraft({ defaultFocusDuration: mins })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          background: draft.defaultFocusDuration === mins ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                          border: `1.5px solid ${draft.defaultFocusDuration === mins ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                          color: 'var(--text-primary)',
                          fontSize: '12.5px',
                          fontWeight: draft.defaultFocusDuration === mins ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency Symbol */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Financial Ledger Currency
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['$', '€', '£', '₹', '¥'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => updateDraft({ currencySymbol: sym })}
                        style={{
                          width: '42px',
                          height: '38px',
                          borderRadius: '8px',
                          background: draft.currencySymbol === sym ? 'var(--palette-brick-subtle)' : 'var(--bg-elevated)',
                          border: `1.5px solid ${draft.currencySymbol === sym ? 'var(--palette-brick)' : 'var(--border-default)'}`,
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STEP 6: COMPLETION & PERSONALIZED SUMMARY
          ---------------------------------------------------- */}
          {draft.step === 6 && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--status-success-bg, rgba(34, 197, 94, 0.15))',
                  color: 'var(--status-success, #22C55E)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Check size={28} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                You're Ready for Mastery, {draft.userName.trim() || 'Champion'}!
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px' }}>
                Your sovereign LIFE OS command center has been personalized according to your preferences.
              </p>

              {/* Summary Review Card */}
              <div
                style={{
                  textAlign: 'left',
                  padding: '18px 20px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Display Name:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{draft.userName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active Life Areas:</span>
                  <span style={{ fontWeight: 700, color: 'var(--palette-brick)' }}>{draft.selectedLifeAreas.length} Modules</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Initial Ambitions:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {draft.initialGoals.length > 0 ? `${draft.initialGoals.length} Goals Created` : 'Clean Slate'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Routine Habits:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {draft.initialHabits.length > 0 ? `${draft.initialHabits.length} Habits Tracked` : 'Clean Slate'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Theme & Duration:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {draft.theme === 'dark' ? 'Pitch Black' : 'Alabaster Grey'} · {draft.defaultFocusDuration}m Focus
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(184, 12, 9, 0.35)',
                }}
              >
                <span>Launch Daily Command Center</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            FOOTER CONTROLS (BACK / CONTINUE / SKIP)
        ======================================================== */}
        {draft.step > 0 && draft.step < 6 && (
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(draft.step === 3 || draft.step === 4) && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                >
                  Skip Step
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={draft.step === 1 && !draft.userName.trim()}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 18px',
                }}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
