# Gi/NoGi Filter Analysis with Option A Format

## 1. How Current Gi/NoGi Filter Buttons Work

### Current Filter Logic (from ResultsScreen.tsx):

```typescript
// Apply Gi/No-Gi filters with smart logic
if (activeFilters.gi || activeFilters.nogi) {
  filtered = filtered.filter(gym => {
    // Check what session types this gym offers
    const sessionTypes = gym.openMats.map(mat => mat.type);
    const hasGi = sessionTypes.includes('gi');
    const hasNoGi = sessionTypes.includes('nogi');
    const hasBoth = sessionTypes.includes('both') || sessionTypes.includes('Gi/NoGi');
    
    if (activeFilters.gi && activeFilters.nogi) {
      // Show gyms that have EITHER Gi OR No-Gi OR both
      const matches = hasGi || hasNoGi || hasBoth;
      return matches;
    } else if (activeFilters.gi) {
      // Show gyms with Gi or both types
      const matches = hasGi || hasBoth;
      return matches;
    } else if (activeFilters.nogi) {
      // Show gyms with No-Gi or both types
      const matches = hasNoGi || hasBoth;
      return matches;
    }
    return false;
  }).map(gym => {
    // Filter the sessions within each gym based on active filters
    let filteredSessions = gym.openMats;
    
    if (activeFilters.gi && !activeFilters.nogi) {
      // Only show Gi sessions
      filteredSessions = gym.openMats.filter(session => 
        session.type === 'gi' || session.type === 'both' || session.type === 'Gi/NoGi'
      );
    } else if (activeFilters.nogi && !activeFilters.gi) {
      // Only show No-Gi sessions
      filteredSessions = gym.openMats.filter(session => 
        session.type === 'nogi' || session.type === 'both' || session.type === 'Gi/NoGi'
      );
    }
    // If both filters are active, show all sessions (no filtering needed)
    
    return {
      ...gym,
      openMats: filteredSessions
    };
  });
}
```

### Current Session Type Validation (from github-data.service.ts):

```typescript
private validateSessionType(type: string): 'gi' | 'nogi' | 'both' | 'mma' | string {
  const normalized = type.toLowerCase().trim();
  
  switch (normalized) {
    case 'gi':
    case 'g':
      return 'gi';
    case 'nogi':
    case 'no-gi':
    case 'no gi':
    case 'n':
      return 'nogi';
    case 'both':
    case 'b':
      return 'both';
    case 'mma':
    case 'mma sparring':
    case 'sparring':
      return 'mma';
    default:
      // Preserve original session type for custom types like "MMA Sparring"
      return type.trim();
  }
}
```

---

## 2. Simple Function to Parse Option A Format

### New Session Parsing Function:

```typescript
/**
 * Parse session data from Option A format: "5:00 PM - Gi/NoGi"
 * @param sessionData - Raw session string from CSV
 * @param day - Day of the week (e.g., "sunday")
 * @returns OpenMatSession object
 */
private parseSessionFromDayColumn(sessionData: string, day: string): OpenMatSession {
  // Handle multiple sessions separated by commas
  const sessions = sessionData.split(',').map(s => s.trim());
  
  // For now, just parse the first session (can be extended for multiple)
  const firstSession = sessions[0];
  
  // Parse "5:00 PM - Gi/NoGi" format
  const parts = firstSession.split(' - ');
  
  if (parts.length !== 2) {
    // Fallback: treat entire string as time, assume "both" type
    return {
      day: day.charAt(0).toUpperCase() + day.slice(1), // "sunday" -> "Sunday"
      time: firstSession.trim(),
      type: 'both'
    };
  }
  
  const time = parts[0].trim();
  const type = parts[1].trim();
  
  return {
    day: day.charAt(0).toUpperCase() + day.slice(1), // "sunday" -> "Sunday"
    time: time,
    type: this.validateSessionType(type)
  };
}

/**
 * Parse multiple sessions from a day column
 * @param sessionData - Raw session string like "5:00 PM - Gi/NoGi, 7:00 PM - NoGi"
 * @param day - Day of the week
 * @returns Array of OpenMatSession objects
 */
private parseMultipleSessionsFromDayColumn(sessionData: string, day: string): OpenMatSession[] {
  const sessions = sessionData.split(',').map(s => s.trim());
  
  return sessions.map(session => {
    const parts = session.split(' - ');
    
    if (parts.length !== 2) {
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        time: session.trim(),
        type: 'both'
      };
    }
    
    const time = parts[0].trim();
    const type = parts[1].trim();
    
    return {
      day: day.charAt(0).toUpperCase() + day.slice(1),
      time: time,
      type: this.validateSessionType(type)
    };
  });
}
```

