# Google Sign-In Setup Guide for Find Jiu Jitsu

## 🚀 Complete Setup Instructions

### Prerequisites
1. Firebase project configured (`find-jiu-jitsu`)
2. Google Cloud Console access
3. Expo development environment

### Step 1: Enable Google Sign-In in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`find-jiu-jitsu`)
3. Go to **Authentication** > **Sign-in method**
4. Enable **Google** provider
5. Configure the OAuth consent screen if needed
6. Add your support email

### Step 2: Get Client IDs from Google Cloud Console

#### 2.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (`find-jiu-jitsu`)
3. Go to **APIs & Services** > **Credentials**

#### 2.2 Create OAuth 2.0 Client IDs

**For Web Application (Expo Development):**
1. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
2. Choose **"Web application"**
3. Name: `Find Jiu Jitsu - Web Client`
4. Authorized JavaScript origins:
   - `https://auth.expo.io`
   - `https://localhost:8081`
   - `https://localhost:19006`
5. Authorized redirect URIs:
   - `https://auth.expo.io/@your-expo-username/FindJiuJitsu`
   - `https://localhost:8081`
6. Click **"Create"**
7. Copy the **Client ID** - this is your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

**For iOS Application:**
1. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
2. Choose **"iOS"**
3. Name: `Find Jiu Jitsu - iOS Client`
4. Bundle ID: `com.anonymous.OpenMatFinder`
5. Click **"Create"**
6. Copy the **Client ID** - this is your `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

**For Android Application:**
1. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
2. Choose **"Android"**
3. Name: `Find Jiu Jitsu - Android Client`
4. Package name: `com.anonymous.OpenMatFinder`
5. SHA-1 certificate fingerprint: (get this from your Android keystore)
6. Click **"Create"**
7. Copy the **Client ID** - this is your `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### Step 3: Configure Environment Variables

Create a `.env` file in your project root with:

```env
# Google Sign-In Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id-here
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id-here
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id-here

# Firebase Configuration (already configured)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDZNXEoRE-Rnee7mf20WR2b4dd3OQY21ks
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=find-jiu-jitsu.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=find-jiu-jitsu
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=find-jiu-jitsu.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=713938761178
EXPO_PUBLIC_FIREBASE_APP_ID=1:713938761178:ios:e6e6b80194abed20267ce3
```

### Step 4: Update Configuration Files

#### 4.1 app.json (Already Updated)
The app.json has been updated with:
- Scheme: `findjiujitsu`
- iOS Google Services file path
- Android Google Services file path

#### 4.2 AuthContext.tsx (Already Updated)
The Google auth request configuration has been updated to use:
- `webClientId` instead of `clientId`
- Proper environment variable names
- Better error handling

### Step 5: Test Google Sign-In

#### 5.1 Development Testing
1. Create the `.env` file with your client IDs
2. Run `npx expo start --clear`
3. Test Google Sign-In on iOS simulator or device
4. Check console logs for authentication flow

#### 5.2 Expected Console Output
```
🔐 AuthContext: Starting Google sign-in
🔐 AuthContext: Google sign-in initiated successfully
🔐 AuthContext: Received ID token from Google, signing in to Firebase
🔐 AuthContext: Google sign-in successful user@example.com
```

### Step 6: Troubleshooting

#### Common Issues:

**"Google authentication not configured"**
- Check that all client IDs are set in `.env`
- Verify environment variables are loaded correctly

**"Invalid client" error**
- Ensure client IDs match exactly from Google Cloud Console
- Check that bundle ID matches in iOS client configuration

**"Redirect URI mismatch"**
- Verify authorized redirect URIs in Google Cloud Console
- Check that your Expo username is correct in the redirect URI

**"Network error"**
- Check internet connectivity
- Verify Firebase project is active
- Ensure Google Sign-In API is enabled

### Step 7: Production Deployment

For production builds:
1. Update OAuth consent screen with app privacy policy
2. Add production redirect URIs
3. Configure proper SHA-1 fingerprints for Android
4. Test on real devices before release

## 🎯 Quick Start Checklist

- [ ] Firebase project created (`find-jiu-jitsu`)
- [ ] Google Sign-In enabled in Firebase Console
- [ ] OAuth 2.0 Client IDs created in Google Cloud Console
- [ ] `.env` file created with client IDs
- [ ] app.json updated with scheme and Google services paths
- [ ] AuthContext.tsx updated with proper configuration
- [ ] Tested on iOS simulator/device
- [ ] Console logs show successful authentication flow

## 📱 Testing Commands

```bash
# Start with clean cache
npx expo start --clear

# Test on iOS
npx expo start --ios

# Test on Android
npx expo start --android
```

Once you complete these steps, Google Sign-In will be fully functional! 🚀 