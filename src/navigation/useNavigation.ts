import { useNavigation as useRNNavigation } from '@react-navigation/native';
import {
  RootStackNavigationProp,
  MainTabNavigationProp,
  FindStackNavigationProp,
} from './types';

// Typed navigation hooks for different navigators
export const useRootNavigation = () => useRNNavigation<RootStackNavigationProp>();
export const useMainTabNavigation = () => useRNNavigation<MainTabNavigationProp>();
export const useFindNavigation = () => useRNNavigation<FindStackNavigationProp>();

// Generic navigation hook that returns the appropriate navigation prop based on context
export const useNavigation = () => {
  const rootNavigation = useRootNavigation();
  const mainTabNavigation = useMainTabNavigation();
  const findNavigation = useFindNavigation();

  return {
    root: rootNavigation,
    mainTab: mainTabNavigation,
    find: findNavigation,
  };
}; 