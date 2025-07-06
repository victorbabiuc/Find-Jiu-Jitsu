import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { beltColors } from '../utils/constants';
import { useTheme } from '../context';

const { width, height } = Dimensions.get('window');

const cleverMessages = [
  'Finding your next roll...',
  'Warming up the mats for you...',
  'Locating training partners...',
  'Preparing your JiuJitsu journey...',
  'Discovering open mat sessions...'
];

const beltTypes = ['white', 'blue', 'purple', 'brown', 'black'] as const;

type BeltType = typeof beltTypes[number];

const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  
  // Belt progression state
  const [currentBeltIndex, setCurrentBeltIndex] = useState(0);

  // Message index for rotation
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * cleverMessages.length));

  // Belt progression animation with continuous looping
  useEffect(() => {
    const beltProgression = () => {
      setCurrentBeltIndex(prev => {
        // When we reach the end (black belt), reset to white
        if (prev >= beltTypes.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    };

    // Start belt progression
    const timer = setTimeout(beltProgression, 600);

    return () => clearTimeout(timer);
  }, [currentBeltIndex]);

  // Rotate clever message every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % cleverMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic theme styles
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      color: theme.text.primary,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 32,
      maxWidth: width * 0.85,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.message}>{cleverMessages[messageIndex]}</Text>
      
      {/* Belt progression animation positioned at bottom */}
      <View style={styles.beltBarsContainer}>
        {beltTypes.map((beltType, index) => {
          const beltColor = beltColors[beltType];
          const isActive = index <= currentBeltIndex;
          
          // Special handling for white belt in light mode
          const isWhiteBeltInLightMode = beltType === 'white' && theme.name === 'light';
          
          return (
            <View
              key={beltType}
              style={[
                styles.beltBar,
                {
                  backgroundColor: beltType === 'brown' ? '#D97706' : beltColor.primary,
                  opacity: isActive ? 1 : 0.3,
                  // Add border for white belt in light mode for better visibility
                  ...(isWhiteBeltInLightMode && {
                    borderWidth: 1.5,
                    borderColor: '#9CA3AF',  // More visible gray
                  }),
                  transform: [{
                    scale: isActive && index === currentBeltIndex ? 1.1 : 1
                  }]
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  beltBarsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beltBar: {
    width: 48,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
});

export default LoadingScreen; 