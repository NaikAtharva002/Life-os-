import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key,
  User,
  DollarSign,
  Database,
  RefreshCw,
  Code2,
  Sparkles,
  Compass,
  RotateCcw,
  Layers,
  Plus,
  Sliders,
  Check,
} from 'lucide-react';
import useStore from '../store/useStore';
import { LifeOSRepository } from '../db/repository';
import { todayLocal } from '../lib/dates';
import {
  requestNotificationPermission,
  showNotification,
} from '../utils/notifications';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const updateSettings = useStore((s) => s.updateSettings);
  const setActiveView = useStore((s) => s.setActiveView);
  const updateReminderSettings = useStore((s) => s.updateReminderSettings);
  const setIsOnboardingOpen = useStore((s) => s.setIsOnboardingOpen);
  const resetDismissedTips = useStore((s) => s.resetDismissedTips);
  const toggleDemoMode = useStore((s) => s.toggleDemoMode);
  const resetToFreshSlate = useStore((s) => s.resetToFreshSlate);

  const workspaces = useStore((s) => s.workspaces);
  const activeWorkspaceId = useStore((s) => s.activeWorkspaceId);
  const createWorkspace = useStore((s) => s.createWorkspace);
  const switchWorkspace = useStore((s) => s.switchWorkspace);
  const deleteWorkspace = useStore((s) => s.deleteWorkspace);
  const loadDemoData = useStore((s) => s.loadDemoData);
  const purgeSeedData = useStore((s) => s.purgeSeedData);

  const [userName, setUserName] = useState(settings.userName || '');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '$');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const [reminderEnabled, setReminderEnabled] = useState(settings.reminder.enabled);
  const [reminderTime, setReminderTime] = useState(settings.reminder.time || '21:30');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setReminderEnabled(settings.reminder.enabled);
    setReminderTime(settings.reminder.time || '21:30');
    setUserName(settings.userName || '');
    setCurrencySymbol(settings.currencySymbol || '$');
    setGeminiApiKey(settings.geminiApiKey || '');
  }, [settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      userName: userName.trim(),
      currencySymbol: currencySymbol.trim() || '$',
      geminiApiKey: geminiApiKey.trim() || undefined,
    });
    setStatusMessage('Profile and AI preferences saved successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleReminder = () => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    updateReminderSettings({ enabled: next, time: reminderTime, timezone: deviceTimezone });
  };

  const handleTimeChange = (newTime: string) => {
    setReminderTime(newTime);
    updateReminderSettings({ time: newTime, timezone: deviceTimezone });
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm ? 'granted' : 'denied');
  };

  const handleTestNotification = () => {
    showNotification(
      '🌙 LIFE OS: Evening Review Test',
      'This is a sample evening reminder notification. Great job prioritizing your habits today!',
      () => {}
    );
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  // Full IndexedDB JSON Export
  const handleExportData = async () => {
    const jsonStr = await LifeOSRepository.exportEntireDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeOS-IndexedDB-Backup-${todayLocal()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Full IndexedDB JSON Import
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = await LifeOSRepository.importEntireDatabaseJSON(content);
        if (success) {
          alert('Backup restored successfully! The application will now reload to hydrate all modules.');
          window.location.reload();
        } else {
          alert('Failed to parse or restore backup file. Please ensure it is a valid Life OS JSON export.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('⚠️ Reset entire database to factory defaults? All personal goals, tasks, and journals will be cleared and reseeded.')) {
      await LifeOSRepository.resetDatabaseToFactory();
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setStatusMessage('New workspace created and activated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSwitchWorkspace = async (wsId: string) => {
    await switchWorkspace(wsId);
    setStatusMessage('Switched workspace successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteWorkspace = async (wsId: string, name: string) => {
    if (window.confirm(`Delete workspace "${name}" and all of its associated records?`)) {
      await deleteWorkspace(wsId);
      setStatusMessage(`Workspace "${name}" removed.`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handlePurgeSeedData = async () => {
    if (window.confirm('Remove demo seed records from your workspace? Any genuine records you created will remain safe.')) {
      await purgeSeedData();
      setStatusMessage('Demo seed records purged. Your workspace now contains only your genuine data.');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleLoadDemoData = async () => {
    if (window.confirm('Load showcase demonstration data into the active workspace?')) {
      await loadDemoData();
      setStatusMessage('Showcase demonstration data loaded successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px', maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Preferences & Data Architecture
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13.5px' }}>
          Local-first IndexedDB storage settings, notification schedules, and AI API integrations.
        </p>
      </div>

      {statusMessage && (
        <div style={{ padding: '10px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {statusMessage}
        </div>
      )}

      {/* SECTION 0: WORKSPACES & DATA SCOPING */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-eyebrow">WORKSPACES & DATA ISOLATION</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {workspaces.length} Workspace{workspaces.length !== 1 ? 's' : ''} configured
          </span>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
          Create separate workspaces (e.g., Personal, Academic, Work, Startup) to completely isolate goals, tasks, habits, and schedules.
        </p>

        {/* Existing workspaces list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <div
                key={ws.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
                  border: isActive ? '1px solid var(--accent-primary, #E32620)' : '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={16} color={isActive ? 'var(--accent-primary, #E32620)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {ws.name}
                      {ws.isDefault && (
                        <span style={{ fontSize: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', color: 'var(--text-muted)' }}>
                          Default
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '10px', background: 'var(--accent-primary, #E32620)', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 700 }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isActive && (
                    <button
                      onClick={() => handleSwitchWorkspace(ws.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', height: '28px' }}
                    >
                      Switch to Workspace
                    </button>
                  )}
                  {workspaces.length > 1 && !ws.isDefault && (
                    <button
                      onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                      className="btn btn-ghost"
                      style={{ padding: '4px', color: 'var(--status-danger, #E45B52)' }}
                      title="Delete workspace"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create new workspace form */}
        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace name (e.g. University, Ventures)..."
            style={{ fontSize: '13px' }}
          />
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Create Workspace
          </button>
        </form>
      </div>

      {/* SECTION 1: USER PROFILE & CURRENCY */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="section-eyebrow">IDENTITY & LOCALIZATION</span>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label">Operator Name</label>
              <input
                type="text"
                className="input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your preferred name..."
              />
            </div>
            <div>
              <label className="label">Currency Symbol</label>
              <input
                type="text"
                className="input"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$ / ₹ / € / £"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={13} /> Optional Gemini API Key (Advanced AI Copilot Mode)
            </label>
            <input
              type="password"
              className="input"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Paste Google AI Studio Gemini API Key (Optional)..."
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Optional. Life OS works 100% offline with full local heuristic intelligence without any API key.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', height: '32px' }}>
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: EVENING REMINDERS & NOTIFICATIONS */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-eyebrow">DAILY REVIEW REMINDERS</span>
          </div>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={handleToggleReminder}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: '1.45' }}>
          Prompts you every evening to celebrate accomplishments, reschedule incomplete tasks, review habits, and declare tomorrow's top 3 priorities.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <label className="label">Daily Reminder Time</label>
            <input
              type="time"
              className="input"
              value={reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              style={{ width: '130px', height: '30px', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
            {notificationPermission !== 'granted' && (
              <button onClick={handleRequestPermission} className="btn btn-secondary" style={{ fontSize: '11.5px', height: '30px' }}>
                Enable Browser Notifications
              </button>
            )}
            <button onClick={handleTestNotification} className="btn btn-secondary" style={{ fontSize: '11.5px', height: '30px' }}>
              Send Test Notification
            </button>
          </div>
        </div>

        {testNotificationSent && (
          <div style={{ fontSize: '11.5px', color: 'var(--status-success)', fontWeight: 600, marginTop: '10px' }}>
            ✓ Notification dispatched! Check your desktop notification tray.
          </div>
        )}
      </div>

      {/* SECTION 3: THEME */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ marginBottom: '12px' }}>
          <span className="section-eyebrow">INTERFACE THEME</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => setTheme('dark')}
            className="btn"
            style={{
              padding: '10px 14px',
              border: settings.theme === 'dark' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              background: settings.theme === 'dark' ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Moon size={14} color="var(--accent-primary)" /> Dark Theme (Espresso Dark &amp; Crimson)
          </button>
          <button
            onClick={() => setTheme('light')}
            className="btn"
            style={{
              padding: '10px 14px',
              border: settings.theme === 'light' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              background: settings.theme === 'light' ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Sun size={14} color="var(--status-warning)" /> Light Theme (Alabaster &amp; Brick Ember)
          </button>
        </div>
      </div>

      {/* SECTION 3B: DASHBOARD WIDGET VISIBILITY */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="section-eyebrow">DASHBOARD WIDGET CONTROLS</span>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          Toggle visible sections and overview widgets shown on your personal dashboard overview:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {[
            { key: 'focusTimer', label: 'Photographic Focus Timer' },
            { key: 'todayTasks', label: 'Today Action Triage' },
            { key: 'goals', label: 'Long-Term Vision Goals' },
            { key: 'habits', label: 'Daily Habit Rituals' },
            { key: 'academics', label: 'Academic & Schedule Radar' },
            { key: 'finance', label: 'Financial Velocity' },
            { key: 'fitness', label: 'Physical Conditioning' },
          ].map((item) => {
            const isChecked = (settings.dashboardWidgets as any)?.[item.key] !== false;
            return (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    updateSettings({
                      dashboardWidgets: {
                        ...settings.dashboardWidgets,
                        [item.key]: e.target.checked,
                      },
                    });
                  }}
                  style={{ accentColor: 'var(--accent-primary, #E32620)', width: '15px', height: '15px' }}
                />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: ONBOARDING, PROGRESSIVE GUIDANCE & DEMO DATA MANAGEMENT */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="section-eyebrow">DATA MANAGEMENT & DEMO CONTROLS</span>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          Safely purge pre-filled sample data, inject showcase demonstration records on demand, or restart the lightweight workspace onboarding.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={13} /> Relaunch Welcome Setup
          </button>

          <button
            onClick={handlePurgeSeedData}
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'var(--status-warning, #E5AD4B)' }}
            title="Remove pre-filled demo data while keeping real records"
          >
            <Trash2 size={13} color="var(--status-warning, #E5AD4B)" /> Purge Demo Seed Data
          </button>

          <button
            onClick={handleLoadDemoData}
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Load full showcase demo data across all modules"
          >
            <Database size={13} /> Load Showcase Demo Data
          </button>

          <button
            onClick={resetDismissedTips}
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={13} /> Restore Contextual Tips
          </button>

          <button
            onClick={() => {
              if (window.confirm('⚠️ Reset all records to a clean slate (0 tasks, 0 goals, 0 habits)? This will open the fresh onboarding wizard.')) {
                resetToFreshSlate();
              }
            }}
            className="btn btn-danger"
            style={{ fontSize: '11.5px', height: '32px', marginLeft: 'auto' }}
          >
            <Trash2 size={13} /> Clean Slate (0 Records)
          </button>
        </div>
      </div>

      {/* SECTION 5: DATA SOVEREIGNTY, INDEXEDDB BACKUP & RESTORE */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="section-eyebrow">LOCAL STORAGE & PRIVACY</span>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          All personal data (goals, tasks, habits, finances, workouts, academics, and obsidian notes) is stored securely in your browser's persistent <strong>IndexedDB (Dexie.js)</strong> database. Zero data leaves your machine.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleExportData} className="btn btn-secondary" style={{ fontSize: '11.5px', height: '30px' }}>
            <Download size={13} /> Export JSON Backup
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '11.5px', height: '30px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={13} /> Restore JSON Backup
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>

          <button onClick={handleClearData} className="btn btn-danger" style={{ fontSize: '11.5px', height: '30px', marginLeft: 'auto' }}>
            <Trash2 size={13} /> Reset Database
          </button>
        </div>
      </div>

      {/* SECTION 5: DEVELOPER TOOLS & DESIGN SYSTEM */}
      <div className="card" style={{ padding: '18px 20px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)', boxShadow: 'var(--panel-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-eyebrow">DEVELOPER TOOLS</span>
            <span className="badge badge-brick" style={{ fontSize: '9.5px', padding: '1px 6px' }}>INTERNAL</span>
          </div>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
          Inspect design system tokens, typography scales, spacing primitives, and interactive UI component states in the isolated developer component gallery.
        </p>
        <button
          onClick={() => setActiveView('design-system')}
          className="btn btn-secondary"
          style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Code2 size={13} color="var(--palette-brick)" /> Open Design System Component Gallery →
        </button>
      </div>
    </div>
  );
}
