import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private prefix = 'jjmat_';

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(filteredKeys);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
}

export const storageService = new StorageService();