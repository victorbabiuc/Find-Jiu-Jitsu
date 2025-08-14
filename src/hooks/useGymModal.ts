import { useState, useCallback, useRef } from 'react';
import { OpenMat, OpenMatSession } from '../types';
import { haptics, logger } from '../utils';

interface UseGymModalProps {
  onModalOpen?: (gym: OpenMat) => void;
  onModalClose?: () => void;
}

export const useGymModal = ({ onModalOpen, onModalClose }: UseGymModalProps = {}) => {
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Share card state for visual sharing
  const [shareCardGym, setShareCardGym] = useState<OpenMat | null>(null);
  const [shareCardSession, setShareCardSession] = useState<OpenMatSession | null>(null);
  const shareCardRef = useRef<any>(null);

  // Show gym details modal
  const showGymDetails = useCallback(
    (gym: OpenMat) => {
      logger.searchInput('showGymDetails called for gym:', { gymName: gym.name });
      setSelectedGym(gym);
      setModalVisible(true);

      // Notify parent if callback provided
      if (onModalOpen) {
        onModalOpen(gym);
      }
    },
    [onModalOpen]
  );

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedGym(null);

    // Notify parent if callback provided
    if (onModalClose) {
      onModalClose();
    }
  }, [onModalClose]);

  // Open modal with loading state
  const openModalWithLoading = useCallback(
    async (gym: OpenMat) => {
      setIsModalLoading(true);

      try {
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 100));

        showGymDetails(gym);
      } catch (error) {
        logger.error('Error opening modal:', error);
      } finally {
        setIsModalLoading(false);
      }
    },
    [showGymDetails]
  );

  // Set share card data for visual sharing
  const setShareCardData = useCallback((gym: OpenMat, session?: OpenMatSession) => {
    const firstSession =
      session || (gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null);

    if (!firstSession) {
      logger.warn('No session available for share card');
      return;
    }

    logger.share('Setting ShareCard data:', { gym: gym.name, session: firstSession });
    setShareCardGym(gym);
    setShareCardSession(firstSession);
  }, []);

  // Clear share card data
  const clearShareCardData = useCallback(() => {
    setShareCardGym(null);
    setShareCardSession(null);
  }, []);

  // Check if modal is open
  const isModalOpen = useCallback(() => {
    return modalVisible && selectedGym !== null;
  }, [modalVisible, selectedGym]);

  // Get modal state summary
  const getModalState = useCallback(
    () => ({
      isOpen: modalVisible,
      hasSelectedGym: selectedGym !== null,
      selectedGymName: selectedGym?.name || null,
      isLoading: isModalLoading,
    }),
    [modalVisible, selectedGym, isModalLoading]
  );

  return {
    // State
    modalVisible,
    selectedGym,
    isModalLoading,
    shareCardGym,
    shareCardSession,
    shareCardRef,

    // Actions
    showGymDetails,
    handleCloseModal,
    openModalWithLoading,
    setShareCardData,
    clearShareCardData,
    isModalOpen,
    getModalState,
  };
};
