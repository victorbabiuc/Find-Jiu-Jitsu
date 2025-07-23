import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AppleSignInButton } from './AppleSignInButton';

interface SocialSignInButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const SocialSignInButtons: React.FC<SocialSignInButtonsProps> = ({ 
  onSuccess, 
  onError 
}) => {
  return (
    <View style={styles.container}>
      <GoogleSignInButton onSuccess={onSuccess} onError={onError} />
      {Platform.OS === 'ios' && (
        <AppleSignInButton onSuccess={onSuccess} onError={onError} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
}); 