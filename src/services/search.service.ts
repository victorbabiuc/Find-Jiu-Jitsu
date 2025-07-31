import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenMat } from '../types';
import { logger } from '../utils';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export class SearchService {
  /**
   * Get recent searches from AsyncStorage
   */
  static async getRecentSearches(): Promise<string[]> {
    try {
      const recentSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      return recentSearches ? JSON.parse(recentSearches) : [];
    } catch (error) {
      logger.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Save a search query to recent searches
   */
  static async saveRecentSearch(query: string): Promise<void> {
    try {
      const recentSearches = await this.getRecentSearches();
      
      // Remove the query if it already exists
      const filteredSearches = recentSearches.filter(search => search.toLowerCase() !== query.toLowerCase());
      
      // Add the new query to the beginning
      const updatedSearches = [query, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
      
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      logger.error('Error saving recent search:', error);
    }
  }

  /**
   * Clear all recent searches
   */
  static async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      logger.error('Error clearing recent searches:', error);
    }
  }

  /**
   * Generate search suggestions based on gym data
   */
  static generateSuggestions(query: string, gyms: OpenMat[]): string[] {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];

    // Search by gym name
    gyms.forEach(gym => {
      if (gym.name.toLowerCase().includes(lowerQuery)) {
        suggestions.push(gym.name);
      }
    });

    // Search by city/address
    gyms.forEach(gym => {
      if (gym.address.toLowerCase().includes(lowerQuery)) {
        const cityMatch = gym.address.match(/([^,]+),?\s*([A-Z]{2})?/);
        if (cityMatch && cityMatch[1]) {
          const city = cityMatch[1].trim();
          if (!suggestions.includes(city)) {
            suggestions.push(city);
          }
        }
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = Array.from(new Set(suggestions));
    return uniqueSuggestions.slice(0, 8); // Limit to 8 suggestions
  }

  /**
   * Search gyms with enhanced matching
   */
  static searchGyms(query: string, gyms: OpenMat[]): OpenMat[] {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results: OpenMat[] = [];

    gyms.forEach(gym => {
      // Check gym name
      if (gym.name.toLowerCase().includes(lowerQuery)) {
        results.push(gym);
        return;
      }

      // Check address
      if (gym.address.toLowerCase().includes(lowerQuery)) {
        results.push(gym);
        return;
      }

      // Check session types
      if (gym.openMats.some(session => 
        session.type.toLowerCase().includes(lowerQuery) ||
        session.day.toLowerCase().includes(lowerQuery)
      )) {
        results.push(gym);
        return;
      }
    });

    // Remove duplicates based on gym ID (shouldn't be needed now, but keeping for safety)
    const uniqueResults = results.reduce((acc: OpenMat[], gym) => {
      const exists = acc.find(g => g.id === gym.id);
      if (!exists) {
        acc.push(gym);
      }
      return acc;
    }, []);

    return uniqueResults.slice(0, 10); // Limit to 10 results
  }

  /**
   * Get popular gym names for suggestions
   */
  static getPopularGyms(gyms: OpenMat[]): string[] {
    // Return a list of popular gym names for initial suggestions
    const popularGyms = [
      'Gracie',
      '10th Planet',
      'South Tampa Jiu Jitsu',
      'Robson Moura',
      'Kaizen',
      'YCJJC',
      'Tactics Jiu-Jitsu',
      'North River BJJ',
      'Tampa Muay Thai',
      'Gracie Trinity',
      'Gracie Clermont',
      'St Pete BJJ',
      'Inside Control Academy',
      'Tampa Jiu Jitsu',
      'Gracie Tampa South',
      'Collective MMA Tampa',
      'Wesley Chapel Gym',
      'Gracie Jiu Jitsu Largo'
    ];

    // Filter to only include gyms that exist in the data
    const existingGymNames = gyms.map(gym => gym.name);
    return popularGyms.filter(name => 
      existingGymNames.some(gymName => 
        gymName.toLowerCase().includes(name.toLowerCase())
      )
    ).slice(0, 6);
  }
} 