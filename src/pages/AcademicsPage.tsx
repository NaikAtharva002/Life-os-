import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  UserCheck,
  UserX,
  Award,
  Layers,
} from 'lucide-react';

export default function AcademicsPage() {
  const semesters = useStore((s) => s.academicSemesters);
  const subjects = useStore((s) => s.academicSubjects);
  const assignments = useStore((s) => s.academicAssignments);
  const exams = useStore((s) => s.academicExams);
  const timetableSlots = useStore((s) => s.timetableSlots);
  const addSubject = useStore((s) => s.addSubject);
  const updateSubjectAttendance = useStore((s) => s.updateSubjectAttendance);
  const deleteSubject = useStore((s) => s.deleteSubject);
  const addAssignment = useStore((s) => s.addAssignment);
  const toggleAssignment = useStore((s) => s.toggleAssignment);
  const deleteAssignment = useStore((s) => s.deleteAssignment);
  const addExam = useStore((s) => s.addExam);
  const deleteExam = useStore((s) => s.deleteExam);
  const addSemester = useStore((s) => s.addSemester);

  const todayStr = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments' | 'exams' | 'timetable' | 'gpa'>('attendance');

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAsgModal, setShowAsgModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);

  // Form states
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subCredits, setSubCredits] = useState('4');
  const [subProf, setSubProf] = useState('');
  const [subRoom, setSubRoom] = useState('');
  const [subColor, setSubColor] = useState('#3b82f6');
  const [subTargetAtt, setSubTargetAtt] = useState('75');

  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgWeight, setAsgWeight] = useState('10');

  const [examTitle, setExamTitle] = useState('');
  const [examSubId, setExamSubId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examCoverage, setExamCoverage] = useState('70');
  const [examWeight, setExamWeight] = useState('30');

  const [semName, setSemName] = useState('');
  const [semYear, setSemYear] = useState('2026-2027');
  const [semTargetGpa, setSemTargetGpa] = useState('9.5');

  // Current semester
  const currentSemester = useMemo(() => {
    return semesters.find((s) => s.isCurrent) || semesters[0];
  }, [semesters]);

  // Overall attendance statistics
  const { totalAttended, totalClassesOverall, overallPercentage } = useMemo(() => {
    let attended = 0;
    let total = 0;
    subjects.forEach((s) => {
      attended += s.attendedClasses;
      total += s.totalClasses;
    });
    const pct = total > 0 ? ((attended / total) * 100).toFixed(1) : '100.0';
    return { totalAttended: attended, totalClassesOverall: total, overallPercentage: pct };
  }, [subjects]);

  // Days of week for timetable
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subCode) return;
    await addSubject({
      name: subName,
      code: subCode,
      credits: parseInt(subCredits) || 4,
      semesterId: currentSemester?.id || 'sem-current',
      professor: subProf,
      roomOrLink: subRoom,
      color: subColor,
      targetAttendancePercentage: parseFloat(subTargetAtt) || 75,
    });
    setSubName('');
    setSubCode('');
    setShowSubjectModal(false);
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || !asgSubjectId || !asgDueDate) return;
    await addAssignment({
      title: asgTitle,
      subjectId: asgSubjectId,
      dueDate: asgDueDate,
      weightagePercentage: parseFloat(asgWeight) || 10,
    });
    setAsgTitle('');
    setShowAsgModal(false);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examSubId || !examDate) return;
    await addExam({
      title: examTitle,
      subjectId: examSubId,
      examDate,
      syllabusCoveragePercentage: parseFloat(examCoverage) || 50,
      weightagePercentage: parseFloat(examWeight) || 30,
    });
    setExamTitle('');
    setShowExamModal(false);
  };

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semName) return;
    await addSemester({
      name: semName,
      year: semYear,
      isCurrent: true,
      targetGpa: parseFloat(semTargetGpa) || 9.0,
    });
    setSemName('');
    setShowSemModal(false);
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Academic Command
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            {currentSemester ? currentSemester.name : 'University Academic Dashboard'} • Attendance safety, assignment pipeline & exam prep.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAsgModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Clock size={16} /> New Assignment
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Attendance</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: parseFloat(overallPercentage) >= 75 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: parseFloat(overallPercentage) >= 75 ? 'var(--success)' : 'var(--danger)' }}>
              <UserCheck size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {overallPercentage}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalAttended} / {totalClassesOverall} classes attended
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Target SGPA</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(124, 92, 252, 0.12)', color: 'var(--accent)' }}>
              <Award size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {currentSemester?.achievedGpa ? `${currentSemester.achievedGpa} / ` : ''}{currentSemester?.targetGpa || '9.5'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cumulative CGPA: 9.18
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Deadlines</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' }}>
              <Clock size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {assignments.filter((a) => !a.isSubmitted).length} assignments
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Due over next 14 days
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Enrolled Courses</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--info)' }}>
              <BookOpen size={16} />
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {subjects.length} subjects
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subjects.reduce((acc, s) => acc + s.credits, 0)} total credit units
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'attendance', label: 'Attendance Tracker' },
          { id: 'assignments', label: `Assignments (${assignments.filter((a) => !a.isSubmitted).length})` },
          { id: 'exams', label: 'Examination Schedule' },
          { id: 'timetable', label: 'Weekly Timetable' },
          { id: 'gpa', label: 'SGPA / CGPA Calculator' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="btn btn-ghost"
            style={{
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: '0',
              padding: '8px 14px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ATTENDANCE TRACKER */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {subjects.map((sub) => {
            const pct = sub.totalClasses > 0 ? (sub.attendedClasses / sub.totalClasses) * 100 : 100;
            const target = sub.targetAttendancePercentage || 75;
            const isDanger = pct < target;

            // Safe to bunk calculation:
            // (attended) / (total + X) >= target/100  =>  X <= (attended * 100 / target) - total
            const safeToBunk = Math.max(0, Math.floor((sub.attendedClasses * 100) / target - sub.totalClasses));

            // Must attend consecutive calculation:
            // (attended + Y) / (total + Y) >= target/100 => Y >= (target*total - 100*attended) / (100 - target)
            const mustAttend = Math.max(
              0,
              Math.ceil((target * sub.totalClasses - 100 * sub.attendedClasses) / (100 - target))
            );

            return (
              <div
                key={sub.id}
                className="card"
                style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: isDanger ? '1px solid var(--danger)' : '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: `${sub.color}22`, color: sub.color }}>
                        {sub.code}
                      </span>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {sub.name}
                      </h2>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {sub.professor ? `${sub.professor} • ` : ''}{sub.credits} Credits • {sub.roomOrLink || 'Lecture Room'}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSubject(sub.id)}
                    className="btn btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', margin: '14px 0 8px 0' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, pct)}%`,
                      background: isDanger ? 'var(--danger)' : 'var(--success)',
                      borderRadius: '10px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isDanger ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {pct.toFixed(1)}% ({sub.attendedClasses} / {sub.totalClasses})
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {target}%</span>
                </div>

                {/* Warning / Safe Banner */}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '16px',
                    background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: isDanger ? 'var(--danger)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDanger ? (
                    <>
                      <AlertTriangle size={14} />
                      <span>Must attend next <strong>{mustAttend}</strong> consecutive classes!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Safe to miss <strong>{safeToBunk}</strong> classes safely.</span>
                    </>
                  )}
                </div>

                {/* 1-Click Attendance Logger Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => updateSubjectAttendance(sub.id, 1, 1)}
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--success)' }}
                  >
                    <UserCheck size={14} /> Present (+1)
                  </button>
                  <button
                    onClick={() => updateSubjectAttendance(sub.id, 0, 1)}
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--danger)' }}
                  >
                    <UserX size={14} /> Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No assignments recorded.
            </div>
          ) : (
            assignments.map((asg) => {
              const sub = subjects.find((s) => s.id === asg.subjectId);
              const isOverdue = !asg.isSubmitted && asg.dueDate < todayStr;

              return (
                <div
                  key={asg.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => toggleAssignment(asg.id)}
                      className="btn btn-ghost"
                      style={{ padding: '4px', color: asg.isSubmitted ? 'var(--success)' : 'var(--text-muted)' }}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          textDecoration: asg.isSubmitted ? 'line-through' : 'none',
                          opacity: asg.isSubmitted ? 0.7 : 1,
                        }}
                      >
                        {asg.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{sub ? `${sub.code} - ${sub.name}` : 'General Subject'}</span>
                        <span>•</span>
                        <span style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 700 : 'normal' }}>
                          Due: {asg.dueDate}
                        </span>
                        {asg.weightagePercentage && <span>• {asg.weightagePercentage}% of grade</span>}
                        {asg.marksScored !== undefined && (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            • Scored: {asg.marksScored} / {asg.maxMarks}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAssignment(asg.id)}
                    className="btn btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: EXAMS */}
      {activeTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowExamModal(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Schedule Exam
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {exams.map((exam) => {
              const sub = subjects.find((s) => s.id === exam.subjectId);
              const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);

              return (
                <div
                  key={exam.id}
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'var(--bg-card)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                        {sub?.code || 'Course'}
                      </div>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                        {exam.title}
                      </h2>
                    </div>
                    <button onClick={() => deleteExam(exam.id)} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ fontSize: '13px', color: daysLeft <= 3 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700, margin: '6px 0 12px 0' }}>
                    {daysLeft > 0 ? `In ${daysLeft} days (${exam.examDate})` : daysLeft === 0 ? 'Exam is Today!' : `Completed on ${exam.examDate}`}
                  </div>

                  {/* Syllabus progress */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Syllabus Prepared</span>
                      <span style={{ fontWeight: 600 }}>{exam.syllabusCoveragePercentage}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', marginTop: '6px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${exam.syllabusCoveragePercentage}%`,
                          background: 'linear-gradient(90deg, #7c5cfc, #06b6d4)',
                          borderRadius: '6px',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Weightage: {exam.weightagePercentage}% of final course SGPA
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {daysOfWeek.map((dayName, dIdx) => {
            const dayNum = dIdx + 1;
            const slotsForDay = timetableSlots.filter((ts) => ts.dayOfWeek === dayNum);

            return (
              <div
                key={dayName}
                className="card"
                style={{
                  padding: '16px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  {dayName}
                </h3>

                {slotsForDay.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                    No scheduled lectures.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {slotsForDay.map((slot) => {
                      const sub = subjects.find((s) => s.id === slot.subjectId);
                      return (
                        <div
                          key={slot.id}
                          style={{
                            padding: '8px 10px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${sub?.color || 'var(--accent)'}`,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {sub?.name || 'Class'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {slot.startTime} - {slot.endTime} • {slot.room}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: SGPA / CGPA CALCULATOR */}
      {activeTab === 'gpa' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Academic Performance History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {semesters.map((sem) => (
                <div
                  key={sem.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: sem.isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {sem.name} {sem.isCurrent && <span style={{ fontSize: '10px', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>CURRENT</span>}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Year: {sem.year}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
                      {sem.achievedGpa || 'In Progress'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {sem.targetGpa}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSemModal(true)} className="btn btn-secondary" style={{ width: '100%', marginTop: '14px', fontSize: '13px' }}>
              + Add Semester Record
            </button>
          </div>

          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Current Semester Projection</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Based on your enrolled subjects ({subjects.reduce((a, s) => a + s.credits, 0)} credits) and target GPA of {currentSemester?.targetGpa || '9.5'}, here are the required grade points per course:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subjects.map((sub) => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px' }}>
                  <span>{sub.code}: {sub.name} ({sub.credits} credits)</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>A+ / Grade 10</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Academic Subject</h2>
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS401"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Credits</label>
                  <input
                    type="number"
                    value={subCredits}
                    onChange={(e) => setSubCredits(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Professor</label>
                  <input
                    type="text"
                    placeholder="Dr. Alan Vance"
                    value={subProf}
                    onChange={(e) => setSubProf(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Room / Hall</label>
                  <input
                    type="text"
                    placeholder="Hall 302"
                    value={subRoom}
                    onChange={(e) => setSubRoom(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Target Attendance Threshold (%)</label>
                <input
                  type="number"
                  value={subTargetAtt}
                  onChange={(e) => setSubTargetAtt(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ASSIGNMENT */}
      {showAsgModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>New Academic Assignment</h2>
            <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus Protocol Implementation"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <select
                  value={asgSubjectId}
                  onChange={(e) => setAsgSubjectId(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Weightage (%)</label>
                  <input
                    type="number"
                    value={asgWeight}
                    onChange={(e) => setAsgWeight(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAsgModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXAM */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Schedule Examination</h2>
            <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Exam"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <select
                  value={examSubId}
                  onChange={(e) => setExamSubId(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Syllabus Covered (%)</label>
                  <input
                    type="number"
                    value={examCoverage}
                    onChange={(e) => setExamCoverage(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Weightage (%)</label>
                  <input
                    type="number"
                    value={examWeight}
                    onChange={(e) => setExamWeight(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowExamModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SEMESTER */}
      {showSemModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Semester Record</h2>
            <form onSubmit={handleAddSemester} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Semester Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester 6 (Spring 2027)"
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Academic Year</label>
                  <input
                    type="text"
                    value={semYear}
                    onChange={(e) => setSemYear(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Target SGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={semTargetGpa}
                    onChange={(e) => setSemTargetGpa(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSemModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
