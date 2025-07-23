const DISABLE_FIREBASE = true; // Temporary for testing

import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Declare variables at the top level
let auth: any;
let firestore: any;
let app: any;

const firebaseConfig = {
  apiKey: "AIzaSyDZNXEoRE-Rnee7mf20WR2b4dd3OQY21ks",
  authDomain: "find-jiu-jitsu.firebaseapp.com",
  projectId: "find-jiu-jitsu",
  storageBucket: "find-jiu-jitsu.firebasestorage.app",
  messagingSenderId: "713938761178",
  appId: "1:713938761178:ios:e6e6b80194abed20267ce3"
};

if (!DISABLE_FIREBASE) {
  // Initialize Firebase when enabled
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app);
  firestore = getFirestore(app);
} else {
  // Mock values when Firebase is disabled
  auth = null;
  firestore = null;
  app = null;
}

// Export at the top level
export { auth, firestore };
export default app; 