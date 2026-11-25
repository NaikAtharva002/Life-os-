import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(
  (
    {
      id,
      checked,
      onChange,
      label,
      description,
      disabled = false,
      size = 'md',
      className = '',
      style,
    },
    ref
  ) => {
    const boxSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };
    const checkSizes = {
      sm: 11,
      md: 14,
      lg: 17,
    };

    const currentBoxSize = boxSizes[size];
    const currentCheckSize = checkSizes[size];

    const handleClick = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    };

    return (
      <div
        ref={ref}
        id={id}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`interactive-checkbox-group ${disabled ? 'disabled' : ''} ${className}`.trim()}
        style={{
          display: 'inline-flex',
          alignItems: description ? 'flex-start' : 'center',
          gap: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
          ...style,
        }}
      >
        <div
          className={`interactive-checkbox-box ${checked ? 'checked' : ''}`}
          style={{
            width: `${currentBoxSize}px`,
            height: `${currentBoxSize}px`,
            borderRadius: size === 'sm' ? '4px' : '6px',
            border: checked
              ? '1.5px solid var(--palette-brick)'
              : '1.5px solid var(--border-default)',
            background: checked ? 'var(--palette-brick)' : 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: description ? '2px' : 0,
            transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: checked ? '0 2px 6px rgba(99, 102, 241, 0.3)' : 'var(--shadow-xs)',
          }}
        >
          {checked && (
            <Check
              size={currentCheckSize}
              color="var(--text-on-accent)"
              strokeWidth={3}
              style={{
                animation: 'checkboxPop 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}
        </div>

        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label && (
              <span
                style={{
                  fontSize: size === 'sm' ? '12px' : '13.5px',
                  fontWeight: 500,
                  color: checked ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: checked ? 'line-through' : 'none',
                  transition: 'all 160ms ease-out',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            )}
            {description && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
