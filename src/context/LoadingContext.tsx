import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  loadingDuration: number;
  showLoading: (message?: string, duration?: number) => void;
  hideLoading: () => void;
  showTransitionalLoading: (message?: string, duration?: number) => void;
  hideTransitionalLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Discovering open mat sessions...");
  const [loadingDuration, setLoadingDuration] = useState(2000);

  const showLoading = useCallback((message?: string, duration?: number) => {
    if (message) setLoadingMessage(message);
    if (duration) setLoadingDuration(duration);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => setIsLoading(false), []);

  const showTransitionalLoading = useCallback((message?: string, duration?: number) => {
    if (message) setLoadingMessage(message);
    if (duration) setLoadingDuration(duration);
    setIsLoading(true);
  }, []);

  const hideTransitionalLoading = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      loadingMessage, 
      loadingDuration,
      showLoading, 
      hideLoading,
      showTransitionalLoading,
      hideTransitionalLoading
    }}>
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