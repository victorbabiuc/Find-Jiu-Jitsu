import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FEATURES } from '../config/featureFlags';

export const syncFavorites = async (userId: string, favorites: number[]) => {
  if (!FEATURES.CLOUD_SYNC) {
    // Local AsyncStorage implementation
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      console.log('✅ FavoritesService: Favorites saved locally');
    } catch (error) {
      console.error('❌ FavoritesService: Error saving favorites locally:', error);
      throw error;
    }
    return;
  }
  // Firebase sync
  try {
    console.log('🔄 FavoritesService: Syncing favorites for user', userId, 'favorites:', favorites);
    await setDoc(doc(firestore, 'users', userId), {
      favorites,
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ FavoritesService: Favorites synced successfully');
  } catch (error) {
    console.error('❌ FavoritesService: Error syncing favorites:', error);
    throw error;
  }
};

export const getFavorites = async (userId: string): Promise<number[]> => {
  if (!FEATURES.CLOUD_SYNC) {
    // Local AsyncStorage implementation
    try {
      const data = await AsyncStorage.getItem('favorites');
      const favorites = data ? JSON.parse(data) : [];
      console.log('✅ FavoritesService: Retrieved local favorites:', favorites);
      return favorites;
    } catch (error) {
      console.error('❌ FavoritesService: Error getting local favorites:', error);
      return [];
    }
  }
  // Firebase get
  try {
    console.log('🔄 FavoritesService: Getting favorites for user', userId);
    const docSnap = await getDoc(doc(firestore, 'users', userId));
    const favorites = docSnap.exists() ? docSnap.data().favorites || [] : [];
    console.log('✅ FavoritesService: Retrieved favorites:', favorites);
    return favorites;
  } catch (error) {
    console.error('❌ FavoritesService: Error getting favorites:', error);
    return [];
  }
}; 