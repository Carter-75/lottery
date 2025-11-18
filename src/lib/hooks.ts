/**
 * Custom React hooks for the lottery calculator
 * Provides reusable logic for keyboard shortcuts and other features
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are currently enabled
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    shortcuts.forEach(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        // Don't trigger if user is typing in an input field
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        event.preventDefault();
        shortcut.callback();
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return shortcuts;
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const query = '(prefers-reduced-motion: reduce)';
  const mediaQuery = window.matchMedia(query);
  
  return mediaQuery.matches;
}

/**
 * Hook for detecting window focus
 * @param onFocus - Callback when window gains focus
 * @param onBlur - Callback when window loses focus
 */
export function useWindowFocus(onFocus?: () => void, onBlur?: () => void) {
  useEffect(() => {
    const handleFocus = () => onFocus?.();
    const handleBlur = () => onBlur?.();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onFocus, onBlur]);
}

