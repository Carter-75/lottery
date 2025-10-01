"use client";

import React, { useEffect, useState, useCallback } from 'react';

interface Symbol {
  id: number;
  left: string;
  delay: string;
  duration: string;
  symbol: string;
  size: string;
  opacity: string;
}

const MoneyBackground: React.FC = () => {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const moneySymbols = ['$', '€', '£', '¥', '₿', '💰', '💎', '🏆', '💵', '💳'];

  const generateSymbols = useCallback(() => {
    const newSymbols = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 120 - 10}vw`,
      delay: `${Math.random() * -15}s`,
      duration: `${8 + Math.random() * 12}s`,
      symbol: moneySymbols[Math.floor(Math.random() * moneySymbols.length)],
      size: `${1.2 + Math.random() * 2}rem`,
      opacity: `${0.05 + Math.random() * 0.1}`,
    }));
    setSymbols(newSymbols);
  }, []);

  useEffect(() => {
    generateSymbols();
    
    // Regenerate symbols periodically for variety
    const interval = setInterval(generateSymbols, 30000);
    
    return () => clearInterval(interval);
  }, [generateSymbols]);

  // Respect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsVisible(!mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsVisible(!e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="money-background" aria-hidden="true" role="presentation">
      {symbols.map(s => (
        <span
          key={s.id}
          className="dollar-sign"
          style={{
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
            fontSize: s.size,
            opacity: s.opacity,
          }}
        >
          {s.symbol}
        </span>
      ))}
      
      {/* Subtle gradient overlay for better text readability */}
      <div 
        className="background-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(220, 38, 38, 0.02) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default MoneyBackground; 