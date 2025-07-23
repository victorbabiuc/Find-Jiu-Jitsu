# Firebase Google Sign-In Setup Guide

## 🔥 Firebase Console Configuration

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **`find-jiu-jitsu`**
3. Verify you're in the correct project (check the project name in the top-left)

### Step 2: Enable Google Sign-In Provider

#### 2.1 Navigate to Authentication
1. In the left sidebar, click **"Authentication"**
2. Click on the **"Sign-in method"** tab
3. You should see a list of sign-in providers

#### 2.2 Enable Google Provider
1. Find **"Google"** in the list of providers
2. Click on **"Google"** to open its configuration
3. Click the **"Enable"** toggle switch to turn it ON
4. Fill in the required fields:
   - **Project support email**: `your-email@domain.com` (use your email)
   - **Project public-facing name**: `Find Jiu Jitsu`
5. Click **"Save"**

#### 2.3 Verify Google Provider Status
- Status should show: **"Enabled"**
- You should see a green checkmark
- The provider should be listed as active

### Step 3: Configure OAuth Consent Screen (if needed)

#### 3.1 Check OAuth Consent Screen
1. In Firebase Console, go to **"Authentication"** → **"Settings"** tab
2. Look for **"OAuth consent screen"** section
3. If it shows "Not configured", click **"Configure"**

#### 3.2 Configure OAuth Consent Screen
1. **App name**: `Find Jiu Jitsu`
2. **User support email**: `your-email@domain.com`
3. **App logo**: (optional) Upload your app icon
4. **App domain**: `find-jiu-jitsu.firebaseapp.com`
5. **Authorized domains**: 
   - `find-jiu-jitsu.firebaseapp.com`
   - `localhost`
   - `auth.expo.io`
6. Click **"Save"**

### Step 4: Verify JavaScript SDK Configuration

#### 4.1 Check Current Firebase Config
Your `src/config/firebase.ts` is correctly configured:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDZNXEoRE-Rnee7mf20WR2b4dd3OQY21ks",
  authDomain: "find-jiu-jitsu.firebaseapp.com",
  projectId: "find-jiu-jitsu",
  storageBucket: "find-jiu-jitsu.firebasestorage.app",
  messagingSenderId: "713938761178",
  appId: "1:713938761178:ios:e6e6b80194abed20267ce3"
};
```

#### 4.2 Verify Auth Initialization
The auth is properly initialized:
```typescript
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Step 5: Test Firebase Connection

#### 5.1 Check Console Logs
When you run the app, you should see:
```
🔐 AuthContext: Initializing Firebase auth listener
🔐 AuthContext: Auth state changed No user
```

#### 5.2 Verify No Firebase Errors
- No "Firebase not initialized" errors
- No "Auth domain not found" errors
- No "Project not found" errors

### Step 6: Enable Required APIs

#### 6.1 Google Cloud Console APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **`find-jiu-jitsu`**
3. Go to **"APIs & Services"** → **"Library"**
4. Search for and enable these APIs:
   - **Google+ API** (if not already enabled)
   - **Google Sign-In API** (if not already enabled)
   - **Identity and Access Management (IAM) API**

### Step 7: Verify App Configuration

#### 7.1 Check app.json Configuration
Your app.json is correctly configured:
```json
{
  "expo": {
    "scheme": "findjiujitsu",
    "ios": {
      "bundleIdentifier": "com.anonymous.OpenMatFinder",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.anonymous.OpenMatFinder",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

#### 7.2 Verify GoogleService-Info.plist
Your `GoogleService-Info.plist` contains:
- Correct `BUNDLE_ID`: `com.anonymous.OpenMatFinder`
- Correct `PROJECT_ID`: `find-jiu-jitsu`
- Valid `API_KEY` and other credentials

## 🧪 Testing the Setup

### Test 1: Firebase Connection
```bash
npx expo start --clear
```
Expected console output:
```
🔐 AuthContext: Initializing Firebase auth listener
🔐 AuthContext: Auth state changed No user
```

### Test 2: Google Sign-In Button
1. Navigate to LoginScreen
2. Tap "Sign in with Google"
3. Expected behavior:
   - If client IDs not set: Error message about missing configuration
   - If client IDs set: Google sign-in flow should start

### Test 3: Error Handling
Current error messages you should see if client IDs are missing:
```
Google Web Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.
Google iOS Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file.
```

## ✅ Checklist

- [ ] Firebase project selected: `find-jiu-jitsu`
- [ ] Google Sign-In provider enabled in Firebase Console
- [ ] OAuth consent screen configured
- [ ] Firebase config matches project settings
- [ ] Auth properly initialized in JavaScript
- [ ] Required APIs enabled in Google Cloud Console
- [ ] app.json configured with correct scheme and bundle IDs
- [ ] GoogleService-Info.plist contains correct project info
- [ ] Console logs show Firebase auth listener working
- [ ] No Firebase initialization errors

## 🚨 Troubleshooting

### Common Issues:

**"Firebase not initialized"**
- Check firebase config in `src/config/firebase.ts`
- Verify project ID matches Firebase Console

**"Google Sign-In not enabled"**
- Go to Firebase Console → Authentication → Sign-in method
- Enable Google provider

**"OAuth consent screen not configured"**
- Configure OAuth consent screen in Firebase Console
- Add authorized domains

**"Invalid client" errors**
- This will be resolved once you add client IDs to .env file
- Client IDs come from Google Cloud Console (next step)

## 🎯 Next Steps

Once Firebase Console setup is complete:
1. Get OAuth 2.0 Client IDs from Google Cloud Console
2. Add client IDs to `.env` file
3. Test Google Sign-In functionality
4. Verify user authentication flow

The Firebase setup is the foundation - once this is working, adding the client IDs will make Google Sign-In fully functional! 🚀 