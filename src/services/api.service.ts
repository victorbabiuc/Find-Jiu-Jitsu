import { OpenMat, User, Filters } from '../types';

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
    await this.delay(800);
    
    console.log('getOpenMats called with location:', location);
    
    // Check location and return appropriate data
    if (location && location.includes('Austin')) {
      console.log('Austin location detected, returning Austin gyms');
    } else {
      console.log('Non-Austin location detected, returning Tampa gyms');
    }
    
    // Import mock data here - Tampa gyms for "Tampa" or "Near Me"
    const mockOpenMats: OpenMat[] = [
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

    // Austin gym data
    const austinOpenMats: OpenMat[] = [
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
      },
      {
        id: 'austin-6',
        name: 'Black Widow MMA',
        address: '2007 Kramer Ln #101, Austin, TX 78758',
        distance: 7.2,
        openMats: [
          { day: 'Saturday', time: '12:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-7',
        name: 'Brazilian Top Team',
        address: '9313 Anderson Mill Rd, Austin, TX 78729',
        distance: 14.1,
        openMats: [
          { day: 'Saturday', time: '12:00 PM', type: 'both' }
        ],
        matFee: 35
      },
      {
        id: 'austin-8',
        name: 'Claunch',
        address: '12112 Ranch Rd 620 N, Austin, TX 78750',
        distance: 16.8,
        openMats: [
          { day: 'Sunday', time: '9:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-9',
        name: 'Coopers',
        address: '12129 N FM 620 Suite # 330, Austin, TX 78750',
        distance: 17.2,
        openMats: [
          { day: 'Thursday', time: '12:00 PM', type: 'both' },
          { day: 'Sunday', time: '1:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-10',
        name: 'Free World Jiu Jitsu',
        address: '1202 Farm To Market 685, Pflugerville, TX 78660',
        distance: 18.5,
        openMats: [
          { day: 'Saturday', time: '11:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-11',
        name: 'Gracie Humaita',
        address: '321 W Ben White Blvd Suite 108, Austin, TX 78704',
        distance: 6.4,
        openMats: [
          { day: 'Saturday', time: '9:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-12',
        name: 'Integração Jiu Jitsu',
        address: '1600 W Stassney Ln c, Austin, TX 78745',
        distance: 9.3,
        openMats: [
          { day: 'Thursday', time: '6:45 PM', type: 'both' },
          { day: 'Saturday', time: '1:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-13',
        name: 'Stoic Jiu-Jitsu',
        address: '4955 Bell Springs Rd #5, Dripping Springs, TX 78620',
        distance: 22.4,
        openMats: [
          { day: 'Saturday', time: '11:30 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-14',
        name: 'John\'s Gym',
        address: '11416 Ranch Rd 620 N, Austin, TX 78726',
        distance: 15.9,
        openMats: [
          { day: 'Tuesday', time: '12:00 PM', type: 'gi' },
          { day: 'Thursday', time: '12:00 PM', type: 'nogi' }
        ],
        matFee: 0
      },
      {
        id: 'austin-15',
        name: 'Mario Esfiha',
        address: '1921 Cedar Bend Dr APT 146, Austin, TX 78758',
        distance: 8.1,
        openMats: [
          { day: 'Monday', time: '6:30 PM', type: 'both' },
          { day: 'Tuesday', time: '6:30 PM', type: 'both' },
          { day: 'Wednesday', time: '6:00 PM', type: 'both' },
          { day: 'Saturday', time: '11:00 AM', type: 'both' },
          { day: 'Sunday', time: '11:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-16',
        name: 'OpenMat Co. Judo Jiujitsu',
        address: '2100 Cypress Creek Road Suite 500, Cedar Park, TX 78613',
        distance: 19.2,
        openMats: [
          { day: 'Monday', time: '7:00 PM', type: 'both' },
          { day: 'Tuesday', time: '7:00 PM', type: 'both' },
          { day: 'Wednesday', time: '7:00 PM', type: 'both' },
          { day: 'Thursday', time: '7:00 PM', type: 'both' },
          { day: 'Friday', time: '7:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-17',
        name: 'Paragon',
        address: '6800 West Gate Blvd APT 116, Austin, TX 78745',
        distance: 9.8,
        openMats: [
          { day: 'Sunday', time: '6:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-18',
        name: 'Renzo Gracie',
        address: '4301 Guadalupe St A, Austin, TX 78751',
        distance: 4.6,
        openMats: [
          { day: 'Saturday', time: '12:30 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-19',
        name: 'Relson Gracie',
        address: '8213 Brodie Ln Austin, TX',
        distance: 13.4,
        openMats: [
          { day: 'Saturday', time: '11:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-20',
        name: 'Six Blades',
        address: '13642 N Hwy 183 #300, Austin, TX 78750',
        distance: 10.7,
        openMats: [
          { day: 'Saturday', time: '10:00 AM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-21',
        name: 'Triple Threat (Marble Falls)',
        address: '2415 Commerce St, Marble Falls, TX 78654',
        distance: 48.3,
        openMats: [
          { day: 'Friday', time: '6:30 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-22',
        name: 'True Jiu Jitsu',
        address: '#1300B, 2111 Sam Bass Rd, Round Rock, TX 78681',
        distance: 20.1,
        openMats: [
          { day: 'Friday', time: '6:00 PM', type: 'both' },
          { day: 'Saturday', time: '1:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-23',
        name: 'Vasquez Academy',
        address: '12110 Menchaca Rd #401, Austin, TX 78748',
        distance: 11.9,
        openMats: [
          { day: 'Saturday', time: '3:00 PM', type: 'nogi' }
        ],
        matFee: 0
      },
      {
        id: 'austin-24',
        name: 'Violet Crown Jiu Jitsu',
        address: '1609 Ohlen Rd ste. B, Austin, TX 78758',
        distance: 7.6,
        openMats: [
          { day: 'Wednesday', time: '7:00 PM', type: 'nogi' },
          { day: 'Saturday', time: '1:00 PM', type: 'both' }
        ],
        matFee: 0
      },
      {
        id: 'austin-25',
        name: 'VOW BJJ',
        address: '5555 N Lamar Blvd C109, Austin, TX 78751',
        distance: 5.3,
        openMats: [
          { day: 'Sunday', time: '1:00 PM', type: 'nogi' }
        ],
        matFee: 0
      }
    ];

    // Apply filters if provided
    let filteredMats = location && location.includes('Austin') ? [...austinOpenMats] : [...mockOpenMats];
    
    if (filters?.price === 'free') {
      filteredMats = filteredMats.filter(mat => mat.matFee === 0);
    } else if (filters?.price) {
      const maxPrice = parseInt(filters.price);
      filteredMats = filteredMats.filter(mat => mat.matFee <= maxPrice);
    }

    if (filters?.radius) {
      const maxDistance = parseFloat(filters.radius);
      filteredMats = filteredMats.filter(mat => mat.distance <= maxDistance);
    }

    return filteredMats;
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