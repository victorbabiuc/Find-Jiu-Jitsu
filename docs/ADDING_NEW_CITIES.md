# Adding New Cities to JiuJitsu Finder

This guide provides step-by-step instructions for adding a new city to JiuJitsu Finder. Follow these instructions carefully to ensure your new city works properly.

## Table of Contents
1. [CSV File Format](#csv-file-format)
2. [Code Changes Needed](#code-changes-needed)
3. [GitHub Integration](#github-integration)
4. [Coordinate Requirements](#coordinate-requirements)
5. [Testing Your Implementation](#testing-your-implementation)

---

## 1. CSV File Format

### Required Headers (Exact Order)
Your CSV file must have these headers in exactly this order:
```
id,name,address,website,phoneNumber,coordinates,distance,sessionDay,sessionTime,sessionType,matFee,dropInFee,lastUpdated
```

### Column Descriptions

| Column | Required | Description | Format | Example |
|--------|----------|-------------|--------|---------|
| `id` | ✅ | Unique identifier for each gym session | `city-gymname-number` | `miami-fightsports-1` |
| `name` | ✅ | Gym name | Text | `Fightsports Miami` |
| `address` | ✅ | Full address | Text in quotes | `"615 5th St, Miami Beach, FL 33139"` |
| `website` | ✅ | Gym website URL | URL | `https://miami.fightsportsglobal.com` |
| `phoneNumber` | ❌ | Phone number (can be empty) | Text or empty | `(305) 555-0123` |
| `coordinates` | ✅ | GPS coordinates | `latitude,longitude` | `25.7749,-80.1378` |
| `distance` | ✅ | Distance (set to 0) | Number | `0` |
| `sessionDay` | ✅ | Day of the week | Text | `Friday` |
| `sessionTime` | ✅ | Session time | Time format | `7:15 PM` |
| `sessionType` | ✅ | Type of session | `Gi`, `NoGi`, `Gi/NoGi`, `MMA` | `Gi/NoGi` |
| `matFee` | ✅ | Open mat fee | Number | `0` (for free) |
| `dropInFee` | ✅ | Drop-in class fee | Number | `35` |
| `lastUpdated` | ❌ | Last update date | YYYY-MM-DD | `2025-01-28` |

### Example Row
```csv
miami-fightsports-1,Fightsports Miami,"615 5th St, Miami Beach, FL 33139",https://miami.fightsportsglobal.com,,"25.7749,-80.1378",0,Friday,7:15 PM,Gi/NoGi,0,0,
```

### Special Formatting Requirements

1. **Addresses**: Must be in quotes if they contain commas
2. **Coordinates**: Must be in `latitude,longitude` format with no spaces
3. **IDs**: Must be unique and follow pattern `city-gymname-number`
4. **Session Types**: Use exact values: `Gi`, `NoGi`, `Gi/NoGi`, `MMA`
5. **Times**: Use 12-hour format with AM/PM
6. **Fees**: Use `0` for free sessions

---

## 2. Code Changes Needed

### Step 1: Add CSV URL to GitHub Data Service

**File:** `src/services/github-data.service.ts`

**Find this section:**
```javascript
private readonly CSV_URLS = {
  'tampa': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/tampa-gyms.csv',
  'austin': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/austin-gyms.csv',
  'miami': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/miami-gyms.csv'
};
```

**Add your city:**
```javascript
private readonly CSV_URLS = {
  'tampa': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/tampa-gyms.csv',
  'austin': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/austin-gyms.csv',
  'miami': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/miami-gyms.csv',
  'yourcity': 'https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/yourcity-gyms.csv'
};
```

### Step 2: Add Force Refresh Method

**In the same file, add:**
```javascript
/**
 * Force refresh YourCity data specifically
 * @returns Promise<OpenMat[]> - Fresh YourCity data
 */
async forceRefreshYourCityData(): Promise<OpenMat[]> {
  logger.force('Force refreshing YourCity data...');
  await this.clearCache('yourcity');
  return this.getGymData('yourcity', true);
}
```

### Step 3: Update Dashboard Screen

**File:** `src/screens/DashboardScreen.tsx`

**Add gym count state:**
```javascript
const [yourcityGymCount, setYourcityGymCount] = useState(0);
```

**Update data loading:**
```javascript
const [tampaGyms, austinGyms, miamiGyms, yourcityGyms] = await Promise.all([
  githubDataService.getGymData('tampa'),
  githubDataService.getGymData('austin'),
  githubDataService.getGymData('miami'),
  githubDataService.getGymData('yourcity')
]);

const yourcityUnique = new Set(yourcityGyms.map(gym => gym.name)).size;
setYourcityGymCount(yourcityUnique);
```

**Add city card (place in alphabetical order):**
```javascript
<TouchableOpacity
  style={[
    styles.cityCard,
    { backgroundColor: theme.surface },
    selectedLocation === 'YourCity' && { backgroundColor: selectionColor }
  ]}
  onPress={() => {
    haptics.medium();
    setSelectedLocation('YourCity');
    navigation.navigate('Find', { screen: 'TimeSelection' });
  }}
>
  <View style={styles.cityCardContent}>
    <Text style={styles.cityEmoji}>🏙️</Text>
    <View style={styles.cityCardText}>
      <Text style={[
        styles.cityCardTitle,
        { color: selectedLocation === 'YourCity' ? '#FFFFFF' : theme.text.primary }
      ]}>
        YourCity, ST
      </Text>
      <Text style={[
        styles.cityCardSubtitle,
        { color: selectedLocation === 'YourCity' ? '#FFFFFF' : theme.text.secondary }
      ]}>
        {isLoadingCounts ? 'Loading...' : `${yourcityGymCount} gyms available`}
      </Text>
    </View>
    <Ionicons 
      name="chevron-forward" 
      size={20} 
      color={selectedLocation === 'YourCity' ? '#FFFFFF' : theme.text.secondary} 
    />
  </View>
</TouchableOpacity>
```

### Step 4: Update Results Screen

**File:** `src/screens/ResultsScreen.tsx`

**Update city detection:**
```javascript
const city = location.toLowerCase().includes('austin') ? 'austin' : 
             location.toLowerCase().includes('miami') ? 'miami' : 
             location.toLowerCase().includes('yourcity') ? 'yourcity' : 
             location.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
```

**Update force refresh logic:**
```javascript
if (city === 'tampa') {
  await githubDataService.forceRefreshTampaData();
} else if (city === 'miami') {
  await githubDataService.forceRefreshMiamiData();
} else if (city === 'yourcity') {
  await githubDataService.forceRefreshYourCityData();
} else {
  await githubDataService.refreshData(city);
}
```

**Update location display:**
```javascript
const [displayLocationText, setDisplayLocationText] = useState(() => {
  if (location.toLowerCase().includes('miami')) return 'Miami Downtown';
  if (location.toLowerCase().includes('austin')) return 'Austin Downtown';
  if (location.toLowerCase().includes('yourcity')) return 'YourCity Downtown';
  return 'Tampa Downtown';
});
```

**Update user location coordinates:**
```javascript
const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(() => {
  if (location.toLowerCase().includes('miami')) {
    return { latitude: 25.7617, longitude: -80.1918 };
  } else if (location.toLowerCase().includes('austin')) {
    return { latitude: 30.2672, longitude: -97.7431 };
  } else if (location.toLowerCase().includes('yourcity')) {
    return { latitude: YOUR_LAT, longitude: YOUR_LNG }; // Replace with your city coordinates
  } else {
    return { latitude: 27.9506, longitude: -82.4572 };
  }
});
```

### Step 5: Update API Service

**File:** `src/services/api.service.ts`

**Update city detection:**
```javascript
const city = safeLocation.toLowerCase().includes('austin') ? 'austin' : 
             safeLocation.toLowerCase().includes('miami') ? 'miami' : 
             safeLocation.toLowerCase().includes('yourcity') ? 'yourcity' : 
             safeLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
```

### Step 6: Update Map View Screen

**File:** `src/screens/MapViewScreen.tsx`

**Update center location logic:**
```javascript
const getCenterLocation = () => {
  if (locationText?.toLowerCase().includes('miami')) {
    return { latitude: 25.7617, longitude: -80.1918 };
  } else if (locationText?.toLowerCase().includes('austin')) {
    return { latitude: 30.2672, longitude: -97.7431 };
  } else if (locationText?.toLowerCase().includes('yourcity')) {
    return { latitude: YOUR_LAT, longitude: YOUR_LNG }; // Replace with your city coordinates
  } else {
    return { latitude: 27.9506, longitude: -82.4572 };
  }
};
```

**Update city detection:**
```javascript
const city = selectedLocation.toLowerCase().includes('austin') ? 'austin' : 
             selectedLocation.toLowerCase().includes('miami') ? 'miami' : 
             selectedLocation.toLowerCase().includes('yourcity') ? 'yourcity' : 
             selectedLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
```

**Update force refresh logic:**
```javascript
if (city === 'tampa') {
  await githubDataService.forceRefreshTampaData();
} else if (city === 'miami') {
  await githubDataService.forceRefreshMiamiData();
} else if (city === 'yourcity') {
  await githubDataService.forceRefreshYourCityData();
} else {
  await githubDataService.refreshData(city);
}
```

### Step 7: Update Geocoding Service

**File:** `src/utils/geocoding.ts`

**Add city coordinates validation:**
```javascript
const cityRanges = {
  'tampa': {
    lat: { min: 27.5, max: 28.5 },
    lng: { min: -82.8, max: -82.0 }
  },
  'austin': {
    lat: { min: 30.0, max: 30.8 },
    lng: { min: -98.0, max: -97.4 }
  },
  'miami': {
    lat: { min: 25.5, max: 26.5 },
    lng: { min: -81.0, max: -80.0 }
  },
  'yourcity': {
    lat: { min: YOUR_MIN_LAT, max: YOUR_MAX_LAT },
    lng: { min: YOUR_MIN_LNG, max: YOUR_MAX_LNG }
  }
};
```

**Add water body checks:**
```javascript
// Basic water body checks for YourCity area
if (city.toLowerCase() === 'yourcity') {
  // Add your city's water body coordinates
  if (latitude > YOUR_WATER_LAT_MIN && latitude < YOUR_WATER_LAT_MAX && 
      longitude > YOUR_WATER_LNG_MIN && longitude < YOUR_WATER_LNG_MAX) {
    return true;
  }
}
```

---

## 3. GitHub Integration

### Step 1: Create CSV File
1. Create a new file: `data/yourcity-gyms.csv`
2. Add the header row and your gym data
3. Follow the exact format shown above

### Step 2: Commit and Push
```bash
git add data/yourcity-gyms.csv
git commit -m "Add YourCity gym data"
git push origin main
```

### Step 3: Verify GitHub URL
Your CSV will be available at:
```
https://raw.githubusercontent.com/victorbabiuc/JiuJitsu-Finder/main/data/yourcity-gyms.csv
```

### Step 4: Cache Management
The app automatically:
- Caches data for 1 hour
- Uses cache versioning to force refresh when needed
- Clears cache when new data is pushed

---

## 4. Coordinate Requirements

### Getting Coordinates

#### Option 1: Google Maps
1. Go to [Google Maps](https://maps.google.com)
2. Search for your gym address
3. Right-click on the marker
4. Select the coordinates (e.g., "25.7617, -80.1918")
5. Copy the latitude and longitude

#### Option 2: Geocoding Service
1. Use [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)
2. Search for your gym address
3. Copy the coordinates from the result

#### Option 3: GPS Device
1. Visit the gym location
2. Use a GPS device or smartphone GPS app
3. Record the coordinates

### Coordinate Format
- **Format**: `latitude,longitude` (no spaces)
- **Precision**: At least 6 decimal places
- **Example**: `25.7749,-80.1378`

### City Boundary Validation
Your coordinates should be within these ranges:

| City | Latitude Range | Longitude Range |
|------|----------------|-----------------|
| Tampa | 27.5 - 28.5 | -82.8 - -82.0 |
| Austin | 30.0 - 30.8 | -98.0 - -97.4 |
| Miami | 25.5 - 26.5 | -81.0 - -80.0 |
| YourCity | YOUR_MIN - YOUR_MAX | YOUR_MIN - YOUR_MAX |

### Validation Rules
1. **Latitude**: Must be between -90 and 90
2. **Longitude**: Must be between -180 and 180
3. **City Bounds**: Must be within your city's geographic area
4. **Water Check**: Should not be over major water bodies
5. **Precision**: Should have at least 6 decimal places

---

## 5. Testing Your Implementation

### Step 1: Local Testing
1. Start the development server: `npx expo start`
2. Select your new city from the home screen
3. Verify gym data loads correctly
4. Check that location display shows your city
5. Test map view centers on your city coordinates

### Step 2: Data Validation
1. Verify all gyms appear in the list
2. Check that session times are correct
3. Confirm fees display properly
4. Test filtering (Gi/NoGi, Free, etc.)
5. Verify distance calculations work

### Step 3: Map Testing
1. Open map view for your city
2. Verify map centers on correct coordinates
3. Check that gym markers appear
4. Test marker interactions (directions, website)
5. Verify radius filtering works

### Step 4: Cache Testing
1. Clear app cache
2. Restart the app
3. Verify fresh data loads from GitHub
4. Check that cache works for subsequent loads

---

## Common Issues and Solutions

### Issue: Gym data not loading
**Solution**: Check that your CSV URL is correct and accessible

### Issue: Wrong city showing
**Solution**: Verify city detection logic includes your city name

### Issue: Map not centering correctly
**Solution**: Check that coordinates are in correct format and within city bounds

### Issue: Cache not updating
**Solution**: Increment cache version or clear cache manually

### Issue: Coordinates showing in water
**Solution**: Verify coordinates are accurate and on land

---

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all code changes were made correctly
3. Ensure CSV format matches exactly
4. Test with a simple gym entry first
5. Contact the development team for assistance

---

**Last Updated**: January 2025
**Version**: 1.5.2 