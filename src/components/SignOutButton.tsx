import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface SignOutButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ 
  onSuccess, 
  onError,
  variant = 'secondary'
}) => {
  const { signOut, loading, user } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      `Are you sure you want to sign out${user?.email ? ` of ${user.email}` : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              onSuccess?.();
            } catch (error) {
              console.error('Sign out failed:', error);
              Alert.alert('Sign Out Failed', 'Unable to sign out. Please try again.');
              onError?.(error as Error);
            }
          },
        },
      ]
    );
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton];
      case 'danger':
        return [styles.button, styles.dangerButton];
      default:
        return [styles.button, styles.secondaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.buttonText, styles.primaryText];
      case 'danger':
        return [styles.buttonText, styles.dangerText];
      default:
        return [styles.buttonText, styles.secondaryText];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), loading && styles.buttonDisabled]}
      onPress={handleSignOut}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Text style={[getTextStyle(), loading && styles.textDisabled]}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    borderColor: '#BDBDBD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#8E8E93',
  },
}); 