import React from 'react';

interface BrandMarkProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

/**
 * Continuous-line monochrome monogram representing LIFE OS:
 * a single unbroken architectural path uniting structure (L) and human rhythm (O).
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 28,
  showWordmark = false,
  showTagline = false,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, Math.round(size * 0.24)),
          background: 'var(--text-primary)',
          color: 'var(--bg-void)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--border-medium)',
        }}
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Continuous single-stroke L-O monogram with an inner rhythm node */}
          <path
            d="M8 6.5V22.5C8 24.1569 9.34315 25.5 11 25.5H20.5C23.5376 25.5 26 23.0376 26 20V14C26 10.9624 23.5376 8.5 20.5 8.5C17.4624 8.5 15 10.9624 15 14V20C15 21.6569 16.3431 23 18 23H21.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20.5" cy="14.5" r="1.4" fill="currentColor" />
        </svg>
      </span>

      {(showWordmark || showTagline) && (
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {showWordmark && (
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.15,
              }}
            >
              LIFE OS
            </span>
          )}
          {showTagline && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: 2,
                whiteSpace: 'nowrap',
              }}
            >
              YOUR LIFE. ONE OPERATING SYSTEM.
            </span>
          )}
        </span>
      )}
    </div>
  );
};
