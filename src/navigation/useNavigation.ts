import { useNavigation as useRNNavigation } from '@react-navigation/native';
import {
  RootStackNavigationProp,
  AuthStackNavigationProp,
  MainTabNavigationProp,
  DashboardStackNavigationProp,
  ProfileStackNavigationProp,
} from './types';

// Typed navigation hooks for different navigators
export const useRootNavigation = () => useRNNavigation<RootStackNavigationProp>();
export const useAuthNavigation = () => useRNNavigation<AuthStackNavigationProp>();
export const useMainTabNavigation = () => useRNNavigation<MainTabNavigationProp>();
export const useDashboardNavigation = () => useRNNavigation<DashboardStackNavigationProp>();
export const useProfileNavigation = () => useRNNavigation<ProfileStackNavigationProp>();

// Generic navigation hook that returns the appropriate navigation prop based on context
export const useNavigation = () => {
  const rootNavigation = useRootNavigation();
  const authNavigation = useAuthNavigation();
  const mainTabNavigation = useMainTabNavigation();
  const dashboardNavigation = useDashboardNavigation();
  const profileNavigation = useProfileNavigation();

  return {
    root: rootNavigation,
    auth: authNavigation,
    mainTab: mainTabNavigation,
    dashboard: dashboardNavigation,
    profile: profileNavigation,
  };
}; 