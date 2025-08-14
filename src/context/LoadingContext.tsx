import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  loadingDuration: number;
  isNavigationLoading: boolean;
  showLoading: (message?: string, duration?: number) => void;
  hideLoading: () => void;
  showTransitionalLoading: (message?: string, duration?: number) => void;
  hideTransitionalLoading: () => void;
  showNavigationLoading: (message?: string, duration?: number) => void;
  hideNavigationLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Discovering open mat sessions...');
  const [loadingDuration, setLoadingDuration] = useState(2000);
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);

  // Use ref to track loading state without causing re-renders
  const isLoadingRef = useRef(false);

  const showLoading = useCallback((message?: string, duration?: number) => {
    // Defer state updates to avoid render phase updates
    setTimeout(() => {
      if (message) setLoadingMessage(message);
      if (duration) setLoadingDuration(duration);
      setIsLoading(true);
      isLoadingRef.current = true;
    }, 0);
  }, []);

  const hideLoading = useCallback(() => {
    // Defer state updates to avoid render phase updates
    setTimeout(() => {
      setIsLoading(false);
      isLoadingRef.current = false;
    }, 0);
  }, []);

  const showTransitionalLoading = useCallback((message?: string, duration?: number) => {
    // Defer state updates to avoid render phase updates
    setTimeout(() => {
      if (message) setLoadingMessage(message);
      if (duration) setLoadingDuration(duration);
      setIsLoading(true);
      isLoadingRef.current = true;
    }, 0);
  }, []);

  const hideTransitionalLoading = useCallback(() => {
    // Defer state updates to avoid render phase updates
    setTimeout(() => {
      setIsLoading(false);
      isLoadingRef.current = false;
    }, 0);
  }, []);

  const showNavigationLoading = useCallback((message?: string, duration?: number) => {
    // Use ref to check current state without causing re-renders
    if (!isLoadingRef.current) {
      // Defer state updates to avoid render phase updates
      setTimeout(() => {
        if (message) setLoadingMessage(message);
        if (duration) setLoadingDuration(duration);
        setIsNavigationLoading(true);
        setIsLoading(true);
        isLoadingRef.current = true;
      }, 0);
    }
  }, []); // Removed isLoading dependency

  const hideNavigationLoading = useCallback(() => {
    // Defer state updates to avoid render phase updates
    setTimeout(() => {
      setIsNavigationLoading(false);
      setIsLoading(false);
      isLoadingRef.current = false;
    }, 0);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        loadingDuration,
        isNavigationLoading,
        showLoading,
        hideLoading,
        showTransitionalLoading,
        hideTransitionalLoading,
        showNavigationLoading,
        hideNavigationLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
