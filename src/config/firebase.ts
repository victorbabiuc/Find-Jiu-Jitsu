// Firebase configuration with static flag
// Set to true when enabling login functionality

export const FIREBASE_ENABLED = false; // Disabled for current release

export const initializeFirebase = () => {
  if (!FIREBASE_ENABLED) {
    console.log('Firebase disabled for this release');
    return;
  }

  // Firebase initialization code will go here when enabled
  console.log('Firebase would be initialized here');
};

export const getAuth = () => {
  if (!FIREBASE_ENABLED) {
    console.log('Firebase auth disabled for this release');
    return null;
  }

  // Firebase auth code will go here when enabled
  console.log('Firebase auth would be initialized here');
  return null;
};

// Export a simple function to check if Firebase is enabled
export const isFirebaseEnabled = () => FIREBASE_ENABLED; 