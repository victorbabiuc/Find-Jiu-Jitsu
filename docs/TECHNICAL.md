# 🔧 Technical Details

Detailed architecture, APIs, and implementation specifics for JiuJitsu Finder.

[← Back to README](../README.md)

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iOS App       │    │   GitHub CSV    │    │   Local Cache   │
│   (React Native)│◄──►│   Data Source   │◄──►│   (AsyncStorage)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   Data Service  │    │   State Mgmt    │
│   (Screens)     │    │   (GitHub API)  │    │   (Context)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
App.tsx
├── Context Providers
│   ├── AuthProvider
│   ├── ThemeProvider
│   ├── AppProvider
│   └── LoadingProvider
├── GymDataPreloader
└── AppNavigator
    ├── AuthStack (Login)
    └── MainStack
        ├── DashboardScreen (Refactored)
        │   ├── DashboardSearchSection
        │   ├── DashboardCityCards
        │   └── DashboardGymModal
        ├── FindStack
        │   ├── LocationScreen
        │   ├── TimeSelectionScreen
        │   ├── ResultsScreen (Refactored)
        │   │   ├── ResultsHeader
        │   │   ├── ResultsFilterBar
        │   │   ├── ResultsGymCard
        │   │   └── ResultsEmptyState
        │   └── MapViewScreen
        ├── SavedScreen
        └── ProfileStack
            ├── ProfileScreen
            └── ProfileDetailsScreen
```

### Custom Hooks Architecture
```
src/hooks/
├── useGymActions.ts      # Gym interactions and state management
├── useGymSearch.ts       # Search functionality and debouncing
├── useGymModal.ts        # Modal state and share card management
├── useGymFilters.ts      # Filter logic and session counts
└── index.ts              # Hook exports
```

## Data Flow

### 1. Data Fetching Flow
```
User selects city
    ↓
GitHubDataService.fetchData()
    ↓
Check cache (AsyncStorage)
    ↓
If cache valid → return cached data
    ↓
If cache stale → fetch from GitHub CSV
    ↓
Parse CSV → OpenMat objects
    ↓
Cache data → AsyncStorage
    ↓
Return data to UI
```

### 2. State Management Flow
```
User Action
    ↓
Custom Hook (useGymActions, useGymSearch, etc.)
    ↓
State Update with useCallback/useMemo
    ↓
Context Provider (useReducer)
    ↓
Component Re-render
    ↓
UI Update
```

### 3. Component Architecture Flow
```
Screen Component
    ↓
Custom Hooks (State Management)
    ↓
Sub-Components (Focused Responsibilities)
    ↓
Reusable Components (Shared UI)
    ↓
Rendered UI
```

## API Services

### GitHub Data Service
**File**: `src/services/github-data.service.ts`

**Key Features**:
- **CSV Parsing**: Converts GitHub-hosted CSV to OpenMat objects
- **Caching**: 1-hour cache with automatic refresh
- **Error Handling**: Graceful fallback to cached data
- **Rate Limiting**: Handles GitHub API 429 errors
- **Professional Logging**: Categorized logging for debugging

**Methods**:
```typescript
class GitHubDataService {
  async getGymData(location: string): Promise<OpenMat[]>
  private async fetchCSVFromGitHub(location: string): Promise<string>
  private parseCSV(csvData: string): OpenMat[]
  private getCachedData(location: string): Promise<OpenMat[] | null>
  private cacheData(location: string, data: OpenMat[]): Promise<void>
}
```

### Search Service
**File**: `src/services/search.service.ts`

**Key Features**:
- **Smart Search**: Gym name and city search
- **Recent Searches**: Persistent search history
- **Search Suggestions**: Auto-complete functionality
- **Deduplication**: Removes duplicate gym entries

**Methods**:
```typescript
class SearchService {
  searchGyms(query: string, gyms: OpenMat[]): OpenMat[]
  async getRecentSearches(): Promise<string[]>
  async saveRecentSearch(query: string): Promise<void>
  async clearRecentSearches(): Promise<void>
}
```

### API Service
**File**: `src/services/api.service.ts`

**Features**:
- **RESTful API**: Standard HTTP methods
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript support

**Methods**:
```typescript
class ApiService {
  async get<T>(url: string): Promise<T>
  async post<T>(url: string, data: any): Promise<T>
  async put<T>(url: string, data: any): Promise<T>
  async delete<T>(url: string): Promise<T>
}
```

## Data Models

### OpenMat Interface
```typescript
interface OpenMat {
  id: string;
  name: string;
  address: string;
  website?: string;
  distance: number;
  matFee: number;
  dropInFee?: number;
  coordinates?: string;
  lastUpdated?: string;
  openMats: OpenMatSession[];
  goingUsers?: User[];
}

