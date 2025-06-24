"use client";

import React, { useEffect, useState } from 'react';

const MoneyBackground: React.FC = () => {
  const [symbols, setSymbols] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const generateSymbols = () => {
      const newSymbols = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 120 - 10}vw`, // Spread them across the screen, including off-screen
        delay: `${Math.random() * -10}s`, // Start at different times
        duration: `${5 + Math.random() * 5}s`, // Vary the speed
      }));
      setSymbols(newSymbols);
    };
    generateSymbols();
  }, []);

  return (
    <div className="money-background" aria-hidden="true">
      {symbols.map(s => (
        <span
          key={s.id}
          className="dollar-sign"
          style={{
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        >
          $
        </span>
      ))}
    </div>
  );
};

export default MoneyBackground; 