# 🛠️ Development Guide

Technical setup, architecture, and development workflow for JiuJitsu Finder.

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
- **State Management**: Context API + Custom Hooks
- **Data Storage**: AsyncStorage for local favorites

### Architecture & Components
- **Component Architecture**: Modular sub-components with focused responsibilities
- **Custom Hooks**: Reusable state management patterns
- **Utility Functions**: Centralized gym utilities and professional logging
- **Type Safety**: Enhanced TypeScript interfaces and type definitions

### Data & Services
- **Data Source**: GitHub-hosted CSV files for easy updates
- **Data Service**: Custom GitHub data service with caching and last updated support
- **API Service**: RESTful API service for gym data
- **Storage Service**: Local storage utilities
- **Search Service**: Debounced search with suggestions and recent searches

### UI & UX
- **Styling**: React Native StyleSheet with consistent design system
- **Animations**: React Native Animated API with custom utility service
- **Haptics**: expo-haptics for tactile feedback
- **Icons**: Ionicons for consistent iconography
- **Loading**: Custom belt progression loading animation
- **Components**: Reusable UI components with proper TypeScript interfaces

### Sharing & Utilities
- **Sharing**: Image sharing with react-native-view-shot and expo-sharing
- **Clipboard**: expo-clipboard for text copying
- **Location**: expo-location for user location services
- **Linear Gradient**: expo-linear-gradient for visual effects
- **View Shot**: react-native-view-shot for creating share images
- **Logging**: Professional logging system with categorized output

### Authentication (In Development)
- **Google Sign-In**: @react-native-google-signin/google-signin
- **Apple Sign-In**: expo-apple-authentication
- **Auth Session**: expo-auth-session for OAuth flow

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── results/        # ResultsScreen sub-components
│   │   ├── ResultsGymCard.tsx      # Individual gym card
│   │   ├── ResultsFilterBar.tsx    # Filter pills and map toggle
│   │   ├── ResultsHeader.tsx       # Header with location info
│   │   └── ResultsEmptyState.tsx   # Empty state component
│   ├── dashboard/      # DashboardScreen sub-components
│   │   ├── DashboardSearchSection.tsx  # Search functionality
│   │   ├── DashboardCityCards.tsx      # City selection cards
│   │   └── DashboardGymModal.tsx       # Gym details modal
│   ├── common/         # Shared components
│   └── index.ts        # Component exports
├── hooks/              # Custom hooks for state management
│   ├── useGymActions.ts    # Gym interactions (website, directions, copy, share, favorite)
│   ├── useGymSearch.ts     # Search state and debounced search
│   ├── useGymModal.ts      # Modal visibility and selected gym state
│   ├── useGymFilters.ts    # Filter state and application logic
│   └── index.ts            # Hook exports
├── context/            # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Main app screens (refactored)
├── services/          # API and data services
├── stores/            # State management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    ├── gymUtils.ts    # Centralized gym utilities
    ├── logger.ts      # Professional logging system
    └── index.ts       # Utility exports
```

## Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/AmazingFeature`
2. Use existing custom hooks for state management
3. Create focused components following the new architecture
4. Test on iOS Simulator
5. Commit with descriptive message: `git commit -m 'Add AmazingFeature'`
6. Push and create Pull Request

### 2. Testing
- Test on iOS Simulator for all screen sizes
- Verify data loading and error states
- Test sharing functionality
- Check TypeScript compilation: `npx tsc --noEmit --skipLibCheck`
- Verify custom hooks work correctly
- Test component reusability

### 3. Code Quality
- Use TypeScript for all new code
- Follow existing naming conventions
- Use custom hooks for state management
- Create focused, reusable components
- Add proper error handling
- Include loading states for async operations
- Use the professional logging system

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
- **App Name**: JiuJitsu Finder
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
- **Custom Hooks**: Optimized state management with useCallback and useMemo
- **Component Architecture**: Focused sub-components reduce re-renders
- **Professional Logging**: Development-only logging reduces production overhead

### Monitoring
- Professional logging system for data loading and errors
- Performance monitoring in development
- Memory usage tracking for large datasets
- Custom hook performance tracking

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Run `npx expo start --clear`
2. **TypeScript errors**: Run `npx tsc --noEmit --skipLibCheck`
3. **iOS Simulator issues**: Reset simulator and restart Expo
4. **Data loading failures**: Check GitHub CSV file accessibility

### Debug Mode
Use the professional logging system for detailed debugging:
```typescript
import { logger } from '../utils';

// Categorized logging
logger.debug('Debug info:', data);
logger.search('Search query:', query);
logger.filter('Filter applied:', filters);
logger.error('Error occurred:', error);
```

The logging system automatically handles development vs production environments.

## Custom Hooks Architecture

### Available Hooks

#### `useGymActions`
Centralizes gym-related actions with proper state management and haptic feedback.

```typescript
import { useGymActions } from '../hooks';

const {
  copyingGymId,
  copiedGymId,
  sharingGymId,
  handleOpenWebsite,
  handleOpenDirections,
  handleCopyGymWithState,
  handleShareGym,
  handleToggleFavorite,
} = useGymActions({
  favorites,
  toggleFavorite,
  shareCardRef,
});
```

#### `useGymSearch`
Manages search state, debounced search, and search suggestions.

```typescript
import { useGymSearch } from '../hooks';

const {
  isSearching,
  searchQuery,
  searchResults,
  searchSuggestions,
  recentSearches,
  showSuggestions,
  handleInputChange,
  handleSelectSuggestion,
  closeSearch,
} = useGymSearch({
  allGyms,
  onSearchResultsChange: (results) => {
    // Handle search results
  },
});
```

#### `useGymModal`
Manages modal visibility and selected gym state.

```typescript
import { useGymModal } from '../hooks';

const {
  modalVisible,
  selectedGym,
  shareCardGym,
  shareCardSession,
  shareCardRef,
  showGymDetails,
  handleCloseModal,
  setShareCardData,
} = useGymModal({
  onModalOpen: (gym) => {
    // Handle modal open
  },
});
```

#### `useGymFilters`
Manages filter state and provides filtered gym lists.

```typescript
import { useGymFilters } from '../hooks';

const {
  activeFilters,
  sessionCounts,
  filteredGyms,
  hasActiveFilters,
  toggleFilter,
  handleFreeFilter,
  resetFilters,
} = useGymFilters({
  allGyms,
  onFiltersChange: (filteredGyms) => {
    // Handle filtered results
  },
});
```

### Benefits of Custom Hooks

1. **Consistency**: All screens use the same patterns for gym interactions
2. **Reusability**: Hooks can be used across different screens
3. **Maintainability**: State logic is centralized and easier to update
4. **Type Safety**: All hooks are properly typed with TypeScript
5. **Performance**: Hooks use `useCallback` and `useMemo` for optimization
6. **Testing**: Hooks can be tested independently of UI components

### Migration Guide

To migrate existing screens to use these hooks:

1. **Replace duplicate state**: Remove local state that's now managed by hooks
2. **Update imports**: Import hooks from `../hooks`
3. **Replace handlers**: Use hook-provided handlers instead of local ones
4. **Update props**: Pass hook state and handlers to child components
5. **Test functionality**: Ensure all existing functionality still works

---

[← Back to README](../README.md) | [Technical Details →](TECHNICAL.md) 