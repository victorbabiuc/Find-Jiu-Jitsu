# 📡 API Reference

Technical reference for JiuJitsu Finder services and data structures.

[← Back to README](../README.md)

## Data Types

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
}

interface OpenMatSession {
  day: string;      // "Sunday"
  time: string;     // "5:00 PM"  
  type: string;     // "Gi/NoGi"
}
```

### Search Filters
```typescript
interface SearchFilters {
  gi?: boolean;
  nogi?: boolean;
  price?: string;
  dateSelection?: string;
  dates?: Date[];
}
```

## Services

### GitHub Data Service
Fetches gym data from GitHub-hosted CSV files.

```typescript
// Get gym data for a city
const gyms = await githubDataService.getGymData('tampa');

// Force refresh (bypass cache)
const fresh = await githubDataService.getGymData('tampa', true);

// Cache management
await githubDataService.clearCache('tampa');
const status = await githubDataService.getCacheStatus('tampa');
```

### Search Service
Handles gym search and suggestions.

```typescript
// Search gyms
const results = searchService.searchGyms(query, allGyms);

// Recent searches
const recent = await searchService.getRecentSearches();
await searchService.saveRecentSearch(query);
```

## Custom Hooks

### useGymActions
```typescript
const {
  copyingGymId,
  copiedGymId, 
  sharingGymId,
  handleOpenWebsite,
  handleOpenDirections,
  handleCopyGymWithState,
  handleShareGym,
  handleToggleFavorite,
} = useGymActions({ favorites, toggleFavorite, shareCardRef });
```

### useGymSearch  
```typescript
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
} = useGymSearch({ allGyms, onSearchResultsChange });
```

### useGymModal
```typescript
const {
  modalVisible,
  selectedGym,
  shareCardGym,
  shareCardSession,
  shareCardRef,
  showGymDetails,
  handleCloseModal,
  setShareCardData,
} = useGymModal({ onModalOpen, onModalClose });
```

### useGymFilters
```typescript
const {
  activeFilters,
  sessionCounts,
  filteredGyms,
  hasActiveFilters,
  toggleFilter,
  handleFreeFilter,
  resetFilters,
} = useGymFilters({ allGyms, onFiltersChange });
```

## CSV Data Format

### File Structure
```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
```

### Session Format
```csv
"5:00 PM - Gi/NoGi"          # Standard session
"6:30 PM - 7:30 PM - NoGi"   # Time range
"11:00 AM - Gi, 7:00 PM - NoGi"  # Multiple sessions
```

### Coordinates
```csv
"27.8896,-82.4948"  # Must be quoted due to comma
```

## Utilities

### Logger
```typescript
import { logger } from '../utils';

logger.debug('Debug info:', data);
logger.search('Search query:', query);
logger.filter('Filter applied:', filters);
logger.error('Error occurred:', error);
logger.success('Operation completed:', result);
```

### Gym Utils
```typescript
import { formatTime, parseCoordinates, calculateDistance } from '../utils/gymUtils';

const time = formatTime("5:00 PM");
const coords = parseCoordinates("27.8896,-82.4948");
const distance = calculateDistance(userCoords, gymCoords);
```

## Error Handling

### Network Errors
- Automatic fallback to cached data
- Graceful degradation for offline scenarios
- User-friendly error messages

### Data Validation
- CSV header validation
- Required field checking
- Coordinate format validation
- Session type normalization

## Performance

### Caching Strategy
- **GitHub Data:** 1-hour cache via AsyncStorage
- **Search Results:** In-memory caching with debouncing
- **Images:** React Native automatic image caching

### Optimization
- **FlatList:** Virtualization for large lists
- **React.memo:** Component memoization
- **Custom Hooks:** useCallback/useMemo optimization
- **Professional Logging:** Development-only overhead

---

[← Back to README](../README.md) | [Development Guide →](DEVELOPMENT.md)
