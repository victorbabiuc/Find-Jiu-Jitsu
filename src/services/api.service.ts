import { OpenMat, User, Filters } from '../types';
import { githubDataService } from './github-data.service';

// Mock data for Tampa gyms
const mockTampaGyms: OpenMat[] = [
  {
    id: '1',
    name: 'STJJ',
    address: 'Tampa, FL',
    distance: 5.2,
    openMats: [
      { day: 'Sunday', time: '9:00 AM', type: 'gi' },
      { day: 'Thursday', time: '5:00 PM', type: 'nogi' }
    ],
    matFee: 0
  },
  {
    id: '2',
    name: 'RMNU',
    address: 'Tampa, FL',
    distance: 7.1,
    openMats: [
      { day: 'Wednesday', time: '6:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '3',
    name: 'Gracie Humaita',
    address: 'Tampa, FL',
    distance: 4.8,
    openMats: [
      { day: 'Tuesday', time: '6:30 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '4',
    name: 'Kaizen',
    address: 'Tampa, FL',
    distance: 9.3,
    openMats: [
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '5',
    name: 'Ybor City JJ',
    address: 'Ybor City, Tampa, FL',
    distance: 6.5,
    openMats: [
      { day: 'Saturday', time: '12:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '6',
    name: 'Gracie Brandon',
    address: 'Brandon, FL',
    distance: 12.4,
    openMats: [
      { day: 'Saturday', time: '1:30 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '7',
    name: 'Gracie Westchase',
    address: 'Westchase, Tampa, FL',
    distance: 15.2,
    openMats: [
      { day: 'Saturday', time: '10:00 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '8',
    name: 'Tactics JJ',
    address: 'Tampa, FL',
    distance: 8.7,
    openMats: [
      { day: 'Saturday', time: '10:30 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '9',
    name: 'NorthRiver',
    address: 'North Tampa, FL',
    distance: 11.3,
    openMats: [
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '10',
    name: 'TMT',
    address: 'Tampa, FL',
    distance: 7.9,
    openMats: [
      { day: 'Saturday', time: '11:30 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '11',
    name: 'Gracie Trinity',
    address: 'Trinity, FL',
    distance: 18.6,
    openMats: [
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '12',
    name: 'Gracie Clermont',
    address: 'Clermont, FL',
    distance: 35.2,
    openMats: [
      { day: 'Saturday', time: '12:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '13',
    name: 'St Pete BJJ',
    address: 'St. Petersburg, FL',
    distance: 22.4,
    openMats: [
      { day: 'Saturday', time: '5:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '14',
    name: 'Inside Control St Pete',
    address: 'St. Petersburg, FL',
    distance: 23.1,
    openMats: [
      { day: 'Sunday', time: '11:00 AM', type: 'both' }
    ],
    matFee: 0
  }
];

// Mock data for Austin gyms
const mockAustinGyms: OpenMat[] = [
  {
    id: 'austin-1',
    name: '10th Planet Austin',
    address: '4509 Freidrich Ln #210, Austin, TX 78744',
    distance: 5.2,
    openMats: [
      { day: 'Wednesday', time: '10:00 AM', type: 'nogi' },
      { day: 'Saturday', time: '12:00 PM', type: 'nogi' }
    ],
    matFee: 25
  },
  {
    id: 'austin-2',
    name: '10th Planet Round Rock',
    address: '3810 Gattis School Rd Suite 109 & 110, Round Rock, TX 78664',
    distance: 12.5,
    openMats: [
      { day: 'Sunday', time: '12:00 PM', type: 'nogi' }
    ],
    matFee: 0
  },
  {
    id: 'austin-3',
    name: 'Aces',
    address: '2200 E 7th St #B, Austin, TX 78702',
    distance: 3.8,
    openMats: [
      { day: 'Friday', time: '7:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: 'austin-4',
    name: 'Atos',
    address: '11701 Bee Caves Rd Suite 110, Austin, TX 78738',
    distance: 15.3,
    openMats: [
      { day: 'Saturday', time: '11:30 AM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: 'austin-5',
    name: 'Austin Submission Fighting',
    address: '11940 Menchaca Rd #104, Austin, TX 78748',
    distance: 11.7,
    openMats: [
      { day: 'Saturday', time: '10:00 AM', type: 'both' }
    ],
    matFee: 0
  }
];

class ApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await this.delay(1000); // Simulate API delay
    
    // Mock successful login
    return {
      user: {
        id: '1',
        email,
        name: 'JiuJitsu Practitioner',
        belt: 'blue',
        profile: {
          trainingStyle: 'Both',
          competitionLevel: 'Local',
          availability: 'Evening'
        }
      },
      token: 'mock-jwt-token'
    };
  }

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    await this.delay(1000);
    
    return {
      user: {
        id: Date.now().toString(),
        email: userData.email || '',
        name: userData.name || '',
        belt: userData.belt || 'white',
        homeAcademy: userData.homeAcademy,
        profile: {
          trainingStyle: 'Both',
          competitionLevel: 'None',
          availability: 'Evening'
        }
      },
      token: 'mock-jwt-token'
    };
  }

  async getOpenMats(location: string, filters?: Partial<Filters> & { dateSelection?: string; dates?: Date[] }): Promise<OpenMat[]> {
    try {
      // Determine city from location string
      const city = location.toLowerCase().includes('austin') ? 'austin' : 
                   location.toLowerCase().includes('tampa') ? 'tampa' : 'austin';
      
      console.log(`🌐 Attempting to fetch ${city} data from GitHub...`);
      
      // Try GitHub service first
      let githubData = await githubDataService.getGymData(city);
      
      console.log(`✅ Successfully loaded ${githubData.length} gyms from GitHub for ${city}`);
      console.log('📍 GitHub data source active');
      
      // Apply date filtering if specified
      if (filters?.dateSelection || filters?.dates) {
        githubData = this.filterGymsByDate(githubData, filters);
        console.log(`📅 Applied date filtering: ${githubData.length} gyms match criteria`);
      }
      
      return githubData;
      
    } catch (error) {
      console.log('❌ GitHub service failed, falling back to mock data:', (error as Error).message);
      console.log('📍 Using mock data source');
      
      // Fallback to mock data
      let mockData = location.toLowerCase().includes('austin') ? mockAustinGyms : mockTampaGyms;
      
      // Apply date filtering to mock data as well
      if (filters?.dateSelection || filters?.dates) {
        mockData = this.filterGymsByDate(mockData, filters);
        console.log(`📅 Applied date filtering to mock data: ${mockData.length} gyms match criteria`);
      }
      
      return mockData;
    }
  }

  /**
   * Filter gyms based on date selection criteria
   * @param gyms - Array of gyms to filter
   * @param filters - Filter criteria including dateSelection and dates
   * @returns Filtered array of gyms
   */
  private filterGymsByDate(gyms: OpenMat[], filters: Partial<Filters> & { dateSelection?: string; dates?: Date[] }): OpenMat[] {
    if (!filters.dateSelection && !filters.dates) {
      console.log('📅 No date filtering applied');
      return gyms;
    }

    const targetDays = this.getTargetDays(filters);
    console.log(`🔍 Filtering ${gyms.length} gyms for days: ${targetDays.join(', ')}`);
    
    const filteredGyms = gyms.filter(gym => {
      // Skip gyms with no sessions
      if (!gym.openMats || gym.openMats.length === 0) {
        console.log(`❌ ${gym.name}: No sessions available`);
        return false;
      }
      
      // Check if any of the gym's sessions match the target days
      const hasMatchingSession = gym.openMats.some(session => {
        // Skip sessions with empty or invalid day
        if (!session.day || session.day.trim() === '') {
          console.log(`⚠️ ${gym.name}: Session with empty day - ${session.time}`);
          return false;
        }
        
        const matches = targetDays.some(targetDay => 
          this.daysMatch(session.day, targetDay)
        );
        
        if (matches) {
          console.log(`✅ ${gym.name}: Matches ${session.day} ${session.time}`);
        }
        
        return matches;
      });
      
      if (!hasMatchingSession) {
        console.log(`❌ ${gym.name}: No sessions match target days`);
      }
      
      return hasMatchingSession;
    }).map(gym => ({
      ...gym,
      // Filter sessions to only show matching ones
      openMats: gym.openMats.filter(session => {
        // Skip sessions with empty or invalid day
        if (!session.day || session.day.trim() === '') {
          return false;
        }
        
        return targetDays.some(targetDay => this.daysMatch(session.day, targetDay));
      })
    }));

    console.log(`📊 Filtering complete: ${filteredGyms.length}/${gyms.length} gyms match criteria`);
    return filteredGyms;
  }

  /**
   * Get target days based on date selection criteria
   * @param filters - Filter criteria
   * @returns Array of day names to match against
   */
  private getTargetDays(filters: Partial<Filters> & { dateSelection?: string; dates?: Date[] }): string[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let targetDays: string[] = [];

    switch (filters.dateSelection) {
      case 'today':
        targetDays = [this.getDayName(today)];
        console.log(`📅 Today is ${this.getDayName(today)}`);
        break;
      case 'tomorrow':
        targetDays = [this.getDayName(tomorrow)];
        console.log(`📅 Tomorrow is ${this.getDayName(tomorrow)}`);
        break;
      case 'weekend':
        targetDays = ['Saturday', 'Sunday'];
        console.log(`📅 Weekend includes: ${targetDays.join(', ')}`);
        break;
      case 'custom':
        if (filters.dates && filters.dates.length > 0) {
          targetDays = filters.dates.map(date => this.getDayName(date));
          console.log(`📅 Custom dates: ${targetDays.join(', ')}`);
        } else {
          targetDays = [this.getDayName(today)]; // Fallback to today
          console.log(`📅 Custom dates fallback to today: ${this.getDayName(today)}`);
        }
        break;
      default:
        targetDays = [this.getDayName(today)]; // Default to today
        console.log(`📅 Default to today: ${this.getDayName(today)}`);
    }

    console.log(`🎯 Target days for filtering: ${targetDays.join(', ')}`);
    return targetDays;
  }

  /**
   * Convert Date object to day name
   * @param date - Date object
   * @returns Day name (Monday, Tuesday, etc.)
   */
  private getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if two day names match (case-insensitive)
   * @param day1 - First day name
   * @param day2 - Second day name
   * @returns True if days match
   */
  private daysMatch(day1: string, day2: string): boolean {
    return day1.toLowerCase().trim() === day2.toLowerCase().trim();
  }

  async updateProfile(userId: string, profile: Partial<User>): Promise<User> {
    await this.delay(500);
    
    // Mock profile update
    return {
      id: userId,
      ...profile
    } as User;
  }
}

export const apiService = new ApiService();