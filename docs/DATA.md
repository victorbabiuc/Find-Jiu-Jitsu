# 📊 Data Management

CSV format specifications, data sources, geocoding process, and data quality standards.

[← Back to README](../README.md)

## CSV Format Specifications

### Required Columns
All city CSV files MUST have these exact columns in this order:

```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
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
| `sessionDay` | string | ✅ | Day of the week | `Friday` |
| `sessionTime` | string | ✅ | Time format | `"5:00 PM"` |
| `sessionType` | string | ✅ | Session type | `NoGi` |
| `coordinates` | string | ❌ | "lat,long" format | `"27.8896,-82.4948"` |
| `last_updated` | string | ❌ | YYYY-MM-DD format | `2025-01-28` |

### Data Types & Validation

#### ID Format
- **Pattern**: `{city}-{gymname}-{number}`
- **Examples**: `tampa-stjj-1`, `austin-10th-planet-austin`
- **Rules**: Lowercase, hyphens only, no spaces

#### Session Types
- **Valid Values**: `Gi`, `NoGi`, `Gi/NoGi`, `Both`
- **Case Sensitive**: Use exact values
- **Default**: `Gi/NoGi` for mixed sessions

#### Time Formats
- **Supported Formats**:
  - `"5:00 PM"` (Tampa style)
  - `"12pm"` (Austin style)
  - `"6:30pm"` (Austin style)
  - `"11:00 AM - 1:00 PM"` (time ranges)
- **Case Insensitive**: App handles both cases
- **24-hour Format**: Not supported

#### Coordinates Format
- **Pattern**: `"latitude,longitude"`
- **Precision**: 6-7 decimal places
- **Example**: `"27.8896,-82.4948"`
- **Validation**: Must be valid lat/long values

### Example CSV Files

#### Tampa Format
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
tampa-stjj-1,"South Tampa Jiu Jitsu","4916 South Lois Ave, Tampa, FL 33611","https://southtampajiujitsu.com/",0,0,20,Friday,"5:00 PM",NoGi,"27.8896,-82.4948",2025-01-28
tampa-robson,"Robson Moura","11220 W Hillsborough Ave, Tampa, FL 33635","https://robsonmoura.com/",0,0,0,Friday,"6:00 PM",Gi/NoGi,"28.0123,-82.5869",2025-01-28
```

#### Austin Format
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
austin-10th-planet-austin,"10th planet austin","4509 Freidrich Ln #210, Austin, TX 78744","https://10patx.com/",0,25,35,Saturday,"12pm-2pm",NoGi,"30.2070873,-97.750738",2025-01-20
austin-atos,"Atos","11701 Bee Caves Rd Suite 110, Austin, TX 78738","https://atosjiujitsu.com/",0,0,,Saturday,"11:30am-12:30pm",Gi/NoGi,"30.2751119,-97.8014446",2025-01-20
```

## Data Sources

### Current Cities
- **Tampa, FL**: 19 gyms, comprehensive coverage
- **Austin, TX**: 35+ gyms, growing coverage

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