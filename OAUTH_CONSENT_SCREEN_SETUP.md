# OAuth Consent Screen Setup Guide

## 🚨 URGENT: Fix OAuth Consent Screen Error

The error "This app isn't verified" indicates that your OAuth consent screen is not properly configured.

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **`find-jiu-jitsu`**
3. Go to **APIs & Services** → **OAuth consent screen**

### Step 2: Configure OAuth Consent Screen

#### 2.1 User Type
- Choose **"External"** (for testing and development)
- Click **"Create"**

#### 2.2 App Information
Fill in the required fields:
- **App name**: `Find Jiu Jitsu`
- **User support email**: `your-email@domain.com`
- **App logo**: (Optional) Upload your app icon
- **App domain**: `find-jiu-jitsu.firebaseapp.com`

#### 2.3 Scopes
- Click **"Add or remove scopes"**
- Select these scopes:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click **"Update"**

#### 2.4 Test Users
- Click **"Add users"**
- Add your email address as a test user
- This allows you to test the app while it's unverified

#### 2.5 Save and Continue
- Click **"Save and Continue"** through all sections
- Click **"Back to Dashboard"**

### Step 3: Update App Status (Optional)
If you want to make the app available to all users:
1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. This removes the "unverified app" warning

### Step 4: Test the Fix
1. Restart your Expo app
2. Try Google Sign-In again
3. The "unverified app" error should be gone

## 🔧 Additional Troubleshooting

### If you still get errors:

#### 1. Check Redirect URIs
Make sure your Web Client has these redirect URIs:
- `https://auth.expo.io/@your-expo-username/FindJiuJitsu`
- `https://find-jiu-jitsu.firebaseapp.com/__/auth/handler`

#### 2. Verify API Enablement
Ensure these APIs are enabled:
- Google Sign-In API
- Google+ API (if available)

#### 3. Check Client IDs
Verify your client IDs in `.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=713938761178-5pqukh04v3tcjqh7ignp5fsofcrpbesk.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=713938761178-9c5rfvvqfsgb01hinme07tsfo5naj31o.apps.googleusercontent.com
```

## 🎯 Expected Result
After completing these steps:
- ✅ No more "unverified app" errors
- ✅ Google Sign-In works properly
- ✅ Users can authenticate successfully
- ✅ App navigation works without crashes

## 📞 Need Help?
If you're still having issues:
1. Check the Google Cloud Console error logs
2. Verify all redirect URIs are correct
3. Ensure your email is added as a test user
4. Try publishing the app if you want to remove verification requirements 