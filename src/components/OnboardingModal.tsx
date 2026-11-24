import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  X,
  Target,
  CheckSquare,
  Repeat,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Bell,
  Calendar,
  Check,
} from 'lucide-react';
import useStore from '../store/useStore';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const LIFE_AREAS = [
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'career', label: 'Career', icon: Briefcase },
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<'welcome' | 'setup'>('welcome');
  const [userName, setUserName] = useState(settings.userName || '');
  const [selectedLifeAreas, setSelectedLifeAreas] = useState<string[]>(
    settings.selectedLifeAreas && settings.selectedLifeAreas.length > 0
      ? settings.selectedLifeAreas
      : ['goals', 'tasks', 'habits', 'finance', 'fitness', 'academics', 'career']
  );
  const [weekStartDay, setWeekStartDay] = useState<'monday' | 'sunday'>(
    settings.weekStartDay || 'monday'
  );
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminder?.enabled || false);

  const isModalOpen = isOpen !== undefined ? isOpen : (!settings.onboardingCompleted && !dismissed);
  if (!isModalOpen) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) onClose();
  };

  const handleSkipNow = async () => {
    await updateSettings({ onboardingCompleted: true });
    try {
      localStorage.setItem('lifeos_onboarding_completed', 'true');
    } catch {
      // ignore
    }
    handleDismiss();
  };

  const handleFinishSetup = async () => {
    await updateSettings({
      userName: userName.trim(),
      selectedLifeAreas,
      weekStartDay,
      reminder: {
        ...settings.reminder,
        enabled: reminderEnabled,
      },
      onboardingCompleted: true,
    });
    try {
      localStorage.setItem('lifeos_onboarding_completed', 'true');
    } catch {
      // ignore
    }
    handleDismiss();
  };

  const toggleLifeArea = (id: string) => {
    if (selectedLifeAreas.includes(id)) {
      if (selectedLifeAreas.length > 1) {
        setSelectedLifeAreas(selectedLifeAreas.filter((a) => a !== id));
      }
    } else {
      setSelectedLifeAreas([...selectedLifeAreas, id]);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 1200,
        backgroundColor: 'rgba(16, 14, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={handleSkipNow}
    >
      <div
        className="modal"
        style={{
          maxWidth: '520px',
          width: '92%',
          borderRadius: '16px',
          background: 'var(--bg-card, #241C15)',
          border: '1px solid var(--border-default, #49382A)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Clean, Minimal Welcome Screen */}
        {step === 'welcome' && (
          <div style={{ padding: '36px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Monogram emblem */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'var(--accent-primary, #E32620)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 700,
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(227, 38, 32, 0.35)',
              }}
            >
              Ω
            </div>

            <h1
              className="font-editorial"
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F1E9)',
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome to your LIFE OS.
            </h1>

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary, #A69B8E)',
                margin: '0 0 28px 0',
                lineHeight: 1.5,
                maxWidth: '400px',
              }}
            >
              Your personal space to organize everything that matters to you. Build your life on your own terms.
            </p>

            {/* 2 Primary Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep('setup')}
                style={{
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                Set up my workspace <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSkipNow}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.86rem',
                  color: 'var(--text-muted, #756B61)',
                  borderRadius: '10px',
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Short, Optional Workspace Preferences */}
        {step === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-default, #49382A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #F5F1E9)' }}>
                  Workspace Preferences
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #756B61)' }}>
                  All settings are optional and can be changed in Settings anytime.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={handleSkipNow}
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Preferred Name */}
              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                  What should we call you? (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Your preferred name or alias"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Life Areas of Interest */}
              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                  Areas of focus you want active:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {LIFE_AREAS.map((area) => {
                    const isSelected = selectedLifeAreas.includes(area.id);
                    const Icon = area.icon;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleLifeArea(area.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 600 : 500,
                          border: isSelected
                            ? '1px solid var(--accent-primary, #E32620)'
                            : '1px solid var(--border-default, #49382A)',
                          background: isSelected
                            ? 'rgba(227, 38, 32, 0.12)'
                            : 'var(--bg-secondary, #241C15)',
                          color: isSelected ? 'var(--text-primary, #F5F1E9)' : 'var(--text-secondary, #A69B8E)',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <Icon size={13} color={isSelected ? 'var(--accent-primary, #E32620)' : 'currentColor'} />
                        {area.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Week Start */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Calendar Week Starts On
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setWeekStartDay('monday')}
                      className={`btn btn-sm ${weekStartDay === 'monday' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.8rem' }}
                    >
                      Monday
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekStartDay('sunday')}
                      className={`btn btn-sm ${weekStartDay === 'sunday' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.8rem' }}
                    >
                      Sunday
                    </button>
                  </div>
                </div>

                {/* Evening Reminder */}
                <div>
                  <label className="label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Evening Review Reminder
                  </label>
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`btn btn-sm ${reminderEnabled ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Bell size={13} />
                    {reminderEnabled ? 'Reminder On (9:30 PM)' : 'Reminder Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-default, #49382A)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-elevated, #302419)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSkipNow}
                style={{ fontSize: '0.82rem', color: 'var(--text-muted, #756B61)' }}
              >
                Skip for now
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinishSetup}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                }}
              >
                Enter My LIFE OS <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
