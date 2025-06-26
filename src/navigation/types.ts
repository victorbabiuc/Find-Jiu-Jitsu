import { NavigatorScreenParams } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { ViewType } from '../types';

// Root Navigator Types
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  Find: NavigatorScreenParams<FindStackParamList>;
  Favorites: undefined;
};

// Find Stack Types (nested within Find tab)
export type FindStackParamList = {
  Location: undefined;
  TimeSelection: undefined;
  Results: { 
    location: string;
    dateSelection?: string;
    dates?: Date[];
  };
};

// Screen Names (matching ViewType)
export type ScreenName = ViewType;

// Navigation Props for screens
export type RootStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<MainTabParamList>;
export type FindStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<FindStackParamList>;

// Route Props for screens
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<MainTabParamList, T>;
export type FindStackRouteProp<T extends keyof FindStackParamList> = RouteProp<FindStackParamList, T>; 