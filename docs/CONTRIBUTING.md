# 🏢 Contributing Guide

How to add new gyms, cities, and contribute to JiuJitsu Finder.

[← Back to README](../README.md)

## Quick Start

### Adding a Gym
1. **Fork the repository**
2. **Edit the CSV file** in `data/` directory
3. **Follow the CSV format** (see below)
4. **Test your changes** locally
5. **Submit a pull request**

### Adding a City
1. **Create new CSV file**: `data/{city}-gyms.csv`
2. **Add gym data** with proper formatting
3. **Run geocoding script**: `node geocode-city.js {city}`
4. **Update app code** to include new city
5. **Test and submit PR**

## CSV Format Requirements

All city CSV files MUST have these exact columns in this order:

```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
```

### Column Specifications

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | string | Unique gym identifier | `tampa-stjj-1` |
| `name` | string | Full gym name | `"South Tampa Jiu Jitsu"` |
| `address` | string | Complete street address | `"4916 South Lois Ave, Tampa, FL 33611"` |
| `website` | string | Gym website URL | `"https://southtampajiujitsu.com/"` |
| `distance` | number | Distance from user (use 0) | `0` |
| `matFee` | number | Open mat fee (0 for free) | `0` |
| `dropInFee` | number | Drop-in class fee | `20` |
| `sessionDay` | string | Day of the week | `Friday` |
| `sessionTime` | string | Time format | `"5:00 PM"` |
| `sessionType` | string | Session type | `NoGi` |
| `coordinates` | string | "lat,long" format | `"27.8896,-82.4948"` |
| `last_updated` | string | YYYY-MM-DD format | `2025-01-28` |

### Example Entries

```csv
tampa-stjj-1,"South Tampa Jiu Jitsu","4916 South Lois Ave, Tampa, FL 33611","https://southtampajiujitsu.com/",0,0,20,Friday,"5:00 PM",NoGi,"27.8896,-82.4948",2025-01-28
austin-10th-planet-austin,"10th Planet Austin","4509 Freidrich Ln #210, Austin, TX 78744","https://10patx.com/",0,25,35,Saturday,"12pm-2pm",NoGi,"30.2070873,-97.750738",2025-01-20
```

## Adding New Cities

### Step-by-Step Process

1. **Create CSV file**
   ```bash
   echo "id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated" > data/miami-gyms.csv
   ```

2. **Add gym data** with proper formatting (see CSV format above)

3. **Run geocoding script**
   ```bash
   node geocode-city.js miami
   ```

4. **Review geocoding results**
   ```bash
   cat geocoding-miami-*.log
   ```

5. **Manually add coordinates** for failed addresses using Google Maps

6. **Update app code** to include new city in `src/screens/FindScreen.tsx`

7. **Test locally**
   ```bash
   npx expo start
   ```

8. **Commit and push**
   ```bash
   git add data/miami-gyms.csv
   git commit -m "Add Miami gyms with coordinates"
   git push
   ```

### CSV Template for New Cities

```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates,last_updated
miami-gym-1,"Miami Jiu Jitsu Academy","123 Main St, Miami, FL 33101","https://miamibjj.com/",0,0,25,Saturday,"10:00 AM",Gi/NoGi,,2025-01-29
miami-gym-2,"South Beach BJJ","456 Ocean Dr, Miami Beach, FL 33139","https://southbeachbjj.com/",0,15,30,Sunday,"2:00 PM",NoGi,,2025-01-29
```

## Geocoding Process

### Automated Geocoding
The geocoding script automatically adds coordinates for most addresses:

- **Success Rate**: 90-95% for simple addresses
- **Address Format**: street + city + state works best
- **Suite Numbers**: Can reduce success rate to 60-80%

### Manual Geocoding for Failed Addresses

1. **Use Google Maps**
   - Search the address
   - Right-click on the location
   - Copy coordinates

2. **Format coordinates**
   - Use `"latitude,longitude"` format
   - Example: `"25.7617,-80.1918"`

