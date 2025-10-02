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

export default function Home() {
  const [data, setData] = useState<LotteryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowSize();
  const { isIframe, isPortfolioEmbed } = useIframe();

  // Enhanced data persistence with error handling
  const saveToLocalStorage = useCallback((data: LotteryData) => {
    try {
      localStorage.setItem('lotteryData', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save data to localStorage:', err);
      setError('Failed to save data. Please try again.');
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('lotteryData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Validate the data structure
        if (parsedData && parsedData.initial_parameters && parsedData.state) {
          setData(parsedData);
        }
      }
    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
      localStorage.removeItem('lotteryData'); // Clear corrupted data
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
      localStorage.removeItem('lotteryData');
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
                        and plan your financial future with our professional-grade analysis tools.
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
                  Professional financial planning tools for lottery winners.
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
