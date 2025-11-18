"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Accessible tooltip component
 * Provides additional context on hover/focus with proper ARIA attributes
 */
const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerId = useRef(`tooltip-trigger-${Math.random().toString(36).substr(2, 9)}`);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  return (
    <div 
      className="tooltip-wrapper" 
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div
        id={triggerId.current}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? tooltipId.current : undefined}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId.current}
          role="tooltip"
          className={`tooltip-content tooltip-${position}`}
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'var(--background-light)',
            color: 'var(--text-color)',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid var(--green-dark)',
            fontSize: '0.875rem',
            lineHeight: '1.4',
            maxWidth: '250px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            ...getPositionStyles(position)
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...getArrowStyles(position)
            }}
          />
        </div>
      )}
    </div>
  );
};

function getPositionStyles(position: string): React.CSSProperties {
  switch (position) {
    case 'top':
      return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
    case 'bottom':
      return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
    case 'left':
      return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
    case 'right':
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
    default:
      return {};
  }
}

function getArrowStyles(position: string): React.CSSProperties {
  const arrowColor = 'var(--green-dark)';
  
  switch (position) {
    case 'top':
      return {
        top: '100%',
        left: '50%',
        marginLeft: '-5px',
        borderWidth: '5px 5px 0 5px',
        borderColor: `${arrowColor} transparent transparent transparent`
      };
    case 'bottom':
      return {
        bottom: '100%',
        left: '50%',
        marginLeft: '-5px',
        borderWidth: '0 5px 5px 5px',
        borderColor: `transparent transparent ${arrowColor} transparent`
      };
    case 'left':
      return {
        left: '100%',
        top: '50%',
        marginTop: '-5px',
        borderWidth: '5px 0 5px 5px',
        borderColor: `transparent transparent transparent ${arrowColor}`
      };
    case 'right':
      return {
        right: '100%',
        top: '50%',
        marginTop: '-5px',
        borderWidth: '5px 5px 5px 0',
        borderColor: `transparent ${arrowColor} transparent transparent`
      };
    default:
      return {};
  }
}

export default Tooltip;

