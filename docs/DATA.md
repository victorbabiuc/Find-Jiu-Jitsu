# 📊 Data Management

CSV format specifications, data sources, geocoding process, and data quality standards.

[← Back to README](../README.md)

## CSV Format Specifications

### NEW FORMAT (Current)
All city CSV files use the new one-row-per-gym format with these exact columns:

```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
```

### Column Details

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `id` | string | ✅ | Unique gym identifier | `tampa-stjj-1` |
| `name` | string | ✅ | Full gym name | `"South Tampa Jiu Jitsu"` |
| `address` | string | ✅ | Complete street address | `"4916 South Lois Ave, Tampa, FL 33611"` |
| `website` | string | ❌ | Gym website URL | `"https://southtampajiujitsu.com/"` |
| `distance` | number | ✅ | Distance from user (use 0) | `0` |
| `matFee` | number | ✅ | Open mat fee (0 for free) | `0` |
| `dropInFee` | number | ❌ | Drop-in class fee | `20` |
| `coordinates` | string | ❌ | "lat,long" format in quotes | `"27.8896,-82.4948"` |
| `last_updated` | string | ❌ | YYYY-MM-DD format | `2025-01-28` |
| `monday` | string | ❌ | Session data for Monday | `"5:00 PM - Gi/NoGi"` |
| `tuesday` | string | ❌ | Session data for Tuesday | `"6:30 PM - 7:30 PM - NoGi"` |
| `wednesday` | string | ❌ | Session data for Wednesday | `"11:00 AM - Gi"` |
| `thursday` | string | ❌ | Session data for Thursday | `"8:30 PM - 9:30 PM - Gi/NoGi"` |
| `friday` | string | ❌ | Session data for Friday | `"6:00 PM - Gi/NoGi"` |
| `saturday` | string | ❌ | Session data for Saturday | `"10:00 AM - 12:00 PM - Gi/NoGi"` |
| `sunday` | string | ❌ | Session data for Sunday | `"9:00 AM - Gi/NoGi"` |

### Data Types & Validation

#### ID Format
- **Pattern**: `{city}-{gymname}-{number}`
- **Examples**: `tampa-stjj-1`, `austin-10th-planet-austin`
- **Rules**: Lowercase, hyphens only, no spaces

#### Session Format (NEW)
- **Pattern**: `"Time - SessionType"`
- **Examples**:
  - `"5:00 PM - Gi/NoGi"`
  - `"6:30 PM - 7:30 PM - NoGi"` (time ranges)
  - `"11:00 AM - Gi"`
  - `"10:00 AM - 12:00 PM - Gi/NoGi"` (time ranges)
- **Multiple Sessions**: Separate with commas: `"5:00 PM - Gi, 7:00 PM - NoGi"`
- **Session Types**: `Gi`, `NoGi`, `Gi/NoGi`, `MMA Sparring`

#### Time Formats
- **Supported Formats**:
  - `"5:00 PM"` (standard)
  - `"6:30 PM - 7:30 PM"` (time ranges)
  - `"10:00 AM - 12:00 PM"` (time ranges)
- **Case Insensitive**: App handles both cases
- **24-hour Format**: Not supported

#### Coordinates Format
- **Pattern**: `"latitude,longitude"` (must be in quotes)
- **Precision**: 6-7 decimal places
- **Example**: `"27.8896,-82.4948"`
- **Important**: Must be quoted due to comma in value
- **Validation**: Must be valid lat/long values

### Example CSV Files (NEW FORMAT)

