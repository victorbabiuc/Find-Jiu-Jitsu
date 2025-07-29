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
  website: string;
  distance: string;
  matFee: string;
  dropInFee: string;
  sessionDay: string;
  sessionTime: string;
  sessionType: string;
  coordinates?: string;
  lastUpdated?: string; // Optional YYYY-MM-DD format date
}

class GitHubDataService {
  private readonly CACHE_PREFIX = 'github_gym_data_';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // GitHub raw URLs for CSV files
  private readonly CSV_URLS = {
    'tampa': 'https://raw.githubusercontent.com/victorbabiuc/Find-Jiu-Jitsu/main/data/tampa-gyms.csv',
    'austin': 'https://raw.githubusercontent.com/victorbabiuc/Find-Jiu-Jitsu/main/data/austin-gyms.csv'
  };

  /**
   * Check if cached data is stale and needs refreshing
   * @param location - The location to check
   * @returns Promise<boolean> - True if data needs refreshing
   */
  async isDataStale(location: string): Promise<boolean> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${location.toLowerCase()}`;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return true; // No cache, needs fresh data
      }

      const cached: CachedData = JSON.parse(cachedString);
      const age = Date.now() - cached.timestamp;
      
      // Cache duration: 1 hour
      return age > (60 * 60 * 1000); // 1 hour
    } catch (error) {
      console.error(`Error checking if data is stale for ${location}:`, error);
      return true; // Assume stale if error
    }
  }

  /**
   * Fetch gym data for a specific location
   * @param location - The location to fetch data for ('tampa' or 'austin')
   * @param forceRefresh - Whether to bypass cache and fetch fresh data
   * @returns Promise<OpenMat[]> - Array of gym data
   */
  async getGymData(location: string, forceRefresh: boolean = false): Promise<OpenMat[]> {
    // Ensure location is never undefined or empty
    const safeLocation = location || 'tampa';
    
    try {
      const normalizedLocation = safeLocation.toLowerCase();
      
      // Check if data is stale or force refresh is requested
      const isStale = await this.isDataStale(normalizedLocation);
      
      // Check cache first (unless force refresh or data is stale)
      if (!forceRefresh && !isStale) {
        const cachedData = await this.getCachedData(normalizedLocation);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch fresh data from GitHub
      const csvData = await this.fetchCSVFromGitHub(normalizedLocation);
      const parsedData = this.parseCSVToOpenMats(csvData);
      
      // Cache the new data
      await this.cacheData(normalizedLocation, parsedData);
      
      return parsedData;
    } catch (error) {
      console.error(`❌ GitHubDataService: Error fetching data for ${safeLocation}:`, error);
      
      // Fallback to cached data if available
      const cachedData = await this.getCachedData(safeLocation.toLowerCase());
      if (cachedData) {
        return cachedData;
      }
      
      // Return empty array if no cached data available
      console.warn(`⚠️ GitHubDataService: No data available for ${safeLocation}`);
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

    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limited - try to use cached data
        console.log('⚠️ GitHubDataService: Rate limited, falling back to cache');
        const cachedData = await this.getCachedData(location);
        if (cachedData) {
          console.log('✅ Using cached data due to rate limit');
          return this.convertOpenMatsToCSV(cachedData);
        }
        throw new Error('Rate limited and no cached data available');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      // Always try cache on any error
      const cachedData = await this.getCachedData(location);
      if (cachedData) {
        console.log('✅ Using cached data due to error:', error);
        return this.convertOpenMatsToCSV(cachedData);
      }
      throw error;
    }
  }

  /**
   * Convert OpenMat[] back to CSV format for cache fallback
   * @param openMats - Array of OpenMat objects
   * @returns string - CSV formatted data
   */
  private convertOpenMatsToCSV(openMats: OpenMat[]): string {
    // CSV header
    const headers = ['id', 'name', 'address', 'website', 'distance', 'matFee', 'dropInFee', 'sessionDay', 'sessionTime', 'sessionType', 'coordinates', 'lastUpdated'];
    const csvRows = [headers.join(',')];
    
    // Convert each gym and its sessions to CSV rows
    openMats.forEach(gym => {
      gym.openMats?.forEach(session => {
        const row = [
          gym.id,
          gym.name,
          gym.address,
          gym.website || '',
          gym.distance.toString(),
          gym.matFee?.toString() || '0',
          gym.dropInFee?.toString() || '',
          session.day,
          session.time,
          session.type,
          gym.coordinates || '',
          gym.lastUpdated || ''
        ];
        
        // Escape commas in fields and wrap in quotes if needed
        const escapedRow = row.map(field => {
          const str = field.toString();
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        
        csvRows.push(escapedRow.join(','));
      });
    });
    
    return csvRows.join('\n');
  }

  /**
   * Sort sessions by day order (Friday, Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday)
   * @param sessions - Array of sessions to sort
   * @returns Sorted array of sessions
   */
  private sortSessionsByDay(sessions: OpenMatSession[]): OpenMatSession[] {
    const dayOrder = {
      'Friday': 1,
      'Saturday': 2, 
      'Sunday': 3,
      'Monday': 4,
      'Tuesday': 5,
      'Wednesday': 6,
      'Thursday': 7
    };

    return sessions.sort((a, b) => {
      const orderA = dayOrder[a.day as keyof typeof dayOrder] || 999;
      const orderB = dayOrder[b.day as keyof typeof dayOrder] || 999;
      return orderA - orderB;
    });
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
    const requiredHeaders = ['id', 'name', 'address', 'distance', 'matFee', 'dropInFee', 'sessionDay', 'sessionTime', 'sessionType'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
    }

    // Parse CSV rows
    const csvRows: CSVRow[] = lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const row = {
        id: values[headers.indexOf('id')] || '',
        name: values[headers.indexOf('name')] || '',
        address: values[headers.indexOf('address')] || '',
        website: values[headers.indexOf('website')] || '',
        distance: values[headers.indexOf('distance')] || '0',
        matFee: values[headers.indexOf('matFee')] || '0',
        dropInFee: values[headers.indexOf('dropInFee')] || '',
        sessionDay: values[headers.indexOf('sessionDay')] || '',
        sessionTime: values[headers.indexOf('sessionTime')] || '',
        sessionType: values[headers.indexOf('sessionType')] || 'both',
        coordinates: values[headers.indexOf('coordinates')] || undefined,
        lastUpdated: values[headers.indexOf('lastUpdated')] || undefined
      };
      

      
      return row;
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
        const gym = {
          id: row.id,
          name: row.name,
          address: row.address,
          website: row.website && row.website.trim() !== '' ? row.website : undefined,
          distance: parseFloat(row.distance) || 0,
          matFee: parseInt(row.matFee) || 0,
          dropInFee: row.dropInFee && row.dropInFee.trim() !== '' ? parseInt(row.dropInFee) : undefined,
          coordinates: row.coordinates && row.coordinates.trim() !== '' ? row.coordinates : undefined,
          lastUpdated: this.parseLastUpdatedDate(row.lastUpdated),
          openMats: []
        };
        

        
        gymMap.set(row.id, gym);
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

    // Sort sessions by day order for each gym
    const sortedGyms = Array.from(gymMap.values()).map(gym => ({
      ...gym,
      openMats: this.sortSessionsByDay(gym.openMats)
    }));

    // Debug log for South Tampa Jiu Jitsu to verify sorting
    // Session sorting completed silently

    return sortedGyms;
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
   * @returns 'gi' | 'nogi' | 'both' | 'mma' | string - Normalized session type
   */
  private validateSessionType(type: string): 'gi' | 'nogi' | 'both' | 'mma' | string {
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
        return 'both';
      case 'mma':
      case 'mma sparring':
      case 'sparring':
        return 'mma';
      default:
        // Preserve original session type for custom types like "MMA Sparring"
        return type.trim();
    }
  }

  /**
   * Parse last updated date from CSV string (YYYY-MM-DD) to ISO string
   * @param lastUpdated - YYYY-MM-DD string or undefined
   * @returns ISO string or undefined
   */
  private parseLastUpdatedDate(lastUpdated: string | undefined): string | undefined {
    if (!lastUpdated) {
      return undefined;
    }
    try {
      const date = new Date(lastUpdated);
      return date.toISOString();
    } catch (e) {
      console.warn(`Could not parse lastUpdated date: ${lastUpdated}`, e);
      return undefined;
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
   * Clear cache for a specific location
   * @param location - The location to clear cache for
   */
  async clearCache(location?: string): Promise<void> {
    try {
      if (location) {
        const cacheKey = `${this.CACHE_PREFIX}${location.toLowerCase()}`;
        await AsyncStorage.removeItem(cacheKey);

      } else {
        // Clear all location caches
        const keys = Object.keys(this.CSV_URLS);
        for (const key of keys) {
          const cacheKey = `${this.CACHE_PREFIX}${key}`;
          await AsyncStorage.removeItem(cacheKey);
        }

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
    // Clear cache first, then fetch fresh data
    await this.clearCache(location);
    return this.getGymData(location, true);
  }

  /**
   * Force refresh Tampa data specifically for Gracie Tampa South website update
   * @returns Promise<OpenMat[]> - Fresh Tampa data
   */
  async forceRefreshTampaData(): Promise<OpenMat[]> {
    console.log('🔄 Force refreshing Tampa data for Gracie Tampa South website...');
    await this.clearCache('tampa');
    return this.getGymData('tampa', true);
  }

  /**
   * Get the last update timestamp for a location
   * @param location - The location to check
   * @returns Promise<number | null> - Timestamp of last update or null if no cache
   */
  async getLastUpdateTime(location: string): Promise<number | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${location.toLowerCase()}`;
      const cachedString = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedString) {
        return null;
      }

      const cached: CachedData = JSON.parse(cachedString);
      return cached.timestamp;
    } catch (error) {
      console.error(`Error getting last update time for ${location}:`, error);
      return null;
    }
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
   * Clear all cached data and force refresh
   * @returns Promise<void>
   */
  async clearAllCacheAndRefresh(): Promise<void> {
    try {
      await this.clearCache();
    } catch (error) {
      console.error('❌ GitHubDataService: Error clearing cache:', error);
    }
  }

  /**
   * Force refresh data for all locations
   * @returns Promise<{ tampa: OpenMat[], austin: OpenMat[] }>
   */
  async forceRefreshAllData(): Promise<{ tampa: OpenMat[], austin: OpenMat[] }> {
    const [tampaData, austinData] = await Promise.all([
      this.getGymData('tampa', true),
      this.getGymData('austin', true)
    ]);
    
    return { tampa: tampaData, austin: austinData };
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