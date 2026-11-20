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
} from 'lucide-react';
import useStore from '../store/useStore';
import { LifeOSRepository } from '../db/repository';
import {
  requestNotificationPermission,
  showNotification,
} from '../utils/notifications';

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setTheme = useStore((s) => s.setTheme);
  const updateSettings = useStore((s) => s.updateSettings);
  const updateReminderSettings = useStore((s) => s.updateReminderSettings);

  const [userName, setUserName] = useState(settings.userName || 'Atharva');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '$');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');

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
    setUserName(settings.userName || 'Atharva');
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
    a.download = `LifeOS-IndexedDB-Backup-${new Date().toISOString().split('T')[0]}.json`;
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

      {/* SECTION 1: USER PROFILE & CURRENCY */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--accent)" /> Personal Profile & Regional Formatting
        </h2>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label">User Name</label>
              <input
                type="text"
                className="input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Atharva"
                required
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
              <Key size={14} /> Optional Gemini API Key (Advanced AI Copilot Mode)
            </label>
            <input
              type="password"
              className="input"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Paste Google AI Studio Gemini API Key (Optional)..."
            />
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              * Optional. Life OS works 100% offline with full rule-based heuristics without any API key.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: EVENING REMINDERS & NOTIFICATIONS */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>End-of-Day Review Reminders</h2>
          </div>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={handleToggleReminder}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Prompts you every evening to celebrate accomplishments, reschedule incomplete tasks, review habits, and declare tomorrow's top 3 priorities.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label className="label">Daily Reminder Time</label>
            <input
              type="time"
              className="input"
              value={reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              style={{ width: '140px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {notificationPermission !== 'granted' && (
              <button onClick={handleRequestPermission} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                Enable Browser Notifications
              </button>
            )}
            <button onClick={handleTestNotification} className="btn btn-secondary" style={{ fontSize: '12px' }}>
              Send Test Notification
            </button>
          </div>
        </div>

        {testNotificationSent && (
          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, marginTop: '10px' }}>
            ✓ Notification dispatched! Check your desktop notification tray.
          </div>
        )}
      </div>

      {/* SECTION 3: THEME */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Interface Theme</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => setTheme('dark')}
            className="btn"
            style={{
              padding: '14px',
              border: settings.theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: settings.theme === 'dark' ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Moon size={16} color="var(--accent)" /> Dark Theme (Recommended)
          </button>
          <button
            onClick={() => setTheme('light')}
            className="btn"
            style={{
              padding: '14px',
              border: settings.theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: settings.theme === 'light' ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Sun size={16} color="var(--warning)" /> Light Theme
          </button>
        </div>
      </div>

      {/* SECTION 4: DATA SOVEREIGNTY, INDEXEDDB BACKUP & RESTORE */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Database size={18} color="var(--success)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            IndexedDB Data Sovereignty & Backup
          </h2>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          All your personal data (goals, tasks, habits, financial transactions, workouts, academic records, and obsidian notes) is stored securely in your browser's persistent <strong>IndexedDB (Dexie.js)</strong> database. No data is sent to external cloud servers.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleExportData} className="btn btn-secondary" style={{ fontSize: '13px' }}>
            <Download size={15} /> Export JSON Backup
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '13px' }}>
            <Upload size={15} /> Restore JSON Backup
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>

          <button onClick={handleClearData} className="btn btn-danger" style={{ fontSize: '13px', marginLeft: 'auto' }}>
            <Trash2 size={15} /> Factory Reset Database
          </button>
        </div>
      </div>
    </div>
  );
}
