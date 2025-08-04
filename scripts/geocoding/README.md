# Geocoding Scripts Documentation

This directory contains the geocoding tools for the JiuJitsu Finder app.

## Files

### `geocode-city-improved.js`
**Purpose**: Batch geocoding tool for updating CSV files with gym coordinates
**Features**:
- Enhanced address cleaning and validation
- Multiple address variations for better accuracy
- 8-decimal precision coordinates
- City-specific coordinate validation
- Professional logging and error handling

**Usage**:
```bash
node scripts/geocoding/geocode-city-improved.js [city-name]
```

**Examples**:
```bash
node scripts/geocoding/geocode-city-improved.js tampa
node scripts/geocoding/geocode-city-improved.js austin
```

## Production Service

The main geocoding service is located at `src/utils/geocoding.ts` and provides:
- Multi-service geocoding (Google Maps + OpenStreetMap)
- React Native compatibility
- High precision coordinates
- Comprehensive validation
- Used by MapViewScreen for coordinate validation

## Workflow

1. **For App Development**: Use `src/utils/geocoding.ts`
2. **For Data Updates**: Use `scripts/geocoding/geocode-city-improved.js`
3. **For Coordinate Validation**: Use the validation functions in the production service

## Best Practices

- Always backup CSV files before geocoding
- Verify coordinates are on land, not in water
- Use high precision (6+ decimal places)
- Validate coordinates against expected city ranges
- Test map pins after coordinate updates

## Troubleshooting

- **Water coordinates**: Re-geocode with improved address cleaning
- **Low precision**: Use Google Maps API for higher accuracy
- **Failed geocoding**: Check address format and try variations
- **Validation errors**: Verify coordinates are within expected city ranges 