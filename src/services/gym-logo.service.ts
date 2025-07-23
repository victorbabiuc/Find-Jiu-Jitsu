import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GymLogoData {
  url: string;
  cached: boolean;
  lastFetched: number;
}

class GymLogoService {
  private static instance: GymLogoService;
  private logoCache: Map<string, GymLogoData> = new Map();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private readonly STORAGE_KEY = 'gym_logos_cache';

  // Pre-defined logo URLs for known gyms
  private readonly KNOWN_LOGOS: Record<string, string> = {
    // Tampa gyms
    'tampa-stjj': 'https://southtampajiujitsu.com/wp-content/uploads/2023/01/STJJ-Logo-1.png',
    'tampa-gracie-south': 'https://gracietampasouth.com/wp-content/uploads/2023/01/gracie-tampa-south-logo.png',
    'tampa-gracie-brandon': 'https://graciebrandon.com/wp-content/uploads/2023/01/gracie-brandon-logo.png',
    'tampa-gracie-westchase': 'https://graciewestchase.com/wp-content/uploads/2023/01/gracie-westchase-logo.png',
    'tampa-st-pete-bjj': 'https://www.stpetebjj.com/wp-content/uploads/2023/01/st-pete-bjj-logo.png',
    'tampa-inside-control-st-pete': 'https://insidecontrolacademy.com/wp-content/uploads/2023/01/inside-control-logo.png',
    
    // Austin gyms
    'austin-10th-planet': 'https://10thplanetaustin.com/wp-content/uploads/2023/01/10th-planet-logo.png',
    
    // Placeholder logos for gyms without specific logos
    'tampa-rmnu': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=RMNU',
    'tampa-gracie-humaita': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=GH',
    'tampa-kaizen': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=KAI',
    'tampa-ybor-city-jj': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=YCJJ',
    'tampa-tactics-jj': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=TJJ',
    'tampa-northriver': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=NR',
    'tampa-tmt': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=TMT',
    'tampa-gracie-trinity': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=GT',
    'tampa-gracie-clermont': 'https://via.placeholder.com/60x60/374151/FFFFFF?text=GC',
    
    // Add more known logos as we discover them
  };

  private constructor() {
    this.loadCacheFromStorage();
  }

  public static getInstance(): GymLogoService {
    if (!GymLogoService.instance) {
      GymLogoService.instance = new GymLogoService();
    }
    return GymLogoService.instance;
  }

  /**
   * Get logo URL for a gym, with fallback to initials
   */
  public async getGymLogo(gymId: string, gymName: string, gymWebsite?: string): Promise<string | null> {
    // Skip gyms that have hardcoded logos in the app
    if (gymId.includes('10th-planet') || gymId.includes('stjj')) {
      return null;
    }

    // Check if we have a known logo
    if (this.KNOWN_LOGOS[gymId]) {
      return this.KNOWN_LOGOS[gymId];
    }

    // Check cache first
    const cached = this.logoCache.get(gymId);
    if (cached && this.isCacheValid(cached.lastFetched)) {
      return cached.url;
    }

    // Generate a placeholder logo with gym initials
    const initials = this.getInitials(gymName);
    const placeholderUrl = `https://via.placeholder.com/60x60/374151/FFFFFF?text=${encodeURIComponent(initials)}`;
    
    // Cache the placeholder
    const logoData: GymLogoData = {
      url: placeholderUrl,
      cached: true,
      lastFetched: Date.now()
    };
    this.logoCache.set(gymId, logoData);
    await this.saveCacheToStorage();
    
    return placeholderUrl;
  }



  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastFetched: number): boolean {
    return Date.now() - lastFetched < this.CACHE_DURATION;
  }

  /**
   * Load cache from AsyncStorage
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.logoCache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.log('Error loading logo cache:', error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.logoCache);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.log('Error saving logo cache:', error);
    }
  }

  /**
   * Clear the logo cache
   */
  public async clearCache(): Promise<void> {
    this.logoCache.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get initials for a gym name (fallback)
   */
  public getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }
}

export const gymLogoService = GymLogoService.getInstance(); 