# Apple Sign-In Setup Guide

## Prerequisites
1. Apple Developer Account
2. Firebase project configured
3. iOS app configured in Apple Developer Console
4. Expo project with iOS build capability

## Step 1: Configure Apple Sign-In in Apple Developer Console
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your app identifier
4. Enable **Sign In with Apple** capability
5. Configure the **Sign In with Apple** settings

## Step 2: Enable Apple Sign-In in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`find-jiu-jitsu`)
3. Go to **Authentication** > **Sign-in method**
4. Enable **Apple** provider
5. Configure the Apple Sign-In settings:
   - **Service ID**: Your app's bundle identifier
   - **Apple Team ID**: Your Apple Developer Team ID
   - **Key ID**: Your Apple Sign-In key ID
   - **Private Key**: Your Apple Sign-In private key

## Step 3: Configure Expo Project
Update your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.anonymous.OpenMatFinder",
      "usesAppleSignIn": true
    }
  }
}
```

## Step 4: Test Apple Sign-In
1. Build your app for iOS: `npx expo run:ios`
2. Test Apple Sign-In on a physical iOS device (required)
3. Check console logs for authentication flow

## Important Notes
- **iOS Only**: Apple Sign-In only works on iOS devices
- **Physical Device Required**: Apple Sign-In cannot be tested in iOS Simulator
- **Apple Developer Account**: Required for production use
- **Bundle ID**: Must match your Apple Developer app identifier

## Troubleshooting
- Ensure Apple Sign-In is enabled in Apple Developer Console
- Verify Firebase configuration is correct
- Check that you're testing on a physical iOS device
- Ensure your app's bundle identifier matches Apple Developer Console
- Verify your Apple Developer Team has the necessary permissions

## Error Handling
The implementation includes error handling for:
- User cancellation
- Device compatibility issues
- Network errors
- Authentication failures 