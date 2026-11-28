import React, { useId } from 'react';

interface RitAvatarProps {
  size?: number;
  thinking?: boolean;
  shape?: 'squircle' | 'circle';
  className?: string;
}

/**
 * Circular cosmic spiral emblem representing RIT ("Harmony, Structure and Order").
 * Pure vector implementation so it stays crisp across DPI scales, offline PWA, and WebGL snapshots.
 */
export const RitAvatar: React.FC<RitAvatarProps> = ({
  size = 36,
  thinking = false,
  shape = 'squircle',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `rit-bg-${uid}`;
  const coreId = `rit-core-${uid}`;
  const armId = `rit-arm-${uid}`;
  const armSecondaryId = `rit-arm2-${uid}`;
  const radius = shape === 'circle' ? '50%' : `${Math.max(8, Math.round(size * 0.24))}px`;

  return (
    <div
      className={`rit-avatar-frame ${thinking ? 'is-thinking' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: radius,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="rit-avatar-svg"
        role="presentation"
      >
        <defs>
          <radialGradient id={bgId} cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="#14324E" />
            <stop offset="48%" stopColor="#081326" />
            <stop offset="100%" stopColor="#03040A" />
          </radialGradient>
          <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F2FEFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#8EEFFF" stopOpacity="0.92" />
            <stop offset="72%" stopColor="#46B8CC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14324E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={armId} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#9EF3FF" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#4CA7BD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1E526D" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id={armSecondaryId} x1="85%" y1="20%" x2="20%" y2="80%">
            <stop offset="0%" stopColor="#72DCEB" stopOpacity="0.72" />
            <stop offset="65%" stopColor="#2F6E87" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10273C" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill={`url(#${bgId})`} />

        {/* Outer soft nebula aura */}
        <circle cx="50" cy="50" r="34" fill={`url(#${coreId})`} opacity="0.52" />

        {/* Orbital spiral vortex arms */}
        <g className={thinking ? 'rit-avatar-spiral is-spinning' : 'rit-avatar-spiral'}>
          <path
            d="M 50 50
               C 53 46, 58 46, 59 51
               C 60 58, 52 63, 44 60
               C 34 56, 33 42, 41 34
               C 52 24, 69 29, 73 44
               C 77 61, 63 77, 45 76
               C 26 75, 16 57, 22 39"
            fill="none"
            stroke={`url(#${armId})`}
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M 50 50
               C 47 54, 42 54, 41 49
               C 40 42, 48 37, 56 40
               C 66 44, 67 58, 59 66
               C 48 76, 31 71, 27 56
               C 23 39, 37 23, 55 24
               C 71 25, 81 40, 77 56"
            fill="none"
            stroke={`url(#${armSecondaryId})`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 50 50
               C 56 50, 62 56, 58 63
               C 52 72, 36 70, 31 58
               C 26 44, 38 28, 54 29
               C 70 30, 81 45, 76 62"
            fill="none"
            stroke={`url(#${armId})`}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>

        {/* Fine cosmic dust / stars */}
        <circle cx="24" cy="26" r="1.15" fill="#DFF9FF" opacity="0.85" />
        <circle cx="76" cy="24" r="0.95" fill="#B6F2FF" opacity="0.7" />
        <circle cx="81" cy="64" r="1.2" fill="#E6FCFF" opacity="0.82" />
        <circle cx="29" cy="77" r="1.05" fill="#9EE7F8" opacity="0.72" />
        <circle cx="62" cy="18" r="0.85" fill="#D5F7FF" opacity="0.65" />
        <circle cx="19" cy="52" r="0.95" fill="#C7F5FF" opacity="0.78" />
        <circle cx="67" cy="79" r="0.9" fill="#94E6F7" opacity="0.7" />
        <circle cx="43" cy="36" r="1.1" fill="#F2FEFF" opacity="0.9" />
        <circle cx="60" cy="61" r="1.1" fill="#E3FCFF" opacity="0.88" />

        {/* Luminous cosmic core */}
        <circle cx="50" cy="50" r="14" fill={`url(#${coreId})`} />
        <circle cx="50" cy="50" r="5.2" fill="#EDFEFF" />
      </svg>
    </div>
  );
};
