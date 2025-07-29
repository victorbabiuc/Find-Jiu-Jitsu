import { OpenMat } from '../types';
import { githubDataService } from './github-data.service';

export interface SearchResult {
  cities: Array<{
    name: string;
    count: number;
  }>;
  gyms: OpenMat[];
}

export interface SearchService {
  searchAll: (query: string) => Promise<SearchResult>;
  searchCities: (query: string) => Promise<Array<{ name: string; count: number }>>;
  searchGyms: (query: string) => Promise<OpenMat[]>;
}

class SearchServiceImpl implements SearchService {
  private cachedTampaGyms: OpenMat[] = [];
  private cachedAustinGyms: OpenMat[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async ensureDataLoaded(): Promise<void> {
    const now = Date.now();
    if (now - this.cacheTimestamp > this.CACHE_DURATION) {
      try {
        // Load both cities' data in parallel
        const [tampaGyms, austinGyms] = await Promise.all([
          githubDataService.getGymData('tampa'),
          githubDataService.getGymData('austin')
        ]);
        
        this.cachedTampaGyms = tampaGyms;
        this.cachedAustinGyms = austinGyms;
        this.cacheTimestamp = now;
      } catch (error) {
        console.error('Error loading gym data for search:', error);
      }
    }
  }

  async searchAll(query: string): Promise<SearchResult> {
    await this.ensureDataLoaded();
    
    const results: SearchResult = {
      cities: [],
      gyms: []
    };
    
    // Search cities
    results.cities = await this.searchCities(query);
    
    // Search all gyms
    results.gyms = await this.searchGyms(query);
    
    return results;
  }

  async searchCities(query: string): Promise<Array<{ name: string; count: number }>> {
    await this.ensureDataLoaded();
    
    const normalizedQuery = query.toLowerCase().trim();
    const results: Array<{ name: string; count: number }> = [];
    
    // Search for Tampa
    if (normalizedQuery.includes('tampa') || normalizedQuery.includes('fl') || normalizedQuery.includes('florida')) {
      results.push({ name: 'Tampa, FL', count: this.cachedTampaGyms.length });
    }
    
    // Search for Austin
    if (normalizedQuery.includes('austin') || normalizedQuery.includes('tx') || normalizedQuery.includes('texas')) {
      results.push({ name: 'Austin, TX', count: this.cachedAustinGyms.length });
    }
    
    return results;
  }

  async searchGyms(query: string): Promise<OpenMat[]> {
    await this.ensureDataLoaded();
    
    const normalizedQuery = query.toLowerCase().trim();
    const allGyms = [...this.cachedTampaGyms, ...this.cachedAustinGyms];
    
    return allGyms.filter(gym => {
      // Search in gym name
      if (gym.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in address
      if (gym.address.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in session types
      if (gym.openMats.some(session => 
        session.type.toLowerCase().includes(normalizedQuery)
      )) {
        return true;
      }
      
      return false;
    });
  }

  // Helper method to get gym count by city
  async getGymCountByCity(city: string): Promise<number> {
    await this.ensureDataLoaded();
    
    switch (city.toLowerCase()) {
      case 'tampa':
      case 'tampa, fl':
        return this.cachedTampaGyms.length;
      case 'austin':
      case 'austin, tx':
        return this.cachedAustinGyms.length;
      default:
        return 0;
    }
  }

  // Helper method to get all available cities
  async getAvailableCities(): Promise<Array<{ name: string; count: number }>> {
    await this.ensureDataLoaded();
    
    return [
      { name: 'Tampa, FL', count: this.cachedTampaGyms.length },
      { name: 'Austin, TX', count: this.cachedAustinGyms.length }
    ];
  }
}

// Export singleton instance
export const searchService = new SearchServiceImpl(); 