# 🛠️ Development Guide

Complete setup and development guide for JiuJitsu Finder.

[← Back to README](../README.md)

## Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS device with Expo Go app

### Installation
```bash
git clone https://github.com/victorbabiuc/Find-Jiu-Jitsu.git
cd JiuJitsu-Finder
npm install
npx expo start
```

### Development Server
```bash
# Start development server
npx expo start

# Start with cache clear
npx expo start --clear

# Run web version
npx expo start --web
```

## Testing Your App

### Option 1: iOS Device (Recommended)
1. **Download "Expo Go"** from iOS App Store
2. **Scan QR code** from terminal/browser
3. **Test on real device** - Most accurate testing

### Option 2: Web Browser
1. **Run:** `npx expo start --web`  
2. **Test in browser** - Quick iterations

**Note:** iOS Simulator not available on Windows. Use physical iOS device or cloud Mac services for full iOS testing.

## Technical Stack

### Core Framework
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Navigation:** React Navigation v6
- **State:** Context API + Custom Hooks
- **Storage:** AsyncStorage

### Key Features
- **Custom Hooks:** Reusable state management (useGymActions, useGymSearch, useGymModal, useGymFilters)
- **Component Architecture:** Modular sub-components
- **Professional Logging:** Categorized logging system
- **Data Service:** GitHub-hosted CSV with caching

## Authentication Setup

### Google Sign-In Setup

#### 1. Google Cloud Console
1. Create OAuth 2.0 Client IDs for Web, iOS, and Android
2. Configure OAuth consent screen with app info
3. Add required scopes: `email`, `profile`, `openid`

#### 2. Configuration
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});
```

#### 3. Environment Variables
```env
GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
```

### Apple Sign-In Setup

#### 1. Apple Developer Console
1. Enable **Sign In with Apple** for your app identifier
2. Configure service IDs and key IDs

#### 2. Configuration
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

**Note:** Apple Sign-In requires physical iOS device for testing.

### Firebase Integration

#### 1. Firebase Project Setup
1. Create Firebase project
2. Enable Authentication with Google/Apple providers
3. Download config files

#### 2. Environment Variables
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

## Project Architecture

### Custom Hooks System
```
src/hooks/
├── useGymActions.ts     # Website, directions, copy, share, favorite
├── useGymSearch.ts      # Search state and debounced search  
├── useGymModal.ts       # Modal visibility and share cards
├── useGymFilters.ts     # Filter state and counts
└── index.ts             # Exports
```

### Component Structure
```
src/components/
├── results/             # ResultsScreen sub-components
├── dashboard/           # DashboardScreen sub-components
├── common/              # Shared components
└── index.ts
```

### Services
```
src/services/
├── github-data.service.ts    # CSV data fetching with cache
├── search.service.ts         # Search and suggestions
├── api.service.ts           # RESTful API wrapper
└── index.ts
```

## Data Management

### CSV Format
```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
```

### Session Format
```csv
"5:00 PM - Gi/NoGi"
"6:30 PM - 7:30 PM - NoGi"
"11:00 AM - Gi"
```

### Adding New Gyms
1. Edit CSV files in `data/` directory
2. Follow exact format requirements
3. Test locally with `npx expo start`
4. Submit pull request

## Build & Deployment

### App Store Information
- **Bundle ID:** com.anonymous.OpenMatFinder
- **Current Version:** 1.6.0
- **Status:** Live on App Store

### Build Commands
```bash
# Production build
npx eas build -p ios --profile production

# Submit to App Store  
npx eas submit -p ios
```

## Screenshot Sharing

### Implementation
The app uses `react-native-view-shot` to create shareable gym cards:

1. **ShareCard Component:** Professional design optimized for social media
2. **Capture Process:** Off-screen rendering → image capture → native share
3. **Integration:** Built into custom hooks for consistent behavior

### Usage
```typescript
const { handleShareGym } = useGymActions({
  favorites,
  toggleFavorite, 
  shareCardRef,
});
```

## Performance Optimization

### Current Optimizations
- **React.memo:** Prevents unnecessary re-renders
- **FlatList Virtualization:** Efficient large lists
- **Data Caching:** 1-hour GitHub data cache
- **Custom Hooks:** Optimized with useCallback/useMemo
- **Professional Logging:** Development-only overhead

### Monitoring
- Performance tracking in development
- Memory usage monitoring for large datasets
- Custom hook performance optimization

## Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
npx expo start --clear
```

#### TypeScript Errors  
```bash
npx tsc --noEmit --skipLibCheck
```

#### iOS Device Issues
1. Ensure Expo Go is installed
2. Check QR code scanning
3. Verify network connectivity

#### Data Loading Failures
1. Check GitHub CSV accessibility
2. Clear app cache
3. Verify internet connection

### Debug Logging
```typescript
import { logger } from '../utils';

// Categorized logging
logger.debug('Debug info:', data);
logger.search('Search query:', query);
logger.filter('Filter applied:', filters);
logger.error('Error occurred:', error);
```

## Known Issues

### Map View (In Development)
- **Status:** Compilation errors preventing functionality
- **Workaround:** Use list view for gym browsing

### Authentication (In Development)  
- **Status:** UI implemented, backend not connected
- **Workaround:** App works without authentication

## Code Quality

### TypeScript Standards
- Use proper interfaces for all data
- Avoid `any` types
- Leverage custom hooks for state management

### Component Guidelines
- Create focused, single-responsibility components
- Use custom hooks for state logic
- Follow established patterns in `/components/results/` and `/components/dashboard/`

### Error Handling
- Use professional logging system
- Implement graceful fallbacks
- Handle network failures appropriately

## Contributing

1. **Fork** the repository
2. **Create feature branch:** `git checkout -b feature/AmazingFeature`
3. **Use custom hooks** for state management
4. **Test thoroughly** on iOS device
5. **Submit pull request** with clear description

---

[← Back to README](../README.md) | [Contributing Guide →](CONTRIBUTING.md)