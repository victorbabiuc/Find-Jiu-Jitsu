import { Linking, Platform } from 'react-native';
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
 */
class InstagramShareService {
  private readonly INSTAGRAM_STORIES_URL = 'instagram-stories://share';
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
      session,
    };
  }

  /**
   * Share to Instagram Stories
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
        return false;
      }

      // Prepare the share data
      const shareData = this.prepareShareData(imageUri, gym, session);

      // Create Instagram Stories URL with parameters
      const instagramUrl = this.buildInstagramStoriesUrl(shareData);

      // Open Instagram Stories
      const opened = await Linking.openURL(instagramUrl);

      if (opened) {
        logger.info('Successfully opened Instagram Stories for sharing');
        return true;
      } else {
        logger.error('Failed to open Instagram Stories');
        return false;
      }
    } catch (error) {
      logger.error('Error sharing to Instagram Stories:', error);
      return false;
    }
  }

  /**
   * Build Instagram Stories URL with parameters
   * @param shareData - Prepared share data
   * @returns string - Instagram Stories URL
   */
  private buildInstagramStoriesUrl(shareData: InstagramShareData): string {
    const { imageUri, gym, session } = shareData;

    // Create the message text
    const message = this.createShareMessage(gym, session);

    // Build URL parameters
    const params = new URLSearchParams();

    // Add the image URI
    params.append('source_image', imageUri);

    // Add the message text
    params.append('interactive_asset_uri', message);

    // Add background color (optional)
    params.append('background_color', '#000000');

    return `${this.INSTAGRAM_STORIES_URL}?${params.toString()}`;
  }

  /**
   * Create share message for Instagram Stories
   * @param gym - Gym data
   * @param session - Session data
   * @returns string - Formatted message
   */
  private createShareMessage(gym: OpenMat, session: OpenMatSession): string {
    const sessionType =
      session.type === 'gi'
        ? 'Gi'
        : session.type === 'nogi'
          ? 'No-Gi'
          : session.type === 'both'
            ? 'Gi & No-Gi'
            : session.type === 'mma'
              ? 'MMA'
              : session.type;

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
export const shareToInstagramStories =
  instagramShareService.shareToInstagramStories.bind(instagramShareService);
export const isInstagramInstalled =
  instagramShareService.isInstagramInstalled.bind(instagramShareService);
export default instagramShareService;
