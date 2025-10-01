import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`card ${className || ''}`} style={{
      background: 'var(--background-card)',
      border: '1px solid rgba(232, 93, 4, 0.2)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div className="card-content" style={{ padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
};

export default Card; 