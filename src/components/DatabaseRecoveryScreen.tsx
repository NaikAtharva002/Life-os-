import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Download, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import { LifeOSRepository } from '../db/repository';

export default function DatabaseRecoveryScreen() {
  const initError = useStore((s) => s.initError);
  const initializeFromDB = useStore((s) => s.initializeFromDB);
  const [isRetrying, setIsRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await initializeFromDB();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDownloadEmergencyBackup = async () => {
    setDownloading(true);
    try {
      const jsonStr = await LifeOSRepository.exportEntireDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-os-emergency-backup-${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Emergency dump failed:', err);
      alert('Could not generate full dump. Please inspect browser DevTools Application tab > IndexedDB.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFactoryReset = async () => {
    if (window.confirm('⚠️ Reset database to clean factory defaults? This will erase corrupted records.')) {
      await LifeOSRepository.resetDatabaseToFactory();
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main, #09090B)',
        color: 'var(--text-primary, #F4F4F5)',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: 'var(--bg-surface, #111116)',
          border: '1px solid var(--status-danger, #F43F5E)',
          borderRadius: '14px',
          padding: '28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--status-danger-bg, rgba(244, 63, 94, 0.14))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-danger, #F43F5E)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Database Initialization Failure</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>LIFE OS 3.0 Recovery Mode</span>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
          The local IndexedDB storage encountered an error while starting up. Your stored data has not been modified.
        </p>

        {initError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--status-danger, #F43F5E)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
              wordBreak: 'break-word',
            }}
          >
            {initError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
          >
            <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Retrying Database Connection...' : 'Retry Initialization'}
          </button>

          <button
            onClick={handleDownloadEmergencyBackup}
            disabled={downloading}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
          >
            <Download size={15} />
            Download Emergency Backup JSON
          </button>

          <button
            onClick={handleFactoryReset}
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', marginTop: '10px' }}
          >
            <Trash2 size={15} />
            Reset to Clean Factory Database
          </button>
        </div>
      </div>
    </div>
  );
}
