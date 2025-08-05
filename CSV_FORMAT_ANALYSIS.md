# CSV Format Change Analysis - St Pete Test Case

## 1. How the App Currently Reads and Processes CSV Data

### Current Flow:
```
CSV File → parseCSVToOpenMats() → OpenMat[] → UI Components
```

### Current CSV Structure (stpete-gyms.csv):
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
stpete-bjj,St Pete BJJ,"5540 Haines Rd N, St Petersburg, FL 33714","https://www.stpetebjj.com/",0,0,0,Sunday,"5:00 PM",Gi/NoGi,"27.8117,-82.6509",2025-01-28
stpete-inside-control,Inside Control Academy,"4654 28th St N, St Petersburg, FL 33714","https://insidecontrolacademy.com/",0,0,0,Sunday,"11:00 AM",Gi/NoGi,"27.7947,-82.6826",2025-01-28
stpete-gracie-largo,Gracie Jiu Jitsu Largo,"5047 Ulmerton Road, Largo, FL 33760","https://graciejiujitsulargo.com/",0,25,0,Sunday,"9:00 AM - 10:30 AM",NoGi,"27.8467,-82.7837",2025-01-28
```

### Current Processing Logic:
1. **Header Validation**: Checks for required headers including `sessionDay`, `sessionTime`, `sessionType`
2. **Row Parsing**: Each row becomes a `CSVRow` object with session data
3. **Gym Grouping**: Groups rows by gym name, consolidating multiple sessions
4. **Session Creation**: Creates `OpenMatSession[]` from `sessionDay`, `sessionTime`, `sessionType`
5. **Final Structure**: Returns `OpenMat[]` with `openMats: OpenMatSession[]`

### Current Data Structure:
```typescript
interface OpenMat {
  id: string;
  name: string;
  address: string;
  distance: number;
  openMats: OpenMatSession[];  // ← This is the key structure
  matFee: number;
  dropInFee?: number;
  website?: string;
  coordinates?: string;
  lastUpdated?: string;
}

interface OpenMatSession {
  day: string;      // "Sunday"
  time: string;     // "5:00 PM"
  type: string;     // "Gi/NoGi"
}
```

## 2. Functions That Would Break

### Primary Breaking Functions:

#### A. `parseCSVToOpenMats()` - MAJOR BREAK
```typescript
// ❌ CURRENT - Expects sessionDay, sessionTime, sessionType
const requiredHeaders = ['id', 'name', 'address', 'distance', 'matFee', 'dropInFee', 'sessionDay', 'sessionTime', 'sessionType'];