interface OpenMatSession {
  day: string;
  time: string;
  type: string;
}

interface User {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  provider: 'google' | 'apple' | 'anonymous';
}

interface SearchFilters {
  gi?: boolean;
  nogi?: boolean;
  price?: string;
  dateSelection?: string;
  dates?: Date[];
}

interface GymSearchResult {
  cities: Array<{ name: string; count: number }>;
  gyms: OpenMat[];
}
```

### CSV Data Structure
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
```

## Authentication System

### Current Implementation
**Status**: UI implemented, backend not connected

**Components**:
- **Google Sign-In**: `@react-native-google-signin/google-signin`
- **Apple Sign-In**: `expo-apple-authentication`
- **Auth Context**: `src/context/AuthContext.tsx`

**User Interface**:
```typescript
interface SimpleUser {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  provider: 'google' | 'apple' | 'anonymous';
}
```

### Planned Integration
- **Firebase Authentication**: Google and Apple Sign-In
- **Cloud Sync**: User preferences and favorites
- **User Profiles**: Belt level and training preferences

## Error Handling

### Network Error Handling
```typescript
// GitHub Data Service
try {
  const response = await fetch(url);
  
  if (response.status === 429) {
    // Rate limited - fallback to cache
    const cachedData = await this.getCachedData(location);
    if (cachedData) return this.convertOpenMatsToCSV(cachedData);
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  return await response.text();
} catch (error) {
  // Fallback to cached data
  const cachedData = await this.getCachedData(location);
  if (cachedData) return this.convertOpenMatsToCSV(cachedData);
  throw error;
}
```

### UI Error Handling
- **Loading States**: Visual feedback for async operations
- **Empty States**: Helpful messages when no data available
- **Toast Notifications**: Non-intrusive error messages
- **Graceful Degradation**: App continues working with partial data

## Performance Optimizations

### 1. Data Caching
- **Cache Duration**: 1 hour for gym data
- **Storage**: AsyncStorage for local persistence
- **Cache Invalidation**: Automatic refresh on app startup

### 2. Component Optimization
- **React.memo**: Prevents unnecessary re-renders
- **useMemo**: Memoizes expensive calculations
- **useCallback**: Prevents function recreation
- **Custom Hooks**: Optimized state management with proper memoization
- **Sub-Components**: Focused components reduce re-render scope

### 3. List Optimization
```typescript
<FlatList
  data={filteredGyms}
  keyExtractor={(gym) => gym.name}
  initialNumToRender={5}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
  getItemLayout={(data, index) => ({
    length: 280,
    offset: 280 * index,
    index,
  })}
/>
```

### 4. Image Optimization
- **Compressed Logos**: Optimized gym logos
- **Lazy Loading**: Images loaded on demand
- **Caching**: Local image cache

### 5. State Management Optimization
- **Custom Hooks**: Centralized state with useCallback/useMemo
- **Professional Logging**: Development-only logging reduces production overhead
- **Type Safety**: Enhanced TypeScript prevents runtime errors
- **Utility Functions**: Centralized functions reduce bundle size

## Data Parsing Analysis

### CSV Parsing Implementation
**File**: `src/services/github-data.service.ts`

**Parsing Flow**:
1. **Fetch CSV**: Download from GitHub
2. **Parse Rows**: Convert CSV to objects
3. **Validate Data**: Check required fields
4. **Transform**: Convert to OpenMat format
5. **Cache**: Store in AsyncStorage

**Error Handling**:
```typescript
private parseLastUpdatedDate(lastUpdated: string | undefined): string | undefined {
  if (!lastUpdated) return undefined;
  try {
    const date = new Date(lastUpdated);
    return date.toISOString();
  } catch (e) {
    console.warn(`Could not parse lastUpdated date: ${lastUpdated}`, e);
    return undefined;
  }
}
```

### Time Formatting
**Enhanced Time Parsing**:
- **Case Insensitive**: Handles "am/pm" and "AM/PM"
- **Multiple Formats**: "12pm", "6:30pm", "5:00 PM"
- **Smart Ranges**: "11-12 PM" for same period
- **Zero Removal**: "11:00" → "11"

## Security Considerations

### Data Security
- **No Sensitive Data**: Only public gym information
- **HTTPS Only**: All network requests use HTTPS
- **Input Validation**: All user inputs validated

