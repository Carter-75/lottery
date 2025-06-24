import React from 'react';

const PortfolioFrame: React.FC = () => {
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    height: '200px',
    border: '2px solid var(--gold-dark)',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: 'var(--background-dark)'
  };

  const iframeStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  return (
    <div style={containerStyles}>
      <iframe
        src="https://carter-portfolio.fyi"
        style={iframeStyles}
        title="Carter's Portfolio"
      />
    </div>
  );
};

export default PortfolioFrame; 