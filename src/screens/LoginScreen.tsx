import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRootNavigation } from '../navigation/useNavigation';
import { useLoading } from '../context';
import { beltColors, haptics } from '../utils';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { theme } = useTheme();
  const { userBelt } = useApp();
  const { signInWithGoogle, signInWithApple, loading } = useAuth();
  const navigation = useRootNavigation();
  const { showLoading } = useLoading();

  // Belt progression state
  const [currentBeltIndex, setCurrentBeltIndex] = useState(0);

  const currentBeltColor = beltColors[userBelt];
  const beltTypes: Array<'white' | 'blue' | 'purple' | 'brown' | 'black'> = [
    'white',
    'blue',
    'purple',
    'brown',
    'black',
  ];

  // Belt progression animation (without auto-navigation)
  useEffect(() => {
    const beltProgression = () => {
      setCurrentBeltIndex(prev => {
        const nextIndex = prev + 1;

        // Stop at the last belt, don't auto-navigate
        if (nextIndex >= beltTypes.length) {
          return beltTypes.length - 1; // Stay at the last belt
        }

        return nextIndex;
      });
    };

    const timer = setTimeout(beltProgression, 600);
    return () => clearTimeout(timer);
  }, [currentBeltIndex]);

  const handleGetStarted = () => {
    haptics.medium(); // Medium haptic for get started action
    showLoading();
    // Use navigation.reset() to safely navigate to Main
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      haptics.medium(); // Medium haptic for sign in action
      showLoading();
      await signInWithGoogle();
      // Only navigate if sign-in was successful (no error thrown)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Google sign-in failed:', error);
      // Don't navigate on error - let user try again
      // The error is already handled in AuthContext
    }
  };

  const handleAppleSignIn = async () => {
    try {
      haptics.medium(); // Medium haptic for sign in action
      showLoading();
      await signInWithApple();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Apple sign-in failed:', error);
      // Don't navigate on error - let user try again
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* App Logo */}
          <Image source={require('../../assets/icon.png')} style={styles.appLogo} />

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>JIUJITSU FINDER</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Your Training Companion
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Authentication Buttons */}
          <View style={styles.authContainer}>
            <View style={styles.authButtons}>
              {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              )}

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                style={[styles.googleButton, loading && styles.buttonDisabled]}
              >
                <Text style={styles.googleButtonText}>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {/* Skip authentication option */}
              <TouchableOpacity
                onPress={handleGetStarted}
                style={{
                  marginTop: 20,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: theme.text.secondary,
                  borderRadius: 12,
                }}
              >
                <Text style={[styles.skipButtonText, { color: theme.text.secondary }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Belt progression animation moved to bottom */}
      <View style={styles.beltBarsContainer}>
        {beltTypes.map((beltType, index) => {
          const beltColor = beltColors[beltType];
          const isActive = index <= currentBeltIndex;

          // Special handling for white belt for better visibility
          const isWhiteBeltInLightMode = beltType === 'white';

          return (
            <View
              key={beltType}
              style={[
                styles.beltBar,
                {
                  backgroundColor: beltType === 'brown' ? '#D97706' : beltColor.primary,
                  opacity: isActive ? 1 : 0.3,
                  // Add border for white belt for better visibility
                  ...(isWhiteBeltInLightMode && {
                    borderWidth: 1.5,
                    borderColor: '#9CA3AF', // More visible gray
                  }),
                  transform: [
                    {
                      scale: isActive && index === currentBeltIndex ? 1.1 : 1,
                    },
                  ],
                },
              ]}
            />
          );
        })}
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
  appLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
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
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
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
    bottom: 25,
    alignSelf: 'center',
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  authButtons: {
    width: '100%',
    alignItems: 'center',
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 15,
  },
  googleButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  skipButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
