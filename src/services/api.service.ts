import { OpenMat, User, Filters } from '../types';

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

  async getOpenMats(location: string, filters?: Partial<Filters>): Promise<OpenMat[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, return mock data based on location
    if (location.toLowerCase().includes('austin')) {
      return mockAustinGyms;
    }
    
    return mockTampaGyms;
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