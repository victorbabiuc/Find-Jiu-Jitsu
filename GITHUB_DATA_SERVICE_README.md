# GitHub Data Service

This service fetches gym data from GitHub-hosted CSV files and provides caching, error handling, and location filtering.

## Features

- ✅ Fetch CSV data from GitHub raw URLs
- ✅ Parse CSV into OpenMat objects matching existing TypeScript interfaces
- ✅ Cache data using AsyncStorage for 24 hours
- ✅ Handle errors with fallback to cached data
- ✅ Support location filtering (Austin vs Tampa)
- ✅ Methods for refreshing and clearing cache
- ✅ Robust CSV parsing with quoted value support
- ✅ Session type validation and normalization

## CSV Format

The service expects CSV files with the following format:

```csv
id,name,address,distance,matFee,sessionDay,sessionTime,sessionType
1,STJJ,Tampa FL,5.2,0,Sunday,9:00 AM,gi
1,STJJ,Tampa FL,5.2,0,Thursday,5:00 PM,nogi
2,RMNU,Tampa FL,7.1,0,Wednesday,6:00 PM,both
```

### Required Headers

- `id` - Unique gym identifier (string)
- `name` - Gym name (string)
- `address` - Full address (string)
- `distance` - Distance in miles (number)
- `matFee` - Mat fee in dollars (number)
- `sessionDay` - Day of the week (string)
- `sessionTime` - Time of session (string)
- `sessionType` - Type of session: 'gi', 'nogi', or 'both' (string)

### Multiple Sessions

Each gym can have multiple rows (one per session). The service will group them by gym ID and create an array of `OpenMatSession` objects.

## Usage

### Basic Usage

```typescript
import { githubDataService } from '../services';

// Fetch gym data for Tampa
const tampaGyms = await githubDataService.getGymData('tampa');

// Fetch gym data for Austin
const austinGyms = await githubDataService.getGymData('austin');
```

### Force Refresh

```typescript
// Bypass cache and fetch fresh data
const freshData = await githubDataService.getGymData('tampa', true);
```

### Cache Management

```typescript
// Clear cache for specific location
await githubDataService.clearCache('tampa');

// Clear all gym data cache
await githubDataService.clearCache();

// Refresh data (force fetch)
const refreshedData = await githubDataService.refreshData('tampa');

// Check cache status
const cacheStatus = await githubDataService.getCacheStatus('tampa');
console.log(cacheStatus); // { hasCache: true, age: 3600000 }
```

### Location Support

```typescript
// Get all available locations
const locations = githubDataService.getAvailableLocations();
console.log(locations); // ['tampa', 'austin']

// Check if location is supported
const isSupported = githubDataService.isLocationSupported('tampa');
console.log(isSupported); // true
```

## Configuration

### GitHub URLs

Update the `CSV_URLS` in the service to point to your actual GitHub repository:

```typescript
private readonly CSV_URLS = {
  'tampa': 'https://raw.githubusercontent.com/your-repo/find-jiu-jitsu-data/main/tampa-gyms.csv',
'austin': 'https://raw.githubusercontent.com/your-repo/find-jiu-jitsu-data/main/austin-gyms.csv'
};
```

### Cache Duration

The cache duration is set to 24 hours by default. You can modify this in the service:

```typescript
private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

## Error Handling

The service includes comprehensive error handling:

1. **Network Errors**: Falls back to cached data if available
2. **CSV Parsing Errors**: Validates headers and handles malformed data
3. **Cache Errors**: Gracefully handles AsyncStorage failures
4. **Invalid Data**: Skips rows with missing required fields

## Integration with Existing API Service

To integrate with your existing `apiService`, you can modify the `getOpenMats` method:

```typescript
// In api.service.ts
async getOpenMats(location: string, filters?: Partial<Filters>): Promise<OpenMat[]> {
  try {
    // Use GitHub data service instead of mock data
    const data = await githubDataService.getGymData(location);
    
    // Apply filters here if needed
    // TODO: Implement filtering logic
    
    return data;
  } catch (error) {
    console.error('Error fetching gym data:', error);
    
    // Fallback to mock data
    if (location.toLowerCase().includes('austin')) {
      return mockAustinGyms;
    }
    return mockTampaGyms;
  }
}
```

## Sample CSV Files

### tampa-gyms.csv
```csv
id,name,address,distance,matFee,sessionDay,sessionTime,sessionType
1,STJJ,Tampa FL,5.2,0,Sunday,9:00 AM,gi
1,STJJ,Tampa FL,5.2,0,Thursday,5:00 PM,nogi
2,RMNU,Tampa FL,7.1,0,Wednesday,6:00 PM,both
```

### austin-gyms.csv
```csv
id,name,address,distance,matFee,sessionDay,sessionTime,sessionType
austin-1,10th Planet Austin,4509 Freidrich Ln #210 Austin TX 78744,5.2,25,Wednesday,10:00 AM,nogi
austin-1,10th Planet Austin,4509 Freidrich Ln #210 Austin TX 78744,5.2,25,Saturday,12:00 PM,nogi
austin-2,10th Planet Round Rock,3810 Gattis School Rd Suite 109 & 110 Round Rock TX 78664,12.5,0,Sunday,12:00 PM,nogi
```

## Session Type Validation

The service normalizes session types to match your TypeScript interface:

- `'gi'`, `'g'` → `'gi'`
- `'nogi'`, `'no-gi'`, `'no gi'`, `'n'` → `'nogi'`
- `'both'`, `'b'`, or any other value → `'both'`

## Dependencies

Make sure you have the required dependency:

```bash
npm install @react-native-async-storage/async-storage
```

## Testing

You can test the service with the sample CSV data provided in `sample-gym-data.csv`. Update the GitHub URLs to point to your actual repository before using in production. 