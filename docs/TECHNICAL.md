# 🔧 Technical Details

Detailed architecture, APIs, and implementation specifics for Find Jiu Jitsu.

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
        ├── DashboardScreen
        ├── FindStack
        │   ├── LocationScreen
        │   ├── TimeSelectionScreen
        │   ├── ResultsScreen
        │   └── MapViewScreen
        ├── SavedScreen
        └── ProfileStack
            ├── ProfileScreen
            └── ProfileDetailsScreen
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
Context Provider (useReducer)
    ↓
State Update
    ↓
Component Re-render
    ↓
UI Update
```

## API Services

### GitHub Data Service
**File**: `src/services/github-data.service.ts`

**Key Features**:
- **CSV Parsing**: Converts GitHub-hosted CSV to OpenMat objects
- **Caching**: 1-hour cache with automatic refresh
- **Error Handling**: Graceful fallback to cached data
- **Rate Limiting**: Handles GitHub API 429 errors

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
  openMats: Session[];
}

interface Session {
  day: string;
  time: string;
  type: string;
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

### Console Logging
```typescript
// Development logging
if (__DEV__) {
  console.log('🔍 Filtering gyms - openMats count:', openMats.length);
  console.log('✅ ResultsScreen: Data loaded successfully -', gyms.length, 'gyms');
}
```

### Error Tracking
- **Network Errors**: Logged with context
- **Data Parsing Errors**: Detailed error messages
- **User Action Errors**: Non-intrusive error handling

## Future Technical Improvements

### 1. Performance
- **Virtual Scrolling**: For large gym lists
- **Image Preloading**: Faster logo loading
- **Background Sync**: Data updates in background

### 2. Architecture
- **State Management**: Consider Redux for complex state
- **API Layer**: Centralized API management
- **Error Boundaries**: React error boundaries

### 3. Data Management
- **Offline Support**: Full offline functionality
- **Data Validation**: Schema validation for CSV data
- **Incremental Updates**: Delta updates for efficiency

---

[← Back to README](../README.md) | [Roadmap →](ROADMAP.md) 