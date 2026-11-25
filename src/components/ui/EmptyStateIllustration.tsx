import React from 'react';

export type IllustrationType =
  | 'goals'
  | 'tasks'
  | 'habits'
  | 'finance'
  | 'fitness'
  | 'academics'
  | 'career'
  | 'notes'
  | 'search';

export interface EmptyStateIllustrationProps {
  type: IllustrationType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  type,
  size = 72,
  className = '',
  style,
}) => {
  const brick = 'var(--accent-primary)';
  const brickSubtle = 'var(--accent-subtle)';
  const walnut = 'var(--accent-secondary)';
  const walnutSubtle = 'var(--accent-secondary-subtle)';
  const silver = 'var(--text-muted)';
  const border = 'var(--border-default)';

  switch (type) {
    case 'goals':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <circle cx="36" cy="36" r="30" fill={brickSubtle} stroke={border} strokeWidth="1.5" />
          <circle cx="36" cy="36" r="21" stroke={walnut} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="36" cy="36" r="12" fill={brick} opacity="0.15" />
          <circle cx="36" cy="36" r="5" fill={brick} />
          {/* North needle flag */}
          <path d="M36 12L40 22H32L36 12Z" fill={brick} />
          <path d="M36 36L48 24" stroke={walnut} strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="24" r="3" fill={walnut} />
        </svg>
      );

    case 'tasks':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <rect x="18" y="14" width="36" height="46" rx="6" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <rect x="26" y="10" width="20" height="7" rx="3.5" fill={walnut} />
          {/* Task rows */}
          <line x1="28" y1="26" x2="48" y2="26" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="36" x2="48" y2="36" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="46" x2="42" y2="46" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          {/* Check icon */}
          <circle cx="23" cy="26" r="3" fill={brick} />
          <circle cx="23" cy="36" r="3" fill={brick} />
          <circle cx="23" cy="46" r="3" fill="var(--border-default)" />
        </svg>
      );

    case 'habits':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <rect x="14" y="16" width="44" height="42" rx="8" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <rect x="14" y="16" width="44" height="12" rx="8" fill={walnutSubtle} />
          <line x1="22" y1="12" x2="22" y2="18" stroke={brick} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="12" x2="50" y2="18" stroke={brick} strokeWidth="2.5" strokeLinecap="round" />
          {/* Streak Flame */}
          <path
            d="M36 33C33 37 32 40 33 43C34 46 37 47 39 46C41 45 42 43 41 41C40 39 39 37 40 35C41 37 43 38 43 40C43 43 40 47 36 47C31 47 28 43 30 38C31 35 34 33 36 33Z"
            fill={brick}
          />
        </svg>
      );

    case 'finance':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <rect x="15" y="16" width="42" height="42" rx="8" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <path d="M22 46L30 38L37 42L48 27" stroke={brick} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 27H48V33" stroke={brick} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="48" cy="27" r="3" fill={walnut} />
          {/* Bottom baseline */}
          <line x1="22" y1="50" x2="50" y2="50" stroke={border} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'fitness':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          {/* Barbell weights */}
          <rect x="14" y="33" width="44" height="6" rx="3" fill={walnut} />
          <rect x="18" y="24" width="7" height="24" rx="3.5" fill={brick} />
          <rect x="47" y="24" width="7" height="24" rx="3.5" fill={brick} />
          <rect x="12" y="27" width="5" height="18" rx="2.5" fill={silver} />
          <rect x="55" y="27" width="5" height="18" rx="2.5" fill={silver} />
        </svg>
      );

    case 'academics':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          {/* Book */}
          <path d="M36 24C31 21 21 21 16 23V49C21 47 31 47 36 50C41 47 51 47 56 49V23C51 21 41 21 36 24Z" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <line x1="36" y1="24" x2="36" y2="50" stroke={brick} strokeWidth="2" />
          {/* Mortarboard cap outline */}
          <path d="M36 12L52 19L36 26L20 19L36 12Z" fill={brick} />
          <path d="M52 19V26" stroke={walnut} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'career':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          {/* Briefcase */}
          <rect x="16" y="24" width="40" height="30" rx="6" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <path d="M28 24V18C28 16.5 29.5 15 31 15H41C42.5 15 44 16.5 44 18V24" stroke={brick} strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="36" x2="56" y2="36" stroke={walnut} strokeWidth="1.5" />
          <rect x="32" y="32" width="8" height="8" rx="2" fill={brick} />
        </svg>
      );

    case 'notes':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <rect x="22" y="16" width="34" height="44" rx="6" fill="var(--bg-elevated)" stroke={border} strokeWidth="1.5" />
          <rect x="16" y="20" width="34" height="44" rx="6" fill="var(--bg-surface)" stroke={border} strokeWidth="1.5" />
          <line x1="22" y1="30" x2="40" y2="30" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="38" x2="42" y2="38" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="46" x2="34" y2="46" stroke={silver} strokeWidth="2" strokeLinecap="round" />
          <circle cx="43" cy="46" r="3" fill={brick} />
        </svg>
      );

    case 'search':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <circle cx="33" cy="33" r="17" fill={brickSubtle} stroke={brick} strokeWidth="2" />
          <line x1="45" y1="45" x2="57" y2="57" stroke={walnut} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
};

export default EmptyStateIllustration;