---

## 3. Filter Behavior Examples

### Example Gym Data:
```typescript
const gym = {
  id: "stpete-example",
  name: "Example Gym",
  address: "123 Main St",
  openMats: [
    { day: "Sunday", time: "5:00 PM", type: "Gi/NoGi" },
    { day: "Sunday", time: "7:00 PM", type: "NoGi" }
  ]
};
```

### Filter Scenarios:

#### **Scenario 1: No Filters Selected**
```typescript
activeFilters = { gi: false, nogi: false }
// Result: Show ALL sessions
// - Sunday 5:00 PM (Gi/NoGi)
// - Sunday 7:00 PM (NoGi)
```

#### **Scenario 2: Gi Filter Only**
```typescript
activeFilters = { gi: true, nogi: false }
// Gym passes filter because it has "Gi/NoGi" (includes Gi)
// Sessions filtered to show only Gi-related:
// - Sunday 5:00 PM (Gi/NoGi) ✅ (includes Gi)
// - Sunday 7:00 PM (NoGi) ❌ (filtered out)
```

#### **Scenario 3: NoGi Filter Only**
```typescript
activeFilters = { gi: false, nogi: true }
// Gym passes filter because it has both "Gi/NoGi" and "NoGi"
// Sessions filtered to show only NoGi-related:
// - Sunday 5:00 PM (Gi/NoGi) ✅ (includes NoGi)
// - Sunday 7:00 PM (NoGi) ✅ (is NoGi)
```

#### **Scenario 4: Both Filters Selected**
```typescript
activeFilters = { gi: true, nogi: true }
// Gym passes filter because it has both Gi and NoGi
// Show ALL sessions (no session filtering):
// - Sunday 5:00 PM (Gi/NoGi) ✅
// - Sunday 7:00 PM (NoGi) ✅
```

---

## 4. Confirmation: Filters Would Still Work Correctly

### ✅ **YES - Filters Would Work Perfectly**

**Why:**

1. **Same Data Structure**: The `OpenMatSession` objects still have the same structure:
   ```typescript
   interface OpenMatSession {
     day: string;      // "Sunday"
     time: string;     // "5:00 PM"
     type: string;     // "Gi/NoGi" (normalized by validateSessionType)
   }
   ```

2. **Same Filter Logic**: The filtering code operates on `session.type`, which remains unchanged:
   ```typescript
   // This logic works exactly the same
   session.type === 'gi' || session.type === 'both' || session.type === 'Gi/NoGi'
   ```

3. **Same Type Validation**: The `validateSessionType()` function already handles "Gi/NoGi":
   ```typescript
   // "Gi/NoGi" gets preserved as-is (default case)
   return type.trim(); // Returns "Gi/NoGi"
   ```

4. **Same UI Components**: All UI components consume the same `OpenMat[]` structure.

### **Key Insight:**
The filtering logic is **completely independent** of how the CSV data is parsed. As long as the final `OpenMatSession` objects have the correct `type` field, the filters will work exactly the same.

### **Validation Flow:**
```
CSV: "5:00 PM - Gi/NoGi"
↓
parseSessionFromDayColumn() 
↓
OpenMatSession { day: "Sunday", time: "5:00 PM", type: "Gi/NoGi" }
↓
Filter logic: session.type === 'Gi/NoGi' ✅ (matches)
```

**🎯 Conclusion: The filters would work identically with Option A format.** 