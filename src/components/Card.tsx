import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card rounded-lg p-4 sm:p-6 border border-entry-border ${className}`}>
      {children}
    </div>
  );
};

export default Card; 