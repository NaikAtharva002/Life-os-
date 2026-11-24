import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Trees,
  CloudRain,
  Wind,
  Compass,
} from 'lucide-react';
import useStore from '../store/useStore';
import { getPhoto } from '../utils/photoAssets';
import ContextualTipBanner from '../components/ContextualTipBanner';

export default function FocusModePage() {
  const setActiveView = useStore((s) => s.setActiveView);
  const tasks = useStore((s) => s.tasks);
  const completeTask = useStore((s) => s.completeTask);
  const activeFocusTaskId = useStore((s) => s.activeFocusTaskId);
  const recordTaskFocusDuration = useStore((s) => s.recordTaskFocusDuration);
  const addToast = useStore((s) => s.addToast);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);

  // Selected Task
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    activeFocusTaskId || pendingTasks[0]?.id || ''
  );

  // Sync if activeFocusTaskId changes
  useEffect(() => {
    if (activeFocusTaskId) {
      setSelectedTaskId(activeFocusTaskId);
      const target = tasks.find((t) => t.id === activeFocusTaskId);
      if (target?.estimatedDuration) {
        setSessionMinutes(target.estimatedDuration);
        setSecondsRemaining(target.estimatedDuration * 60);
      }
    }
  }, [activeFocusTaskId, tasks]);

  // Nature Background Choices
  const backgroundOptions = [
    { id: 'alpine', name: 'Alpine Pines', photo: getPhoto('focus-alpine').path },
    { id: 'forest', name: 'Sunlit Redwood', photo: getPhoto('focus-forest').path },
    { id: 'stream', name: 'Mountain Stream', photo: getPhoto('focus-stream').path },
  ];
  const [selectedBg, setSelectedBg] = useState(backgroundOptions[0].id);

  // Focus Timer
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
      if (selectedTaskId) {
        recordTaskFocusDuration(selectedTaskId, sessionMinutes);
        addToast({
          type: 'success',
          title: 'Focus Sprint Completed!',
          message: `Logged ${sessionMinutes}m focused work time on task.`,
        });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const selectDuration = (mins: number) => {
    setIsRunning(false);
    setSessionMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(sessionMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentBgUrl = backgroundOptions.find((b) => b.id === selectedBg)?.photo || backgroundOptions[0].photo;
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div
      className="animate-in"
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--toolbar-height) - 48px)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        backgroundImage: `url(${currentBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px',
        boxShadow: 'var(--shadow-photo)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Immersive Deep Nature Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(20, 19, 1, 0.50) 0%, rgba(20, 19, 1, 0.92) 100%)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Top Bar Controls */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <button
          onClick={() => setActiveView('dashboard')}
          className="btn btn-secondary"
          style={{
            background: 'rgba(20, 19, 1, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#f4f6f4',
            border: '1px solid var(--border-default)',
            fontSize: '12.5px',
          }}
        >
          <ArrowLeft size={14} /> Exit to Dashboard
        </button>

        {/* Ambient background switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(20, 19, 1, 0.85)',
            padding: '4px',
            borderRadius: '24px',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {backgroundOptions.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg.id)}
              style={{
                border: 'none',
                background: selectedBg === bg.id ? 'var(--accent-primary)' : 'transparent',
                color: selectedBg === bg.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '11px',
                padding: '4px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contextual Progressive Guidance Tip */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px', margin: '0 auto 16px', width: '100%' }}>
        <ContextualTipBanner
          tipId="focus_intro"
          icon={Compass}
          title="Focus Sanctuary & Pomodoro Protocol"
          description="Immerse in uninterrupted deep work. Pair your session with ambient nature horizons, select an active task objective, and let the timer hold your focus."
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Center Hero Timer */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Selected focus objective pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '30px',
            background: 'rgba(20, 19, 1, 0.85)',
            border: '1px solid var(--palette-brick-border)',
            backdropFilter: 'blur(10px)',
            marginBottom: '20px',
            maxWidth: '480px',
          }}
        >
          <Sparkles size={14} color="var(--palette-brick)" />
          <span style={{ fontSize: '13px', color: '#f4f6f4', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Focusing on: <strong style={{ color: 'var(--palette-brick)' }}>{currentTask?.title || 'Single High-Leverage Priority'}</strong>
          </span>
        </div>

        {/* Clock digits */}
        <div
          className="tabular font-editorial"
          style={{
            fontSize: '96px',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            textShadow: '0 8px 32px rgba(0,0,0,0.7)',
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          {formatTime(secondsRemaining)}
        </div>

        {/* Duration presets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { mins: 25, label: '25m Focus' },
            { mins: 50, label: '50m Deep Work' },
            { mins: 90, label: '90m Ultradian' },
          ].map((preset) => (
            <button
              key={preset.mins}
              onClick={() => selectDuration(preset.mins)}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: sessionMinutes === preset.mins ? 'var(--palette-brick-subtle)' : 'rgba(20, 19, 1, 0.65)',
                color: sessionMinutes === preset.mins ? 'var(--palette-brick)' : '#cbd5e1',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Big Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              borderRadius: '40px',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            {isRunning ? 'Pause Session' : 'Begin Focus Flow'}
          </button>

          <button
            onClick={resetTimer}
            className="btn btn-secondary"
            style={{
              padding: '12px',
              borderRadius: '50%',
              background: 'rgba(20, 19, 1, 0.85)',
              border: '1px solid var(--border-default)',
              color: '#ffffff',
            }}
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary"
            style={{
              padding: '12px',
              borderRadius: '50%',
              background: 'rgba(8, 20, 16, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: soundEnabled ? 'var(--accent-light)' : 'var(--text-muted)',
            }}
            title={soundEnabled ? 'Ambient Rain Playing' : 'Mute Ambient Audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom Task Quick Switcher */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(8, 20, 16, 0.85)',
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Queue Next Objective:
          </span>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            style={{
              background: 'var(--forest-surface)',
              border: '1px solid var(--border-default)',
              color: '#ffffff',
              fontSize: '12.5px',
              padding: '6px 12px',
              borderRadius: '8px',
              maxWidth: '320px',
            }}
          >
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.priority})
              </option>
            ))}
          </select>
        </div>

        {currentTask && (
          <button
            onClick={() => {
              completeTask(currentTask.id);
            }}
            className="btn btn-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-light)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <CheckCircle2 size={13} /> Mark Task Done &amp; Continue
          </button>
        )}
      </div>
    </div>
  );
}
