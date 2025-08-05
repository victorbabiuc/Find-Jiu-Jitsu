import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpenMat, OpenMatSession } from '../types';
import { logger } from '../utils';

interface CachedData {
  data: OpenMat[];
  timestamp: number;
  location: string;
  version: string;
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

interface CSVRowNew {
  id: string;
  name: string;
  address: string;
  website: string;
  distance: string;
  matFee: string;
  dropInFee: string;
  coordinates?: string;
  lastUpdated?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

class GitHubDataService {
  private readonly CACHE_PREFIX = 'github_gym_data_';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly CACHE_VERSION = '1.5.2'; // Increment this to force cache refresh
  
  // GitHub raw URLs for CSV files
  private readonly CSV_URLS = {
    'tampa': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/tampa-gyms.csv',
    'austin': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/austin-gyms.csv',
    'miami': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/miami-gyms.csv',
    'stpete': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/stpete-gyms.csv'
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
      
      // Check if cache version is outdated
      if (cached.version !== this.CACHE_VERSION) {
        logger.info(`Cache version mismatch for ${location}: cached=${cached.version}, current=${this.CACHE_VERSION}`);
        return true; // Version mismatch, needs fresh data
      }
      
      const age = Date.now() - cached.timestamp;
      
      // Cache duration: 1 hour
      return age > (60 * 60 * 1000); // 1 hour
    } catch (error) {
      logger.error(`Error checking if data is stale for ${location}:`, error);
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
      const parsedData = this.parseCSVToOpenMats(csvData, normalizedLocation);
      
      // Cache the new data
      await this.cacheData(normalizedLocation, parsedData);
      
      return parsedData;
    } catch (error) {
      logger.error(`GitHubDataService: Error fetching data for ${safeLocation}:`, error);
      
      // Fallback to cached data if available
      const cachedData = await this.getCachedData(safeLocation.toLowerCase());
      if (cachedData) {
        return cachedData;
      }
      
      // Return empty array if no cached data available
      logger.warn(`GitHubDataService: No data available for ${safeLocation}`);
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
        logger.rateLimit('GitHubDataService: Rate limited, falling back to cache');
        const cachedData = await this.getCachedData(location);
        if (cachedData) {
          logger.cache('Using cached data due to rate limit');
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
        logger.cache('Using cached data due to error:', { error });
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
  private parseCSVToOpenMats(csvData: string, location?: string): OpenMat[] {
    // Use new format for St Pete, old format for other cities
    if (location === 'stpete') {
      return this.parseCSVToOpenMatsNewFormat(csvData);
    }
    
    // Use old format for all other cities
    return this.parseCSVToOpenMatsOldFormat(csvData);
  }

  private parseCSVToOpenMatsOldFormat(csvData: string): OpenMat[] {
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

    // Group by gym name to consolidate multiple sessions per gym
    const gymMap = new Map<string, OpenMat>();
    
    csvRows.forEach(row => {
      if (!row.id || !row.name) {
        logger.warn('Skipping row with missing id or name:', { row });
        return;
      }

      const gymName = row.name.trim();
      
      if (!gymMap.has(gymName)) {
        // Create new gym entry using the first occurrence's data
        const gym = {
          id: row.id, // Use the first ID as the primary ID
          name: gymName,
          address: row.address,
          website: row.website && row.website.trim() !== '' ? row.website : undefined,
          distance: parseFloat(row.distance) || 0,
          matFee: parseInt(row.matFee) || 0,
          dropInFee: row.dropInFee && row.dropInFee.trim() !== '' ? parseInt(row.dropInFee) : undefined,
          coordinates: row.coordinates && row.coordinates.trim() !== '' ? row.coordinates : undefined,
          lastUpdated: this.parseLastUpdatedDate(row.lastUpdated),
          openMats: []
        };
        
        gymMap.set(gymName, gym);
      }

      // Add session to existing gym
      const gym = gymMap.get(gymName)!;
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

    // Debug: Log the parsing results
    logger.debug('CSV parsing completed:', { 
      totalRows: csvRows.length,
      uniqueGyms: sortedGyms.length,
      sampleGyms: sortedGyms.slice(0, 5).map(g => ({ name: g.name, sessions: g.openMats.length }))
    });

    return sortedGyms;
  }

  /**
   * Parse session data from new format: "5:00 PM - Gi/NoGi"
   * @param sessionData - Raw session string from CSV
   * @param day - Day of the week (e.g., "sunday")
   * @returns OpenMatSession object or null if no session
   */
  private parseSessionFromDayColumn(sessionData: string, day: string): OpenMatSession | null {
    if (!sessionData || sessionData.trim() === '') {
      return null;
    }
    
    // Handle multiple sessions separated by commas
    const sessions = sessionData.split(',').map(s => s.trim());
    
    // For now, just parse the first session
    const firstSession = sessions[0];
    
    // Parse "5:00 PM - Gi/NoGi" format
    const parts = firstSession.split(' - ');
    
    if (parts.length < 2) {
      // Fallback: treat entire string as time, assume "both" type
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1), // "sunday" -> "Sunday"
        time: firstSession.trim(),
        type: 'both'
      };
    }
    
    // Handle cases like "9:00 AM - 10:30 AM - NoGi" (3 parts)
    // or "5:00 PM - Gi/NoGi" (2 parts)
    const time = parts.slice(0, -1).join(' - ').trim(); // All parts except the last
    const type = parts[parts.length - 1].trim(); // Last part is the type
    
    return {
      day: day.charAt(0).toUpperCase() + day.slice(1),
      time: time,
      type: this.validateSessionType(type)
    };
  }

  /**
   * Parse CSV data using the new format (one row per gym with day columns)
   * @param csvData - Raw CSV data string
   * @returns OpenMat[] - Array of gym data
   */
  private parseCSVToOpenMatsNewFormat(csvData: string): OpenMat[] {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers for new format
    const requiredHeaders = ['id', 'name', 'address', 'distance', 'matFee', 'dropInFee'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers for new format: ${missingHeaders.join(', ')}`);
    }

    // Parse CSV rows
    const csvRows: CSVRowNew[] = lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const row: CSVRowNew = {
        id: values[headers.indexOf('id')] || '',
        name: values[headers.indexOf('name')] || '',
        address: values[headers.indexOf('address')] || '',
        website: values[headers.indexOf('website')] || '',
        distance: values[headers.indexOf('distance')] || '0',
        matFee: values[headers.indexOf('matFee')] || '0',
        dropInFee: values[headers.indexOf('dropInFee')] || '',
        coordinates: values[headers.indexOf('coordinates')] || undefined,
        lastUpdated: values[headers.indexOf('lastUpdated')] || undefined,
        monday: values[headers.indexOf('monday')] || undefined,
        tuesday: values[headers.indexOf('tuesday')] || undefined,
        wednesday: values[headers.indexOf('wednesday')] || undefined,
        thursday: values[headers.indexOf('thursday')] || undefined,
        friday: values[headers.indexOf('friday')] || undefined,
        saturday: values[headers.indexOf('saturday')] || undefined,
        sunday: values[headers.indexOf('sunday')] || undefined
      };
      
      return row;
    });

    // Convert each row to OpenMat object
    const gyms = csvRows.map(row => {
      if (!row.id || !row.name) {
        logger.warn('Skipping row with missing id or name:', { row });
        return null;
      }

      const gym: OpenMat = {
        id: row.id,
        name: row.name.trim(),
        address: row.address,
        website: row.website && row.website.trim() !== '' ? row.website : undefined,
        distance: parseFloat(row.distance) || 0,
        matFee: parseInt(row.matFee) || 0,
        dropInFee: row.dropInFee && row.dropInFee.trim() !== '' ? parseInt(row.dropInFee) : undefined,
        coordinates: row.coordinates && row.coordinates.trim() !== '' ? row.coordinates : undefined,
        lastUpdated: this.parseLastUpdatedDate(row.lastUpdated),
        openMats: []
      };
      
      // Parse sessions from day columns
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        const sessionData = row[day as keyof CSVRowNew] as string | undefined;
        if (sessionData && sessionData.trim() !== '') {
          const session = this.parseSessionFromDayColumn(sessionData, day);
          if (session) {
            gym.openMats.push(session);
          }
        }
      });
      
      return gym;
    }).filter((gym): gym is OpenMat => gym !== null);

    // Sort sessions by day order for each gym
    const sortedGyms = gyms.map(gym => ({
      ...gym,
      openMats: this.sortSessionsByDay(gym.openMats)
    }));

    // Debug: Log the parsing results
    logger.debug('New format CSV parsing completed:', { 
      totalRows: csvRows.length,
      uniqueGyms: sortedGyms.length,
      sampleGyms: sortedGyms.slice(0, 5).map(g => ({ name: g.name, sessions: g.openMats.length }))
    });

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

    // Check if the value is "Contact" or any other non-date string
    const trimmedValue = lastUpdated.trim().toLowerCase();
    if (trimmedValue === 'contact' || trimmedValue === 'n/a' || trimmedValue === 'unknown' || trimmedValue === '') {
      return undefined;
    }

    // Check if the value looks like a valid date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedValue)) {
      // If it doesn't match the expected format, don't try to parse it
      return undefined;
    }

    try {
      const date = new Date(lastUpdated);
      
      // Check if the parsed date is valid
      if (isNaN(date.getTime())) {
        return undefined;
      }
      
      return date.toISOString();
    } catch (e) {
      logger.warn(`Could not parse lastUpdated date: ${lastUpdated}`, { error: e });
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
      logger.error('Error reading cached data:', error);
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
        location,
        version: this.CACHE_VERSION
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedData));
      logger.info(`Cached data for ${location} with version ${this.CACHE_VERSION}`);
    } catch (error) {
      logger.error(`Error caching data for ${location}:`, error);
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
      logger.error('Error clearing cache:', error);
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
    logger.force('Force refreshing Tampa data for Gracie Tampa South website...');
    await this.clearCache('tampa');
    return this.getGymData('tampa', true);
  }

  /**
   * Force refresh Miami data specifically for updated CSV structure
   * @returns Promise<OpenMat[]> - Fresh Miami data
   */
  async forceRefreshMiamiData(): Promise<OpenMat[]> {
    logger.force('Force refreshing Miami data for updated CSV structure...');
    await this.clearCache('miami');
    return this.getGymData('miami', true);
  }

  /**
   * Force refresh St. Petersburg data (for new city addition)
   * @returns Promise<OpenMat[]> - Fresh St. Petersburg data
   */
  async forceRefreshStPeteData(): Promise<OpenMat[]> {
    logger.force('Force refreshing St. Petersburg data for new city addition...');
    await this.clearCache('stpete');
    return this.getGymData('stpete', true);
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
      logger.error(`Error getting last update time for ${location}:`, error);
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
      logger.error(`Error checking cache status for ${location}:`, error);
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
      logger.error('GitHubDataService: Error clearing cache:', error);
    }
  }

  /**
   * Force refresh data for all locations
   * @returns Promise<{ tampa: OpenMat[], austin: OpenMat[], miami: OpenMat[], stpete: OpenMat[] }>
   */
  async forceRefreshAllData(): Promise<{ tampa: OpenMat[], austin: OpenMat[], miami: OpenMat[], stpete: OpenMat[] }> {
    const [tampaData, austinData, miamiData, stpeteData] = await Promise.all([
      this.getGymData('tampa', true),
      this.getGymData('austin', true),
      this.getGymData('miami', true),
      this.getGymData('stpete', true)
    ]);
    
    return { tampa: tampaData, austin: austinData, miami: miamiData, stpete: stpeteData };
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