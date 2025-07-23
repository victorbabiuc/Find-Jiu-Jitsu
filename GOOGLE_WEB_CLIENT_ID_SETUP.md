# Google Web Client ID Setup Guide

## 🔍 How to Get Your Web Client ID

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **`find-jiu-jitsu`** project
3. In the left sidebar, click **"APIs & Services"** → **"Credentials"**

### Step 2: Find or Create Web Application Client
1. Look for a credential with type **"Web application"**
2. If you don't see one, click **"CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"** as the application type
4. Give it a name like **"Find Jiu Jitsu Web Client"**

### Step 3: Configure Authorized Redirect URIs
Add these redirect URIs to your Web application client:
- `https://auth.expo.io/@your-expo-username/FindJiuJitsu`
- `https://find-jiu-jitsu.firebaseapp.com/__/auth/handler`

### Step 4: Copy the Client ID
1. After creating/saving, you'll see a **Client ID** that looks like:
   ```
   713938761178-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   ```
2. Copy this entire Client ID

### Step 5: Update Your .env File
Replace the placeholder in your `.env` file:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=713938761178-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### Step 6: Restart Expo
```bash
npx expo start --clear
```

## 🚨 Important Notes
- The Web Client ID is different from the iOS Client ID
- It must end with `.apps.googleusercontent.com`
- Make sure to use the correct redirect URIs for Expo
- The Web Client ID is required for Google Sign-In to work in Expo

## 🔧 Troubleshooting
If you still get errors after adding the Web Client ID:
1. Make sure the Client ID is copied exactly (no extra spaces)
2. Verify the redirect URIs are correct
3. Check that the Google Sign-In API is enabled in your project
4. Ensure the OAuth consent screen is configured 