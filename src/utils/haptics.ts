import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility service
 * Provides different types of haptic feedback for various user interactions
 */

export const haptics = {
  /**
   * Light impact feedback - for subtle interactions
   * Use for: button taps, toggles, minor selections
   */
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Medium impact feedback - for standard interactions
   * Use for: primary button presses, confirmations
   */
  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Heavy impact feedback - for important interactions
   * Use for: destructive actions, major confirmations
   */
  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Success feedback - for successful actions
   * Use for: successful copies, saves, confirmations
   */
  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Warning feedback - for warnings or errors
   * Use for: errors, warnings, failed actions
   */
  warning: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Error feedback - for errors
   * Use for: critical errors, failed operations
   */
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },

  /**
   * Selection feedback - for selection changes
   * Use for: filter changes, tab switches, picker selections
   */
  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      // Silently fail if haptics not supported
    }
  },
};

export default haptics; 