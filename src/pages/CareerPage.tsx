import React, { useState } from 'react';
import useStore from '../store/useStore';
import { todayLocal, toLocalDateString } from '../lib/dates';
import {
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Building,
  Calendar,
} from 'lucide-react';
import type { JobApplication } from '../types';
import { EmptyState } from '../components/ui';
import ContextualTipBanner from '../components/ContextualTipBanner';

export default function CareerPage() {
  const careerGoals = useStore((s) => s.careerGoals);
  const careerSkills = useStore((s) => s.careerSkills);
  const careerProjects = useStore((s) => s.careerProjects);
  const careerApplications = useStore((s) => s.careerApplications);
  const careerDocuments = useStore((s) => s.careerDocuments);

  const addCareerGoal = useStore((s) => s.addCareerGoal);
  const toggleCareerMilestone = useStore((s) => s.toggleCareerMilestone);
  const updateSkillProficiency = useStore((s) => s.updateSkillProficiency);
  const addCareerSkill = useStore((s) => s.addCareerSkill);
  const addCareerProject = useStore((s) => s.addCareerProject);
  const deleteCareerProject = useStore((s) => s.deleteCareerProject);
  const addJobApplication = useStore((s) => s.addJobApplication);
  const updateJobStage = useStore((s) => s.updateJobStage);
  const deleteJobApplication = useStore((s) => s.deleteJobApplication);

  const [activeTab, setActiveTab] = useState<'applications' | 'skills' | 'projects' | 'vision'>('applications');

  // Modals
  const [showAppModal, setShowAppModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Forms
  const [appCompany, setAppCompany] = useState('');
  const [appRole, setAppRole] = useState('');
  const [appStage, setAppStage] = useState<JobApplication['stage']>('applied');
  const [appSalary, setAppSalary] = useState('');
  const [appLocation, setAppLocation] = useState('Remote');
  const [appNotes, setAppNotes] = useState('');

  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState<any>('Backend');
  const [skillProf, setSkillProf] = useState('3');
  const [skillTarget, setSkillTarget] = useState('5');
  const [skillResources, setSkillResources] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStack, setProjStack] = useState('TypeScript, React, Node.js');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');

  const stages: { id: JobApplication['stage']; label: string; color: string }[] = [
    { id: 'wishlist', label: 'Wishlist', color: 'var(--text-muted)' },
    { id: 'applied', label: 'Applied', color: 'var(--palette-walnut)' },
    { id: 'oa', label: 'Online Assessment', color: 'var(--status-warning)' },
    { id: 'interview', label: 'Interviewing', color: 'var(--palette-brick)' },
    { id: 'offer', label: 'Offer Received', color: 'var(--status-success)' },
    { id: 'rejected', label: 'Archived', color: 'var(--text-muted)' },
  ];

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCompany || !appRole) return;
    await addJobApplication({
      company: appCompany,
      role: appRole,
      stage: appStage,
      appliedDate: todayLocal(),
      location: appLocation,
      salaryExpectation: appSalary,
      notes: appNotes,
    });
    setAppCompany('');
    setAppRole('');
    setShowAppModal(false);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return;
    await addCareerSkill({
      name: skillName,
      category: skillCat,
      proficiency: parseInt(skillProf) || 3,
      targetProficiency: parseInt(skillTarget) || 5,
      resources: skillResources,
    });
    setSkillName('');
    setShowSkillModal(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;
    await addCareerProject({
      title: projTitle,
      description: projDesc,
      techStack: projStack.split(',').map((s) => s.trim()),
      githubUrl: projGithub,
      liveUrl: projLive,
      status: 'in-progress',
      featured: true,
    });
    setProjTitle('');
    setProjDesc('');
    setShowProjectModal(false);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    await addCareerGoal({
      title: goalTitle,
      targetDate: goalDate || toLocalDateString(new Date(Date.now() + 365 * 86400000)),
      status: 'active',
      milestones: [
        { id: 'm-1', title: 'Complete first phase milestone', completed: false },
        { id: 'm-2', title: 'Achieve production scale readiness', completed: false },
      ],
    });
    setGoalTitle('');
    setShowGoalModal(false);
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Career & Engineering Roadmap
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Job & internship applications pipeline, skill development matrix, and project portfolio.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowProjectModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FolderGit2 size={16} /> Add Project
          </button>
          <button
            onClick={() => setShowAppModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add Application
          </button>
        </div>
      </div>

      {/* Career Metrics Strip */}
      <div className="summary-strip">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Applications:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {careerApplications.length} opportunities
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>In Review / Interview:</span>
          <span style={{ fontWeight: 700, color: 'var(--status-warning)' }} className="tabular">
            {careerApplications.filter((a) => ['interviewing', 'offer'].includes(a.stage)).length} stages
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Skills Indexed:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {careerSkills.length} competencies
          </span>
        </span>

        <span style={{ color: 'var(--border-default)' }}>·</span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Portfolio Repos:</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }} className="tabular">
            {careerProjects.length} showcases
          </span>
        </span>
      </div>

      {/* Contextual Progressive Guidance Tip */}
      <ContextualTipBanner
        tipId="career_intro"
        icon={Briefcase}
        title="Career Momentum & Portfolio Pipeline"
        description="Track technical skill proficiencies, manage job application stages, and showcase high-impact portfolio projects in one unified career command center."
        actionText="Add Application"
        onAction={() => setShowAppModal(true)}
        style={{ marginBottom: '16px' }}
      />

      {/* Tabs */}
      <div className="responsive-tabs-bar" style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-default)', maxWidth: '100%', overflowX: 'auto' }}>
        {[
          { id: 'applications', label: `Application Pipeline (${careerApplications.length})` },
          { id: 'skills', label: `Technical Skills (${careerSkills.length})` },
          { id: 'projects', label: `Portfolio Projects (${careerProjects.length})` },
          { id: 'vision', label: 'Career Vision & Milestones' },
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

      {/* TAB 1: APPLICATION PIPELINE KANBAN */}
      {activeTab === 'applications' && (
        careerApplications.length === 0 ? (
          <div className="card" style={{ padding: '36px 20px' }}>
            <EmptyState
              illustration="career"
              badge="Clean Slate"
              title="Build your professional momentum."
              description="Track job applications, tech stack interviews, and compensation offers in a visual pipeline."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAppModal(true)}
                >
                  <Plus size={15} /> Add your first application
                </button>
              }
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {stages.map((stage) => {
            const appsInStage = careerApplications.filter((a) => a.stage === stage.id);
            return (
              <div
                key={stage.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--border)', padding: '1px 6px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    {appsInStage.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {appsInStage.map((app) => (
                    <div
                      key={app.id}
                      className="card"
                      style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {app.company}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {app.role}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteJobApplication(app.id)}
                          className="btn btn-ghost"
                          style={{ padding: '4px', color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {app.salaryExpectation && (
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
                          {app.salaryExpectation}
                        </div>
                      )}

                      {app.notes && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px', background: 'var(--bg-secondary)', padding: '6px 8px', borderRadius: '6px' }}>
                          {app.notes}
                        </div>
                      )}

                      {/* Advance Stage Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{app.location}</span>
                        <select
                          value={app.stage}
                          onChange={(e) => updateJobStage(app.id, e.target.value as any)}
                          style={{
                            fontSize: '11px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '2px 4px',
                          }}
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.id}>Move to {s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* TAB 2: TECHNICAL SKILLS MATRIX */}
      {activeTab === 'skills' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={() => setShowSkillModal(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Add Skill
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {careerSkills.map((sk) => (
              <div
                key={sk.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {sk.name}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {sk.category}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '10px 0' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateSkillProficiency(sk.id, lvl)}
                      style={{
                        flex: 1,
                        height: '8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: lvl <= sk.proficiency ? 'var(--accent)' : 'var(--border)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      title={`Set level to ${lvl}`}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <span>Current: Level {sk.proficiency} / 5</span>
                  <span style={{ fontWeight: 600 }}>Target: Level {sk.targetProficiency} / 5</span>
                </div>

                {sk.resources && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    Focus: {sk.resources}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PORTFOLIO PROJECTS */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {careerProjects.map((proj) => (
            <div
              key={proj.id}
              className="card"
              style={{
                padding: '20px',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {proj.title}
                  </h3>
                  <button onClick={() => deleteCareerProject(proj.id)} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                  {proj.description}
                </p>

                {/* Tech stack pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {proj.techStack?.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <FolderGit2 size={14} /> GitHub Repo
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                  >
                    <ExternalLink size={14} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CAREER VISION */}
      {activeTab === 'vision' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowGoalModal(true)} className="btn btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Add Career Milestone
            </button>
          </div>

          {careerGoals.map((cg) => (
            <div
              key={cg.id}
              className="card"
              style={{
                padding: '22px',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {cg.title}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Target Horizon: {cg.targetDate}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' }}>
                  {cg.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cg.milestones?.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleCareerMilestone(cg.id, m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={18} color={m.completed ? 'var(--success)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', textDecoration: m.completed ? 'line-through' : 'none', opacity: m.completed ? 0.7 : 1 }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD APPLICATION */}
      {showAppModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Track Job Application</h2>
            <form onSubmit={handleAddApp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe / Linear / Vercel"
                  value={appCompany}
                  onChange={(e) => setAppCompany(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Product Engineer"
                  value={appRole}
                  onChange={(e) => setAppRole(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Stage</label>
                  <select
                    value={appStage}
                    onChange={(e) => setAppStage(e.target.value as any)}
                    className="input"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={appLocation}
                    onChange={(e) => setAppLocation(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Compensation / Package</label>
                <input
                  type="text"
                  placeholder="e.g. $150,000 + Equity"
                  value={appSalary}
                  onChange={(e) => setAppSalary(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Interview Notes & Next Action</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completed technical round on system design. Follow up Friday."
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAppModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SKILL */}
      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Technical Skill</h2>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Raft"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    value={skillCat}
                    onChange={(e) => setSkillCat(e.target.value)}
                    className="input"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label className="label">Current Level (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={skillProf}
                    onChange={(e) => setSkillProf(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Learning Objectives / Resources</label>
                <input
                  type="text"
                  placeholder="e.g. MIT 6.824, Paxos Made Simple"
                  value={skillResources}
                  onChange={(e) => setSkillResources(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSkillModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>Add Portfolio Project</h2>
            <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HyperMesh Event Broker"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={2}
                  placeholder="High-throughput distributed append-only log with consensus replication..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="Go, gRPC, Protobuf, Docker"
                  value={projStack}
                  onChange={(e) => setProjStack(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CAREER GOAL */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0' }}>New Career Vision</h2>
            <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Vision Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founding Staff Engineer / Tech Lead"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Target Date</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowGoalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Career Vision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
