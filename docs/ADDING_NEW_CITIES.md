# Adding New Cities to JiuJitsu Finder

This guide provides step-by-step instructions for adding a new city to JiuJitsu Finder. Follow these instructions carefully to ensure your new city works properly.

## Table of Contents
1. [CSV File Format](#csv-file-format)
2. [Code Changes Needed](#code-changes-needed)
3. [GitHub Integration](#github-integration)
4. [Coordinate Requirements](#coordinate-requirements)
5. [Testing Your Implementation](#testing-your-implementation)

---

## 1. CSV File Format (NEW FORMAT)

### Required Headers (Exact Order)
Your CSV file must have these headers in exactly this order:
```
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
```

### Column Descriptions

| Column | Required | Description | Format | Example |
|--------|----------|-------------|--------|---------|
| `id` | ✅ | Unique identifier for each gym | `city-gymname` | `miami-fightsports` |
| `name` | ✅ | Gym name | Text in quotes | `"Fightsports Miami"` |
| `address` | ✅ | Full address | Text in quotes | `"615 5th St, Miami Beach, FL 33139"` |
| `website` | ❌ | Gym website URL | URL | `https://miami.fightsportsglobal.com` |
| `distance` | ✅ | Distance (set to 0) | Number | `0` |
| `matFee` | ✅ | Open mat fee | Number | `0` (for free) |
| `dropInFee` | ❌ | Drop-in class fee | Number | `35` |
| `coordinates` | ✅ | GPS coordinates | `"latitude,longitude"` in quotes | `"25.7749,-80.1378"` |
| `last_updated` | ❌ | Last update date | YYYY-MM-DD | `2025-01-28` |
| `monday` | ❌ | Monday sessions | `"Time - Type"` | `"5:00 PM - Gi/NoGi"` |
| `tuesday` | ❌ | Tuesday sessions | `"Time - Type"` | `"6:30 PM - 7:30 PM - NoGi"` |
| `wednesday` | ❌ | Wednesday sessions | `"Time - Type"` | `"11:00 AM - Gi"` |
| `thursday` | ❌ | Thursday sessions | `"Time - Type"` | `"8:30 PM - 9:30 PM - Gi/NoGi"` |
| `friday` | ❌ | Friday sessions | `"Time - Type"` | `"6:00 PM - Gi/NoGi"` |
| `saturday` | ❌ | Saturday sessions | `"Time - Type"` | `"10:00 AM - 12:00 PM - Gi/NoGi"` |
| `sunday` | ❌ | Sunday sessions | `"Time - Type"` | `"9:00 AM - Gi/NoGi"` |

### Example Row
```csv
miami-fightsports,"Fightsports Miami","615 5th St, Miami Beach, FL 33139",https://miami.fightsportsglobal.com,0,0,35,"25.7749,-80.1378",2025-01-28,,,,,"7:15 PM - Gi/NoGi",,
```

### Special Formatting Requirements

1. **One Row Per Gym**: Each gym gets exactly one row, regardless of how many sessions it has
2. **Addresses**: Must be in quotes if they contain commas
3. **Coordinates**: Must be in quotes: `"latitude,longitude"` (comma requires quotes)
4. **IDs**: Must be unique and follow pattern `city-gymname` (no numbers needed)
5. **Session Format**: `"Time - SessionType"` (e.g., `"5:00 PM - Gi/NoGi"`)
6. **Time Ranges**: Use format `"6:30 PM - 7:30 PM - NoGi"`
7. **Multiple Sessions**: Separate with commas: `"5:00 PM - Gi, 7:00 PM - NoGi"`
8. **Session Types**: Use exact values: `Gi`, `NoGi`, `Gi/NoGi`, `MMA Sparring`
9. **Times**: Use 12-hour format with AM/PM
10. **Fees**: Use `0` for free sessions
11. **Empty Days**: Leave empty if no sessions on that day

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
- **Format**: `"latitude,longitude"` (must be in quotes due to comma)
- **Precision**: At least 6 decimal places
- **Example**: `"25.7749,-80.1378"`
- **Important**: The comma in coordinates requires quotes around the entire field

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

### Step 5: CSV Format Validation
1. **Test CSV parsing**: Use a CSV validator to ensure proper format
2. **Check quoted fields**: Verify coordinates and addresses are properly quoted
3. **Validate session format**: Ensure sessions follow `"Time - Type"` pattern
4. **Test with sample data**: Start with 1-2 gyms before adding all data
5. **Verify GitHub rendering**: Check that GitHub displays your CSV correctly

### Pre-Deployment Checklist
- [ ] CSV has correct headers in exact order
- [ ] All coordinates are quoted: `"25.7749,-80.1378"`
- [ ] Session format is correct: `"5:00 PM - Gi/NoGi"`
- [ ] No trailing spaces after quoted fields
- [ ] Each gym has exactly one row
- [ ] Empty day columns are truly empty (no hidden characters)
- [ ] CSV renders correctly on GitHub
- [ ] App loads data without parsing errors
- [ ] Map shows gym markers correctly
- [ ] Filters work properly

---

## Common Issues and Solutions

### Issue: CSV parsing errors
**Symptoms**: "Any value after quoted field isn't allowed" or parsing fails
**Solutions**:
- Ensure coordinates are quoted: `"25.7749,-80.1378"`
- Remove trailing spaces after quoted fields
- Check for embedded line breaks in addresses
- Use proper CSV escaping for fields with commas

### Issue: Sessions not appearing
**Symptoms**: Gym shows but no sessions listed
**Solutions**:
- Verify session format: `"5:00 PM - Gi/NoGi"`
- Check for typos in day column names (monday, tuesday, etc.)
- Ensure session data is in quotes if it contains commas
- Test with simple session format first

### Issue: Coordinates causing parsing errors
**Symptoms**: CSV fails to parse or coordinates split across columns
**Solutions**:
- Always quote coordinates: `"25.7749,-80.1378"`
- Use proper CSV parsing that handles quoted fields
- Test coordinates in a CSV validator

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