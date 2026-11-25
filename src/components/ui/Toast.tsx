import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import useStore from '../../store/useStore';
import type { ToastItem } from '../../types';

export const ToastItemView: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isHovered || progress <= 0) return;
    const duration = toast.duration || 3500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration, isHovered, progress <= 0]);

  useEffect(() => {
    if (progress <= 0) {
      onDismiss(toast.id);
    }
  }, [progress, toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={18} color="var(--status-success)" />,
    warning: <AlertTriangle size={18} color="var(--status-warning)" />,
    error: <AlertCircle size={18} color="var(--status-danger)" />,
    info: <Info size={18} color="var(--accent-primary)" />,
  };

  const borderColors = {
    success: 'rgba(16, 185, 129, 0.35)',
    warning: 'rgba(245, 158, 11, 0.35)',
    error: 'rgba(244, 63, 94, 0.35)',
    info: 'var(--accent-border)',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minWidth: '300px',
        maxWidth: '380px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
        border: `1px solid ${borderColors[toast.type] || 'var(--border-default)'}`,
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        animation: 'toastSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'transform var(--spring-fast), opacity var(--spring-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ marginTop: '2px', flexShrink: 0 }}>{icons[toast.type]}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {toast.title}
            </div>
            {toast.message && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--spring-fast)',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress countdown indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          background: 'var(--border-subtle)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: toast.type === 'success' ? 'var(--status-success)' : 'var(--accent-primary)',
            transition: 'width 50ms linear',
          }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
      }}
    >
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
