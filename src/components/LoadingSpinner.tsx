'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const spinnerStyle = {
    width: size === 'small' ? '24px' : size === 'medium' ? '40px' : '64px',
    height: size === 'small' ? '24px' : size === 'medium' ? '40px' : '64px',
    border: `${size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px'} solid var(--bg-quaternary)`,
    borderTop: `${size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px'} solid ${color || 'var(--primary-500)'}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div className={`loader ${className}`} style={spinnerStyle} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;