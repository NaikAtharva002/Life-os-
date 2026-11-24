import React from 'react';
import { X, Sparkles, type LucideIcon } from 'lucide-react';
import useStore from '../store/useStore';

export interface ContextualTipBannerProps {
  tipId: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export default function ContextualTipBanner({
  tipId,
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onAction,
  style,
}: ContextualTipBannerProps) {
  const settings = useStore((s) => s.settings);
  const dismissTip = useStore((s) => s.dismissTip);

  const isDismissed = settings?.dismissedTips?.includes(tipId);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    dismissTip(tipId);
  };

  return (
    <div
      className="contextual-tip-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '10px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--palette-brick-border, rgba(184, 12, 9, 0.25))',
        borderLeft: '4px solid var(--palette-brick)',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        animation: 'fadeIn 0.25s ease-out',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '260px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--palette-brick-subtle)',
            color: 'var(--palette-brick)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <Icon size={16} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </span>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '1px 6px',
                borderRadius: '8px',
                background: 'var(--palette-brick-subtle)',
                color: 'var(--palette-brick)',
              }}
            >
              Tip
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', padding: '5px 12px' }}
          >
            {actionText}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="btn btn-ghost btn-sm"
          style={{
            fontSize: '11.5px',
            padding: '5px 8px',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Dismiss this tip"
        >
          <span>Got it</span>
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
