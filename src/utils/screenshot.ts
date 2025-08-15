import { captureRef } from 'react-native-view-shot';
import { Share, Alert } from 'react-native';
import { View } from 'react-native';
import { OpenMat, OpenMatSession } from '../types';

/**
 * Capture a component as an image and share it
 * @param cardRef - Reference to the component to capture
 * @param gymData - Gym data for the share card
 * @param sessionData - Session data for the share card
 * @param options - Optional configuration for the screenshot
 */
export const captureAndShareCard = async (
  cardRef: React.RefObject<View | null>,
  gymData: OpenMat,
  sessionData: OpenMatSession,
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

    // Go directly to iOS native share sheet (like Spotify)
    await Share.share({
      url: uri,
      message: `Check out this open mat session at ${gymData.name}! 🥋\n\n${sessionData.day} at ${sessionData.time}\n\nFind more sessions with JiuJitsu Finder!`
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
  cardRef: React.RefObject<View | null>,
  options: {
    format?: 'png' | 'jpg' | 'webm';
    quality?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<string> => {
  try {
    // Default options for Instagram story size with optimized settings
    const {
      format = 'png',
      quality = 0.9, // Slightly reduced quality for better performance
      width = 1080,
      height = 1920
    } = options;

    // Ensure ref exists before capturing
    if (!cardRef.current) {
      throw new Error('ShareCard ref is not available');
    }

    // Capture the component as an image with optimized settings
    const uri = await captureRef(cardRef, {
      format,
      quality,
      width,
      height,
      result: 'tmpfile', // Use temporary file for better performance
    });

    // Screenshot captured successfully
    return uri;
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    throw error;
  }
}; 