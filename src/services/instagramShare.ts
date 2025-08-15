import { Linking, Platform, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { OpenMat, OpenMatSession } from '../types';
import { logger } from '../utils/logger';

interface InstagramShareData {
  imageUri: string;
  gym: OpenMat;
  session: OpenMatSession;
}

/**
 * Instagram Sharing Service
 * Handles Instagram-specific sharing logic for Instagram Stories
 * 
 * Modern iOS Approach:
 * 1. Save image to camera roll first
 * 2. Open Instagram Stories camera with instagram://story-camera
 * 3. User selects saved image from camera roll
 */
class InstagramShareService {
  private readonly INSTAGRAM_STORIES_URL = 'instagram://story-camera';
  private readonly INSTAGRAM_APP_URL = 'instagram://app';

  /**
   * Check if Instagram is installed on the device
   * @returns Promise<boolean> - True if Instagram is installed
   */
  async isInstagramInstalled(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return false;
      }

      const canOpen = await Linking.canOpenURL(this.INSTAGRAM_APP_URL);
      return canOpen;
    } catch (error) {
      logger.error('Error checking if Instagram is installed:', error);
      return false;
    }
  }

  /**
   * Request camera roll permissions
   * @returns Promise<boolean> - True if permission granted
   */
  private async requestCameraRollPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Error requesting camera roll permission:', error);
      return false;
    }
  }

  /**
   * Save image to camera roll
   * @param imageUri - URI of the image to save
   * @returns Promise<string> - Asset ID of saved image
   */
  private async saveImageToCameraRoll(imageUri: string): Promise<string> {
    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      logger.info('Image saved to camera roll:', asset.id);
      return asset.id;
    } catch (error) {
      logger.error('Error saving image to camera roll:', error);
      throw new Error('Failed to save image to camera roll');
    }
  }

  /**
   * Prepare share data for Instagram Stories
   * @param imageUri - URI of the image to share
   * @param gym - Gym data
   * @param session - Session data
   * @returns InstagramShareData - Formatted data for Instagram
   */
  prepareShareData(imageUri: string, gym: OpenMat, session: OpenMatSession): InstagramShareData {
    return {
      imageUri,
      gym,
      session
    };
  }

  /**
   * Share to Instagram Stories using modern iOS approach
   * @param imageUri - URI of the image to share
   * @param gym - Gym data
   * @param session - Session data
   * @returns Promise<boolean> - True if sharing was successful
   */
  async shareToInstagramStories(
    imageUri: string, 
    gym: OpenMat, 
    session: OpenMatSession
  ): Promise<boolean> {
    try {
      // Check if Instagram is installed
      const isInstalled = await this.isInstagramInstalled();
      if (!isInstalled) {
        logger.warn('Instagram is not installed on this device');
        Alert.alert(
          'Instagram Not Installed',
          'Please install Instagram to share to Stories',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Install Instagram', onPress: () => this.promptInstallInstagram() }
          ]
        );
        return false;
      }

      // Request camera roll permission
      const hasPermission = await this.requestCameraRollPermission();
      if (!hasPermission) {
        logger.warn('Camera roll permission denied');
        Alert.alert(
          'Permission Required',
          'Camera roll access is needed to share to Instagram Stories',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Save image to camera roll first (required for modern Instagram)
      await this.saveImageToCameraRoll(imageUri);

      // Open Instagram Stories camera
      const opened = await Linking.openURL(this.INSTAGRAM_STORIES_URL);
      
      if (opened) {
        logger.info('Successfully opened Instagram Stories for sharing');
        Alert.alert(
          'Instagram Stories Opened!',
          'Your image has been saved to camera roll. Select it from your camera roll to add to your story!',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        logger.error('Failed to open Instagram Stories');
        return false;
      }

    } catch (error) {
      logger.error('Error sharing to Instagram Stories:', error);
      Alert.alert(
        'Sharing Error',
        'Failed to share to Instagram Stories. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Create share message for Instagram Stories
   * @param gym - Gym data
   * @param session - Session data
   * @returns string - Formatted message
   */
  private createShareMessage(gym: OpenMat, session: OpenMatSession): string {
    const sessionType = session.type === 'gi' ? 'Gi' : 
                       session.type === 'nogi' ? 'No-Gi' : 
                       session.type === 'both' ? 'Gi & No-Gi' : 
                       session.type === 'mma' ? 'MMA' : session.type;

    const time = session.time || 'TBD';
    const day = session.day || 'TBD';

    return `🥋 Open Mat at ${gym.name}\n\n${sessionType} • ${day} at ${time}\n\n📍 ${gym.address}\n\nFind more sessions with JiuJitsu Finder!`;
  }

  /**
   * Get Instagram app store URL for prompting user to install
   * @returns string - App store URL
   */
  getInstagramAppStoreUrl(): string {
    if (Platform.OS === 'ios') {
      return 'https://apps.apple.com/app/instagram/id389801252';
    } else if (Platform.OS === 'android') {
      return 'https://play.google.com/store/apps/details?id=com.instagram.android';
    }
    return '';
  }

  /**
   * Prompt user to install Instagram
   * @returns Promise<boolean> - True if user was prompted
   */
  async promptInstallInstagram(): Promise<boolean> {
    try {
      const appStoreUrl = this.getInstagramAppStoreUrl();
      if (appStoreUrl) {
        await Linking.openURL(appStoreUrl);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error prompting Instagram installation:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const instagramShareService = new InstagramShareService();

// Export the main function and service instance
export const shareToInstagramStories = instagramShareService.shareToInstagramStories.bind(instagramShareService);
export const isInstagramInstalled = instagramShareService.isInstagramInstalled.bind(instagramShareService);
export default instagramShareService; 