export interface User {
    id?: string;
    email: string;
    name: string;
    belt: BeltType;
    homeAcademy?: string;
    profile: UserProfile;
  }
  
  export interface UserProfile {
    age?: string;
    location?: string;
    yearsTraining?: string;
    trainingStyle: 'Gi' | 'No-Gi' | 'Both';
    competitionLevel: 'None' | 'Local' | 'Regional' | 'National';
    favoriteTechniques?: string;
    trainingGoals?: string;
    instagram?: string;
    availability: 'Morning' | 'Afternoon' | 'Evening' | 'Flexible';
    budget?: string;
    profilePhoto?: string;
  }
  
  export type BeltType = 'white' | 'blue' | 'purple' | 'brown' | 'black';
  
  export interface OpenMat {
    id: string;
    name: string;
    address: string;
    distance: number;
    openMats: OpenMatSession[];
    matFee: number;
    dropInFee?: number; // Optional field for drop-in class fees
    website?: string; // Optional website URL
    instructor?: string; // Optional instructor name
    goingUsers?: any[]; // Optional array of users attending
    coordinates?: string; // Optional coordinates in "latitude,longitude" format
    lastUpdated?: string; // Optional ISO date string for when data was last updated
  }
  
  export interface OpenMatSession {
    day: string;
    time: string;
    type: 'gi' | 'nogi' | 'both' | 'mma' | string; // Allow custom types like 'MMA Sparring'
  }
  
  export interface Price {
    amount: number;
    status: 'confirmed' | 'estimated' | 'unknown';
  }
  
  export interface Theme {
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    card: {
      background: string;
      hover: string;
    };
  }
  
  export interface Filters {
    radius: string;
    price: string;
    timeOfDay: string;
    giType: string;
  }
  
  export type ViewType = 
    | 'login' 
    | 'registration' 
    | 'dashboard' 
    | 'locationFirst' 
    | 'timeSelection' 
    | 'results' 
    | 'saved' 
    | 'profile';