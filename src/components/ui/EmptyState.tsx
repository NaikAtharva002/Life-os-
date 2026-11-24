import React from 'react';
import { EmptyStateIllustration, type IllustrationType } from './EmptyStateIllustration';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: IllustrationType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  title,
  description,
  action,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        gap: '14px',
        ...style,
      }}
    >
      {illustration ? (
        <EmptyStateIllustration type={illustration} size={68} />
      ) : icon ? (
        <div
          style={{
            width: '44px',
            height: '44px',
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
      <div style={{ maxWidth: '380px' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h4>
        {description && (
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '2px' }}>{action}</div>}
    </div>
  );
};