// ✅ NEW - Would need day columns
const requiredHeaders = ['id', 'name', 'address', 'distance', 'matFee', 'dropInFee', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
```

#### B. `CSVRow` Interface - BREAKS
```typescript
// ❌ CURRENT
interface CSVRow {
  sessionDay: string;    // "Sunday"
  sessionTime: string;   // "5:00 PM"
  sessionType: string;   // "Gi/NoGi"
}

// ✅ NEW
interface CSVRow {
  monday?: string;       // "6:00 PM - Gi/NoGi"
  tuesday?: string;      // "7:00 PM - NoGi"
  wednesday?: string;    // ""
  thursday?: string;     // ""
  friday?: string;       // ""
  saturday?: string;     // ""
  sunday?: string;       // "5:00 PM - Gi/NoGi"
}
```

#### C. Session Creation Logic - BREAKS
```typescript
// ❌ CURRENT - Creates sessions from sessionDay/sessionTime
if (row.sessionDay && row.sessionTime && row.sessionDay.trim() !== '') {
  const session: OpenMatSession = {
    day: row.sessionDay.trim(),
    time: row.sessionTime.trim(),
    type: this.validateSessionType(row.sessionType)
  };
  gym.openMats.push(session);
}

// ✅ NEW - Would need to parse day columns
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
days.forEach(day => {
  const sessionData = row[day];
  if (sessionData && sessionData.trim() !== '') {
    const session = parseSessionFromDayColumn(sessionData, day);
    gym.openMats.push(session);
  }
});
```

## 3. Testing with St Pete Only

### ✅ YES - Can Test Safely

**Why it's safe:**
- St Pete has only 3 gyms (minimal risk)
- Other cities use separate CSV files
- App loads data per location independently
- Cache is location-specific

**Test Strategy:**
1. Create new `stpete-gyms-new.csv` with new format
2. Update `CSV_URLS` to point to new file temporarily
3. Test parsing logic
4. Revert if issues found

## 4. Map View Impact

### ✅ MAP VIEW WOULD STILL WORK

**Why:**
- Map view uses `gym.coordinates` property
- Coordinates are gym-level data (not session-level)
- Map markers are created per gym, not per session
- Distance calculations use gym coordinates

**Current Map Code:**
```typescript
// This would still work - coordinates are gym-level
const coords = parseCoordinates(gym.coordinates);
if (coords) {
  // Create marker for gym
}
```

## 5. Session Filtering Impact

### ✅ SESSION FILTERING WOULD STILL WORK

**Why:**
- Filtering works on `OpenMatSession[]` structure
- Session type is preserved in new format
- UI components consume the same `OpenMat[]` structure

**Current Filtering Logic:**
```typescript
// This logic would still work - session.type is preserved
if (activeFilters.gi && (sessionType.includes('gi') || sessionType.includes('both'))) {
  // Show gym
}
```

## 6. Step-by-Step Implementation Plan

### Phase 1: Create New Format Parser (Safe)
1. **Create new parsing function**
   ```typescript
   private parseCSVToOpenMatsNewFormat(csvData: string): OpenMat[]
   ```

2. **Create new CSVRow interface**
   ```typescript
   interface CSVRowNew {
     id: string;
     name: string;
     address: string;
     website: string;
     distance: string;
     matFee: string;
     dropInFee: string;
     coordinates?: string;
     lastUpdated?: string;
     monday?: string;
     tuesday?: string;
     wednesday?: string;
     thursday?: string;
     friday?: string;
     saturday?: string;
     sunday?: string;
   }
   ```

3. **Create session parsing helper**
   ```typescript
   private parseSessionFromDayColumn(sessionData: string, day: string): OpenMatSession
   ```

### Phase 2: Convert St Pete Data
1. **Create new stpete-gyms-new.csv**
   ```csv
   id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
   stpete-bjj,St Pete BJJ,"5540 Haines Rd N, St Petersburg, FL 33714","https://www.stpetebjj.com/",0,0,0,"27.8117,-82.6509",2025-01-28,,,,,,,"5:00 PM - Gi/NoGi"
   stpete-inside-control,Inside Control Academy,"4654 28th St N, St Petersburg, FL 33714","https://insidecontrolacademy.com/",0,0,0,"27.7947,-82.6826",2025-01-28,,,,,,,"11:00 AM - Gi/NoGi"
   stpete-gracie-largo,Gracie Jiu Jitsu Largo,"5047 Ulmerton Road, Largo, FL 33760","https://graciejiujitsulargo.com/",0,25,0,"27.8467,-82.7837",2025-01-28,,,,,,,"9:00 AM - 10:30 AM - NoGi"
   ```

### Phase 3: Test Implementation
1. **Add feature flag**
   ```typescript
   private readonly USE_NEW_FORMAT = {
     'stpete': true,
     'tampa': false,
     'austin': false,
     'miami': false
   };
   ```

2. **Update parsing logic**
   ```typescript
   private parseCSVToOpenMats(csvData: string, location: string): OpenMat[] {
     if (this.USE_NEW_FORMAT[location]) {
       return this.parseCSVToOpenMatsNewFormat(csvData);
     }
     return this.parseCSVToOpenMatsOldFormat(csvData);
   }
   ```

### Phase 4: Validation
1. **Test St Pete data loads correctly**
2. **Verify map markers appear**
3. **Test session filtering works**
4. **Check all UI components display correctly**

### Phase 5: Rollout to Other Cities
1. **Convert Tampa data**
2. **Convert Austin data**
3. **Convert Miami data**
4. **Remove old parsing logic**

## 7. Risk Assessment

### 🟢 LOW RISK
- **Map functionality**: Uses gym-level coordinates
- **Session filtering**: Works on session objects
- **UI components**: Consume same data structure

### 🟡 MEDIUM RISK
- **CSV parsing logic**: Major rewrite needed
- **Data validation**: New format validation required
- **Cache invalidation**: Need to clear cache for new format

### 🔴 HIGH RISK
- **Session parsing**: Complex logic to parse "5:00 PM - Gi/NoGi" format
- **Data integrity**: Risk of losing session information during conversion
- **Rollback complexity**: Hard to revert if issues found

## 8. Questions for Clarification

1. **Session Format**: How should we format sessions in day columns? 
   - Option A: "5:00 PM - Gi/NoGi"
   - Option B: "5:00 PM|Gi/NoGi" 
   - Option C: Separate columns for time and type?

2. **Multiple Sessions**: What if a gym has multiple sessions on the same day?
   - Option A: "5:00 PM - Gi/NoGi, 7:00 PM - NoGi"
   - Option B: Multiple rows per gym
   - Option C: Separate columns like "sunday_1", "sunday_2"

3. **Backward Compatibility**: Should we support both formats during transition?

4. **Data Migration**: Who will convert the existing CSV files to new format? 