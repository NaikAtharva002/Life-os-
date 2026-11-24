import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`.trim()}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-elevated)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default Skeleton;
