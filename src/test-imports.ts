// Test file to verify all our TypeScript imports work
import { User, OpenMat, BeltType, Theme } from './types';
import { storageService } from './services/storage.service';
import { apiService } from './services/api.service';
import { validationRules } from './services/validation.service';
import { beltColors, loadingMessages } from './utils/constants';

// This file should compile without errors if everything is set up correctly
console.log('All imports successful!');

// Test type usage
const testUser: User = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  belt: 'blue',
  profile: {
    trainingStyle: 'Both',
    competitionLevel: 'Local',
    availability: 'Evening'
  }
};

const testBelt: BeltType = 'blue';
const testColor = beltColors[testBelt];

console.log('TypeScript types working correctly!');