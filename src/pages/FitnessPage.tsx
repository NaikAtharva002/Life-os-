import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { todayLocal } from '../lib/dates';
import {
  Dumbbell,
  Calendar,
  Plus,
  Scale,
  Flame,
  CheckCircle2,
  Trash2,
  Activity,
  Award,
} from 'lucide-react';
import type { WorkoutSplit, ExerciseItem, WorkoutSet, LoggedExercise } from '../types';
import { getPhoto } from '../utils/photoAssets';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';

export default function FitnessPage() {
  const exercises = useStore((s) => s.exercises);
  const workoutSessions = useStore((s) => s.workoutSessions);
  const bodyMetrics = useStore((s) => s.bodyMetrics);
  const fitnessGoals = useStore((s) => s.fitnessGoals);
  const addWorkoutSession = useStore((s) => s.addWorkoutSession);
  const deleteWorkoutSession = useStore((s) => s.deleteWorkoutSession);
  const addExercise = useStore((s) => s.addExercise);
  const addBodyMetric = useStore((s) => s.addBodyMetric);
  const deleteBodyMetric = useStore((s) => s.deleteBodyMetric);
  const addFitnessGoal = useStore((s) => s.addFitnessGoal);
  const toggleFitnessGoal = useStore((s) => s.toggleFitnessGoal);

  const todayStr = todayLocal();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'workouts' | 'metrics' | 'exercises' | 'goals'>('workouts');

  // Workout Logger Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [sessionSplit, setSessionSplit] = useState<WorkoutSplit>('Upper');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionDate, setSessionDate] = useState(todayStr);
  const [sessionNotes, setSessionNotes] = useState('');
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);

  // Exercise selection inside logger
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  // Add Exercise Modal
  const [showExModal, setShowExModal] = useState(false);
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState<ExerciseItem['category']>('Chest');
  const [exMuscle, setExMuscle] = useState('');
  const [exEquipment, setExEquipment] = useState('Barbell');

  // Add Metric Modal
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [metricDate, setMetricDate] = useState(todayStr);
  const [metricWeight, setMetricWeight] = useState('');
  const [metricBf, setMetricBf] = useState('');
  const [metricWaist, setMetricWaist] = useState('');
  const [metricChest, setMetricChest] = useState('');
  const [metricArms, setMetricArms] = useState('');

  // Add Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalMetric, setGoalMetric] = useState('Bench Press');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalUnit, setGoalUnit] = useState('kg');

  // Derived metrics
  const latestMetric = useMemo(() => {
    return [...bodyMetrics].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [bodyMetrics]);

  const totalWorkoutsThisMonth = useMemo(() => {
    const curMonth = todayStr.substring(0, 7);
    return workoutSessions.filter((ws) => ws.date.startsWith(curMonth)).length;
  }, [workoutSessions, todayStr]);

  const totalVolumeAllTime = useMemo(() => {
    return workoutSessions.reduce((acc, ws) => acc + (ws.totalVolumeKg || 0), 0);
  }, [workoutSessions]);

  // Handler: Add exercise row in active workout
  const handleAddExerciseToSession = () => {
    const ex = exercises.find((e) => e.id === selectedExerciseId);
    if (!ex) return;
    setLoggedExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [
          { setNumber: 1, reps: 8, weightKg: 60, isCompleted: true },
          { setNumber: 2, reps: 8, weightKg: 60, isCompleted: true },
          { setNumber: 3, reps: 8, weightKg: 60, isCompleted: true },
        ],
      },
    ]);
    setSelectedExerciseId('');
  };

  // Handler: Update set in active workout
  const handleUpdateSet = (exIndex: number, setIndex: number, field: 'reps' | 'weightKg', val: number) => {
    setLoggedExercises((prev) => {
      const copy = [...prev];
      copy[exIndex].sets[setIndex][field] = val;
      return copy;
    });
  };

  // Handler: Add set to exercise
  const handleAddSet = (exIndex: number) => {
    setLoggedExercises((prev) => {
      const copy = [...prev];
      const prevSet = copy[exIndex].sets[copy[exIndex].sets.length - 1];
      copy[exIndex].sets.push({
        setNumber: copy[exIndex].sets.length + 1,
        reps: prevSet ? prevSet.reps : 8,
        weightKg: prevSet ? prevSet.weightKg : 50,
        isCompleted: true,
      });
      return copy;
    });
  };

  // Handler: Save workout
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    let volume = 0;
    loggedExercises.forEach((le) => {
      le.sets.forEach((s) => {
        if (s.isCompleted) volume += s.reps * s.weightKg;
      });
    });

    await addWorkoutSession({
      title: sessionTitle || `${sessionSplit} Day Session`,
      splitType: sessionSplit,
      date: sessionDate,
      durationMinutes: parseInt(sessionDuration) || 60,
      exercises: loggedExercises,
      totalVolumeKg: volume,
      notes: sessionNotes,
    });

    setLoggedExercises([]);
    setSessionTitle('');
    setShowLogModal(false);
  };

  // Handler: Save Exercise
  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName) return;
    await addExercise({
      name: exName,
      category: exCategory,
      targetMuscle: exMuscle || exCategory,
      equipment: exEquipment,
    });
    setExName('');
    setExMuscle('');
    setShowExModal(false);
  };

  // Handler: Save Metric
  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricWeight || isNaN(Number(metricWeight))) return;
    await addBodyMetric({
      date: metricDate,
      weightKg: parseFloat(metricWeight),
      bodyFatPercentage: metricBf ? parseFloat(metricBf) : undefined,
      waistCm: metricWaist ? parseFloat(metricWaist) : undefined,
      chestCm: metricChest ? parseFloat(metricChest) : undefined,
      armsCm: metricArms ? parseFloat(metricArms) : undefined,
    });
    setMetricWeight('');
    setMetricBf('');
    setShowMetricModal(false);
  };

  // Handler: Save Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget || isNaN(Number(goalTarget))) return;
    await addFitnessGoal({
      title: goalTitle,
      metric: goalMetric,
      targetValue: parseFloat(goalTarget),
      currentValue: parseFloat(goalCurrent) || 0,
      unit: goalUnit,
    });
    setGoalTitle('');
    setGoalTarget('');
    setShowGoalModal(false);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. EDITORIAL PHOTOGRAPHIC HERO SECTION */}
      <section
        className="editorial-hero"
        style={{
          minHeight: '220px',
          backgroundImage: `url(${getPhoto('gym-hero').path})`,
          backgroundPosition: 'center 35%',
        }}
      >
        <div className="editorial-hero-scrim" />

        <div className="editorial-hero-content" style={{ padding: '24px 32px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-light)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              Strength &amp; Conditioning
            </span>
            <h1
              className="font-editorial"
              style={{
                fontSize: '32px',
                fontWeight: 500,
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Progressive Overload &amp; Body Architecture
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', maxWidth: '540px' }}>
              Track weights, session volumes, hypertrophy splits, and body composition.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowMetricModal(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(20, 19, 1, 0.85)', backdropFilter: 'blur(8px)', color: '#FFFFFF', borderColor: 'var(--border-default)' }}
            >
              <Scale size={15} /> Log Weight
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Plus size={15} /> Log Workout
            </button>
          </div>
        </div>
      </section>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="fitness_intro"
        icon={Dumbbell}
        title="Workout Logging & Progressive Overload"
        description="Record sets, reps, and volume load across push, pull, and leg sessions. Track body weight and composition trends over time."
        actionText="Log Workout"
        onAction={() => setShowLogModal(true)}
        style={{ marginBottom: '14px' }}
      />

      {/* Athletic Training Status Ribbon */}
      <div className="summary-strip">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Weight:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {latestMetric ? `${latestMetric.weightKg} kg` : 'None'}
          </span>
          {latestMetric?.bodyFatPercentage && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="tabular">
              ({latestMetric.bodyFatPercentage}% BF)
            </span>
          )}
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Workouts:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {totalWorkoutsThisMonth} / 16 sessions
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cumulative Load:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {(totalVolumeAllTime / 1000).toFixed(1)}k kg
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Strength Milestones:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {fitnessGoals.filter((g) => g.isAchieved).length} / {fitnessGoals.length}
          </span>
        </span>
      </div>

      {/* Tabs */}
      <div className="responsive-tabs-bar" style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-default)', maxWidth: '100%', overflowX: 'auto' }}>
        {[
          { id: 'workouts', label: 'Workout Sessions' },
          { id: 'metrics', label: 'Body Metrics & Trajectory' },
          { id: 'goals', label: 'Strength Milestones' },
          { id: 'exercises', label: 'Exercise Library' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              border: 'none',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.12s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WORKOUT SESSIONS */}
      {activeTab === 'workouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workoutSessions.length === 0 ? (
            <div className="card" style={{ padding: '36px 20px' }}>
              <EmptyState
                illustration="fitness"
                badge="Clean Slate"
                title="Start building your fitness history."
                description="Record strength training, cardio, or athletic recovery sessions to track volume and progressive overload."
                action={
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowLogModal(true)}
                  >
                    <Plus size={15} /> Log your first workout
                  </button>
                }
              />
            </div>
          ) : (
            workoutSessions.map((ws) => (
              <div
                key={ws.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  background: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--panel-shadow)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {ws.splitType} SPLIT
                      </span>
                      <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {ws.title}
                      </h2>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '10px' }}>
                      <span className="tabular">{ws.date}</span>
                      <span>·</span>
                      <span className="tabular">{ws.durationMinutes} min</span>
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }} className="tabular">
                        Load: {ws.totalVolumeKg?.toLocaleString()} kg
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteWorkoutSession(ws.id)}
                    className="btn btn-ghost"
                    style={{ padding: '4px', color: 'var(--text-muted)', height: '26px', width: '26px' }}
                    title="Delete workout log"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {ws.notes && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-subtle)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      fontStyle: 'italic',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    "{ws.notes}"
                  </div>
                )}

                {/* Exercises in Session */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {ws.exercises?.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-subtle)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        {ex.exerciseName}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {ex.sets.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <span>Set {s.setNumber}:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular">
                              {s.reps} reps × {s.weightKg} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: METRICS & WEIGHT TREND */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          
          {/* Trend Chart Card */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Weight Progress Trajectory</h2>
            
            {/* SVG Line Graph */}
            {bodyMetrics.length > 1 ? (
              <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 10px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                {bodyMetrics
                  .slice(-8)
                  .map((bm, idx) => {
                    const minW = Math.min(...bodyMetrics.map((m) => m.weightKg)) - 1;
                    const maxW = Math.max(...bodyMetrics.map((m) => m.weightKg)) + 1;
                    const heightPct = ((bm.weightKg - minW) / (maxW - minW || 1)) * 80 + 10;

                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>
                          {bm.weightKg}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '32px',
                            height: `${heightPct}%`,
                            background: 'var(--text-primary)',
                            borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                            transition: 'height 0.2s ease',
                          }}
                        />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {bm.date.substring(5)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Need at least 2 weight logs to plot trajectory.
              </div>
            )}
          </div>

          {/* Metric Log History */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Measurement History</h2>
              <button onClick={() => setShowMetricModal(true)} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                + Record Entry
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bodyMetrics.map((bm) => (
                <div
                  key={bm.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {bm.weightKg} kg
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '10px' }}>
                      <span>{bm.date}</span>
                      {bm.bodyFatPercentage && <span>• {bm.bodyFatPercentage}% BF</span>}
                      {bm.waistCm && <span>• Waist: {bm.waistCm}cm</span>}
                      {bm.chestCm && <span>• Chest: {bm.chestCm}cm</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBodyMetric(bm.id)}
                    className="btn btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FITNESS GOALS */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowGoalModal(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> New Fitness Target
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {fitnessGoals.map((fg) => {
              const progress = Math.min(100, Math.round((fg.currentValue / fg.targetValue) * 100));
              return (
                <div
                  key={fg.id}
                  className="card"
                  style={{
                    padding: '18px 20px',
                    background: 'var(--bg-card)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{fg.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Metric: {fg.metric}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFitnessGoal(fg.id)}
                      className="btn btn-ghost"
                      style={{ padding: '4px', color: fg.isAchieved ? 'var(--success)' : 'var(--text-muted)' }}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>

                  <div style={{ height: '7px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', margin: '12px 0 8px 0' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: fg.isAchieved ? 'var(--success)' : 'var(--accent)',
                        borderRadius: '10px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Current: {fg.currentValue} {fg.unit}</span>
                    <span style={{ fontWeight: 700 }}>Target: {fg.targetValue} {fg.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: EXERCISE LIBRARY */}
      {activeTab === 'exercises' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Standard and custom movements categorized by target biomechanics.
            </div>
            <button onClick={() => setShowExModal(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Add Exercise
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="card"
                style={{
                  padding: '16px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {ex.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      fontWeight: 500,
                    }}
                  >
                    {ex.category}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Target: {ex.targetMuscle} • Equipment: {ex.equipment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: LOG WORKOUT SESSION */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px 0' }}>Log Workout Session</h2>
            <form onSubmit={handleSaveWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Split Category</label>
                  <select
                    value={sessionSplit}
                    onChange={(e) => setSessionSplit(e.target.value as any)}
                    className="input"
                  >
                    <option value="Push">Push (Chest/Shoulders/Triceps)</option>
                    <option value="Pull">Pull (Back/Biceps/Rear Delts)</option>
                    <option value="Legs">Legs (Quads/Hamstrings/Calves)</option>
                    <option value="Upper">Upper Body</option>
                    <option value="Lower">Lower Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Cardio">Cardio & Conditioning</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Session Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Heavy Upper Hypertrophy"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Add Exercise Selector */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <label className="label" style={{ marginBottom: '8px' }}>Add Movements to Session</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="input"
                    style={{ flex: 1 }}
                  >
                    <option value="">Select exercise...</option>
                    {exercises.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.category})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddExerciseToSession}
                    disabled={!selectedExerciseId}
                    className="btn btn-secondary"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Logged Exercise Table */}
              {loggedExercises.map((le, exIdx) => (
                <div key={exIdx} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{le.exerciseName}</span>
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="btn btn-ghost"
                      style={{ fontSize: '11px', color: 'var(--accent)' }}
                    >
                      + Add Set
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {le.sets.map((s, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                        <span style={{ minWidth: '45px', color: 'var(--text-muted)' }}>Set {s.setNumber}</span>
                        <input
                          type="number"
                          value={s.reps}
                          onChange={(e) => handleUpdateSet(exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="input"
                          style={{ width: '80px', padding: '4px 8px' }}
                          title="Reps"
                        />
                        <span style={{ color: 'var(--text-muted)' }}>reps ×</span>
                        <input
                          type="number"
                          step="0.5"
                          value={s.weightKg}
                          onChange={(e) => handleUpdateSet(exIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                          className="input"
                          style={{ width: '90px', padding: '4px 8px' }}
                          title="Weight (kg)"
                        />
                        <span style={{ color: 'var(--text-muted)' }}>kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="label">Session Notes / Insights</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Great explosive power on bench press. Good recovery."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Workout Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WEIGHT & BODY METRIC */}
      {showMetricModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Record Weight & Measurements</h2>
            <form onSubmit={handleSaveMetric} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={metricDate}
                  onChange={(e) => setMetricDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Bodyweight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="75.5"
                    value={metricWeight}
                    onChange={(e) => setMetricWeight(e.target.value)}
                    className="input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Body Fat % (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="14.0"
                    value={metricBf}
                    onChange={(e) => setMetricBf(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="label">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="80"
                    value={metricWaist}
                    onChange={(e) => setMetricWaist(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="104"
                    value={metricChest}
                    onChange={(e) => setMetricChest(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="38"
                    value={metricArms}
                    onChange={(e) => setMetricArms(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowMetricModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Measurements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXERCISE */}
      {showExModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Exercise Movement</h2>
            <form onSubmit={handleSaveExercise} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulgarian Split Squat"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Primary Muscle</label>
                  <select
                    value={exCategory}
                    onChange={(e) => setExCategory(e.target.value as any)}
                    className="input"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="label">Equipment</label>
                  <input
                    type="text"
                    placeholder="Dumbbells / Barbell"
                    value={exEquipment}
                    onChange={(e) => setExEquipment(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowExModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>New Fitness Milestone</h2>
            <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100kg Bench Press 1RM"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Target Value</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="100"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Current Value</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="90"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowGoalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Set Fitness Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
