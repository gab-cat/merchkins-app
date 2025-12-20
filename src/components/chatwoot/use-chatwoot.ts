'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to interact with the Chatwoot SDK programmatically.
 * Provides methods to toggle the widget, check readiness, and more.
 */
export function useChatwoot() {
  const [isReady, setIsReady] = useState(false);

  // Check if Chatwoot is ready on mount and listen for ready event
  useEffect(() => {
    const checkReady = () => {
      if (typeof window !== 'undefined' && window.$chatwoot) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkReady()) return;

    // Listen for the ready event
    const handleReady = () => {
      setIsReady(true);
    };

    window.addEventListener('chatwoot:ready', handleReady);

    // Also poll as a fallback
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      window.removeEventListener('chatwoot:ready', handleReady);
      clearInterval(interval);
    };
  }, []);

  /**
   * Toggle the Chatwoot widget open/close
   * @param state - Optional state to set ('open' or 'close'). If not provided, toggles current state.
   */
  const toggle = useCallback((state?: 'open' | 'close') => {
    if (typeof window !== 'undefined' && window.$chatwoot) {
      window.$chatwoot.toggle(state);
    } else {
      console.warn('[Chatwoot] SDK not ready, cannot toggle widget');
    }
  }, []);

  /**
   * Open the Chatwoot widget
   */
  const open = useCallback(() => {
    toggle('open');
  }, [toggle]);

  /**
   * Close the Chatwoot widget
   */
  const close = useCallback(() => {
    toggle('close');
  }, [toggle]);

  /**
   * Show or hide the bubble button
   */
  const toggleBubble = useCallback((state: 'show' | 'hide') => {
    if (typeof window !== 'undefined' && window.$chatwoot) {
      window.$chatwoot.toggleBubbleVisibility(state);
    }
  }, []);

  /**
   * Open chat in a popout window
   */
  const popout = useCallback(() => {
    if (typeof window !== 'undefined' && window.$chatwoot) {
      window.$chatwoot.popoutChatWindow();
    }
  }, []);

  return {
    isReady,
    toggle,
    open,
    close,
    toggleBubble,
    popout,
  };
}
