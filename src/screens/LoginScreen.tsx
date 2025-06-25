import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useRootNavigation } from '../navigation/useNavigation';
import { useLoading } from '../context';
import { beltColors } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const { userBelt } = useApp();
  const navigation = useRootNavigation();
  const { showLoading } = useLoading();
  
  // Animation values for belt bars
  const [animatedValues] = useState(() => 
    Array(5).fill(0).map(() => new Animated.Value(0.3))
  );

  const currentBeltColor = beltColors[userBelt];
  const beltTypes: Array<'white' | 'blue' | 'purple' | 'brown' | 'black'> = ['white', 'blue', 'purple', 'brown', 'black'];

  // Belt bar pulse animation
  useEffect(() => {
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
        // Repeat animation after 3 seconds
        setTimeout(pulseAnimation, 3000);
      });
    };

    pulseAnimation();
  }, [animatedValues]);

  const handleGetStarted = () => {
    showLoading();
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* BETA badge */}
      <View style={styles.betaBadgeContainer}>
        <View style={styles.betaBadge}><Text style={styles.betaBadgeText}>BETA</Text></View>
      </View>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Belt Logo */}
          <View style={[styles.beltLogo, { backgroundColor: currentBeltColor.primary }]}>
            <Text style={[styles.beltText, { color: currentBeltColor.textOnColor }]}>
              🥋
            </Text>
          </View>
          
          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>
            OPEN MAT FINDER
          </Text>
          {/* Beta city info */}
          <Text style={{ color: '#F59E0B', fontWeight: '600', marginTop: 4, marginBottom: 4, fontSize: 14 }}>Currently serving Tampa & Austin</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Your JiuJitsu Training Companion
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[currentBeltColor.primary, currentBeltColor.accent]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.getStartedButtonText, { color: currentBeltColor.textOnColor }]}>
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.surface }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[styles.themeToggleText, { color: theme.text.secondary }]}>
              {theme.name === 'dark' ? '☀️' : '🌙'} {theme.name === 'dark' ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>

          {/* Belt Animation Bars */}
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
      </View>
      {/* More cities coming soon */}
      <Text style={styles.moreCitiesText}>More cities coming soon!</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  beltLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  beltText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  themeToggle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  beltBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  beltBar: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  betaBadgeContainer: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
  },
  betaBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 22,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  betaBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  moreCitiesText: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },
});

export default LoginScreen; 