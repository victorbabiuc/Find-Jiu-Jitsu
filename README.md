## 📱 Version History

### **v1.1.0 - Premium UI & Enhanced UX** (Current Development)

#### **🎨 UI/UX Improvements**
- **Premium Gym Cards**: Complete redesign with clean, spacious layout
  - Removed redundant "Belt Level" text
  - Gym name with "Open Mat Session" subtitle
  - Session times stacked with day headers (FRIDAY, SUNDAY)
  - Gi/No-Gi icons next to session types (🥋 for Gi, 👕 for No-Gi)
  - Enhanced fee display showing both Open Mat and Drop-in prices
  - Professional 3-button layout: Call, Save, Directions
  - Fixed gym logo positioning (top-aligned with content)

#### **🔍 Functional Enhancements**
- **Working Filters**: Gi, No-Gi, Price, Radius, and Time filters now functional
  - Smart filtering shows "Both" and "Unknown" types for any filter
  - Visual feedback for active filters
- **Next Open Mat**: Dashboard now shows next upcoming session instead of recently viewed
  - Smart time-based logic finds next available session
  - Uses same premium card design as results
- **Transitional Loading**: Smooth loading animations between screens
  - Belt progression animation during navigation
  - No more in-page loading states
  - Professional screen-to-screen transitions

#### **🐛 Bug Fixes**
- Fixed white belt visibility in light mode (added border)
- Fixed time display showing incorrect triple times
- Improved data parsing for various time formats

#### **📋 TODO for v1.1 Release**
- [ ] Re-add "Suggestion +" button to results screen
- [ ] Update STJJ Tampa to include $20 drop-in fee
- [ ] Research and add pricing for more gyms

### **v1.0.0 - Initial App Store Release** (June 27, 2025)
- Core functionality with Austin (24) and Tampa (14) gyms
- GitHub CSV data integration
- Basic UI with belt theming
- Submitted to App Store for review

---

## 🎉 App Store Status
- **Submitted for Review**: June 27, 2025
- **Status**: Waiting for Review
- **Version**: 1.0.0 (Build 9)
- **App Name**: Jiu Jitsu Open Mat Finder
- **Bundle ID**: com.anonymous.OpenMatFinder

## ✅ Recent Achievements
- Successfully fixed EAS build issues with hardcoded paths
- Created custom Ruby script (ios/fix-expo-paths.rb) to handle path replacements
- Submitted first version to App Store
- Currently supporting Austin and Tampa locations
- **Complete UI/UX Redesign**: Modernized gym cards with clean, spacious design
- **Enhanced Fee Display**: Added support for both Open Mat and Drop-in fees with color coding
- **Improved Data Architecture**: Added GitHub CSV integration for dynamic updates
- **Fixed Technical Issues**: Resolved dropdown rendering, syntax errors, and layout problems

# 📝 **Streamlined README with GitHub Integration**
# 🥋 Open Mat Finder

A React Native mobile app helping Brazilian Jiu-Jitsu practitioners find open mat training sessions with **dynamic data updates from GitHub**.

> **Note:** The app is now pending App Store review as of June 27, 2025. The EAS build issues caused by hardcoded paths have been resolved using a custom Ruby script (`ios/fix-expo-paths.rb`). Please refer to this script for future path-related build issues. Outdated information about build failures has been removed.

## 📁 Project Structure & Location

### **Current Project Path:**
`/Users/vik/Documents/Startup/VibeCoding/OpenMatFinder/`

### **Important Path Notes:**
- **No spaces in path** - Required for React Native/Expo build scripts
- **Previous location had spaces** which caused build failures
- **All relative paths preserved** during folder rename

### **Directory Structure:**
```
VibeCoding/
└── OpenMatFinder/
├── data/                  # GitHub CSV data files
│   ├── austin-gyms.csv    # Austin gym data (24 gyms)
│   └── tampa-gyms.csv     # Tampa gym data (14 gyms)
├── src/
│   ├── screens/           # All screen components
│   ├── services/          # API & GitHub data service
│   ├── contexts/          # Auth, Theme, App contexts
│   ├── navigation/        # Navigation configuration
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Constants and belt colors
├── ios/                   # Native iOS project
├── assets/                # App icons and images
├── eas.json              # EAS Build configuration
└── app.json              # Expo configuration
```

