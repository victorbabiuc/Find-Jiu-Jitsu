# Screenshot Sharing Implementation Guide

This guide explains how screenshot sharing is implemented in JiuJitsu Finder.

## Overview

The app uses `react-native-view-shot` to capture gym information as images for social media sharing. This creates professional-looking cards that users can share on Instagram Stories, Snapchat, and other platforms.

## Implementation Details

### 1. ShareCard Component

**Location**: `src/components/ShareCard.tsx`

**Features**:
- **Professional Design**: Clean, Instagram Stories-optimized layout
- **Dynamic Content**: Gym name, address, session details
- **Branding**: App logo and "Find Your Next Roll" tagline
- **Responsive**: 1080x1920 aspect ratio for social media

### 2. Screenshot Capture

**Location**: `src/utils/screenshot.ts`

**Process**:
1. Render ShareCard component off-screen
2. Capture as image using `react-native-view-shot`
3. Share via native iOS share sheet
4. Clean up temporary files

### 3. Integration Points

**ResultsScreen**: Share button in gym cards
**DashboardScreen**: Share button in gym modal
**Custom Hooks**: `useGymActions` handles sharing logic

## Technical Implementation

### ShareCard Structure
```
┌─────────────────────────────────┐
│                                 │
│  [Gym Logo]                     │
│  Gym Name                       │
│  Address                        │
│  Website                        │
│                                 │
│  ────────────────────────────── │
│                                 │
│  [Session Icon] Session Type    │
│  Day at Time                    │
│                                 │
│  ────────────────────────────── │
│                                 │
│  [App Logo]                     │
│  JiuJitsu Finder                │
│  Find Your Next Roll            │
│                                 │
└─────────────────────────────────┘
```

### Key Features
- **Header**: App branding with "JiuJitsu Finder" title
- **Content**: Gym information with professional styling
- **Footer**: App logo and tagline
- **Optimized**: Fast rendering and sharing

## Usage Examples

### Basic Sharing
```typescript
import { captureAndShareCard } from '../utils/screenshot';

const handleShare = async (gym, session) => {
  await captureAndShareCard(gym, session);
};
```

### With Custom Hook
```typescript
const { handleShareGym } = useGymActions({
  favorites,
  toggleFavorite,
  shareCardRef,
});

const onSharePress = () => {
  handleShareGym(gym, session);
};
```

## Styling Guidelines

### Colors
- **Background**: `#F9FAFB` (Light gray)
- **Card**: `#FFFFFF` (White)
- **Text**: `#111827` (Dark gray)
- **Secondary**: `#6B7280` (Medium gray)

### Typography
- **Gym Name**: 72px, bold
- **Address**: 44px, regular
- **Session Info**: 48px, medium
- **App Name**: 56px, bold

### Layout
- **Padding**: 40px outer, 60px inner
- **Border Radius**: 20px outer, 24px inner
- **Shadows**: Subtle elevation for depth

## Performance Considerations

### Optimization Techniques
1. **Off-screen Rendering**: ShareCard rendered outside viewport
2. **Memoization**: Component optimized with React.memo
3. **Cleanup**: Temporary files removed after sharing
4. **Caching**: ShareCard ref reused for multiple shares

### Memory Management
- ShareCard rendered only when needed
- Image files cleaned up after sharing
- Minimal re-renders during capture process

## Troubleshooting

### Common Issues
1. **"Capture failed"**: Check ShareCard rendering
2. **"Share not working"**: Verify native share permissions
3. **"Image corrupted"**: Check file permissions

### Debug Steps
1. Verify ShareCard renders correctly
2. Check capture permissions
3. Test with different gym data
4. Monitor memory usage

## Future Enhancements

### Planned Features
1. **Custom Templates**: Different card designs
2. **Watermark Options**: Configurable branding
3. **Batch Sharing**: Share multiple gyms
4. **Analytics**: Track sharing metrics

### Technical Improvements
1. **Image Compression**: Smaller file sizes
2. **Caching**: Pre-render common cards
3. **Offline Support**: Generate cards without network
4. **Accessibility**: Screen reader support

## Best Practices

### Design
- Keep text readable at small sizes
- Use high contrast colors
- Maintain consistent branding
- Test on different devices

### Performance
- Minimize ShareCard complexity
- Clean up resources properly
- Handle errors gracefully
- Monitor memory usage

### User Experience
- Provide clear sharing feedback
- Handle sharing failures gracefully
- Maintain app responsiveness
- Respect user privacy

---

**Need Help?** Create an issue in the repository or contact glootieapp@gmail.com 