#### Tampa Example
```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
tampa-stjj-1,"South Tampa Jiu Jitsu","4916 South Lois Ave, Tampa, FL 33611",https://southtampajiujitsu.com/,0,0,20,"27.8933026,-82.5153407",2025-01-28,,,,,"5:00 PM - NoGi","11:00 AM - MMA Sparring","9:00 AM - Gi"
tampa-robson,"Robson Moura","11220 W Hillsborough Ave, Tampa, FL 33635",https://robsonmoura.com/,0,0,0,"28.0123,-82.5869",2025-01-28,,,,,"6:00 PM - Gi/NoGi",,
tampa-humaita,"Gracie Humaita","8610 Citrus Park Dr, Tampa, FL 33625",https://www.graciehumaita.com,0,0,0,"28.0682,-82.5759",2025-01-28,,,,,"6:30 PM - 7:30 PM - Gi/NoGi",,
```

#### Austin Example
```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
austin-10th-planet-austin,"10th planet austin","4509 Freidrich Ln #210, Austin, TX 78744",https://10patx.com/,0,25,35,"30.2070873,-97.750738",2025-01-28,,,,,,"12:00 PM - 2:00 PM - NoGi","12 - 2:00 PM - NoGi"
austin-coopers,"Coopers","12129 N FM 620 Suite # 330, Austin, TX 78750",https://coopersjiujitsu.com/,0,0,0,"30.4612868,-97.8174358",2025-01-28,,"6:30 PM - 7:30 PM - Gi/NoGi",,"6:30 PM - 7:30 PM - Gi/NoGi",,"1:00 PM - Gi/NoGi","4:00 PM - Gi/NoGi"
```

#### Miami Example
```csv
id,name,address,website,distance,matFee,dropInFee,coordinates,last_updated,monday,tuesday,wednesday,thursday,friday,saturday,sunday
miami-10th-planet,"10th Planet Miami","123 Main St, Miami, FL 33101",https://10thplanetmiami.com,0,0,0,"25.7749,-80.1378",2025-01-28,,,,,,"12:00 PM - 2:00 PM - NoGi",
miami-gracie,"Rilion Gracie Jiu-Jitsu Academy (HEADQUARTERS)","456 Oak Ave, Miami, FL 33102",https://riliongracie.com,0,0,0,"25.7617,-80.1918",2025-01-28,,,,,,,"11:00 AM - 12:30 PM - Gi/NoGi"
```

## Data Sources

### Current Cities
- **Tampa, FL**: 23 gyms, comprehensive coverage
- **Austin, TX**: 19 gyms, comprehensive coverage
- **Miami, FL**: 77 gyms, comprehensive coverage
- **St. Petersburg, FL**: 3 gyms, comprehensive coverage

### Data Collection Process
1. **Manual Research**: Find gyms offering open mats
2. **Contact Verification**: Call/email gyms to verify information
3. **Data Entry**: Add to CSV with proper formatting
4. **Geocoding**: Add coordinates for map functionality
5. **Quality Check**: Verify accuracy and completeness

### Data Quality Standards
- **Accuracy**: All information verified with gyms
- **Completeness**: Required fields must be filled
- **Consistency**: Follow established format patterns
- **Timeliness**: Update when information changes

## Geocoding Process

### Automated Geocoding
**Script**: `geocode-city.js`

**Process**:
1. Read CSV file for specified city
2. Extract addresses from `address` column
3. Send to geocoding service (Google Maps API)
4. Parse response for coordinates
5. Update CSV with coordinates
6. Generate log file with results

**Usage**:
```bash
node geocode-city.js miami
```

### Success Rates by Address Type

| Address Type | Success Rate | Example |
|--------------|--------------|---------|
| Simple addresses (street + city + state) | 90-95% | `"123 Main St, Miami, FL"` |
| Addresses with suite numbers | 60-80% | `"123 Main St #100, Miami, FL"` |
| Very specific addresses | 40-60% | `"123 Main St Building A Suite 100, Miami, FL 33101"` |

### Manual Geocoding for Failed Addresses

#### Using Google Maps
1. **Search Address**: Enter the gym address in Google Maps
2. **Right-click Location**: Right-click on the exact location
3. **Copy Coordinates**: Select "What's here?" to get coordinates
4. **Format**: Use `"latitude,longitude"` format

