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
  // Animation values for belt bars
  const animatedValues = useRef(
    Array(5).fill(0).map(() => new Animated.Value(0.3))
  ).current;

  // Message index for rotation
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * cleverMessages.length));

  // Belt bar pulse animation
  useEffect(() => {
    let isMounted = true;
    const pulseAnimation = () => {
      const animations = animatedValues.map((value, index) => {
        return Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);
      });
      Animated.parallel(animations).start(() => {
        if (isMounted) setTimeout(pulseAnimation, 3000);
      });
    };
    pulseAnimation();
    return () => { isMounted = false; };
  }, [animatedValues]);

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
      <View style={styles.beltBarsContainer}>
        {beltTypes.map((beltType, index) => {
          const beltColor = beltColors[beltType];
          return (
            <Animated.View
              key={beltType}
              style={[
                styles.beltBar,
                {
                  backgroundColor: beltColor.primary,
                  opacity: animatedValues[index],
                  transform: [{
                    scale: animatedValues[index].interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 1.2],
                    })
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  beltBar: {
    width: 48,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
});

export default LoadingScreen; 