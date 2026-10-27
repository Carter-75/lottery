'use client';

import { useState, useEffect, useCallback } from 'react';
import { LotteryData } from '@/lib/types';
import { useIframe } from '@/lib/iframe-context';
import SetupForm from '@/components/SetupForm';
import UpdateView from '@/components/UpdateView';
import MoneyBackground from '@/components/MoneyBackground';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { saveLotteryData, loadLotteryData, clearLotteryData } from '@/lib/storage';

export default function Home() {
  const [data, setData] = useState<LotteryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowSize();
  const { isIframe, isPortfolioEmbed } = useIframe();

  // Data persistence goes through src/lib/storage.ts, the same module the
  // import/export code uses, so the saved format and the exported format can
  // never drift apart again. loadLotteryData also accepts the raw format this
  // page wrote in earlier versions, so existing saved plans still load.
  const saveToLocalStorage = useCallback((data: LotteryData) => {
    if (!saveLotteryData(data)) {
      setError('Failed to save data. Please try again.');
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = loadLotteryData();
      if (savedData) {
        setData(savedData);
      }
    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
      clearLotteryData(); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleSetupComplete = useCallback((newData: LotteryData) => {
    saveToLocalStorage(newData);
    setData(newData);
    setShowConfetti(true);
    setError(null);
  }, [saveToLocalStorage]);

  const handleUpdate = useCallback((updatedData: LotteryData) => {
    saveToLocalStorage(updatedData);
    setData(updatedData);
    setError(null);
  }, [saveToLocalStorage]);

  const handleReset = useCallback(() => {
    try {
      clearLotteryData();
      setData(null);
      setShowConfetti(false);
      setError(null);
    } catch (err) {
      console.error('Failed to reset data:', err);
      setError('Failed to reset data. Please try again.');
    }
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="has-text-centered" style={{ padding: '4rem 0' }}>
          <LoadingSpinner />
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            Loading your financial data...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="notification is-danger">
          <button 
            className="delete" 
            onClick={() => setError(null)}
            aria-label="Close error message"
          ></button>
          <strong>Error:</strong> {error}
        </div>
      );
    }

    if (data) {
      return <UpdateView data={data} onUpdate={handleUpdate} onReset={handleReset} />;
    } else {
      return <SetupForm onSetupComplete={handleSetupComplete} />;
    }
  };

  return (
    <ErrorBoundary>
      <main className="main">
        <MoneyBackground />
        
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#ef4444', '#f97316', '#dc2626', '#ea580c', '#fecaca', '#fed7aa']}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}

        {/* Enhanced Hero Section */}
        <header>
          <section className="hero is-primary is-bold">
            <div className="hero-body">
              <div className="container has-text-centered">
                <div className="columns is-centered">
                  <div className="column is-10">
                    <h1 className="title is-1 mb-4">
                      Professional Lottery Calculator
                    </h1>
                    <h2 className="subtitle is-3 mb-5" style={{ color: 'var(--accent-200)' }}>
                      Make Informed Financial Decisions
                    </h2>
                    {!isPortfolioEmbed && (
                      <p className="is-size-5 has-text-weight-light" style={{ 
                        color: 'var(--text-primary)', 
                        opacity: 0.9,
                        maxWidth: '600px',
                        margin: '0 auto'
                      }}>
                        Compare lump sum vs annuity payments, calculate sustainable withdrawal rates,
                        and model a long-term spending plan. A personal project, built as an
                        estimates-only planning tool.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </header>

        {/* Main Content */}
        <section className="section">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-10-desktop is-12-tablet">
                {renderContent()}
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Hidden in iframe mode */}
        {!isIframe && (
          <footer className="section has-background-dark" style={{ 
            marginTop: 'auto',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--bg-quaternary)'
          }}>
            <div className="container">
              <div className="content has-text-centered">
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  A personal-project calculator for planning hypothetical lottery winnings.
                  <br />
                  <small>
                    This calculator provides estimates for informational purposes only. 
                    Please consult with a qualified financial advisor for personalized advice.
                  </small>
                </p>
              </div>
            </div>
          </footer>
        )}
      </main>
    </ErrorBoundary>
  );
}
