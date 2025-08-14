import { useState, useCallback } from 'react';
import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { OpenMat, OpenMatSession } from '../types';
import { openWebsite, openDirections, handleCopyGym, haptics, logger } from '../utils';
import { captureCardAsImage } from '../utils/screenshot';

interface UseGymActionsProps {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  shareCardRef?: React.RefObject<any>;
}

export const useGymActions = ({ favorites, toggleFavorite, shareCardRef }: UseGymActionsProps) => {
  const [copyingGymId, setCopyingGymId] = useState<string | null>(null);
  const [copiedGymId, setCopiedGymId] = useState<string | null>(null);
  const [sharingGymId, setSharingGymId] = useState<string | null>(null);

  // Open gym website with haptic feedback
  const handleOpenWebsite = useCallback((url: string) => {
    if (!url || url.trim() === '') {
      haptics.warning();
      Alert.alert('No Website', 'This gym does not have a website available.');
      return;
    }

    haptics.light();
    openWebsite(url);
  }, []);

  // Open directions with haptic feedback
  const handleOpenDirections = useCallback((address: string) => {
    if (!address || address === 'Tampa, FL' || address === 'Austin, TX') {
      haptics.warning();
      Alert.alert('No Address', 'This gym does not have a specific address available.');
      return;
    }

    haptics.light();
    openDirections(address);
  }, []);

  // Copy gym details with state management
  const handleCopyGymWithState = useCallback(
    async (gym: OpenMat) => {
      if (copyingGymId === gym.id) return; // Prevent multiple clicks

      haptics.light();
      setCopyingGymId(gym.id);

      try {
        await handleCopyGym(gym);
        setCopiedGymId(gym.id);
        haptics.success();

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedGymId(null);
        }, 2000);
      } catch (error) {
        logger.error('Error copying gym details:', error);
        haptics.error();
        Alert.alert('Copy Failed', 'Failed to copy gym details. Please try again.');
      } finally {
        setCopyingGymId(null);
      }
    },
    [copyingGymId]
  );

  // Share gym with visual card
  const handleShareGym = useCallback(
    async (gym: OpenMat, session?: OpenMatSession) => {
      if (sharingGymId === gym.id) return; // Prevent multiple clicks

      haptics.light();
      setSharingGymId(gym.id);

      try {
        const firstSession =
          session || (gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null);

        if (!firstSession) {
          haptics.warning();
          Alert.alert('No Sessions', 'No sessions available to share.');
          return;
        }

        logger.share('Setting ShareCard data:', { gym: gym.name, session: firstSession });

        // If we have a shareCardRef, use visual card sharing
        if (shareCardRef) {
          // Wait for ShareCard to render before capturing and sharing
          setTimeout(async () => {
            try {
              logger.capture('Capturing and sharing image...');

              // Capture the ShareCard as an image
              const imageUri = await captureCardAsImage(shareCardRef);

              // Share using native iOS share sheet
              await Share.share({
                url: imageUri,
                message: `Check out this open mat session at ${gym.name}! 🥋\n\n${firstSession.day} at ${firstSession.time}\n\nFind more sessions with JiuJitsu Finder!`,
              });

              haptics.success();
            } catch (error) {
              logger.error('Error capturing and sharing:', error);
              haptics.error();
              Alert.alert(
                '❌ Sharing Error',
                'Failed to capture and share the image. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setSharingGymId(null);
            }
          }, 200);
        } else {
          // Fallback to text-only sharing
          const shareMessage = `Check out this open mat session at ${gym.name}! 🥋\n\n${firstSession.day} at ${firstSession.time}\n\nFind more sessions with JiuJitsu Finder!`;

          await Share.share({
            message: shareMessage,
          });

          haptics.success();
          setSharingGymId(null);
        }
      } catch (error) {
        haptics.error();
        Alert.alert('❌ Sharing Error', 'Failed to prepare sharing. Please try again.', [
          { text: 'OK' },
        ]);
        setSharingGymId(null);
      }
    },
    [sharingGymId, shareCardRef]
  );

  // Toggle favorite with haptic feedback
  const handleToggleFavorite = useCallback(
    (gym: OpenMat) => {
      haptics.light();
      toggleFavorite(gym.id);

      // Additional haptic feedback based on action
      if (favorites.has(gym.id)) {
        haptics.success(); // Success haptic for favoriting
      } else {
        haptics.light(); // Light haptic for unfavoriting
      }
    },
    [favorites, toggleFavorite]
  );

  return {
    // State
    copyingGymId,
    copiedGymId,
    sharingGymId,

    // Actions
    handleOpenWebsite,
    handleOpenDirections,
    handleCopyGymWithState,
    handleShareGym,
    handleToggleFavorite,
  };
};
