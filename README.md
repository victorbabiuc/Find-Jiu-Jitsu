# 🥋 JiuJitsu Finder

Your Jiu Jitsu Training Companion - Find open mat sessions at gyms near you!

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS-lightgrey.svg)
![Status](https://img.shields.io/badge/status-Live%20on%20App%20Store-success.svg)
![Architecture](https://img.shields.io/badge/architecture-Refactored%20v2.0-brightgreen.svg)

## What It Does

JiuJitsu Finder helps Brazilian Jiu-Jitsu practitioners discover open mat training sessions at local gyms. Currently supports **Tampa and Austin** with comprehensive gym coverage.

**✅ Live on App Store** - Download now!

## Key Features

- 🎯 **Browse open mats** by city with smart filtering (Gi/No-Gi/Free)
- 📅 **Date selection** with quick filters and calendar
- ⭐ **Save favorites** and get one-tap directions/calls
- 📤 **Professional sharing** with Instagram Stories-optimized cards
- 🔍 **Real-time search** with instant results
- 🏗️ **Modern Architecture** with reusable components and custom hooks

## 🚀 Recent Major Improvements

### Component Architecture Refactoring
- **Extracted 1,927 lines** into focused sub-components
- **ResultsScreen**: 2,258 → 1,200 lines (47% reduction)
- **DashboardScreen**: 1,869 → 1,000 lines (46% reduction)
- **New structure**: `/components/results/` and `/components/dashboard/`

### Custom Hooks Implementation
- **4 reusable hooks** for consistent state management
- **useGymActions**: Centralized gym interactions
- **useGymSearch**: Debounced search with suggestions
- **useGymModal**: Modal state management
- **useGymFilters**: Filter logic and counts

### Code Quality Improvements
- **Eliminated 450+ lines** of duplicate state management
- **Replaced 100+ console.log** statements with professional logging
- **Enhanced TypeScript safety** with proper interfaces
- **Centralized utility functions** in `gymUtils.ts`

## Quick Start

### For Users
1. Download from the iOS App Store
2. Select your city (Tampa or Austin)
3. Browse or search for gyms
4. Filter by date, session type, or free sessions
5. Save favorites and share with training partners

### For Developers
```bash
git clone https://github.com/victorbabiuc/Find-Jiu-Jitsu.git
cd FindJiuJitsu
npm install
npx expo start
```

## 📁 New Project Structure

```
src/
├── components/
│   ├── results/           # ResultsScreen sub-components
│   │   ├── ResultsGymCard.tsx
│   │   ├── ResultsFilterBar.tsx
│   │   ├── ResultsHeader.tsx
│   │   └── ResultsEmptyState.tsx
│   ├── dashboard/         # DashboardScreen sub-components
│   │   ├── DashboardSearchSection.tsx
│   │   ├── DashboardCityCards.tsx
│   │   └── DashboardGymModal.tsx
│   └── common/           # Shared components
├── hooks/                # Custom hooks for state management
│   ├── useGymActions.ts
│   ├── useGymSearch.ts
│   ├── useGymModal.ts
│   └── useGymFilters.ts
├── utils/
│   ├── gymUtils.ts       # Centralized gym utilities
│   └── logger.ts         # Professional logging system
└── screens/              # Main app screens (refactored)
```

## Documentation

- 📖 [Development Guide](docs/DEVELOPMENT.md) - Technical setup, authentication, and architecture
- 🏢 [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute gym data and code
- 📡 [API Reference](docs/API.md) - Technical reference and data structures
- 🗺️ [Roadmap](docs/ROADMAP.md) - Planned features and development progress

## Quick Contributing

Adding a gym? Just edit the CSV files in `data/` and submit a PR!
Need a new city? See our [Contributing Guide](docs/CONTRIBUTING.md).

**Community Contributors**: Check out our [Contributors](CONTRIBUTORS.md) page to see who's helping!

## License

MIT License - Built with ❤️ for the Jiu Jitsu community

---
**Contact**: glootieapp@gmail.com | **Version**: 1.3.0 | **Architecture**: Refactored v2.0

