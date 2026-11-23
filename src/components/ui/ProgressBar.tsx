import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: 'brick' | 'walnut' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'brick',
  size = 'md',
  label,
  showPercentage = false,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? '4px' : size === 'lg' ? '10px' : '6px';
  const fillClass = `progress-fill-${variant}`;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }} className={className}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
          {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
          {showPercentage && (
            <span className="font-tabular" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill ${fillClass}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
