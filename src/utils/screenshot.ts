import { captureRef } from 'react-native-view-shot';
import { Share, Alert } from 'react-native';
import { View } from 'react-native';

/**
 * Capture a component as an image and share it
 * @param cardRef - Reference to the component to capture
 * @param gymData - Gym data for the share card
 * @param sessionData - Session data for the share card
 * @param options - Optional configuration for the screenshot
 */
export const captureAndShareCard = async (
  cardRef: React.RefObject<View>,
  gymData: any,
  sessionData: any,
  options: {
    format?: 'png' | 'jpg' | 'webm';
    quality?: number;
    width?: number;
    height?: number;
  } = {}
) => {
  try {
    // Default options for Instagram story size
    const {
      format = 'png',
      quality = 1,
      width = 1080,
      height = 1920
    } = options;

    // Capture the component as an image
    const uri = await captureRef(cardRef, {
      format,
      quality,
      width,
      height
    });

    // Share the image
    await Share.share({
      url: uri,
      message: `Check out this open mat session at ${gymData.name}! 🥋\n\n${sessionData.day} at ${sessionData.time}\n\nFind more sessions with Find Jiu Jitsu!`
    });

    // Screenshot captured and shared successfully
  } catch (error) {
    console.error('❌ Error capturing and sharing screenshot:', error);
    Alert.alert(
      'Sharing Error',
      'Failed to capture and share the image. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Capture a component as an image and save it to gallery
 * @param cardRef - Reference to the component to capture
 * @param options - Optional configuration for the screenshot
 * @returns Promise<string> - URI of the captured image
 */
export const captureCardAsImage = async (
  cardRef: React.RefObject<View>,
  options: {
    format?: 'png' | 'jpg' | 'webm';
    quality?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<string> => {
  try {
    // Default options for Instagram story size
    const {
      format = 'png',
      quality = 1,
      width = 1080,
      height = 1920
    } = options;

    // Capture the component as an image
    const uri = await captureRef(cardRef, {
      format,
      quality,
      width,
      height
    });

    // Screenshot captured successfully
    return uri;
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    throw error;
  }
}; 