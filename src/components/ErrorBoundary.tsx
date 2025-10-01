'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="section">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-6">
                <div className="card">
                  <div className="card-content has-text-centered">
                    <h2 className="title is-4" style={{ color: 'var(--error)' }}>
                      Oops! Something went wrong
                    </h2>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      We encountered an unexpected error. Don't worry, your data is safe.
                    </p>
                    {this.state.error && (
                      <details className="mb-4">
                        <summary className="button is-text is-small">
                          Show technical details
                        </summary>
                        <pre className="mt-2 p-3" style={{ 
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          overflow: 'auto',
                          maxHeight: '200px',
                          color: 'var(--text-tertiary)'
                        }}>
                          {this.state.error.message}
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                    <div className="buttons is-centered">
                      <button 
                        className="button is-primary" 
                        onClick={this.handleReset}
                      >
                        Try Again
                      </button>
                      <button 
                        className="button is-outlined" 
                        onClick={() => window.location.reload()}
                      >
                        Refresh Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;