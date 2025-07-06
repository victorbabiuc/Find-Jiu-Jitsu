import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useRootNavigation } from '../navigation/useNavigation';
import { useLoading } from '../context';
import { beltColors } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { theme } = useTheme();
  const { userBelt } = useApp();
  const navigation = useRootNavigation();
  const { showLoading } = useLoading();
  
  // Belt progression state
  const [currentBeltIndex, setCurrentBeltIndex] = useState(0);

  const currentBeltColor = beltColors[userBelt];
  const beltTypes: Array<'white' | 'blue' | 'purple' | 'brown' | 'black'> = ['white', 'blue', 'purple', 'brown', 'black'];

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

  const handleGetStarted = () => {
    showLoading();
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
            FIND JIU JITSU
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Your Jiu Jitsu Training Companion
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

          {/* Belt progression animation positioned below the button */}
          <View style={styles.beltBarsContainer}>
            {beltTypes.map((beltType, index) => {
              const beltColor = beltColors[beltType];
              const isActive = index <= currentBeltIndex;
              
              // Special handling for white belt in light mode
              const isWhiteBeltInLightMode = beltType === 'white';
              
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: 20,
  },
  beltLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 30,
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
    alignItems: 'center',
    marginBottom: 20,
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