### **Development Commands:**
```bash
# Navigate to project
cd "/Users/vik/Documents/Startup/VibeCoding/OpenMatFinder"

# Start development server
npx expo start

# iOS development
npx expo run:ios

# Build for App Store
npx eas-cli build -p ios --profile production
```

### **Build Requirements:**
- ✅ Path must not contain spaces (fixed in current location)
- ✅ Node.js and npm installed
- ✅ Xcode for iOS development
- ✅ Apple Developer Account for App Store submission

## 🚀 Project Status

**✅ 100% Functional - Ready for App Store Submission**
- Complete React Native app with GitHub CSV data integration
- Professional belt-themed UI with loading animations
- **Dynamic data updates** - no app releases needed for gym data changes
- Austin (24 gyms) + Tampa (14 gyms) with real-time GitHub sync

## ⭐ Key Features

### 🌐 **GitHub Data Integration** (New!)
- **Live gym data** loaded from GitHub CSV files
- **Smart caching** (24-hour) with offline fallback
- **Easy data updates** via GitHub web interface
- **Standardized format** for scalable city expansion
- **No app releases** needed for data changes

### 🎯 **Core Functionality**
- **Multi-city support**: Austin, Tampa (more cities easily added)
- **Location-based search**: Find gyms by city
- **Session details**: Days, times, Gi/No-Gi types, pricing
- **Favorites system**: Save and manage preferred gyms
- **Dual fee display**: Open Mat and Drop-in fees with color coding
- **Clean card design**: Modern, spacious layout with all info visible
- **Action buttons**: Call, Save, and Directions in one row

### 📱 **User Experience**
- **Professional UI/UX**: Modern, intuitive mobile interface with clean card design
- **Dark/Light mode**: Complete theme system
- **Loading animations**: Belt progression during data loading
- **Bottom tab navigation**: Find, Location, Saved, Profile
- **Filter system**: Price, radius, and time-of-day filters with dropdown menus
- **Responsive design**: Optimized for all screen sizes

## 🛠 Tech Stack

- **React Native + Expo** with TypeScript
- **GitHub CSV Integration** for dynamic data
- **Context API** for state management
- **React Navigation v6** (Stack + Bottom Tabs)
- **AsyncStorage** for caching and persistence

## 📊 Data Architecture

### **Dynamic GitHub Data Sources:**
```
data/austin-gyms.csv    → 24 gyms with full details
data/tampa-gyms.csv     → 14 gyms with standardized format
```

### **CSV Format (Standardized):**
```
id,name,address,distance,matFee,dropInFee,website,instructor,sessionDay,sessionTime,sessionType
austin-10th-planet-austin,"10th Planet Austin","4509 Freidrich Ln #210, Austin, TX 78744",0,25,30,"https://10thplanet.com","John Doe",Saturday,"10am-1pm",nogi
```

### **Easy Data Updates:**
1. Navigate to GitHub repository
2. Edit CSV files via web interface
3. Commit changes → Data syncs automatically
4. Users get updates within 24 hours (caching)

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd OpenMatFinder
npm install

# Start development
npx expo start

