# Google Web Client ID Setup Guide

This guide will help you set up the Google Web Client ID for JiuJitsu Finder.

## Step 1: Google Cloud Console

### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"

### 1.2 Create OAuth 2.0 Client ID
1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Application type: Web application
3. Name: `JiuJitsu Finder Web Client`
4. Add authorized origins:
   - `https://auth.expo.io`
   - `https://your-expo-username.github.io`

### 1.3 Copy Client ID
1. After creation, copy the Client ID
2. Format: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

## Step 2: Environment Configuration

### 2.1 Create .env file
```env
GOOGLE_WEB_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 2.2 Configure app.json
```json
{
  "expo": {
    "extra": {
      "googleWebClientId": process.env.GOOGLE_WEB_CLIENT_ID
    }
  }
}
```

## Step 3: Code Implementation

### 3.1 Configure Google Sign-In
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### 3.2 Use in Authentication
```typescript
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

## Step 4: Testing

### 4.1 Test Configuration
```bash
npx expo start
```

### 4.2 Test Sign-In
1. Open app on device/simulator
2. Tap "Sign in with Google"
3. Complete OAuth flow
4. Verify user data

## Troubleshooting

### Common Issues
1. **"Invalid client"**: Check client ID format
2. **"Network error"**: Verify internet connection
3. **"Sign in failed"**: Ensure OAuth consent screen is configured

### Debug Steps
1. Check Google Cloud Console for OAuth logs
2. Verify client ID matches your configuration
3. Test with different devices/simulators

## Security Considerations

1. **Never commit client ID** to version control
2. **Use environment variables** for sensitive data
3. **Monitor authentication logs** for suspicious activity

---

**Need Help?** Create an issue in the repository or contact glootieapp@gmail.com 