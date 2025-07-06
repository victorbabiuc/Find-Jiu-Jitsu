# 🥋 Find Jiu Jitsu

Your Jiu Jitsu Training Companion - Find open mat sessions at gyms near you!

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📱 About

Find Jiu Jitsu helps practitioners discover open mat training sessions at local gyms. Whether you're traveling or looking for extra training opportunities, quickly find gyms offering open mats in your area.

### ✨ Features

- **Location-Based Search** - Find open mats in Tampa and Austin (more cities coming soon!)
- **Smart Filtering** - Filter by Gi/No-Gi, price, distance, and time
- **Session Details** - View times, prices, requirements, and contact info
- **Save Favorites** - Keep track of your preferred training spots
- **Belt Progression** - Personalize the app with your current belt rank
- **One-Tap Actions** - Call gyms, get directions, or save with a single tap

## 🎯 Version 1.2.0 Highlights

- **New App Name** - Rebranded from "Open Mat Finder" to "Find Jiu Jitsu"
- **Premium Gym Cards** - Beautiful redesigned cards with session details
- **Next Open Mat** - See your next training opportunity on the dashboard
- **Enhanced Filters** - Working Gi/No-Gi filters with smart logic
- **Smooth Animations** - Belt progression loading between screens
- **Dual Pricing** - View both open mat and drop-in fees
- **Light Mode Only** - Simplified theme system for better consistency

## 📋 Recent Updates (July 6, 2025)

- ✅ **Successfully submitted v1.2.0 to App Store** - Build completed and submitted for review
- ✅ **Fixed iOS build versioning issues** - Resolved version conflicts between app.json and native iOS files
- ✅ **App name changed to "Find Jiu Jitsu"** - Complete rebranding throughout the application
- ✅ **Dark mode removed** - Simplified to light mode only for better consistency
- ✅ **Updated splash screen** - Fixed belt animation positioning and asset references
- ✅ **Repository renamed** - GitHub repository updated from "OpenMatFinder" to "Find-Jiu-Jitsu"

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Context API
- **Data Storage**: AsyncStorage + GitHub CSV files
- **Styling**: React Native StyleSheet + LinearGradient

## 📂 Project Structure

```
OpenMatFinder/
├── src/
│   ├── screens/          # All app screens
│   ├── components/       # Reusable components
│   ├── context/          # Auth, Theme, App contexts
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and storage services
│   ├── types/           # TypeScript definitions
│   └── utils/           # Constants and helpers
├── data/                # CSV gym data files
└── assets/             # Images and icons
```

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
cd OpenMatFinder

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS Simulator
i (in the terminal)
```

## 📊 Data Management

Gym data is stored in CSV files on GitHub for easy updates:
- `data/tampa-gyms.csv` - Tampa area gyms
- `data/austin-gyms.csv` - Austin area gyms

### CSV Format

```csv
GymName,SessionDay,SessionTime,GiType,OpenMatFee,DropInFee,Requirements,Address,Phone,Website,Coordinates
```

## 🎨 Design System

### Belt Colors
- **White Belt**: `#F8F9FA`
- **Blue Belt**: `#3B82F6`
- **Purple Belt**: `#A855F7`
- **Brown Belt**: `#D97706`
- **Black Belt**: `#525252`

### Icons
- 🥋 Gi sessions
- 👕 No-Gi sessions
- 💵 Paid sessions
- 📍 Location
- ⚠️ Waiver required

## 🔧 Development

### Key Commands

```bash
# Run development server
npx expo start

# Build for production
npx eas build -p ios --profile production

# Submit to App Store
npx eas submit -p ios
```

### Environment Variables

No environment variables required - all data is fetched from public GitHub CSVs.

## 📱 Deployment

The app is distributed through the iOS App Store as a free app.

### Build Process

1. Update version in `app.json`
2. Commit all changes
3. Run EAS build
4. Submit through EAS CLI

### App Store Information

- **App Name**: Find Jiu Jitsu (formerly Open Mat Finder)
- **Bundle ID**: com.anonymous.OpenMatFinder
- **Category**: Sports
- **Price**: Free
- **Latest Build**: 1.2.0 (Build 13) - July 6, 2025
- **Submission Date**: July 6, 2025
- **Status**: Submitted for review

## 🤝 Contributing

We welcome contributions! Please:

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

**Current Version**: 1.2.0 (Build 13)  
**App Store Status**: Submitted for review (July 6, 2025)  
**Contact**: glootieapp@gmail.com