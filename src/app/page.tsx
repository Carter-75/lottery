'use client';

import { useState, useEffect } from 'react';
import { LotteryData } from '@/lib/types';
import SetupForm from '@/components/SetupForm';
import UpdateView from '@/components/UpdateView';
import MoneyBackground from '@/components/MoneyBackground';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function Home() {
  const [data, setData] = useState<LotteryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const savedData = localStorage.getItem('lotteryData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    setIsLoading(false);
  }, []);

  const handleSetupComplete = (newData: LotteryData) => {
    localStorage.setItem('lotteryData', JSON.stringify(newData));
    setData(newData);
    setShowConfetti(true);
  };

  const handleUpdate = (updatedData: LotteryData) => {
    localStorage.setItem('lotteryData', JSON.stringify(updatedData));
    setData(updatedData);
  };

  const handleReset = () => {
    localStorage.removeItem('lotteryData');
    setData(null);
    setShowConfetti(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loader is-loading"></div>;
    }

    if (data) {
      return <UpdateView data={data} onUpdate={handleUpdate} onReset={handleReset} />;
    } else {
      return <SetupForm onSetupComplete={handleSetupComplete} />;
    }
  };

  return (
    <>
      <MoneyBackground />
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <section className="hero is-primary is-bold">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title is-1">Lottery Winnings Calculator</h1>
            <h2 className="subtitle is-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Plan Your Financial Future 💰
            </h2>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-two-thirds">
              {renderContent()}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