# Run on device
# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
```

## 📁 Project Structure

```
OpenMatFinder/
├── data/                  # 🆕 GitHub CSV data files
│   ├── austin-gyms.csv    # Austin gym data (24 gyms)
│   └── tampa-gyms.csv     # Tampa gym data (14 gyms)
├── src/
│   ├── screens/           # All screen components
│   ├── services/          # API & GitHub data service
│   │   ├── api.service.ts
│   │   ├── github-data.service.ts  # 🆕 GitHub integration
│   │   └── storage.service.ts
│   ├── contexts/          # Auth, Theme, App contexts
│   ├── navigation/        # Navigation configuration
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Constants and belt colors
```

## 🔄 Data Management

### **Adding New Cities:**
1. Create `data/city-name-gyms.csv` following the standard format
2. Update GitHub data service URLs
3. Deploy - no app changes needed!

### **Updating Existing Data:**
- **Austin**: Edit addresses, pricing, sessions in `austin-gyms.csv`
- **Tampa**: Enhance placeholder data with real addresses/prices
- **Any changes**: Commit to GitHub → automatic app updates

## 🎨 Design System

Modern, clean design with neutral color palette:
- **Primary colors**: #111518 (text), #60798A (secondary text)
- **Background**: #FFFFFF (cards), #F0F3F5 (buttons)
- **Accents**: #0C92F2 (links), #10B981 (success/free)
- **Typography**: 18px bold (titles), 14px regular (body), 13px (buttons)
- **Spacing**: 16px padding, 8px gaps, 12px border radius

## 📱 App Flow

1. **Login** → Belt selection & authentication
2. **Dashboard** → Quick actions and gym overview
3. **Location** → Select Austin, Tampa, or custom location
4. **Time Selection** → Choose dates with calendar interface
5. **Results** → Browse gyms with clean card design and filters
6. **Gym Details** → View all info: fees, location, instructor, website
7. **Actions** → Call, save, or get directions directly from cards

## 🧪 Testing

**Essential Tests:**
- [ ] Austin data loads (24 gyms from GitHub)
- [ ] Tampa data loads (14 gyms from GitHub)  
- [ ] Offline mode uses cached data
- [ ] Fee display shows both Open Mat and Drop-in prices
- [ ] Filter dropdowns work correctly
- [ ] Card design renders properly on all screen sizes
- [ ] Action buttons function (Call, Save, Directions)
- [ ] Favorites persist between sessions

## 🚀 Deployment

### **App Store Ready:**
- Complete React Native build
- Professional UI/UX
- Error handling and offline support
- Next: App icon, splash screen, screenshots

### **Data Updates:**
- No app store releases needed for gym data
- Edit CSV files in GitHub for instant updates
- Scalable to hundreds of cities

## 🎯 What Makes This Special

**🔥 Dynamic Data Updates**: Unlike other apps, gym data updates instantly without app releases

**🏗️ Scalable Architecture**: Add new cities by simply adding CSV files

**🎨 Modern Clean Design**: Professional, spacious card layout with all information visible upfront

**💰 Complete Fee Transparency**: Shows both Open Mat and Drop-in fees with clear pricing

**📱 Professional Polish**: App store ready with loading animations, error handling, and responsive design

---

## 📋 TODO - Data Updates for v1.1

### **Gym Pricing Updates Needed:**
- [ ] **STJJ (Tampa)** - Add $20 drop-in fee
- [ ] **Other Tampa gyms** - Research and add actual pricing
- [ ] **Austin gyms** - Verify current mat fees and drop-in rates

### **How to Update Prices:**
1. Go to `data/tampa-gyms.csv` in GitHub
2. Find STJJ row
3. Update the `dropInFee` column from empty to `20`
4. Commit changes - users will see update within 24 hours

### **Price Research Sources:**
- Gym websites
- Call gyms directly
- Check Google/Facebook pages
- Ask local BJJ community

### **Priority Gyms Missing Prices:**
- STJJ - $20 drop-in (confirmed)
- Gracie Barra Tampa - Research needed
- Ybor City JJ - Research needed
- [Add more as discovered]

Note: This is a data update only - no app release required!

---

## 🔧 Features to Re-implement (v1.1)

### **Suggestion Button**
- **Location**: Results screen header, next to result count
- **Text**: "Suggestion +"
- **Function**: Opens modal to suggest gyms not in database
- **Modal shows**: 
  - "Send gym suggestions to: glootieapp@gmail.com"
  - Copy email button
  - Instructions to include gym name, location, and schedule
- **Status**: Modal code exists, just needs trigger button added
- **Implementation**: Add button that calls `handleSuggestGym()` in ResultsScreen.tsx

---

## 🚀 Future Features (v2.0)

### **Time-Aware Session Display**
- **Past sessions**: Show today's completed sessions in grayed-out state
- **Visual indicators**: 
  - Past sessions: Grayed text and 50% opacity
  - Current/ongoing: Green highlight or "LIVE NOW" badge
  - Upcoming today: Normal display
- **Smart filtering**: Option to hide/show past sessions
- **Time zone handling**: Accurate for user's location
- **Benefits**:
  - Users see full gym schedule even if checking app late
  - Helps plan for next week if they missed today
  - Shows gym's typical schedule patterns

Example display:
```
FRIDAY
~~5:00 PM - 6:00 PM • No-Gi 👕~~ (Past)
🟢 7:00 PM - 8:00 PM • Gi 🥋 (LIVE NOW)
9:00 PM - 10:00 PM • No-Gi 👕 (Upcoming)
```

---

**Built with ❤️ for the BJJ community**