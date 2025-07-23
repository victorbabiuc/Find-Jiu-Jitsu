# 📸 Screenshot Sharing Feature

This feature allows users to capture and share gym session information as beautiful images, perfect for social media sharing.

## 🚀 How to Use

### Basic Implementation

```tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ShareCard } from '../components';
import { captureAndShareCard } from '../utils/screenshot';

const MyComponent = ({ gym, session }) => {
  const cardRef = useRef<View>(null);

  const handleShare = async () => {
    try {
      await captureAndShareCard(cardRef, gym, session);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View>
      {/* Invisible card rendered off-screen */}
      <ShareCard 
        ref={cardRef}
        gym={gym}
        session={session}
      />

      {/* Share button */}
      <TouchableOpacity onPress={handleShare}>
        <Text>Share as Image</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Advanced Options

```tsx
// Custom screenshot options
const uri = await captureCardAsImage(cardRef, {
  format: 'png',        // 'png', 'jpg', or 'webm'
  quality: 1,           // 0-1 for jpg, ignored for png
  width: 1080,          // Instagram story width
  height: 1920          // Instagram story height
});
```

## 🎨 ShareCard Design

The ShareCard component creates a beautiful, Instagram-story-sized image (1080x1920) with:

- **Header**: App branding with "Find Jiu Jitsu" title
- **Gym Info**: Gym name and address
- **Session Details**: Day, time, and session type with emojis
- **Pricing**: Open mat fees and drop-in rates
- **Footer**: App promotion

### Session Type Emojis

- 🥋 Gi
- 👕 No-Gi  
- 🥋👕 Gi & No-Gi
- 🥊 MMA Sparring

## 📱 Integration Examples

### OpenMatCard Integration

The OpenMatCard component now includes both text and image sharing:

```tsx
// Text sharing (existing)
<TouchableOpacity onPress={handleShare}>
  <Text>📝 Text</Text>
</TouchableOpacity>

// Image sharing (new)
<TouchableOpacity onPress={handleScreenshotShare}>
  <Text>📸 Image</Text>
</TouchableOpacity>
```

### GymDetailsModal Integration

You can add screenshot sharing to the gym details modal:

```tsx
const handleScreenshotShare = async () => {
  const firstSession = gym.openMats[0];
  await captureAndShareCard(cardRef, gym, firstSession);
};
```

## 🔧 Technical Details

### Dependencies

- `react-native-view-shot`: For capturing component screenshots
- `expo-linear-gradient`: For beautiful gradient backgrounds
- `react-native`: For Share API

### File Structure

```
src/
├── components/
│   ├── ShareCard.tsx              # Main share card component
│   ├── ScreenshotShareExample.tsx # Usage example
│   └── OpenMatCard.tsx           # Updated with screenshot sharing
├── utils/
│   └── screenshot.ts             # Screenshot utility functions
└── types/
    └── index.ts                  # TypeScript interfaces
```

### Utility Functions

#### `captureAndShareCard(ref, gym, session, options?)`

Captures a component and immediately shares it.

#### `captureCardAsImage(ref, options?)`

Captures a component and returns the image URI.

## 🎯 Use Cases

1. **Social Media Sharing**: Perfect for Instagram stories and posts
2. **Training Partner Communication**: Share session details visually
3. **Gym Promotion**: Beautiful images for gym marketing
4. **Event Announcements**: Create eye-catching session announcements

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to capture screenshot"**
   - Ensure the ShareCard component is rendered (even off-screen)
   - Check that gym and session data are valid

2. **"Sharing Error"**
   - Verify Share API permissions
   - Check device storage space

3. **Poor image quality**
   - Adjust quality settings (0.8-1.0 for best results)
   - Use PNG format for crisp text

### Debug Tips

```tsx
// Add debug logging
console.log('Gym data:', gym);
console.log('Session data:', session);
console.log('Card ref:', cardRef.current);
```

## 📈 Performance Notes

- Screenshot capture is asynchronous and may take 1-2 seconds
- Images are optimized for Instagram story dimensions (1080x1920)
- ShareCard is positioned off-screen to avoid UI interference
- Consider adding loading indicators for better UX

## 🔮 Future Enhancements

- Custom share card templates
- Multiple session layouts
- QR code integration
- Social media platform-specific optimizations
- Batch sharing for multiple sessions 