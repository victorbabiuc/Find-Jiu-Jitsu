# 🥋 JiuJitsu Open Mat Finder

A React Native app that helps Brazilian Jiu-Jitsu practitioners find open mat sessions at gyms in their city.

## 📱 Screenshots
[Coming soon - LoginScreen, LocationScreen, TimeSelection, Results, LoadingAnimation]

## 🌟 Features

### ✅ Implemented
- **Find Open Mats by City** - Tampa and Austin with real data
- **Multi-Date Selection** - Pick today, tomorrow, weekend, or custom dates
- **Belt-Themed UI** - Animated belt progression (white→blue→purple→brown→black)
- **Dark/Light Mode** - Seamless theme switching
- **Location Services** - "Near Me" with GPS integration
- **Animated Loading** - Belt-colored loading bars with clever messages
- **Gym Details Modal** - Full information with one-tap directions

### 🚧 In Progress
- **More Cities** - Adding NYC, LA, Miami, Chicago, San Diego
- **Search & Filters** - Find gyms by name, price, gi/no-gi
- **User Accounts** - Save favorites and preferences
- **Real Backend** - Moving from mock data to live API

## 🛠️ Tech Stack

- **React Native + Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **React Navigation v6** - Stack & tab navigation
- **React Context API** - State management
- **Expo Location** - GPS services
- **AsyncStorage** - Local data persistence

## 📂 Project Structure
```
src/
├── screens/          # App screens
├── components/       # Reusable components
├── navigation/       # Navigation configuration
├── contexts/         # Global state management
├── services/         # API and data services
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## 🚀 Current Status

### Working Features
- Complete navigation flow
- Beautiful animations
- Location selection with GPS
- Multi-date picker
- Results display with gym cards
- Theme persistence

### Known Issues
- Scrolling fixed on all platforms
- Some mock data for non-Austin cities
- Profile/favorites not yet implemented

## 🎯 Roadmap to App Store

### Phase 1 (Current)
- [x] Core navigation
- [x] Basic UI/UX
- [x] Location services
- [x] Date selection
- [ ] User authentication

### Phase 2 (Next)
- [ ] 5+ cities with real data
- [ ] Search functionality
- [ ] User profiles
- [ ] Favorites system

### Phase 3 (Polish)
- [ ] App icon & launch screen
- [ ] Error handling
- [ ] Performance optimization
- [ ] App Store assets

## 📲 Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/OpenMatFinder.git
cd OpenMatFinder

# Install dependencies
npm install

# Start development
npx expo start

# Run on iOS
i (in terminal after expo start)

# Run on Android  
a (in terminal after expo start)
```

# App Store Submission Checklist

## 📍 Content & Features
- [ ] Add at least 5 cities with data
- [ ] Implement basic backend/API
- [ ] Add search/filter functionality

## 📜 Legal Requirements  
- [ ] Add Privacy Policy & Terms
- [ ] Include contact/support method

## 🎨 App Assets
- [ ] Create proper App Icon set (all required sizes)
- [ ] Design launch screen
- [ ] Prepare App Store screenshots
- [ ] Write App Store description

## 💻 Technical Requirements
- [ ] Add loading states
- [ ] Handle all permissions properly
- [ ] Add proper error messages
- [ ] Remove all console.logs
- [ ] Implement crash reporting

## 📱 Quality Assurance
- [ ] Test on multiple devices
- [ ] Test all edge cases
- [ ] Polish all UI elements
- [ ] Verify all navigation flows

## 🚀 Final Steps
- [ ] Set up App Store Connect
- [ ] Generate production build
- [ ] Submit for TestFlight
- [ ] Internal testing complete
- [ ] Submit for App Store review 