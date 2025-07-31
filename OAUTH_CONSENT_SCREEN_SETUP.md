# OAuth Consent Screen Setup Guide

This guide will help you set up the OAuth consent screen for JiuJitsu Finder.

## Step 1: Google Cloud Console

### 1.1 Access OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "OAuth consent screen"

### 1.2 Configure App Information
1. User Type: External
2. App information:
   - **App name**: `JiuJitsu Finder`
   - **User support email**: Your email
   - **App logo**: Upload your app logo (optional)
   - **App domain**: Your domain (optional)
   - **Developer contact information**: Your email

### 1.3 Add Scopes
Add these OAuth scopes:
- `email`
- `profile`
- `openid`

### 1.4 Add Test Users
1. Add your email as a test user
2. Add any other test users as needed

## Step 2: Verification

### 2.1 Test OAuth Flow
1. Go to "APIs & Services" > "Credentials"
2. Create OAuth 2.0 Client ID
3. Test the sign-in flow

### 2.2 Check Status
- Status should show "Testing" or "In production"
- All required fields should be filled

## Step 3: Production

### 3.1 Publish App
1. Go to "OAuth consent screen"
2. Click "PUBLISH APP"
3. Confirm the action

### 3.2 Monitor Usage
1. Check "OAuth consent screen" for usage metrics
2. Monitor for any issues

## Troubleshooting

### Common Issues
1. **"App not verified"**: Complete verification process
2. **"Invalid scopes"**: Check scope configuration
3. **"User not authorized"**: Add user to test users

### Debug Steps
1. Check OAuth consent screen configuration
2. Verify scopes are correctly added
3. Test with different user accounts

## Security Considerations

1. **Limit scopes** to minimum required
2. **Monitor usage** for suspicious activity
3. **Keep contact information** up to date
4. **Regularly review** app permissions

---

**Need Help?** Create an issue in the repository or contact glootieapp@gmail.com 