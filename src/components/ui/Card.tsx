import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'island';
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  selected = false,
  children,
  className = '',
  style,
  ...props
}) => {
  let baseClass = 'card';
  if (variant === 'elevated') baseClass = 'card-elevated';
  if (variant === 'interactive') baseClass = 'card card-interactive';
  if (variant === 'island') baseClass = 'editorial-island';

  const selectedClass = selected ? 'card-selected' : '';

  return (
    <div
      className={`${baseClass} ${selectedClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
