import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { beltColors } from '../utils/constants';
import { useTheme } from '../context';

const { width, height } = Dimensions.get('window');

const beltTypes = ['white', 'blue', 'purple', 'brown', 'black'] as const;
type BeltType = typeof beltTypes[number];

interface TransitionalLoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

const TransitionalLoadingScreen: React.FC<TransitionalLoadingScreenProps> = ({
  message = "Discovering open mat sessions...",
  onComplete,
  duration = 2000
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  // Belt progression state
  const [currentBeltIndex, setCurrentBeltIndex] = useState(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Text fade in
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Belt progression animation
    const beltProgression = () => {
      if (currentBeltIndex < beltTypes.length) {
        // Move to next belt after a short delay
        setTimeout(() => {
          setCurrentBeltIndex(prev => prev + 1);
        }, 600);
      }
    };

    // Start belt progression after initial fade
    const timer = setTimeout(() => {
      beltProgression();
    }, 500);

    // Complete loading after duration
    const completeTimer = setTimeout(() => {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onComplete?.();
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [currentBeltIndex, duration, onComplete, fadeAnim, textAnim]);

  // Continue belt progression
  useEffect(() => {
    if (currentBeltIndex < beltTypes.length) {
      const timer = setTimeout(() => {
        setCurrentBeltIndex(prev => prev + 1);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentBeltIndex]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          opacity: fadeAnim,
        }
      ]}
    >
      <Animated.Text 
        style={[
          styles.message,
          {
            color: theme.text.primary,
            opacity: textAnim,
          }
        ]}
      >
        {message}
      </Animated.Text>
      
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: width * 0.85,
  },
  beltBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beltBar: {
    width: 40,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});

export default TransitionalLoadingScreen; 