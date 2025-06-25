import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLoading } from '../context';
import { beltColors } from '../utils/constants';
import {
  RootStackParamList,
  MainTabParamList,
  FindStackParamList,
} from './types';

// Import your existing contexts
import { useTheme } from '../context/ThemeContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LocationScreen from '../screens/LocationScreen';
import TimeSelectionScreen from '../screens/TimeSelectionScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SavedScreen from '../screens/SavedScreen';
import { Text } from 'react-native';

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const FindStack = createStackNavigator<FindStackParamList>();

// Find Stack Navigator (Location → TimeSelection → Results)
const FindStackNavigator = () => {
  const { theme } = useTheme();
  const { hideLoading } = useLoading();
  
  return (
    <FindStack.Navigator
      initialRouteName="Location"
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
      screenListeners={{
        focus: () => {
          // Hide loading when any screen in the Find stack is focused
          hideLoading();
        },
      }}
    >
      <FindStack.Screen 
        name="Location" 
        component={LocationScreen}
        options={{ title: 'Select Location' }}
      />
      <FindStack.Screen 
        name="TimeSelection" 
        component={TimeSelectionScreen}
        options={{ title: 'Select Time' }}
      />
      <FindStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{ 
          title: 'Open Mats Near You',
          headerShown: false
        }}
      />
    </FindStack.Navigator>
  );
};

// Main Tab Navigator (Home, Find, Favorites)
const MainTabNavigator = () => {
  const { userBelt } = useApp();
  const { theme } = useTheme();
  const beltColor = beltColors[userBelt];
  const { showLoading, hideLoading } = useLoading();

  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Find') {
            iconName = 'location';
          } else if (route.name === 'Favorites') {
            iconName = 'heart';
          } else {
            iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: beltColor.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
      screenListeners={{
        tabPress: (e) => {
          // Show loading immediately
          showLoading();
        },
        focus: () => {
          // Hide loading when tab is focused (navigation complete)
          hideLoading();
        },
      }}
    >
      <MainTabs.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, fontWeight: '600' }}>Home</Text> }}
      />
      <MainTabs.Screen 
        name="Find" 
        component={FindStackNavigator}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, fontWeight: '600' }}>Find</Text> }}
      />
      <MainTabs.Screen 
        name="Favorites" 
        component={SavedScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, fontWeight: '600' }}>Favorites</Text> }}
      />
    </MainTabs.Navigator>
  );
};

// Root Navigator (Login → Main Tabs)
const AppNavigator = () => {
  const { theme } = useTheme();
  const { hideLoading } = useLoading();

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
      <RootStack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
        screenListeners={{
          focus: () => {
            // Hide loading when any screen in the root stack is focused
            hideLoading();
          },
        }}
      >
        <RootStack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <RootStack.Screen 
          name="Main" 
          component={MainTabNavigator}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 