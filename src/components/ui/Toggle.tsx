import React from 'react';

export interface ToggleProps {
  id?: string;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      {(label || description) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {label && (
            <label
              htmlFor={toggleId}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {label}
            </label>
          )}
          {description && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {description}
            </span>
          )}
        </div>
      )}
      <label className="form-toggle">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="form-toggle-slider" />
      </label>
    </div>
  );
};