3. **Update CSV**
   - Add coordinates to the appropriate rows
   - Verify accuracy

### Geocoding Success Rates

| Address Type | Success Rate |
|--------------|--------------|
| Simple addresses (street + city + state) | 90-95% |
| Addresses with suite numbers | 60-80% |
| Very specific addresses | 40-60% |

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/Find-Jiu-Jitsu.git
cd FindJiuJitsu
```

### 2. Create Feature Branch
```bash
git checkout -b feature/add-miami-gyms
```

### 3. Make Changes
- Edit CSV files in `data/` directory
- Follow the CSV format requirements
- Test changes locally

### 4. Test Your Changes
```bash
npx expo start
# Test the new city/gyms in the app
```

### 5. Commit and Push
```bash
git add .
git commit -m "Add Miami gyms with coordinates"
git push origin feature/add-miami-gyms
```

### 6. Create Pull Request
- Go to GitHub repository
- Click "Compare & pull request"
- Add detailed description of changes
- Include any testing notes

## Testing Guidelines

### Local Testing Checklist
- [ ] New city appears in city selection
- [ ] All gyms display correctly
- [ ] Search functionality works (including suggestions)
- [ ] Filtering works (Gi/No-Gi/Free)
- [ ] Gym details are complete
- [ ] Coordinates are accurate (if map view is working)
- [ ] Custom hooks work correctly
- [ ] Professional logging shows appropriate messages
- [ ] Component architecture follows new patterns

### Data Quality Standards
- [ ] All required columns present
- [ ] Addresses are complete and accurate
- [ ] Session times are in correct format
- [ ] Session types are valid (Gi/NoGi/Gi/NoGi)
- [ ] Last updated dates are included
- [ ] Coordinates are accurate (when available)

## Best Practices

### Data Entry
- **Use consistent address format**: street, city, state, zip
- **Avoid overly specific addresses**: suite numbers can cause geocoding issues
- **Include last_updated dates**: for data transparency
- **Verify session times**: ensure they're in correct format
- **Test with small sample**: run geocoding on a few addresses first

### Code Quality
- **Follow existing patterns**: use same naming conventions and custom hooks
- **Use custom hooks**: leverage existing hooks for state management
- **Create focused components**: follow the new component architecture
- **Test thoroughly**: verify all functionality works
- **Document changes**: include clear commit messages
- **Backup data**: the script creates automatic backups
- **Use professional logging**: replace console.log with logger utility

### Community Guidelines
- **Be respectful**: constructive feedback only
- **Help others**: answer questions in issues
- **Follow standards**: adhere to CSV format requirements
- **Test before submitting**: ensure changes work locally

## Common Issues

### Geocoding Failures
- **Issue**: Address not found by geocoding service
- **Solution**: Manually add coordinates using Google Maps
- **Prevention**: Use standard address formats

### CSV Format Errors
- **Issue**: Missing or incorrect columns
- **Solution**: Follow the exact CSV format specification
- **Prevention**: Use the provided template

### App Integration Issues
- **Issue**: New city not appearing in app
- **Solution**: Check that city is added to CITIES array in LocationScreen.tsx
- **Prevention**: Test locally before submitting PR

### Custom Hook Integration
- **Issue**: State management not working correctly
- **Solution**: Use existing custom hooks (useGymActions, useGymSearch, etc.)
- **Prevention**: Follow the established patterns in existing screens

### Component Architecture
- **Issue**: Components too large or unfocused
- **Solution**: Create focused sub-components following the new structure
- **Prevention**: Review existing component architecture in `/components/results/` and `/components/dashboard/`

## Getting Help

### Resources
- [Development Guide](DEVELOPMENT.md) - Technical setup and architecture
- [API Reference](API.md) - Data structures and service documentation

### Contact
- **Email**: glootieapp@gmail.com
- **Issues**: Create GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions

---

[← Back to README](../README.md) | [API Reference →](API.md) 