### Privacy
- **Local Storage**: User preferences stored locally
- **No Tracking**: No analytics or user tracking
- **Minimal Permissions**: Only location when needed

## Monitoring & Logging

### Professional Logging System
**File**: `src/utils/logger.ts`

**Features**:
- **Categorized Logging**: Different log types for different concerns
- **Development/Production**: Automatic environment detection
- **Structured Output**: Consistent formatting across the app
- **Performance**: Minimal overhead in production

**Usage**:
```typescript
import { logger } from '../utils';

// Categorized logging
logger.debug('Debug info:', data);
logger.search('Search query:', query);
logger.filter('Filter applied:', filters);
logger.error('Error occurred:', error);
logger.success('Operation completed:', result);
logger.loading('Starting operation:', operation);
```

**Available Categories**:
- `debug`, `info`, `success`, `warn`, `error`
- `loading`, `search`, `location`, `dateTime`
- `filter`, `sort`, `share`, `capture`, `render`
- `navigation`, `textInput`, `state`, `visibility`

### Error Tracking
- **Network Errors**: Logged with context and fallback strategies
- **Data Parsing Errors**: Detailed error messages with recovery options
- **User Action Errors**: Non-intrusive error handling with user feedback
- **Custom Hook Errors**: Centralized error handling in hooks

## Future Technical Improvements

### 1. Performance
- **Virtual Scrolling**: For large gym lists
- **Image Preloading**: Faster logo loading
- **Background Sync**: Data updates in background
- **Bundle Optimization**: Code splitting for better load times

### 2. Architecture
- **State Management**: Enhanced custom hooks for complex state
- **API Layer**: Centralized API management with better error handling
- **Error Boundaries**: React error boundaries for better error recovery
- **Component Testing**: Unit tests for custom hooks and components

### 3. Data Management
- **Offline Support**: Full offline functionality with sync
- **Data Validation**: Schema validation for CSV data
- **Incremental Updates**: Delta updates for efficiency
- **Real-time Updates**: Live data updates for gym information

### 4. Developer Experience
- **Enhanced Logging**: More detailed logging categories
- **Performance Monitoring**: Real-time performance metrics
- **Type Safety**: Further TypeScript improvements
- **Documentation**: Auto-generated API documentation

## Refactoring Achievements

### Code Quality Improvements

#### Component Architecture Refactoring
- **ResultsScreen**: 2,258 → 1,200 lines (47% reduction)
- **DashboardScreen**: 1,869 → 1,000 lines (46% reduction)
- **Total Lines Extracted**: 1,927 lines into focused sub-components
- **New Component Structure**: Organized by screen responsibility

#### Custom Hooks Implementation
- **4 Reusable Hooks**: Centralized state management patterns
- **Lines Eliminated**: 450+ lines of duplicate state management
- **Consistency**: Same patterns across all screens
- **Performance**: Optimized with useCallback and useMemo

#### Utility Functions Consolidation
- **gymUtils.ts**: 270+ lines of centralized gym utilities
- **logger.ts**: Professional logging system replacing 100+ console.log statements
- **Type Safety**: Enhanced TypeScript interfaces throughout
- **Maintainability**: Single source of truth for common functions

### Architecture Benefits

#### Maintainability
- **Single Responsibility**: Each component has a focused purpose
- **Reusability**: Components and hooks can be used across screens
- **Testability**: Smaller components are easier to test
- **Debugging**: Professional logging makes issues easier to track

#### Performance
- **Reduced Re-renders**: Focused components minimize unnecessary updates
- **Optimized State**: Custom hooks use proper memoization
- **Bundle Size**: Centralized utilities reduce code duplication
- **Memory Usage**: Better cleanup and state management

#### Developer Experience
- **Type Safety**: Enhanced TypeScript prevents runtime errors
- **Consistent Patterns**: Same hooks and components across screens
- **Professional Logging**: Categorized, environment-aware logging
- **Clear Structure**: Organized file structure for easy navigation

### Migration Impact

#### Before Refactoring
- **Large Monolithic Components**: Hard to maintain and debug
- **Duplicate Code**: Same logic repeated across screens
- **Inconsistent Patterns**: Different approaches for similar functionality
- **Poor Type Safety**: Extensive use of `any` types

#### After Refactoring
- **Focused Components**: Each component has a single responsibility
- **Centralized Logic**: Custom hooks eliminate duplication
- **Consistent Patterns**: Same approaches across all screens
- **Enhanced Type Safety**: Proper TypeScript interfaces throughout

---

[← Back to README](../README.md) | [Roadmap →](ROADMAP.md) 