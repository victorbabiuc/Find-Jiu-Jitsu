import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import context providers
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import { LoadingProvider, useLoading } from './src/context/LoadingContext';
import LoadingScreen from './src/screens/LoadingScreen';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Global loading overlay component
const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return <LoadingScreen />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <LoadingProvider>
                <AppNavigator />
                <GlobalLoadingOverlay />
                <StatusBar style="auto" />
              </LoadingProvider>
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
