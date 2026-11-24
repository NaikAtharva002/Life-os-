import React from 'react';
import { EmptyStateIllustration, type IllustrationType } from './EmptyStateIllustration';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: IllustrationType;
  badge?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  badge,
  title,
  description,
  action,
  secondaryAction,
  style,
}) => {
  return (
    <div
      className="empty-state-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '44px 24px',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg, 12px)',
        background: 'var(--bg-surface)',
        gap: '14px',
        ...style,
      }}
    >
      {badge && (
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          {badge}
        </span>
      )}

      {illustration ? (
        <EmptyStateIllustration type={illustration} size={72} />
      ) : icon ? (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--palette-brick-subtle)',
            color: 'var(--palette-brick)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      ) : null}
      <div style={{ maxWidth: '420px' }}>
        <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h4>
        {description && (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
