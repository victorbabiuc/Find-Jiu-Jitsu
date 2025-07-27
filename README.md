# 🥋 Find Jiu Jitsu

Your Jiu Jitsu Training Companion - Find open mat sessions at gyms near you!

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Live%20on%20App%20Store-success.svg)

## 📱 App Description

Find Jiu Jitsu is an iOS app designed to help Brazilian Jiu-Jitsu practitioners discover open mat training sessions at local gyms. Whether you're traveling or looking for extra training opportunities, quickly find gyms offering open mats in your area.

**Currently supports Tampa and Austin with comprehensive gym coverage.**

## 🚀 Development Status

### ✅ **LIVE ON APP STORE (v1.3.0)**
These features are currently available to users in the App Store:

- **Core gym browsing** - Browse open mat sessions by city
- **Smart filtering** - Filter by Gi, No-Gi, or Free sessions
- **Date selection** - Choose specific dates or use quick filters
- **Favorites system** - Save preferred gyms locally
- **Sharing functionality** - Share sessions with image cards
- **Pull-to-refresh** - Refresh gym data in real-time
- **Gym information** - Complete session details, pricing, contact info
- **One-tap actions** - Call gyms, get directions, visit websites
- **Responsive design** - Works on all iOS device sizes

### 🔄 **IN DEVELOPMENT**
These features are partially implemented but not yet functional:

- **Map view** - Visual gym locations (currently has compilation errors)
- **Authentication system** - Google/Apple Sign-In (UI implemented, backend not connected)
- **User profiles** - Profile screens exist but not functional
- **Enhanced sharing** - Professional image cards (partially implemented)

### 📋 **PLANNED (Future Roadmap)**
These features are planned for future versions:

- **Firebase integration** - Cloud sync and user management
- **Push notifications** - Session reminders and new gym alerts
- **Community features** - "I'm going" functionality and training logs
- **More cities** - Expand beyond Tampa and Austin
- **Advanced search** - Filter by distance, time of day, skill level

## ✨ Current Features (v1.3.0)

### 🎯 Core Functionality
- **Browse open mat sessions by city** - Tampa and Austin with comprehensive gym coverage
- **Smart filtering system** - Filter by Gi, No-Gi, or Free sessions with intelligent session-level filtering
- **Calendar date selection** - Choose specific dates or use quick filters (Today, Tomorrow, Weekend)
- **Enhanced sharing** - Share sessions with professional image cards and app promotion
- **Pull-to-refresh** - Swipe down to refresh gym data in real-time

### 🏢 Gym Information
- **Complete session details** - Times, days, and session types (Gi/No-Gi)
- **Pricing information** - Open mat fees (free or paid) and drop-in rates
- **Contact details** - Gym addresses, phone numbers, and websites
- **Gym logos** - Custom logos for major gyms (10th Planet, STJJ, Gracie Tampa South, TMT)

### 💾 User Experience
- **Save favorite gyms** - Keep track of preferred training spots with local storage
- **One-tap actions** - Call gyms, get directions, visit websites, or save with a single tap
- **Dark/Light theme support** - Consistent design system with unified color scheme
- **Intuitive navigation** - Streamlined flow from city selection to results
- **Empty state handling** - Helpful messages and action buttons when no results found
- **Smooth animations** - Professional entrance animations and micro-interactions
- **Haptic feedback** - Tactile response for all user interactions
- **Loading states** - Visual feedback for all async operations
- **Toast notifications** - Non-intrusive success/error messages

### 🎨 Design Features
- **Professional UI** - Modern, clean interface with consistent design language
- **Responsive design** - Works perfectly on all iOS device sizes
- **Circular splash screen** - Perfect circular app icon during loading
- **Enhanced share functionality** - Professional image cards with app branding
- **Consistent button layout** - All gym cards have uniform website/directions/share buttons

## 🚀 How to Use

1. **Select your city** - Choose between Tampa or Austin
2. **Choose dates** - Use quick filters (Today, Tomorrow, Weekend) or select custom dates from the calendar
3. **Filter results** - Apply Gi/No-Gi filters or show only free sessions
4. **Explore gyms** - Tap gym cards to view detailed information
5. **Save favorites** - Use the heart icon to save preferred gyms
6. **Share sessions** - Share professional image cards with training partners
7. **Take action** - Call gyms, get directions, or visit websites directly from the app
8. **Refresh data** - Pull down on gym lists to refresh with latest information

### 💡 Pro Tips
- **Tap white space** on the calendar screen to clear date selections
- **Drag across dates** to select multiple days at once
- **Use filters** to find specific session types or free training
- **Save favorites** to quickly access your preferred gyms
- **Pull to refresh** for the latest gym data
- **Copy gym details** using the copy button in the header

## 🛠️ Technical Stack

### **Core Framework**
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript for full type safety
- **Navigation**: React Navigation v6 with streamlined user flow
- **State Management**: Context API + React Hooks
- **Data Storage**: AsyncStorage for local favorites

