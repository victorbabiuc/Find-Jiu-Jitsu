import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { logger } from '../utils';
import { useTheme } from '../context/ThemeContext';

interface ContactFooterProps {
  email?: string;
  style?: any; // Keep as any for StyleSheet compatibility
}

const ContactFooter: React.FC<ContactFooterProps> = ({ 
  email = 'glootieapp@gmail.com',
  style 
}) => {
  const { theme } = useTheme();
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await Clipboard.setStringAsync(email);
      setEmailCopied(true);
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setEmailCopied(false);
      }, 2000);
    } catch (error) {
      // Silently handle error - just don't show checkmark
      logger.error('Failed to copy email:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleCopyEmail}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.emailRow}>
          <Text style={[styles.emailText, { color: "#6C757D" }]}>
            Suggestions? Email {email}
          </Text>
          <Ionicons 
            name={emailCopied ? "checkmark" : "copy-outline"} 
            size={18} 
            color={emailCopied ? "#10B981" : "#6C757D"} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default ContactFooter; 