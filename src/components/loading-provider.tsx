'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GlobalLoading } from '@/src/components/global-loading';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Prevent scrolling and ensure viewport height when loading
  useEffect(() => {
    if (isLoading) {
      // Prevent body scroll and set fixed height
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      // Restore normal scrolling
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isLoading]);

  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const value: LoadingContextType = {
    isLoading,
    showLoading,
    hideLoading,
    setLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <GlobalLoading />}
    </LoadingContext.Provider>
  );
}
