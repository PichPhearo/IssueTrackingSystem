import React from 'react';

type MorphingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface MorphingSpinnerProps {
  size?: MorphingSpinnerSize;
  className?: string;
}

const sizeClasses: Record<MorphingSpinnerSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function MorphingSpinner({ size = 'md', className = '' }: MorphingSpinnerProps) {
  return (
    <div
      className={`relative inline-block shrink-0 ${sizeClasses[size]} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    >
      <div className="morphing-spinner-shape absolute inset-0 bg-current" />
    </div>
  );
}
