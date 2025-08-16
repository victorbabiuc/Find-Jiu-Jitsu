import React, { useState, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AnimationValue, NavigationState } from '../types';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Easing } from 'react-native';
import { useApp, useLoading, useTheme, useAuth } from '../context';
import { beltColors, selectionColor } from '../utils';
import { RootStackParamList, MainTabParamList, FindStackParamList } from './types';
import { FEATURES } from '../config/featureFlags';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LocationScreen from '../screens/LocationScreen';
import TimeSelectionScreen from '../screens/TimeSelectionScreen';
import ResultsScreen from '../screens/ResultsScreen';
import MapViewScreen from '../screens/MapViewScreen';
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
        gestureEnabled: true, // Enable swipe back gesture for smooth UX
        cardStyleInterpolator: ({ current, layouts }: any) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.out(Easing.cubic),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
              easing: Easing.in(Easing.cubic),
            },
          },
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
        options={{
          headerShown: false,
        }}
      />
      <FindStack.Screen
        name="TimeSelection"
        component={TimeSelectionScreen}
        options={{
          headerShown: false,
        }}
      />
      <FindStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          headerShown: false,
        }}
      />
      <FindStack.Screen
        name="MapView"
        component={MapViewScreen}
        options={{
          headerShown: false,
        }}
      />
    </FindStack.Navigator>
  );
};

// Main Tab Navigator (Home, Find, Favorites)
const MainTabNavigator = () => {
  const { userBelt, favorites } = useApp();
  const { theme } = useTheme();
  const beltColor = beltColors[userBelt];
  const { showTransitionalLoading, hideLoading } = useLoading();

  // Get favorites count for dynamic icon color
  const favoritesCount = favorites.size;

  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home'; // Default value
          let iconColor = color;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Find') {
            iconName = 'location';
          } else if (route.name === 'Favorites') {
            iconName = 'heart';
            // Dynamic color based on favorites count
            iconColor = favoritesCount > 0 ? '#EF4444' : '#6B7280';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: selectionColor,
        tabBarInactiveTintColor: theme.text.secondary,
        headerShown: false,
        // Smooth tab transitions
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        // Add fade transition for tab screens
        cardStyleInterpolator: ({ current, layouts }: AnimationValue) => {
          return {
            cardStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
              easing: Easing.out(Easing.cubic),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 200,
              easing: Easing.in(Easing.cubic),
            },
          },
        },
      })}
      screenListeners={{
        focus: () => {
          // Hide loading when tab is focused (navigation complete)
          hideLoading();
        },
      }}
    >
      <MainTabs.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
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
  const { hideLoading, showNavigationLoading, hideNavigationLoading } = useLoading();
  const lastNavigationTime = useRef<number>(0);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get appropriate loading message based on navigation
  const getLoadingMessage = useCallback((fromRoute: string, toRoute: string): string => {
    const now = Date.now();

    // Prevent rapid navigation spam
    if (now - lastNavigationTime.current < 300) {
      return 'Loading...';
    }
    lastNavigationTime.current = now;

    // Tab navigation messages
    if (fromRoute === 'Home' && toRoute === 'Find') return 'Finding open mats...';
    if (fromRoute === 'Home' && toRoute === 'Favorites') return 'Loading favorites...';
    if (fromRoute === 'Home' && toRoute === 'Profile') return 'Loading profile...';
    if (fromRoute === 'Find' && toRoute === 'Home') return 'Going home...';
    if (fromRoute === 'Find' && toRoute === 'Favorites') return 'Loading favorites...';
    if (fromRoute === 'Find' && toRoute === 'Profile') return 'Loading profile...';
    if (fromRoute === 'Favorites' && toRoute === 'Home') return 'Going home...';
    if (fromRoute === 'Favorites' && toRoute === 'Find') return 'Finding open mats...';
    if (fromRoute === 'Favorites' && toRoute === 'Profile') return 'Loading profile...';
    if (fromRoute === 'Profile' && toRoute === 'Home') return 'Going home...';
    if (fromRoute === 'Profile' && toRoute === 'Find') return 'Finding open mats...';
    if (fromRoute === 'Profile' && toRoute === 'Favorites') return 'Loading favorites...';

    // Find stack navigation messages
    if (toRoute === 'Location') return 'Selecting location...';
    if (toRoute === 'TimeSelection') return 'Choosing time...';
    if (toRoute === 'Results') return 'Loading results...';
    if (toRoute === 'MapView') return 'Loading map...';

    // Root stack navigation
    if (toRoute === 'Login') return 'Signing in...';
    if (toRoute === 'ProfileDetails') return 'Loading details...';

    return 'Loading...';
  }, []);

  // Define navigation transitions that should NOT show loading
  const shouldSkipLoading = (fromRoute: string, toRoute: string): boolean => {
    // Skip loading for city selection (Dashboard → TimeSelection)
    if (fromRoute === 'Home' && toRoute === 'TimeSelection') return true;

    // Skip loading for tab navigation within the same stack
    if (
      ['Home', 'Find', 'Favorites', 'Profile'].includes(fromRoute) &&
      ['Home', 'Find', 'Favorites', 'Profile'].includes(toRoute)
    )
      return true;

    // Skip loading for navigation within the Find stack (except to Results)
    if (
      ['Location', 'TimeSelection', 'MapView'].includes(fromRoute) &&
      ['Location', 'TimeSelection', 'MapView'].includes(toRoute)
    )
      return true;

    // Skip loading for initial route navigation
    if (fromRoute === 'Home' && toRoute === 'Find') return true;

    return false;
  };

  // Handle navigation state changes
  const handleNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (!state || !state.routes || state.routes.length === 0) return;

      const currentRoute = state.routes[state.index];
      const currentRouteName = currentRoute?.name;

      // Get the previous route name from navigation state
      const previousRouteName = state.routes[state.index - 1]?.name || 'Home';

      // Clear any existing timeout
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }

      // Only show loading for navigation transitions that need it
      if (currentRouteName && currentRouteName !== previousRouteName) {
        // Check if we should skip loading for this transition
        if (shouldSkipLoading(previousRouteName, currentRouteName)) {
          console.log(
            `🚀 Skipping loading for navigation: ${previousRouteName} → ${currentRouteName}`
          );
          return;
        }

        const message = getLoadingMessage(previousRouteName, currentRouteName);
        console.log(
          `⏳ Showing loading for navigation: ${previousRouteName} → ${currentRouteName}`
        );

        // Show navigation loading for 600ms (short and snappy)
        showNavigationLoading(message, 600);

        // Auto-hide after 600ms to prevent stuck loading states
        navigationTimeout.current = setTimeout(() => {
          hideNavigationLoading();
        }, 600);
      }
    },
    [showNavigationLoading, hideNavigationLoading, getLoadingMessage]
  );

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
    <NavigationContainer theme={navigationTheme} onStateChange={handleNavigationStateChange}>
      <RootStack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerLeft: () => null,
          gestureEnabled: true,
          // Smooth stack transitions
          cardStyleInterpolator: ({ current, layouts }: AnimationValue) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
                easing: Easing.out(Easing.cubic),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
                easing: Easing.in(Easing.cubic),
              },
            },
          },
        }}
      >
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <RootStack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <RootStack.Screen
          name="ProfileDetails"
          component={ProfileDetailsScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
