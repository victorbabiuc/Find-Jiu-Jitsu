import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenMat, OpenMatSession } from '../types';

interface CachedData {
  data: OpenMat[];
  timestamp: number;
  location: string;
}

interface CSVRow {
  id: string;
  name: string;
  address: string;
  distance: string;
  matFee: string;
  sessionDay: string;
  sessionTime: string;
  sessionType: string;
}

class GitHubDataService {
  private readonly CACHE_PREFIX = 'github_gym_data_';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // GitHub raw URLs for CSV files
  private readonly CSV_URLS = {
    'tampa': 'https://raw.githubusercontent.com/victorbabiuc/OpenMatFinder/main/data/tampa-gyms.csv',
    'austin': 'https://raw.githubusercontent.com/victorbabiuc/OpenMatFinder/main/data/austin-gyms.csv'
  };

  /**
   * Fetch gym data for a specific location
   * @param location - The location to fetch data for ('tampa' or 'austin')
   * @param forceRefresh - Whether to bypass cache and fetch fresh data
   * @returns Promise<OpenMat[]> - Array of gym data
   */
  async getGymData(location: string, forceRefresh: boolean = false): Promise<OpenMat[]> {
    console.log('�� GitHubDataService: Fetching data for', location);
    
    try {
      const normalizedLocation = location.toLowerCase();
      
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = await this.getCachedData(normalizedLocation);
        if (cachedData) {
          console.log('✅ GitHubDataService: Using cached data -', cachedData.length, 'gyms');
          return cachedData;
        }
      }

      // Fetch fresh data from GitHub
      const csvData = await this.fetchCSVFromGitHub(normalizedLocation);
      const parsedData = this.parseCSVToOpenMats(csvData);
      console.log('✅ GitHubDataService: Fresh data loaded -', parsedData.length, 'gyms');
      
      // Cache the new data
      await this.cacheData(normalizedLocation, parsedData);
      
      return parsedData;
    } catch (error) {
      console.error(`❌ GitHubDataService: Error fetching data for ${location}:`, error);
      
      // Fallback to cached data if available
      const cachedData = await this.getCachedData(location.toLowerCase());
      if (cachedData) {
        console.log('✅ GitHubDataService: Using fallback cached data -', cachedData.length, 'gyms');
        return cachedData;
      }
      
      // Return empty array if no cached data available
      console.warn(`⚠️ GitHubDataService: No data available for ${location}`);
      return [];
    }
  }

  /**
   * Fetch CSV data from GitHub raw URL
   * @param location - The location to fetch data for
   * @returns Promise<string> - Raw CSV data
   */
  private async fetchCSVFromGitHub(location: string): Promise<string> {
    const url = this.CSV_URLS[location as keyof typeof this.CSV_URLS];
    
    if (!url) {
      throw new Error(`No CSV URL configured for location: ${location}`);
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Parse CSV data into OpenMat objects
   * @param csvData - Raw CSV string
   * @returns OpenMat[] - Array of parsed gym data
   */
  private parseCSVToOpenMats(csvData: string): OpenMat[] {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    const requiredHeaders = ['id', 'name', 'address', 'distance', 'matFee', 'sessionDay', 'sessionTime', 'sessionType'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
    }

    // Parse CSV rows
    const csvRows: CSVRow[] = lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      return {
        id: values[headers.indexOf('id')] || '',
        name: values[headers.indexOf('name')] || '',
        address: values[headers.indexOf('address')] || '',
        distance: values[headers.indexOf('distance')] || '0',
        matFee: values[headers.indexOf('matFee')] || '0',
        sessionDay: values[headers.indexOf('sessionDay')] || '',
        sessionTime: values[headers.indexOf('sessionTime')] || '',
        sessionType: values[headers.indexOf('sessionType')] || 'both'
      };
    });

    // Group by gym ID
    const gymMap = new Map<string, OpenMat>();
    
    csvRows.forEach(row => {
      if (!row.id || !row.name) {
        console.warn('Skipping row with missing id or name:', row);
        return;
      }

      if (!gymMap.has(row.id)) {
        // Create new gym entry
        gymMap.set(row.id, {
          id: row.id,
          name: row.name,
          address: row.address,
          distance: parseFloat(row.distance) || 0,
          matFee: parseInt(row.matFee) || 0,
          openMats: []
        });
      }

      // Add session to existing gym
      const gym = gymMap.get(row.id)!;
      if (row.sessionDay && row.sessionTime && row.sessionDay.trim() !== '') {
        const session: OpenMatSession = {
          day: row.sessionDay.trim(),
          time: row.sessionTime.trim(),
          type: this.validateSessionType(row.sessionType)
        };
        gym.openMats.push(session);
      }
    });

    return Array.from(gymMap.values());
  }

  /**
   * Parse a single CSV line, handling quoted values
   * @param line - CSV line string
   * @returns string[] - Array of parsed values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last value
    values.push(current.trim());
    
    return values;
  }

  /**
   * Validate and normalize session type
   * @param type - Raw session type from CSV
   * @returns 'gi' | 'nogi' | 'both' - Normalized session type
   */
  private validateSessionType(type: string): 'gi' | 'nogi' | 'both' {
    const normalized = type.toLowerCase().trim();
    
    switch (normalized) {
      case 'gi':
      case 'g':
        return 'gi';
      case 'nogi':
      case 'no-gi':
      case 'no gi':
      case 'n':
        return 'nogi';
      case 'both':
      case 'b':
      default:
        return 'both';
    }
  }

  /**
   * Get cached data for a location
   * @param location - The location to get cached data for
   * @returns Promise<OpenMat[] | null> - Cached data or null if not found/expired
   */
  private async getCachedData(location: string): Promise<OpenMat[] | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + location;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const parsed: CachedData = JSON.parse(cachedData);
      const now = Date.now();
      const age = now - parsed.timestamp;

      // Check if cache is expired
      if (age > this.CACHE_DURATION) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
  }

  /**
   * Cache data for a location
   * @param location - The location to cache data for
   * @param data - The data to cache
   */
  private async cacheData(location: string, data: OpenMat[]): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${location}`;
      const cachedData: CachedData = {
        data,
        timestamp: Date.now(),
        location
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.error(`Error caching data for ${location}:`, error);
    }
  }

  /**
   * Clear cache for a specific location or all locations
   * @param location - Optional location to clear cache for. If not provided, clears all cache.
   */
  async clearCache(location?: string): Promise<void> {
    try {
      if (location) {
        const cacheKey = this.CACHE_PREFIX + location.toLowerCase();
        await AsyncStorage.removeItem(cacheKey);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Force refresh data for a location
   * @param location - The location to refresh data for
   * @returns Promise<OpenMat[]> - Fresh data
   */
  async refreshData(location: string): Promise<OpenMat[]> {
    return this.getGymData(location, true);
  }

  /**
   * Get cache status for a location
   * @param location - The location to check
   * @returns Promise<{ hasCache: boolean; age: number | null }> - Cache status
   */
  async getCacheStatus(location: string): Promise<{ hasCache: boolean; age: number | null }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${location.toLowerCase()}`;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return { hasCache: false, age: null };
      }

      const cached: CachedData = JSON.parse(cachedString);
      const age = Date.now() - cached.timestamp;
      
      return { hasCache: true, age };
    } catch (error) {
      console.error(`Error checking cache status for ${location}:`, error);
      return { hasCache: false, age: null };
    }
  }

  /**
   * Get all available locations
   * @returns string[] - Array of available location keys
   */
  getAvailableLocations(): string[] {
    return Object.keys(this.CSV_URLS);
  }

  /**
   * Check if a location is supported
   * @param location - The location to check
   * @returns boolean - Whether the location is supported
   */
  isLocationSupported(location: string): boolean {
    return location.toLowerCase() in this.CSV_URLS;
  }
}

// Export singleton instance
export const githubDataService = new GitHubDataService(); 