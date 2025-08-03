import { OpenMat, User, Filters } from '../types';
import { githubDataService } from './github-data.service';

// Mock data for Tampa gyms
const mockTampaGyms: OpenMat[] = [
  {
    id: 'tampa-stjj',
    name: 'South Tampa Jiu Jitsu',
    address: '4916 South Lois Ave, Tampa, FL 33611',
    website: 'https://southtampajiujitsu.com/',
    distance: 0,
    matFee: 0,
    dropInFee: 20,
    openMats: [
      { day: 'Friday', time: '5:00 PM', type: 'nogi' },
      { day: 'Sunday', time: '9:00 AM', type: 'gi' },
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-rmnu',
    name: 'RMNU',
    address: '11220 W Hillsborough Ave, Tampa, FL 33635',
    website: 'https://www.rmnu.com',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Friday', time: '6:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-humaita',
    name: 'Gracie Humaita',
    address: '11220 Hillsborough Ave, Tampa, FL 33626',
    website: 'https://www.graciehumaita.com',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Friday', time: '6:30 PM - 7:30 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-kaizen',
    name: 'Kaizen',
    address: 'Tampa, FL',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '11:00 AM - 1:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-ybor-city-jj',
    name: 'Ybor City JJ',
    address: '718 E Henderson Ave, Tampa, FL 33602',
    website: 'https://www.facebook.com/ycjjc/',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '12:00 PM - 2:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-brandon',
    name: 'Gracie Brandon',
    address: '1155 Nikki View Dr, Brandon, FL 33511',
    website: 'https://graciebrandon.com',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '1:30 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-westchase',
    name: 'Gracie Westchase',
    address: '12807 W Hillsborough Ave Suite F, Tampa, FL 33635',
    website: 'https://graciewestchase.com',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '10:00 AM - 12:00 PM', type: 'both' },
      { day: 'Sunday', time: '9:00 AM - 12:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-tactics-jj',
    name: 'Tactics JJ',
    address: 'Tampa, FL',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '10:30 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-northriver',
    name: 'NorthRiver',
    address: 'Tampa, FL',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-tmt',
    name: 'TMT',
    address: 'Tampa, FL',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '11:30 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-trinity',
    name: 'Gracie Trinity',
    address: '11548 Pyramid Dr, Odessa, FL 33556',
    website: 'https://gracietrinity.com/',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '11:00 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-clermont',
    name: 'Gracie Clermont',
    address: 'Clermont, FL',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Saturday', time: '12:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-st-pete-bjj',
    name: 'St Pete BJJ',
    address: '5540 Haines Rd N, St Petersburg, FL 33714',
    website: 'https://www.stpetebjj.com/',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '5:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-inside-control-st-pete',
    name: 'Inside Control St Pete',
    address: '4654 28th St N, St Petersburg, FL 33714',
    website: 'https://insidecontrolacademy.com/',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '11:00 AM', type: 'both' }
    ]
  },
  {
    id: 'tampa-jiu-jitsu',
    name: 'Tampa Jiu Jitsu',
    address: '11732 N Dale Mabry Hwy, Tampa, FL 33618',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Monday', time: '8:30 PM - 9:30 PM', type: 'both' },
      { day: 'Tuesday', time: '9:00 PM - 10:00 PM', type: 'both' },
      { day: 'Wednesday', time: '9:15 PM - 10:00 PM', type: 'both' },
      { day: 'Thursday', time: '9:00 PM - 10:00 PM', type: 'both' },
      { day: 'Saturday', time: '1:00 PM - 2:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-gracie-tampa-south',
    name: 'Gracie Tampa South MMA',
    address: '1345 W Gray St, Tampa, FL 33606',
    distance: 0,
    matFee: 0,
    openMats: []
  },
  {
    id: 'tampa-collective-jj',
    name: 'Collective Jiu Jitsu & MMA',
    address: '4316 S Manhattan Ave, Tampa, FL 33611',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Sunday', time: '1:00 PM - 3:00 PM', type: 'both' }
    ]
  },
  {
    id: 'tampa-underdog-mma',
    name: 'Underdog Mixed Martial Arts',
    address: '30052 FL-54, Wesley Chapel, FL 33543',
    distance: 0,
    matFee: 0,
    openMats: [
      { day: 'Friday', time: '7:00 PM - 8:00 PM', type: 'nogi' },
      { day: 'Saturday', time: '11:00 AM - 12:00 PM', type: 'gi' }
    ]
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

  async getOpenMats(location: string, filters?: Partial<Filters> & { dateSelection?: string; dates?: Date[] }, forceRefresh?: boolean): Promise<OpenMat[]> {
    // Ensure location is never undefined or empty
    const safeLocation = location || 'Tampa';
    
    try {
      // Determine city from location string
      const city = safeLocation.toLowerCase().includes('austin') ? 'austin' : 
                   safeLocation.toLowerCase().includes('miami') ? 'miami' : 
                   safeLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
      
      // Try GitHub service first with force refresh if requested
      let githubData = await githubDataService.getGymData(city, forceRefresh || false);
      

      
      // Apply date filtering if specified
      if (filters?.dateSelection || filters?.dates) {
        githubData = this.filterGymsByDate(githubData, filters);
      }
      
      return githubData;
      
    } catch (error) {
      // GitHub service failed, using mock data
      
      // Fallback to mock data
      let mockData = safeLocation.toLowerCase().includes('austin') ? mockAustinGyms : mockTampaGyms;
      
      // Apply date filtering to mock data as well
      if (filters?.dateSelection || filters?.dates) {
        mockData = this.filterGymsByDate(mockData, filters);
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
      return gyms;
    }

    const targetDays = this.getTargetDays(filters);
    
    const filteredGyms = gyms.filter(gym => {
      // Skip gyms with no sessions
      if (!gym.openMats || gym.openMats.length === 0) {
        return false;
      }
      
      // Check if any of the gym's sessions match the target days
      const hasMatchingSession = gym.openMats.some(session => {
        // Skip sessions with empty or invalid day
        if (!session.day || session.day.trim() === '') {
          return false;
        }
        
        const matches = targetDays.some(targetDay => 
          this.daysMatch(session.day, targetDay)
        );
        
        return matches;
      });
      
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
        break;
      case 'tomorrow':
        targetDays = [this.getDayName(tomorrow)];
        break;
      case 'weekend':
        targetDays = ['Friday', 'Saturday', 'Sunday'];
        break;
      case 'custom':
        if (filters.dates && filters.dates.length > 0) {
          targetDays = filters.dates.map(date => this.getDayName(date));
        } else {
          targetDays = [this.getDayName(today)]; // Fallback to today
        }
        break;
      default:
        targetDays = [this.getDayName(today)]; // Default to today
    }

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