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
      style={{ zIndex: 1200 }}
      onClick={handleSkipNow}
    >
      <div
        className="modal"
        style={{ maxWidth: '520px', width: '92%', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Clean, Minimal Welcome Screen */}
        {step === 'welcome' && (
          <div style={{ padding: '36px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="sidebar-brand-mark"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                fontSize: '24px',
                marginBottom: '20px',
              }}
            >
              L
            </div>

            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 10px 0',
                letterSpacing: '-0.025em',
              }}
            >
              Welcome to LIFE OS 3.0
            </h1>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                margin: '0 0 28px 0',
                lineHeight: 1.55,
                maxWidth: '400px',
              }}
            >
              Your private, local-first personal operating system. Build routines, track academics, and manage focus on your own terms.
            </p>

            {/* 2 Primary Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep('setup')}
                style={{
                  padding: '11px 20px',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-sm)',
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
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
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
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Workspace Preferences
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  All settings are optional and can be changed in Settings anytime.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={handleSkipNow}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  What should we call you? (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="Your preferred name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
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
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12.5px',
                          fontWeight: isSelected ? 600 : 500,
                          border: isSelected
                            ? '1px solid var(--accent-primary)'
                            : '1px solid var(--border-default)',
                          background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all var(--spring-fast)',
                        }}
                      >
                        <Icon size={13} color={isSelected ? 'var(--accent-primary)' : 'currentColor'} />
                        {area.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Week Starts On
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setWeekStartDay('monday')}
                      className={`btn btn-sm ${weekStartDay === 'monday' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                    >
                      Monday
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekStartDay('sunday')}
                      className={`btn btn-sm ${weekStartDay === 'sunday' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }}
                    >
                      Sunday
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Evening Reminder
                  </label>
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`btn btn-sm ${reminderEnabled ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%' }}
                  >
                    <Bell size={13} />
                    {reminderEnabled ? 'On (9:30 PM)' : 'Off'}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSkipNow}
              >
                Skip for now
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFinishSetup}
              >
                Enter LIFE OS <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
