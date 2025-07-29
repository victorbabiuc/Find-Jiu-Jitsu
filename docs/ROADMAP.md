# 🗺️ Roadmap

Current development status, planned features, and known issues for Find Jiu Jitsu.

[← Back to README](../README.md)

## Current Status (v1.3.0)

### ✅ **LIVE ON APP STORE**
These features are currently available to users:

- **Core gym browsing** - Browse open mat sessions by city
- **Smart filtering** - Filter by Gi, No-Gi, or Free sessions
- **Date selection** - Choose specific dates or use quick filters
- **Favorites system** - Save preferred gyms locally
- **Enhanced sharing** - Share sessions with professional image cards
- **Pull-to-refresh** - Refresh gym data in real-time
- **Gym information** - Complete session details, pricing, contact info
- **One-tap actions** - Call gyms, get directions, visit websites
- **Responsive design** - Works on all iOS device sizes
- **Advanced search** - Real-time gym search with dropdown results

### 🔄 **IN DEVELOPMENT**
These features are partially implemented but not yet functional:

- **Map view** - Visual gym locations (currently has compilation errors)
- **Authentication system** - Google/Apple Sign-In (UI implemented, backend not connected)
- **User profiles** - Profile screens exist but not functional

## Known Issues

### 🚧 Map View (In Development)
- **Status**: Compilation errors preventing map functionality
- **Issue**: react-native-maps plugin configuration and syntax errors
- **Impact**: Map toggle shows location list instead of actual map
- **Workaround**: Use list view for gym browsing
- **Priority**: Medium

### 🔐 Authentication (In Development)
- **Status**: UI implemented but backend not connected
- **Issue**: Firebase integration not completed
- **Impact**: Sign-in buttons present but not functional
- **Workaround**: App works without authentication
- **Priority**: Low

### ⚠️ Require Cycle Warning
- **Status**: Console warning, no functional impact
- **Issue**: Circular import dependency in navigation
- **Fix**: Import directly from specific files instead of index
- **Priority**: Low

## Planned Features (v2.0+)

### 🔐 User Authentication & Profiles
**Timeline**: Q2 2025

- **Firebase authentication** - Google and Apple Sign-In integration
- **User profiles** - Belt level tracking and training preferences
- **Cloud sync** - Sync favorites across devices
- **Personalized experience** - Custom recommendations based on preferences

### 🗺️ Enhanced Discovery
**Timeline**: Q1 2025

- **Map view** - Visual gym locations with directions (fix current implementation)
- **Distance filtering** - Find gyms within specific radius
- **Advanced search filters** - Filter by time of day, skill level, or distance
- **More cities** - Expand beyond Tampa and Austin

### 👥 Community Features
**Timeline**: Q3 2025

- **"I'm going" feature** - See who's attending sessions
- **Training logs** - Track your training sessions and progress
- **Gym reviews** - User ratings and reviews
- **Social features** - Connect with training partners

### 🔔 Smart Notifications
**Timeline**: Q2 2025

- **Push notifications** - Alerts for favorite gym sessions
- **New gym alerts** - Notifications when new gyms are added
- **Session reminders** - Get notified before your planned sessions

## Feature Priorities

### High Priority (Next 3 months)
1. **Fix Map View** - Resolve compilation errors and implement map functionality
2. **Add More Cities** - Expand beyond Tampa and Austin
3. **Performance Optimization** - Improve app speed and responsiveness

### Medium Priority (3-6 months)
1. **Firebase Integration** - Complete authentication system
2. **Enhanced Search** - Better filtering and search capabilities
3. **Offline Support** - Full offline functionality

### Low Priority (6+ months)
1. **Community Features** - Social and community functionality
2. **Advanced Analytics** - User behavior insights
3. **Multi-platform** - Android version

## Technical Debt

### Code Quality
- **TypeScript Coverage**: Improve type safety across all components
- **Error Boundaries**: Add React error boundaries for better error handling
- **Testing**: Add unit and integration tests
- **Documentation**: Improve code documentation

### Performance
- **Bundle Size**: Optimize app bundle size
- **Memory Usage**: Reduce memory footprint
- **Startup Time**: Faster app startup
- **Image Optimization**: Better image loading and caching

### Architecture
- **State Management**: Consider Redux for complex state
- **API Layer**: Centralized API management
- **Data Validation**: Schema validation for CSV data
- **Error Handling**: More comprehensive error handling

## Community Requests

### User Feedback
- **More Cities**: High demand for additional cities
- **Map View**: Users want visual gym locations
- **Notifications**: Session reminders and alerts
- **Offline Mode**: Work without internet connection

### Developer Requests
- **API Documentation**: Better documentation for contributors
- **Testing Framework**: Automated testing setup
- **CI/CD Pipeline**: Automated build and deployment
- **Code Standards**: Enforced coding standards

## Success Metrics

### User Engagement
- **Daily Active Users**: Track app usage
- **Session Duration**: Time spent in app
- **Feature Usage**: Which features are most used
- **User Retention**: Return user rate

### Technical Metrics
- **App Performance**: Load times and responsiveness
- **Crash Rate**: App stability
- **Data Accuracy**: Gym information accuracy
- **User Satisfaction**: App Store ratings and reviews

## Release Schedule

### v1.4.0 (Q1 2025)
- Fix map view compilation errors
- Add 2-3 new cities
- Performance improvements
- Bug fixes and UI polish

### v2.0.0 (Q2 2025)
- Firebase authentication
- User profiles and cloud sync
- Enhanced search and filtering
- Push notifications

### v2.1.0 (Q3 2025)
- Community features
- Training logs
- Gym reviews
- Social functionality

### v2.2.0 (Q4 2025)
- Advanced analytics
- Personalized recommendations
- Offline mode
- Multi-platform support

## Contributing to Roadmap

### How to Suggest Features
1. **Create GitHub Issue** with detailed feature description
2. **Include Use Cases** - How would this feature be used?
3. **Consider Impact** - How many users would benefit?
4. **Technical Feasibility** - Is it technically possible?

### How to Prioritize
Features are prioritized based on:
- **User Impact**: How many users will benefit
- **Technical Complexity**: How difficult to implement
- **Resource Requirements**: Time and effort needed
- **Strategic Alignment**: Fits with app vision

### Community Voting
- **GitHub Reactions**: Use reactions to vote on issues
- **Discussions**: Participate in feature discussions
- **Feedback**: Provide feedback on existing features

---

[← Back to README](../README.md) | [Technical Details →](TECHNICAL.md) 