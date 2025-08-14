// Disable console logs in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, UIManager } from 'react-native';

// Force hide any native navigation bars on iOS
if (Platform.OS === 'ios') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(false);
}

// Import context providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import { LoadingProvider, useLoading } from './src/context/LoadingContext';
import TransitionalLoadingScreen from './src/screens/TransitionalLoadingScreen';

// Import services
import { githubDataService } from './src/services/github-data.service';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Pre-loading component that loads gym data after auth completes
const GymDataPreloader: React.FC = () => {
  const { loading: authLoading } = useAuth();
  
  useEffect(() => {
    // Pre-load gym data for both cities after auth completes
    if (!authLoading) {
      console.log('🚀 Pre-loading gym data...');
      
      // Pre-load both cities in parallel
      Promise.all([
        githubDataService.getGymData('tampa'),
        githubDataService.getGymData('austin')
      ]).then(() => {
        console.log('✅ Gym data pre-loaded and cached');
      }).catch(error => {
        console.error('❌ Failed to pre-load gym data:', error);
        // Non-critical error, app continues working
      });
    }
  }, [authLoading]);
  
  return null; // This component doesn't render anything
};

// Global loading overlay component
const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage, loadingDuration, hideLoading } = useLoading();
  
  if (!isLoading) return null;
  
  return (
    <TransitionalLoadingScreen
      message={loadingMessage}
      duration={loadingDuration}
      onComplete={hideLoading}
    />
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <LoadingProvider>
                <GymDataPreloader />
                <AppNavigator />
                <GlobalLoadingOverlay />
                <StatusBar 
                  style="auto" 
                  hidden={false}
                  backgroundColor="transparent"
                  translucent={true}
                />
              </LoadingProvider>
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