### **Data & Services**
- **Data Source**: GitHub-hosted CSV files for easy updates
- **Data Service**: Custom GitHub data service with caching
- **API Service**: RESTful API service for gym data
- **Storage Service**: Local storage utilities

### **UI & UX**
- **Styling**: React Native StyleSheet with consistent design system
- **Animations**: React Native Animated API with custom utility service
- **Haptics**: expo-haptics for tactile feedback
- **Icons**: Ionicons for consistent iconography

### **Sharing & Utilities**
- **Sharing**: Image sharing with react-native-view-shot and expo-sharing
- **Clipboard**: expo-clipboard for text copying
- **Location**: expo-location for user location services
- **Linear Gradient**: expo-linear-gradient for visual effects

### **Authentication (In Development)**
- **Google Sign-In**: @react-native-google-signin/google-signin
- **Apple Sign-In**: expo-apple-authentication
- **Auth Session**: expo-auth-session for OAuth flow

## 📊 Data Sources

- **Gym data** stored in CSV files on GitHub for easy updates
- **Currently tracking gyms** across Tampa and Austin
- **Open mat sessions** with verified times and information
- **Regular updates** to ensure accuracy and add new gyms
- **Cache management** with automatic refresh and force refresh options

### CSV Format
```csv
id,name,address,website,distance,matFee,dropInFee,sessionDay,sessionTime,sessionType,coordinates
```

## 🔧 Development

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/victorbabiuc/Find-Jiu-Jitsu.git

# Navigate to project
cd FindJiuJitsu

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS Simulator
i (in the terminal)
```

### Key Commands

```bash
# Run development server
npx expo start

# Run with cache clear
npx expo start --clear

# Build for production
npx eas build -p ios --profile production

# Submit to App Store
npx eas submit -p ios
```

## 📱 Deployment

The app is distributed through the iOS App Store as a free app.

### App Store Information

- **App Name**: Find Jiu Jitsu
- **Bundle ID**: com.anonymous.OpenMatFinder
- **Category**: Sports
- **Price**: Free
- **Current Version**: 1.3.0 (Build 15)
- **Status**: ✅ Live on App Store

## 🚧 Known Issues

### Map View (In Development)
- **Status**: Compilation errors preventing map functionality
- **Issue**: react-native-maps plugin configuration and syntax errors
- **Impact**: Map toggle shows location list instead of actual map
- **Workaround**: Use list view for gym browsing

### Authentication (In Development)
- **Status**: UI implemented but backend not connected
- **Issue**: Firebase integration not completed
- **Impact**: Sign-in buttons present but not functional
- **Workaround**: App works without authentication

## 🎯 Future Roadmap (v2.0+)

### 🔐 User Authentication & Profiles
- **Firebase authentication** - Google and Apple Sign-In integration
- **User profiles** - Belt level tracking and training preferences
- **Cloud sync** - Sync favorites across devices
- **Personalized experience** - Custom recommendations based on preferences

### 🗺️ Enhanced Discovery
- **Map view** - Visual gym locations with directions (fix current implementation)
- **Distance filtering** - Find gyms within specific radius
- **Advanced search** - Filter by time of day, skill level, or distance
- **More cities** - Expand beyond Tampa and Austin

### 👥 Community Features
- **"I'm going" feature** - See who's attending sessions
- **Training logs** - Track your training sessions and progress
- **Gym reviews** - User ratings and reviews
- **Social features** - Connect with training partners

### 🔔 Smart Notifications
- **Push notifications** - Alerts for favorite gym sessions
- **New gym alerts** - Notifications when new gyms are added
- **Session reminders** - Get notified before your planned sessions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding New Cities/Gyms

1. **Fork the repository**
2. **Add gym data** to the appropriate CSV file in `data/` directory
3. **Follow the CSV format** specified above
4. **Test your changes** locally
5. **Submit a pull request** with detailed description

### CSV Format Requirements

- **id**: Unique gym identifier
- **name**: Full gym name
- **address**: Complete street address
- **website**: Gym website URL (optional)
- **distance**: Distance from user (0 for now)
- **matFee**: Open mat fee (0 for free, number for paid)
- **dropInFee**: Drop-in class fee (optional)
- **sessionDay**: Day of the week (Monday, Tuesday, etc.)
- **sessionTime**: Time format (e.g., "6:00 PM" or "18:00")
- **sessionType**: "gi", "nogi", "both", or custom type
- **coordinates**: Latitude,Longitude format (optional)

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Belt progression concept inspired by the Jiu Jitsu journey
- Gym data contributed by the Jiu Jitsu community
- Built with ❤️ for the Jiu Jitsu community

---

**Current Version**: 1.3.0 (Build 15)  
**App Store Status**: ✅ Live  
**Contact**: glootieapp@gmail.com

