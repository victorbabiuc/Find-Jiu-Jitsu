import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import {
  DashboardStackParamList,
} from './types';

// Import your existing contexts
import { useTheme } from '../context/ThemeContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import LocationScreen from '../screens/LocationScreen';
import TimeSelectionScreen from '../screens/TimeSelectionScreen';
import ResultsScreen from '../screens/ResultsScreen';

// Create navigators
const MainStack = createStackNavigator<DashboardStackParamList>();

// Main Stack Navigator (simplified MVP navigation)
const MainStackNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <MainStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text.primary,
        headerTitleStyle: {
          color: theme.text.primary,
          fontWeight: '600',
        },
      }}
    >
      <MainStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Location" 
        component={LocationScreen}
        options={{ title: 'Select Location' }}
      />
      <MainStack.Screen 
        name="TimeSelection" 
        component={TimeSelectionScreen}
        options={{ title: 'Select Time' }}
      />
      <MainStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{ 
          title: 'Open Mats Near You',
          headerShown: false
        }}
      />
    </MainStack.Navigator>
  );
};

// Root Navigator (simplified for MVP)
const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.name === 'dark',
        colors: {
          primary: theme.text.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text.primary,
          border: theme.border,
          notification: theme.text.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <MainStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 