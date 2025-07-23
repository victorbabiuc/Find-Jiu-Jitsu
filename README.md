# 🥋 Find Jiu Jitsu

Your Jiu Jitsu Training Companion - Find open mat sessions at gyms near you!

![Version](https://img.shields.io/badge/version-1.3.2-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📱 App Description

Find Jiu Jitsu is an iOS app designed to help Brazilian Jiu-Jitsu practitioners discover open mat training sessions at local gyms. Whether you're traveling or looking for extra training opportunities, quickly find gyms offering open mats in your area.

**Currently supports Tampa and Austin with 65+ open mat sessions across 40+ gyms.**

## ✨ Current Features (v1.3.2)

### 🎯 Core Functionality
- **Browse open mat sessions by city** - Tampa and Austin with comprehensive gym coverage
- **Smart filtering system** - Filter by Gi, No-Gi, or Free sessions with intelligent session-level filtering
- **Calendar date selection** - Choose specific dates or use quick filters (Today, Tomorrow, Weekend)
- **Enhanced sharing** - Share sessions with professional text formatting and app promotion

### 🏢 Gym Information
- **Complete session details** - Times, days, and session types (Gi/No-Gi)
- **Pricing information** - Open mat fees (free or paid) and drop-in rates
- **Contact details** - Gym addresses, phone numbers, and websites
- **Requirements** - Waiver requirements and other important notes

### 💾 User Experience
- **Save favorite gyms** - Keep track of preferred training spots with local storage
- **One-tap actions** - Call gyms, get directions, visit websites, or save with a single tap
- **Dark/Light theme support** - Consistent design system with unified color scheme
- **Intuitive navigation** - Streamlined flow from city selection to results
- **Empty state handling** - Helpful messages and action buttons when no results found

### 🎨 Design Features
- **Professional UI** - Modern, clean interface with consistent design language
- **Responsive design** - Works perfectly on all iOS device sizes
- **Circular splash screen** - Perfect circular app icon during loading
- **Enhanced share functionality** - Professional text formatting with emojis and branding

## 🚀 How to Use

1. **Select your city** - Choose between Tampa (14 gyms) or Austin (30 gyms)
2. **Choose dates** - Use quick filters (Today, Tomorrow, Weekend) or select custom dates from the calendar
3. **Filter results** - Apply Gi/No-Gi filters or show only free sessions
4. **Explore gyms** - Tap gym cards to view detailed information
5. **Save favorites** - Use the heart icon to save preferred gyms
6. **Share sessions** - Share gym details with training partners
7. **Take action** - Call gyms, get directions, or visit websites directly from the app

### 💡 Pro Tips
- **Tap white space** on the calendar screen to clear date selections
- **Drag across dates** to select multiple days at once
- **Use filters** to find specific session types or free training
- **Save favorites** to quickly access your preferred gyms

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript for full type safety
- **Navigation**: React Navigation v6 with streamlined user flow
- **State Management**: Context API + React Hooks
- **Data Storage**: AsyncStorage for local favorites
- **Data Source**: GitHub-hosted CSV files for easy updates
- **Styling**: React Native StyleSheet with consistent design system
- **Sharing**: Native text sharing with professional formatting

## 📊 Data Sources

- **Gym data** stored in CSV files on GitHub for easy updates
- **Currently tracking 40+ gyms** across Tampa and Austin
- **65+ open mat sessions** with verified times and information
- **Regular updates** to ensure accuracy and add new gyms

### CSV Format
```csv
GymName,SessionDay,SessionTime,GiType,OpenMatFee,DropInFee,Requirements,Address,Phone,Website,Coordinates
```

## 🎯 Future Features (v2.0+)

### 🔐 User Authentication & Profiles
- **Firebase authentication** - Google and Apple Sign-In integration
- **User profiles** - Belt level tracking and training preferences
- **Cloud sync** - Sync favorites across devices
- **Personalized experience** - Custom recommendations based on preferences

### 🗺️ Enhanced Discovery
- **Map view** - Visual gym locations with directions
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

## 🚀 Getting Started

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

## 🔧 Development

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
- **Latest Version**: 1.3.2 (Build 17) - July 2025
- **Status**: ✅ Live on App Store

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding New Cities/Gyms

1. **Fork the repository**
2. **Add gym data** to the appropriate CSV file in `data/` directory
3. **Follow the CSV format** specified above
4. **Test your changes** locally
5. **Submit a pull request** with detailed description

### CSV Format Requirements

- **GymName**: Full gym name
- **SessionDay**: Day of the week (Monday, Tuesday, etc.)
- **SessionTime**: Time format (e.g., "6:00 PM" or "18:00")
- **GiType**: "gi", "nogi", or "both"
- **OpenMatFee**: "Free" or dollar amount
- **DropInFee**: Dollar amount for regular classes
- **Requirements**: Any special requirements (waiver, etc.)
- **Address**: Full street address
- **Phone**: Contact phone number
- **Website**: Gym website URL
- **Coordinates**: Latitude,Longitude format

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Known Issues & Solutions

#### Share Modal Not Appearing

**Issue**: Modal not appearing when share button is tapped in `OpenMatCard` component.

**Symptoms**: 
- Share button responds to tap but no modal appears
- Console logs show `handleShareOptions` is called but modal remains hidden
- No error messages in console

**Root Cause**: Modal was being rendered inside a `TouchableOpacity` wrapper, which can cause rendering issues in React Native.

**Solution**: 
1. Move the Modal component outside the main `TouchableOpacity` wrapper
2. Ensure Modal is rendered at the root level of the component
3. Add debugging console logs to track state changes

**Files Involved**:
- `src/components/OpenMatCard.tsx` - Main component with share functionality
- `src/components/ShareCard.tsx` - Component for screenshot capture
- `src/utils/screenshot.ts` - Screenshot utility functions

**Debug Steps**:
1. Add console logs in `handleShareOptions` function
2. Track `showShareOptions` state changes with `useEffect`
3. Verify Modal is outside TouchableOpacity wrapper
4. Check for any parent component interference

**Code Pattern**:
```tsx
// ❌ Wrong - Modal inside TouchableOpacity
<TouchableOpacity>
  <Modal visible={showShareOptions}>
    {/* Modal content */}
  </Modal>
</TouchableOpacity>

// ✅ Correct - Modal outside TouchableOpacity
<TouchableOpacity>
  {/* Card content */}
</TouchableOpacity>
<Modal visible={showShareOptions}>
  {/* Modal content */}
</Modal>
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Belt progression concept inspired by the Jiu Jitsu journey
- Gym data contributed by the Jiu Jitsu community
- Built with ❤️ for the Jiu Jitsu community

---

**Current Version**: 1.3.2 (Build 17)  
**App Store Status**: ✅ Live  
**Contact**: glootieapp@gmail.com

