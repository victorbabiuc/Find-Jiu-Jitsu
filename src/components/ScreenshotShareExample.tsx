import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareCard } from './index';
import { captureAndShareCard } from '../utils/screenshot';
import { OpenMat, OpenMatSession } from '../types';

interface ScreenshotShareExampleProps {
  gym: OpenMat;
  session: OpenMatSession;
}

const ScreenshotShareExample: React.FC<ScreenshotShareExampleProps> = ({ gym, session }) => {
  const cardRef = useRef<View>(null);

  const handleScreenshotShare = async () => {
    try {
      await captureAndShareCard(cardRef, gym, session);
    } catch (error) {
      console.error('Error sharing screenshot:', error);
      Alert.alert('Sharing Error', 'Failed to create and share the image. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Invisible ShareCard rendered off-screen */}
      <ShareCard ref={cardRef} gym={gym} session={session} />

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleScreenshotShare}>
        <Ionicons name="camera" size={24} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share as Image</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ScreenshotShareExample;
