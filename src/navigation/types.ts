import { NavigatorScreenParams } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { ViewType } from '../types';

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Authentication Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Saved: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Dashboard Stack Types (nested within Dashboard tab)
export type DashboardStackParamList = {
  Login: undefined;
  DashboardHome: undefined;
  Location: undefined;
  TimeSelection: undefined;
  Results: { location: string };
};

// Profile Stack Types (nested within Profile tab)
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// Screen Names (matching ViewType)
export type ScreenName = ViewType;

// Navigation Props for screens
export type RootStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<MainTabParamList>;
export type DashboardStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<DashboardStackParamList>;
export type ProfileStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<ProfileStackParamList>;

// Route Props for screens
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<MainTabParamList, T>;
export type DashboardStackRouteProp<T extends keyof DashboardStackParamList> = RouteProp<DashboardStackParamList, T>;
export type ProfileStackRouteProp<T extends keyof ProfileStackParamList> = RouteProp<ProfileStackParamList, T>; 