import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES } from '../config/featureFlags';
import { logger } from '../utils';

export const syncFavorites = async (userId: string, favorites: number[]) => {
  // Local AsyncStorage implementation
  try {
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (error) {
    logger.error('FavoritesService: Error saving favorites locally:', error);
    throw error;
  }
};

export const getFavorites = async (userId: string): Promise<number[]> => {
  // Local AsyncStorage implementation
  try {
    const data = await AsyncStorage.getItem('favorites');
    const favorites = data ? JSON.parse(data) : [];
    return favorites;
  } catch (error) {
    logger.error('FavoritesService: Error getting local favorites:', error);
    return [];
  }
};
