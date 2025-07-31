# Firebase Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for the JiuJitsu Finder app using Firebase.

## Prerequisites

- Firebase project created
- Google Cloud Console access
- Expo development environment

## Step 1: Firebase Project Configuration

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project details:
   - **Project name**: `JiuJitsu Finder`
   - **Project public-facing name**: `JiuJitsu Finder`
   - **Google Analytics**: Enable (recommended)

### 1.2 Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Configure OAuth consent screen

## Step 2: OAuth Consent Screen Setup

### 2.1 Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure app information:
   - **App name**: `JiuJitsu Finder`
   - **User support email**: Your email
   - **Developer contact information**: Your email

### 2.2 Add Scopes
Add these OAuth scopes:
- `email`
- `profile`
- `openid`

## Step 3: OAuth 2.0 Client IDs

### 3.1 Web Client
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Name: `JiuJitsu Finder - Web Client`
4. Application type: Web application
5. Add authorized origins:
   - `https://auth.expo.io`
   - `https://your-expo-username.github.io`

### 3.2 iOS Client
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Name: `JiuJitsu Finder - iOS Client`
3. Application type: iOS
4. Bundle ID: `com.anonymous.OpenMatFinder`

### 3.3 Android Client
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Name: `JiuJitsu Finder - Android Client`
3. Application type: Android
4. Package name: `com.anonymous.OpenMatFinder`
5. SHA-1 certificate fingerprint: Get from your keystore

## Step 4: Expo Configuration

### 4.1 Install Dependencies
```bash
npx expo install @react-native-google-signin/google-signin
```

### 4.2 Configure app.json
```json
{
  "expo": {
    "scheme": "findjiujitsu",
    "ios": {
      "bundleIdentifier": "com.anonymous.OpenMatFinder"
    },
    "android": {
      "package": "com.anonymous.OpenMatFinder"
    }
  }
}
```

### 4.3 Configure Google Sign-In
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

## Step 5: Firebase Configuration

### 5.1 Download Config Files
1. In Firebase Console, go to Project Settings
2. Download `google-services.json` (Android)
3. Download `GoogleService-Info.plist` (iOS)

### 5.2 Add to Project
- Place `google-services.json` in `android/app/`
- Place `GoogleService-Info.plist` in `ios/FindJiuJitsu/`

## Step 6: Environment Variables

### 6.1 Create .env file
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 6.2 Configure Expo
```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": process.env.FIREBASE_API_KEY,
      "firebaseAuthDomain": process.env.FIREBASE_AUTH_DOMAIN,
      "firebaseProjectId": process.env.FIREBASE_PROJECT_ID,
      "firebaseStorageBucket": process.env.FIREBASE_STORAGE_BUCKET,
      "firebaseMessagingSenderId": process.env.FIREBASE_MESSAGING_SENDER_ID,
      "firebaseAppId": process.env.FIREBASE_APP_ID
    }
  }
}
```

## Step 7: Testing

### 7.1 Test Configuration
```bash
npx expo start
```

### 7.2 Test Sign-In
1. Open app on device/simulator
2. Tap "Sign in with Google"
3. Complete OAuth flow
4. Verify user data in Firebase Console

## Troubleshooting

### Common Issues
1. **"Sign in failed"**: Check client IDs and bundle identifiers
2. **"Network error"**: Verify internet connection and API keys
3. **"Invalid client"**: Ensure OAuth consent screen is configured

### Debug Steps
1. Check Firebase Console for authentication logs
2. Verify client IDs match your configuration
3. Test with different devices/simulators
4. Check network requests in developer tools

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Restrict OAuth scopes** to minimum required
4. **Monitor authentication logs** for suspicious activity
5. **Regularly rotate** client secrets

## Next Steps

After successful setup:
1. Implement user profile management
2. Add cloud sync for favorites
3. Set up push notifications
4. Configure analytics tracking

---

**Need Help?** Create an issue in the repository or contact glootieapp@gmail.com 