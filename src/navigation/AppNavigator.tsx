import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
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
import { useAuth } from '../context/AuthContext';
import { FEATURES } from '../config/featureFlags';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LocationScreen from '../screens/LocationScreen';
import TimeSelectionScreen from '../screens/TimeSelectionScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';


// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const FindStack = createStackNavigator<FindStackParamList>();

// Find Stack Navigator (Location → TimeSelection → Results)
const FindStackNavigator = () => {
  const { theme } = useTheme();
  const { showTransitionalLoading, hideLoading } = useLoading();
  
  return (
    <FindStack.Navigator
      initialRouteName="TimeSelection"
              screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe back gesture
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
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <FindStack.Screen 
        name="TimeSelection" 
        component={TimeSelectionScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <FindStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false
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
  const { showTransitionalLoading, hideLoading } = useLoading();

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
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: beltColor.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        headerShown: false,
      })}
      screenListeners={{
        focus: () => {
          // Hide loading when tab is focused (navigation complete)
          hideLoading();
        },
      }}
    >
      <MainTabs.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTabs.Screen 
        name="Find" 
        component={FindStackNavigator}
        options={{ tabBarLabel: 'Find' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Prevent default behavior
            e.preventDefault();
            // Reset the Find stack to TimeSelection
            navigation.navigate('Find', {
              screen: 'TimeSelection',
            });
          },
        })}
      />
      <MainTabs.Screen 
        name="Favorites" 
        component={SavedScreen}
        options={{ tabBarLabel: 'Favorites' }}
      />
      {FEATURES.PROFILE_TAB && (
        <MainTabs.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profile' }}
        />
      )}
    </MainTabs.Navigator>
  );
};

// Root Navigator (Main Tabs with optional Login)
const AppNavigator = () => {
  const { theme } = useTheme();
  const { hideLoading } = useLoading();

  const navigationTheme = {
    dark: false,
    colors: {
      primary: theme.text.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text.primary,
      border: theme.border,
      notification: theme.text.primary,
    },
  };

  return (
    <NavigationContainer
      theme={navigationTheme}
    >
      <RootStack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerLeft: () => null,
          gestureEnabled: false,
        }}

      >
        <RootStack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <RootStack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <RootStack.Screen 
          name="ProfileDetails" 
          component={ProfileDetailsScreen}
          options={{
            headerShown: false,
            gestureEnabled: true
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 