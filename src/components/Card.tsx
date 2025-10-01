import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  padding?: 'small' | 'medium' | 'large';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'medium',
  hover = true
}) => {
  const variantClasses = {
    default: '',
    primary: 'card-primary',
    secondary: 'card-secondary', 
    accent: 'card-accent'
  };

  const paddingClasses = {
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large'
  };

  const cardClasses = [
    'card',
    'professional-card',
    variantClasses[variant],
    paddingClasses[padding],
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card; 