#### Using Other Services
- **OpenStreetMap**: Free geocoding service
- **Bing Maps**: Alternative to Google Maps
- **Manual Entry**: For known locations

### Coordinate Validation
- **Latitude Range**: -90 to 90
- **Longitude Range**: -180 to 180
- **Precision**: 6-7 decimal places recommended
- **Accuracy**: Should point to exact gym location

## Data Parsing Analysis

### CSV Parsing Implementation
**File**: `src/services/github-data.service.ts`

**Parsing Flow**:
1. **Fetch CSV**: Download from GitHub repository
2. **Parse Headers**: Validate column structure
3. **Parse Rows**: Convert each row to object
4. **Validate Data**: Check required fields
5. **Transform**: Convert to OpenMat format
6. **Cache**: Store in AsyncStorage

### Error Handling
```typescript
private parseLastUpdatedDate(lastUpdated: string | undefined): string | undefined {
  if (!lastUpdated) {
    return undefined;
  }
  try {
    const date = new Date(lastUpdated);
    return date.toISOString();
  } catch (e) {
    console.warn(`Could not parse lastUpdated date: ${lastUpdated}`, e);
    return undefined;
  }
}
```

### Data Validation
- **Required Fields**: Check for missing required data
- **Data Types**: Validate number/string types
- **Format Validation**: Check time formats, coordinates
- **Business Logic**: Validate session types, fees

## Data Management Best Practices

### Adding New Gyms
1. **Research**: Find gym offering open mats
2. **Verify**: Contact gym to confirm information
3. **Format**: Use correct CSV format
4. **Geocode**: Add coordinates if possible
5. **Test**: Verify data displays correctly
6. **Update**: Add last_updated date

### Updating Existing Data
1. **Check Accuracy**: Verify current information
2. **Update Fields**: Modify only changed data
3. **Update Date**: Set new last_updated date
4. **Test**: Verify changes work correctly
5. **Commit**: Submit changes with clear description

### Data Quality Checklist
- [ ] All required columns present
- [ ] Addresses are complete and accurate
- [ ] Session times are in correct format
- [ ] Session types are valid
- [ ] Coordinates are accurate (when available)
- [ ] Last updated dates are included
- [ ] No duplicate entries
- [ ] Consistent formatting

## Common Data Issues

### Missing Coordinates
**Issue**: Address not found by geocoding service
**Solutions**:
- Use Google Maps to manually find coordinates
- Check address format and spelling
- Try alternative address formats
- Contact gym for exact location

### Invalid Time Formats
**Issue**: Times not displaying correctly
**Solutions**:
- Use standard 12-hour format
- Include AM/PM designation
- Use consistent formatting across all entries
- Test time parsing in app

### Duplicate Entries
**Issue**: Same gym listed multiple times
**Solutions**:
- Use unique IDs for each session
- Combine sessions under single gym entry
- Remove duplicate rows
- Verify gym name consistency

### Missing Required Fields
**Issue**: App crashes or displays incorrectly
**Solutions**:
- Fill all required fields
- Use empty string for optional fields
- Validate CSV before committing
- Test data loading locally

## Data Backup & Version Control

### Automatic Backups
- **Git History**: All changes tracked in Git
- **CSV Backups**: Automatic backups before geocoding
- **Log Files**: Detailed logs of all operations

### Version Control
- **Commit Messages**: Clear descriptions of changes
- **Branch Strategy**: Feature branches for changes
- **Pull Requests**: Review process for all changes
- **Rollback**: Easy to revert problematic changes

### Data Recovery
- **Git Revert**: Revert to previous versions
- **Backup Files**: Restore from backup files
- **Manual Fix**: Edit CSV files directly
- **Validation**: Verify data after recovery

---

[← Back to README](../README.md) | [Contributing Guide →](CONTRIBUTING.md) 