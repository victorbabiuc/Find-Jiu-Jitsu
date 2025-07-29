# 🛠️ Development Guide

Technical setup, architecture, and development workflow for Find Jiu Jitsu.

[← Back to README](../README.md)

## Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for development)

### Installation
```bash
git clone https://github.com/victorbabiuc/Find-Jiu-Jitsu.git
cd FindJiuJitsu
npm install
npx expo start
```

### Key Commands
```bash
# Run development server
npx expo start

# Run with cache clear
npx expo start --clear

# Build for production
npx eas build -p ios --profile production

# Submit to App Store
npx eas submit -p ios
```

## Technical Stack

### Core Framework
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript for full type safety
- **Navigation**: React Navigation v6 with streamlined user flow
- **State Management**: Context API + React Hooks
- **Data Storage**: AsyncStorage for local favorites

### Data & Services
- **Data Source**: GitHub-hosted CSV files for easy updates
- **Data Service**: Custom GitHub data service with caching and last updated support
- **API Service**: RESTful API service for gym data
- **Storage Service**: Local storage utilities

### UI & UX
- **Styling**: React Native StyleSheet with consistent design system
- **Animations**: React Native Animated API with custom utility service
- **Haptics**: expo-haptics for tactile feedback
- **Icons**: Ionicons for consistent iconography
- **Loading**: Custom belt progression loading animation

### Sharing & Utilities
- **Sharing**: Image sharing with react-native-view-shot and expo-sharing
- **Clipboard**: expo-clipboard for text copying
- **Location**: expo-location for user location services
- **Linear Gradient**: expo-linear-gradient for visual effects
- **View Shot**: react-native-view-shot for creating share images

### Authentication (In Development)
- **Google Sign-In**: @react-native-google-signin/google-signin
- **Apple Sign-In**: expo-apple-authentication
- **Auth Session**: expo-auth-session for OAuth flow

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Main app screens
├── services/          # API and data services
├── stores/            # State management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/AmazingFeature`
2. Make changes with TypeScript safety
3. Test on iOS Simulator
4. Commit with descriptive message: `git commit -m 'Add AmazingFeature'`
5. Push and create Pull Request

### 2. Testing
- Test on iOS Simulator for all screen sizes
- Verify data loading and error states
- Test sharing functionality
- Check TypeScript compilation: `npx tsc --noEmit --skipLibCheck`

### 3. Code Quality
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper error handling
- Include loading states for async operations

## Known Issues & Fixes

### Map View (In Development)
- **Status**: Compilation errors preventing map functionality
- **Issue**: react-native-maps plugin configuration and syntax errors
- **Impact**: Map toggle shows location list instead of actual map
- **Workaround**: Use list view for gym browsing

### Authentication (In Development)
- **Status**: UI implemented but backend not connected
- **Issue**: Firebase integration not completed
- **Impact**: Sign-in buttons present but not functional
- **Workaround**: App works without authentication

### Require Cycle Warning
```
WARN  Require cycle: src/navigation/AppNavigator.tsx -> src/screens/TimeSelectionScreen.tsx -> src/navigation/index.ts -> src/navigation/AppNavigator.tsx
```

**Fix**: Import directly from specific files instead of index:
```typescript
// Change from:
import { useFindNavigation } from '../navigation';
// To:
import { useFindNavigation } from '../navigation/useNavigation';
```

## Build & Deployment

### App Store Information
- **App Name**: Find Jiu Jitsu
- **Bundle ID**: com.anonymous.OpenMatFinder
- **Category**: Sports
- **Price**: Free
- **Current Version**: 1.3.0 (Build 15)
- **Status**: ✅ Live on App Store

### Build Process
1. Update version in `app.json`
2. Run `npx eas build -p ios --profile production`
3. Test build on TestFlight
4. Submit to App Store: `npx eas submit -p ios`

## Performance Optimization

### Current Optimizations
- **Memoization**: React.memo for expensive components
- **FlatList Optimization**: Virtualization for large lists
- **Data Caching**: GitHub data service with 1-hour cache
- **Pre-loading**: Gym data loaded on app startup
- **Image Optimization**: Compressed gym logos

### Monitoring
- Console logs for data loading and errors
- Performance monitoring in development
- Memory usage tracking for large datasets

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Run `npx expo start --clear`
2. **TypeScript errors**: Run `npx tsc --noEmit --skipLibCheck`
3. **iOS Simulator issues**: Reset simulator and restart Expo
4. **Data loading failures**: Check GitHub CSV file accessibility

### Debug Mode
Enable detailed logging by setting `__DEV__` environment variable:
```typescript
if (__DEV__) {
  console.log('Debug info:', data);
}
```

---

[← Back to README](../README.md) | [Technical Details →](TECHNICAL.md) 