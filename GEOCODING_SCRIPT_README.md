# Geocoding Script Documentation

This script automatically adds coordinates to gym CSV files using the Nominatim geocoding service.

## Overview

The geocoding script processes CSV files containing gym addresses and adds latitude/longitude coordinates for map functionality.

## Usage

```bash
node geocode-city.js [city-name]
```

### Examples
```bash
node geocode-city.js austin
node geocode-city.js tampa
node geocode-city.js miami
```

## File Structure

```
JiuJitsuFinder/
├── data/
│   ├── [city]-gyms.csv          # Input file
│   └── [city]-gyms-backup.csv   # Backup file
├── geocoding-[city]-[timestamp].log  # Log file
└── geocode-city.js              # Script file
```

## Input Format

The script expects CSV files with these columns:
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
```

## Output

- **Updated CSV**: Original file with coordinates added
- **Backup**: Original file preserved as backup
- **Log**: Detailed log of geocoding process

## Configuration

### Rate Limiting
- **Delay**: 1.5 seconds between requests
- **User Agent**: JiuJitsuFinder/1.0
- **Service**: Nominatim OpenStreetMap

### Address Processing
- **Cleaning**: Removes special characters
- **Variations**: Tries multiple address formats
- **Fallbacks**: Removes suite/unit numbers

## Error Handling

### Common Issues
1. **Rate Limiting**: Automatic retry with delays
2. **Invalid Addresses**: Logged and skipped
3. **Network Errors**: Retry with exponential backoff
4. **No Results**: Tried with address variations

### Recovery
- **Backup**: Original file always preserved
- **Logging**: Detailed error information
- **Resume**: Can restart from last successful point

## Best Practices

### Address Quality
- Use complete addresses (street, city, state, zip)
- Avoid PO boxes or incomplete addresses
- Include suite numbers when available

### Performance
- Run during off-peak hours
- Monitor rate limiting
- Check logs for errors

### Data Validation
- Verify coordinates manually
- Check for obvious errors
- Test with mapping software

## Troubleshooting

### Script Issues
1. **File not found**: Check CSV file exists
2. **Permission errors**: Ensure write access
3. **Network issues**: Check internet connection

### Geocoding Issues
1. **No results**: Try different address format
2. **Wrong location**: Verify address accuracy
3. **Rate limited**: Wait and retry

## Output Files

### Log File Format
```
[timestamp] INFO: Starting geocoding for [city]
[timestamp] INFO: Processing [address]
[timestamp] SUCCESS: [address] → [lat,long]
[timestamp] ERROR: [address] → [error message]
[timestamp] INFO: Summary: [stats]
```

### Backup File
- Preserves original data
- Timestamped filename
- Can be restored if needed

## Integration

### With App
- Coordinates used for map display
- Distance calculations
- Location-based filtering

### With Development
- Automated data processing
- Consistent coordinate format
- Quality assurance

## Security

### Rate Limiting
- Respects Nominatim usage policy
- Includes proper user agent
- Implements delays between requests

### Data Protection
- No personal information processed
- Only public address data
- Logs contain no sensitive data

---

**Contact**: glootieapp@gmail.com 