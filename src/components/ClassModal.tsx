import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  BookOpen,
  Check,
  Repeat,
  Sparkles,
} from 'lucide-react';
import useStore from '../store/useStore';
import type { TimetableSlot } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlot?: TimetableSlot | null;
  defaultDay?: number;
}

const COLOR_PRESETS = [
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Cobalt', hex: '#3B82F6' },
  { label: 'Emerald', hex: '#10B981' },
  { label: 'Amber', hex: '#F59E0B' },
  { label: 'Rose', hex: '#F43F5E' },
  { label: 'Violet', hex: '#8B5CF6' },
  { label: 'Slate', hex: '#64748B' },
];

const DAYS = [
  { num: 1, label: 'Monday', short: 'Mon' },
  { num: 2, label: 'Tuesday', short: 'Tue' },
  { num: 3, label: 'Wednesday', short: 'Wed' },
  { num: 4, label: 'Thursday', short: 'Thu' },
  { num: 5, label: 'Friday', short: 'Fri' },
  { num: 6, label: 'Saturday', short: 'Sat' },
  { num: 7, label: 'Sunday', short: 'Sun' },
];

export default function ClassModal({
  isOpen,
  onClose,
  editingSlot,
  defaultDay = 1,
}: ClassModalProps) {
  const timetableSlots = useStore((s) => s.timetableSlots);
  const subjects = useStore((s) => s.academicSubjects);
  const activeWorkspaceId = useStore((s) => s.activeWorkspaceId);
  const addTimetableSlot = useStore((s) => s.addTimetableSlot);
  const updateTimetableSlot = useStore((s) => s.updateTimetableSlot);

  // Form states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [subjectName, setSubjectName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(defaultDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('#6366F1');
  const [recurring, setRecurring] = useState(true);

  // Sync state on edit or open
  useEffect(() => {
    if (editingSlot) {
      setSelectedSubjectId(editingSlot.subjectId || '');
      const existingSub = subjects.find((s) => s.id === editingSlot.subjectId);
      setSubjectName(editingSlot.subjectName || existingSub?.name || '');
      setCourseCode(editingSlot.courseCode || existingSub?.code || '');
      setProfessor(editingSlot.professor || existingSub?.professor || '');
      setRoom(editingSlot.room || existingSub?.roomOrLink || '');
      setDayOfWeek(editingSlot.dayOfWeek);
      setStartTime(editingSlot.startTime);
      setEndTime(editingSlot.endTime);
      setColor(editingSlot.color || existingSub?.color || '#6366F1');
      setRecurring(editingSlot.recurring !== false);
    } else {
      setSelectedSubjectId('');
      setSubjectName('');
      setCourseCode('');
      setProfessor('');
      setRoom('');
      setDayOfWeek(defaultDay);
      setStartTime('09:00');
      setEndTime('10:30');
      setColor('#6366F1');
      setRecurring(true);
    }
  }, [editingSlot, defaultDay, isOpen, subjects]);

  // When user picks a registered academic subject
  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    if (!id) return;
    const sub = subjects.find((s) => s.id === id);
    if (sub) {
      setSubjectName(sub.name);
      setCourseCode(sub.code);
      if (sub.professor) setProfessor(sub.professor);
      if (sub.roomOrLink) setRoom(sub.roomOrLink);
      if (sub.color) setColor(sub.color);
    }
  };

  // Schedule conflict detection
  const conflicts = useMemo(() => {
    if (!startTime || !endTime) return [];
    return timetableSlots.filter((slot) => {
      if (editingSlot && slot.id === editingSlot.id) return false;
      if (slot.dayOfWeek !== dayOfWeek) return false;
      // Overlap: newStart < existingEnd && newEnd > existingStart
      return startTime < slot.endTime && endTime > slot.startTime;
    });
  }, [timetableSlots, editingSlot, dayOfWeek, startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubjectName = subjectName.trim();
    if (!finalSubjectName) return;

    const payload = {
      workspaceId: activeWorkspaceId,
      subjectId: selectedSubjectId || `sub-${Date.now()}`,
      subjectName: finalSubjectName,
      courseCode: courseCode.trim() || undefined,
      professor: professor.trim() || undefined,
      room: room.trim() || 'TBD',
      dayOfWeek,
      startTime,
      endTime,
      color,
      recurring,
    };

    if (editingSlot) {
      await updateTimetableSlot(editingSlot.id, payload);
    } else {
      await addTimetableSlot(payload);
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary)',
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
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                {editingSlot ? 'Edit Class Schedule' : 'Add Class / Lecture'}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Set your recurring academic timetable slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Link to existing registered subject if any */}
          {subjects.length > 0 && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Link to Enrolled Subject (Optional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSelectSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              >
                <option value="">-- Custom or New Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Name & Course Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Subject / Class Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <BookOpen
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Code
              </label>
              <input
                type="text"
                placeholder="CS401"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Day of Week Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Day of Week *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {DAYS.map((d) => {
                const isSelected = dayOfWeek === d.num;
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => setDayOfWeek(d.num)}
                    style={{
                      padding: '8px 2px',
                      borderRadius: '8px',
                      border: isSelected
                        ? '1px solid var(--accent-primary)'
                        : '1px solid var(--border-default)',
                      background: isSelected
                        ? 'var(--accent-primary)'
                        : 'var(--bg-main)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Start & End */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Start Time *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <Clock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                End Time *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <Clock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Schedule Conflict Notice */}
          {conflicts.length > 0 && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'var(--status-warning-bg)',
                border: '1px solid var(--status-warning)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--status-warning)' }}>
                  Schedule Overlap Detected
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  This slot overlaps with{' '}
                  <strong>
                    {conflicts.map((c) => c.subjectName || c.courseCode || 'Another Class').join(', ')}
                  </strong>{' '}
                  ({conflicts.map((c) => `${c.startTime}–${c.endTime}`).join(', ')}). You can still save if this is intentional.
                </div>
              </div>
            </div>
          )}

          {/* Professor & Room / Link */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Professor / Lecturer
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Dr. Vance"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Room / Hall / Zoom Link
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Hall 302 / Zoom"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <MapPin
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Color Tag & Recurring Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Color Indicator
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {COLOR_PRESETS.map((p) => {
                  const isCur = color === p.hex;
                  return (
                    <button
                      key={p.hex}
                      type="button"
                      title={p.label}
                      onClick={() => setColor(p.hex)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: p.hex,
                        border: isCur ? '2px solid #FFFFFF' : '2px solid transparent',
                        boxShadow: isCur ? '0 0 0 2px var(--accent-primary)' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Repeat size={14} /> Weekly Recurring Class
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Check size={16} />
              {editingSlot ? 'Update Class' : 'Save Class Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
