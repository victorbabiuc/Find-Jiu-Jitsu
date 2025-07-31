---
name: Add New City
about: Add a new city to the JiuJitsu Finder app
title: 'Add [City Name] to JiuJitsu Finder'
labels: ['enhancement', 'data', 'new-city']
assignees: ''
---

## City Information

**City Name**: [e.g., Miami, FL]
**State/Province**: [e.g., Florida]
**Country**: [e.g., USA]

## Gym Data

**Number of Gyms**: [e.g., 5-10 gyms]
**Data Source**: [e.g., Personal knowledge, gym websites, community input]

## Implementation Plan

- [ ] Create CSV file: `data/[city]-gyms.csv`
- [ ] Add gym data with proper formatting
- [ ] Run geocoding script: `node geocode-city.js [city]`
- [ ] Update app code to include new city
- [ ] Test locally with `npx expo start`
- [ ] Submit pull request

## Additional Notes

[Any additional information about the city, gyms, or special considerations]

## Checklist

- [ ] I have verified the gym information is accurate
- [ ] I have followed the CSV format requirements
- [ ] I have tested the geocoding process
- [ ] I have tested the app locally
- [ ] I have included all required gym information

---

**Contact**: glootieapp@gmail.com 