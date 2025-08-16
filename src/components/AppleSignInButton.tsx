import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ onSuccess, onError }) => {
  const { signInWithApple, loading } = useAuth();

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      onSuccess?.();
    } catch (error) {
      logger.error('Apple Sign-In failed:', error);

      // Handle specific Apple Sign-In errors
      if (error instanceof Error) {
        if (error.message.includes('canceled')) {
          return;
        }
        if (error.message.includes('not available')) {
          Alert.alert('Not Available', 'Apple Sign-In is not available on this device.');
          return;
        }
      }

      Alert.alert('Sign-In Failed', 'Unable to sign in with Apple. Please try again.');
      onError?.(error as Error);
    }
  };

  // Only show Apple Sign-In on iOS devices
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleAppleSignIn}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in with Apple'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
