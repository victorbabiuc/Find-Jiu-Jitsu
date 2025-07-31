# Google Sign-In Setup Guide for JiuJitsu Finder

This guide will help you set up Google Sign-In for the JiuJitsu Finder app.

## Prerequisites

- Google Cloud Console access
- Expo development environment
- Firebase project (optional, for backend)

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Client IDs

#### Web Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Name: `JiuJitsu Finder - Web Client`
6. Application type: Web application
7. Add authorized origins:
   - `https://auth.expo.io`
   - `https://your-expo-username.github.io`

#### iOS Client
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Name: `JiuJitsu Finder - iOS Client`
3. Application type: iOS
4. Bundle ID: `com.anonymous.OpenMatFinder`

#### Android Client
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Name: `JiuJitsu Finder - Android Client`
3. Application type: Android
4. Package name: `com.anonymous.OpenMatFinder`
5. SHA-1 certificate fingerprint: Get from your keystore

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Configure app information:
   - App name: `JiuJitsu Finder`
   - User support email: Your email
   - Developer contact information: Your email
3. Add scopes: `email`, `profile`, `openid`

## Step 2: Expo Configuration

### 2.1 Install Dependencies
```bash
npx expo install @react-native-google-signin/google-signin expo-auth-session expo-crypto
```

### 2.2 Configure app.json
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

### 2.3 Configure Google Sign-In
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

## Step 3: Authentication Flow

### 3.1 Sign-In Function
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log('User info:', userInfo);
  } catch (error) {
    console.error('Sign-in error:', error);
  }
};
```

### 3.2 Sign-Out Function
```typescript
const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Sign-out error:', error);
  }
};
```

## Step 4: Environment Variables

### 4.1 Create .env file
```env
GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
```

### 4.2 Configure Expo
```json
{
  "expo": {
    "extra": {
      "googleWebClientId": process.env.GOOGLE_WEB_CLIENT_ID,
      "googleIosClientId": process.env.GOOGLE_IOS_CLIENT_ID,
      "googleAndroidClientId": process.env.GOOGLE_ANDROID_CLIENT_ID
    }
  }
}
```

## Step 5: Testing

### 5.1 Test Configuration
```bash
npx expo start
```

### 5.2 Test Sign-In
1. Open app on device/simulator
2. Tap "Sign in with Google"
3. Complete OAuth flow
4. Verify user data

## Troubleshooting

### Common Issues
1. **"Sign in failed"**: Check client IDs and bundle identifiers
2. **"Network error"**: Verify internet connection
3. **"Invalid client"**: Ensure OAuth consent screen is configured

### Debug Steps
1. Check Google Cloud Console for OAuth logs
2. Verify client IDs match your configuration
3. Test with different devices/simulators
4. Check network requests in developer tools

## Security Considerations

1. **Never commit client IDs** to version control
2. **Use environment variables** for sensitive data
3. **Restrict OAuth scopes** to minimum required
4. **Monitor authentication logs** for suspicious activity

## Next Steps

After successful setup:
1. Implement user profile management
2. Add cloud sync for favorites
3. Set up push notifications
4. Configure analytics tracking

---

**Need Help?** Create an issue in the repository or contact glootieapp@gmail.com 