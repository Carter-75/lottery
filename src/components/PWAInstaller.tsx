'use client';
import { useEffect, useState } from 'react';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    
    if (choice.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallButton(false);
    }
    
    setInstallPrompt(null);
  };

  if (!showInstallButton) return null;

  return (
    <div className="notification is-info is-light" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '20px', 
      right: '20px', 
      zIndex: 1000,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <button 
        className="delete" 
        onClick={() => setShowInstallButton(false)}
        aria-label="Close install prompt"
      />
      <div className="content">
        <p><strong>Install Lottery Calculator</strong></p>
        <p>Install this app for quick access and offline use!</p>
        <button 
          className="button is-primary is-small"
          onClick={handleInstallClick}
        >
          📱 Install App
        </button>
      </div>
    </div>
  );
}